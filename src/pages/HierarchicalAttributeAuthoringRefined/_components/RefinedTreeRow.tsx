import { useRef, useState } from 'react';
import type { DragEvent } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import DragVerticalIcon from '@mattermost/compass-icons/components/drag-vertical';
import PlusBoxOutlineIcon from '@mattermost/compass-icons/components/plus-box-outline';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import SitemapIcon from '@mattermost/compass-icons/components/sitemap';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import OpenInNewIcon from '@mattermost/compass-icons/components/open-in-new';
import CloseIcon from '@mattermost/compass-icons/components/close';
import Icon from '@/components/ui/Icon/Icon';
import Button from '@/components/ui/Button/Button';
import IconButton from '@/components/ui/IconButton/IconButton';
import TextInput from '@/components/ui/TextInput/TextInput';
import ColoredRankedInputChip, {
  type ColoredRankedInputScheme,
} from '@/components/ui/ColoredRankedInputChip/ColoredRankedInputChip';
import {
  additionalParentsOf,
  anchorParentLabel,
  childRows,
  isStubOccurrence,
  schemeOf,
  wouldCreateCycle,
  type GraphOption,
} from '@/pages/HierarchicalAttributeAuthoringV2/graphAuthoringModel';
import styles from './RefinedOptionsControl.module.scss';

/**
 * Map a chosen color token/hex to the nearest banner scheme so a PRESET pick
 * recolors the filled chip. Returns null for an arbitrary custom hex the enum
 * can't express — the inline color dot carries the true color in that case.
 */
function schemeFromColor(color: string): ColoredRankedInputScheme | null {
  if (color.includes('green')) return 'green';
  if (color.includes('blue')) return 'blue';
  if (color.includes('red')) return 'red';
  if (color.includes('orange') || color.includes('yellow')) return 'orange';
  if (color.includes('purple')) return 'purple';
  return null;
}

export interface RefinedTreeRowProps {
  option: GraphOption;
  allOptions: GraphOption[];
  /** The parent this occurrence is rendered under (null = root). */
  viaParentId: string | null;
  depth: number;
  editable: boolean;
  /**
   * Global "Show cross-references in place" toggle (refined: replaces the
   * per-node peek). true → non-anchor parents render as read-only stub rows in
   * place; false → they render as chips on the node's own anchor row.
   */
  showRefsInPlace: boolean;
  /** Progressive disclosure: multi-parent authoring is opt-in. */
  allowCrossReferences: boolean;
  highlightId: string | null;
  /** The node currently being dragged by its grip (null = none). */
  draggingId: string | null;
  /** Parent the drag started under (set for stub reorders). */
  draggingViaParentId: string | null;
  /** True when the active drag is a reference-stub reorder. */
  draggingIsStub: boolean;
  registerAnchorRow: (id: string, el: HTMLDivElement | null) => void;
  onOpenEditor: (
    option: GraphOption,
    initialPane: 'main' | 'parents',
    el: HTMLElement,
  ) => void;
  onAddChild: (parentId: string, label: string) => void;
  onDelete: (id: string) => void;
  onJumpToAnchor: (id: string) => void;
  /** Detach a parent edge (× on a chip). */
  onDetachParent: (childId: string, parentId: string) => void;
  /** Drag lifecycle (grip = source, row = drop target). */
  onDragStartRow: (
    id: string,
    viaParentId: string | null,
    isStub: boolean,
  ) => void;
  onDragEndRow: () => void;
  onDropOnRow: (targetId: string, targetViaParentId: string | null) => void;
}

/**
 * One rendered occurrence of an option in the refined tree PROJECTION.
 *
 * Left gutter = expand/collapse chevron + a grip drag handle. Anchor grips
 * re-parent (drop on another row / root zone). Stub grips reorder among
 * siblings under the same parent without changing parent edges. Right side =
 * a hover/focus revealed action cluster (add child · parents · rename · delete)
 * that is keyboard-reachable. A reference stub occurrence links back to the
 * anchor and can be reordered in place when editable.
 */
