import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarArjun from '@/assets/avatars/Arjun Patel.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import type { ChannelsSidebarModel } from '@mattermost/compass-ui/components/channels-sidebar';

export const VIEWER = {
  name: 'Priya Shah',
  avatarSrc: avatarDanielle,
  avatarAlt: 'Priya Shah',
} as const;

export const JORDAN = {
  name: 'Jordan Lee',
  avatarSrc: avatarArjun,
  avatarAlt: 'Jordan Lee',
} as const;

export const ON_CALL = {
  name: 'Emma Novak',
  avatarSrc: avatarEmma,
  avatarAlt: 'Emma Novak',
} as const;

export type AgentShape =
  | 'sphere'
  | 'pyramid'
  | 'cube'
  | 'pentagon'
  | 'hexagon'
  | 'diamond'
  | 'octagon'
  | 'shield';

export type AgentColor =
  | 'yellow'
  | 'orange'
  | 'red'
  | 'purple'
  | 'blue'
  | 'sky'
  | 'cyan'
  | 'green';

export const AGENT_SHAPES: AgentShape[] = [
  'sphere',
  'pyramid',
  'cube',
  'pentagon',
  'hexagon',
  'diamond',
  'octagon',
  'shield',
];

// Figma New Agent color strip order (Frame 1937).
export const AGENT_COLORS: AgentColor[] = [
  'yellow',
  'orange',
  'red',
  'purple',
  'sky',
  'blue',
  'cyan',
  'green',
];

/** Figma radial stops → Compass brand palette CSS variables. */
export type AgentColorStops = {
  highlight: string;
  mid: string;
  edge: string;
};

// From get_variable_defs on New Agent color dots + sphere fill.
export const AGENT_COLOR_STOPS: Record<AgentColor, AgentColorStops> = {
  yellow: {
    highlight: 'var(--color-yellow-300)',
    mid: 'var(--color-yellow-500)',
    edge: 'var(--color-yellow-500)',
  },
  orange: {
    highlight: 'var(--color-orange-400)',
    mid: 'var(--color-orange-500)',
    edge: 'var(--color-orange-400)',
  },
  red: {
    highlight: 'var(--color-red-300)',
    mid: 'var(--color-red-500)',
    edge: 'var(--color-red-400)',
  },
  purple: {
    highlight: 'var(--color-purple-400)',
    mid: 'var(--color-purple-600)',
    edge: 'var(--color-purple-500)',
  },
  // Figma light blues (strip position before primary blue).
  sky: {
    highlight: 'var(--color-blue-200)',
    mid: 'var(--color-blue-300)',
    edge: 'var(--color-blue-200)',
  },
  blue: {
    highlight: 'var(--color-blue-400)',
    mid: 'var(--color-blue-500)',
    edge: 'var(--color-blue-400)',
  },
  // Figma teal (named cyan in the picker).
  cyan: {
    highlight: 'var(--color-teal-500)',
    mid: 'var(--color-teal-700)',
    edge: 'var(--color-teal-600)',
  },
  green: {
    highlight: 'var(--color-green-300)',
    mid: 'var(--color-green-600)',
    edge: 'var(--color-green-500)',
  },
};

export const MATTY = {
  id: 'matty',
  name: 'Matty',
  description:
    'General purpose agent that manages and connects to your other agents.',
  shape: 'sphere' as AgentShape,
  color: 'yellow' as AgentColor,
};

export const SENTINEL_DEFAULT = {
  name: 'Sentinel',
  purpose: 'Watch the health of our checkout and payment services.',
  shape: 'sphere' as AgentShape,
  color: 'blue' as AgentColor,
};

export type ChannelMessage = {
  id: string;
  username: string;
  avatarSrc: string;
  avatarAlt: string;
  timestamp: string;
  body: string;
};

export const SERVICE_STATUS_MESSAGES: ChannelMessage[] = [
  {
    id: 'm1',
    username: JORDAN.name,
    avatarSrc: JORDAN.avatarSrc,
    avatarAlt: JORDAN.avatarAlt,
    timestamp: '8:42 AM',
    body: 'Morning — checkout latency looks normal after last night’s deploy. Keeping an eye on the payment queue through lunch.',
  },
  {
    id: 'm2',
    username: VIEWER.name,
    avatarSrc: VIEWER.avatarSrc,
    avatarAlt: VIEWER.avatarAlt,
    timestamp: '8:51 AM',
    body: 'Thanks. I’ll spin up a monitoring agent for this channel so we catch spikes before support does.',
  },
  {
    id: 'm3',
    username: ON_CALL.name,
    avatarSrc: ON_CALL.avatarSrc,
    avatarAlt: ON_CALL.avatarAlt,
    timestamp: '9:05 AM',
    body: 'On-call rotation is covered through the weekend. Ping me if error rates climb above 2%.',
  },
];

/** Storyline channel tree for the Agents vision demo. */
export function buildAgentsChannelsSidebarModel(
  activeName = 'service-status',
): ChannelsSidebarModel {
  return {
    topGroupItems: [
      {
        name: 'Threads',
        leadingVisual: 'threads',
        status: 'read',
      },
      {
        name: 'Drafts',
        leadingVisual: 'drafts',
        status: 'read',
      },
    ],
    groups: [
      {
        key: 'favorites',
        category: { label: 'Favorites', showChevron: true },
        items: [
          {
            name: 'service-status',
            leadingVisual: 'public',
            status: 'unread',
            active: activeName === 'service-status',
          },
          {
            name: 'release-watch',
            leadingVisual: 'public',
            status: 'read',
            active: activeName === 'release-watch',
          },
          {
            name: JORDAN.name,
            leadingVisual: 'direct-message',
            avatarSrc: JORDAN.avatarSrc,
            avatarAlt: JORDAN.avatarAlt,
            showAvatarStatus: true,
            status: 'read',
            active: activeName === JORDAN.name,
          },
        ],
      },
      {
        key: 'reliability',
        category: { label: 'Reliability', showChevron: true, showPlusButton: true },
        // Favorited channels (e.g. service-status) live only under Favorites.
        items: [
          {
            name: 'bugs',
            leadingVisual: 'public',
            status: 'mention',
            mentionCount: 3,
            active: activeName === 'bugs',
          },
        ],
      },
      {
        key: 'engineering',
        category: { label: 'Engineering', showChevron: true, showPlusButton: true },
        items: [
          {
            name: 'pr-1847-checkout-queue',
            leadingVisual: 'private',
            status: 'read',
            active: activeName === 'pr-1847-checkout-queue',
          },
          {
            name: 'pr-1832-payments-retry',
            leadingVisual: 'private',
            status: 'read',
            active: activeName === 'pr-1832-payments-retry',
          },
        ],
      },
      {
        key: 'direct-messages',
        category: { label: 'Direct messages', showChevron: true, showPlusButton: true },
        // Favorited DMs (e.g. Jordan) live only under Favorites.
        items: [
          {
            name: ON_CALL.name,
            leadingVisual: 'direct-message',
            avatarSrc: ON_CALL.avatarSrc,
            avatarAlt: ON_CALL.avatarAlt,
            showAvatarStatus: true,
            status: 'read',
            active: activeName === ON_CALL.name,
          },
        ],
      },
    ],
  };
}
