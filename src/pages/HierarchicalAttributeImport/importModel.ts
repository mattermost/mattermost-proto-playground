/**
 * Import a hierarchical (multi-parent DAG) value structure — plan/apply model.
 *
 * NET-NEW glue for the import prototype (04d Direction B, hybridized with C's
 * diff surface). It rebuilds NO DAG math: cycle / depth / ancestor / edge helpers
 * come READ-ONLY from `@/pages/HierarchicalAttributeAuthoring/graphModel`, and the
 * live graph + projection helpers come from `HierarchicalAttributeAuthoringV2`.
 *
 * What lives here is only the import-specific concerns the research fixed
 * (02d §9, the fail-closed / all-or-nothing / plan-apply commit spine):
 *   1. the canned upload payloads (a prototype stand-in for local-media files —
 *      no real filesystem; edge-list JSON primary, CSV fallback shape),
 *   2. parse → validate-ALL (cycle / depth / orphan / label / duplicate),
 *   3. the added / changed / removed DIFF vs. the live graph (the AC-3 surface),
 *   4. change-count copy for the explicit acknowledgement, and the idempotent
 *      "No changes" detection.
 *
 * Nothing here mutates the live graph; commit is faked (this is a prototype).
 */
import {
  edgesOf,
  depthOf,
  DEPTH_LIMIT,
  type GraphOption,
  type GraphEdge,
} from '@/pages/HierarchicalAttributeAuthoring/graphModel';
import { SEED_V2 } from '@/pages/HierarchicalAttributeAuthoringV2/graphAuthoringModel';

export type { GraphOption } from '@/pages/HierarchicalAttributeAuthoring/graphModel';

// ── The live (already-committed) graph the import plans against ─────────────────
// SEED_V2 is the 14-node Programs graph the read-only external view already shows
// (code-names only). A FIRST import plans against an EMPTY graph; a RE-IMPORT
// plans against this.
export const LIVE_GRAPH: GraphOption[] = SEED_V2;

// ── Flow vocabulary ─────────────────────────────────────────────────────────────

export type DiffKind = 'added' | 'changed' | 'removed';

export type PayloadKey = 'clean' | 'reimport' | 'violations';

export type ImportStep =
  | 'upload'
  | 'validating'
  | 'violations'
  | 'preview-first'
  | 'preview-reimport'
  | 'ack'
  | 'committing'
  | 'committed'
  | 'no-changes'
  | 'error'
  | 'stale';

// ── Raw payload (the shape a local-media file would carry) ──────────────────────

export interface RawNode {
  id: string;
  label: string;
}

export interface RawImportFile {
  filename: string;
  bytes: number;
  format: 'json' | 'csv';
  /** true when the file re-imports an already-committed graph (plans vs LIVE). */
  isReimport: boolean;
  nodes: RawNode[];
  edges: GraphEdge[];
}

/** Parse a raw file into the adjacency model. Tolerant: dangling parent refs are
 *  KEPT (as parentIds) so validate-all can flag them as orphans — we never drop
 *  bad rows silently (that would be the partial-commit anti-pattern, 02d §9). */
export function parsePayload(raw: RawImportFile): GraphOption[] {
  const parentsByChild = new Map<string, string[]>();
  for (const e of raw.edges) {
    const list = parentsByChild.get(e.childId) ?? [];
    list.push(e.parentId);
    parentsByChild.set(e.childId, list);
  }
  return raw.nodes.map((n) => ({
    id: n.id,
    label: n.label,
    parentIds: parentsByChild.get(n.id) ?? [],
    inUseCount: 0,
    policyRefCount: 0,
    source: 'uas' as const,
  }));
}

// ── Validate-all (read-only, all-or-nothing, fail-closed — 02d §9) ──────────────

export interface Violation {
  kind: 'cycle' | 'depth' | 'orphan' | 'label' | 'duplicate';
  /** The offending edge/node, named structurally (FR-A8: actionable, no truncation). */
  message: string;
}

