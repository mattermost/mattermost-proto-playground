import { Fragment, useRef, useState, type DragEvent } from 'react';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import ArrowDownIcon from '@mattermost/compass-icons/components/arrow-down';
import ArrowUpIcon from '@mattermost/compass-icons/components/arrow-up';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import DragVerticalIcon from '@mattermost/compass-icons/components/drag-vertical';
import PlusBoxOutlineIcon from '@mattermost/compass-icons/components/plus-box-outline';
import SitemapIcon from '@mattermost/compass-icons/components/sitemap';
import ArrowRightIcon from '@mattermost/compass-icons/components/arrow-right';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import TextInput from '@/components/ui/TextInput/TextInput';
import HoverTip from './HoverTip';
import {
  alsoUnderText,
  homeParentLabel,
  parentCountText,
  isReferenceOccurrence,
  positionOf,
  siblingsOf,
  wouldCreateCycle,
  type HierValue,
} from '../v3GraphModel';
import styles from './ValuesPanel.module.scss';

/** The occurrence being dragged: a value AND the parent edge it was grabbed by. */
export interface DragSource {
  id: string;
  /** The parent of the dragged OCCURRENCE. null = dragged from the top level. */
  fromParentId: string | null;
}

export interface OrderGapProps {
  /** The list this gap sits in. null = the top level. */
  parentId: string | null;
  /**
   * The child this gap sits ABOVE, or null for the gap after the last child.
   * A `beforeId` rather than an index, so the drop resolves against the list as
   * it stands at drop time rather than a snapshot taken on drag start.
   */
  beforeId: string | null;
  /** Indent level of the rows this gap sits between. */
  depth: number;
  onDropInGap: (parentId: string | null, beforeId: string | null) => void;
}

/**
 * A drop target BETWEEN two rows — the affordance "place it between A1 and A2"
 * needs and a row body cannot provide.
 *
 * Mounted only while a drag is in flight, and hidden from assistive tech: it is a
 * pointer-only convenience, and reordering has its own keyboard path in the row's
 * actions ("Move up" / "Move down"). A gap is never the only way to do anything.
 */
