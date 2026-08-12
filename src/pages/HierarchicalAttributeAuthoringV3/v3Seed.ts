/**
 * V3 seed data.
 *
 * The Programs graph is the primary seed — it is the canonical example and it is
 * semantically sound: a program edge really is a privilege grant, and a program
 * genuinely can belong to two commands at once.
 *
 * There is deliberately NO classification seed on this surface. Modelling
 * UNCLASSIFIED / CUI / CONFIDENTIAL / SECRET / TOP SECRET as five unrelated
 * roots with handling caveats as their children breaks `coversAll` in both
 * directions at once: unrelated roots make coverage degenerate to exact match
 * (SECRET cannot read CONFIDENTIAL), while a caveat hung under a tier is
 * satisfied by anyone holding that tier (NOFORN becomes decorative). A level
 * axis and a caveat axis cannot share one Hierarchical field — which is exactly
 * what the create-state chooser intercepts (F5).
 *
 * TWO INDEPENDENT ORDERINGS ARE SEEDED, and they are the point:
 *  - `createAt` decides which occurrence a multi-parent value is EDITED under
 *    (F2). Note the earliest-created parent is not the first-listed one: “JTF
 *    Sentinel” is edited under Deepwater Patrol, not under the Operation Aurora
 *    edge that happens to be written first.
 *  - `order` is the per-edge display ordinal, one entry per parent (plus
 *    `ROOT_KEY` for the top level). It is authored explicitly here rather than
 *    derived, because the whole case this seed exists to prove is a value holding
 *    a DIFFERENT position under each of two parents — which no ordinal on the
 *    option itself could express.
 *
 * `policyRefCount` is seeded non-zero on a few values. It is the count of active
 * policy rules referencing a value, and it drives the caution shown when
 * reordering: position is comparable by policy operators, so moving a referenced
 * value can change who satisfies such a rule even though no grant moved.
 */
import { ROOT_KEY, type HierValue } from './v3GraphModel';

const DAY = 86_400_000;
/** 2024-01-08T09:00:00Z — the reference point the seed dates hang off. */
const T0 = Date.UTC(2024, 0, 8, 9, 0, 0);

function v(
  id: string,
  label: string,
  parentIds: string[],
  createdDayOffset: number,
  inUseCount = 0,
  /** Display ordinal per parent id, or `ROOT_KEY` for a top-level value. */
  order: Record<string, number> = {},
  policyRefCount = 0,
): HierValue {
  return {
    id,
    label,
    parentIds,
    createAt: T0 + createdDayOffset * DAY,
    inUseCount,
    policyRefCount,
    source: 'manual',
    order,
  };
}

/**
 * Programs. Three straight branches, one joint command, one command stood up a
 * year later, and genuine multi-parent values.
 *
 * The ordering case this seed carries: JTF Sentinel is 1st under Deepwater Patrol
 * and 2nd under Operation Aurora — sitting BETWEEN Aurora Recon and Aurora
 * Logistics — at the same time. That is the designer's "B2 can also have A as a
 * parent and be placed between A1 and A2", and it is only representable because
 * the ordinal lives on the edge. Littoral Team exists so Deepwater Patrol has a
 * second child; without it Sentinel would be 1 of 1 there and the two positions
 * could not differ.
 *
 * Aurora Recon / Aurora Logistics also give Operation Aurora two children that
 * WOULD be orphaned next to one child that would not — the delete gate's whole
 * point (F3).
 */
/**
 * Pin which occurrence a multi-parent value is EDITED under. `v()` has no slot for
 * it because most seeds want the `createAt` default; a two-axis lattice does not,
 * since every value in it has two equally-plausible parents and the arrangement
 * decides whether the tree is readable at all.
 */
function applyHomes(
  values: HierValue[],
  homes: Record<string, string>,
): HierValue[] {
  return values.map((value) =>
    homes[value.id] ? { ...value, shownUnderParentId: homes[value.id] } : value,
  );
}

