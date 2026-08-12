/**
 * Every sentence the drill-in panel adds, in one place.
 *
 * The footer line, the "Also under …" line, the "N selected inside" count and the
 * no-results line all come from the tree version's `valueMenuCopy` — same words,
 * so a reviewer comparing the two builds is comparing navigation, not wording.
 * What is new is only what drilling introduces: a level name, a back target, a
 * breadcrumb, a group heading, and the one qualifier that stops the level's own
 * value row reading as a second copy of the header.
 */

function plural(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}

export const DRILL_COPY = {
  /** Back target at depth 1 — above the first level there is only the root list. */
  backToTop: 'Back to top level',
  backTo: (label: string) => `Back to ${label}`,

  /**
   * The level's own value row, directly under the header that names the level.
   *
   * The header says WHERE YOU ARE; this row is THE ASSIGNABLE THING. Without a
   * qualifier the two read as the same row twice, so the row states the grant it
   * actually makes — holding a value carries everything beneath it — while the
   * header stays a location. Kept to three words so it survives a 284px panel
   * without truncating.
   */
  selfQualifier: 'and everything under it',

  /**
   * Heading over the children. Also the `aria-label` of their `role="group"`, so
   * the visible text and the accessible name are the same string by construction.
   */
  groupLabel: (label: string) => `Inside ${label}`,

  /**
   * Ancestors of the current level, compacted. Two fit; deeper paths keep the
   * root and the immediate parent and drop the middle, because a breadcrumb that
   * wraps to a second line in a 284px panel costs more than the middle hop is
   * worth.
   */
  breadcrumb: (labels: string[]) =>
    labels.length <= 2
      ? labels.join(' › ')
      : `${labels[0]} › … › ${labels[labels.length - 1]}`,

  /**
   * Announced on every level change. The header sits outside `role="menu"` and
   * focus lands on a row, so without this the level name is never spoken.
   */
  topLevelAnnouncement: (count: number) =>
    `Top level — ${count} ${plural(count, 'program', 'programs')}.`,
  levelAnnouncement: (label: string, inside: number) =>
    `${label} — the value itself, plus ${inside} ${plural(
      inside,
      'value',
      'values',
    )} inside.`,
  searchAnnouncement: (count: number) =>
    count === 0
      ? 'No values match. Drill-in exited.'
      : `${count} ${plural(count, 'result', 'results')} with full paths. Drill-in exited.`,

  /** Accessible name of the flat result list, which is not a level. */
  searchResultsLabel: 'Search results',

  /**
   * What a navigation row discloses about selection WITHOUT being a checkbox.
   * Text in the row's description, never a check and never `aria-checked`: the row
   * cannot toggle either fact, and announcing a state it cannot change is the
   * 4.1.2 defect this variation exists to avoid.
   */
  navSelectionNote: ({
    self,
    inside,
  }: {
    self: boolean;
    inside: number;
  }): string | null => {
    if (!self && inside === 0) return null;
    if (self && inside === 0) return 'Selected';
    if (!self) return `${inside} selected inside`;
    return `Selected · ${inside} more inside`;
  },
};
