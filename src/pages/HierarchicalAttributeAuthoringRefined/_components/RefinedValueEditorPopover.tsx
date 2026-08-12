import { useMemo, useState } from 'react';
import type { RefObject } from 'react';
import CheckIcon from '@mattermost/compass-icons/components/check';
import CloseIcon from '@mattermost/compass-icons/components/close';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import ChevronLeftIcon from '@mattermost/compass-icons/components/chevron-left';
import SitemapIcon from '@mattermost/compass-icons/components/sitemap';
import SourceBranchIcon from '@mattermost/compass-icons/components/source-branch';
import ArrowUpIcon from '@mattermost/compass-icons/components/arrow-up';
import CancelIcon from '@mattermost/compass-icons/components/cancel';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import PaletteOutlineIcon from '@mattermost/compass-icons/components/palette-outline';
import Icon from '@/components/ui/Icon/Icon';
import TextInput from '@/components/ui/TextInput/TextInput';
import Button from '@/components/ui/Button/Button';
import Select from '@/components/ui/Select/Select';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import FixedPopoverMenu from '@/components/ui/FixedPopoverMenu/FixedPopoverMenu';
import { OPTION_SWATCHES } from '@/pages/AttributeHubSimplified/_components/simplifiedModel';
// Reuse the DECIDED base popover styling verbatim (label field, nav-row, panes,
// swatches, actions) so this reads as the same product control.
import ve from '@/pages/AttributeHubSimplified/_components/ValueEditorPopover.module.scss';
// Reuse the diagram-hub's creatable combobox VERBATIM (read-only import) so the
// two surfaces' add/create-edge UX is byte-for-byte identical. The only new
// behaviour is the opt-in `overlay` prop (default OFF → diagram-hub unchanged).
import CreatableEdgeCombobox from '@/pages/HierarchicalAttributeDiagramHub/_components/CreatableEdgeCombobox';
import {
  anchorParentIdOf,
  ancestorsOf,
  childrenOf,
  descendantsOf,
  parentsOf,
  type GraphOption,
} from '@/pages/HierarchicalAttributeAuthoringV2/graphAuthoringModel';
import styles from './RefinedValueEditorPopover.module.scss';

type Pane = 'main' | 'parents' | 'children';

/** Fallback seed for the native custom-color input before one is chosen. */
const DEFAULT_CUSTOM_HEX = '#4a9eff';

export interface RefinedValueEditorPopoverProps {
  option: GraphOption;
  allOptions: GraphOption[];
  /** Cross-references (a 2nd+ parent) are opt-in; gates "add another parent". */
  allowCrossReferences: boolean;
  readOnly?: boolean;
  initialPane?: Pane;
  /** Pre-seeded cycle-rejection message (deep-linked demo state). */
  seededRejection?: string | null;
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  onRelabel: (label: string) => void;
  /** Returns a rejection message (cycle/limit) or null on success. */
  onAddParent: (parentId: string) => string | null;
  onRemoveParent: (parentId: string) => void;
  onMakePrimary: (parentId: string) => void;
  /**
   * Re-parent (move) the option: replace its primary parent with `targetId`,
   * keeping any additional parents. `null` = move to the top level. Returns a
   * rejection message or null. The keyboard-operable equivalent of drag.
   */
  onReparent: (targetId: string | null) => string | null;
  /** Link an existing eligible value as a child. Returns a rejection or null. */
  onAddChild: (childId: string) => string | null;
  /** Detach a child edge. */
  onRemoveChild: (childId: string) => void;
  /** Create a brand-new value and link it to this option in one step. */
  onCreateLinked: (label: string, as: 'parent' | 'child') => void;
  /** Set (or clear) this option's display color — repaints the tree live. */
  onSetColor: (color: string | null) => void;
  onDeactivate: () => void;
  onRemove: () => void;
}

/**
 * Refined option editor — re-aligned to the diagram-hub `NodePopover` pane
 * pattern. The main pane carries rename · color swatches (+ custom color) ·
 * a Parents nav-row · a Children nav-row · deactivate · delete. Each of the two
 * sub-panes now uses the SAME creatable combobox the diagram-hub uses
 * ("Add or create a parent/child…"): type to filter eligible existing values,
 * or create-and-link a brand-new one from the same input. Current edges render
 * as removable rows above it.
 *
 * ONE intended divergence from the diagram-hub popover: because the refined
 * TREE nests a node under its primary/anchor parent, the Parents sub-pane keeps
 * a per-parent "Make primary" action plus the keyboard-operable "Move under…"
 * reparent (the accessible equivalent of grip-drag). The diagram has no anchor
 * concept, so `NodePopover` lacks both.
 *
 * Both directions stay cycle-safe and fail-closed: parent candidates exclude
 * self + descendants; child candidates exclude self + ancestors; and cross-
 * references (a 2nd+ parent, in either direction) stay gated behind the toolbar
 * toggle. Every existing-value link is re-checked at commit by the host.
 */
