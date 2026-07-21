import type {
  Automation,
  AutomationRun,
  ChangeRevision,
  Template,
  WorkflowEdge,
  WorkflowNode,
  WorkflowNodeData,
} from './types';

function n(
  id: string,
  x: number,
  y: number,
  data: WorkflowNodeData,
): WorkflowNode {
  return { id, type: 'workflow', position: { x, y }, data };
}

function e(id: string, source: string, target: string, label?: string): WorkflowEdge {
  return {
    id,
    source,
    target,
    label,
    type: 'smoothstep',
  };
}

const urgentNodes: WorkflowNode[] = [
  n('t1', 40, 120, {
    label: 'Message posted',
    kind: 'trigger',
    stepType: 'message_posted',
  }),
  n('c1', 280, 120, {
    label: 'Condition',
    kind: 'flow',
    stepType: 'condition',
    fields: { left: '{{.Post.message}}', operator: 'contains', right: 'urgent' },
  }),
  n('a1', 540, 40, {
    label: 'Add reaction',
    kind: 'action',
    stepType: 'add_reaction',
    verb: 'create',
    fields: { emoji: 'rotating_light' },
  }),
  n('s1', 540, 220, {
    label: 'Stop',
    kind: 'flow',
    stepType: 'stop',
  }),
  n('a2', 800, 40, {
    label: 'Get channel members',
    kind: 'action',
    stepType: 'get_channel_members',
    verb: 'get',
  }),
  n('l1', 1060, 40, {
    label: 'Loop (for each)',
    kind: 'flow',
    stepType: 'loop',
  }),
  n('a3', 1320, 40, {
    label: 'Direct message user',
    kind: 'action',
    stepType: 'direct_message',
    verb: 'create',
    fields: { message: 'Urgent message flagged in {{.Channel.display_name}}' },
  }),
];

const urgentEdges: WorkflowEdge[] = [
  e('e1', 't1', 'c1'),
  e('e2', 'c1', 'a1', 'True'),
  e('e3', 'c1', 's1', 'False'),
  e('e4', 'a1', 'a2'),
  e('e5', 'a2', 'l1'),
  e('e6', 'l1', 'a3'),
];

const welcomeNodes: WorkflowNode[] = [
  n('t1', 40, 100, {
    label: 'User joined team',
    kind: 'trigger',
    stepType: 'user_joined_team',
  }),
  n('a1', 320, 100, {
    label: 'Direct message user',
    kind: 'action',
    stepType: 'direct_message',
    verb: 'create',
    fields: { message: 'Welcome to the team! Here are your onboarding links…' },
  }),
];

const welcomeEdges: WorkflowEdge[] = [e('e1', 't1', 'a1')];

const standupNodes: WorkflowNode[] = [
  n('t1', 40, 100, {
    label: 'Schedule',
    kind: 'trigger',
    stepType: 'schedule',
    fields: { cron: '0 9 * * 1-5' },
  }),
  n('a1', 320, 100, {
    label: 'Post message',
    kind: 'action',
    stepType: 'post_message',
    verb: 'create',
    fields: { message: 'Good morning — standup reminder. What did you do yesterday?' },
  }),
];

const standupEdges: WorkflowEdge[] = [e('e1', 't1', 'a1')];

const bannedNodes: WorkflowNode[] = [
  n('t1', 40, 100, {
    label: 'Message posted',
    kind: 'trigger',
    stepType: 'message_posted',
  }),
  n('c1', 300, 100, {
    label: 'Condition',
    kind: 'flow',
    stepType: 'condition',
    fields: { left: '{{.Post.message}}', operator: 'contains_any', right: 'banned_words' },
  }),
  n('a1', 580, 40, {
    label: 'Post message',
    kind: 'action',
    stepType: 'post_message',
    verb: 'create',
    fields: { message: 'This message was flagged for review.' },
  }),
  n('s1', 580, 200, { label: 'Stop', kind: 'flow', stepType: 'stop' }),
];

const bannedEdges: WorkflowEdge[] = [
  e('e1', 't1', 'c1'),
  e('e2', 'c1', 'a1', 'True'),
  e('e3', 'c1', 's1', 'False'),
];

const announceNodes: WorkflowNode[] = [
  n('t1', 40, 100, {
    label: 'Channel created',
    kind: 'trigger',
    stepType: 'channel_created',
  }),
  n('a1', 320, 100, {
    label: 'Post message',
    kind: 'action',
    stepType: 'post_message',
    verb: 'create',
    fields: { channel: 'town-square', message: 'New channel created: {{.Channel.display_name}}' },
  }),
];

