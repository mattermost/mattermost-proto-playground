import avatarIsabella from '@/assets/avatars/Isabella Cruz.png';
import avatarArjun from '@/assets/avatars/Arjun Patel.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarDarius from '@/assets/avatars/Darius Cole.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarStaffTeam from '@/assets/avatars/Staff Team.png';
import type { ChannelsSidebarModel } from '@mattermost/compass-ui/components/channels-sidebar';

export const VIEWER = {
  name: 'Priya Shah',
  avatarSrc: avatarIsabella,
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
  'blue',
  'sky',
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
  role: 'Coordinator',
  owner: 'Priya Shah',
  description:
    'General purpose agent that manages and connects to your other agents.',
  shape: 'sphere' as AgentShape,
  color: 'yellow' as AgentColor,
  channels: ['service-status'],
};

export const AUDITOR = {
  id: 'auditor',
  name: 'Auditor',
  role: 'Compliance',
  owner: 'Reliability',
  description: 'Opens tickets, drafts summaries, and keeps the incident record.',
  shape: 'hexagon' as AgentShape,
  color: 'purple' as AgentColor,
  channels: ['service-status'],
};

export const WARDEN = {
  id: 'warden',
  name: 'Warden',
  role: 'Policy',
  owner: 'Security',
  description: 'Decides whether agent actions can proceed, need a human, or stop.',
  shape: 'shield' as AgentShape,
  color: 'red' as AgentColor,
  channels: ['service-status'],
};

export const OTTO = {
  id: 'otto',
  name: 'Otto',
  role: 'Deployment',
  owner: 'Platform team',
  description: 'Runs CI/CD for the platform team. Invite into a channel when a deploy is needed.',
  shape: 'cube' as AgentShape,
  color: 'cyan' as AgentColor,
  channels: [] as string[],
  managedBy: 'Platform team',
};

export const RELAY = {
  id: 'relay',
  name: 'Relay',
  role: 'Support',
  owner: 'Support',
  description: 'Triages inbound customer issues and drafts replies.',
  shape: 'pentagon' as AgentShape,
  color: 'orange' as AgentColor,
  channels: ['customer-support'],
};

export const QUILL = {
  id: 'quill',
  name: 'Quill',
  role: 'Writer',
  owner: 'Documentation',
  description: 'Keeps runbooks and help center articles current.',
  shape: 'diamond' as AgentShape,
  color: 'green' as AgentColor,
  channels: ['docs'],
};

/** FTE shelf defaults — additive; do not replace existing scripted agents. */
export const FORGE = {
  id: 'forge',
  name: 'Forge',
  role: 'Creator',
  owner: 'Priya Shah',
  description:
    'Helps you design and configure new agents for your workspace.',
  shape: 'pyramid' as AgentShape,
  color: 'orange' as AgentColor,
  channels: [] as string[],
};

export const SCRIBE = {
  id: 'scribe',
  name: 'Scribe',
  role: 'Writer',
  owner: 'Priya Shah',
  description:
    'Drafts docs, runbooks, and polished write-ups from your conversations.',
  shape: 'diamond' as AgentShape,
  color: 'blue' as AgentColor,
  channels: [] as string[],
};

export const DYNAMO = {
  id: 'dynamo',
  name: 'Dynamo',
  role: 'Coder',
  owner: 'Priya Shah',
  description:
    'Writes and reviews code, debugs issues, and ships small changes with you.',
  shape: 'octagon' as AgentShape,
  color: 'green' as AgentColor,
  channels: [] as string[],
};

export const FTE_PRECONFIGURED_AGENTS = [FORGE, SCRIBE, DYNAMO] as const;

export type WorkspaceAgent = {
  id: string;
  name: string;
  role: string;
  owner: string;
  description: string;
  shape: AgentShape;
  color: AgentColor;
  channels: string[];
  /** Model id from AGENT_MODEL_OPTIONS; defaults to DEFAULT_AGENT_MODEL when omitted. */
  model?: string;
  managedBy?: string;
  customImageSrc?: string;
  fresh?: boolean;
};

/** Story roster (before Otto is invited into #service-status). */
export const ORG_AGENTS = [MATTY, AUDITOR, WARDEN, OTTO] as const;

/** Workspace homepage directory, including other departments. */
export const WORKSPACE_AGENTS: WorkspaceAgent[] = [
  MATTY,
  AUDITOR,
  WARDEN,
  OTTO,
  RELAY,
  QUILL,
  FORGE,
  SCRIBE,
  DYNAMO,
];

export type AgentVisibility = 'private' | 'public';

export const DEFAULT_AGENT_MODEL = 'claude-3-7-sonnet';
export const DEFAULT_AGENT_VISIBILITY: AgentVisibility = 'private';

export const AGENT_MODEL_OPTIONS = [
  { value: 'claude-opus-4-7', label: 'Claude Opus 4.7 (Anthropic)' },
  { value: 'claude-3-7-sonnet', label: 'Claude 3.7 Sonnet (Anthropic)' },
  { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet (Anthropic)' },
  { value: 'gpt-4o', label: 'GPT-4o (OpenAI)' },
  { value: 'o3-mini', label: 'o3-mini (OpenAI)' },
  { value: 'llama-3-3-70b', label: 'Llama 3.3 70B (On-prem)' },
];

/** Display label for an agent model id (falls back to the raw id). */
export function agentModelLabel(modelId?: string): string {
  const id = modelId || DEFAULT_AGENT_MODEL;
  return (
    AGENT_MODEL_OPTIONS.find((option) => option.value === id)?.label ?? id
  );
}

export type ScheduledJobTrigger = 'schedule' | 'continuous';

export type ScheduledJobRecurrence =
  | 'daily'
  | 'weekly-monday'
  | 'weekly-tuesday'
  | 'weekly-wednesday'
  | 'weekly-thursday'
  | 'weekly-friday'
  | 'weekly-saturday'
  | 'weekly-sunday';

export type ScheduledJob = {
  id: string;
  title: string;
  trigger: ScheduledJobTrigger;
  /** Used when trigger is `schedule`. */
  recurrence?: ScheduledJobRecurrence;
  /** 24h `HH:MM` when trigger is `schedule`. */
  time?: string;
  /** What the agent should do when this job runs. */
  instructions: string;
};

export const SCHEDULED_JOB_RECURRENCE_OPTIONS: {
  value: ScheduledJobRecurrence;
  label: string;
}[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly-monday', label: 'Mondays' },
  { value: 'weekly-tuesday', label: 'Tuesdays' },
  { value: 'weekly-wednesday', label: 'Wednesdays' },
  { value: 'weekly-thursday', label: 'Thursdays' },
  { value: 'weekly-friday', label: 'Fridays' },
  { value: 'weekly-saturday', label: 'Saturdays' },
  { value: 'weekly-sunday', label: 'Sundays' },
];

export const SCHEDULED_JOB_TIME_OPTIONS: { value: string; label: string }[] = [
  { value: '06:00', label: '6:00 AM' },
  { value: '07:00', label: '7:00 AM' },
  { value: '08:00', label: '8:00 AM' },
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '17:00', label: '5:00 PM' },
  { value: '18:00', label: '6:00 PM' },
];