export const PROGRAMS_SEED: HierValue[] = [
  v('air', 'Air Operations', [], 0, 0, { [ROOT_KEY]: 1 }),
  v('maritime', 'Maritime Operations', [], 0, 0, { [ROOT_KEY]: 2 }),
  v('space', 'Space Operations', [], 1, 0, { [ROOT_KEY]: 3 }),
  v('joint', 'Joint Command', [], 28, 0, { [ROOT_KEY]: 4 }),
  v('falcon', 'Falcon Wing', ['air'], 35, 12, { air: 1 }),
  v('trident', 'Trident Fleet', ['maritime'], 37, 9, { maritime: 1 }),
  v('orbital', 'Orbital Watch', ['space'], 43, 6, { space: 1 }),
  // Two policy rules reference Raptor Flight, so reordering it raises the
  // comparative-rule caution while reordering its siblings does not.
  v('raptor', 'Raptor Flight', ['falcon'], 56, 18, { falcon: 1 }, 2),
  v('talon', 'Talon Flight', ['falcon'], 58, 14, { falcon: 2 }),
  v('deepwater', 'Deepwater Patrol', ['trident'], 70, 11, { trident: 1 }),
  v('dragon', 'Dragon Spacecraft', ['orbital'], 85, 7, { orbital: 1 }),
  v('aurora', 'Operation Aurora', ['joint'], 105, 4, { joint: 1 }),
  // Multi-parent: parents raptor (day 56) and dragon (day 85) → edited under
  // Raptor Flight, pointer row under Dragon Spacecraft. First in both lists,
  // because it is each parent's only child.
  v('casper', 'Mission Casper', ['raptor', 'dragon'], 119, 9, {
    raptor: 1,
    dragon: 1,
  }),
  v('aurora-recon', 'Aurora Recon', ['aurora'], 115, 5, { aurora: 1 }),
  v('aurora-log', 'Aurora Logistics', ['aurora'], 127, 6, { aurora: 3 }),
  // Second child of Deepwater Patrol, so Sentinel's position there is a real
  // choice rather than the only slot available.
  v('littoral', 'Littoral Team', ['deepwater'], 74, 8, { deepwater: 2 }),
  // Stood up a year later, so it is a root created LAST — proof the editing
  // occurrence is derived from createAt rather than from where a row sits.
  v('northcom', 'Northern Command', [], 371, 0, { [ROOT_KEY]: 5 }),
  // Three parents: aurora (105), deepwater (70), northcom (371) → edited under
  // Deepwater Patrol, pointer rows under Operation Aurora and Northern Command.
  // 1st under Deepwater Patrol, 2nd under Operation Aurora. Three policy rules
  // reference it, so moving either occurrence raises the caution.
  v(
    'sentinel',
    'JTF Sentinel',
    ['aurora', 'deepwater', 'northcom'],
    392,
    6,
    { aurora: 2, deepwater: 1, northcom: 1 },
    3,
  ),
];

/**
 * A deliberately neutral, non-classification chain: one root, one child each, no
 * branches anywhere — so the F5 "every value here is on one chain" notice fires
 * and prints the direction sentence back to the author.
 *
 * That notice is about the EDGES, not about the order values are listed in: every
 * value really does sit above or below every other one here, because each link is
 * a grant. Nothing about it survives from the old chain-encoded ordering model.
 */
export const CHAIN_SEED: HierValue[] = [
  v('fleet', 'Fleet', [], 0, 3, { [ROOT_KEY]: 1 }),
  v('squadron', 'Squadron', ['fleet'], 12, 7, { fleet: 1 }),
  v('detachment', 'Detachment', ['squadron'], 26, 11, { squadron: 1 }),
  v('element', 'Element', ['detachment'], 41, 8, { detachment: 1 }),
];

