import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarArjun from '@/assets/avatars/Arjun Patel.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarDarius from '@/assets/avatars/Darius Cole.png';
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

export const DARIUS = {
  name: 'Darius Cole',
  avatarSrc: avatarDarius,
  avatarAlt: 'Darius Cole',
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

/** User-created agent from the New Agent modal. */
export type CreatedAgent = {
  id: string;
  name: string;
  shape: AgentShape;
  color: AgentColor;
  purpose: string;
};

/** Display profile for Matty or a created agent. */
export type AgentProfile = {
  id: string;
  name: string;
  shape: AgentShape;
  color: AgentColor;
  description?: string;
  purpose?: string;
};

export type AgentChatMessage = {
  id: string;
  timestamp: string;
  paragraphs: string[];
};

export type AgentChatSession = {
  id: string;
  preview: string;
};

/** Opening Matty thread for the Agents vision demo (Figma 71:102213). */
export const MATTY_CHAT_SESSIONS: AgentChatSession[] = [
  {
    id: 'welcome',
    preview: "Hey Priya, looks like you're just getting started.",
  },
];

export const MATTY_WELCOME_MESSAGE: AgentChatMessage = {
  id: 'matty-welcome',
  timestamp: '10:43 AM',
  paragraphs: [
    "Hey Priya, looks like you're just getting started. Welcome to the new and improved Agents in Mattermost. I'm Matty, you're all-purpose agent and I will run point across all of the other agents you can work with.",
    'I think a good next step would be to connect to your tools so I can help you get work done.',
  ],
};

export const SENTINEL_DEFAULT = {
  name: 'Sentinel',
  purpose: 'Watch the health of our checkout and payment services.',
  shape: 'sphere' as AgentShape,
  color: 'blue' as AgentColor,
};

/** URL-safe id from an agent name (e.g. "Sentinel" → "sentinel"). */
export function slugifyAgentName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'agent';
}

export function buildCreatedAgent(input: {
  name: string;
  shape: AgentShape;
  color: AgentColor;
  purpose: string;
}): CreatedAgent {
  const name = input.name.trim() || SENTINEL_DEFAULT.name;
  const purpose = input.purpose.trim() || SENTINEL_DEFAULT.purpose;
  return {
    id: slugifyAgentName(name),
    name,
    shape: input.shape,
    color: input.color,
    purpose,
  };
}

/** Resolve Matty or a created agent for `/agents/:agentId`. */
export function resolveAgentProfile(
  agentId: string | undefined,
  customAgents: CreatedAgent[],
): AgentProfile {
  if (!agentId || agentId === MATTY.id) {
    return MATTY;
  }
  const match = customAgents.find((agent) => agent.id === agentId);
  if (match) {
    return match;
  }
  const fallback = customAgents[customAgents.length - 1];
  if (fallback) {
    return fallback;
  }
  return {
    id: agentId,
    name: SENTINEL_DEFAULT.name,
    shape: SENTINEL_DEFAULT.shape,
    color: SENTINEL_DEFAULT.color,
    purpose: SENTINEL_DEFAULT.purpose,
  };
}

export function buildAgentWelcomeMessage(agent: AgentProfile): AgentChatMessage {
  if (agent.id === MATTY.id) {
    return MATTY_WELCOME_MESSAGE;
  }
  const setup =
    agent.description?.trim() ||
    agent.purpose?.trim() ||
    SENTINEL_DEFAULT.purpose;
  return {
    id: `${agent.id}-welcome`,
    timestamp: '10:43 AM',
    paragraphs: [
      `Hey Priya, looks like you're just getting started. Welcome to the new and improved Agents in Mattermost. I'm ${agent.name}, and I'm set up to ${setup}`,
      'I think a good next step would be to connect to your tools so I can help you get work done.',
    ],
  };
}

export function buildAgentChatSessions(agent: AgentProfile): AgentChatSession[] {
  if (agent.id === MATTY.id) {
    return MATTY_CHAT_SESSIONS;
  }
  return [
    {
      id: 'welcome',
      preview: "Hey Priya, looks like you're just getting started.",
    },
  ];
}

export type ChannelMessage = {
  id: string;
  username: string;
  avatarSrc: string;
  avatarAlt: string;
  timestamp: string;
  body: string;
};

/** Quiet pre-incident thread in `#service-status` — morning SRE chatter before Priya creates Sentinel. */
export const SERVICE_STATUS_MESSAGES: ChannelMessage[] = [
  {
    id: 'm1',
    username: JORDAN.name,
    avatarSrc: JORDAN.avatarSrc,
    avatarAlt: JORDAN.avatarAlt,
    timestamp: '7:18 AM',
    body: 'Overnight checkout queue p95 spiked to 340ms around 02:10, then settled. Still watching the payment worker backlog.',
  },
  {
    id: 'm2',
    username: ON_CALL.name,
    avatarSrc: ON_CALL.avatarSrc,
    avatarAlt: ON_CALL.avatarAlt,
    timestamp: '7:24 AM',
    body: 'Saw that too — coincided with the batch settlement job. Latency is back under 120ms. I’ll keep the alert muted unless it reappears.',
  },
  {
    id: 'm3',
    username: DARIUS.name,
    avatarSrc: DARIUS.avatarSrc,
    avatarAlt: DARIUS.avatarAlt,
    timestamp: '7:41 AM',
    body: 'Canary 2.14 finished verification on payments-api. Error budget burn is flat; rolling the remaining pods at 08:00.',
  },
  {
    id: 'm4',
    username: JORDAN.name,
    avatarSrc: JORDAN.avatarSrc,
    avatarAlt: JORDAN.avatarAlt,
    timestamp: '7:48 AM',
    body: 'Nice. DB connection pool on checkout-primary peaked at 78% during the canary — still below the 85% warn threshold.',
  },
  {
    id: 'm5',
    username: DARIUS.name,
    avatarSrc: DARIUS.avatarSrc,
    avatarAlt: DARIUS.avatarAlt,
    timestamp: '8:02 AM',
    body: 'Confirmed Grafana `checkout_queue_depth` alert thresholds still match the runbook (warn 2k / page 5k). No flapping overnight.',
  },
  {
    id: 'm6',
    username: ON_CALL.name,
    avatarSrc: ON_CALL.avatarSrc,
    avatarAlt: ON_CALL.avatarAlt,
    timestamp: '8:15 AM',
    body: 'On-call rotation is covered through the weekend. Ping me if error rates climb above 2%.',
  },
  {
    id: 'm7',
    username: VIEWER.name,
    avatarSrc: VIEWER.avatarSrc,
    avatarAlt: VIEWER.avatarAlt,
    timestamp: '8:22 AM',
    body: 'Morning all — thanks for the notes. Looks quiet so far after the canary.',
  },
  {
    id: 'm8',
    username: JORDAN.name,
    avatarSrc: JORDAN.avatarSrc,
    avatarAlt: JORDAN.avatarAlt,
    timestamp: '8:42 AM',
    body: 'Checkout latency looks normal after last night’s deploy. Keeping an eye on the payment queue through lunch.',
  },
  {
    id: 'm9',
    username: VIEWER.name,
    avatarSrc: VIEWER.avatarSrc,
    avatarAlt: VIEWER.avatarAlt,
    timestamp: '8:51 AM',
    body: 'Thanks. I’ll spin up a monitoring agent for this channel so we catch spikes before support does.',
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
