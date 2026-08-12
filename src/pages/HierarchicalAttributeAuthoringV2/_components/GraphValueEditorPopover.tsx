import { useMemo, useState } from 'react';
import type { RefObject } from 'react';
import CheckIcon from '@mattermost/compass-icons/components/check';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import CloseIcon from '@mattermost/compass-icons/components/close';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import ChevronLeftIcon from '@mattermost/compass-icons/components/chevron-left';
import SitemapIcon from '@mattermost/compass-icons/components/sitemap';
import StarOutlineIcon from '@mattermost/compass-icons/components/star-outline';
import ArrowForwardIosIcon from '@mattermost/compass-icons/components/arrow-forward-ios';
import CancelIcon from '@mattermost/compass-icons/components/cancel';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import Icon from '@/components/ui/Icon/Icon';
import TextInput from '@/components/ui/TextInput/TextInput';
import Button from '@/components/ui/Button/Button';
import Select from '@/components/ui/Select/Select';
import FixedPopoverMenu from '@/components/ui/FixedPopoverMenu/FixedPopoverMenu';
import {
  OPTION_SWATCHES,
  optionMeta,
  setOptionMeta,
  type OptionMeta,
} from '@/pages/AttributeHubSimplified/_components/simplifiedModel';
// Reuse the DECIDED base popover styling verbatim (label field, nav-row, panes,
// swatches, actions) so this reads as the same product control.
import ve from '@/pages/AttributeHubSimplified/_components/ValueEditorPopover.module.scss';
import {
  anchorParentIdOf,
  childrenOf,
  descendantsOf,
  labelOf,
  parentsOf,
  type GraphOption,
} from '../graphAuthoringModel';
import styles from './GraphValueEditorPopover.module.scss';

export interface GraphValueEditorPopoverProps {
  option: GraphOption;
  allOptions: GraphOption[];
  /** Cross-references (a 2nd+ parent) are opt-in; gates "add another parent". */
  allowCrossReferences: boolean;
  /** Non-null when the popover was opened from a reference stub. */
  stubParentId: string | null;
  readOnly?: boolean;
  initialPane?: 'main' | 'parents';
  /** Pre-seeded cycle-rejection message (deep-linked demo state). */
  seededRejection?: string | null;
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  onRelabel: (label: string) => void;
  /** Returns a rejection message (cycle/limit) or null on success. */
  onAddParent: (parentId: string) => string | null;
  onRemoveParent: (parentId: string) => void;
  onMakePrimary: (parentId: string) => void;
  onJumpToAnchor: () => void;
  /** Jump to any option's editable row (used by the read-only Children list). */
  onJumpTo?: (id: string) => void;
  onDeactivate: () => void;
  onRemove: () => void;
}

/**
 * Rich option editor for the RD-C authoring surface — the base chip-click
 * popover FORKED to add a "Parents" sub-pane (mirrors the base Rank pane's
 * chevron-nav-row → back-button pattern). Multi-parent authoring lives here;
 * the tree stays a read-only projection.
 */