export default function RefinedTreeRow({
  option,
  allOptions,
  viaParentId,
  depth,
  editable,
  showRefsInPlace,
  allowCrossReferences,
  highlightId,
  draggingId,
  draggingViaParentId,
  draggingIsStub,
  registerAnchorRow,
  onOpenEditor,
  onAddChild,
  onDelete,
  onJumpToAnchor,
  onDetachParent,
  onDragStartRow,
  onDragEndRow,
  onDropOnRow,
}: RefinedTreeRowProps) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [adding, setAdding] = useState(false);
  const [childDraft, setChildDraft] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const isStub = isStubOccurrence(option, viaParentId);
  const indent = {
    paddingLeft: `calc(${depth} * var(--spacing-l) + var(--spacing-s))`,
  } as const;
  // Effective color: an admin-chosen color (from the popover, stored on the
  // option in tree state) wins over the default per-family scheme. Preset picks
  // recolor the chip via the nearest scheme; ANY color (incl. an arbitrary
  // custom hex the scheme enum can't express) repaints the inline color dot.
  const chosenColor = option.color ?? null;
  const scheme: ColoredRankedInputScheme =
    (chosenColor && schemeFromColor(chosenColor)) || schemeOf(option.id);

  // ── Reference stub occurrence (pointer to the anchor; reorderable in place) ─
  if (isStub) {
    const anchorLabel = anchorParentLabel(allOptions, option);
    const canReorderDrop =
      editable &&
      draggingIsStub &&
      draggingViaParentId != null &&
      draggingViaParentId === viaParentId &&
      draggingId != null &&
      draggingId !== option.id;

    const handleStubGripDragStart = (e: DragEvent<HTMLSpanElement>) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', option.id);
      if (rowRef.current) e.dataTransfer.setDragImage(rowRef.current, 12, 12);
      onDragStartRow(option.id, viaParentId, true);
    };

    const handleStubDragOver = (e: DragEvent<HTMLDivElement>) => {
      if (!canReorderDrop) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (!dragOver) setDragOver(true);
    };

    const handleStubDrop = (e: DragEvent<HTMLDivElement>) => {
      if (!canReorderDrop) return;
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      onDropOnRow(option.id, viaParentId);
    };

    return (
      <div
        ref={rowRef}
        className={[
          styles['tree__row'],
          styles['tree__row--stub'],
          dragOver && styles['tree__row--drop'],
          draggingId === option.id &&
            draggingIsStub &&
            draggingViaParentId === viaParentId &&
            styles['tree__row--dragging'],
        ]
          .filter(Boolean)
          .join(' ')}
        style={indent}
        role="treeitem"
        tabIndex={-1}
        aria-level={depth + 1}
        aria-selected={false}
        aria-label={`Reference to ${option.label}; primary location under ${anchorLabel}; drag to reorder under this parent, or activate to jump`}
        onDragOver={handleStubDragOver}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleStubDrop}
      >
        <span className={styles['tree__gutter']}>
          <span className={styles['stub__glyph']} aria-hidden>
            ↳
          </span>
          {editable && (
            <span
              className={styles['tree__grip']}
              draggable
              aria-hidden
              title={`Drag to reorder ${option.label} under this parent`}
              onDragStart={handleStubGripDragStart}
              onDragEnd={onDragEndRow}
            >
              <Icon size="16" glyph={<DragVerticalIcon />} />
            </span>
          )}
        </span>
        {chosenColor && (
          <span
            className={styles['tree__color-dot']}
            style={{ backgroundColor: chosenColor }}
            aria-hidden
          />
        )}
        <ColoredRankedInputChip
          label={option.label}
          scheme={scheme}
          disabled={option.disabled}
          onClick={() => onJumpToAnchor(option.id)}
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
  // Non-anchor children materialize as read-only stubs ONLY when the global
  // "show in place" toggle is on (and cross-references are allowed at all).
  const visibleKids = kids.filter((k) => {
    if (!isStubOccurrence(k, option.id)) return true; // anchored here → always
    return allowCrossReferences && showRefsInPlace;
  });
  const hasChildren = visibleKids.length > 0;

  // Chips carry the extra parents only in the OFF (chips) mode — they are the
  // alternative to in-place stubs, never shown alongside them.
  const additionalParents =
    allowCrossReferences && !showRefsInPlace && option.parentIds.length > 1
      ? additionalParentsOf(allOptions, option)
      : [];
  const showChips = additionalParents.length > 0;
  // In the ON (in-place) mode the anchor row keeps a quiet multi-parent marker
  // so the node still signals it lives in more than one place.
  const showMultiMarker =
    allowCrossReferences && showRefsInPlace && option.parentIds.length > 1;

  // Anchor drop = reparent target. Sibling drop during a stub drag = reorder.
  const canReparentDrop =
    editable &&
    !draggingIsStub &&
    draggingId != null &&
    draggingId !== option.id &&
    !wouldCreateCycle(allOptions, draggingId, option.id);
  const canReorderDrop =
    editable &&
    draggingIsStub &&
    draggingViaParentId != null &&
    draggingViaParentId === viaParentId &&
    draggingId != null &&
    draggingId !== option.id;
  const canDrop = canReparentDrop || canReorderDrop;

  const setRowEl = (el: HTMLDivElement | null) => {
    rowRef.current = el;
    registerAnchorRow(option.id, el);
  };

  const handleGripDragStart = (e: DragEvent<HTMLSpanElement>) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', option.id);
    if (rowRef.current) e.dataTransfer.setDragImage(rowRef.current, 12, 12);
    onDragStartRow(option.id, viaParentId, false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (!canDrop) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!dragOver) setDragOver(true);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    if (!canDrop) return;
    e.preventDefault();
    setDragOver(false);
    onDropOnRow(option.id, viaParentId);
  };

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
        ref={setRowEl}
        role="treeitem"
        tabIndex={-1}
        aria-level={depth + 1}
        aria-selected={false}
        aria-expanded={hasChildren ? expanded : undefined}
        aria-label={option.label}
        className={[
          styles['tree__row'],
          styles['tree__row--anchor'],
          option.disabled && styles['tree__row--disabled'],
          highlightId === option.id && styles['tree__row--highlight'],
          dragOver && styles['tree__row--drop'],
          draggingId === option.id && styles['tree__row--dragging'],
        ]
          .filter(Boolean)
          .join(' ')}
        style={indent}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <span className={styles['tree__gutter']}>
          {hasChildren ? (
            <button
              type="button"
              className={styles['tree__twist']}
              aria-label={expanded ? 'Collapse' : 'Expand'}
              onClick={() => setExpanded((v) => !v)}
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
            <span
              className={styles['tree__grip']}
              draggable
              aria-hidden
              title={`Drag to move ${option.label}`}
              onDragStart={handleGripDragStart}
              onDragEnd={onDragEndRow}
            >
              <Icon size="16" glyph={<DragVerticalIcon />} />
            </span>
          )}
        </span>

        {chosenColor && (
          <span
            className={styles['tree__color-dot']}
            style={{ backgroundColor: chosenColor }}
            aria-hidden
          />
        )}
        <ColoredRankedInputChip
          label={option.label}
          scheme={scheme}
          disabled={option.disabled}
          onClick={(e) => onOpenEditor(option, 'main', e.currentTarget)}
        />

        {showMultiMarker && (
          <span className={styles['tree__multi']}>
            in {option.parentIds.length} places
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

        {editable && (
          <div className={styles['tree__actions']}>
            <IconButton
              size="X-Small"
              aria-label={`Add an option under ${option.label}`}
              icon={<Icon size="16" glyph={<PlusBoxOutlineIcon />} />}
              onClick={() => setAdding((v) => !v)}
            />
            <IconButton
              size="X-Small"
              aria-label={`Move or add a parent for ${option.label}`}
              icon={<Icon size="16" glyph={<SitemapIcon />} />}
              onClick={(e) => onOpenEditor(option, 'parents', e.currentTarget)}
            />
            <IconButton
              size="X-Small"
              aria-label={`Rename or edit ${option.label}`}
              icon={<Icon size="16" glyph={<PencilOutlineIcon />} />}
              onClick={(e) => onOpenEditor(option, 'main', e.currentTarget)}
            />
            <IconButton
              size="X-Small"
              destructive
              aria-label={`Delete ${option.label}`}
              icon={<Icon size="16" glyph={<TrashCanOutlineIcon />} />}
              onClick={() => onDelete(option.id)}
            />
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
        visibleKids.map((child) => (
          <RefinedTreeRow
            key={`${option.id}:${child.id}`}
            option={child}
            allOptions={allOptions}
            viaParentId={option.id}
            depth={depth + 1}
            editable={editable}
            showRefsInPlace={showRefsInPlace}
            allowCrossReferences={allowCrossReferences}
            highlightId={highlightId}
            draggingId={draggingId}
            draggingViaParentId={draggingViaParentId}
            draggingIsStub={draggingIsStub}
            registerAnchorRow={registerAnchorRow}
            onOpenEditor={onOpenEditor}
            onAddChild={onAddChild}
            onDelete={onDelete}
            onJumpToAnchor={onJumpToAnchor}
            onDetachParent={onDetachParent}
            onDragStartRow={onDragStartRow}
            onDragEndRow={onDragEndRow}
            onDropOnRow={onDropOnRow}
          />
        ))}
    </>
  );
}
