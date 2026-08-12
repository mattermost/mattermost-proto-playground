import { useMemo, useState } from 'react';
import type { RefObject } from 'react';
import CheckIcon from '@mattermost/compass-icons/components/check';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import CloseIcon from '@mattermost/compass-icons/components/close';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import ChevronLeftIcon from '@mattermost/compass-icons/components/chevron-left';
import SitemapIcon from '@mattermost/compass-icons/components/sitemap';
import SourceBranchIcon from '@mattermost/compass-icons/components/source-branch';
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
// swatches, actions) so this reads as the same product control — same choice the
// v2 GraphValueEditorPopover made. We add only the create-and-link rows in our
// own module.
import ve from '@/pages/AttributeHubSimplified/_components/ValueEditorPopover.module.scss';
import {
  anchorParentIdOf,
  ancestorsOf,
  childrenOf,
  descendantsOf,
  parentsOf,
  type GraphOption,
} from '../nonTreeModel';
import type { EdgeActions } from './repProps';
import styles from './DiagramNodePopover.module.scss';

export interface DiagramNodePopoverProps {
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
 * NT-4b per-node editor. Opening a node on the interactive diagram anchors this
 * popover to it; there is NO side list, so this control is the whole authoring
 * surface for a value. It composes the base FixedPopoverMenu + the v2 chevron-nav
 * sub-pane pattern: a main pane (name + color + Parents nav-row + Children nav-row
 * + deactivate/delete) and two sub-panes that edit incoming (Parents) and outgoing
 * (Children) edges. Both directions are cycle-safe and fail-closed: pickers grey
 * out ineligible values and the commit re-checks via the shared `addParent` gate.
 */
export default function DiagramNodePopover({
  option,
  allOptions,
  anchorRef,
  actions,
  onClose,
  onColorChange,
  onCreateLinked,
}: DiagramNodePopoverProps) {
  const [meta, setMeta] = useState<OptionMeta>(() => optionMeta(option.id));
  const [pane, setPane] = useState<Pane>('main');
  const [parentPick, setParentPick] = useState('');
  const [childPick, setChildPick] = useState('');
  const [newParent, setNewParent] = useState('');
  const [newChild, setNewChild] = useState('');
  const [rejection, setRejection] = useState<string | null>(null);

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
      (o) =>
        o.id !== option.id && !blocked.has(o.id) && !childIds.has(o.id),
    );
  }, [allOptions, option.id, children]);

  const commitMeta = (next: OptionMeta) => {
    const merged = { ...meta, ...next };
    setMeta(merged);
    setOptionMeta(option.id, merged);
    onColorChange();
  };

  const commitAddParent = () => {
    if (!parentPick) return;
    const err = actions.addParent(option.id, parentPick); // fail-closed re-check
    if (err) {
      setRejection(err);
      return;
    }
    setRejection(null);
    setParentPick('');
  };

  const commitAddChild = () => {
    if (!childPick) return;
    const err = actions.addParent(childPick, option.id); // fail-closed re-check
    if (err) {
      setRejection(err);
      return;
    }
    setRejection(null);
    setChildPick('');
  };

  const commitNewParent = () => {
    const trimmed = newParent.trim();
    if (!trimmed) return;
    onCreateLinked(trimmed, 'parent'); // fresh node → no cycle possible
    setNewParent('');
    setRejection(null);
  };

  const commitNewChild = () => {
    const trimmed = newChild.trim();
    if (!trimmed) return;
    onCreateLinked(trimmed, 'child');
    setNewChild('');
    setRejection(null);
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
              onClick={() => {
                setRejection(null);
                setPane('parents');
              }}
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
              onClick={() => {
                setRejection(null);
                setPane('children');
              }}
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

            {rejection && (
              <div className={styles['dnp__reject']} role="alert">
                <Icon size="16" glyph={<AlertOutlineIcon />} />
                <span>{rejection}</span>
              </div>
            )}

            <div className={ve['ve__trans-add']}>
              <Select
                size="Small"
                value={parentPick}
                aria-label="Add an existing value as a parent"
                disabled={parentCandidates.length === 0}
                onChange={(e) => setParentPick(e.target.value)}
              >
                <option value="">
                  {parentCandidates.length === 0
                    ? 'No eligible parents'
                    : 'Add existing value…'}
                </option>
                {parentCandidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </Select>
              <Button
                emphasis="Secondary"
                size="Small"
                leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
                disabled={!parentPick}
                onClick={commitAddParent}
              >
                Add
              </Button>
            </div>

            <div className={styles['dnp__create']}>
              <span className={styles['dnp__create-label']}>
                Or create a new value as a parent
              </span>
              <div className={styles['dnp__create-row']}>
                <TextInput
                  size="Small"
                  value={newParent}
                  placeholder="New parent name…"
                  aria-label="New parent value name"
                  onChange={(e) => setNewParent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitNewParent();
                  }}
                />
                <Button
                  emphasis="Tertiary"
                  size="Small"
                  disabled={!newParent.trim()}
                  onClick={commitNewParent}
                >
                  Create
                </Button>
              </div>
            </div>

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

            {rejection && (
              <div className={styles['dnp__reject']} role="alert">
                <Icon size="16" glyph={<AlertOutlineIcon />} />
                <span>{rejection}</span>
              </div>
            )}

            <div className={ve['ve__trans-add']}>
              <Select
                size="Small"
                value={childPick}
                aria-label="Add an existing value as a child"
                disabled={childCandidates.length === 0}
                onChange={(e) => setChildPick(e.target.value)}
              >
                <option value="">
                  {childCandidates.length === 0
                    ? 'No eligible children'
                    : 'Add existing value…'}
                </option>
                {childCandidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </Select>
              <Button
                emphasis="Secondary"
                size="Small"
                leadingIcon={<Icon size="16" glyph={<PlusIcon />} />}
                disabled={!childPick}
                onClick={commitAddChild}
              >
                Add
              </Button>
            </div>

            <div className={styles['dnp__create']}>
              <span className={styles['dnp__create-label']}>
                Or create a new value as a child
              </span>
              <div className={styles['dnp__create-row']}>
                <TextInput
                  size="Small"
                  value={newChild}
                  placeholder="New child name…"
                  aria-label="New child value name"
                  onChange={(e) => setNewChild(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitNewChild();
                  }}
                />
                <Button
                  emphasis="Tertiary"
                  size="Small"
                  disabled={!newChild.trim()}
                  onClick={commitNewChild}
                >
                  Create
                </Button>
              </div>
            </div>

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
