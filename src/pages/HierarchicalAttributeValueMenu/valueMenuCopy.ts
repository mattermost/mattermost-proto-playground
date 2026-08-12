/**
 * Every user-visible sentence the menu can say, in one place.
 *
 * The dropdown carries exactly two kinds of prose and no more:
 *
 *  1. ONE compact footer line inside the popover, stating the effect of the
 *     current selection in plain words. It truncates; it never wraps to three
 *     lines and it never becomes a panel.
 *
 *  2. SMALL inline notices under the field — never inside the popover — for the
 *     two genuinely dangerous resource-side cases only. Subject-side redundancy
 *     is harmless and gets a quiet hint with a one-click fix, never a block.
 */
import {
  ancestorIdsOf,
  descendantIdsOf,
  labelOf,
  reachableFrom,
  redundantPairs,
  type MenuSide,
  type RedundantPair,
} from './valueMenuModel';

function plural(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}

/**
 * The single footer line. Subject side reads as a grant; resource side reads as
 * an entry rule. Same selection, opposite consequence — which is exactly why
 * this line exists at all.
 */
export function footerLine(
  side: MenuSide,
  selected: string[],
  subjectFirstName: string,
): string {
  if (side === 'subject') {
    if (selected.length === 0) {
      return `Nothing selected — ${subjectFirstName} gets no program access.`;
    }
    if (selected.length === 1) {
      const id = selected[0];
      const beneath = descendantIdsOf(id).length;
      if (beneath === 0) {
        return `${labelOf(id)} has nothing under it — access stops there.`;
      }
      return `Anyone with ${labelOf(id)} gets the ${beneath} ${plural(
        beneath,
        'program',
        'programs',
      )} under it.`;
    }
    const total = reachableFrom(selected).length;
    return `${selected.length} values selected — that adds up to ${total} programs in total.`;
  }

  if (selected.length === 0) {
    return 'Nothing selected — no one can enter.';
  }
  if (selected.length === 1) {
    const id = selected[0];
    if (ancestorIdsOf(id).length === 0) {
      return `Anyone holding ${labelOf(id)} can enter — nothing sits above it.`;
    }
    return `Anyone holding ${labelOf(id)} or something above it can enter.`;
  }
  if (selected.length === 2) {
    return 'Entry needs both of these — or something above each.';
  }
  return `Entry needs all ${selected.length} of these — or something above each one.`;
}

/** Resource side · the ancestor makes the tighter marking inert. Warn. */
export function inertMarkingWarning(selected: string[]): string | null {
  const pairs = redundantPairs(selected);
  if (pairs.length === 0) return null;
  const { innerId, outerId } = pairs[0];
  return `${labelOf(outerId)} already includes ${labelOf(innerId)}, so the ${labelOf(
    innerId,
  )} marking restricts nothing. Remove ${labelOf(outerId)} to keep the tighter marking.`;
}

/** Resource side · no current member satisfies the marking. Warn. */
export const NOTHING_QUALIFIES_WARNING =
  'No one holds a value at or above every marking here, so no one can enter this channel.';

/**
 * Subject side · redundancy is harmless. A quiet hint plus a one-click fix,
 * never a warning and never a block.
 */
export function redundancyHint(
  selected: string[],
): { text: string; pair: RedundantPair; fixLabel: string } | null {
  const pairs = redundantPairs(selected);
  if (pairs.length === 0) return null;
  const pair = pairs[0];
  return {
    pair,
    text: `${labelOf(pair.innerId)} is already inside ${labelOf(pair.outerId)}.`,
    fixLabel: `Remove ${labelOf(pair.innerId)}`,
  };
}

/** Joins names for prose: "A", "A and B", "A, B and C". */
function andList(labels: string[]): string {
  if (labels.length <= 1) return labels[0] ?? '';
  return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`;
}

/**
 * Menu chrome strings.
 *
 * Two deletions worth naming. There is no `submenuAriaLabel` any more: children
 * expand inline, so there is no second panel to name — and the old name
 * ("Air Operations — child values") contradicted a panel whose first row was Air
 * Operations itself. And `openSubmenuLabel` becomes the twisty's two names, which
 * is what a node-specific accessible name on an expand control has to be.
 */
export const MENU_COPY = {
  searchPlaceholder: 'Search values',
  noResults: 'No values match.',
  /** The twisty button. Node-specific, and it states the action, not the state. */
  expandLabel: (label: string) => `Expand ${label}`,
  collapseLabel: (label: string) => `Collapse ${label}`,
  /**
   * The other-parents line on a multi-parent row. The value is drawn ONCE, under
   * its canonical parent; this line is how its remaining edges are spoken.
   */
  alsoUnder: (labels: string[]) => `Also under ${andList(labels)}`,
  /**
   * A collapsed parent must not conceal a selected descendant. This is its own
   * element on the row — never a check or an indeterminate mark on the parent's
   * own control, which would misstate what is actually assigned.
   */
  selectedInside: (count: number) => `${count} selected inside`,
};
