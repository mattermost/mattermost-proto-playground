/**
 * Hierarchical (graph) attribute — ACCESS / COVERAGE explainer model.
 *
 * NET-NEW glue only. It rebuilds no DAG math: `covers`, `ancestorsOf`,
 * `descendantsOf`, `childrenOf`, `parentsOf`, `reachabilityCoversAll` and
 * `labelOf` are imported READ-ONLY from
 * `@/pages/HierarchicalAttributeAuthoring/graphModel`, the structural seed from
 * `@/pages/HierarchicalAttributeAuthoringV2/graphAuthoringModel` (SEED_V2), and
 * path enumeration from `@/pages/HierarchicalAttributeNonTree/nonTreeModel`
 * (`pathsTo`, `longestDepth`). Nothing here mutates any of them.
 *
 * What lives here is only what an ACCESS EXPLAINER needs and no existing
 * prototype has:
 *
 *   1. Usage numbers on the seed. `GraphOption` already carries `inUseCount`
 *      (resources carrying the value) and `policyRefCount` (active policies
 *      referencing it); SEED_V2 zeroes both and no surface renders them. We
 *      layer plausible non-zero values on by id, keeping SEED_V2 as the single
 *      structural source of truth.
 *   2. Viewer SCOPING. `viewerScopeIds` + `scopeGraph` produce the subgraph a
 *      given viewer is allowed to know about, and every downstream computation
 *      (layout, paths, coverage, table) runs on that subgraph. A value outside
 *      the scope is not "hidden by CSS" — it is absent from the data structure,
 *      so it cannot leak through a label, an edge, a path, or a count.
 *   3. The access-explanation SENTENCES, in both directions (what a value
 *      grants; who can already reach it), plus the incomparability sentence.
 *
 * SECURITY POSTURE (mirrored from the reference implementation's shortcoming):
 * the standalone Three.js demo this page re-houses builds the whole lattice in
 * the browser and runs covers() client-side. Value names plus relationships are
 * a compartmentation map. In the real implementation the scope set and the
 * coverage answer are computed SERVER-SIDE and only the viewer's subgraph is
 * ever serialised to the client. `scopeGraph` is the client-side stand-in for
 * that server boundary — treat its output as "everything the client is allowed
 * to receive", never as a filter over a full graph the client already holds.
 */
import {
  ancestorsOf,
  descendantsOf,
  labelOf,
  optionMap,
  type GraphOption,
} from '@/pages/HierarchicalAttributeAuthoring/graphModel';
import { SEED_V2 } from '@/pages/HierarchicalAttributeAuthoringV2/graphAuthoringModel';
import { pathsTo } from '@/pages/HierarchicalAttributeNonTree/nonTreeModel';

// Re-export the shared math verbatim so this page has one import surface.
export {
  ancestorsOf,
  childrenOf,
  covers,
  descendantsOf,
  labelOf,
  optionMap,
  parentsOf,
  reachabilityCoversAll,
  type GraphOption,
} from '@/pages/HierarchicalAttributeAuthoring/graphModel';
export {
  familyColorVar,
  longestDepth,
  pathsTo,
} from '@/pages/HierarchicalAttributeNonTree/nonTreeModel';

// ── Usage numbers layered onto the shared seed ────────────────────────────────
// [inUseCount, policyRefCount] — plausible demo figures for a dozens-scale
// programs deployment. Roots carry few direct resources (people are usually
// tagged with a specific programme, not the whole command); mid-branch values
// carry the most.
const USAGE: Record<string, readonly [number, number]> = {
  air: [4, 3],
  falcon: [12, 3],
  raptor: [7, 1],
  maritime: [6, 2],
  trident: [11, 2],
  deepwater: [5, 1],
  space: [3, 2],
  orbital: [8, 1],
  dragon: [6, 2],
  joint: [9, 4],
  aurora: [14, 3],
  northcom: [5, 2],
  casper: [3, 1],
  sentinel: [8, 2],
};

/**
 * The Programs graph with usage numbers. Structure (ids, labels, parentIds) is
 * SEED_V2 verbatim — 14 values, 5 roots, two genuine multi-parent nodes
 * (Mission Casper: Raptor Flight ∧ Dragon Spacecraft; JTF Sentinel: Operation
 * Aurora ∧ Deepwater Patrol ∧ Northern Command).
 */
