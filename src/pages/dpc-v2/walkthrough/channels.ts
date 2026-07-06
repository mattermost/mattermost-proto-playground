/**
 * Walkthrough channel fixtures.
 *
 * Each channel demonstrates one DPC phase. The current viewer is the channel
 * admin of `ops-planning-q3` (the interactive demo channel); they're a
 * member of a couple of other channels at different DPC states. The Browse
 * Channels modal exposes channels they can request to join.
 */
import { SUPPORTING_USERS } from '@/pages/dpc/shared';

export type WalkthroughKind =
  | 'public'
  | 'private'
  | 'private-discoverable'
  | 'private-auto-add';

export type DpcPhase = 'public' | 'S1' | 'S2' | 'S3' | 'S5';

export interface WalkthroughChannel {
  id: string;
  name: string;
  displayName: string;
  purpose: string;
  kind: WalkthroughKind;
  phase: DpcPhase;
  /** True for the channel the user is the admin of (the interactive demo channel). */
  isAdmin: boolean;
  /** True when the viewer is a member of this channel (sidebar visibility). */
  joined: boolean;
  memberCount: number;
  /** Used in the Browse Channels surface as a description for the row. */
  policyName?: string;
  /** Sample feed messages. */
  messages: Array<{
    authorId: string;
    timestamp: string;
    body: string;
  }>;
}

const author = (idx: number) => SUPPORTING_USERS[idx]?.username ?? 'user';

export const WALKTHROUGH_CHANNELS: WalkthroughChannel[] = [
  // Public channel — control / baseline app feel.
  {
    id: 'wt-general',
    name: 'general',
    displayName: 'general',
    purpose: 'Team-wide announcements and broad coordination.',
    kind: 'public',
    phase: 'public',
    isAdmin: false,
    joined: true,
    memberCount: 142,
    messages: [
      {
        authorId: author(0),
        timestamp: '9:14 AM',
        body: 'Reminder: ops sync at 10. Bring the dashboard.',
      },
      {
        authorId: author(1),
        timestamp: '9:21 AM',
        body: 'On it. Pulling the latest numbers now.',
      },
    ],
  },

  // Public channel with unread — gives sidebar weight.
  {
    id: 'wt-release-cadence',
    name: 'release-cadence',
    displayName: 'release-cadence',
    purpose: 'Train schedule, hotfix queue, release-manager handoffs.',
    kind: 'public',
    phase: 'public',
    isAdmin: false,
    joined: true,
    memberCount: 61,
    messages: [
      {
        authorId: author(4),
        timestamp: '8:55 AM',
        body: 'Cutting the 4.2 RC branch this afternoon.',
      },
    ],
  },

  // S2 — Discoverable, no Membership Policy. THIS is the interactive demo
  // channel; the viewer is the channel admin and has pending requests in
  // the right rail.
  {
    id: 'ops-planning-q3',
    name: 'ops-planning-q3',
    displayName: 'ops-planning-q3',
    purpose: 'Operations planning for Q3 — channel admins coordinate here.',
    kind: 'private-discoverable',
    phase: 'S2',
    isAdmin: true,
    joined: true,
    memberCount: 14,
    messages: [
      {
        authorId: author(1),
        timestamp: '8:42 AM',
        body: 'Pushing the v2 build at noon.',
      },
      {
        authorId: author(4),
        timestamp: '8:45 AM',
        body: 'Looks good.',
      },
    ],
  },

  // S1 — Private, NOT discoverable. Baseline of the legacy private-channel
  // posture. No DPC indicator on the row or header.
  {
    id: 'wt-secure-coordination',
    name: 'secure-coordination',
    displayName: 'secure-coordination',
    purpose: 'Restricted ops thread — invite-only.',
    kind: 'private',
    phase: 'S1',
    isAdmin: false,
    joined: true,
    memberCount: 8,
    messages: [
      {
        authorId: author(2),
        timestamp: 'Yesterday',
        body: 'Adding @arjun once IDM confirms the new clearance level.',
      },
    ],
  },

  // S3 — Discoverable + Membership Policy, viewer matches and is a member.
  // The channel header carries the subtle lock-plus indicator.
  {
    id: 'wt-west-taskforce',
    name: 'west-taskforce',
    displayName: 'west-taskforce',
    purpose: 'Regional task-force coordination (West region).',
    kind: 'private-discoverable',
    phase: 'S3',
    isAdmin: false,
    joined: true,
    memberCount: 23,
    policyName: 'Region = West',
    messages: [
      {
        authorId: author(3),
        timestamp: '7:50 AM',
        body: 'CalFire briefing rescheduled to 11.',
      },
    ],
  },
];

/**
 * Channels surfaced in Browse / switcher but the viewer is NOT a member of.
 * The viewer can Request to join these (or, for the auto-add case, observe
 * that auto-add picked them up).
 */
export const BROWSEABLE_CHANNELS: WalkthroughChannel[] = [
  {
    id: 'wt-legal-discuss',
    name: 'legal-discuss',
    displayName: 'legal-discuss',
    purpose: 'Legal team discussion — privilege flagged.',
    kind: 'private-discoverable',
    phase: 'S3',
    isAdmin: false,
    joined: false,
    memberCount: 19,
    policyName: 'Department = Legal',
    messages: [],
  },
  {
    id: 'wt-weekend-on-call',
    name: 'weekend-on-call',
    displayName: 'weekend-on-call',
    purpose: 'Weekend on-call coverage and runbook updates.',
    kind: 'private-discoverable',
    phase: 'S2',
    isAdmin: false,
    joined: false,
    memberCount: 34,
    messages: [],
  },
  {
    id: 'wt-cba-mobile',
    name: 'cba-mobile',
    displayName: 'cba-mobile',
    purpose: 'Channel build automation for mobile.',
    kind: 'public',
    phase: 'public',
    isAdmin: false,
    joined: false,
    memberCount: 47,
    messages: [],
  },
];

export function getChannelById(id: string): WalkthroughChannel | undefined {
  return (
    WALKTHROUGH_CHANNELS.find((c) => c.id === id) ??
    BROWSEABLE_CHANNELS.find((c) => c.id === id)
  );
}