const announceEdges: WorkflowEdge[] = [e('e1', 't1', 'a1')];

const channelWelcomeNodes: WorkflowNode[] = [
  n('t1', 40, 100, {
    label: 'User joined channel',
    kind: 'trigger',
    stepType: 'user_joined_channel',
  }),
  n('a1', 320, 100, {
    label: 'Post message',
    kind: 'action',
    stepType: 'post_message',
    verb: 'create',
    fields: { message: 'Welcome @{{.User.username}} — check the pinned posts to get started.' },
  }),
];

const channelWelcomeEdges: WorkflowEdge[] = [e('e1', 't1', 'a1')];

const keywordNodes: WorkflowNode[] = [
  n('t1', 40, 100, {
    label: 'Message posted',
    kind: 'trigger',
    stepType: 'message_posted',
  }),
  n('c1', 300, 100, {
    label: 'Condition',
    kind: 'flow',
    stepType: 'condition',
    fields: { left: '{{.Post.message}}', operator: 'contains', right: 'escalation' },
  }),
  n('a1', 580, 40, {
    label: 'Add reaction',
    kind: 'action',
    stepType: 'add_reaction',
    verb: 'create',
    fields: { emoji: 'eyes' },
  }),
  n('a2', 840, 40, {
    label: 'Direct message user',
    kind: 'action',
    stepType: 'direct_message',
    verb: 'create',
    fields: { message: 'Keyword alert: escalation mentioned.' },
  }),
  n('s1', 580, 200, { label: 'Stop', kind: 'flow', stepType: 'stop' }),
];

const keywordEdges: WorkflowEdge[] = [
  e('e1', 't1', 'c1'),
  e('e2', 'c1', 'a1', 'True'),
  e('e3', 'c1', 's1', 'False'),
  e('e4', 'a1', 'a2'),
];

const feedbackNodes: WorkflowNode[] = [
  n('t1', 40, 80, {
    label: 'Slash command',
    kind: 'trigger',
    stepType: 'slash_command',
    fields: { command: '/feedback' },
  }),
  n('a1', 300, 80, {
    label: 'Open dialog',
    kind: 'action',
    stepType: 'open_dialog',
    verb: 'create',
    fields: { title: 'Send feedback', callback: 'feedback' },
  }),
  n('t2', 560, 80, {
    label: 'Dialog submitted',
    kind: 'trigger',
    stepType: 'dialog_submitted',
  }),
  n('a2', 820, 80, {
    label: 'Post message',
    kind: 'action',
    stepType: 'post_message',
    verb: 'create',
    fields: { channel: 'feedback', message: '{{.Submission.text}}' },
  }),
];

const feedbackEdges: WorkflowEdge[] = [
  e('e1', 't1', 'a1'),
  e('e2', 'a1', 't2'),
  e('e3', 't2', 'a2'),
];

const webhookNodes: WorkflowNode[] = [
  n('t1', 40, 100, {
    label: 'Incoming webhook',
    kind: 'trigger',
    stepType: 'incoming_webhook',
  }),
  n('a1', 320, 100, {
    label: 'Post message',
    kind: 'action',
    stepType: 'post_message',
    verb: 'create',
    fields: { message: 'Deploy alert: {{.Payload.status}}' },
  }),
];

const webhookEdges: WorkflowEdge[] = [e('e1', 't1', 'a1')];

export const SYSTEM_TAGS = [
  'onboarding',
  'moderation',
  'notification',
  'integration',
  'reminder',
  'interactive',
  'ai',
  'example',
] as const;