export const SCHEDULED_JOB_PATTERN_OPTIONS: {
  value: string;
  label: string;
}[] = [
  ...SCHEDULED_JOB_RECURRENCE_OPTIONS,
  { value: 'continuous', label: 'Continuous monitoring' },
];

function formatJobTimeLabel(time: string): string {
  const match = SCHEDULED_JOB_TIME_OPTIONS.find((opt) => opt.value === time);
  if (match) return match.label;
  const [hoursRaw, minutesRaw = '00'] = time.split(':');
  const hours = Number(hoursRaw);
  if (Number.isNaN(hours)) return time;
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutesRaw.padStart(2, '0')} ${period}`;
}

function formatJobRecurrenceLabel(
  recurrence: ScheduledJobRecurrence | undefined,
): string {
  const match = SCHEDULED_JOB_RECURRENCE_OPTIONS.find(
    (opt) => opt.value === recurrence,
  );
  return match?.label ?? 'Daily';
}

/** Human subtitle for a job row, e.g. "Wednesdays at 8:00 AM". */
export function formatScheduledJobSubtitle(job: ScheduledJob): string {
  if (job.trigger === 'continuous') {
    return 'Continuous monitoring';
  }
  const day = formatJobRecurrenceLabel(job.recurrence ?? 'daily');
  const time = formatJobTimeLabel(job.time ?? '09:00');
  return `${day} at ${time}`;
}

export type KnowledgeOption = {
  value: string;
  label: string;
};

export const AGENT_KNOWLEDGE_CHANNEL_OPTIONS: KnowledgeOption[] = [
  { value: 'service-status', label: '#service-status' },
  { value: 'release-watch', label: '#release-watch' },
  { value: 'bugs', label: '#bugs' },
  { value: 'pr-1847-checkout-queue', label: '#pr-1847-checkout-queue' },
];

export const AGENT_KNOWLEDGE_DOC_OPTIONS: KnowledgeOption[] = [
  { value: 'checkout-runbook', label: 'Checkout reliability runbook' },
  { value: 'payment-webhook-playbook', label: 'Payment webhook playbook' },
  { value: 'incident-history', label: 'Incident history' },
  { value: 'oncall-handbook', label: 'On-call handbook' },
];

export const SENTINEL_KNOWLEDGE_CHANNEL_IDS = [
  'service-status',
  'release-watch',
  'bugs',
] as const;

export const SENTINEL_KNOWLEDGE_DOC_IDS = [
  'checkout-runbook',
  'payment-webhook-playbook',
  'incident-history',
] as const;

export const SENTINEL_SCHEDULED_JOBS: ScheduledJob[] = [
  {
    id: 'job-reliability-digest',
    title: 'Weekly reliability summary',
    trigger: 'schedule',
    recurrence: 'weekly-wednesday',
    time: '08:00',
    instructions:
      'Compile checkout and payment reliability metrics from the past week. Post a short summary to #service-status with top regressions and open incidents.',
  },
  {
    id: 'job-error-rate',
    title: 'Flag services with error rates above threshold',
    trigger: 'continuous',
    instructions:
      'Watch connected monitoring tools for services whose error rate exceeds the team threshold. Notify the on-call channel with service name, rate, and a suggested next step.',
  },
  {
    id: 'job-oncall-handoff',
    title: 'Summarize on-call handoff',
    trigger: 'schedule',
    recurrence: 'daily',
    time: '08:00',
    instructions:
      'Summarize overnight pages, open incidents, and outstanding follow-ups for the incoming on-call. Post the handoff to #oncall before shift change.',
  },
];

export type McpTool = {
  id: string;
  name: string;
  description: string;
};

export type McpServer = {
  id: string;
  name: string;
  description: string;
  tools: McpTool[];
};

export type ConnectedMcp = {
  serverId: string;
  enabledToolIds: string[];
};

export type AgentAdvancedConfig = {
  dynamicToolLoading: boolean;
  maxToolTurns: string;
  enableVision: boolean;
  enableTools: boolean;
  nativeWebSearch: boolean;
  nativeWebFetch: boolean;
  nativeCodeExecution: boolean;
  extendedThinking: boolean;
  thinkingBudget: string;
  structuredOutput: boolean;
};

export const DEFAULT_ADVANCED_CONFIG: AgentAdvancedConfig = {
  dynamicToolLoading: true,
  maxToolTurns: '30',
  enableVision: true,
  enableTools: true,
  nativeWebSearch: true,
  nativeWebFetch: false,
  nativeCodeExecution: false,
  extendedThinking: true,
  thinkingBudget: '8192',
  structuredOutput: false,
};

export const MCP_CATALOG: McpServer[] = [
  {
    id: 'github',
    name: 'GitHub',
    description: "Acts on Jordan's GitHub account — PRs, issues, and repos.",
    tools: [
      {
        id: 'list-pull-requests',
        name: 'List pull requests',
        description: 'Find open and merged PRs in a repository.',
      },
      {
        id: 'create-pull-request',
        name: 'Create pull request',
        description: 'Open a PR from a branch.',
      },
      {
        id: 'merge-pull-request',
        name: 'Merge pull request',
        description: 'Merge an approved PR.',
      },
      {
        id: 'comment-on-issue',
        name: 'Comment on issue',
        description: 'Add a comment to an issue or PR.',
      },
    ],
  },
  {
    id: 'jira',
    name: 'Jira',
    description: "Search, create, and update issues in the team's Jira project.",
    tools: [
      {
        id: 'search-issues',
        name: 'Search issues',
        description: 'Find issues with JQL or a keyword.',
      },
      {
        id: 'create-issue',
        name: 'Create issue',
        description: 'Open a new Jira issue.',
      },
      {
        id: 'transition-issue',
        name: 'Transition issue',
        description: 'Move an issue across the board.',
      },
      {
        id: 'add-comment',
        name: 'Add comment',
        description: 'Comment on an issue.',
      },
    ],
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: "Read and create events on Jordan's calendar.",
    tools: [
      {
        id: 'list-events',
        name: 'List events',
        description: 'Show upcoming calendar events.',
      },
      {
        id: 'create-event',
        name: 'Create event',
        description: 'Schedule a meeting.',
      },
      {
        id: 'update-event',
        name: 'Update event',
        description: 'Change time, title, or guests.',
      },
    ],
  },
  {
    id: 'grafana',
    name: 'Grafana',
    description: 'Query dashboards and alerts for checkout and payments.',
    tools: [
      {
        id: 'query-dashboards',
        name: 'Query dashboards',
        description: 'Read metrics from a dashboard.',
      },
      {
        id: 'list-alerts',
        name: 'List alerts',
        description: 'Show firing and pending alerts.',
      },
      {
        id: 'get-metric',
        name: 'Get metric',
        description: 'Fetch a named metric over a time range.',
      },
    ],
  },
  {
    id: 'pagerduty',
    name: 'PagerDuty',
    description: 'Read and acknowledge incidents for the on-call rotation.',
    tools: [
      {
        id: 'list-incidents',
        name: 'List incidents',
        description: 'Show open PagerDuty incidents.',
      },
      {
        id: 'acknowledge-incident',
        name: 'Acknowledge incident',
        description: 'Ack an incident for the current user.',
      },
      {
        id: 'escalate-incident',
        name: 'Escalate incident',
        description: 'Escalate to the next policy level.',
      },
    ],
  },
];

export function getMcpServer(id: string): McpServer | undefined {
  return MCP_CATALOG.find((server) => server.id === id);
}

export function allToolIdsForServer(id: string): string[] {
  return getMcpServer(id)?.tools.map((tool) => tool.id) ?? [];
}

export const SENTINEL_CONNECTED_MCPS: ConnectedMcp[] = [
  'github',
  'jira',
  'grafana',
].map((serverId) => ({
  serverId,
  enabledToolIds: allToolIdsForServer(serverId),
}));

export function cloneConnectedMcps(mcps?: ConnectedMcp[]): ConnectedMcp[] {
  return (mcps ?? []).map((mcp) => ({
    serverId: mcp.serverId,
    enabledToolIds: [...mcp.enabledToolIds],
  }));
}

export function cloneAdvancedConfig(
  config?: AgentAdvancedConfig,
): AgentAdvancedConfig {
  return { ...(config ?? DEFAULT_ADVANCED_CONFIG) };
}

/** User-created agent from the New Agent modal. */
export type CreatedAgent = {
  id: string;
  name: string;
  shape: AgentShape;
  color: AgentColor;
  /** Short blurb shown in Agent Settings → Info. */
  description: string;
  /** Custom instructions (Agent Settings → Model & Instructions). */
  purpose: string;
  model: string;
  visibility: AgentVisibility;
  /** Optional user-uploaded image data URL from the New Agent modal. */
  customImageSrc?: string;
  knowledgeChannelIds: string[];
  knowledgeDocIds: string[];
  scheduledJobs: ScheduledJob[];
  connectedMcps: ConnectedMcp[];
  advancedConfig: AgentAdvancedConfig;
};

/** Display profile for Matty or a created agent. */
export type AgentProfile = {
  id: string;
  name: string;
  shape: AgentShape;
  color: AgentColor;
  description?: string;
  purpose?: string;
  model?: string;
  visibility?: AgentVisibility;
  customImageSrc?: string;
  knowledgeChannelIds?: string[];
  knowledgeDocIds?: string[];
  scheduledJobs?: ScheduledJob[];
  connectedMcps?: ConnectedMcp[];
  advancedConfig?: AgentAdvancedConfig;
  /** Member agent ids when this profile is a multi-agent group chat. */
  memberIds?: string[];
};

/** In-memory multi-agent thread created from the Agents plus menu. */
export type AgentGroupChat = {
  id: string;
  name: string;
  memberIds: string[];
};

export type AgentAccessRole = 'admin' | 'editor' | 'viewer';

export type AgentAccessEntry = {
  id: string;
  name: string;
  secondaryLabel: string;
  role: AgentAccessRole;
  kind: 'person' | 'group';
  avatarSrc?: string;
};

/** Fixture people/groups for Agent Settings → Access & sharing. */
export const AGENT_ACCESS_ENTRIES: AgentAccessEntry[] = [
  {
    id: 'leonard',
    name: 'Leonard Riley',
    secondaryLabel: '@leonard',
    role: 'admin',
    kind: 'person',
    avatarSrc: avatarLeonard,
  },
  {
    id: 'ux-design',
    name: 'Members of UX Design',
    secondaryLabel: 'Group',
    role: 'editor',
    kind: 'group',
    avatarSrc: avatarStaffTeam,
  },
  {
    id: 'contributors',
    name: 'Members of Contributors',
    secondaryLabel: 'Group',
    role: 'viewer',
    kind: 'group',
    avatarSrc: avatarStaffTeam,
  },
];

export const AGENT_ACCESS_ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' },
];

export type AgentToolConnectOption = {
  id: string;
  label: string;
};

export type AgentToolAuthCard = {
  provider: 'google' | 'github' | 'atlassian';
  toolId: string;
  toolLabel: string;
  /** Set after the fake OAuth popup completes successfully. */
  connected?: boolean;
};

export type AgentChatMessage = {
  id: string;
  timestamp: string;
  /** Heading above body copy (Figma tool-connect post). */
  title?: string;
  paragraphs: string[];
  toolOptions?: AgentToolConnectOption[];
  /** Interactive OAuth / connect attachment after tool selection. */
  authCard?: AgentToolAuthCard;
  /** Files shared in the message (composer upload / PDF → Playbook). */
  attachments?: ChatAttachment[];
  /** In-thread playbook draft card (Sentinel PDF → Playbook). */
  playbookCard?: ChatPlaybookCard;
};

/** File chip on a chat message (mirrors AttachmentCard props we persist). */
export type ChatAttachment = {
  id: string;
  fileName: string;
  fileMeta: string;
  fileType:
    | 'text'
    | 'word'
    | 'excel'
    | 'powerpoint'
    | 'pdf'
    | 'image-icon'
    | 'generic'
    | 'code'
    | 'zip';
};

/** Playbook summary shown as an in-thread card (draft until saved). */
export type ChatPlaybookCard = {
  title: string;
  subtitle: string;
  stageCount: number;
  taskCount: number;
  status: 'draft' | 'active';
};

export type PlaybookDraftStage = {
  id: string;
  name: string;
  tasks: {
    id: string;
    label: string;
    description?: string;
    assignee?: string;
  }[];
};

export type PlaybookDraft = {
  title: string;
  sourceFileName: string;
  summary: string;
  stages: PlaybookDraftStage[];
  statusUpdateEvery: string;
  statusChannels: string;
  statusWebhooks: string;
  statusTemplate: string[];
  retrospectiveReminder: string;
  retrospectiveMetrics: {
    id: string;
    label: string;
    target: string;
    icon: 'cost' | 'time' | 'customers';
  }[];
  retrospectiveTemplate: string[];
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

/** Opening Sentinel thread — points at Playbooks / incident response. */
export const SENTINEL_WELCOME_MESSAGE: AgentChatMessage = {
  id: 'sentinel-welcome',
  timestamp: '10:43 AM',
  paragraphs: [
    "Hi Priya, I'm Sentinel — a monitoring agent best suited to watch service health, correlate signals when something breaks, and help the team respond.",
    "If you'd like to create a Playbook, one easy way to do that is to attach a pre-existing checklist document like a PDF or spreadsheet.",
  ],
};

export const SENTINEL_PLAYBOOK_REPLY_ID = 'sentinel-playbook-reply';
export const SENTINEL_PLAYBOOK_CARD_ID = 'sentinel-playbook-card';
export const SENTINEL_PLAYBOOK_SAVED_ID = 'sentinel-playbook-saved';

export const SENTINEL_PLAYBOOK_REPLY: AgentChatMessage = {
  id: SENTINEL_PLAYBOOK_REPLY_ID,
  timestamp: '10:44 AM',
  paragraphs: [
    "I've got the steps for your playbook now. I'll get started on that now.",
  ],
};

/** Playbook draft from Figma 134:40631 (Agentic UX Research). */
export const INCIDENT_RESPONSE_PLAYBOOK_DRAFT: PlaybookDraft = {
  title: 'Incident Response: Checklist v1',
  sourceFileName: 'Legacy_Incident_Checklist.pdf',
  summary:
    "Converted by Sentinel from the reliability team's legacy PDF checklist (Scene 1.4) and approved by Warden before activation. Deployment-related tasks are pre-assigned to Otto.",
  stages: [
    {
      id: 'triage',
      name: 'Triage',
      tasks: [
        { id: 'impact', label: 'Confirm impact and affected services' },
        {
          id: 'ticket',
          label: 'Open incident ticket',
          description:
            'Populate the ticket with the impact summary Sentinel already pulled.',
        },
        { id: 'severity', label: 'Assign severity level (e.g. #sev-2)' },
      ],
    },
    {
      id: 'investigate',
      name: 'Investigate Root Cause',
      tasks: [
        {
          id: 'deploys',
          label: 'Check recent deployments for correlated changes',
        },
        {
          id: 'infra',
          label: 'Check for concurrent infrastructure events',
        },
        {
          id: 'reconcile',
          label: 'Reconcile findings and confirm root cause',
          description:
            'If theories conflict, resolve by timeline correlation with the error onset.',
        },
      ],
    },
  ],
  statusUpdateEvery: '2 days',
  statusChannels: '3 channels',
  statusWebhooks: '1 outgoing webhook',
  statusTemplate: [
    '**Summary**',
    '',
    '**Customer impact**',
    '',
    '**About**',
    '- Severity: #sev-1/2/3',
    '- Responders:',
    '- Agents involved: Sentinel, Otto, Auditor',
    '- ETA to resolution:',
  ],
  retrospectiveReminder: '3 hours',
  retrospectiveMetrics: [
    { id: 'cost', label: 'Cost', target: 'Target: 220', icon: 'cost' },
    {
      id: 'ack',
      label: 'Time to acknowledge',
      target: 'Target: 3d 12h',
      icon: 'time',
    },
    {
      id: 'resolve',
      label: 'Time to resolve',
      target: 'Target: 30 days',
      icon: 'time',
    },
    {
      id: 'customers',
      label: 'Customers affected',
      target: 'No target',
      icon: 'customers',
    },
  ],
  retrospectiveTemplate: [
    '### Summary',
    '',
    '### What was the impact?',
    '',
    '### What were the contributing factors?',
    "Include the reconciled root-cause finding from Sentinel and Otto's investigation, not just the initial theory.",
    '',
    '### What was done?',
    '',
    '### What did we learn?',
    '',
    '### Follow-up tasks',
  ],
};

export function buildSentinelPlaybookCard(
  draft: PlaybookDraft = INCIDENT_RESPONSE_PLAYBOOK_DRAFT,
  status: ChatPlaybookCard['status'] = 'draft',
): ChatPlaybookCard {
  const taskCount = draft.stages.reduce(
    (sum, stage) => sum + stage.tasks.length,
    0,
  );
  return {
    title: draft.title,
    subtitle:
      status === 'active'
        ? `From ${draft.sourceFileName}`
        : `Draft from ${draft.sourceFileName}`,
    stageCount: draft.stages.length,
    taskCount,
    status,
  };
}

/** Short Sentinel timeline line after saving a playbook draft. */
export function buildSentinelPlaybookSavedMessage(
  timestamp: string,
  draft: PlaybookDraft = INCIDENT_RESPONSE_PLAYBOOK_DRAFT,
): AgentChatMessage {
  return {
    id: SENTINEL_PLAYBOOK_SAVED_ID,
    timestamp,
    paragraphs: [`Saved as ${draft.title}`],
  };
}

export function buildSentinelPlaybookCardMessage(
  timestamp: string,
  draft: PlaybookDraft = INCIDENT_RESPONSE_PLAYBOOK_DRAFT,
): AgentChatMessage {
  return {
    id: SENTINEL_PLAYBOOK_CARD_ID,
    timestamp,
    paragraphs: [],
    playbookCard: buildSentinelPlaybookCard(draft),
  };
}

/** PDF attachment used in Scene 1.4 / Artifact scene. */
export const SENTINEL_PLAYBOOK_PDF_ATTACHMENT: ChatAttachment = {
  id: 'legacy-incident-checklist-pdf',
  fileName: 'Legacy_Incident_Checklist.pdf',
  fileMeta: 'PDF · 1 KB',
  fileType: 'pdf',
};

/**
 * Fully hydrated Sentinel thread for the Artifact scene switcher —
 * welcome + PDF + playbook reply + draft card (RHS opens separately).
 */
export function buildSentinelPlaybookArtifactSession(): LiveAgentSession {
  return {
    id: 'welcome',
    preview: SENTINEL_PLAYBOOK_PDF_ATTACHMENT.fileName,
    messages: [
      { ...SENTINEL_WELCOME_MESSAGE, role: 'agent' },
      {
        id: 'sentinel-playbook-pdf',
        role: 'user',
        timestamp: '10:44 AM',
        paragraphs: [],
        attachments: [SENTINEL_PLAYBOOK_PDF_ATTACHMENT],
      },
      {
        ...SENTINEL_PLAYBOOK_REPLY,
        timestamp: '10:44 AM',
        role: 'agent',
      },
      {
        ...buildSentinelPlaybookCardMessage('10:44 AM'),
        role: 'agent',
      },
    ],
  };
}

/** Second Matty post — pick a tool to connect (Figma 71:103091). Copy kept as designed. */
export const MATTY_TOOL_CONNECT_OPTIONS: AgentToolConnectOption[] = [
  { id: 'google-calendar', label: 'Google Calendar' },
  { id: 'gmail', label: 'Gmail' },
  { id: 'google-drive', label: 'Google Drive' },
  { id: 'github', label: 'GitHub' },
  { id: 'jira', label: 'Jira (Atlassian)' },
];

export const MATTY_TOOL_CONNECT_MESSAGE: AgentChatMessage = {
  id: 'matty-tool-connect',
  timestamp: '10:43 AM',
  title: 'What I should I connect to first?',
  paragraphs: [
    'Your organization allows connections with the following:',
  ],
  toolOptions: MATTY_TOOL_CONNECT_OPTIONS,
};

export const MATTY_TOOL_CONNECT_CONFIRM_ID = 'matty-tool-connect-confirm';

export function buildMattyToolConnectConfirm(
  toolLabel: string,
  timestamp: string,
): AgentChatMessage {
  return {
    id: MATTY_TOOL_CONNECT_CONFIRM_ID,
    timestamp,
    paragraphs: [
      `Great — I'll connect ${toolLabel} first.`,
    ],
  };
}