export const ACCESS_SEED: GraphOption[] = SEED_V2.map((o) => {
  const [inUseCount, policyRefCount] = USAGE[o.id] ?? [0, 0];
  return { ...o, inUseCount, policyRefCount };
});

export const ATTRIBUTE_NAME = 'Program';

// ── Viewer ────────────────────────────────────────────────────────────────────

export type ViewerKind = 'admin' | 'member';

/** The signed-in member for the end-user variant. */
export const VIEWER_DISPLAY_NAME = 'Leonard Riley';
export const VIEWER_USERNAME = 'leonard.riley';

/**
 * The values the member viewer holds. Deliberately a MID-TREE value so the
 * down-set is a genuine proper subset (3 of 14) and the masking is observable:
 * Trident Fleet ▸ Deepwater Patrol ▸ JTF Sentinel.
 */
export const VIEWER_HELD_IDS: readonly string[] = ['trident'];

/**
 * Everything the viewer may know about: the values they hold plus everything
 * those values cover (their down-set). Ancestors are NOT included — an ancestor
 * grants access to the viewer's values but the viewer has no need-to-know that
 * it exists.
 */
export function viewerScopeIds(
  options: GraphOption[],
  heldIds: readonly string[],
): Set<string> {
  const scope = new Set<string>();
  for (const id of heldIds) {
    if (!optionMap(options).has(id)) continue;
    scope.add(id);
    for (const d of descendantsOf(options, id)) scope.add(d);
  }
  return scope;
}

/**
 * Project the graph down to `visibleIds`. Values outside the set are dropped
 * entirely, and every surviving value's parent pointers are filtered to the set
 * — so an out-of-scope parent leaves no residue: no edge, no stub, no count.
 *
 * This is the ONLY way the member variant gets its data. See the module header:
 * in production this projection happens on the server.
 */
export function scopeGraph(
  options: GraphOption[],
  visibleIds: ReadonlySet<string>,
): GraphOption[] {
  return options
    .filter((o) => visibleIds.has(o.id))
    .map((o) => ({
      ...o,
      parentIds: o.parentIds.filter((p) => visibleIds.has(p)),
    }));
}

// ── Coverage ──────────────────────────────────────────────────────────────────

export interface CoverageResult {
  id: string;
  label: string;
  /** Self + every descendant — the set a holder of `id` reaches. */
  coveredIds: Set<string>;
  /** Descendants only, in stable graph order. What holding `id` grants. */
  grantsIds: string[];
  /** Ancestors, in stable graph order. Who can already reach `id`. */
  reachableByIds: string[];
  /** Neither above nor below — the incomparable remainder. */
  unrelatedIds: string[];
  /** Sum of inUseCount across the covered set. */
  resourcesReached: number;
}

/** Order a set of ids by their position in `options` so output is stable. */
function inGraphOrder(
  options: GraphOption[],
  ids: ReadonlySet<string>,
): string[] {
  return options.filter((o) => ids.has(o.id)).map((o) => o.id);
}

export function coverageOf(
  options: GraphOption[],
  id: string,
): CoverageResult | null {
  const self = optionMap(options).get(id);
  if (!self) return null;

  const descendants = descendantsOf(options, id);
  const ancestors = ancestorsOf(options, id);
  const coveredIds = new Set<string>([id, ...descendants]);
  const unrelated = new Set<string>();
  for (const o of options) {
    if (o.id === id || descendants.has(o.id) || ancestors.has(o.id)) continue;
    unrelated.add(o.id);
  }

  let resourcesReached = 0;
  for (const o of options) {
    if (coveredIds.has(o.id)) resourcesReached += o.inUseCount;
  }

  return {
    id,
    label: self.label,
    coveredIds,
    grantsIds: inGraphOrder(options, descendants),
    reachableByIds: inGraphOrder(options, ancestors),
    unrelatedIds: inGraphOrder(options, unrelated),
    resourcesReached,
  };
}

// ── Access-explanation sentences (admin — full graph) ──────────────────────────
// Every sentence a stakeholder reads is generated here, from the model, so the
// diagram and the table can never disagree with each other or with covers().