/**
 * The case the per-edge ordinal exists to prove, isolated so it can be read in
 * one screen. This is the designer's example with real labels:
 *
 *   Air Operations (1)      → Falcon Wing (1), Deepwater Patrol (2),
 *                             Talon Flight (3), Raptor Flight (4),
 *                             Sabre Squadron (5)
 *   Maritime Operations (2) → Trident Fleet (1), Littoral Team (2),
 *                             Deepwater Patrol (3)
 *   Space Operations (3)    → Orbital Watch (1), Dragon Spacecraft (2)
 *
 * Deepwater Patrol is 2nd under Air Operations and 3rd under Maritime Operations
 * AT THE SAME TIME — the "place it between A1 and A2" case. An ordinal on the
 * option could hold only one of those two numbers; the edge holds both.
 *
 * Its editing occurrence derives from the earlier-created parent (Air Operations,
 * day 0), so the row under Maritime Operations is a POINTER row at position 3 —
 * and nudging or dragging that row must reorder the Maritime list while leaving
 * the Air list exactly as it is.
 */
export const ORDER_SEED: HierValue[] = [
  v('air', 'Air Operations', [], 0, 0, { [ROOT_KEY]: 1 }),
  v('maritime', 'Maritime Operations', [], 1, 0, { [ROOT_KEY]: 2 }),
  v('space', 'Space Operations', [], 2, 0, { [ROOT_KEY]: 3 }),
  v('falcon', 'Falcon Wing', ['air'], 10, 12, { air: 1 }),
  v('trident', 'Trident Fleet', ['maritime'], 11, 9, { maritime: 1 }),
  v('orbital', 'Orbital Watch', ['space'], 12, 6, { space: 1 }),
  v('talon', 'Talon Flight', ['air'], 20, 14, { air: 3 }),
  v('raptor', 'Raptor Flight', ['air'], 22, 18, { air: 4 }, 2),
  v('sabre', 'Sabre Squadron', ['air'], 24, 5, { air: 5 }),
  v('littoral', 'Littoral Team', ['maritime'], 26, 8, { maritime: 2 }),
  v('dragon', 'Dragon Spacecraft', ['orbital'], 30, 7, { orbital: 1 }),
  v(
    'deepwater',
    'Deepwater Patrol',
    ['air', 'maritime'],
    32,
    11,
    { air: 2, maritime: 3 },
    4,
  ),
];

// ── Ownership + permissions fixtures (F6) ────────────────────────────────────

/** The five-rung ladder the backend exposes for human callers. */
/**
 * The composed classification x program lattice, from the visualization David
 * demoed at the Attributes Guild meeting (2026-07-30) — see
 * `specs/graph-attributes/graph-attributes-visualization.html`, titled
 * "covers() on a classification lattice".
 *
 * Generated from the source file's own rule rather than hand-typed:
 *
 *   LEVELS = [U, S, TS]; the parents of (level, cat) are (level+1, cat) where it
 *   exists, and (level, parentCat).
 *
 * 8 categories x 3 levels = 24 values and 37 edges, with `TS // Fruit Basket` the
 * single root — the source's own asserts. Labels keep the `//` separator the
 * source renders, because that is part of the evidence: these read as composed
 * MARKING STRINGS, which is the argument for modelling level and program as two
 * fields and composing the display string, rather than as one cross-product.
 *
 * WHY THIS SEED IS HERE. It is the shape the change request argues against, shown
 * in the surface that would have to author it. The visualization is legible
 * because a loop generated a complete grid — every level edge exists because code
 * put it there. Authoring the same lattice by hand is 24 values and 37 edges with
 * no completeness guarantee: the tech spec dropped lattice/tree structural
 * validation, so one missing level edge is legal, invisible, and silently removes
 * coverage. Note how many rows carry a "2 parents" chip and how many pointer rows
 * the tree needs to render it. That density is the argument.
 *
 * The home occurrence is pinned to the same-level CATEGORY parent wherever one
 * exists, so each level renders as a complete category tree and the level edges
 * surface as pointer rows. Letting the level axis be the spine interleaves the
 * two axes and is markedly harder to read.
 */