export const MATTY_TOOL_AUTH_ID = 'matty-tool-auth';

export function authProviderForTool(
  toolId: string,
): AgentToolAuthCard['provider'] {
  if (toolId === 'github') return 'github';
  if (toolId === 'jira') return 'atlassian';
  return 'google';
}

export function buildMattyToolAuthMessage(
  tool: AgentToolConnectOption,
  timestamp: string,
): AgentChatMessage {
  const provider = authProviderForTool(tool.id);
  const providerLabel =
    provider === 'github'
      ? 'GitHub'
      : provider === 'atlassian'
        ? 'Atlassian'
        : 'Google';
  return {
    id: MATTY_TOOL_AUTH_ID,
    timestamp,
    paragraphs: [
      `To finish connecting ${tool.label}, authenticate with ${providerLabel} so I can access it securely.`,
    ],
    authCard: {
      provider,
      toolId: tool.id,
      toolLabel: tool.label,
    },
  };
}

export const MATTY_TOOL_CONNECTED_ID = 'matty-tool-connected';

export function buildMattyToolConnectedMessage(
  toolLabel: string,
  timestamp: string,
): AgentChatMessage {
  return {
    id: MATTY_TOOL_CONNECTED_ID,
    timestamp,
    paragraphs: [
      `You're connected to ${toolLabel}. I can use it whenever you need me.`,
    ],
  };
}