export default function GraphValueEditorPopover({
  option,
  allOptions,
  allowCrossReferences,
  stubParentId,
  readOnly = false,
  initialPane = 'main',
  seededRejection = null,
  anchorRef,
  onClose,
  onRelabel,
  onAddParent,
  onRemoveParent,
  onMakePrimary,
  onJumpToAnchor,
  onJumpTo,
  onDeactivate,
  onRemove,
}: GraphValueEditorPopoverProps) {
  const [meta, setMeta] = useState<OptionMeta>(() => optionMeta(option.id));
  const [pane, setPane] = useState<'main' | 'parents'>(initialPane);
  const [pick, setPick] = useState('');
  const [rejection, setRejection] = useState<string | null>(seededRejection);

  const commitMeta = (next: OptionMeta) => {
    const merged = { ...meta, ...next };
    setMeta(merged);
    setOptionMeta(option.id, merged);
  };

  const anchorId = anchorParentIdOf(option);
  const parents = parentsOf(allOptions, option.id);
  // Shared upgrade (02b P-D): the node's outgoing edges, read-only, in EVERY
  // approach. It is the constant across the bake-off, not an arm.
  const children = childrenOf(allOptions, option.id);

  // Add-parent candidates EXCLUDE self + descendants (cycles unselectable) and
  // any option that is already a parent.
  const candidates = useMemo(() => {
    const blocked = descendantsOf(allOptions, option.id);
    return allOptions.filter(
      (o) =>
        o.id !== option.id &&
        !blocked.has(o.id) &&
        !option.parentIds.includes(o.id),
    );
  }, [allOptions, option.id, option.parentIds]);

  // Adding a parent to an option that already has one creates a CROSS-REFERENCE
  // (2nd+ parent). That is the opt-in complexity — gate it behind the toggle.
  // Adding the first parent to a root is plain nesting and always allowed.
  const crossRefBlocked = option.parentIds.length >= 1 && !allowCrossReferences;

  const commitAddParent = () => {
    if (!pick) return;
    // Fail-closed: re-check for a cycle at commit even though the picker
    // already excludes descendants (800-207 Tenet 5).
    const err = onAddParent(pick);
    if (err) {
      setRejection(err);
      return;
    }
    setRejection(null);
    setPick('');
  };

  return (
    <FixedPopoverMenu open onClose={onClose} anchorRef={anchorRef} minWidthFloor={320}>
      <div className={ve['ve']}>
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

            {stubParentId != null && (
              <div className={styles['gve__primary-note']}>
                <Icon size="16" glyph={<SitemapIcon />} />
                <span className={styles['gve__primary-text']}>
                  This is a reference. Its editable location is under{' '}
                  <span className={styles['gve__primary-name']}>
                    {anchorId ? labelOf(allOptions, anchorId) : 'the top level'}
                  </span>
                  .
                </span>
              </div>
            )}

            <button
              type="button"
              className={ve['ve__nav-row']}
              onClick={() => setPane('parents')}
            >
              <Icon size="20" glyph={<SitemapIcon />} />
              <span className={ve['ve__nav-label']}>Parents</span>
              <span className={ve['ve__nav-value']}>
                {option.parentIds.length === 0
                  ? 'Top level'
                  : `${option.parentIds.length} ${
                      option.parentIds.length === 1 ? 'parent' : 'parents'
                    }`}
              </span>
              <Icon size="16" glyph={<ChevronRightIcon />} />
            </button>

            {stubParentId != null && (
              <>
                <button
                  type="button"
                  className={ve['ve__nav-row']}
                  onClick={onJumpToAnchor}
                >
                  <Icon size="20" glyph={<ArrowForwardIosIcon />} />
                  <span className={ve['ve__nav-label']}>
                    Go to the editable location
                  </span>
                </button>
                <button
                  type="button"
                  className={ve['ve__nav-row']}
                  disabled={readOnly}
                  onClick={() => {
                    onMakePrimary(stubParentId);
                    onClose();
                  }}
                >
                  <Icon size="20" glyph={<StarOutlineIcon />} />
                  <span className={ve['ve__nav-label']}>
                    Make this the primary location
                  </span>
                </button>
              </>
            )}

            <div className={ve['ve__section']}>
              <div className={ve['ve__section-head']}>
                <span className={ve['ve__section-title']}>Colors</span>
              </div>
              <div className={ve['ve__swatches']}>
                {OPTION_SWATCHES.map((swatch) => {
                  const active = meta.color === swatch.token;
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
                      onClick={() => commitMeta({ color: swatch.token })}
                    >
                      {active && <Icon size="16" glyph={<CheckIcon />} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={ve['ve__divider']} />

            <button
              type="button"
              className={[ve['ve__action'], ve['ve__action--danger']].join(' ')}
              disabled={readOnly}
              onClick={onDeactivate}
            >
              <Icon size="20" glyph={<CancelIcon />} />
              {option.disabled ? 'Reactivate option' : 'Deactivate option'}
            </button>
            <button
              type="button"
              className={[ve['ve__action'], ve['ve__action--danger']].join(' ')}
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
                    <span className={ve['ve__trans-value']}>{parent.label}</span>
                    {isAnchor ? (
                      <span className={styles['gve__primary-tag']}>Primary</span>
                    ) : (
                      <button
                        type="button"
                        className={styles['gve__make-primary']}
                        disabled={readOnly}
                        onClick={() => {
                          onMakePrimary(parent.id);
                        }}
                      >
                        Make primary
                      </button>
                    )}
                    <button
                      type="button"
                      className={ve['ve__trans-remove']}
                      aria-label={`Remove from ${parent.label}`}
                      disabled={readOnly}
                      onClick={() => onRemoveParent(parent.id)}
                    >
                      <Icon size="12" glyph={<CloseIcon />} />
                    </button>
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

            <div className={ve['ve__trans-add']}>
              <Select
                size="Small"
                value={pick}
                aria-label="Add a parent"
                disabled={readOnly || crossRefBlocked || candidates.length === 0}
                onChange={(e) => setPick(e.target.value)}
              >
                <option value="">
                  {candidates.length === 0
                    ? 'No eligible parents'
                    : 'Add a parent…'}
                </option>
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </Select>
              <Button
                emphasis="Secondary"
                size="Small"
                leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
                disabled={readOnly || crossRefBlocked || !pick}
                onClick={commitAddParent}
              >
                Add parent
              </Button>
            </div>
            <p className={styles['gve__picker-note']}>
              {crossRefBlocked
                ? 'This option already has a parent. Turn on “Allow cross-references” in the options toolbar to let it sit under more than one.'
                : 'Options below this one aren’t listed — a parent can’t be one of its own descendants.'}
            </p>

            <div className={ve['ve__divider']} />

            {/* Read-only Children list — the node's outgoing edges. Plain text,
                keyboard-navigable; present identically in all three approaches. */}
            <div className={styles['gve__children']}>
              <span className={styles['gve__children-title']}>Children</span>
              {children.length === 0 ? (
                <p className={styles['gve__children-empty']}>
                  No nested options under this one.
                </p>
              ) : (
                <div className={styles['gve__children-list']}>
                  {children.map((child) => (
                    <button
                      key={child.id}
                      type="button"
                      className={styles['gve__child']}
                      aria-label={`Nested option ${child.label}; activate to go to it`}
                      onClick={() => onJumpTo?.(child.id)}
                    >
                      <Icon size="16" glyph={<ChevronRightIcon />} />
                      <span className={styles['gve__child-label']}>
                        {child.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </FixedPopoverMenu>
  );
}