export const LATTICE_SEED: HierValue[] = applyHomes(
  [
    v('ts-fruit-basket', 'TS // Fruit Basket', [], 0, 0, { [ROOT_KEY]: 1 }),
    v(
      'ts-red-fruit',
      'TS // Red Fruit',
      ['ts-fruit-basket'],
      3,
      6,
      { 'ts-fruit-basket': 1 },
      2,
    ),
    v('ts-purple-fruit', 'TS // Purple Fruit', ['ts-fruit-basket'], 6, 0, {
      'ts-fruit-basket': 2,
    }),
    v('ts-yellow-fruit', 'TS // Yellow Fruit', ['ts-fruit-basket'], 9, 0, {
      'ts-fruit-basket': 3,
    }),
    v('ts-apples', 'TS // Apples', ['ts-red-fruit'], 12, 0, {
      'ts-red-fruit': 1,
    }),
    v('ts-cherries', 'TS // Cherries', ['ts-red-fruit'], 15, 0, {
      'ts-red-fruit': 2,
    }),
    v('ts-grapes', 'TS // Grapes', ['ts-purple-fruit'], 18, 0, {
      'ts-purple-fruit': 1,
    }),
    v('ts-lemons', 'TS // Lemons', ['ts-yellow-fruit'], 21, 0, {
      'ts-yellow-fruit': 1,
    }),
    v(
      's-fruit-basket',
      'S // Fruit Basket',
      ['ts-fruit-basket'],
      24,
      0,
      { 'ts-fruit-basket': 4 },
      3,
    ),
    v(
      's-red-fruit',
      'S // Red Fruit',
      ['ts-red-fruit', 's-fruit-basket'],
      27,
      0,
      { 's-fruit-basket': 1, 'ts-red-fruit': 3 },
    ),
    v(
      's-purple-fruit',
      'S // Purple Fruit',
      ['ts-purple-fruit', 's-fruit-basket'],
      30,
      0,
      { 's-fruit-basket': 2, 'ts-purple-fruit': 2 },
    ),
    v(
      's-yellow-fruit',
      'S // Yellow Fruit',
      ['ts-yellow-fruit', 's-fruit-basket'],
      33,
      0,
      { 's-fruit-basket': 3, 'ts-yellow-fruit': 2 },
    ),
    v(
      's-apples',
      'S // Apples',
      ['ts-apples', 's-red-fruit'],
      36,
      14,
      { 's-red-fruit': 1, 'ts-apples': 1 },
      1,
    ),
    v('s-cherries', 'S // Cherries', ['ts-cherries', 's-red-fruit'], 39, 9, {
      's-red-fruit': 2,
      'ts-cherries': 1,
    }),
    v('s-grapes', 'S // Grapes', ['ts-grapes', 's-purple-fruit'], 42, 0, {
      's-purple-fruit': 1,
      'ts-grapes': 1,
    }),
    v('s-lemons', 'S // Lemons', ['ts-lemons', 's-yellow-fruit'], 45, 0, {
      's-yellow-fruit': 1,
      'ts-lemons': 1,
    }),
    v('u-fruit-basket', 'U // Fruit Basket', ['s-fruit-basket'], 48, 31, {
      's-fruit-basket': 4,
    }),
    v(
      'u-red-fruit',
      'U // Red Fruit',
      ['s-red-fruit', 'u-fruit-basket'],
      51,
      0,
      { 'u-fruit-basket': 1, 's-red-fruit': 3 },
    ),
    v(
      'u-purple-fruit',
      'U // Purple Fruit',
      ['s-purple-fruit', 'u-fruit-basket'],
      54,
      0,
      { 'u-fruit-basket': 2, 's-purple-fruit': 2 },
    ),
    v(
      'u-yellow-fruit',
      'U // Yellow Fruit',
      ['s-yellow-fruit', 'u-fruit-basket'],
      57,
      0,
      { 'u-fruit-basket': 3, 's-yellow-fruit': 2 },
    ),
    v('u-apples', 'U // Apples', ['s-apples', 'u-red-fruit'], 60, 0, {
      'u-red-fruit': 1,
      's-apples': 1,
    }),
    v('u-cherries', 'U // Cherries', ['s-cherries', 'u-red-fruit'], 63, 0, {
      'u-red-fruit': 2,
      's-cherries': 1,
    }),
    v('u-grapes', 'U // Grapes', ['s-grapes', 'u-purple-fruit'], 66, 0, {
      'u-purple-fruit': 1,
      's-grapes': 1,
    }),
    v('u-lemons', 'U // Lemons', ['s-lemons', 'u-yellow-fruit'], 69, 4, {
      'u-yellow-fruit': 1,
      's-lemons': 1,
    }),
  ],
  {
    's-red-fruit': 's-fruit-basket',
    's-purple-fruit': 's-fruit-basket',
    's-yellow-fruit': 's-fruit-basket',
    's-apples': 's-red-fruit',
    's-cherries': 's-red-fruit',
    's-grapes': 's-purple-fruit',
    's-lemons': 's-yellow-fruit',
    'u-red-fruit': 'u-fruit-basket',
    'u-purple-fruit': 'u-fruit-basket',
    'u-yellow-fruit': 'u-fruit-basket',
    'u-apples': 'u-red-fruit',
    'u-cherries': 'u-red-fruit',
    'u-grapes': 'u-purple-fruit',
    'u-lemons': 'u-yellow-fruit',
  },
);