export function OrderGap({
  parentId,
  beforeId,
  depth,
  onDropInGap,
}: OrderGapProps) {
  const [over, setOver] = useState(false);

  return (
    <div
      aria-hidden
      className={[
        styles['values__gap'],
        over ? styles['values__gap--over'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        paddingLeft: `calc(${depth} * var(--values-tree-indent-step, var(--spacing-l)) + var(--spacing-s))`,
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (!over) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setOver(false);
        onDropInGap(parentId, beforeId);
      }}
    >
      <span className={styles['values__gap-line']} />
    </div>
  );
}

export interface ValueTreeRowProps {
  value: HierValue;
  values: HierValue[];
  /** The parent this occurrence is rendered under. null = top level. */
  viaParentId: string | null;
  depth: number;
  highlightId: string | null;
  /** Attribute-level setting: are ordinals shown and editable at all? */
  ranked: boolean;
  /** The occurrence currently being dragged by its grip. */
  dragging: DragSource | null;
  registerRow: (id: string, el: HTMLDivElement | null) => void;
  onOpenEditor: (
    value: HierValue,
    pane: 'main' | 'parents' | 'children',
    el: HTMLElement,
  ) => void;
  /** A new value always attaches to this parent, at the end of its list. */
  onAddChild: (parentId: string, label: string) => void;
  onRequestDelete: (id: string) => void;
  onJumpTo: (id: string) => void;
  onDragStartRow: (source: DragSource) => void;
  onDragEndRow: () => void;
  /** Drop on a row's body: retarget the dragged edge onto this value. */
  onDropOnRow: (targetId: string) => void;
  /** Drop between two rows: position within that list. */
  onDropInGap: (parentId: string | null, beforeId: string | null) => void;
  /** Keyboard reorder — this occurrence, one step under its current parent. */
  onNudge: (childId: string, parentId: string | null, delta: -1 | 1) => void;
}

/**
 * One rendered occurrence of a value (F1 + F4 + F7 + F8).
 *
 * Four rules this row exists to enforce:
 *
 *  1. NO DISPLAY SETTING CAN HIDE A RELATIONSHIP. Every parent→child edge is
 *     rendered, always. A value with several parents shows in full at the
 *     occurrence it is edited under, and as a pointer row under each other
 *     parent.
 *
 *  2. THE ROW DESCRIBES ITSELF, NOT THE TREE. It carries no "grants access to N
 *     values" readout: the indentation already draws what a value grants, and
 *     restating the transitive count on every row was the same information
 *     twice. Consequences appear where they change a decision — the grant
 *     confirm, the delete confirm, the per-edge sentences in the editor — not as
 *     a permanent caption. The full reachability picture is one link away.
 *
 *  3. EVERY ROW IS A FIRST-CLASS POSITION. A pointer row is not a read-only echo
 *     of a "real" position elsewhere. A value holds an independent ordinal under
 *     each of its parents, so every row — pointer or not — can be dragged and
 *     nudged, and doing so touches only the edge THAT ROW REPRESENTS. Only the
 *     content controls (rename, colour) live at a single occurrence, and that is
 *     all `isReference` still decides.
 *
 *  4. THE NUMERAL IS NOT A GRANT — AND NOT DECORATION EITHER. It is this
 *     occurrence's place in this parent's list. Being listed above a sibling
 *     hands out nothing: access comes from the edges, so a value one row higher
 *     reaches exactly what it reached before. But position is data a policy rule
 *     can compare, so moving a row can change who passes such a rule. In an
 *     access-control console a numbered list gets read as precedence, so the
 *     panel explainer states both halves once, and a reorder that touches a
 *     policy-referenced value says how many rules may now read differently.
 */
export default function ValueTreeRow({
  value,
  values,
  viaParentId,
  depth,
  highlightId,
  ranked,
  dragging,
  registerRow,
  onOpenEditor,
  onAddChild,
  onRequestDelete,
  onJumpTo,
  onDragStartRow,
  onDragEndRow,
  onDropOnRow,
  onDropInGap,
  onNudge,
}: ValueTreeRowProps) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [adding, setAdding] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [draft, setDraft] = useState('');

  const isReference = isReferenceOccurrence(values, value, viaParentId);
  const children = isReference ? [] : siblingsOf(values, value.id);
  const parentCount = parentCountText(value);
  const parentNames = alsoUnderText(values, value);
  const indent = {
    paddingLeft: `calc(${depth} * var(--values-tree-indent-step, var(--spacing-l)) + var(--spacing-s))`,
  };
  const drawerIndent = {
    paddingLeft: `calc(${depth + 1} * var(--values-tree-indent-step, var(--spacing-l)) + var(--spacing-s))`,
  };

  // ── Position: this occurrence's place in THIS parent's list ─────────────────
  const siblingCount = siblingsOf(values, viaParentId).length;
  const position = positionOf(values, value.id, viaParentId);
  // A numeral on an only child says nothing and, in an access-control console,
  // invites the precedence misreading for no benefit. It appears the moment there
  // is a second value to be ordered against.
  const orderable = ranked && position > 0 && siblingCount > 1;
  const listName =
    viaParentId == null
      ? 'the top level'
      : `“${values.find((v) => v.id === viaParentId)?.label ?? viaParentId}”`;

  // Gaps position a value in a list, so they only exist where order is shown.
  const gapsVisible = ranked && dragging != null;

  const commitChild = () => {
    const label = draft.trim();
    if (!label) return;
    onAddChild(value.id, label);
    setDraft('');
    setAdding(false);
    setExpanded(true);
  };

  // ── Drag: the grip is the source, the row is a target, cycles are excluded ──
  // Pointer rows are droppable too: a drop retargets whichever edge the dragged
  // row represents, so there is no reason to refuse one as a destination.
  const canDrop =
    dragging != null &&
    dragging.id !== value.id &&
    !wouldCreateCycle(values, dragging.id, value.id);

  const handleGripDragStart = (e: DragEvent<HTMLSpanElement>) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', value.id);
    if (rowRef.current) e.dataTransfer.setDragImage(rowRef.current, 12, 12);
    onDragStartRow({ id: value.id, fromParentId: viaParentId });
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
    onDropOnRow(value.id);
  };

  const setRowEl = (el: HTMLDivElement | null) => {
    rowRef.current = el;
    // Only the editing occurrence is a jump destination — "edit it under X"
    // has one answer, even though every row is a real position.
    if (!isReference) registerRow(value.id, el);
  };

  const grip = (
    <HoverTip
      label={`Drag to move ${value.label}`}
      hint="Drop on a row to move it there. Drop between rows to change its place in the list."
    >
      <span
        className={styles['values__grip']}
        draggable
        aria-hidden
        onDragStart={handleGripDragStart}
        onDragEnd={onDragEndRow}
      >
        <Icon size="16" glyph={<DragVerticalIcon />} />
      </span>
    </HoverTip>
  );

  /**
   * The numeral sits in the gutter at the row's own indent, so it reads as an
   * ordered-list marker rather than a badge on the value. Numerals at the same
   * depth then line up in a column, which is what stops several 1-2-3 runs at
   * different depths reading as one sequence.
   */
  const positionMarker = orderable ? (
    <span
      className={styles['values__pos']}
      aria-hidden
      title={`${position} of ${siblingCount} in ${listName}`}
    >
      {position}
    </span>
  ) : (
    ranked && <span className={styles['values__pos-spacer']} aria-hidden />
  );

  /** Keyboard parity for the drag: reordering is never mouse-only. */
  const nudgeControls = orderable && (
    <>
      <HoverTip label={`Move ${value.label} up`}>
        <IconButton
          size="X-Small"
          aria-label={`Move ${value.label} up — listed ${position} of ${siblingCount} under ${listName}`}
          disabled={position <= 1}
          icon={<Icon size="16" glyph={<ArrowUpIcon />} />}
          onClick={() => onNudge(value.id, viaParentId, -1)}
        />
      </HoverTip>
      <HoverTip label={`Move ${value.label} down`}>
        <IconButton
          size="X-Small"
          aria-label={`Move ${value.label} down — listed ${position} of ${siblingCount} under ${listName}`}
          disabled={position >= siblingCount}
          icon={<Icon size="16" glyph={<ArrowDownIcon />} />}
          onClick={() => onNudge(value.id, viaParentId, 1)}
        />
      </HoverTip>
    </>
  );

  const rowClass = (extra: string[]) =>
    [
      styles['values__row'],
      ...extra,
      highlightId === value.id ? styles['values__row--highlight'] : '',
      dragOver ? styles['values__row--drop'] : '',
      dragging?.id === value.id ? styles['values__row--dragging'] : '',
    ]
      .filter(Boolean)
      .join(' ');

  const positionLabel = orderable
    ? `, listed ${position} of ${siblingCount} under ${listName}`
    : '';

  // ── Pointer occurrence: a real position, edited elsewhere ──────────────────
  if (isReference) {
    return (
      <div
        role="treeitem"
        aria-level={depth + 1}
        aria-selected={false}
        aria-label={`${value.label}${positionLabel}, also granted here; edited under ${homeParentLabel(values, value)}`}
      >
        <div
          ref={setRowEl}
          className={rowClass([styles['values__row--reference']])}
          style={indent}
          onDragOver={handleDragOver}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <span className={styles['values__gutter']}>
            <span className={styles['values__twist-spacer']} aria-hidden />
            {grip}
            {positionMarker}
          </span>
          <span className={styles['values__ref-glyph']} aria-hidden>
            <Icon size="16" glyph={<ArrowRightIcon />} />
          </span>
          <span className={styles['values__name-static']}>{value.label}</span>
          <span className={styles['values__spacer']} />
          {nudgeControls && (
            <div className={styles['values__actions']}>{nudgeControls}</div>
          )}
          <button
            type="button"
            className={styles['values__jump']}
            onClick={() => onJumpTo(value.id)}
          >
            Edit under {homeParentLabel(values, value)}
          </button>
        </div>
      </div>
    );
  }

  // ── Editing occurrence ─────────────────────────────────────────────────────
  return (
    <div
      role="treeitem"
      aria-level={depth + 1}
      aria-selected={false}
      aria-expanded={children.length > 0 ? expanded : undefined}
      aria-label={`${value.label}${positionLabel}`}
    >
      <div
        ref={setRowEl}
        className={rowClass([])}
        style={indent}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <span className={styles['values__gutter']}>
          {children.length > 0 ? (
            <button
              type="button"
              className={styles['values__twist']}
              aria-label={
                expanded ? `Collapse ${value.label}` : `Expand ${value.label}`
              }
              onClick={() => setExpanded((v) => !v)}
            >
              <Icon
                size="16"
                glyph={expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
              />
            </button>
          ) : (
            <span className={styles['values__twist-spacer']} aria-hidden />
          )}
          {grip}
          {positionMarker}
        </span>

        <button
          type="button"
          className={styles['values__name']}
          onClick={(e) => onOpenEditor(value, 'main', e.currentTarget)}
        >
          {value.label}
        </button>

        {parentCount && (
          <HoverTip label={parentNames ?? 'More than one parent'}>
            <button
              type="button"
              className={styles['values__also']}
              onClick={(e) => onOpenEditor(value, 'parents', e.currentTarget)}
            >
              <Icon size="12" glyph={<LinkVariantIcon />} />
              {parentCount}
            </button>
          </HoverTip>
        )}

        <span className={styles['values__spacer']} />

        <div className={styles['values__actions']}>
          {nudgeControls}
          <HoverTip label={`Add a value under ${value.label}`}>
            <IconButton
              size="X-Small"
              aria-label={`Add a value under ${value.label}`}
              icon={<Icon size="16" glyph={<PlusBoxOutlineIcon />} />}
              onClick={() => setAdding((v) => !v)}
            />
          </HoverTip>
          <HoverTip label="Parents — who this value is granted by">
            <IconButton
              size="X-Small"
              aria-label={`Parents of ${value.label}`}
              icon={<Icon size="16" glyph={<SitemapIcon />} />}
              onClick={(e) => onOpenEditor(value, 'parents', e.currentTarget)}
            />
          </HoverTip>
          <HoverTip label={`Delete ${value.label}`} align="end">
            <IconButton
              size="X-Small"
              destructive
              aria-label={`Delete ${value.label}`}
              icon={<Icon size="16" glyph={<TrashCanOutlineIcon />} />}
              onClick={() => onRequestDelete(value.id)}
            />
          </HoverTip>
        </div>
      </div>

      {adding && (
        <div className={styles['values__drawer']} style={drawerIndent}>
          <p className={styles['values__drawer-title']}>
            Anyone holding “{value.label}” will get this new value too
          </p>
          {children.length > 0 && (
            <p className={styles['values__drawer-help']}>
              It is added at the end of “{value.label}”’s list. Drag it, or use
              Move up, to change where it sits.
            </p>
          )}
          <div className={styles['values__add-child']}>
            <TextInput
              size="Small"
              placeholder="Name the new value"
              value={draft}
              aria-label={`New value granted by ${value.label}`}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitChild();
              }}
            />
            <Button
              emphasis="Secondary"
              size="Small"
              disabled={draft.trim().length === 0}
              onClick={commitChild}
            >
              Add
            </Button>
            <Button
              emphasis="Tertiary"
              size="Small"
              onClick={() => {
                setAdding(false);
                setDraft('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {expanded && children.length > 0 && (
        <div role="group" aria-label={`Values granted by ${value.label}`}>
          {children.map((child) => (
            <Fragment key={`${value.id}:${child.id}`}>
              {gapsVisible && (
                <OrderGap
                  parentId={value.id}
                  beforeId={child.id}
                  depth={depth + 1}
                  onDropInGap={onDropInGap}
                />
              )}
              <ValueTreeRow
                value={child}
                values={values}
                ranked={ranked}
                viaParentId={value.id}
                depth={depth + 1}
                highlightId={highlightId}
                dragging={dragging}
                registerRow={registerRow}
                onOpenEditor={onOpenEditor}
                onAddChild={onAddChild}
                onRequestDelete={onRequestDelete}
                onJumpTo={onJumpTo}
                onDragStartRow={onDragStartRow}
                onDragEndRow={onDragEndRow}
                onDropOnRow={onDropOnRow}
                onDropInGap={onDropInGap}
                onNudge={onNudge}
              />
            </Fragment>
          ))}
          {gapsVisible && (
            <OrderGap
              parentId={value.id}
              beforeId={null}
              depth={depth + 1}
              onDropInGap={onDropInGap}
            />
          )}
        </div>
      )}
    </div>
  );
}
