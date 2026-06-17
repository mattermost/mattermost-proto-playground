import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarAiko from '@/assets/avatars/Aiko Tan.png';
import avatarArjun from '@/assets/avatars/Arjun Patel.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarMatty from '@/assets/avatars/Matty.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarEthan from '@/assets/avatars/Ethan Brooks.png';

/** The four automation kinds the Agent can build. */
export type AutomationType =
  | 'recurring-post'
  | 'recap'
  | 'auto-responder'
  | 'custom';

/** Icon keys resolved to compass icons in the component layer (data stays presentation-free). */
export type AutomationIconKey = 'clock' | 'recap' | 'responder' | 'custom';

export interface AutomationTypeMeta {
  type: AutomationType;
  label: string;
  /** Label used in the Automations submenu create actions. */
  menuLabel: string;
  description: string;
  iconKey: AutomationIconKey;
}

export const AUTOMATION_TYPES: AutomationTypeMeta[] = [
  {
    type: 'recurring-post',
    label: 'Recurring post',
    menuLabel: 'Create a recurring post',
    description: 'Post a message to this channel on a schedule.',
    iconKey: 'clock',
  },
  {
    type: 'recap',
    label: 'Automated recap',
    menuLabel: 'Create an automated recap',
    description: 'Summarize channel activity on a schedule.',
    iconKey: 'recap',
  },
  {
    type: 'auto-responder',
    label: 'Auto-responder',
    menuLabel: 'Create an auto-responder',
    description: 'Reply automatically when conditions are met.',
    iconKey: 'responder',
  },
  {
    type: 'custom',
    label: 'Custom automation',
    menuLabel: 'Create a custom automation',
    description: 'Describe what you want in your own words.',
    iconKey: 'custom',
  },
];

export const AUTOMATION_TYPE_META: Record<AutomationType, AutomationTypeMeta> =
  AUTOMATION_TYPES.reduce(
    (acc, meta) => {
      acc[meta.type] = meta;
      return acc;
    },
    {} as Record<AutomationType, AutomationTypeMeta>,
  );

/* ------------------------------------------------------------------ */
/* Trigger model — every automation runs either on a schedule or in    */
/* response to an event (Cursor-style). The structured config lets the */
/* create/edit form round-trip; `trigger` is the derived summary.      */
/* ------------------------------------------------------------------ */

export type TriggerKind = 'schedule' | 'event';

export type ScheduleFrequency = 'weekdays' | 'daily' | 'weekly' | 'monthly';
export type EventType =
  | 'mention'
  | 'keyword'
  | 'message'
  | 'join'
  | 'channel-created';

/** Trigger types offered in the create/edit picker. */
export type TriggerPickerOption =
  | 'schedule'
  | 'message'
  | 'join'
  | 'channel-created';

export interface TriggerPickerOptionMeta {
  id: TriggerPickerOption;
  label: string;
  description: string;
}

export const TRIGGER_PICKER_OPTIONS: TriggerPickerOptionMeta[] = [
  {
    id: 'schedule',
    label: 'At a scheduled date and time',
    description: 'Start this action based on a scheduled date or time',
  },
  {
    id: 'message',
    label: 'A message is posted in a channel',
    description: 'Start when a new message is posted in this channel',
  },
  {
    id: 'join',
    label: 'Someone joins a channel',
    description: 'Start when a new member joins this channel',
  },
  {
    id: 'channel-created',
    label: 'A new channel is created',
    description: 'Start when a new channel is created in the team',
  },
];

export const TRIGGER_PICKER_META: Record<
  TriggerPickerOption,
  TriggerPickerOptionMeta
> = TRIGGER_PICKER_OPTIONS.reduce(
  (acc, option) => {
    acc[option.id] = option;
    return acc;
  },
  {} as Record<TriggerPickerOption, TriggerPickerOptionMeta>,
);

export const SCHEDULE_FREQUENCY_LABELS: Record<ScheduleFrequency, string> = {
  weekdays: 'Weekdays',
  daily: 'Every day',
  weekly: 'Mondays',
  monthly: 'On the 1st of each month',
};

/** Times offered in the schedule picker. */
export const SCHEDULE_TIMES = [
  '8:00 AM',
  '9:00 AM',
  '12:00 PM',
  '5:00 PM',
] as const;

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  mention: 'When the agent is @mentioned',
  keyword: 'When a keyword is posted',
  message: 'A message is posted in a channel',
  join: 'Someone joins a channel',
  'channel-created': 'A new channel is created',
};

export interface ScheduleTrigger {
  kind: 'schedule';
  frequency: ScheduleFrequency;
  /** One of SCHEDULE_TIMES. */
  time: string;
}

export interface EventTrigger {
  kind: 'event';
  event: EventType;
  /** Required when `event` is 'keyword'. */
  keyword?: string;
}

export type TriggerConfig = ScheduleTrigger | EventTrigger;

/** Map structured trigger config to the picker option, when supported. */
export function triggerConfigToPickerOption(
  config: TriggerConfig | undefined,
): TriggerPickerOption | null {
  if (config == null) return null;
  if (config.kind === 'schedule') return 'schedule';
  if (config.event === 'message' || config.event === 'keyword') return 'message';
  if (config.event === 'join') return 'join';
  if (config.event === 'channel-created') return 'channel-created';
  return null;
}

