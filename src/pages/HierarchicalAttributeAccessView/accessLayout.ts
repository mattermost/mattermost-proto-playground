/**
 * Family-banded layered layout + edge geometry for the 2D coverage diagram.
 *
 * NET-NEW. The existing diagram hub uses `layeredLayout` from
 * `@/pages/HierarchicalAttributeNonTree/nonTreeModel`, which packs each depth
 * column in seed order. That interleaves unrelated programme families down a
 * column, so two branches that share nothing sit adjacent and read as related.
 * This layout keeps the same column rule (column = longest root→node distance,
 * imported verbatim as `longestDepth`) but assigns ROWS one family at a time,
 * with a blank row between families, so unrelated branches read as unrelated.
 *
 * A value's family is the root of its ANCHOR (first-declared) parent chain, so
 * each value is laid out exactly once even when it has several parents; the
 * extra parents become cross-branch edges, which is the whole point of the
 * graph type and the reason arrowheads are mandatory here.
 *
 * Scale honesty: this is a deterministic, hand-checkable layout for the
 * dozens-scale seed. It runs no crossing minimisation. Past roughly fifty
 * values a real Sugiyama pass (or a different surface entirely) is required.
 */
import {
  anchorParentIdOf,
  type GraphOption,
} from '@/pages/HierarchicalAttributeAuthoringV2/graphAuthoringModel';
import { longestDepth } from '@/pages/HierarchicalAttributeNonTree/nonTreeModel';

/** Diagram geometry, in CSS pixels. */
export const GEO = {
  COL_W: 236,
  ROW_H: 60,
  NODE_W: 176,
  NODE_H: 40,
  PAD: 28,
} as const;

export interface AccessLaidNode {
  id: string;
  label: string;
  /** Column index — longest root→node distance. Parents are always to the left. */
  col: number;
  /** Row index within the family-banded grid. */
  row: number;
  x: number;
  y: number;
}

export interface AccessLaidEdge {
  key: string;
  parentId: string;
  childId: string;
  /** True when the child has more than one parent — a cross-branch grant. */
  crossBranch: boolean;
  /** SVG path, drawn child → parent so the tangent points the same way. */
  d: string;
  /** Arrowhead anchor: the cubic's t=0.5 point. */
  midX: number;
  midY: number;
  /** Arrowhead rotation in degrees, aimed child → parent. */
  angle: number;
}

export interface AccessLayout {
  nodes: AccessLaidNode[];
  edges: AccessLaidEdge[];
  cols: number;
  rows: number;
  width: number;
  height: number;
  byId: Map<string, AccessLaidNode>;
}

/**
 * Edge geometry for one parent→child relationship.
 *
 * The path is emitted FROM the child TO the parent. That is not cosmetic: the
 * reference implementation aims every arrowhead child→parent (up the lattice,
 * toward the greater privilege), and drawing the curve in that direction makes
 * the curve's own tangent the arrow direction, so the head can never drift out
 * of agreement with the semantics.
 *
 * For the cubic C(P0=child, P1, P2, P3=parent) with mirrored control points at
 * the horizontal midpoint, B(0.5) and B'(0.5) reduce to the closed forms below.
 */
