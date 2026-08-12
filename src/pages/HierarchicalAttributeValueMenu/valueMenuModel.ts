/**
 * Hierarchical (backend type `graph`) attribute — LIGHTWEIGHT VALUE MENU model.
 *
 * Scope of this file: the seed forest, the per-edge ordinals, the mock user
 * population, and the small derivations the dropdown needs. Nothing else.
 *
 * The DAG math is NOT re-implemented. `covers`, `descendantsOf` and
 * `ancestorsOf` are imported read-only from
 * `HierarchicalAttributeAuthoring/graphModel`, which is the single source of
 * truth for "a is at-or-above b".
 *
 * Two facts the menu is built around:
 *
 *  1. ACCESS COMES ONLY FROM PARENT→CHILD EDGES. Holding a value grants
 *     everything beneath it. Values on separate branches are incomparable —
 *     normal, not an error. An empty set denies.
 *
 *  2. THE ORDINAL IS PER-EDGE AND GRANTS NOTHING. `Mission Casper` sits at
 *     position 2 under Raptor Flight and position 1 under Dragon Spacecraft.
 *     Position is data a policy rule can compare ("at or above", "below"); it
 *     is never itself a grant. That is why ordinals live on the edge list here
 *     and not on the value.
 *
 *     Because the ordinal is per-parent, it is never RENDERED as a numeral in
 *     the picker: two chips both reading `2` from different parents would imply
 *     a comparability the data does not have. The ordinal drives row ORDER only.
 *     Numerals stay in the authoring surface, where positions are being edited.
 *
 *  3. ONE ROW PER VALUE. The tree renders a value exactly once, under its
 *     canonical parent (`parentIds[0]`), with a line naming its other parents.
 *     Hence `canonicalChildIdsOf` rather than `childIdsOf`: a DAG node with two
 *     parents drawn twice reads as two distinct values, and there is no correct
 *     `aria-owns` story for the second occurrence.
 */
import {
  ancestorsOf,
  covers,
  descendantsOf,
  optionMap,
  type GraphOption,
} from '@/pages/HierarchicalAttributeAuthoring/graphModel';

/** Product name of the field type. Backend name is `graph`. */
export const TYPE_NAME = 'Hierarchical';
/** The hierarchical attribute exercised on all three surfaces. */
export const FIELD_NAME = 'Program';

/** A value in the pool. Shape is `GraphOption` so the DAG helpers apply as-is. */
export type ProgramValue = GraphOption;

/**
 * Attribute-level setting. It decides row ORDER and nothing else: `ranked` keeps
 * each parent's curated per-edge positions, `unranked` falls back to
 * alphabetical. Neither mode renders a numeral in the picker.
 */
export type RankingMode = 'unranked' | 'ranked';

/** Which side of the relation the host surface is editing. */
export type MenuSide = 'subject' | 'resource';

export type SurfaceKey = 'user' | 'create-channel' | 'channel-info';

export type StateKey =
  | 'empty'
  | 'selected'
  | 'redundant'
  | 'inert-marking'
  | 'nothing-qualifies'
  | 'search'
  | 'expanded';

// ─── The value pool ────────────────────────────────────────────────────────────

function v(id: string, label: string, parentIds: string[]): ProgramValue {
  return { id, label, parentIds, inUseCount: 0, policyRefCount: 0 };
}

/**
 * Programs. Five roots (a forest, not a tree) and two genuine multi-parent
 * values — `Mission Casper` under Raptor Flight and Dragon Spacecraft, and
 * `JTF Sentinel` under Operation Aurora, Deepwater Patrol and Northern Command.
 * Those two are the point: they are the values whose extra edges have to be
 * spoken in prose ("Also under Dragon Spacecraft") because the tree draws each
 * value exactly once.
 *
 * `parentIds[0]` is the canonical parent. It decides the single path shown in
 * search results — never which parents are real, and never access.
 */
