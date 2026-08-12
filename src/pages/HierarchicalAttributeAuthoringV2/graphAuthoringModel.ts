/**
 * Graph (Hierarchical) attribute type — RD-C "Anchor + Reference Stubs" model.
 *
 * NET-NEW glue for the RD-C authoring prototype. It does NOT rebuild the DAG
 * math — it re-uses `../HierarchicalAttributeAuthoring/graphModel` verbatim
 * (`descendantsOf` / `wouldCreateCycle` / `childrenOf` / `validateAddParent`
 * / `labelOf` / `optionMap`). What lives here is only:
 *
 *  - the trimmed Programs Programs seed (04b §5, code-names only), and
 *  - the anchor/stub PROJECTION helpers that turn the adjacency list into the
 *    indented tree the base surface renders (anchor edge = tree spine;
 *    additional edges = read-only reference stubs).
 *
 * The store stays an adjacency list (parents/children by id). The tree is a
 * projection of it — never a second source of truth.
 */
import type { ColoredRankedInputScheme } from '@/components/ui/ColoredRankedInputChip/ColoredRankedInputChip';
import type { HubAttribute } from '@/pages/AttributeManagementHub/hubData';
import { defaultAccessModel } from '@/pages/AttributeManagementHub/hubData';
import {
  childrenOf,
  labelOf,
  optionMap,
  type GraphOption,
} from '@/pages/HierarchicalAttributeAuthoring/graphModel';

export {
  ancestorsOf,
  childrenOf,
  descendantsOf,
  labelOf,
  optionMap,
  parentsOf,
  validateAddParent,
  wouldCreateCycle,
  type GraphOption,
  type ParentRejection,
} from '@/pages/HierarchicalAttributeAuthoring/graphModel';

/**
 * Bake-off UI dimension (04c §1). All three approaches share the SAME adjacency
 * model, popover, progressive-disclosure toggle, cycle safety and delete gate —
 * they differ ONLY in how a 2nd+ parent is REPRESENTED in the tree:
 *   • 'stubs'  — GA-0 control: extra parents render as read-only reference rows.
 *   • 'chips'  — GA-1: node appears once; extra parents are chips on its own row.
 *   • 'hybrid' — GA-4: chips by default + an on-demand spatial peek that
 *                transiently materializes ONE node's stubs under its other parents.
 * Neutral reviewer labels live in the demo band; codenames never leak to product
 * chrome.
 */
export type UiApproach = 'stubs' | 'chips' | 'hybrid';

/**
 * The additional (non-anchor) parents of an option — parentIds[1..] resolved to
 * options, in declared order. Drives the chip strip (GA-1/GA-4) and the peek
 * (GA-4). Empty for a single-parent node or a root.
 */
export function additionalParentsOf(
  options: GraphOption[],
  option: GraphOption,
): GraphOption[] {
  const anchorId = anchorParentIdOf(option);
  const map = optionMap(options);
  return option.parentIds
    .filter((p) => p !== anchorId)
    .map((p) => map.get(p))
    .filter((o): o is GraphOption => o != null);
}

// ── Trimmed Programs seed (04b §5 — Programs nodes, code-names only) ────────────────
// Anchor parent is ALWAYS parentIds[0]. Two genuine multi-parent nodes:
//   • Mission Casper — Raptor Flight (anchor) ∧ Dragon Spacecraft (stub)
//   • JTF Sentinel   — Operation Aurora (anchor) ∧ Deepwater Patrol, Northern
//                      Command (stubs) → a 3-parent node.
function o(id: string, label: string, parentIds: string[]): GraphOption {
  return { id, label, parentIds, inUseCount: 0, policyRefCount: 0, source: 'manual' };
}

export const SEED_V2: GraphOption[] = [
  // Air Operations ▸ Falcon Wing ▸ Raptor Flight
  o('air', 'Air Operations', []),
  o('falcon', 'Falcon Wing', ['air']),
  o('raptor', 'Raptor Flight', ['falcon']),
  // Maritime Operations ▸ Trident Fleet ▸ Deepwater Patrol
  o('maritime', 'Maritime Operations', []),
  o('trident', 'Trident Fleet', ['maritime']),
  o('deepwater', 'Deepwater Patrol', ['trident']),
  // Space Operations ▸ Orbital Watch ▸ Dragon Spacecraft
  o('space', 'Space Operations', []),
  o('orbital', 'Orbital Watch', ['space']),
  o('dragon', 'Dragon Spacecraft', ['orbital']),
  // Sibling of the Mission Casper stub under Dragon — lets stub reorder be demoable.
  o('cargo', 'Cargo Resupply', ['dragon']),
  // Joint Command ▸ Operation Aurora
  o('joint', 'Joint Command', []),
  o('aurora', 'Operation Aurora', ['joint']),
  // Northern Command (root; only child is the JTF Sentinel stub)
  o('northcom', 'Northern Command', []),
  // Genuine multi-parent nodes
  o('casper', 'Mission Casper', ['raptor', 'dragon']),
  o('sentinel', 'JTF Sentinel', ['aurora', 'deepwater', 'northcom']),
];