/** Act 1 automation picker — mirrors Sentinel-style scheduled job types. */
export const AGENT_AUTOMATION_OPTIONS: AgentToolConnectOption[] = [
  { id: 'reminder', label: 'Reminder' },
  { id: 'recurring-summary', label: 'Recurring summary' },
  { id: 'monitor-alert', label: 'Monitor / alert' },
  { id: 'oncall-handoff', label: 'On-call handoff' },
  { id: 'something-else', label: 'Something else' },
];

export const AGENT_AUTOMATION_PROMPT_ID = 'agent-automation-prompt';
export const AGENT_AUTOMATION_CONFIRM_ID = 'agent-automation-confirm';

export function buildAgentAutomationMessage(
  timestamp: string,
): AgentChatMessage {
  return {
    id: AGENT_AUTOMATION_PROMPT_ID,
    timestamp,
    paragraphs: [
      'What kind of automated task were you thinking of? A reminder, a recurring summary, or something else?',
    ],
    toolOptions: AGENT_AUTOMATION_OPTIONS,
  };
}

export function buildAgentAutomationConfirm(
  optionId: string,
  optionLabel: string,
  timestamp: string,
): AgentChatMessage {
  const followUps: Record<string, string> = {
    reminder:
      "Got it — a reminder. When should I nudge you, and about what?",
    'recurring-summary':
      'Nice — a recurring summary. What should I summarize, and how often?',
    'monitor-alert':
      "Alright — continuous monitoring. What should I watch for, and where should I alert?",
    'oncall-handoff':
      'On-call handoff it is. Which shift or channel should I prepare the handoff for?',
    'something-else':
      "No problem — describe the automated task you have in mind and I'll help shape it.",
  };

  return {
    id: AGENT_AUTOMATION_CONFIRM_ID,
    timestamp,
    paragraphs: [
      followUps[optionId] ??
        `Great — let's set up a ${optionLabel.toLowerCase()}. Tell me a bit more about what you need.`,
    ],
  };
}

