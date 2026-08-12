import { useMemo, useState } from 'react';
import type { RefObject } from 'react';
import CheckIcon from '@mattermost/compass-icons/components/check';
import CloseIcon from '@mattermost/compass-icons/components/close';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import ChevronLeftIcon from '@mattermost/compass-icons/components/chevron-left';
import SitemapIcon from '@mattermost/compass-icons/components/sitemap';
import SourceBranchIcon from '@mattermost/compass-icons/components/source-branch';
import CancelIcon from '@mattermost/compass-icons/components/cancel';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import Icon from '@/components/ui/Icon/Icon';
import TextInput from '@/components/ui/TextInput/TextInput';
import FixedPopoverMenu from '@/components/ui/FixedPopoverMenu/FixedPopoverMenu';
import {
  OPTION_SWATCHES,
  optionMeta,
  setOptionMeta,
  type OptionMeta,
} from '@/pages/AttributeHubSimplified/_components/simplifiedModel';
// Reuse the DECIDED base popover styling verbatim (label field, nav-row, panes,
// swatches, actions) so this reads as the same product control — same choice the
// original DiagramNodePopover made.
import ve from '@/pages/AttributeHubSimplified/_components/ValueEditorPopover.module.scss';
import {
  anchorParentIdOf,
  ancestorsOf,
  childrenOf,
  descendantsOf,
  parentsOf,
  type GraphOption,
} from '@/pages/HierarchicalAttributeNonTree/nonTreeModel';
import type { EdgeActions } from './edgeActions';
import CreatableEdgeCombobox from './CreatableEdgeCombobox';
import styles from './NodePopover.module.scss';

export interface NodePopoverProps {
  option: GraphOption;
  allOptions: GraphOption[];
  anchorRef: RefObject<HTMLElement | null>;
  actions: EdgeActions;
  onClose: () => void;
  /** Bump the diagram so a color change repaints the node accent immediately. */
  onColorChange: () => void;
  /** Create a brand-new value and link it to this node in one step. */
  onCreateLinked: (label: string, as: 'parent' | 'child') => void;
}

type Pane = 'main' | 'parents' | 'children';

/**
 * Per-node editor for the interactive diagram — forked from the non-tree
 * DiagramNodePopover, with the senior-UX redesign of the edge sub-panes. The
 * main pane is unchanged (rename · color swatches · Parents nav-row · Children
 * nav-row · deactivate/delete with the structural gate). The two sub-panes now
 * carry a SINGLE creatable combobox each instead of the old Select+Add plus
 * TextInput+Create double-mechanism: type to filter eligible existing values,
 * or create-and-link a brand-new one from the same input.
 *
 * Both directions stay cycle-safe and fail-closed: the combobox candidate lists
 * already exclude self + descendants (parents) / self + ancestors (children),
 * and every existing-value link re-checks through the shared addParent gate.
 */
export default function NodePopover({
  option,
  allOptions,
  anchorRef,
  actions,
  onClose,
  onColorChange,
  onCreateLinked,
}: NodePopoverProps) {
  const [meta, setMeta] = useState<OptionMeta>(() => optionMeta(option.id));
  const [pane, setPane] = useState<Pane>('main');

  const anchorId = anchorParentIdOf(option);
  const parents = parentsOf(allOptions, option.id);
  const children = childrenOf(allOptions, option.id);
  const deleteReason = actions.deleteBlock(option.id);

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
  // → cycle) and anything already a child.
  const childCandidates = useMemo(() => {
    const blocked = ancestorsOf(allOptions, option.id);
    const childIds = new Set(children.map((c) => c.id));
    return allOptions.filter(
      (o) => o.id !== option.id && !blocked.has(o.id) && !childIds.has(o.id),
    );
  }, [allOptions, option.id, children]);

  const commitMeta = (next: OptionMeta) => {
    const merged = { ...meta, ...next };
    setMeta(merged);
    setOptionMeta(option.id, merged);
    onColorChange();
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
                aria-label="Value name"
                onChange={(e) => actions.renameValue(option.id, e.target.value)}
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
                  : `${parents.length} ${parents.length === 1 ? 'parent' : 'parents'}`}
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
                  : `${children.length} ${children.length === 1 ? 'child' : 'children'}`}
              </span>
              <Icon size="16" glyph={<ChevronRightIcon />} />
            </button>

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
              onClick={() => actions.toggleDeactivate(option.id)}
            >
              <Icon size="20" glyph={<CancelIcon />} />
              {option.disabled ? 'Reactivate value' : 'Deactivate value'}
            </button>
            <span
              className={styles['dnp__delete-wrap']}
              title={deleteReason ?? undefined}
            >
              <button
                type="button"
                className={[ve['ve__action'], ve['ve__action--danger']].join(' ')}
                disabled={deleteReason != null}
                aria-label={
                  deleteReason
                    ? `Delete ${option.label} (blocked): ${deleteReason}`
                    : `Delete ${option.label}`
                }
                onClick={() => {
                  actions.deleteValue(option.id);
                  onClose();
                }}
              >
                <Icon size="20" glyph={<TrashCanOutlineIcon />} />
                Delete value
              </button>
            </span>
            {deleteReason && (
              <p className={styles['dnp__delete-reason']}>{deleteReason}</p>
            )}
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
                  Top-level value — no parents. Add one below to nest it.
                </p>
              )}
              {parents.map((parent) => (
                <div key={parent.id} className={ve['ve__trans-row']}>
                  <span className={ve['ve__trans-value']}>{parent.label}</span>
                  {parent.id === anchorId && parents.length > 1 && (
                    <span className={styles['dnp__primary-tag']}>Primary</span>
                  )}
                  <button
                    type="button"
                    className={ve['ve__trans-remove']}
                    aria-label={`Remove ${parent.label} as a parent of ${option.label}`}
                    onClick={() => actions.removeEdge(option.id, parent.id)}
                  >
                    <Icon size="12" glyph={<CloseIcon />} />
                  </button>
                </div>
              ))}
            </div>

            <CreatableEdgeCombobox
              placeholder="Add or create a parent…"
              ariaLabel={`Add or create a parent of ${option.label}`}
              candidates={parentCandidates}
              onPickExisting={(id) => actions.addParent(option.id, id)}
              onCreate={(label) => onCreateLinked(label, 'parent')}
            />

            <p className={styles['dnp__note']}>
              Values below this one aren’t listed — a parent can’t be one of its own
              descendants. Every link is re-checked before it commits.
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
                  No nested values under this one. Add one below.
                </p>
              )}
              {children.map((child) => (
                <div key={child.id} className={ve['ve__trans-row']}>
                  <span className={ve['ve__trans-value']}>{child.label}</span>
                  <button
                    type="button"
                    className={ve['ve__trans-remove']}
                    aria-label={`Detach ${child.label} from under ${option.label}`}
                    onClick={() => actions.removeEdge(child.id, option.id)}
                  >
                    <Icon size="12" glyph={<CloseIcon />} />
                  </button>
                </div>
              ))}
            </div>

            <CreatableEdgeCombobox
              placeholder="Add or create a child…"
              ariaLabel={`Add or create a child of ${option.label}`}
              candidates={childCandidates}
              onPickExisting={(id) => actions.addParent(id, option.id)}
              onCreate={(label) => onCreateLinked(label, 'child')}
            />

            <p className={styles['dnp__note']}>
              Values above this one aren’t listed — a child can’t be one of its own
              ancestors. Every link is re-checked before it commits.
            </p>
          </div>
        )}
      </div>
    </FixedPopoverMenu>
  );
}
