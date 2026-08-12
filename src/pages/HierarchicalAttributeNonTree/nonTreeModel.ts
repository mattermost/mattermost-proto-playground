/**
 * Non-tree representations of the Graph (Hierarchical) attribute value DAG.
 *
 * NET-NEW glue only. It does NOT rebuild the DAG math and it does NOT edit the
 * shared model — it re-exports the shared adjacency helpers from the v2 model
 * (SEED_V2, parents/children/ancestors/descendants, cycle + delete gates,
 * anchor/additional-parent projection) VERBATIM, and adds the three pieces the
 * non-tree surfaces need that the tree never did:
 *
 *   1. pathsTo / primaryPathTo — full root→node path enumeration (NT-2 fold-in,
 *      the reachability-verification text layer folded into the lineage table).
 *   2. matrixOrder — a family-clustered node ordering so the adjacency grid reads
 *      as grouped blocks instead of scattered cells (NT-3 seriation, hand-tuned
 *      for the seed; a real deployment needs an ordering algorithm past ~50 nodes).
 *   3. layeredLayout / longestDepth — a simple layered (depth-column) layout for
 *      the read-only node-link diagram (NT-4). No npm graph-layout dependency.
 *
 * Multi-parent is native to all three paradigms, so none of them use the tree's
 * anchor-vs-stub projection to render structure — but `anchorParentIdOf` is still
 * the source of truth for which single edge is the "primary" one (solid line in
 * the diagram, primary path in the path list).
 */
import {
  childrenOf,
  optionMap,
  anchorParentIdOf,
  type GraphOption,
} from '@/pages/HierarchicalAttributeAuthoringV2/graphAuthoringModel';

// Re-export the shared adjacency model VERBATIM (read-only reuse — never edited).
export {
  SEED_V2,
  parentsOf,
  childrenOf,
  ancestorsOf,
  descendantsOf,
  wouldCreateCycle,
  validateAddParent,
  structuralDeleteBlock,
  anchorParentIdOf,
  additionalParentsOf,
  labelOf,
  optionMap,
  newOptionId,
  type GraphOption,
} from '@/pages/HierarchicalAttributeAuthoringV2/graphAuthoringModel';

// ── Family color (root-family → palette token) ─────────────────────────────────
// Used for the small family dot on chips, the matrix root-group rules, and the
// node-link box accent. Palette tokens only (never a raw hex); a multi-parent
// node inherits the family of its PRIMARY (anchor) parent chain.
const FAMILY_TOKEN: Record<string, string> = {
  air: 'var(--color-blue-400)',
  maritime: 'var(--color-green-500)',
  space: 'var(--color-purple-400)',
  joint: 'var(--color-orange-500)',
  northcom: 'var(--color-red-500)',
};

/** Follow the anchor (primary) parent chain up to its root id. */
export function rootFamilyId(options: GraphOption[], id: string): string {
  const map = optionMap(options);
  let cur = map.get(id);
  const guard = new Set<string>();
  while (cur && cur.parentIds.length > 0 && !guard.has(cur.id)) {
    guard.add(cur.id);
    const anchor = anchorParentIdOf(cur);
    if (anchor == null) break;
    cur = map.get(anchor);
  }
  return cur?.id ?? id;
}

/** A CSS color variable for a node's root family, or a neutral fallback. */
export function familyColorVar(options: GraphOption[], id: string): string {
  return (
    FAMILY_TOKEN[rootFamilyId(options, id)] ??
    'rgba(var(--center-channel-color-rgb), 0.32)'
  );
}

// ── NT-2 — path enumeration (full root→node paths as text) ─────────────────────

/** Every root→node path as an ordered array of labels. Multi-parent → >1 path. */
export function pathsTo(options: GraphOption[], id: string): string[][] {
  const map = optionMap(options);
  const walk = (cur: string, guard: Set<string>): string[][] => {
    const opt = map.get(cur);
    if (!opt) return [];
    if (opt.parentIds.length === 0) return [[opt.label]];
    const out: string[][] = [];
    for (const pid of opt.parentIds) {
      if (guard.has(pid)) continue; // defensive cycle guard
      for (const prefix of walk(pid, new Set(guard).add(cur))) {
        out.push([...prefix, opt.label]);
      }
    }
    return out.length ? out : [[opt.label]];
  };
  return walk(id, new Set());
}

