/**
 * External (read-only) hierarchical attribute — view/filter/mask glue.
 *
 * NET-NEW for the read-only external prototype. It rebuilds NOTHING: the DAG
 * math, seed, projection helpers (anchor/stub) and colors are imported READ-ONLY
 * from the authoring-v2 model. What lives here is only the concerns that are
 * unique to a VIEWER surface for an externally-managed attribute:
 *
 *   1. which values are NOT accessible to the current viewer (the demo subset),
 *   2. the two non-accessible presentations — `masked` (position kept, identity
 *      suppressed) vs `hidden` (omitted entirely), and
 *   3. filtering that narrows to matches while keeping their ANCESTORS for path
 *      context.
 *
 * The store is still the imported adjacency list; nothing here mutates it.
 */
import {
  SEED_V2,
  ancestorsOf,
  type GraphOption,
} from '@/pages/HierarchicalAttributeAuthoringV2/graphAuthoringModel';

/** The external system that owns and syncs this attribute (product-facing). */
export const EXTERNAL_SOURCE = 'Unified Attribute Service';

/** How a non-accessible value is presented. Orthogonal to `?state=`. */
export type MaskMode = 'masked' | 'hidden';

/**
 * Demo subset NOT accessible to the current viewer (04b §3): one leaf +
 * two mid-branch nodes across two families.
 *   • casper    — leaf, genuine multi-parent (anchor under Raptor Flight, stub
 *                 under Dragon Spacecraft) → exercises masking in BOTH positions.
 *   • deepwater — mid-branch (Maritime ▸ Trident ▸ Deepwater Patrol); also hosts
 *                 the JTF Sentinel stub → exercises subtree suppression.
 *   • dragon    — mid-branch (Space ▸ Orbital Watch ▸ Dragon Spacecraft); hosts
 *                 the Mission Casper stub.
 * These are viewer-scoped in a real system; hard-coded here for the demo only.
 */
export const RESTRICTED_IDS: ReadonlySet<string> = new Set([
  'casper',
  'deepwater',
  'dragon',
]);

export function isRestricted(id: string): boolean {
  return RESTRICTED_IDS.has(id);
}

export { SEED_V2 };

export interface VisibilityInput {
  filter: string;
  /** true when restricted values are OMITTED (hidden mode OR "my-accessible only"). */
  effectiveHidden: boolean;
}

export interface VisibilityResult {
  /** Every option id that may render at all (as itself or a masked placeholder). */
  visibleIds: Set<string>;
  /** Ids that literally match the active filter (accessible only). Empty = no filter. */
  matchIds: Set<string>;
  /** true when a filter is active. */
  filtering: boolean;
}

/**
 * Compute which option ids are visible under the current filter + mask mode.
 *
 *  - No filter → every value is visible (restricted ones are dropped only in
 *    `effectiveHidden`); matches are empty.
 *  - Filter → matches are ACCESSIBLE values whose label contains the term
 *    (restricted labels can never match — their identity is suppressed), plus
 *    each match's ancestors so the hierarchy path stays intact. In hidden mode,
 *    restricted ancestors are dropped from the visible set (structure loss is
 *    hidden mode's documented trade-off).
 */
export function computeVisibility(
  options: GraphOption[],
  { filter, effectiveHidden }: VisibilityInput,
): VisibilityResult {
  const term = filter.trim().toLowerCase();

  if (term.length === 0) {
    const visibleIds = new Set<string>();
    for (const o of options) {
      if (effectiveHidden && isRestricted(o.id)) continue;
      visibleIds.add(o.id);
    }
    return { visibleIds, matchIds: new Set(), filtering: false };
  }

  const matchIds = new Set<string>();
  for (const o of options) {
    if (isRestricted(o.id)) continue; // suppressed identity never matches
    if (o.label.toLowerCase().includes(term)) matchIds.add(o.id);
  }

  const visibleIds = new Set<string>(matchIds);
  for (const id of matchIds) {
    for (const anc of ancestorsOf(options, id)) visibleIds.add(anc);
  }
  if (effectiveHidden) {
    for (const id of [...visibleIds]) {
      if (isRestricted(id)) visibleIds.delete(id);
    }
  }
  return { visibleIds, matchIds, filtering: true };
}