export const INITIAL_AUTOMATIONS: Automation[] = [
  {
    id: 'auto-urgent',
    name: 'Urgent Message Alert',
    status: 'enabled',
    scope: 'global',
    tags: ['notification', 'urgent'],
    creator: '@dev',
    lastEditedBy: '@dev',
    lastEditedAt: '2026-07-20T18:20:29.000Z',
    lastRunAt: '2026-07-20T18:20:29.000Z',
    lastRunStatus: 'success',
    favorite: true,
    nodes: urgentNodes,
    edges: urgentEdges,
  },
  {
    id: 'auto-welcome',
    name: 'Welcome new team members',
    status: 'enabled',
    scope: 'team',
    tags: ['onboarding'],
    creator: '@maya',
    lastEditedBy: '@maya',
    lastEditedAt: '2026-07-18T14:10:00.000Z',
    lastRunAt: '2026-07-19T09:02:11.000Z',
    lastRunStatus: 'success',
    favorite: true,
    nodes: welcomeNodes,
    edges: welcomeEdges,
  },
  {
    id: 'auto-standup',
    name: 'Scheduled standup reminder',
    status: 'enabled',
    scope: 'channel',
    tags: ['reminder'],
    creator: '@dev',
    lastEditedBy: '@dev',
    lastEditedAt: '2026-07-15T11:00:00.000Z',
    lastRunAt: '2026-07-21T13:00:00.000Z',
    lastRunStatus: 'success',
    favorite: false,
    nodes: standupNodes,
    edges: standupEdges,
  },
  {
    id: 'auto-banned',
    name: 'Block banned words',
    status: 'disabled',
    scope: 'global',
    tags: ['moderation'],
    creator: '@sec',
    lastEditedBy: '@sec',
    lastEditedAt: '2026-07-12T16:40:00.000Z',
    lastRunAt: '2026-07-12T16:41:00.000Z',
    lastRunStatus: 'failed',
    favorite: false,
    nodes: bannedNodes,
    edges: bannedEdges,
  },
  {
    id: 'auto-announce',
    name: 'Announce new channels',
    status: 'enabled',
    scope: 'global',
    tags: ['notification'],
    creator: '@maya',
    lastEditedBy: '@dev',
    lastEditedAt: '2026-07-10T08:15:00.000Z',
    lastRunAt: '2026-07-17T10:22:00.000Z',
    lastRunStatus: 'success',
    favorite: false,
    nodes: announceNodes,
    edges: announceEdges,
  },
  {
    id: 'auto-channel-welcome',
    name: 'Welcome message for new channels',
    status: 'draft',
    scope: 'channel',
    tags: ['onboarding'],
    creator: '@dev',
    lastEditedBy: '@dev',
    lastEditedAt: '2026-07-21T12:00:00.000Z',
    lastRunAt: null,
    lastRunStatus: null,
    favorite: false,
    nodes: channelWelcomeNodes,
    edges: channelWelcomeEdges,
  },
  {
    id: 'auto-keyword',
    name: 'Keyword alert',
    status: 'enabled',
    scope: 'team',
    tags: ['notification', 'moderation'],
    creator: '@sec',
    lastEditedBy: '@sec',
    lastEditedAt: '2026-07-09T19:30:00.000Z',
    lastRunAt: '2026-07-20T07:45:00.000Z',
    lastRunStatus: 'success',
    favorite: false,
    nodes: keywordNodes,
    edges: keywordEdges,
  },
  {
    id: 'auto-feedback',
    name: 'Feedback form',
    status: 'disabled',
    scope: 'global',
    tags: ['interactive', 'example'],
    creator: '@dev',
    lastEditedBy: '@dev',
    lastEditedAt: '2026-07-08T13:05:00.000Z',
    lastRunAt: '2026-07-08T13:10:00.000Z',
    lastRunStatus: 'success',
    favorite: false,
    nodes: feedbackNodes,
    edges: feedbackEdges,
  },
];

export const TEMPLATES: Template[] = [
  {
    id: 'tpl-welcome',
    category: 'Onboarding',
    name: 'Welcome new teammates',
    description: 'When a user joins a team, send them a welcome DM with onboarding links.',
    accent: '#1c58d9',
    tags: ['onboarding'],
    scope: 'team',
    nodes: welcomeNodes,
    edges: welcomeEdges,
  },
  {
    id: 'tpl-keyword',
    category: 'Moderation',
    name: 'Keyword alert',
    description: 'When a message contains a keyword, react and notify admins.',
    accent: '#cc8b00',
    tags: ['moderation', 'notification'],
    scope: 'team',
    nodes: keywordNodes,
    edges: keywordEdges,
  },
  {
    id: 'tpl-standup',
    category: 'Reminders',
    name: 'Scheduled standup reminder',
    description: 'Every weekday at 9am, post a standup reminder in a channel.',
    accent: '#3db887',
    tags: ['reminder'],
    scope: 'channel',
    nodes: standupNodes,
    edges: standupEdges,
  },
  {
    id: 'tpl-banned',
    category: 'Moderation',
    name: 'Block banned words',
    description: 'Flag messages that match a banned-word list for review.',
    accent: '#d24b4b',
    tags: ['moderation'],
    scope: 'global',
    nodes: bannedNodes,
    edges: bannedEdges,
  },
  {
    id: 'tpl-announce',
    category: 'Notifications',
    name: 'Announce new channels',
    description: 'When a channel is created, announce it in a directory channel.',
    accent: '#5d89ea',
    tags: ['notification'],
    scope: 'global',
    nodes: announceNodes,
    edges: announceEdges,
  },
  {
    id: 'tpl-channel-welcome',
    category: 'Onboarding',
    name: 'Welcome message for new channels',
    description: 'When someone joins a channel, post a welcome message.',
    accent: '#1c58d9',
    tags: ['onboarding'],
    scope: 'channel',
    nodes: channelWelcomeNodes,
    edges: channelWelcomeEdges,
  },
];