/** Apply a picker selection onto draft trigger fields. */
export function applyTriggerPickerOption(option: TriggerPickerOption): {
  kind: TriggerKind;
  event: EventType;
} {
  if (option === 'schedule') {
    return { kind: 'schedule', event: 'mention' };
  }
  if (option === 'message') {
    return { kind: 'event', event: 'message' };
  }
  if (option === 'join') {
    return { kind: 'event', event: 'join' };
  }
  return { kind: 'event', event: 'channel-created' };
}

export function triggerPickerNeedsChannel(option: TriggerPickerOption | null): boolean {
  return option === 'message' || option === 'join';
}

/** Build the human-readable trigger summary shown in lists. */
export function triggerSummary(t: TriggerConfig): string {
  if (t.kind === 'schedule') {
    return `${SCHEDULE_FREQUENCY_LABELS[t.frequency]} at ${t.time}`;
  }
  if (t.event === 'keyword') {
    return t.keyword
      ? `When “${t.keyword}” is posted`
      : EVENT_TYPE_LABELS.keyword;
  }
  return EVENT_TYPE_LABELS[t.event];
}

/** Pick the list-item icon/category from the trigger kind. */
export function triggerToType(t: TriggerConfig): AutomationType {
  return t.kind === 'schedule' ? 'recurring-post' : 'auto-responder';
}

/* ------------------------------------------------------------------ */
/* Scope — which channels a run is allowed to touch. An automation can  */
/* reach a channel directly, via its team, or via a channel attribute.  */
/* Tools are NOT part of scope: they're inherited from the agent.       */
/* ------------------------------------------------------------------ */

export interface AutomationScope {
  /** Channels the automation is explicitly scoped to. */
  channelIds?: string[];
  /** Teams whose channels the automation covers. */
  teamIds?: string[];
  /** Channel attributes (e.g. 'design') the automation covers. */
  attributes?: string[];
}

export interface ChannelContext {
  id: string;
  name: string;
  teamId: string;
  teamName: string;
  attributes: string[];
}

/** The channel the prototype's channel scenes render. */
export const ACTIVE_CHANNEL: ChannelContext = {
  id: 'ux-design',
  name: 'UX Design',
  teamId: 'contributors',
  teamName: 'Contributors',
  attributes: ['design'],
};

/** Channels offered when a trigger applies to a specific channel. */
export const AUTOMATION_CHANNEL_OPTIONS = [
  { id: 'ux-design', label: 'UX Design' },
  { id: 'ui-redesign', label: 'UI Redesign' },
  { id: 'orion', label: 'Orion' },
  { id: 'release-discussion', label: 'Release Discussion' },
  { id: 'softphone-ux', label: 'softphone-ux' },
] as const;

export interface Automation {
  id: string;
  name: string;
  type: AutomationType;
  /** Structured trigger — drives both the summary and the edit form. */
  triggerConfig: TriggerConfig;
  /** Human-readable trigger summary, e.g. "Weekdays at 9:00 AM". */
  trigger: string;
  /** Natural-language instructions the agent runs when the automation fires. */
  instructions: string;
  /** Channels/teams/attributes this run is allowed to touch. */
  scope: AutomationScope;
  enabled: boolean;
  /** Last run summary, or null when it hasn't run yet. */
  lastRun: string | null;
  createdBy: string;
}

/** The editable shape produced by the create/edit form. */
export interface AutomationDraft {
  name: string;
  triggerConfig: TriggerConfig;
  instructions: string;
  enabled: boolean;
  /** Channel the trigger watches, when the trigger type requires one. */
  triggerChannelId?: string;
}

/** Assemble a full automation from a form draft. */
export function draftToAutomation(draft: AutomationDraft, id: string): Automation {
  return {
    id,
    name: draft.name.trim(),
    type: triggerToType(draft.triggerConfig),
    triggerConfig: draft.triggerConfig,
    trigger: triggerSummary(draft.triggerConfig),
    instructions: draft.instructions.trim(),
    scope: draft.triggerChannelId
      ? { channelIds: [draft.triggerChannelId] }
      : { channelIds: [ACTIVE_CHANNEL.id] },
    enabled: draft.enabled,
    lastRun: null,
    createdBy: 'You',
  };
}

/** Apply a form draft onto an existing automation (preserves id / run history). */
export function applyDraft(automation: Automation, draft: AutomationDraft): Automation {
  return {
    ...automation,
    name: draft.name.trim(),
    type: triggerToType(draft.triggerConfig),
    triggerConfig: draft.triggerConfig,
    trigger: triggerSummary(draft.triggerConfig),
    instructions: draft.instructions.trim(),
    enabled: draft.enabled,
    ...(draft.triggerChannelId
      ? { scope: { channelIds: [draft.triggerChannelId] } }
      : {}),
  };
}

