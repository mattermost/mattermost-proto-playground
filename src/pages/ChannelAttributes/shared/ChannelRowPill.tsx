import ClassificationPill, { type MarkingStyle } from './ClassificationPill';
import { rowHasClassification, type ChannelListItem } from './channelListData';

export interface ChannelRowPillProps {
  item: ChannelListItem;
  /**
   * Marking style forwarded to the pill. `abbrev` (CAPCO portion marks) keeps the
   * pill compact so channel names are not squeezed in dense list surfaces; `full`
   * shows the level word. Set per-surface by the propagation harness toggle.
   */
  variant?: MarkingStyle;
}

/**
 * The single shared way propagation surfaces (switcher, search, sidebar, threads,
 * mentions, …) render a channel-row classification marking. Rendering identically
 * everywhere is a correctness requirement — one helper, one placement rule.
 *
 * Placement: the pill sits immediately AFTER the channel name and BEFORE the
 * ~handle, matching the in-header treatment (name → classification pill). The
 * compact `size="sm"` pill carries text + color (WCAG 1.4.1); TOP SECRET / TS//SCI
 * render black-on-orange / black-on-yellow via the prescribed styles (WCAG 1.4.3).
 *
 * No-trace masking: a DM, a masked channel, or a genuinely unmarked channel all
 * render NOTHING — no placeholder, no spacer. Absence of a pill is never a signal.
 */
export default function ChannelRowPill({ item, variant = 'abbrev' }: ChannelRowPillProps) {
  if (!rowHasClassification(item) || item.classification === undefined) return null;
  return <ClassificationPill level={item.classification} size="sm" variant={variant} />;
}