export const SENTINEL_DEFAULT = {
  name: 'Sentinel',
  description:
    'Watches service health, and when something breaks, digs in — correlate the signals, find what changed, tell us what\'s actually wrong.',
  purpose:
    'Watch the health of checkout and payment services. When something breaks, correlate signals, find what changed, and tell the team what is actually wrong.',
  shape: 'shield' as AgentShape,
  color: 'blue' as AgentColor,
  model: DEFAULT_AGENT_MODEL,
  visibility: DEFAULT_AGENT_VISIBILITY as AgentVisibility,
};

export function isSentinelName(name: string): boolean {
  return slugifyAgentName(name) === 'sentinel';
}

export function emptyKnowledgeAndJobs(): Pick<
  CreatedAgent,
  | 'knowledgeChannelIds'
  | 'knowledgeDocIds'
  | 'scheduledJobs'
  | 'connectedMcps'
  | 'advancedConfig'
> {
  return {
    knowledgeChannelIds: [],
    knowledgeDocIds: [],
    scheduledJobs: [],
    connectedMcps: [],
    advancedConfig: cloneAdvancedConfig(),
  };
}

export function sentinelKnowledgeAndJobs(): Pick<
  CreatedAgent,
  | 'knowledgeChannelIds'
  | 'knowledgeDocIds'
  | 'scheduledJobs'
  | 'connectedMcps'
  | 'advancedConfig'
> {
  return {
    knowledgeChannelIds: [...SENTINEL_KNOWLEDGE_CHANNEL_IDS],
    knowledgeDocIds: [...SENTINEL_KNOWLEDGE_DOC_IDS],
    scheduledJobs: SENTINEL_SCHEDULED_JOBS.map((job) => ({ ...job })),
    connectedMcps: cloneConnectedMcps(SENTINEL_CONNECTED_MCPS),
    advancedConfig: cloneAdvancedConfig(),
  };
}

export function buildKnowledgePreview(
  agentName: string,
  channelIds: string[],
  docIds: string[],
): string | null {
  if (channelIds.length === 0 && docIds.length === 0) {
    return null;
  }
  if (isSentinelName(agentName) && channelIds.length > 0 && docIds.length > 0) {
    return `${agentName.trim() || 'Sentinel'} will have context from 47 past incidents and 12 runbooks.`;
  }
  const channelBit =
    channelIds.length === 1
      ? '1 channel'
      : `${channelIds.length} channels`;
  const docBit =
    docIds.length === 1 ? '1 doc' : `${docIds.length} docs`;
  const name = agentName.trim() || 'This agent';
  if (channelIds.length && docIds.length) {
    return `${name} will have context from ${channelBit} and ${docBit}.`;
  }
  if (channelIds.length) {
    return `${name} will have context from ${channelBit}.`;
  }
  return `${name} will have context from ${docBit}.`;
}

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
  description?: string;
  model?: string;
  visibility?: AgentVisibility;
  customImageSrc?: string;
  knowledgeChannelIds?: string[];
  knowledgeDocIds?: string[];
  scheduledJobs?: ScheduledJob[];
  connectedMcps?: ConnectedMcp[];
  advancedConfig?: AgentAdvancedConfig;
  /** Keep an existing id when updating (avoids breaking the chat route). */
  id?: string;
}): CreatedAgent {
  const name = input.name.trim() || SENTINEL_DEFAULT.name;
  const purpose = input.purpose.trim() || SENTINEL_DEFAULT.purpose;
  const seed = !input.id && isSentinelName(name);
  const seeded = seed ? sentinelKnowledgeAndJobs() : emptyKnowledgeAndJobs();
  return {
    id: input.id || slugifyAgentName(name),
    name,
    shape: input.shape,
    color: input.color,
    description:
      input.description?.trim() ||
      (seed ? SENTINEL_DEFAULT.description : ''),
    purpose,
    model: input.model || DEFAULT_AGENT_MODEL,
    visibility: input.visibility || DEFAULT_AGENT_VISIBILITY,
    customImageSrc: input.customImageSrc,
    knowledgeChannelIds:
      input.knowledgeChannelIds ?? seeded.knowledgeChannelIds,
    knowledgeDocIds: input.knowledgeDocIds ?? seeded.knowledgeDocIds,
    scheduledJobs: input.scheduledJobs ?? seeded.scheduledJobs,
    connectedMcps: cloneConnectedMcps(
      input.connectedMcps ?? seeded.connectedMcps,
    ),
    advancedConfig: cloneAdvancedConfig(
      input.advancedConfig ?? seeded.advancedConfig,
    ),
  };
}

