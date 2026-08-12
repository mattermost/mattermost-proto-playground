import { useState } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import ChevronUpIcon from '@mattermost/compass-icons/components/chevron-up';
import DragVerticalIcon from '@mattermost/compass-icons/components/drag-vertical';
import PlusBoxOutlineIcon from '@mattermost/compass-icons/components/plus-box-outline';
import OpenInNewIcon from '@mattermost/compass-icons/components/open-in-new';
import CloseIcon from '@mattermost/compass-icons/components/close';
import EyeOutlineIcon from '@mattermost/compass-icons/components/eye-outline';
import EyeOffOutlineIcon from '@mattermost/compass-icons/components/eye-off-outline';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import IconButton from '@/components/ui/IconButton/IconButton';
import TextInput from '@/components/ui/TextInput/TextInput';
import ColoredRankedInputChip from '@/components/ui/ColoredRankedInputChip/ColoredRankedInputChip';
import {
  additionalParentsOf,
  anchorParentLabel,
  childRows,
  isStubOccurrence,
  schemeOf,
  type GraphOption,
  type UiApproach,
} from '../graphAuthoringModel';
import styles from './GraphOptionsControl.module.scss';

export interface GraphTreeRowProps {
  option: GraphOption;
  allOptions: GraphOption[];
  /** The parent this occurrence is rendered under (null = root). */
  viaParentId: string | null;
  depth: number;
  index: number;
  siblingCount: number;
  editable: boolean;
  collapseStubs: boolean;
  /** Which representation is active (04c bake-off dimension). */
  uiApproach: UiApproach;
  /** Hybrid only — the single node currently peeked as stubs under its parents. */
  peekedId: string | null;
  highlightId: string | null;
  registerAnchorRow: (id: string, el: HTMLDivElement | null) => void;
  onOpenEditor: (
    option: GraphOption,
    stubParentId: string | null,
    el: HTMLElement,
  ) => void;
  onReorder: (id: string, dir: -1 | 1) => void;
  onAddChild: (parentId: string, label: string) => void;
  onJumpToAnchor: (id: string) => void;
  /** Detach a parent edge (× on a chip). */
  onDetachParent: (childId: string, parentId: string) => void;
  /** Hybrid only — toggle the spatial peek for this node. */
  onTogglePeek: (id: string) => void;
}

/**
 * One rendered occurrence of an option in the tree PROJECTION.
 *  - anchor / root occurrence → fully editable (reuses the base TreeRow shape:
 *    twist, reorder, chip→popover, inline "Add child"), recurses into children.
 *  - reference stub occurrence → read-only: dimmed, `↳` glyph, no reorder /
 *    add-child, links back to the editable anchor. Never recurses.
 */