export default function RefinedValueEditorPopover({
  option,
  allOptions,
  allowCrossReferences,
  readOnly = false,
  initialPane = 'main',
  seededRejection = null,
  anchorRef,
  onClose,
  onRelabel,
  onAddParent,
  onRemoveParent,
  onMakePrimary,
  onReparent,
  onAddChild,
  onRemoveChild,
  onCreateLinked,
  onSetColor,
  onDeactivate,
  onRemove,
}: RefinedValueEditorPopoverProps) {
  const [pane, setPane] = useState<Pane>(initialPane);
  const [movePick, setMovePick] = useState('');
  const [rejection, setRejection] = useState<string | null>(seededRejection);

  const anchorId = anchorParentIdOf(option);
  const parents = parentsOf(allOptions, option.id);
  const children = childrenOf(allOptions, option.id);

  const presetTokens = OPTION_SWATCHES.map((s) => s.token);
  const customActive =
    option.color != null && !presetTokens.includes(option.color);
  const customValue =
    customActive && option.color?.startsWith('#')
      ? option.color
      : DEFAULT_CUSTOM_HEX;

  // Parent candidates EXCLUDE self + descendants (a parent can't be its own
  // descendant → cycle) and anything already a parent.
  const parentCandidates = useMemo(() => {
    const blocked = descendantsOf(allOptions, option.id);
    return allOptions.filter(
      (o) =>
        o.id !== option.id &&
        !blocked.has(o.id) &&
        !option.parentIds.includes(o.id),
    );
  }, [allOptions, option.id, option.parentIds]);

  // Child candidates EXCLUDE self + ancestors (a child can't be its own ancestor
  // → cycle) and anything already a child. When cross-references are OFF, only
  // ROOTS may become children — linking a value that already has a parent would
  // mint a 2nd parent (a cross-reference), which the toolbar gates.
  const childCandidates = useMemo(() => {
    const blocked = ancestorsOf(allOptions, option.id);
    const childIds = new Set(children.map((c) => c.id));
    return allOptions.filter(
      (o) =>
        o.id !== option.id &&
        !blocked.has(o.id) &&
        !childIds.has(o.id) &&
        (allowCrossReferences || o.parentIds.length === 0),
    );
  }, [allOptions, option.id, children, allowCrossReferences]);

  // Move-under candidates EXCLUDE self + descendants (cycle-safe) and the
  // current primary parent (moving there is a no-op).
  const moveCandidates = useMemo(() => {
    const blocked = descendantsOf(allOptions, option.id);
    return allOptions.filter(
      (o) => o.id !== option.id && !blocked.has(o.id) && o.id !== anchorId,
    );
  }, [allOptions, option.id, anchorId]);

  // A 2nd+ parent is a cross-reference; hide the parent combobox until the
  // toolbar toggle opts in (a top-level option can always add its FIRST parent).
  const parentsLocked = option.parentIds.length >= 1 && !allowCrossReferences;

  const commitMove = (targetId: string | null) => {
    const err = onReparent(targetId);
    if (err) {
      setRejection(err);
      return;
    }
    setRejection(null);
    setMovePick('');
    onClose();
  };

  return (
    <FixedPopoverMenu
      open
      onClose={onClose}
      anchorRef={anchorRef}
      minWidthFloor={320}
    >
      <div className={styles['popover']}>
        <div className={styles['popover__viewport']}>
          <Scrollbars>
            <div className={styles['popover__body']}>
              {pane === 'main' && (
                <>
                  <div className={ve['ve__label-field']}>
                    <TextInput
                      size="Medium"
                      value={option.label}
                      readOnly={readOnly}
                      aria-label="Option label"
                      onChange={(e) => onRelabel(e.target.value)}
                    />
                  </div>

                  <button
                    type="button"
                    className={ve['ve__nav-row']}
                    onClick={() => setPane('parents')}
                  >
                    <Icon size="20" glyph={<SitemapIcon />} />
                    <span className={ve['ve__nav-label']}>Parents</span>
                    <span className={ve['ve__nav-value']}>
                      {parents.length === 0
                        ? 'Top level'
                        : `${parents.length} ${
                            parents.length === 1 ? 'parent' : 'parents'
                          }`}
                    </span>
                    <Icon size="16" glyph={<ChevronRightIcon />} />
                  </button>

                  <button
                    type="button"
                    className={ve['ve__nav-row']}
                    onClick={() => setPane('children')}
                  >
                    <Icon size="20" glyph={<SourceBranchIcon />} />
                    <span className={ve['ve__nav-label']}>Children</span>
                    <span className={ve['ve__nav-value']}>
                      {children.length === 0
                        ? 'None'
                        : `${children.length} ${
                            children.length === 1 ? 'child' : 'children'
                          }`}
                    </span>
                    <Icon size="16" glyph={<ChevronRightIcon />} />
                  </button>

                  <div className={ve['ve__section']}>
                    <div className={ve['ve__section-head']}>
                      <span className={ve['ve__section-title']}>Colors</span>
                    </div>
                    <div className={ve['ve__swatches']}>
                      {OPTION_SWATCHES.map((swatch) => {
                        const active = option.color === swatch.token;
                        return (
                          <button
                            key={swatch.id}
                            type="button"
                            className={[
                              ve['ve__swatch'],
                              active ? ve['ve__swatch--active'] : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            style={{ backgroundColor: swatch.token }}
                            aria-label={swatch.label}
                            aria-pressed={active}
                            disabled={readOnly}
                            onClick={() => onSetColor(swatch.token)}
                          >
                            {active && <Icon size="16" glyph={<CheckIcon />} />}
                          </button>
                        );
                      })}

                      {/* Custom color — native picker, no new dependency. */}
                      <label
                        className={[
                          styles['gve__custom'],
                          customActive ? styles['gve__custom--active'] : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        style={
                          customActive
                            ? { backgroundColor: customValue }
                            : undefined
                        }
                        aria-label="Custom color"
                        title="Pick a custom color"
                      >
                        {customActive ? (
                          <Icon size="16" glyph={<CheckIcon />} />
                        ) : (
                          <Icon size="16" glyph={<PaletteOutlineIcon />} />
                        )}
                        <input
                          type="color"
                          className={styles['gve__custom-input']}
                          value={customValue}
                          disabled={readOnly}
                          aria-label="Choose a custom color"
                          onChange={(e) => onSetColor(e.target.value)}
                        />
                      </label>
                    </div>
                  </div>

                  <div className={ve['ve__divider']} />

                  <button
                    type="button"
                    className={[
                      ve['ve__action'],
                      ve['ve__action--danger'],
                    ].join(' ')}
                    disabled={readOnly}
                    onClick={onDeactivate}
                  >
                    <Icon size="20" glyph={<CancelIcon />} />
                    {option.disabled
                      ? 'Reactivate option'
                      : 'Deactivate option'}
                  </button>
                  <button
                    type="button"
                    className={[
                      ve['ve__action'],
                      ve['ve__action--danger'],
                    ].join(' ')}
                    disabled={readOnly}
                    onClick={onRemove}
                  >
                    <Icon size="20" glyph={<TrashCanOutlineIcon />} />
                    Remove option
                  </button>
                </>
              )}

              {pane === 'parents' && (
                <div className={ve['ve__pane']}>
                  <button
                    type="button"
                    className={ve['ve__back']}
                    onClick={() => setPane('main')}
                  >
                    <Icon size="16" glyph={<ChevronLeftIcon />} />
                    Parents
                  </button>

                  {/* Tree-specific: keyboard-operable reparent (grip-drag equivalent). */}
                  {!readOnly && (
                    <div className={styles['gve__move']}>
                      <span className={styles['gve__move-title']}>
                        Move under…
                      </span>
                      <div className={styles['gve__move-row']}>
                        <Select
                          size="Small"
                          value={movePick}
                          aria-label="Move under a different parent"
                          disabled={moveCandidates.length === 0}
                          onChange={(e) => setMovePick(e.target.value)}
                        >
                          <option value="">
                            {moveCandidates.length === 0
                              ? 'No eligible parent'
                              : 'Choose a new parent…'}
                          </option>
                          {moveCandidates.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </Select>
                        <Button
                          emphasis="Secondary"
                          size="Small"
                          disabled={!movePick}
                          onClick={() => commitMove(movePick)}
                        >
                          Move here
                        </Button>
                      </div>
                      <button
                        type="button"
                        className={styles['gve__move-top']}
                        disabled={anchorId == null}
                        onClick={() => commitMove(null)}
                      >
                        <Icon size="16" glyph={<ArrowUpIcon />} />
                        Move to the top level
                      </button>
                    </div>
                  )}

                  <div className={ve['ve__divider']} />

                  <div className={ve['ve__trans-list']}>
                    {parents.length === 0 && (
                      <p className={ve['ve__trans-empty']}>
                        Top-level option — no parents. Add one below to nest it.
                      </p>
                    )}
                    {parents.map((parent) => {
                      const isAnchor = parent.id === anchorId;
                      return (
                        <div key={parent.id} className={ve['ve__trans-row']}>
                          <span className={ve['ve__trans-value']}>
                            {parent.label}
                          </span>
                          {isAnchor ? (
                            <span className={styles['gve__primary-tag']}>
                              Primary
                            </span>
                          ) : (
                            !readOnly && (
                              <button
                                type="button"
                                className={styles['gve__make-primary']}
                                onClick={() => onMakePrimary(parent.id)}
                              >
                                Make primary
                              </button>
                            )
                          )}
                          {!readOnly && (
                            <button
                              type="button"
                              className={ve['ve__trans-remove']}
                              aria-label={`Remove ${parent.label} as a parent of ${option.label}`}
                              onClick={() => onRemoveParent(parent.id)}
                            >
                              <Icon size="12" glyph={<CloseIcon />} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {rejection && (
                    <div className={styles['gve__reject']} role="alert">
                      <Icon size="16" glyph={<AlertOutlineIcon />} />
                      <span>{rejection}</span>
                    </div>
                  )}

                  {!readOnly && !parentsLocked && (
                    <CreatableEdgeCombobox
                      overlay
                      placeholder="Add or create a parent…"
                      ariaLabel={`Add or create a parent of ${option.label}`}
                      candidates={parentCandidates}
                      onPickExisting={(id) => {
                        const err = onAddParent(id);
                        if (!err) setRejection(null);
                        return err;
                      }}
                      onCreate={(label) => {
                        onCreateLinked(label, 'parent');
                        setRejection(null);
                      }}
                    />
                  )}
                  <p className={styles['gve__picker-note']}>
                    {parentsLocked
                      ? 'This option already has a parent. Turn on “Allow cross-references” in the options toolbar to let it sit under more than one.'
                      : 'Options below this one aren’t listed — a parent can’t be one of its own descendants. Every link is re-checked before it commits.'}
                  </p>
                </div>
              )}

              {pane === 'children' && (
                <div className={ve['ve__pane']}>
                  <button
                    type="button"
                    className={ve['ve__back']}
                    onClick={() => setPane('main')}
                  >
                    <Icon size="16" glyph={<ChevronLeftIcon />} />
                    Children
                  </button>

                  <div className={ve['ve__trans-list']}>
                    {children.length === 0 && (
                      <p className={ve['ve__trans-empty']}>
                        No nested options under this one. Add one below.
                      </p>
                    )}
                    {children.map((child) => (
                      <div key={child.id} className={ve['ve__trans-row']}>
                        <span className={ve['ve__trans-value']}>
                          {child.label}
                        </span>
                        {!readOnly && (
                          <button
                            type="button"
                            className={ve['ve__trans-remove']}
                            aria-label={`Detach ${child.label} from under ${option.label}`}
                            onClick={() => onRemoveChild(child.id)}
                          >
                            <Icon size="12" glyph={<CloseIcon />} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {!readOnly && (
                    <CreatableEdgeCombobox
                      overlay
                      placeholder="Add or create a child…"
                      ariaLabel={`Add or create a child of ${option.label}`}
                      candidates={childCandidates}
                      onPickExisting={(id) => onAddChild(id)}
                      onCreate={(label) => onCreateLinked(label, 'child')}
                    />
                  )}
                  <p className={styles['gve__picker-note']}>
                    {allowCrossReferences
                      ? 'Options above this one aren’t listed — a child can’t be one of its own ancestors. Every link is re-checked before it commits.'
                      : 'Only top-level options can be nested here. Turn on “Allow cross-references” to nest an option that already has a parent.'}
                  </p>
                </div>
              )}
            </div>
          </Scrollbars>
        </div>
      </div>
    </FixedPopoverMenu>
  );
}