// ── Color scheme per root family (theme banner schemes only, never hex) ────────
const FAMILY_SCHEME: Record<string, ColoredRankedInputScheme> = {
  air: 'blue',
  falcon: 'blue',
  raptor: 'blue',
  maritime: 'green',
  trident: 'green',
  deepwater: 'green',
  space: 'purple',
  orbital: 'purple',
  dragon: 'purple',
  cargo: 'purple',
  joint: 'orange',
  aurora: 'orange',
  northcom: 'red',
  casper: 'neutral',
  sentinel: 'neutral',
};

export function schemeOf(id: string): ColoredRankedInputScheme {
  return FAMILY_SCHEME[id] ?? 'plain';
}

// ── Anchor / stub projection ───────────────────────────────────────────────────

/** The anchor (primary) parent of an option = its first-declared parent. */
export function anchorParentIdOf(option: GraphOption): string | null {
  return option.parentIds[0] ?? null;
}

/**
 * When an option is rendered UNDER `viaParentId`, is that occurrence a read-only
 * reference stub? True for every parent except the anchor (first) parent.
 */
export function isStubOccurrence(
  option: GraphOption,
  viaParentId: string | null,
): boolean {
  if (viaParentId == null) return false; // roots are never stubs
  return anchorParentIdOf(option) !== viaParentId;
}

export function anchorParentLabel(
  options: GraphOption[],
  option: GraphOption,
): string {
  const anchorId = anchorParentIdOf(option);
  if (anchorId == null) return 'the top level';
  return labelOf(options, anchorId);
}

/** Options with no parents — the tree roots. */
export function rootOptions(options: GraphOption[]): GraphOption[] {
  return options.filter((opt) => opt.parentIds.length === 0);
}

/** Children rendered under `parentId`, seed order preserved. */
export function childRows(
  options: GraphOption[],
  parentId: string,
): GraphOption[] {
  return childrenOf(options, parentId);
}

/**
 * Reorder `draggedId` among children of `parentId` so it takes `targetId`'s
 * place in the sibling list. Preserves non-sibling positions in the adjacency
 * array. Used for drag-reorder of reference stubs (and any sibling) under a
 * shared parent without changing parent edges.
 */
export function reorderChildAmongSiblings(
  options: GraphOption[],
  parentId: string,
  draggedId: string,
  targetId: string,
): GraphOption[] {
  if (draggedId === targetId) return options;

  const sibIndices: number[] = [];
  const sibIds: string[] = [];
  options.forEach((o, i) => {
    if (o.parentIds.includes(parentId)) {
      sibIndices.push(i);
      sibIds.push(o.id);
    }
  });

  const from = sibIds.indexOf(draggedId);
  let to = sibIds.indexOf(targetId);
  if (from < 0 || to < 0) return options;

  const nextSibIds = sibIds.slice();
  nextSibIds.splice(from, 1);
  if (from < to) to -= 1;
  nextSibIds.splice(to, 0, draggedId);

  const byId = optionMap(options);
  const next = options.slice();
  sibIndices.forEach((globalIdx, i) => {
    const replacement = byId.get(nextSibIds[i]);
    if (replacement) next[globalIdx] = replacement;
  });
  return next;
}

/**
 * Structural delete gate (VP-1). Per 04b, per-VALUE policy references are CUT,
 * so the ONLY reasons a delete is blocked are structural:
 *   1. the option has nested (child) options → re-parent them first, and/or
 *   2. the option also appears under other parents (stubs elsewhere) → those
 *      references must be removed first.
 *
 * [VERIFY WITH PM] VP-1 — if a membership policy can ever name a LITERAL value
 * (e.g. covers "Dragon Spacecraft") this gate would gain a second, policy-ref
 * reason. Current assumption: NO — policies reference the attribute only. Do
 * not re-introduce a per-value `policyRefCount` reason without confirming VP-1.
 */
export function structuralDeleteBlock(
  options: GraphOption[],
  id: string,
): string | null {
  const opt = optionMap(options).get(id);
  if (!opt) return null;
  const kids = childrenOf(options, id);
  if (kids.length > 0) {
    return `“${opt.label}” has ${kids.length} nested ${
      kids.length === 1 ? 'option' : 'options'
    } — re-parent or remove them before deleting.`;
  }
  if (opt.parentIds.length > 1) {
    return `“${opt.label}” also appears under ${opt.parentIds.length - 1} other ${
      opt.parentIds.length - 1 === 1 ? 'parent' : 'parents'
    } — remove those references first.`;
  }
  return null;
}

// ── Reused base fixtures for the surrounding product shell ──────────────────────
// A real HubAttribute so the base "Who can edit" picker composes unchanged and
// the surface reads as the same product page. The Options tree itself is driven
// by the adjacency list above, not by this attribute's `values`.
export const PROGRAM_ATTRIBUTE: HubAttribute = {
  id: 'program',
  name: 'Program',
  type: 'Multiselect',
  description: '',
  values: [],
  source: { kind: 'manual' },
  appliesTo: [],
  usedByPolicies: 3,
  policyNames: [
    'Program access',
    'Cross-command coordination',
    'JTF Sentinel coordination',
  ],
  access: defaultAccessModel('Security Administrators'),
  readIntoFiltering: false,
};

export const PROGRAM_EDITORS = {
  roles: [
    { subject: 'Security Administrators', owner: true },
    { subject: 'Program Security Officers' },
  ],
  users: [] as { subject: string; owner?: boolean }[],
};

export function newOptionId(): string {
  return `opt-${Date.now()}-${Math.round(Math.random() * 1e4)}`;
}