export const PROGRAM_VALUES: ProgramValue[] = [
  v('air', 'Air Operations', []),
  v('falcon', 'Falcon Wing', ['air']),
  v('raptor', 'Raptor Flight', ['falcon']),
  v('raptor-alpha', 'Raptor Alpha Element', ['raptor']),

  v('maritime', 'Maritime Operations', []),
  v('trident', 'Trident Fleet', ['maritime']),
  v('deepwater', 'Deepwater Patrol', ['trident']),
  v('littoral', 'Littoral Watch', ['deepwater']),

  v('space', 'Space Operations', []),
  v('orbital', 'Orbital Watch', ['space']),
  v('dragon', 'Dragon Spacecraft', ['orbital']),
  v('cargo', 'Cargo Resupply', ['dragon']),

  v('joint', 'Joint Command', []),
  v('aurora', 'Operation Aurora', ['joint']),
  v('aurora-log', 'Aurora Logistics', ['aurora']),

  v('northcom', 'Northern Command', []),
  v('arctic', 'Arctic Watch', ['northcom']),
  v('border', 'Border Shield', ['northcom']),

  // Multi-parent values.
  v('casper', 'Mission Casper', ['raptor', 'dragon']),
  v('sentinel', 'JTF Sentinel', ['aurora', 'deepwater', 'northcom']),
];

export interface ValueEdge {
  /** `null` = the root list, which is itself an ordered list. */
  parentId: string | null;
  childId: string;
  /** 1-based position within THAT parent's ordered child list. */
  ordinal: number;
}

/**
 * Every edge carries its own ordinal. Note `casper` at 2 under `raptor` and at
 * 1 under `dragon`, and `sentinel` at 1 / 2 / 3 under its three parents — the
 * same value legitimately holds three different positions.
 */
export const VALUE_EDGES: ValueEdge[] = [
  { parentId: null, childId: 'air', ordinal: 1 },
  { parentId: null, childId: 'maritime', ordinal: 2 },
  { parentId: null, childId: 'space', ordinal: 3 },
  { parentId: null, childId: 'joint', ordinal: 4 },
  { parentId: null, childId: 'northcom', ordinal: 5 },

  { parentId: 'air', childId: 'falcon', ordinal: 1 },
  { parentId: 'falcon', childId: 'raptor', ordinal: 1 },
  { parentId: 'raptor', childId: 'raptor-alpha', ordinal: 1 },
  { parentId: 'raptor', childId: 'casper', ordinal: 2 },

  { parentId: 'maritime', childId: 'trident', ordinal: 1 },
  { parentId: 'trident', childId: 'deepwater', ordinal: 1 },
  { parentId: 'deepwater', childId: 'littoral', ordinal: 1 },
  { parentId: 'deepwater', childId: 'sentinel', ordinal: 2 },

  { parentId: 'space', childId: 'orbital', ordinal: 1 },
  { parentId: 'orbital', childId: 'dragon', ordinal: 1 },
  { parentId: 'dragon', childId: 'casper', ordinal: 1 },
  { parentId: 'dragon', childId: 'cargo', ordinal: 2 },

  { parentId: 'joint', childId: 'aurora', ordinal: 1 },
  { parentId: 'aurora', childId: 'sentinel', ordinal: 1 },
  { parentId: 'aurora', childId: 'aurora-log', ordinal: 2 },

  { parentId: 'northcom', childId: 'arctic', ordinal: 1 },
  { parentId: 'northcom', childId: 'border', ordinal: 2 },
  { parentId: 'northcom', childId: 'sentinel', ordinal: 3 },
];

const VALUE_BY_ID = optionMap(PROGRAM_VALUES);

const EDGE_KEY = (parentId: string | null, childId: string) =>
  `${parentId ?? '·root·'}>${childId}`;

const ORDINAL_BY_EDGE = new Map(
  VALUE_EDGES.map((e) => [EDGE_KEY(e.parentId, e.childId), e.ordinal]),
);

/** The value's position under one specific parent (`null` = the root list). */
export function ordinalOf(childId: string, parentId: string | null): number {
  return ORDINAL_BY_EDGE.get(EDGE_KEY(parentId, childId)) ?? 0;
}

export function labelOf(id: string): string {
  return VALUE_BY_ID.get(id)?.label ?? id;
}

export function parentIdsOf(id: string): string[] {
  return VALUE_BY_ID.get(id)?.parentIds ?? [];
}

/** True when the value legitimately appears under more than one parent. */
export function isMultiParent(id: string): boolean {
  return parentIdsOf(id).length > 1;
}