export default function GraphTreeRow({
  option,
  allOptions,
  viaParentId,
  depth,
  index,
  siblingCount,
  editable,
  collapseStubs,
  uiApproach,
  peekedId,
  highlightId,
  registerAnchorRow,
  onOpenEditor,
  onReorder,
  onAddChild,
  onJumpToAnchor,
  onDetachParent,
  onTogglePeek,
}: GraphTreeRowProps) {
  const [expanded, setExpanded] = useState(true);
  const [adding, setAdding] = useState(false);
  const [childDraft, setChildDraft] = useState('');

  const isStub = isStubOccurrence(option, viaParentId);
  const indent = {
    paddingLeft: `calc(${depth} * var(--spacing-l) + var(--spacing-s))`,
  } as const;
  const scheme = schemeOf(option.id);

  // ── Reference stub occurrence (read-only pointer to the anchor) ──────────────
  if (isStub) {
    const anchorLabel = anchorParentLabel(allOptions, option);
    return (
      <div
        className={[styles['tree__row'], styles['tree__row--stub']]
          .filter(Boolean)
          .join(' ')}
        style={indent}
        aria-label={`Reference to ${option.label}; primary location under ${anchorLabel}; activate to jump`}
      >
        <span className={styles['stub__glyph']} aria-hidden>
          ↳
        </span>
        <ColoredRankedInputChip
          label={option.label}
          scheme={scheme}
          disabled={option.disabled}
          onClick={(e) => onOpenEditor(option, viaParentId, e.currentTarget)}
        />
        <button
          type="button"
          className={styles['stub__link']}
          onClick={() => onJumpToAnchor(option.id)}
        >
          also appears here · edit under {anchorLabel}
        </button>
      </div>
    );
  }

  // ── Anchor / root occurrence (editable spine) ────────────────────────────────
  const kids = childRows(allOptions, option.id);
  // How a 2nd+ parent is REPRESENTED is the ONLY thing that differs across arms:
  //   • stubs  — render every child here; non-anchor ones become read-only stubs
  //              (unless progressive disclosure hides them via collapseStubs).
  //   • chips  — never render a stub row; a child's extra parents live as chips
  //              on the child's OWN anchor row instead. One row per node, ever.
  //   • hybrid — chips by default, BUT if THIS child is the peeked node, its stub
  //              transiently materializes under this (non-anchor) parent.
  const visibleKids = kids.filter((k) => {
    if (!isStubOccurrence(k, option.id)) return true; // anchored here → always
    if (uiApproach === 'stubs') return !collapseStubs; // progressive disclosure
    if (uiApproach === 'hybrid') return !collapseStubs && peekedId === k.id;
    return false; // chips → no stub rows anywhere
  });
  const hasChildren = visibleKids.length > 0;

  // Chips + peek apply only when cross-references are on (progressive disclosure)
  // and the node genuinely has more than one parent.
  const additionalParents =
    uiApproach !== 'stubs' && !collapseStubs && option.parentIds.length > 1
      ? additionalParentsOf(allOptions, option)
      : [];
  const showChips = additionalParents.length > 0;
  const peeked = peekedId === option.id;

  const commitChild = () => {
    const label = childDraft.trim();
    if (!label) return;
    onAddChild(option.id, label);
    setChildDraft('');
    setAdding(false);
    setExpanded(true);
  };

  return (
    <>
      <div
        ref={(el) => registerAnchorRow(option.id, el)}
        className={[
          styles['tree__row'],
          styles['tree__row--anchor'],
          option.disabled && styles['tree__row--disabled'],
          highlightId === option.id && styles['tree__row--highlight'],
        ]
          .filter(Boolean)
          .join(' ')}
        style={indent}
      >
        {hasChildren ? (
          <button
            type="button"
            className={styles['tree__twist']}
            aria-label={expanded ? 'Collapse' : 'Expand'}
            onClick={() => setExpanded((e) => !e)}
          >
            <Icon
              size="16"
              glyph={expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
            />
          </button>
        ) : (
          <span className={styles['tree__twist-spacer']} aria-hidden />
        )}

        {editable && (
          <span className={styles['tree__reorder']}>
            <IconButton
              size="X-Small"
              aria-label={`Move ${option.label} up`}
              disabled={index === 0}
              icon={<Icon size="16" glyph={<ChevronUpIcon />} />}
              onClick={() => onReorder(option.id, -1)}
            />
            <IconButton
              size="X-Small"
              aria-label={`Move ${option.label} down`}
              disabled={index === siblingCount - 1}
              icon={<Icon size="16" glyph={<ChevronDownIcon />} />}
              onClick={() => onReorder(option.id, 1)}
            />
            <span className={styles['tree__drag']} aria-hidden>
              <Icon size="16" glyph={<DragVerticalIcon />} />
            </span>
          </span>
        )}

        <ColoredRankedInputChip
          label={option.label}
          scheme={scheme}
          disabled={option.disabled}
          onClick={(e) => onOpenEditor(option, null, e.currentTarget)}
        />

        {/* stubs arm: a text count (the stubs elsewhere carry the placement).
            chips/hybrid arms: the extra parents render as chips on THIS row. */}
        {uiApproach === 'stubs' && option.parentIds.length > 1 && (
          <span className={styles['tree__multi']}>
            appears under {option.parentIds.length} parents
          </span>
        )}

        {showChips && (
          <span className={styles['tree__chips']}>
            {additionalParents.map((parent) => (
              <span key={parent.id} className={styles['parent-chip']}>
                <button
                  type="button"
                  className={styles['parent-chip__body']}
                  aria-label={`also a child of ${parent.label}; activate to go to ${parent.label}`}
                  onClick={() => onJumpToAnchor(parent.id)}
                >
                  <Icon size="12" glyph={<OpenInNewIcon />} />
                  <span className={styles['parent-chip__label']}>
                    {parent.label}
                  </span>
                </button>
                {editable && (
                  <button
                    type="button"
                    className={styles['parent-chip__remove']}
                    aria-label={`Remove ${parent.label} as a parent of ${option.label}`}
                    onClick={() => onDetachParent(option.id, parent.id)}
                  >
                    <Icon size="12" glyph={<CloseIcon />} />
                  </button>
                )}
              </span>
            ))}
          </span>
        )}

        {option.disabled && (
          <span className={styles['tree__flag']}>Deactivated</span>
        )}

        <span className={styles['tree__spacer']} />

        {(editable || (uiApproach === 'hybrid' && showChips)) && (
          <div className={styles['tree__actions']}>
            {uiApproach === 'hybrid' && showChips && (
              <button
                type="button"
                className={[
                  styles['tree__peek'],
                  peeked && styles['tree__peek--on'],
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-pressed={peeked}
                aria-label={
                  peeked
                    ? `Hide ${option.label} under its other parents`
                    : `Show ${option.label} under its other parents`
                }
                onClick={() => onTogglePeek(option.id)}
              >
                <Icon
                  size="16"
                  glyph={peeked ? <EyeOffOutlineIcon /> : <EyeOutlineIcon />}
                />
                <span className={styles['tree__peek-text']}>
                  {peeked ? 'Hide other parents' : 'Show under other parents'}
                </span>
              </button>
            )}
            {editable && (
              <Button
                emphasis="Tertiary"
                size="X-Small"
                leadingIcon={<Icon size="12" glyph={<PlusBoxOutlineIcon />} />}
                onClick={() => setAdding((v) => !v)}
              >
                Add child
              </Button>
            )}
          </div>
        )}
      </div>

      {editable && adding && (
        <div
          className={styles['tree__child-add']}
          style={{
            paddingLeft: `calc(${depth + 1} * var(--spacing-l) + var(--spacing-s))`,
          }}
        >
          <TextInput
            size="Small"
            placeholder={`Nested option under ${option.label}`}
            value={childDraft}
            onChange={(e) => setChildDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitChild();
            }}
          />
          <Button
            emphasis="Secondary"
            size="Small"
            disabled={childDraft.trim().length === 0}
            onClick={commitChild}
          >
            Add
          </Button>
          <Button
            emphasis="Tertiary"
            size="Small"
            onClick={() => setAdding(false)}
          >
            Cancel
          </Button>
        </div>
      )}

      {hasChildren &&
        expanded &&
        visibleKids.map((child, i) => (
          <GraphTreeRow
            key={`${option.id}:${child.id}`}
            option={child}
            allOptions={allOptions}
            viaParentId={option.id}
            depth={depth + 1}
            index={i}
            siblingCount={visibleKids.length}
            editable={editable}
            collapseStubs={collapseStubs}
            uiApproach={uiApproach}
            peekedId={peekedId}
            highlightId={highlightId}
            registerAnchorRow={registerAnchorRow}
            onOpenEditor={onOpenEditor}
            onReorder={onReorder}
            onAddChild={onAddChild}
            onJumpToAnchor={onJumpToAnchor}
            onDetachParent={onDetachParent}
            onTogglePeek={onTogglePeek}
          />
        ))}
    </>
  );
}