export const INITIAL_AUTOMATIONS: Automation[] = [
  {
    id: 'standup',
    scope: { channelIds: ['ux-design'] },
    name: 'Daily standup prompt',
    type: 'recurring-post',
    triggerConfig: { kind: 'schedule', frequency: 'weekdays', time: '9:00 AM' },
    trigger: 'Weekdays at 9:00 AM',
    instructions:
      'Post a friendly reminder asking the team to drop their standup update in the thread before 10:00 AM.',
    enabled: true,
    lastRun: 'Today at 9:00 AM',
    createdBy: 'Matty (Agent)',
  },
  {
    id: 'weekly-digest',
    scope: { teamIds: ['contributors'] },
    name: 'Weekly design digest',
    type: 'recurring-post',
    triggerConfig: { kind: 'schedule', frequency: 'weekly', time: '8:00 AM' },
    trigger: 'Mondays at 8:00 AM',
    instructions:
      'Summarize the past week of activity in this channel — decisions, shipped work, and open questions — and post the recap.',
    enabled: true,
    lastRun: 'Mon at 8:00 AM',
    createdBy: 'Matty (Agent)',
  },
  {
    id: 'after-hours',
    scope: { attributes: ['design'] },
    name: 'After-hours auto-reply',
    type: 'auto-responder',
    triggerConfig: { kind: 'event', event: 'mention' },
    trigger: 'When the agent is @mentioned',
    instructions:
      'Reply letting the sender know the team is offline and will respond during business hours.',
    enabled: false,
    lastRun: null,
    createdBy: 'Matty (Agent)',
  },
];

/* ------------------------------------------------------------------ */
/* Channel message fixtures                                            */
/* ------------------------------------------------------------------ */

export interface ChannelMessage {
  id: string;
  avatarSrc: string;
  username: string;
  timestamp: string;
  isBot?: boolean;
  body: string;
  reactions?: { emoji: string; count: number; byCurrentUser?: boolean }[];
}

export const CHANNEL_MESSAGES: ChannelMessage[] = [
  {
    id: 'm1',
    avatarSrc: avatarSofia,
    username: 'Sofia Bauer',
    timestamp: '9:02 AM',
    body: 'Morning all — kicking off the in-app purchases redesign today. Specs are in the thread below.',
  },
  {
    id: 'm2',
    avatarSrc: avatarMarco,
    username: 'Marco Rinaldi',
    timestamp: '9:14 AM',
    body: 'Pushed the updated onboarding flow to staging — would love a second pair of eyes on the empty states before we cut a release.',
  },
  {
    id: 'm3',
    avatarSrc: avatarArjun,
    username: 'Arjun Patel',
    timestamp: '9:33 AM',
    body: 'Here is the latest Mobile User Analytics report I put together. Numbers look healthy across the funnel.',
    reactions: [
      { emoji: '👍', count: 3 },
      { emoji: '🎉', count: 2, byCurrentUser: true },
    ],
  },
  {
    id: 'm4',
    avatarSrc: avatarAiko,
    username: 'Aiko Tan',
    timestamp: '9:47 AM',
    body: 'Nice work everyone. I can take a pass after standup — the new illustrations really tie the flow together.',
  },
  {
    id: 'm5',
    avatarSrc: avatarLeonard,
    username: 'Leonard Riley',
    timestamp: '10:12 AM',
    body: 'Think we could have the GitLab build pipeline trigger a heads-up here when a release is cut?',
  },
];

export interface Agent {
  id: string;
  /** Display name shown in lists and headers, e.g. "DevOps Agent". */
  displayName: string;
  /** Mention handle without the @ prefix. */
  username: string;
  avatarSrc: string;
  activeMcps: number;
  toolCount: number;
  /** When true, the agent appears under the "Your agents" tab. */
  ownedByCurrentUser?: boolean;
}

export const AGENTS: Agent[] = [
  {
    id: 'matty',
    displayName: 'Matty',
    username: 'matty',
    avatarSrc: avatarMatty,
    activeMcps: 3,
    toolCount: 12,
    ownedByCurrentUser: true,
  },
  {
    id: 'devops',
    displayName: 'DevOps Agent',
    username: 'devops-agent',
    avatarSrc: avatarArjun,
    activeMcps: 4,
    toolCount: 16,
  },
  {
    id: 'cloudops',
    displayName: 'CloudOps Agent',
    username: 'cloudops-agent',
    avatarSrc: avatarEthan,
    activeMcps: 8,
    toolCount: 24,
  },
  {
    id: 'insights',
    displayName: 'Data Insights Agent',
    username: 'insights-agent',
    avatarSrc: avatarAiko,
    activeMcps: 5,
    toolCount: 20,
  },
  {
    id: 'tracker',
    displayName: 'Project Tracker Agent',
    username: 'task-agent',
    avatarSrc: avatarSofia,
    activeMcps: 2,
    toolCount: 7,
  },
];

/** The default agent used in channel RHS panels and automation fixtures. */
export const AGENT = AGENTS[0];

export function agentById(id: string): Agent | undefined {
  return AGENTS.find((a) => a.id === id);
}

/** The current user, shown as the author of replies in agent chats. */
export const CURRENT_USER = {
  name: 'You',
  avatarSrc: avatarEmma,
};