/**
 * Row order for one list. `ranked` uses that parent's curated positions;
 * `unranked` is alphabetical. Order is the ONLY thing the setting changes.
 */
function orderIds(
  ids: string[],
  parentId: string | null,
  ranking: RankingMode,
): string[] {
  const sorted = [...ids];
  sorted.sort(
    ranking === 'ranked'
      ? (a, b) => ordinalOf(a, parentId) - ordinalOf(b, parentId)
      : (a, b) => labelOf(a).localeCompare(labelOf(b)),
  );
  return sorted;
}

/** Root values, in list order. */
export function rootIds(ranking: RankingMode = 'ranked'): string[] {
  return orderIds(
    PROGRAM_VALUES.filter((o) => o.parentIds.length === 0).map((o) => o.id),
    null,
    ranking,
  );
}

/** Canonical parent = `parentIds[0]`. `null` for a root. */
export function canonicalParentOf(id: string): string | null {
  return parentIdsOf(id)[0] ?? null;
}

/** The parents a value is ALSO under — everything after the canonical one. */
export function otherParentIdsOf(id: string): string[] {
  return parentIdsOf(id).slice(1);
}

/**
 * The children the tree draws under this parent: those whose CANONICAL parent it
 * is. `Mission Casper` therefore appears under Raptor Flight and nowhere else,
 * even though Dragon Spacecraft is a real parent of it — that edge is spoken by
 * the row's "Also under" line instead of by a second row.
 */
export function canonicalChildIdsOf(
  parentId: string,
  ranking: RankingMode = 'ranked',
): string[] {
  return orderIds(
    PROGRAM_VALUES.filter((o) => canonicalParentOf(o.id) === parentId).map(
      (o) => o.id,
    ),
    parentId,
    ranking,
  );
}

/** True when the tree has rows to draw under this value. */
export function hasCanonicalChildren(id: string): boolean {
  return PROGRAM_VALUES.some((o) => canonicalParentOf(o.id) === id);
}

/**
 * Everything the tree draws BENEATH this value — i.e. exactly what collapsing it
 * conceals. Narrower than `descendantIdsOf`, which follows every DAG edge.
 */
export function canonicalDescendantIdsOf(id: string): string[] {
  const out: string[] = [];
  const queue = [id];
  const seen = new Set<string>([id]);
  while (queue.length > 0) {
    const cursor = queue.shift() as string;
    for (const child of canonicalChildIdsOf(cursor)) {
      if (seen.has(child)) continue;
      seen.add(child);
      out.push(child);
      queue.push(child);
    }
  }
  return out;
}

/**
 * The canonical path to a value, root-first, EXCLUDING the value itself. One
 * path per value, so a multi-parent value still yields exactly one search row.
 */
export function pathLabelsOf(id: string): string[] {
  const out: string[] = [];
  const guard = new Set<string>();
  let cursor = canonicalParentOf(id);
  while (cursor != null && !guard.has(cursor)) {
    guard.add(cursor);
    out.unshift(labelOf(cursor));
    cursor = canonicalParentOf(cursor);
  }
  return out;
}

export function descendantIdsOf(id: string): string[] {
  return [...descendantsOf(PROGRAM_VALUES, id)];
}

export function ancestorIdsOf(id: string): string[] {
  return [...ancestorsOf(PROGRAM_VALUES, id)];
}

/** `holder` covers `target` iff target is at-or-below holder. */
export function coversValue(holderId: string, targetId: string): boolean {
  return covers(PROGRAM_VALUES, holderId, targetId);
}

/** Union of the down-sets of the selection — self plus everything beneath. */
export function reachableFrom(ids: string[]): string[] {
  const out = new Set<string>();
  for (const id of ids) {
    out.add(id);
    for (const d of descendantsOf(PROGRAM_VALUES, id)) out.add(d);
  }
  return [...out];
}

// ─── Search ────────────────────────────────────────────────────────────────────

export interface SearchRow {
  id: string;
  label: string;
  /** Canonical path, root-first, excluding the value. */
  path: string[];
  multiParent: boolean;
}

/**
 * Flat results, one row per value even when the value has several parents.
 * Matching runs over the label and its canonical path, so "air rap" finds
 * Raptor Flight. Results keep pool order so the forest still reads top-down.
 */