/** The single primary path — following the anchor (first-declared) parent chain. */
export function primaryPathTo(options: GraphOption[], id: string): string[] {
  const map = optionMap(options);
  const out: string[] = [];
  const guard = new Set<string>();
  let cur = map.get(id);
  while (cur && !guard.has(cur.id)) {
    out.unshift(cur.label);
    guard.add(cur.id);
    const anchor = anchorParentIdOf(cur);
    cur = anchor ? map.get(anchor) : undefined;
  }
  return out;
}

// ── NT-3 — family-clustered ordering (seriation for the adjacency grid) ────────
// DFS pre-order from each root down the child relation clusters each program
// family into a contiguous block, so filled cells sit near the diagonal instead
// of scattering. NOTE: this is a hand-tuned clustering for the dozens-scale seed;
// past ~50 nodes the grid needs a real seriation/reordering algorithm and becomes
// a specialist surface (see 02c §3).
export function matrixOrder(options: GraphOption[]): GraphOption[] {
  const seen = new Set<string>();
  const out: GraphOption[] = [];
  const visit = (o: GraphOption) => {
    if (seen.has(o.id)) return;
    seen.add(o.id);
    out.push(o);
    for (const child of childrenOf(options, o.id)) visit(child);
  };
  for (const root of options.filter((o) => o.parentIds.length === 0)) visit(root);
  for (const o of options) if (!seen.has(o.id)) visit(o);
  return out;
}

// ── NT-4 — layered layout for the read-only node-link diagram ──────────────────

/** Longest root→node distance (roots = 0). Used as the diagram's column index. */
export function longestDepth(options: GraphOption[], id: string): number {
  const map = optionMap(options);
  const memo = new Map<string, number>();
  const walk = (cur: string, guard: Set<string>): number => {
    if (memo.has(cur)) return memo.get(cur)!;
    const parents = map.get(cur)?.parentIds ?? [];
    const live = parents.filter((p) => !guard.has(p));
    const d =
      live.length === 0
        ? 0
        : 1 + Math.max(...live.map((p) => walk(p, new Set(guard).add(cur))));
    memo.set(cur, d);
    return d;
  };
  return walk(id, new Set());
}

export interface LaidNode {
  id: string;
  label: string;
  depth: number; // column
  row: number; // position within the column
  disabled?: boolean;
}

export interface LaidEdge {
  parentId: string;
  childId: string;
  /** 'anchor' = primary/first parent (solid line); 'additional' = dotted line. */
  kind: 'anchor' | 'additional';
}

export interface LayeredLayout {
  nodes: LaidNode[];
  edges: LaidEdge[];
  columns: number; // depth count
  rows: number; // widest column
}

/**
 * A deterministic layered (Sugiyama-lite) layout: each node sits in the column
 * of its longest depth; within a column, nodes keep seed order. Good enough for
 * the curated dozens-scale seed — the diagram is read-only reference, not an
 * interactive canvas, so we do not run crossing-minimization.
 */
export function layeredLayout(options: GraphOption[]): LayeredLayout {
  const byDepth = new Map<number, LaidNode[]>();
  let columns = 0;
  for (const o of options) {
    const depth = longestDepth(options, o.id);
    columns = Math.max(columns, depth + 1);
    const col = byDepth.get(depth) ?? [];
    col.push({ id: o.id, label: o.label, depth, row: col.length, disabled: o.disabled });
    byDepth.set(depth, col);
  }
  const nodes: LaidNode[] = [];
  let rows = 0;
  for (const col of byDepth.values()) {
    rows = Math.max(rows, col.length);
    nodes.push(...col);
  }
  const edges: LaidEdge[] = [];
  for (const o of options) {
    o.parentIds.forEach((pid, i) => {
      edges.push({ parentId: pid, childId: o.id, kind: i === 0 ? 'anchor' : 'additional' });
    });
  }
  return { nodes, edges, columns, rows };
}
