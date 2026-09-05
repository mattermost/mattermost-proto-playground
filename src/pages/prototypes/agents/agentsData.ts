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
  | 'decagon';

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
  'decagon',
];

export const AGENT_COLORS: AgentColor[] = [
  'yellow',
  'orange',
  'red',
  'purple',
  'blue',
  'sky',
  'cyan',
  'green',
];

export const AGENT_COLOR_HEX: Record<AgentColor, string> = {
  yellow: '#f2c94c',
  orange: '#f2994a',
  red: '#eb5757',
  purple: '#6f42c1',
  blue: '#2d6cdf',
  sky: '#56ccf2',
  cyan: '#2bbbad',
  green: '#27ae60',
};

/** Sidebar-sized Matty glyph for ChannelSidebarItem DM avatar slot. */
export const MATTY_AVATAR_SRC =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">` +
      `<circle cx="16" cy="16" r="16" fill="${AGENT_COLOR_HEX.yellow}"/>` +
      `<circle cx="12" cy="15" r="2.4" fill="#fff" fill-opacity="0.92"/>` +
      `<circle cx="20" cy="15" r="2.4" fill="#fff" fill-opacity="0.92"/>` +
      `</svg>`,
  );

export const MATTY = {
  id: 'matty',
  name: 'Matty',
  description:
    'General purpose agent that manages and connects to your other agents.',
  shape: 'sphere' as AgentShape,
  color: 'yellow' as AgentColor,
  avatarSrc: MATTY_AVATAR_SRC,
  avatarAlt: 'Matty',
};

export const SENTINEL_DEFAULT = {
  name: 'Sentinel',
  purpose: 'Watch the health of our checkout and payment services.',
  shape: 'sphere' as AgentShape,
  color: 'red' as AgentColor,
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