function joinLabels(options: GraphOption[], ids: readonly string[]): string {
  return ids.map((id) => labelOf(options, id)).join(', ');
}

/** Forward direction — what you GRANT by handing someone this value. */
export function grantsSentence(
  options: GraphOption[],
  result: CoverageResult,
): string {
  const n = result.grantsIds.length;
  if (n === 0) {
    return `Holding ${result.label} grants access to no other values — nothing sits below it.`;
  }
  const word = n === 1 ? 'value' : 'values';
  return `Holding ${result.label} grants access to ${n} other ${word}: ${joinLabels(
    options,
    result.grantsIds,
  )}.`;
}

/** Reverse direction — who ALREADY reaches this value without being given it. */
export function reachableBySentence(
  options: GraphOption[],
  result: CoverageResult,
): string {
  if (result.reachableByIds.length === 0) {
    return `${result.label} is reachable only by people holding ${result.label} itself — nothing sits above it.`;
  }
  return `${result.label} is reachable by anyone holding: ${joinLabels(
    options,
    result.reachableByIds,
  )}.`;
}

/** Usage — the two counts the model already carries and nothing else renders. */
export function usageSentence(
  options: GraphOption[],
  result: CoverageResult,
): string {
  const self = optionMap(options).get(result.id);
  const inUse = self?.inUseCount ?? 0;
  const refs = self?.policyRefCount ?? 0;
  return `${result.label} is carried by ${inUse} ${
    inUse === 1 ? 'resource' : 'resources'
  } and referenced by ${refs} active ${refs === 1 ? 'policy' : 'policies'}.`;
}

/** Aggregate reach across the covered set — the "what access you have" payoff. */
export function reachSentence(result: CoverageResult): string {
  const values = result.coveredIds.size;
  return `In total, holding ${result.label} reaches ${result.resourcesReached} ${
    result.resourcesReached === 1 ? 'resource' : 'resources'
  } across ${values} ${values === 1 ? 'value' : 'values'}.`;
}

export function unrelatedSentence(result: CoverageResult): string {
  const n = result.unrelatedIds.length;
  if (n === 0) {
    return `Every other value is either above or below ${result.label}.`;
  }
  return `${n} ${n === 1 ? 'value is' : 'values are'} on branches unrelated to ${
    result.label
  } — neither grants the other.`;
}

// ── Incomparability, named ────────────────────────────────────────────────────

export type Relation = 'same' | 'above' | 'below' | 'unrelated';

export function relationOf(
  options: GraphOption[],
  aId: string,
  bId: string,
): Relation {
  if (aId === bId) return 'same';
  if (descendantsOf(options, aId).has(bId)) return 'above';
  if (ancestorsOf(options, aId).has(bId)) return 'below';
  return 'unrelated';
}

/**
 * The sentence for "is this specific other value above me, below me, or neither".
 * Different branches being incomparable is normal, not an error — the copy says
 * so in plain words rather than leaving a blank result.
 */
export function relationSentence(
  options: GraphOption[],
  aId: string,
  bId: string,
): string {
  const a = labelOf(options, aId);
  const b = labelOf(options, bId);
  switch (relationOf(options, aId, bId)) {
    case 'same':
      return `${a} and ${b} are the same value.`;
    case 'above':
      return `${a} is above ${b}. Holding ${a} grants access to ${b}.`;
    case 'below':
      return `${a} is below ${b}. Holding ${b} grants access to ${a}, but holding ${a} does not grant ${b}.`;
    case 'unrelated':
      return `${a} and ${b} are on unrelated branches. Neither grants the other.`;
  }
}

// ── Access-explanation sentences (member — scoped graph only) ──────────────────
//
// LEAK PATH BEING HONOURED HERE:
// The natural explanation for "why can I reach JTF Sentinel?" is "because
// Operation Aurora is above it" — but Operation Aurora may sit OUTSIDE the
// viewer's down-set, so naming it discloses the existence of a value the viewer
// has no need-to-know for. The masked explanation therefore names ONLY values
// inside the viewer's own scope: the value they hold, and the in-scope path from
// it down to the target. Ancestors outside the scope are not named, not counted,
// not hinted at. These functions take the SCOPED graph precisely so that an
// out-of-scope label is not reachable from here even by mistake.