export const INITIAL_RUNS: AutomationRun[] = [
  {
    id: 'run-1',
    automationId: 'auto-urgent',
    status: 'success',
    startedAt: '2026-07-20T18:22:39.000Z',
    durationMs: 842,
    triggerPayload: {
      display_name: 'Town Square',
      channel_id: 'chn_townsquare',
      user_id: 'usr_alex',
      message: 'urgent - i need more coffee',
      create_at: 1721509359000,
    },
    steps: [
      {
        id: 'cond1',
        label: 'Condition',
        status: 'success',
        input: { left: '{{.Post.message}}', operator: 'contains', right: 'urgent' },
        output: { left: 'urgent - i need more coffee', result: true, right: 'urgent' },
      },
      {
        id: 'react1',
        label: 'Add reaction',
        status: 'success',
        input: { post_id: 'pst_123', emoji: 'rotating_light' },
        output: { ok: true },
      },
      {
        id: 'members1',
        label: 'Get channel members',
        status: 'success',
        input: { channel_id: 'chn_townsquare' },
        output: { count: 12 },
      },
      {
        id: 'dm1',
        label: 'Direct message user',
        status: 'success',
        input: { recipients: 12 },
        output: { sent: 12 },
      },
    ],
  },
  {
    id: 'run-2',
    automationId: 'auto-urgent',
    status: 'success',
    startedAt: '2026-07-20T18:20:29.000Z',
    durationMs: 610,
    triggerPayload: {
      display_name: 'Incidents',
      message: 'This is urgent — page oncall',
    },
    steps: [
      {
        id: 'cond1',
        label: 'Condition',
        status: 'success',
        input: { result: true },
        output: { result: true },
      },
    ],
  },
  {
    id: 'run-3',
    automationId: 'auto-welcome',
    status: 'success',
    startedAt: '2026-07-19T09:02:11.000Z',
    durationMs: 320,
    triggerPayload: { user: 'jamie', team: 'Engineering' },
    steps: [
      {
        id: 'dm1',
        label: 'Direct message user',
        status: 'success',
        input: { user: 'jamie' },
        output: { sent: true },
      },
    ],
  },
  {
    id: 'run-4',
    automationId: 'auto-standup',
    status: 'success',
    startedAt: '2026-07-21T13:00:00.000Z',
    durationMs: 180,
    triggerPayload: { schedule: 'weekday-9am' },
    steps: [
      {
        id: 'post1',
        label: 'Post message',
        status: 'success',
        input: { channel: 'engineering' },
        output: { post_id: 'pst_standup' },
      },
    ],
  },
  {
    id: 'run-5',
    automationId: 'auto-banned',
    status: 'failed',
    startedAt: '2026-07-12T16:41:00.000Z',
    durationMs: 95,
    triggerPayload: { message: '…' },
    steps: [
      {
        id: 'cond1',
        label: 'Condition',
        status: 'failed',
        input: { list: 'banned_words' },
        output: { error: 'Word list not found' },
      },
    ],
  },
  {
    id: 'run-6',
    automationId: 'auto-announce',
    status: 'success',
    startedAt: '2026-07-17T10:22:00.000Z',
    durationMs: 210,
    triggerPayload: { channel: 'project-nova' },
    steps: [
      {
        id: 'post1',
        label: 'Post message',
        status: 'success',
        input: {},
        output: { ok: true },
      },
    ],
  },
  {
    id: 'run-7',
    automationId: 'auto-keyword',
    status: 'success',
    startedAt: '2026-07-20T07:45:00.000Z',
    durationMs: 440,
    triggerPayload: { message: 'Need an escalation path' },
    steps: [
      {
        id: 'cond1',
        label: 'Condition',
        status: 'success',
        input: {},
        output: { result: true },
      },
    ],
  },
  {
    id: 'run-8',
    automationId: 'auto-feedback',
    status: 'success',
    startedAt: '2026-07-08T13:10:00.000Z',
    durationMs: 500,
    triggerPayload: { command: '/feedback' },
    steps: [
      {
        id: 'dialog1',
        label: 'Open dialog',
        status: 'success',
        input: {},
        output: { opened: true },
      },
    ],
  },
  {
    id: 'run-9',
    automationId: 'auto-urgent',
    status: 'failed',
    startedAt: '2026-07-18T11:11:00.000Z',
    durationMs: 1200,
    triggerPayload: { message: 'urgent outage' },
    steps: [
      {
        id: 'dm1',
        label: 'Direct message user',
        status: 'failed',
        input: {},
        output: { error: 'Rate limited' },
      },
    ],
  },
  {
    id: 'run-10',
    automationId: 'auto-standup',
    status: 'success',
    startedAt: '2026-07-20T13:00:00.000Z',
    durationMs: 175,
    triggerPayload: { schedule: 'weekday-9am' },
    steps: [
      {
        id: 'post1',
        label: 'Post message',
        status: 'success',
        input: {},
        output: { ok: true },
      },
    ],
  },
];