export function searchRows(query: string): SearchRow[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  return PROGRAM_VALUES.filter((o) => {
    const haystack = [o.label, ...pathLabelsOf(o.id)].join(' ').toLowerCase();
    return terms.every((t) => haystack.includes(t));
  }).map((o) => ({
    id: o.id,
    label: o.label,
    path: pathLabelsOf(o.id),
    multiParent: isMultiParent(o.id),
  }));
}

// ─── Redundancy (one computation, two readings) ─────────────────────────────────

export interface RedundantPair {
  /** The selected value that is at-or-below the other. */
  innerId: string;
  /** The selected ancestor that already covers it. */
  outerId: string;
}

/**
 * Pairs where one selected value is an ancestor of another selected value.
 *
 *  SUBJECT side  — harmless. The descendant grants nothing extra; recording a
 *                  specific read-on still has audit value. Quiet hint at most.
 *  RESOURCE side — dangerous. The requirement collapses to the ancestor and the
 *                  tighter-looking marking stays visible while enforcing
 *                  nothing. Warn.
 */
export function redundantPairs(selected: string[]): RedundantPair[] {
  const out: RedundantPair[] = [];
  for (const innerId of selected) {
    const outerId = selected.find(
      (candidate) => candidate !== innerId && coversValue(candidate, innerId),
    );
    if (outerId != null) out.push({ innerId, outerId });
  }
  return out;
}

// ─── The counted population ────────────────────────────────────────────────────

export interface MockUser {
  id: string;
  name: string;
  /** Program values held by this user. */
  holds: string[];
}

/**
 * Channel members, used only so "no one qualifies" is a real answer rather than
 * a decorative warning.
 */
export const MOCK_USERS: MockUser[] = [
  { id: 'u-aiko', name: 'Aiko Tan', holds: ['air'] },
  { id: 'u-arjun', name: 'Arjun Patel', holds: ['falcon'] },
  { id: 'u-danielle', name: 'Danielle Okoro', holds: ['raptor'] },
  { id: 'u-darius', name: 'Darius Cole', holds: ['maritime'] },
  { id: 'u-david', name: 'David Liang', holds: ['trident'] },
  { id: 'u-emma', name: 'Emma Novak', holds: ['deepwater'] },
  { id: 'u-ethan', name: 'Ethan Brooks', holds: ['space', 'joint'] },
  { id: 'u-isabella', name: 'Isabella Cruz', holds: ['orbital'] },
  { id: 'u-leila', name: 'Leila Haddad', holds: ['falcon', 'joint'] },
  { id: 'u-lukas', name: 'Lukas Meyer', holds: ['aurora', 'northcom'] },
  { id: 'u-marco', name: 'Marco Rinaldi', holds: ['casper'] },
  { id: 'u-sofia', name: 'Sofia Bauer', holds: ['air', 'maritime'] },
];

/**
 * Who can enter a resource marked with `selected`. Every requirement must be
 * satisfied by a held value at-or-above it. An empty marking denies everyone.
 */
export function qualifyingUsers(selected: string[]): MockUser[] {
  if (selected.length === 0) return [];
  return MOCK_USERS.filter((u) =>
    selected.every((target) => u.holds.some((h) => coversValue(h, target))),
  );
}

// ─── Classification (flat, coloured — the create-channel companion field) ───────

export type ClassificationScheme =
  | 'green'
  | 'purple'
  | 'blue'
  | 'red'
  | 'orange';

export interface ClassificationValue {
  id: string;
  label: string;
  scheme: ClassificationScheme;
}

/** Flat list, highest marking first — the ordering the marking banner uses. */
export const CLASSIFICATION_VALUES: ClassificationValue[] = [
  { id: 'top-secret', label: 'TOP SECRET', scheme: 'orange' },
  { id: 'secret', label: 'SECRET', scheme: 'red' },
  { id: 'confidential', label: 'CONFIDENTIAL', scheme: 'blue' },
  { id: 'cui', label: 'CUI', scheme: 'purple' },
  { id: 'unclassified', label: 'UNCLASSIFIED', scheme: 'green' },
];

export function classificationById(
  id: string | null,
): ClassificationValue | null {
  return CLASSIFICATION_VALUES.find((c) => c.id === id) ?? null;
}

// ─── Hosts ─────────────────────────────────────────────────────────────────────