/** "You hold Trident Fleet." */
export function heldSentence(
  options: GraphOption[],
  heldIds: readonly string[],
): string {
  const labels = heldIds.map((id) => labelOf(options, id));
  if (labels.length === 0) return 'You do not hold any programs yet.';
  if (labels.length === 1) return `You hold ${labels[0]}.`;
  const last = labels[labels.length - 1];
  return `You hold ${labels.slice(0, -1).join(', ')} and ${last}.`;
}

/**
 * "Trident Fleet gives you access to 2 more values: Deepwater Patrol, JTF
 * Sentinel." The count is of values SHOWN, never of values withheld.
 */
export function memberReachSentence(
  scoped: GraphOption[],
  heldIds: readonly string[],
): string {
  const held = new Set(heldIds);
  const extra = scoped.filter((o) => !held.has(o.id));
  const heldLabels = heldIds.map((id) => labelOf(scoped, id)).join(', ');
  if (extra.length === 0) {
    return `${heldLabels} does not give you access to any other values.`;
  }
  const word = extra.length === 1 ? 'value' : 'values';
  return `${heldLabels} gives you access to ${extra.length} more ${word}: ${extra
    .map((o) => o.label)
    .join(', ')}.`;
}

/**
 * Per-value "why can I reach this". Masked by construction: the only value it
 * ever names besides the target is one the viewer HOLDS.
 */
export function memberWhySentence(
  scoped: GraphOption[],
  id: string,
  heldIds: readonly string[],
): string {
  const label = labelOf(scoped, id);
  if (heldIds.includes(id)) {
    return `You can reach ${label} because you hold it.`;
  }
  const scopedAncestors = ancestorsOf(scoped, id);
  const via = heldIds.filter((h) => scopedAncestors.has(h));
  if (via.length === 0) {
    // Defensive: the scope is built from the held set, so this cannot happen.
    return `You can reach ${label} through a value you hold.`;
  }
  const viaLabels = via.map((h) => labelOf(scoped, h)).join(', ');
  return `You can reach ${label} because you hold ${viaLabels}, which is above it.`;
}

/** The standing notice that the view is scoped — no totals, no "+N more". */
export const MEMBER_MASK_NOTICE =
  'This page shows the programs you can reach and nothing else. Programs outside your access are not listed, not counted, and not referenced anywhere on this page.';

// ── Lineage / path table rows (the text equivalent, both variants) ─────────────

export interface LineageRow {
  id: string;
  label: string;
  /** Every path down to this value, as label arrays. Multi-parent → >1 path. */
  paths: string[][];
  /** Labels this value grants access to (its descendants). */
  grants: string[];
  /** Labels that grant access to this value (its in-scope ancestors). */
  reachableBy: string[];
  /** Present for the admin variant only — see `lineageRows`. */
  inUseCount?: number;
  policyRefCount?: number;
  /** True when the member viewer holds this value directly. */
  held: boolean;
}

/**
 * One row per value, carrying exactly what the diagram carries: paths in, what
 * it grants, what grants it. Run against the SCOPED graph, so the member
 * variant's rows can only ever cite in-scope labels.
 *
 * `withUsage` is false for the member variant on purpose: `inUseCount` counts
 * resources the viewer may not be able to see, so publishing it would be a
 * total-of-something-withheld — the exact thing absolute count suppression
 * forbids.
 */
export function lineageRows(
  options: GraphOption[],
  opts: { heldIds?: readonly string[]; withUsage: boolean },
): LineageRow[] {
  const held = new Set(opts.heldIds ?? []);
  return options.map((o) => {
    const grants = inGraphOrder(options, descendantsOf(options, o.id)).map(
      (id) => labelOf(options, id),
    );
    const reachableBy = inGraphOrder(options, ancestorsOf(options, o.id)).map(
      (id) => labelOf(options, id),
    );
    return {
      id: o.id,
      label: o.label,
      paths: pathsTo(options, o.id),
      grants,
      reachableBy,
      inUseCount: opts.withUsage ? o.inUseCount : undefined,
      policyRefCount: opts.withUsage ? o.policyRefCount : undefined,
      held: held.has(o.id),
    };
  });
}
