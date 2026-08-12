/**
 * Hierarchical (`graph`) attribute — DRILL-IN variation, model delta only.
 *
 * The value pool, the DAG maths, the mock population, the classification list and
 * the redundancy logic are NOT re-declared: they are imported read-only from
 * `HierarchicalAttributeValueMenu/valueMenuModel`, which stays the single source
 * of truth so the two prototypes can be compared on navigation alone.
 *
 * What is genuinely new here is the shape of one LEVEL, because the drill-in
 * panel shows one level at a time rather than an expanded forest:
 *
 *   ROOT LEVEL    the root list, nothing else.
 *   VALUE LEVEL   the parent's OWN value first, then its canonical children.
 *
 * That first row is the only place the parent's selection state is ever drawn.
 * The row you drilled from is navigation, so it carries no checkmark and no
 * `aria-checked` — ARIA 1.2 gives activation of a parent `menuitem` to its
 * submenu, and APG's Enter behaviour is exclusive ("opens the submenu … Otherwise,
 * activates the item"), so a row that both navigates and selects has no keyboard
 * path to the second act. Shipping Mattermost concedes the same point:
 * `menu/sub_menu.tsx` sets `onClick: isMobileView ? handleOnClick : undefined`.
 *
 * Children come from `canonicalChildIdsOf`, so a multi-parent value is
 * constructed under ONE parent only and its remaining edges are spoken in prose
 * ("Also under Dragon Spacecraft"). A second occurrence is never built, which is
 * what keeps one value to one row and one state.
 */
import {
  SEEDED_SELECTION,
  STATE_LABELS,
  canonicalChildIdsOf,
  canonicalDescendantIdsOf,
  hasCanonicalChildren,
  rootIds,
  type RankingMode,
  type StateKey,
} from '@/pages/HierarchicalAttributeValueMenu/valueMenuModel';

/** What a row in the current level is FOR. Role follows from this and nothing else. */
export type DrillRowKind =
  /** The level's own value — `menuitemcheckbox`, first row, above the separator. */
  | 'self'
  /** A child that has children of its own — navigation-only `menuitem`. */
  | 'branch'
  /** A childless child, or any search result — `menuitemcheckbox`. */
  | 'leaf';

export interface DrillRow {
  id: string;
  kind: DrillRowKind;
  /** Search results only — the canonical breadcrumb, root-first. */
  path?: string[];
}

/**
 * The rows of one level, in reading and keyboard order.
 *
 * `path` is the drill stack, root-first; its last entry is the level currently on
 * screen. An empty stack is the root list, which has no parent and therefore no
 * self row.
 */
export function levelRows(path: string[], ranking: RankingMode): DrillRow[] {
  const parentId = path.length > 0 ? path[path.length - 1] : null;

  if (parentId == null) {
    return rootIds(ranking).map((id) => ({
      id,
      kind: hasCanonicalChildren(id) ? 'branch' : 'leaf',
    }));
  }

  return [
    { id: parentId, kind: 'self' },
    ...canonicalChildIdsOf(parentId, ranking).map(
      (id): DrillRow => ({
        id,
        kind: hasCanonicalChildren(id) ? 'branch' : 'leaf',
      }),
    ),
  ];
}

export interface BranchSelection {
  /** The branch value itself is selected. Its checkbox lives one level in. */
  self: boolean;
  /** Selected values the branch conceals below itself. */
  inside: number;
}

/**
 * What a navigation row has to disclose without becoming a checkbox.
 *
 * A drill-in row must not conceal selection, and it must not claim it either. So
 * the two facts are stated as text in the row's description — never as a check,
 * an indeterminate mark, or `aria-checked`, all three of which would announce a
 * state the row cannot change.
 */
export function branchSelection(
  id: string,
  selectedIds: string[],
): BranchSelection {
  return {
    self: selectedIds.includes(id),
    inside: canonicalDescendantIdsOf(id).filter((candidate) =>
      selectedIds.includes(candidate),
    ).length,
  };
}

// ─── Deep-link states ──────────────────────────────────────────────────────────

/**
 * Same state set as the tree version with one substitution: there is no inline
 * expansion to seed, so `expanded` becomes `drilled` — two levels deep.
 */
export type DrillStateKey = Exclude<StateKey, 'expanded'> | 'drilled';

export const DRILL_STATE_KEYS: DrillStateKey[] = [
  'empty',
  'selected',
  'redundant',
  'inert-marking',
  'nothing-qualifies',
  'search',
  'drilled',
];

export const DRILL_STATE_LABELS: Record<DrillStateKey, string> = {
  empty: STATE_LABELS.empty,
  selected: STATE_LABELS.selected,
  redundant: STATE_LABELS.redundant,
  'inert-marking': STATE_LABELS['inert-marking'],
  'nothing-qualifies': STATE_LABELS['nothing-qualifies'],
  search: STATE_LABELS.search,
  drilled: 'Two levels deep — inside Falcon Wing',
};

/** Identical seeds to the tree version, so the two builds compare like for like. */
export const DRILL_SEEDED_SELECTION: Record<DrillStateKey, string[]> = {
  empty: SEEDED_SELECTION.empty,
  selected: SEEDED_SELECTION.selected,
  redundant: SEEDED_SELECTION.redundant,
  'inert-marking': SEEDED_SELECTION['inert-marking'],
  'nothing-qualifies': SEEDED_SELECTION['nothing-qualifies'],
  search: SEEDED_SELECTION.search,
  drilled: SEEDED_SELECTION.expanded,
};

/**
 * Whether the menu is open on landing, and where the drill stack starts.
 *
 * `drilled` lands inside Falcon Wing with Falcon Wing selected — the state worth
 * seeing, because the checkmark sits on the level's own first row while the
 * navigation row that leads here (one level up) carries none.
 */
export const DRILL_SEEDED_MENU: Record<
  DrillStateKey,
  { open: boolean; query: string; path: string[] }
> = {
  empty: { open: false, query: '', path: [] },
  selected: { open: true, query: '', path: [] },
  redundant: { open: false, query: '', path: [] },
  'inert-marking': { open: false, query: '', path: [] },
  'nothing-qualifies': { open: false, query: '', path: [] },
  search: { open: true, query: 'casper', path: [] },
  drilled: { open: true, query: '', path: ['air', 'falcon'] },
};

/**
 * Deep-link aliases. `?state=expanded` and `?state=submenu` are the tree
 * version's and the pre-tree build's names for "already inside something", so
 * they land on the drilled level rather than falling through to the default.
 */
const DRILL_STATE_ALIASES: Record<string, DrillStateKey> = {
  expanded: 'drilled',
  submenu: 'drilled',
};

export function parseDrillState(raw: string | null): DrillStateKey {
  if (raw != null && raw in DRILL_STATE_ALIASES)
    return DRILL_STATE_ALIASES[raw];
  return DRILL_STATE_KEYS.includes(raw as DrillStateKey)
    ? (raw as DrillStateKey)
    : 'selected';
}
