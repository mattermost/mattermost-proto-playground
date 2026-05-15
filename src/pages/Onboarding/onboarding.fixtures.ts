import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarArjunPatel from '@/assets/avatars/Arjun Patel.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarDariusCole from '@/assets/avatars/Darius Cole.png';
import avatarDavidLiang from '@/assets/avatars/David Liang.png';
import avatarEmmaNovak from '@/assets/avatars/Emma Novak.png';
import avatarEthanBrooks from '@/assets/avatars/Ethan Brooks.png';
import avatarIsabella from '@/assets/avatars/Isabella Cruz.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import avatarStaffTeam from '@/assets/avatars/Staff Team.png';
import type { ChannelsSidebarModel } from '@/components/ui/ChannelsSidebar/channelsSidebarModel';

export const WORKSPACE_NAME = 'Acme Defense';

export const CURRENT_USER = {
  id: 'leonard',
  name: 'Leonard Riley',
  handle: '@leonard.riley',
  avatarSrc: avatarLeonard,
};

export const AGENT = {
  id: 'agent',
  name: 'Mattermost Agent',
  avatarSrc: avatarStaffTeam,
  botLabel: 'AGENT',
};

export const TEAMMATES = [
  { id: 'aiko', name: 'Aiko Tan', avatarSrc: avatarAikoTan },
  { id: 'arjun', name: 'Arjun Patel', avatarSrc: avatarArjunPatel },
  { id: 'danielle', name: 'Danielle Okoro', avatarSrc: avatarDanielle },
  { id: 'darius', name: 'Darius Cole', avatarSrc: avatarDariusCole },
  { id: 'david', name: 'David Liang', avatarSrc: avatarDavidLiang },
  { id: 'emma', name: 'Emma Novak', avatarSrc: avatarEmmaNovak },
  { id: 'ethan', name: 'Ethan Brooks', avatarSrc: avatarEthanBrooks },
  { id: 'isabella', name: 'Isabella Cruz', avatarSrc: avatarIsabella },
  { id: 'sofia', name: 'Sofia Bauer', avatarSrc: avatarSofia },
] as const;

/**
 * Sidebar variant for a freshly-invited user. A "Day 1" group sits above the
 * regular channels with a pre-seeded "Start Here" channel that Agent populates
 * with five Day-1 missions.
 */
export function buildFirstSessionSidebarModel(opts: {
  activeChannel?: 'town-square' | 'start-here' | 'agent';
} = {}): ChannelsSidebarModel {
  const active = opts.activeChannel ?? 'start-here';
  return {
    topGroupItems: [
      { name: 'Threads', leadingVisual: 'Threads' },
      { name: 'Drafts', leadingVisual: 'Drafts' },
    ],
    groups: [
      {
        key: 'day-one',
        category: { label: 'Day 1' },
        items: [
          {
            name: 'Start Here',
            leadingVisual: 'Public',
            active: active === 'start-here',
            status: active === 'start-here' ? undefined : 'Mention',
            mentionCount: active === 'start-here' ? undefined : 3,
          },
        ],
      },
      {
        key: 'channels',
        category: { label: 'Channels', showPlusButton: true },
        items: [
          {
            name: 'Town Square',
            leadingVisual: 'Public',
            active: active === 'town-square',
          },
          { name: 'Off-Topic', leadingVisual: 'Public' },
          { name: 'engineering', leadingVisual: 'Public' },
        ],
      },
      {
        key: 'direct-messages',
        category: { label: 'Direct Messages', showPlusButton: true },
        items: [
          {
            name: AGENT.name,
            leadingVisual: 'Direct Message',
            active: active === 'agent',
            avatarSrc: AGENT.avatarSrc,
            avatarAlt: AGENT.name,
            status: active === 'agent' ? undefined : 'Mention',
            mentionCount: active === 'agent' ? undefined : 2,
          },
        ],
      },
    ],
  };
}

/**
 * Roles paired with avatars from TEAMMATES — used in pulse mentions and
 * mission post bylines so the same teammate identities are consistent.
 */
export const TEAMMATE_ROLES: Record<string, string> = {
  aiko: 'Engineering Lead',
  arjun: 'Incident Manager',
  danielle: 'Product Design',
  darius: 'Security Operations',
  david: 'Platform Engineering',
  emma: 'Customer Success',
  ethan: 'Product Manager',
  isabella: 'Compliance',
  sofia: 'Engineering Manager',
};

/**
 * The five Day 1 missions pre-seeded in #start-here. Each teaches a feature
 * through a real-looking artifact rather than instruction copy.
 */
export type MissionStatus = 'done' | 'pending';