export type HumanRung = 'owner' | 'sysadmin' | 'admin' | 'member' | 'none';

export const HUMAN_RUNGS: Array<{ value: HumanRung; label: string }> = [
  { value: 'owner', label: 'Owner only' },
  { value: 'sysadmin', label: 'System admins and above' },
  { value: 'admin', label: 'Attribute admins and above' },
  { value: 'member', label: 'Any member' },
  { value: 'none', label: 'No one' },
];

export type MachineOwnerKind = 'plugin' | 'service' | 'role' | 'user';

export interface MachineOwner {
  name: string;
  kind: MachineOwnerKind;
  /** What this owner owns. Values owned by a machine are not human-editable. */
  owns: 'values' | 'definition';
}

export interface PermissionSettings {
  /** Who may set this attribute on users and channels. */
  assign: HumanRung;
  /** Who may add or change the value list. */
  valueList: HumanRung;
  /** Who may change name, type and where the attribute applies. */
  definition: HumanRung;
}

export const PROGRAMS_PERMISSIONS: PermissionSettings = {
  assign: 'admin',
  valueList: 'sysadmin',
  definition: 'sysadmin',
};

export const EMPTY_PERMISSIONS: PermissionSettings = {
  assign: 'sysadmin',
  valueList: 'sysadmin',
  definition: 'sysadmin',
};

/**
 * Machine ownership is read-only in core: it is assigned in the integration's
 * own screen, and core shows it as a badge. There is no add/remove control here.
 */
export const PROGRAMS_MACHINE_OWNER: MachineOwner = {
  name: 'Unified Attribute Service',
  kind: 'service',
  owns: 'values',
};

// ── Applies-to fixtures ──────────────────────────────────────────────────────

export interface AppliesToRow {
  resource: string;
  detail: string;
}

export const PROGRAMS_APPLIES_TO: AppliesToRow[] = [
  {
    resource: 'Users',
    detail:
      'People hold one or more programs. A user passes if they hold the value on the channel, or a value above it.',
  },
  {
    resource: 'Channels',
    detail:
      'Channels are marked with programs, drawn from the same value list, so the two can be compared.',
  },
];