export function edgeGeometry(
  child: { x: number; y: number },
  parent: { x: number; y: number },
): { d: string; midX: number; midY: number; angle: number } {
  const x1 = child.x; // child's left edge — the arrow's tail
  const y1 = child.y + GEO.NODE_H / 2;
  const x2 = parent.x + GEO.NODE_W; // parent's right edge — the arrow's head
  const y2 = parent.y + GEO.NODE_H / 2;
  const mx = (x1 + x2) / 2;

  const d = `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
  // B(0.5) = (P0 + 3·P1 + 3·P2 + P3) / 8
  const midX = (x1 + 3 * mx + 3 * mx + x2) / 8;
  const midY = (y1 + 3 * y1 + 3 * y2 + y2) / 8;
  // B'(0.5) ∝ (0.75·(x2 − x1), 1.5·(y2 − y1)) → scale-free as (x2 − x1, 2·(y2 − y1))
  const angle = (Math.atan2(2 * (y2 - y1), x2 - x1) * 180) / Math.PI;

  return { d, midX, midY, angle };
}

/**
 * Lay out `options` into family bands. Deterministic: same input, same output.
 * Roots are visited in seed order; within a family the anchor-child chain keeps
 * the parent's row so a lineage reads as one horizontal line, and each extra
 * sibling starts a new row below everything placed so far.
 */
export function familyLayeredLayout(options: GraphOption[]): AccessLayout {
  const colOf = new Map<string, number>();
  let cols = 0;
  for (const o of options) {
    const c = longestDepth(options, o.id);
    colOf.set(o.id, c);
    cols = Math.max(cols, c + 1);
  }

  const present = new Set(options.map((o) => o.id));
  const anchorChildren = (id: string) =>
    options.filter((o) => anchorParentIdOf(o) === id);

  const rowOf = new Map<string, number>();
  const occupied = new Set<string>();
  let maxRow = -1;
  let cursor = 0;

  const place = (o: GraphOption) => {
    if (rowOf.has(o.id)) return;
    const col = colOf.get(o.id) ?? 0;
    let row = cursor;
    while (occupied.has(`${col}:${row}`)) row += 1;
    occupied.add(`${col}:${row}`);
    rowOf.set(o.id, row);
    maxRow = Math.max(maxRow, row);
    cursor = row; // an anchor chain continues on the same row
    anchorChildren(o.id).forEach((kid, i) => {
      if (i > 0) cursor = maxRow + 1; // each extra sibling opens a new row
      place(kid);
    });
  };

  const roots = options.filter((o) => o.parentIds.length === 0);
  for (const root of roots) {
    cursor = maxRow < 0 ? 0 : maxRow + 2; // one blank row between families
    place(root);
  }
  // Defensive sweep: a value whose anchor parent is out of scope is its own band.
  for (const o of options) {
    if (rowOf.has(o.id)) continue;
    cursor = maxRow < 0 ? 0 : maxRow + 2;
    place(o);
  }

  const nodes: AccessLaidNode[] = options.map((o) => {
    const col = colOf.get(o.id) ?? 0;
    const row = rowOf.get(o.id) ?? 0;
    return {
      id: o.id,
      label: o.label,
      col,
      row,
      x: col * GEO.COL_W + GEO.PAD,
      y: row * GEO.ROW_H + GEO.PAD,
    };
  });
  const byId = new Map(nodes.map((n) => [n.id, n]));

  const edges: AccessLaidEdge[] = [];
  for (const o of options) {
    for (const parentId of o.parentIds) {
      if (!present.has(parentId)) continue;
      const child = byId.get(o.id);
      const parent = byId.get(parentId);
      if (!child || !parent) continue;
      const geo = edgeGeometry(child, parent);
      edges.push({
        key: `${parentId}->${o.id}`,
        parentId,
        childId: o.id,
        crossBranch: o.parentIds.length > 1,
        ...geo,
      });
    }
  }

  const rows = maxRow + 1;
  return {
    nodes,
    edges,
    cols,
    rows,
    width: Math.max(1, (cols - 1) * GEO.COL_W + GEO.NODE_W + GEO.PAD * 2),
    height: Math.max(1, (rows - 1) * GEO.ROW_H + GEO.NODE_H + GEO.PAD * 2),
    byId,
  };
}

/**
 * Keyboard traversal order within a column, and the column list — used by the
 * diagram's arrow-key model (Up/Down move within a column, Left/Right move
 * along edges).
 */
export function columnOrder(
  layout: AccessLayout,
  col: number,
): AccessLaidNode[] {
  return layout.nodes
    .filter((n) => n.col === col)
    .sort((a, b) => a.row - b.row);
}