export const DAY_ONE_MISSIONS = [
  {
    id: 'reply',
    teaches: 'Threads',
    title: 'Reply to your welcome thread',
    blurb: 'Sofia kicked off a thread for you. A one-line reply lets your team know you’re here.',
    cta: 'Reply in thread',
    status: 'done' as MissionStatus,
  },
  {
    id: 'playbook',
    teaches: 'Playbooks',
    title: 'Pick up the Customer Onboarding pilot',
    blurb:
      'You’re the owner of Step 2 — Kickoff call. Due Friday. Open the run to see what’s next.',
    cta: 'Open playbook',
    status: 'done' as MissionStatus,
  },
  {
    id: 'scheduled',
    teaches: 'Scheduled posts',
    title: 'Review the status update going out at 4pm',
    blurb:
      'Sofia drafted a weekly status for #engineering on your behalf. Edit or approve before it sends.',
    cta: 'Review draft',
    status: 'pending' as MissionStatus,
  },
  {
    id: 'agent',
    teaches: 'Mattermost Agent',
    title: 'Get yesterday’s brief from Mattermost Agent',
    blurb:
      'I summarized your team’s activity from yesterday — 3 decisions and 1 follow-up. Take 30 seconds.',
    cta: 'Read brief',
    status: 'pending' as MissionStatus,
  },
  {
    id: 'notifications',
    teaches: 'Notifications',
    title: 'Set your notification preferences',
    blurb:
      'By default I’ll ping you on @mentions and DMs. Tighten or relax this in two clicks.',
    cta: 'Review settings',
    status: 'pending' as MissionStatus,
  },
] as const;

/**
 * Pulse messages from Mattermost Agent that arrive throughout Day 1. The
 * pattern is metered, time-distributed nudges — replaces a checklist.
 */
export type PulseState = 'done' | 'now' | 'pending';

export const AGENT_PULSES = [
  {
    id: 'welcome',
    time: '8:45 AM',
    state: 'done' as PulseState,
    text: 'Welcome to Acme Defense. I’ll send small nudges through the day — three or four total. Pause anytime.',
  },
  {
    id: 'channels',
    time: '8:46 AM',
    state: 'done' as PulseState,
    text: 'Three channels match your role: #engineering, #release-discussion, #security-incident.',
    detail: '✓ Added — you can leave any of them later.',
  },
  {
    id: 'sofia-update',
    time: '9:30 AM',
    state: 'now' as PulseState,
    text: 'Sofia just posted in #engineering. Quick summary: Orion release pushed to next sprint.',
    cta: 'Open thread',
  },
  {
    id: 'aiko-mention',
    time: '10:45 AM',
    state: 'pending' as PulseState,
    text: 'Aiko @mentioned you in a thread. Reply here, or open the thread to see the full context.',
    cta: 'Open thread',
  },
  {
    id: 'status-tip',
    time: '12:00 PM',
    state: 'pending' as PulseState,
    text: 'Quick tip — set your status with /status. Lunch is a popular time to mark yourself away.',
    cta: 'Set status',
  },
] as const;

export const NEXT_PULSE_AT = '2:00 PM';

/** Standard end-user sidebar — used by empty-state and feature-intro vignettes. */
export function buildStandardSidebarModel(opts: {
  activeChannel?: string;
} = {}): ChannelsSidebarModel {
  const active = opts.activeChannel;
  const channelRow = (name: string, visual: 'Public' | 'Private') => ({
    name,
    leadingVisual: visual,
    active: active === name,
  });
  return {
    topGroupItems: [
      { name: 'Threads', leadingVisual: 'Threads' },
      { name: 'Drafts', leadingVisual: 'Drafts' },
    ],
    groups: [
      {
        key: 'channels',
        category: { label: 'Channels', showPlusButton: true },
        items: [
          channelRow('Town Square', 'Public'),
          channelRow('Off-Topic', 'Public'),
          channelRow('Contributors', 'Public'),
          channelRow('Engineering', 'Public'),
          channelRow('Operations', 'Private'),
        ],
      },
      {
        key: 'direct-messages',
        category: { label: 'Direct Messages', showPlusButton: true },
        items: [
          {
            name: AGENT.name,
            leadingVisual: 'Direct Message',
            avatarSrc: AGENT.avatarSrc,
            avatarAlt: AGENT.name,
            active: active === AGENT.name,
          },
          {
            name: 'Aiko Tan',
            leadingVisual: 'Direct Message',
            avatarSrc: avatarAikoTan,
            avatarAlt: 'Aiko Tan',
            showAvatarStatus: true,
          },
          {
            name: 'Sofia Bauer',
            leadingVisual: 'Direct Message',
            avatarSrc: avatarSofia,
            avatarAlt: 'Sofia Bauer',
            showAvatarStatus: true,
          },
        ],
      },
    ],
  };
}