/** Prefix for stub multi-agent threads created from the Agents plus menu. */
export const AGENT_GROUP_CHAT_PREFIX = 'group-chat-';

export function isAgentGroupChatId(id: string | undefined): boolean {
  return Boolean(id?.startsWith(AGENT_GROUP_CHAT_PREFIX));
}

export function nextAgentGroupChatId(): string {
  return `${AGENT_GROUP_CHAT_PREFIX}${Date.now()}`;
}

/** Comma-separated display name from selected agent ids (selection order). */
export function buildAgentGroupChatName(
  memberIds: string[],
  customAgents: CreatedAgent[],
): string {
  return memberIds
    .map((id) => resolveSingleAgentProfile(id, customAgents).name)
    .join(', ');
}

export function buildAgentGroupChat(
  memberIds: string[],
  customAgents: CreatedAgent[],
  id = nextAgentGroupChatId(),
): AgentGroupChat {
  return {
    id,
    memberIds: [...memberIds],
    name: buildAgentGroupChatName(memberIds, customAgents),
  };
}

export function buildAgentGroupChatProfile(
  group: AgentGroupChat,
): AgentProfile {
  return {
    id: group.id,
    name: group.name,
    shape: 'sphere',
    color: 'purple',
    description: 'Chat with multiple agents in one thread.',
    purpose: '',
    model: DEFAULT_AGENT_MODEL,
    visibility: DEFAULT_AGENT_VISIBILITY,
    memberIds: group.memberIds,
    ...emptyKnowledgeAndJobs(),
  };
}

/** Resolve a single agent (Matty, created, or org) — never a group chat. */
export function resolveSingleAgentProfile(
  agentId: string,
  customAgents: CreatedAgent[],
): AgentProfile {
  const match = customAgents.find((agent) => agent.id === agentId);
  if (match) {
    return match;
  }
  if (agentId === MATTY.id) {
    return {
      ...MATTY,
      description: MATTY.description,
      purpose: '',
      model: DEFAULT_AGENT_MODEL,
      visibility: DEFAULT_AGENT_VISIBILITY,
      ...emptyKnowledgeAndJobs(),
    };
  }
  const org = WORKSPACE_AGENTS.find((agent) => agent.id === agentId);
  if (org) {
    return {
      id: org.id,
      name: org.name,
      shape: org.shape,
      color: org.color,
      description: org.description,
      purpose: '',
      model: DEFAULT_AGENT_MODEL,
      visibility: DEFAULT_AGENT_VISIBILITY,
      customImageSrc: org.customImageSrc,
      ...emptyKnowledgeAndJobs(),
    };
  }
  return {
    id: agentId,
    name: agentId,
    shape: 'sphere',
    color: 'blue',
    description: '',
    purpose: '',
    model: DEFAULT_AGENT_MODEL,
    visibility: DEFAULT_AGENT_VISIBILITY,
    ...emptyKnowledgeAndJobs(),
  };
}

/** Resolve Matty, an org agent, created agent, or group chat for `/agents/:agentId`. */
export function resolveAgentProfile(
  agentId: string | undefined,
  customAgents: CreatedAgent[],
  groupChats: AgentGroupChat[] = [],
): AgentProfile {
  if (agentId && isAgentGroupChatId(agentId)) {
    const group = groupChats.find((chat) => chat.id === agentId);
    if (group) {
      return buildAgentGroupChatProfile(group);
    }
    return buildAgentGroupChatProfile({
      id: agentId,
      name: 'Agent group chat',
      memberIds: [],
    });
  }
  if (!agentId || agentId === MATTY.id) {
    return resolveSingleAgentProfile(MATTY.id, customAgents);
  }
  const match = customAgents.find((agent) => agent.id === agentId);
  if (match) {
    return match;
  }
  const org = WORKSPACE_AGENTS.find((agent) => agent.id === agentId);
  if (org) {
    return resolveSingleAgentProfile(org.id, customAgents);
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
    description: SENTINEL_DEFAULT.description,
    purpose: SENTINEL_DEFAULT.purpose,
    model: DEFAULT_AGENT_MODEL,
    visibility: DEFAULT_AGENT_VISIBILITY,
    ...sentinelKnowledgeAndJobs(),
  };
}

export function createdAgentToWorkspace(
  agent: CreatedAgent,
): WorkspaceAgent {
  return {
    id: agent.id,
    name: agent.name,
    role: isSentinelName(agent.name) ? 'Monitoring' : 'Custom',
    owner: VIEWER.name,
    description: agent.description || agent.purpose,
    shape: agent.shape,
    color: agent.color,
    channels: agent.knowledgeChannelIds,
    model: agent.model,
    customImageSrc: agent.customImageSrc,
    fresh: isSentinelName(agent.name),
  };
}

/** All-agents homepage: Matty, then created agents, then the rest of the org. */
export function buildWorkspaceDirectory(
  customAgents: CreatedAgent[],
): WorkspaceAgent[] {
  const created = customAgents.map(createdAgentToWorkspace);
  const createdIds = new Set(created.map((agent) => agent.id));
  const org = WORKSPACE_AGENTS.filter((agent) => !createdIds.has(agent.id));
  const matty = org.filter((agent) => agent.id === MATTY.id);
  const rest = org.filter((agent) => agent.id !== MATTY.id);
  return [...matty, ...created, ...rest];
}

export type SidebarAgent = Pick<
  AgentProfile,
  'id' | 'name' | 'shape' | 'color' | 'customImageSrc'
> & {
  /** Populated for multi-agent group chats — drives CSI group-message memberCount. */
  members?: SidebarAgent[];
};

function toSidebarAgent(profile: AgentProfile): SidebarAgent {
  return {
    id: profile.id,
    name: profile.name,
    shape: profile.shape,
    color: profile.color,
    customImageSrc: profile.customImageSrc,
  };
}