/** The person whose Program assignment the System Console surface is editing. */
export const SUBJECT_USER = {
  name: 'Marco Rinaldi',
  firstName: 'Marco',
  username: 'marco.rinaldi',
  role: 'Systems Administrator',
  email: 'marco.rinaldi@sample.mattermost.com',
  userId: 'rgqnfjx887rat8n7wp4cba4ypc',
};

/** The channel the two channel surfaces are marking. */
export const HOST_CHANNEL = {
  name: 'Operation Aurora',
  url: 'operation-aurora',
  purpose: 'Program ALPHA · Team coordination and sustainment.',
  memberCount: 21,
};

// ─── Deep-link states ──────────────────────────────────────────────────────────

export const SURFACE_KEYS: SurfaceKey[] = [
  'user',
  'create-channel',
  'channel-info',
];

export const SURFACE_LABELS: Record<SurfaceKey, string> = {
  user: 'System Console · User Configuration',
  'create-channel': 'Create a new channel',
  'channel-info': 'Channel Info sidebar',
};

export const STATE_KEYS: StateKey[] = [
  'empty',
  'selected',
  'redundant',
  'inert-marking',
  'nothing-qualifies',
  'search',
  'expanded',
];

export const STATE_LABELS: Record<StateKey, string> = {
  empty: 'Empty — nothing selected',
  selected: 'One value selected, menu open',
  redundant: 'Ancestor + descendant selected',
  'inert-marking': 'Inert marking (resource reading)',
  'nothing-qualifies': 'Nothing qualifies',
  search: 'Search mode — flat results with paths',
  expanded: 'Two levels expanded inline',
};

export const RANKING_LABELS: Record<RankingMode, string> = {
  unranked: 'Unranked — alphabetical order',
  ranked: 'Ranked — curated per-parent order',
};

/** Seeded Program selection per state. Verified against MOCK_USERS. */
export const SEEDED_SELECTION: Record<StateKey, string[]> = {
  empty: [],
  // Falcon Wing → 4 members qualify.
  selected: ['falcon'],
  // Air Operations already covers Raptor Flight.
  redundant: ['air', 'raptor'],
  'inert-marking': ['air', 'raptor'],
  // Dragon Spacecraft ∧ Northern Command → nobody holds both, or anything above both.
  'nothing-qualifies': ['dragon', 'northcom'],
  search: ['falcon'],
  expanded: ['falcon'],
};

/**
 * Whether the menu is open on landing, and in which mode.
 *
 * `expandedIds` seeds the inline expansion. Roots otherwise land COLLAPSED: the
 * popover is 236px tall, and a collapsed parent that hides a selected descendant
 * says so on its own row, so nothing is concealed by starting small.
 */
export const SEEDED_MENU: Record<
  StateKey,
  { open: boolean; query: string; expandedIds: string[] }
> = {
  empty: { open: false, query: '', expandedIds: [] },
  selected: { open: true, query: '', expandedIds: [] },
  redundant: { open: false, query: '', expandedIds: [] },
  'inert-marking': { open: false, query: '', expandedIds: [] },
  'nothing-qualifies': { open: false, query: '', expandedIds: [] },
  search: { open: true, query: 'casper', expandedIds: [] },
  expanded: { open: true, query: '', expandedIds: ['air', 'falcon'] },
};

export function parseSurface(raw: string | null): SurfaceKey {
  return SURFACE_KEYS.includes(raw as SurfaceKey)
    ? (raw as SurfaceKey)
    : 'user';
}

export function parseRanking(raw: string | null): RankingMode {
  return raw === 'unranked' ? 'unranked' : 'ranked';
}

/**
 * Deep-link aliases. `?state=submenu` predates inline expansion — there are no
 * submenus now, so it lands on the equivalent expanded tree rather than 404ing
 * into the default.
 */
const STATE_ALIASES: Record<string, StateKey> = {
  submenu: 'expanded',
};

export function parseState(raw: string | null): StateKey {
  if (raw != null && raw in STATE_ALIASES) return STATE_ALIASES[raw];
  return STATE_KEYS.includes(raw as StateKey) ? (raw as StateKey) : 'selected';
}

export function sideOf(surface: SurfaceKey): MenuSide {
  return surface === 'user' ? 'subject' : 'resource';
}
