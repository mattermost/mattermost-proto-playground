// ─────────────────────────────────────────────────────────────────────────────
// Channel Attributes — PROPAGATION SURFACES shared multi-channel dataset
//
// This is the shared substrate the ~14 propagation surfaces (quick switcher,
// search, sidebar, threads, mentions, notifications, …) all read from. It does
// NOT live in channelAttrData.ts (that file is the single-channel masking model
// for the primary/header/banner scenes) — keeping list data separate avoids
// bloating either concern.
//
// #1 CORRECTNESS REQUIREMENT — server-side masking is modeled IN THE DATA:
// For a channel the current viewer is NOT cleared to see the classification of,
// `classification` is `undefined` — i.e. the value NEVER reached the client.
// There is NO client-side hiding, no `masked: true` flag, no sentinel. A masked
// channel is byte-for-byte indistinguishable from a channel that simply carries
// no classification. That is the whole point: masking leaves no trace.
//
// Rendering rule (see ChannelRowPill):
//   • classification present  → render the compact ClassificationPill AFTER the
//     name (before the ~handle). UNCLASSIFIED is an EXPLICIT marking and DOES
//     render a pill — absence of a pill never means "unclassified".
//   • classification undefined (masked, or genuinely unmarked) → render NOTHING.
//   • DM rows → never carry a channel classification → render NOTHING.
// ─────────────────────────────────────────────────────────────────────────────

import type { ClassificationLevel } from './channelAttrData';

export type ChannelKind = 'channel' | 'private' | 'dm';

export interface ChannelListItem {
  id: string;
  /** Display name (channel name, or the DM participant name / names). */
  name: string;
  /** ~channel-handle for channels/private; @username for DMs. */
  handle: string;
  kind: ChannelKind;
  /** Unread message count. Absent/0 = read. */
  unread?: number;
  /**
   * The classification the SERVER returned FOR THIS VIEWER. `undefined` means the
   * value was withheld server-side (masked) OR the channel is genuinely unmarked
   * OR the row is a DM — the client cannot and does not distinguish these cases.
   */
  classification?: ClassificationLevel;
}

// ── The channel list handed to the CURRENT viewer ────────────────────────────
// Spread of levels exercised: UNCLASSIFIED, CONFIDENTIAL, SECRET, TOP SECRET,
// plus a DM (no channel classification) and a masked channel (undefined).
//
// Masking demonstration: `bugs` is a SECRET channel whose classification the
// current viewer is NOT cleared for, so the server sent `classification:
// undefined`. In the switcher it renders with NO pill — visually identical to
// `random` (a genuinely unmarked channel). No-trace masking, proven in the list.
export const CHANNEL_LIST: ChannelListItem[] = [
  // ── UNREAD group ──
  {
    id: 'feature-proposals',
    name: 'Feature Proposals',
    handle: '~feature-proposals',
    kind: 'channel',
    unread: 1,
    classification: 'UNCLASSIFIED', // explicit marking → pill renders
  },
  {
    id: 'dm-leonard-riley',
    name: 'Leonard Riley',
    handle: '@leonard.riley',
    kind: 'dm',
    unread: 1,
    // DM → no channel classification → no pill
  },
  {
    id: 'dm-finney-mcgrath',
    name: 'Eliseo Finney, Jackson Mcgrath',
    handle: '@eliseo.finney',
    kind: 'dm',
    unread: 2,
    // group DM → no channel classification → no pill
  },
  {
    id: 'bugs',
    name: 'Bugs',
    handle: '~bugs',
    kind: 'channel',
    // MASKED: this is a SECRET channel the viewer is not cleared for. The server
    // withheld the value; `classification` is undefined → no pill, no trace.
    classification: undefined,
  },
  // ── RECENT group ──
  {
    id: 'ask-r-and-d',
    name: 'Ask R&D',
    handle: '~ask-r-and-d',
    kind: 'channel',
    classification: 'CONFIDENTIAL',
  },
  {
    id: 'operation-aurora',
    name: 'Operation Aurora',
    handle: '~operation-aurora',
    kind: 'private',
    classification: 'SECRET',
  },
  {
    id: 'orion-launch-ops',
    name: 'Orion Launch Ops',
    handle: '~orion-launch-ops',
    kind: 'private',
    classification: 'TOP SECRET', // black-on-orange, WCAG 1.4.3
  },
  {
    id: 'quick-wins-design-sprint',
    name: 'Quick Wins Design Sprint',
    handle: '~quick-wins-design-sprint',
    kind: 'channel',
    // genuinely unmarked channel → no pill (indistinguishable from `bugs`)
  },
  {
    id: 'town-square',
    name: 'Town Square',
    handle: '~town-square',
    kind: 'channel',
    classification: 'UNCLASSIFIED',
  },
  {
    id: 'dm-danielle-okoro',
    name: 'Danielle Okoro',
    handle: '@danielle.okoro',
    kind: 'dm',
  },
];

/** Whether a row should render a trailing/inline classification pill. */
export function rowHasClassification(item: ChannelListItem): boolean {
  // A DM never carries a channel classification; an undefined value (masked or
  // unmarked) renders nothing. Only a present value renders a pill.
  return item.kind !== 'dm' && item.classification !== undefined;
}