/** LHS Your agents: Matty, created agents, group chats, then opened org agents. */
export function buildYourAgentsSidebar(
  customAgents: CreatedAgent[],
  openedAgentIds: string[] = [],
  groupChats: AgentGroupChat[] = [],
): SidebarAgent[] {
  const listed = new Set<string>([MATTY.id]);
  const result: SidebarAgent[] = [
    {
      id: MATTY.id,
      name: MATTY.name,
      shape: MATTY.shape,
      color: MATTY.color,
    },
  ];

  for (const agent of customAgents) {
    if (listed.has(agent.id)) continue;
    listed.add(agent.id);
    result.push({
      id: agent.id,
      name: agent.name,
      shape: agent.shape,
      color: agent.color,
      customImageSrc: agent.customImageSrc,
    });
  }

  for (const group of groupChats) {
    if (listed.has(group.id)) continue;
    listed.add(group.id);
    result.push({
      id: group.id,
      name: group.name,
      shape: 'sphere',
      color: 'purple',
      members: group.memberIds.map((id) =>
        toSidebarAgent(resolveSingleAgentProfile(id, customAgents)),
      ),
    });
  }

  for (const id of openedAgentIds) {
    if (listed.has(id)) continue;
    const profile = resolveAgentProfile(id, customAgents, groupChats);
    if (listed.has(profile.id)) continue;
    listed.add(profile.id);
    result.push({
      ...toSidebarAgent(profile),
      members: profile.memberIds?.map((memberId) =>
        toSidebarAgent(resolveSingleAgentProfile(memberId, customAgents)),
      ),
    });
  }

  return result;
}

export function formatChannelList(channels: string[]): string {
  if (channels.length === 0) return '—';
  return channels.map((name) => `#${name}`).join(' · ');
}

export function buildAgentWelcomeMessage(agent: AgentProfile): AgentChatMessage {
  const isStockMatty =
    agent.id === MATTY.id &&
    !agent.purpose?.trim() &&
    (agent.description === MATTY.description || !agent.description);
  if (isStockMatty) {
    return MATTY_WELCOME_MESSAGE;
  }
  if (agent.id === 'sentinel' || isSentinelName(agent.name)) {
    return SENTINEL_WELCOME_MESSAGE;
  }
  const setup =
    agent.purpose?.trim() ||
    agent.description?.trim() ||
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
  if (isAgentGroupChatId(agent.id)) {
    return [{ id: 'new', preview: 'New group chat' }];
  }
  if (agent.id === MATTY.id) {
    return MATTY_CHAT_SESSIONS;
  }
  if (agent.id === 'sentinel' || isSentinelName(agent.name)) {
    return [
      {
        id: 'welcome',
        preview: "Hi Priya, I'm Sentinel…",
      },
    ];
  }
  return [
    {
      id: 'welcome',
      preview: "Hey Priya, looks like you're just getting started.",
    },
  ];
}

export type LiveSessionMessage = AgentChatMessage & {
  role: 'agent' | 'user';
};

/** In-memory chat thread (messages + optional tool selection). */
export type LiveAgentSession = AgentChatSession & {
  messages: LiveSessionMessage[];
  selectedToolId?: string;
};

function seedWelcomeMessages(agent: AgentProfile): LiveSessionMessage[] {
  const welcome: LiveSessionMessage = {
    ...buildAgentWelcomeMessage(agent),
    role: 'agent',
  };
  if (agent.id !== MATTY.id) {
    return [welcome];
  }
  return [welcome, { ...MATTY_TOOL_CONNECT_MESSAGE, role: 'agent' }];
}

/** Seed live sessions (with welcome messages) for an agent chat. */
export function seedAgentLiveSessions(agent: AgentProfile): LiveAgentSession[] {
  return buildAgentChatSessions(agent).map((session) => ({
    ...session,
    messages: session.id === 'welcome' ? seedWelcomeMessages(agent) : [],
  }));
}

export type ChannelMessagePart =
  | { type: 'text'; text: string }
  | {
      type: 'mention';
      id: string;
      label: string;
      avatarSrc: string;
      kind: 'agent' | 'person';
      agentShape?: AgentShape;
      agentColor?: AgentColor;
    };

/** Interactive attachment on a Matty channel post — opens Agent Settings. */
export type ChannelAgentReviewCard = {
  agentId: string;
  name: string;
  description: string;
  /** Set after Priya saves/approves in Agent Settings. */
  approved?: boolean;
};

/** Matty recommends inviting an existing workspace agent (Act 1.3 — Otto). */
export type ChannelAgentInviteCard = {
  agentId: string;
  name: string;
  description: string;
  /** Set after the viewer accepts Matty’s recommendation. */
  accepted?: boolean;
  /** Set after the viewer declines with Not now. */
  dismissed?: boolean;
};

export type ChannelMessage = {
  id: string;
  username: string;
  avatarSrc: string;
  avatarAlt: string;
  timestamp: string;
  /** Plain-text fallback / search string. */
  body: string;
  /** Rich body with inline mention chips. When omitted, render `body`. */
  parts?: ChannelMessagePart[];
  /** Default `user`. System rows are de-emphasized; agent rows use AgentAvatar. */
  kind?: 'user' | 'agent' | 'system';
  agentReviewCard?: ChannelAgentReviewCard;
  agentInviteCard?: ChannelAgentInviteCard;
  agentShape?: AgentShape;
  agentColor?: AgentColor;
  agentImageSrc?: string;
  /** Emoji reactions under the post (e.g. Sentinel waving after joining). */
  reactions?: { emoji: string; count: number; byCurrentUser?: boolean }[];
};

export const MATTY_AGENT_REVIEW_ID = 'matty-agent-review';
export const SENTINEL_JOINED_SYSTEM_ID = 'sentinel-joined-system';
export const MATTY_SENTINEL_CONFIRM_ID = 'matty-sentinel-confirm';
export const MATTY_OTTO_INVITE_ID = 'matty-otto-invite';
export const OTTO_JOINED_SYSTEM_ID = 'otto-joined-system';

export function channelPartsMentionAgent(
  parts: ChannelMessagePart[],
  agentId: string,
): boolean {
  return parts.some(
    (part) =>
      part.type === 'mention' &&
      part.kind === 'agent' &&
      part.id === agentId,
  );
}

export function buildMattyAgentReviewMessage(
  timestamp: string,
): ChannelMessage {
  return {
    id: MATTY_AGENT_REVIEW_ID,
    kind: 'agent',
    username: MATTY.name,
    avatarSrc: '',
    avatarAlt: MATTY.name,
    timestamp,
    body: "I can set up a monitoring agent for this channel. Review Sentinel's setup, then save to approve.",
    parts: [
      {
        type: 'text',
        text: "I can set up a monitoring agent for this channel. Review Sentinel's setup, then save to approve.",
      },
    ],
    agentShape: MATTY.shape,
    agentColor: MATTY.color,
    agentReviewCard: {
      agentId: 'sentinel',
      name: SENTINEL_DEFAULT.name,
      description: SENTINEL_DEFAULT.description,
    },
  };
}