/** Find one directed cycle in the payload (parent→child edges), as a label path. */
function findCyclePath(options: GraphOption[]): string[] | null {
  const byId = new Map(options.map((o) => [o.id, o]));
  const children = new Map<string, string[]>();
  for (const o of options) {
    for (const p of o.parentIds) {
      if (!byId.has(p)) continue; // dangling handled by orphan check
      const list = children.get(p) ?? [];
      list.push(o.id);
      children.set(p, list);
    }
  }
  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map<string, number>();
  const stack: string[] = [];

  const labelOf = (id: string) => byId.get(id)?.label ?? id;

  const dfs = (id: string): string[] | null => {
    color.set(id, GRAY);
    stack.push(id);
    for (const c of children.get(id) ?? []) {
      const state = color.get(c) ?? WHITE;
      if (state === GRAY) {
        const from = stack.indexOf(c);
        return [...stack.slice(from), c].map(labelOf);
      }
      if (state === WHITE) {
        const found = dfs(c);
        if (found) return found;
      }
    }
    stack.pop();
    color.set(id, BLACK);
    return null;
  };

  for (const o of options) {
    if ((color.get(o.id) ?? WHITE) === WHITE) {
      const found = dfs(o.id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Validate the WHOLE payload read-only. Returns EVERY violation (not first-error,
 * 02d §4) so the operator can fix the source file in one pass. Any non-empty
 * result rejects the entire import (all-or-nothing).
 */
export function validateAll(options: GraphOption[]): Violation[] {
  const out: Violation[] = [];
  const ids = new Set(options.map((o) => o.id));

  // label present
  for (const o of options) {
    if (!o.label || o.label.trim().length === 0) {
      out.push({
        kind: 'label',
        message: `Missing label — value “${o.id}” has no name. Every value must be labelled.`,
      });
    }
  }

  // duplicate labels (case-insensitive) — a re-parent hides behind a name clash
  const byLabel = new Map<string, string[]>();
  for (const o of options) {
    const key = o.label.trim().toLowerCase();
    if (!key) continue;
    const list = byLabel.get(key) ?? [];
    list.push(o.id);
    byLabel.set(key, list);
  }
  for (const [, group] of byLabel) {
    if (group.length > 1) {
      const label = options.find((o) => o.id === group[0])!.label;
      out.push({
        kind: 'duplicate',
        message: `Duplicate label — “${label}” is used by ${group.length} values (${group.join(', ')}). Labels must be unique.`,
      });
    }
  }

  // orphan — a parent reference that points at a value not present in the file
  for (const o of options) {
    for (const p of o.parentIds) {
      if (!ids.has(p)) {
        out.push({
          kind: 'orphan',
          message: `Orphan parent — “${o.label}” lists parent “${p}”, which is not defined in this file.`,
        });
      }
    }
  }

  // cycle — a value that is its own ancestor
  const cycle = findCyclePath(options);
  if (cycle) {
    out.push({
      kind: 'cycle',
      message: `Cycle — “${cycle.join(' → ')}” makes ${cycle[0]} its own ancestor.`,
    });
  }

  // depth — over the configured limit (defensive; won't trip at demo scale)
  if (!cycle) {
    for (const o of options) {
      const d = depthOf(options, o.id);
      if (d > DEPTH_LIMIT) {
        out.push({
          kind: 'depth',
          message: `Depth — “${o.label}” lands at depth ${d}; the limit is ${DEPTH_LIMIT}.`,
        });
      }
    }
  }

  return out;
}

// ── Diff (added / changed / removed vs. live — 02d §2, the AC-3 surface) ────────

export interface EdgeDiff {
  status: DiffKind; // added | removed (edges are never "changed" — they exist or not)
  parentId: string;
  childId: string;
  parentLabel: string;
  childLabel: string;
}

export interface NodeDiff {
  status: DiffKind;
  id: string;
  label: string;
  /** Human phrase of the parent change, for the changed subset. */
  detail?: string;
}

export interface GraphDiff {
  /** Full result graph (what commits) — unchanged + added + changed nodes. */
  next: GraphOption[];
  /** Removed nodes (present in live, gone in next) — rendered as tree ghosts. */
  removedNodes: GraphOption[];
  /** Per-node status for the tree badge layer (present nodes only). */
  nodeStatus: Map<string, DiffKind>;
  edgeDiffs: EdgeDiff[]; // added + removed edges
  addedEdgeCount: number;
  removedEdgeCount: number;
  reparentedNodeCount: number; // "changed" nodes
  addedNodeCount: number;
  removedNodeCount: number;
  unchangedEdgeCount: number;
  nodeDiffs: NodeDiff[]; // added/changed/removed nodes, for the lineage table
  isNoChange: boolean;
}

const edgeKey = (e: GraphEdge) => `${e.parentId} ${e.childId}`;

export function computeDiff(
  live: GraphOption[],
  next: GraphOption[],
): GraphDiff {
  const liveById = new Map(live.map((o) => [o.id, o]));
  const nextById = new Map(next.map((o) => [o.id, o]));
  const labelOf = (id: string) =>
    nextById.get(id)?.label ?? liveById.get(id)?.label ?? id;

  const liveEdges = edgesOf(live);
  const nextEdges = edgesOf(next);
  const liveEdgeSet = new Set(liveEdges.map(edgeKey));
  const nextEdgeSet = new Set(nextEdges.map(edgeKey));

  const edgeDiffs: EdgeDiff[] = [];
  let addedEdgeCount = 0;
  let removedEdgeCount = 0;
  let unchangedEdgeCount = 0;

  for (const e of nextEdges) {
    if (!liveEdgeSet.has(edgeKey(e))) {
      edgeDiffs.push({
        status: 'added',
        parentId: e.parentId,
        childId: e.childId,
        parentLabel: labelOf(e.parentId),
        childLabel: labelOf(e.childId),
      });
      addedEdgeCount++;
    } else {
      unchangedEdgeCount++;
    }
  }
  for (const e of liveEdges) {
    if (!nextEdgeSet.has(edgeKey(e))) {
      edgeDiffs.push({
        status: 'removed',
        parentId: e.parentId,
        childId: e.childId,
        parentLabel: labelOf(e.parentId),
        childLabel: labelOf(e.childId),
      });
      removedEdgeCount++;
    }
  }

  // Node status
  const nodeStatus = new Map<string, DiffKind>();
  const nodeDiffs: NodeDiff[] = [];
  const removedNodes: GraphOption[] = [];

  const parentSet = (o: GraphOption | undefined) =>
    new Set(o?.parentIds ?? []);
  const sameParents = (a: GraphOption, b: GraphOption) => {
    const sa = parentSet(a);
    const sb = parentSet(b);
    if (sa.size !== sb.size) return false;
    for (const p of sa) if (!sb.has(p)) return false;
    return true;
  };

  let addedNodeCount = 0;
  let reparentedNodeCount = 0;

  for (const o of next) {
    const prev = liveById.get(o.id);
    if (!prev) {
      nodeStatus.set(o.id, 'added');
      addedNodeCount++;
      nodeDiffs.push({
        status: 'added',
        id: o.id,
        label: o.label,
        detail: describeParents(o, next),
      });
    } else if (!sameParents(prev, o)) {
      nodeStatus.set(o.id, 'changed');
      reparentedNodeCount++;
      nodeDiffs.push({
        status: 'changed',
        id: o.id,
        label: o.label,
        detail: describeReparent(prev, o, live, next),
      });
    }
  }

  for (const o of live) {
    if (!nextById.has(o.id)) {
      removedNodes.push(o);
      nodeDiffs.push({
        status: 'removed',
        id: o.id,
        label: o.label,
        detail: 'Removed from the graph — all of its edges are dropped.',
      });
    }
  }

  const removedNodeCount = removedNodes.length;

  const isNoChange =
    addedEdgeCount === 0 &&
    removedEdgeCount === 0 &&
    addedNodeCount === 0 &&
    removedNodeCount === 0;

  return {
    next,
    removedNodes,
    nodeStatus,
    edgeDiffs,
    addedEdgeCount,
    removedEdgeCount,
    reparentedNodeCount,
    addedNodeCount,
    removedNodeCount,
    unchangedEdgeCount,
    nodeDiffs,
    isNoChange,
  };
}

function describeParents(o: GraphOption, all: GraphOption[]): string {
  const byId = new Map(all.map((x) => [x.id, x]));
  if (o.parentIds.length === 0) return 'New top-level value.';
  const names = o.parentIds.map((p) => byId.get(p)?.label ?? p);
  return `New value under ${names.join(', ')}.`;
}

function describeReparent(
  prev: GraphOption,
  next: GraphOption,
  live: GraphOption[],
  nextAll: GraphOption[],
): string {
  const liveById = new Map(live.map((x) => [x.id, x]));
  const nextById = new Map(nextAll.map((x) => [x.id, x]));
  const prevSet = new Set(prev.parentIds);
  const nextSet = new Set(next.parentIds);
  const added = next.parentIds
    .filter((p) => !prevSet.has(p))
    .map((p) => nextById.get(p)?.label ?? p);
  const removed = prev.parentIds
    .filter((p) => !nextSet.has(p))
    .map((p) => liveById.get(p)?.label ?? p);
  const parts: string[] = [];
  if (added.length) parts.push(`now under ${added.join(', ')}`);
  if (removed.length) parts.push(`no longer under ${removed.join(', ')}`);
  return `Re-parented — ${parts.join('; ')}.`;
}

/** Ack copy that NAMES the change counts (never a one-click apply — F-5). */
export function ackSummary(diff: GraphDiff): string {
  const bits: string[] = [];
  bits.push(`${diff.addedEdgeCount} added`);
  bits.push(`${diff.reparentedNodeCount} re-parented`);
  bits.push(`${diff.removedEdgeCount} removed`);
  return bits.join(', ');
}

// ── Canned payloads (prototype stand-in for local-media files) ──────────────────

function edgesFrom(options: GraphOption[]): GraphEdge[] {
  return edgesOf(options);
}

function nodesFrom(options: GraphOption[]): RawNode[] {
  return options.map((o) => ({ id: o.id, label: o.label }));
}

/** (a) CLEAN first import — the full 14-value Programs graph, valid. */
export const CLEAN_FILE: RawImportFile = {
  filename: 'programs.json',
  bytes: 6_214,
  format: 'json',
  isReimport: false,
  nodes: nodesFrom(SEED_V2),
  edges: edgesFrom(SEED_V2),
};

/**
 * (b) RE-IMPORT of the current live graph with a few real changes:
 *   • ADDED  — “Sentinel Cell” under Joint Command ▸ Operation Aurora (+node, +edge)
 *   • CHANGED — “Mission Casper” re-parented Dragon Spacecraft → Deepwater Patrol
 *              (the single AC-3-critical edge: −1 edge, +1 edge, one “changed” node)
 *   • REMOVED — “JTF Sentinel” deleted entirely (−node, −3 edges)
 */
const REIMPORT_OPTIONS: GraphOption[] = buildReimport();
function buildReimport(): GraphOption[] {
  const next = SEED_V2
    // remove JTF Sentinel entirely
    .filter((o) => o.id !== 'sentinel')
    // re-parent Mission Casper: Dragon Spacecraft → Deepwater Patrol
    .map((o) =>
      o.id === 'casper'
        ? { ...o, parentIds: ['raptor', 'deepwater'] }
        : { ...o },
    );
  // add Sentinel Cell under Operation Aurora
  next.push({
    id: 'scell',
    label: 'Sentinel Cell',
    parentIds: ['aurora'],
    inUseCount: 0,
    policyRefCount: 0,
    source: 'uas',
  });
  return next;
}

export const REIMPORT_FILE: RawImportFile = {
  filename: 'programs-2026Q3.json',
  bytes: 6_098,
  format: 'json',
  isReimport: true,
  nodes: nodesFrom(REIMPORT_OPTIONS),
  edges: edgesFrom(REIMPORT_OPTIONS),
};

/**
 * (c) VIOLATIONS — a payload that fails validate-all with THREE distinct problems
 * so the violations phase can prove it lists EVERY one (not first-error):
 *   • CYCLE     — Air Operations → Falcon Wing → Raptor Flight → Air Operations
 *   • DUPLICATE — two values both labelled “Raptor Flight”
 *   • ORPHAN    — “Orbital Node” lists a parent (“phantom”) not defined in the file
 */
export const VIOLATIONS_FILE: RawImportFile = {
  filename: 'programs-draft.json',
  bytes: 1_842,
  format: 'json',
  isReimport: false,
  nodes: [
    { id: 'air', label: 'Air Operations' },
    { id: 'falcon', label: 'Falcon Wing' },
    { id: 'raptor', label: 'Raptor Flight' },
    { id: 'raptor2', label: 'Raptor Flight' }, // duplicate label
    { id: 'orbital-node', label: 'Orbital Node' },
  ],
  edges: [
    { parentId: 'air', childId: 'falcon' },
    { parentId: 'falcon', childId: 'raptor' },
    { parentId: 'raptor', childId: 'air' }, // cycle back to air
    { parentId: 'falcon', childId: 'raptor2' },
    { parentId: 'phantom', childId: 'orbital-node' }, // orphan parent
  ],
};

export const PAYLOADS: Record<PayloadKey, RawImportFile> = {
  clean: CLEAN_FILE,
  reimport: REIMPORT_FILE,
  violations: VIOLATIONS_FILE,
};

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}