export const INITIAL_HISTORY: ChangeRevision[] = [
  {
    id: 'rev-urgent-2',
    automationId: 'auto-urgent',
    revision: 2,
    change: 'Enabled',
    by: 'uh6i3muofidg5ek79d76rducuw',
    when: '2026-07-20T18:22:29.000Z',
  },
  {
    id: 'rev-urgent-1',
    automationId: 'auto-urgent',
    revision: 1,
    change: 'Created',
    by: 'uh6i3muofidg5ek79d76rducuw',
    when: '2026-07-20T18:21:50.000Z',
  },
  {
    id: 'rev-welcome-2',
    automationId: 'auto-welcome',
    revision: 2,
    change: 'Updated welcome message',
    by: '@maya',
    when: '2026-07-18T14:10:00.000Z',
  },
  {
    id: 'rev-welcome-1',
    automationId: 'auto-welcome',
    revision: 1,
    change: 'Created',
    by: '@maya',
    when: '2026-07-01T10:00:00.000Z',
  },
  {
    id: 'rev-standup-1',
    automationId: 'auto-standup',
    revision: 1,
    change: 'Created',
    by: '@dev',
    when: '2026-07-15T11:00:00.000Z',
  },
  {
    id: 'rev-banned-2',
    automationId: 'auto-banned',
    revision: 2,
    change: 'Disabled',
    by: '@sec',
    when: '2026-07-12T16:40:00.000Z',
  },
  {
    id: 'rev-banned-1',
    automationId: 'auto-banned',
    revision: 1,
    change: 'Created',
    by: '@sec',
    when: '2026-07-11T09:00:00.000Z',
  },
];

/** Graph used by the AI demo happy path (urgent-style flow). */
export const AI_DEMO_GRAPH = {
  nodes: urgentNodes,
  edges: urgentEdges,
};

export const WEBHOOK_TEMPLATE_GRAPH = {
  nodes: webhookNodes,
  edges: webhookEdges,
};

export function cloneGraph(nodes: WorkflowNode[], edges: WorkflowEdge[]) {
  return {
    nodes: nodes.map((node) => ({
      ...node,
      data: { ...node.data, fields: node.data.fields ? { ...node.data.fields } : undefined },
      position: { ...node.position },
    })),
    edges: edges.map((edge) => ({ ...edge })),
  };
}

export function createBlankAutomation(id: string): Automation {
  return {
    id,
    name: 'Untitled automation',
    status: 'draft',
    scope: 'global',
    tags: [],
    creator: '@dev',
    lastEditedBy: '@dev',
    lastEditedAt: new Date().toISOString(),
    lastRunAt: null,
    lastRunStatus: null,
    favorite: false,
    nodes: [],
    edges: [],
  };
}

export function createFromTemplate(template: Template, id: string): Automation {
  const graph = cloneGraph(template.nodes, template.edges);
  return {
    id,
    name: `${template.name} (imported)`,
    status: 'draft',
    scope: template.scope,
    tags: [...template.tags],
    creator: '@dev',
    lastEditedBy: '@dev',
    lastEditedAt: new Date().toISOString(),
    lastRunAt: null,
    lastRunStatus: null,
    favorite: false,
    nodes: graph.nodes,
    edges: graph.edges,
  };
}