export function buildSentinelJoinedSystemMessage(
  timestamp: string,
  sentinel: Pick<
    WorkspaceAgent,
    'id' | 'name' | 'shape' | 'color' | 'customImageSrc'
  >,
): ChannelMessage {
  return {
    id: SENTINEL_JOINED_SYSTEM_ID,
    kind: 'system',
    username: '',
    avatarSrc: '',
    avatarAlt: '',
    timestamp,
    body: `${sentinel.name} was created and added to the channel`,
    parts: [
      {
        type: 'mention',
        id: sentinel.id,
        label: sentinel.name,
        avatarSrc: sentinel.customImageSrc ?? '',
        kind: 'agent',
        agentShape: sentinel.shape,
        agentColor: sentinel.color,
      },
      {
        type: 'text',
        text: ' was created and added to the channel',
      },
    ],
  };
}

export function buildMattySentinelConfirmMessage(
  timestamp: string,
  sentinel: Pick<
    WorkspaceAgent,
    'id' | 'name' | 'shape' | 'color' | 'customImageSrc'
  >,
): ChannelMessage {
  return {
    id: MATTY_SENTINEL_CONFIRM_ID,
    kind: 'agent',
    username: MATTY.name,
    avatarSrc: '',
    avatarAlt: MATTY.name,
    timestamp,
    body: 'Sentinel is now here to monitor services and will notify when thresholds trip.',
    parts: [
      {
        type: 'mention',
        id: sentinel.id,
        label: sentinel.name,
        avatarSrc: sentinel.customImageSrc ?? '',
        kind: 'agent',
        agentShape: sentinel.shape,
        agentColor: sentinel.color,
      },
      {
        type: 'text',
        text: ' is now here to monitor services and will notify when thresholds trip.',
      },
    ],
    agentShape: MATTY.shape,
    agentColor: MATTY.color,
    // Sentinel greets the welcome post after joining.
    reactions: [{ emoji: '👋', count: 1 }],
  };
}

/** Act 1.3 — Matty recommends inviting existing Otto (not create-new). */
export function buildMattyOttoInviteMessage(timestamp: string): ChannelMessage {
  return {
    id: MATTY_OTTO_INVITE_ID,
    kind: 'agent',
    username: MATTY.name,
    avatarSrc: '',
    avatarAlt: MATTY.name,
    timestamp,
    body: `Otto already runs deploys for the platform team. I can add them here so they're ready when we need a rollback.`,
    parts: [
      {
        type: 'mention',
        id: OTTO.id,
        label: OTTO.name,
        avatarSrc: '',
        kind: 'agent',
        agentShape: OTTO.shape,
        agentColor: OTTO.color,
      },
      {
        type: 'text',
        text: ` already runs deploys for the platform team. I can add them here so they're ready when we need a rollback.`,
      },
    ],
    agentShape: MATTY.shape,
    agentColor: MATTY.color,
    agentInviteCard: {
      agentId: OTTO.id,
      name: OTTO.name,
      description: OTTO.description,
    },
  };
}

export function buildOttoJoinedSystemMessage(timestamp: string): ChannelMessage {
  return {
    id: OTTO_JOINED_SYSTEM_ID,
    kind: 'system',
    username: '',
    avatarSrc: '',
    avatarAlt: '',
    timestamp,
    body: `${OTTO.name} was added to the channel`,
    parts: [
      {
        type: 'mention',
        id: OTTO.id,
        label: OTTO.name,
        avatarSrc: '',
        kind: 'agent',
        agentShape: OTTO.shape,
        agentColor: OTTO.color,
      },
      {
        type: 'text',
        text: ' was added to the channel',
      },
    ],
  };
}

export type MentionCandidate = {
  id: string;
  name: string;
  secondaryLabel: string;
  kind: 'agent' | 'person';
  avatarSrc: string;
  avatarAlt: string;
  /** Shape/color for agent chips that need non-circular crop. */
  agentShape?: AgentShape;
  agentColor?: AgentColor;
};

/** Agents already in `#service-status` before Matty recommends Otto. */
export function initialServiceStatusAgentIds(): string[] {
  return WORKSPACE_AGENTS.filter((agent) =>
    agent.channels.includes('service-status'),
  ).map((agent) => agent.id);
}

/**
 * Mentioned agents that are not yet channel members.
 * Dedupes by id; people mentions are ignored.
 */
export function findAgentsNeedingChannelInvite(
  parts: ChannelMessagePart[],
  channelAgentIds: ReadonlySet<string>,
  customAgents: CreatedAgent[] = [],
): WorkspaceAgent[] {
  const directory = buildWorkspaceDirectory(customAgents);
  const seen = new Set<string>();
  const needed: WorkspaceAgent[] = [];

  for (const part of parts) {
    if (part.type !== 'mention' || part.kind !== 'agent') continue;
    if (channelAgentIds.has(part.id) || seen.has(part.id)) continue;
    seen.add(part.id);
    const agent = directory.find((entry) => entry.id === part.id);
    if (agent) {
      needed.push(agent);
    }
  }

  return needed;
}

/**
 * @-mention roster for `#service-status`. Agents are listed first.
 */
export function buildServiceStatusMentionables(
  agentAvatarSrc: (shape: AgentShape, color: AgentColor) => string,
): MentionCandidate[] {
  const agents: MentionCandidate[] = [
    MATTY,
    AUDITOR,
    WARDEN,
    OTTO,
    RELAY,
    QUILL,
  ].map((agent) => ({
    id: agent.id,
    name: agent.name,
    secondaryLabel: agent.role,
    kind: 'agent' as const,
    avatarSrc: agentAvatarSrc(agent.shape, agent.color),
    avatarAlt: agent.name,
    agentShape: agent.shape,
    agentColor: agent.color,
  }));

  const people: MentionCandidate[] = [
    {
      id: 'jordan',
      name: JORDAN.name,
      secondaryLabel: 'Member',
      kind: 'person',
      avatarSrc: JORDAN.avatarSrc,
      avatarAlt: JORDAN.avatarAlt,
    },
    {
      id: 'emma',
      name: ON_CALL.name,
      secondaryLabel: 'On-call',
      kind: 'person',
      avatarSrc: ON_CALL.avatarSrc,
      avatarAlt: ON_CALL.avatarAlt,
    },
    {
      id: 'darius',
      name: DARIUS.name,
      secondaryLabel: 'Member',
      kind: 'person',
      avatarSrc: DARIUS.avatarSrc,
      avatarAlt: DARIUS.avatarAlt,
    },
    {
      id: 'priya',
      name: VIEWER.name,
      secondaryLabel: 'You',
      kind: 'person',
      avatarSrc: VIEWER.avatarSrc,
      avatarAlt: VIEWER.avatarAlt,
    },
  ];

  return [...agents, ...people];
}

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
            name: MATTY.name,
            leadingVisual: 'direct-message',
            avatarSrc: '',
            avatarAlt: MATTY.name,
            showAvatarStatus: false,
            status: 'read',
            active: activeName === MATTY.name,
          },
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
