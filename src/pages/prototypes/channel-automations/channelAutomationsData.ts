import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarAiko from '@/assets/avatars/Aiko Tan.png';
import avatarArjun from '@/assets/avatars/Arjun Patel.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarMatty from '@/assets/avatars/Matty.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarEthan from '@/assets/avatars/Ethan Brooks.png';
import type { UserAvatarFallbackColor } from '@mattermost/compass-ui';

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

/** Default draft fields when creating from an Agents-menu automation type. */
export interface AutomationTypeSeed {
  name: string;
  triggerConfig: TriggerConfig;
  instructions: string;
}

export function seedForAutomationType(type: AutomationType): AutomationTypeSeed {
  const meta = AUTOMATION_TYPE_META[type];

  switch (type) {
    case 'recurring-post':
      return {
        name: meta.label,
        triggerConfig: { kind: 'schedule', frequency: 'daily', time: '9:00 AM' },
        instructions: meta.description,
      };
    case 'recap':
      return {
        name: meta.label,
        triggerConfig: {
          kind: 'schedule',
          frequency: 'weekly',
          weekday: 'monday',
          time: '8:00 AM',
        },
        instructions: meta.description,
      };
    case 'auto-responder':
      return {
        name: meta.label,
        triggerConfig: { kind: 'event', event: 'mention' },
        instructions: meta.description,
      };
    case 'custom':
      return {
        name: '',
        triggerConfig: { kind: 'schedule', frequency: 'daily', time: '9:00 AM' },
        instructions: '',
      };
  }
}

/* ------------------------------------------------------------------ */
/* Trigger model — every automation runs either on a schedule or in    */
/* response to an event (Cursor-style). The structured config lets the */
/* create/edit form round-trip; `trigger` is the derived summary.      */
/* ------------------------------------------------------------------ */

export type TriggerKind = 'schedule' | 'event' | 'playbook-event';

export type ScheduleFrequency = 'hourly' | 'daily' | 'weekly';

export type ScheduleWeekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type EventType =
  | 'mention'
  | 'keyword'
  | 'message'
  | 'join'
  | 'channel-created';

export type PlaybookEventType =
  | 'run-started'
  | 'run-finished'
  | 'task-checked'
  | 'task-unchecked';

/** Trigger types offered in the create/edit picker. */
export type TriggerPickerOption =
  | 'schedule'
  | 'message'
  | 'join'
  | 'channel-created'
  | 'playbook-run-started'
  | 'playbook-run-finished'
  | 'playbook-task-checked'
  | 'playbook-task-unchecked';

export type TriggerPickerGroupId = 'schedule' | 'channels' | 'playbooks';

export interface TriggerPickerOptionMeta {
  id: TriggerPickerOption;
  label: string;
  description: string;
  group: TriggerPickerGroupId;
}

export interface TriggerPickerGroupMeta {
  id: TriggerPickerGroupId;
  label: string;
}

export const TRIGGER_PICKER_GROUPS: TriggerPickerGroupMeta[] = [
  { id: 'schedule', label: 'Schedule' },
  { id: 'channels', label: 'Channels' },
  { id: 'playbooks', label: 'Playbooks' },
];

export const TRIGGER_PICKER_OPTIONS: TriggerPickerOptionMeta[] = [
  {
    id: 'schedule',
    label: 'At a scheduled date and time',
    description: 'Start this action based on a scheduled date or time',
    group: 'schedule',
  },
  {
    id: 'message',
    label: 'A message is posted in a channel',
    description: 'Start when a new message is posted in this channel',
    group: 'channels',
  },
  {
    id: 'join',
    label: 'Someone joins a channel',
    description: 'Start when a new member joins this channel',
    group: 'channels',
  },
  {
    id: 'channel-created',
    label: 'A new channel is created',
    description: 'Start when a new channel is created in the team',
    group: 'channels',
  },
  {
    id: 'playbook-run-started',
    label: 'A playbook run starts',
    description: 'Start when someone kicks off a playbook run',
    group: 'playbooks',
  },
  {
    id: 'playbook-run-finished',
    label: 'A playbook run finishes',
    description: 'Start when a playbook run is marked complete',
    group: 'playbooks',
  },
  {
    id: 'playbook-task-checked',
    label: 'A playbook task is checked',
    description: 'Start when someone checks off a task in a run',
    group: 'playbooks',
  },
  {
    id: 'playbook-task-unchecked',
    label: 'A playbook task is unchecked',
    description: 'Start when someone clears a checked task in a run',
    group: 'playbooks',
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
  hourly: 'Hourly',
  daily: 'Daily',
  weekly: 'Weekly',
};

export const SCHEDULE_WEEKDAY_LABELS: Record<ScheduleWeekday, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export const SCHEDULE_WEEKDAYS = Object.keys(
  SCHEDULE_WEEKDAY_LABELS,
) as ScheduleWeekday[];

/** Times offered in the schedule picker. */
export const SCHEDULE_TIMES = [
  '8:00 AM',
  '9:00 AM',
  '12:00 PM',
  '5:00 PM',
] as const;

export function scheduleNeedsWeekday(frequency: ScheduleFrequency): boolean {
  return frequency === 'weekly';
}

export function scheduleNeedsTime(frequency: ScheduleFrequency): boolean {
  return frequency === 'daily' || frequency === 'weekly';
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  mention: 'When the agent is @mentioned',
  keyword: 'When a keyword is posted',
  message: 'A message is posted in a channel',
  join: 'Someone joins a channel',
  'channel-created': 'A new channel is created',
};

export const PLAYBOOK_EVENT_LABELS: Record<PlaybookEventType, string> = {
  'run-started': 'When a playbook run starts',
  'run-finished': 'When a playbook run finishes',
  'task-checked': 'When a playbook task is checked',
  'task-unchecked': 'When a playbook task is unchecked',
};

export interface AutomationPlaybookOption {
  id: string;
  label: string;
}

/** Playbooks offered when configuring a playbook trigger. */
export const AUTOMATION_PLAYBOOK_OPTIONS: AutomationPlaybookOption[] = [
  { id: 'incident-response', label: 'Incident response' },
  { id: 'release-checklist', label: 'Release checklist' },
  { id: 'team-onboarding', label: 'Team onboarding' },
];

export function playbookLabelById(id: string): string {
  return AUTOMATION_PLAYBOOK_OPTIONS.find((playbook) => playbook.id === id)?.label ?? id;
}

export interface ScheduleTrigger {
  kind: 'schedule';
  frequency: ScheduleFrequency;
  /** Required for daily and weekly. One of SCHEDULE_TIMES. */
  time?: string;
  /** Required for weekly. */
  weekday?: ScheduleWeekday;
}

export interface EventTrigger {
  kind: 'event';
  event: EventType;
  /** Required when `event` is 'keyword'. */
  keyword?: string;
}

export interface PlaybookEventTrigger {
  kind: 'playbook-event';
  event: PlaybookEventType;
  /** When omitted, the trigger applies to any playbook. */
  playbookId?: string;
}

export type TriggerConfig = ScheduleTrigger | EventTrigger | PlaybookEventTrigger;

const PLAYBOOK_PICKER_TO_EVENT: Record<
  Extract<
    TriggerPickerOption,
    | 'playbook-run-started'
    | 'playbook-run-finished'
    | 'playbook-task-checked'
    | 'playbook-task-unchecked'
  >,
  PlaybookEventType
> = {
  'playbook-run-started': 'run-started',
  'playbook-run-finished': 'run-finished',
  'playbook-task-checked': 'task-checked',
  'playbook-task-unchecked': 'task-unchecked',
};

export function playbookEventToPickerOption(
  event: PlaybookEventType,
): TriggerPickerOption {
  switch (event) {
    case 'run-started':
      return 'playbook-run-started';
    case 'run-finished':
      return 'playbook-run-finished';
    case 'task-checked':
      return 'playbook-task-checked';
    default:
      return 'playbook-task-unchecked';
  }
}

export function triggerPickerIsPlaybook(option: TriggerPickerOption | null): boolean {
  return (
    option === 'playbook-run-started' ||
    option === 'playbook-run-finished' ||
    option === 'playbook-task-checked' ||
    option === 'playbook-task-unchecked'
  );
}

/** Map structured trigger config to the picker option, when supported. */
export function triggerConfigToPickerOption(
  config: TriggerConfig | undefined,
): TriggerPickerOption | null {
  if (config == null) return null;
  if (config.kind === 'schedule') return 'schedule';
  if (config.kind === 'playbook-event') {
    return playbookEventToPickerOption(config.event);
  }
  if (config.event === 'message' || config.event === 'keyword') return 'message';
  if (config.event === 'join') return 'join';
  if (config.event === 'channel-created') return 'channel-created';
  return null;
}

/** Apply a picker selection onto draft trigger fields. */
export function applyTriggerPickerOption(option: TriggerPickerOption): {
  kind: TriggerKind;
  event: EventType;
  playbookEvent: PlaybookEventType;
} {
  if (option === 'schedule') {
    return { kind: 'schedule', event: 'mention', playbookEvent: 'run-started' };
  }
  if (option === 'message') {
    return { kind: 'event', event: 'message', playbookEvent: 'run-started' };
  }
  if (option === 'join') {
    return { kind: 'event', event: 'join', playbookEvent: 'run-started' };
  }
  if (option === 'channel-created') {
    return { kind: 'event', event: 'channel-created', playbookEvent: 'run-started' };
  }
  if (triggerPickerIsPlaybook(option)) {
    return {
      kind: 'playbook-event',
      event: 'mention',
      playbookEvent: PLAYBOOK_PICKER_TO_EVENT[option],
    };
  }
  return { kind: 'event', event: 'channel-created', playbookEvent: 'run-started' };
}

export function triggerPickerNeedsChannel(option: TriggerPickerOption | null): boolean {
  return option === 'message' || option === 'join';
}

export function triggerPickerNeedsPlaybook(option: TriggerPickerOption | null): boolean {
  return triggerPickerIsPlaybook(option);
}

export function buildTriggerConfig(params: {
  kind: TriggerKind;
  frequency: ScheduleFrequency;
  time: string;
  weekday: ScheduleWeekday;
  event: EventType;
  keyword: string;
  playbookEvent: PlaybookEventType;
  playbookId: string;
}): TriggerConfig {
  if (params.kind === 'schedule') {
    return {
      kind: 'schedule',
      frequency: params.frequency,
      ...(scheduleNeedsTime(params.frequency) ? { time: params.time } : {}),
      ...(scheduleNeedsWeekday(params.frequency)
        ? { weekday: params.weekday }
        : {}),
    };
  }
  if (params.kind === 'playbook-event') {
    return {
      kind: 'playbook-event',
      event: params.playbookEvent,
      ...(params.playbookId ? { playbookId: params.playbookId } : {}),
    };
  }
  return {
    kind: 'event',
    event: params.event,
    ...(params.event === 'keyword' ? { keyword: params.keyword.trim() } : {}),
  };
}

/** Build the human-readable trigger summary shown in lists. */
export function triggerSummary(t: TriggerConfig): string {
  if (t.kind === 'schedule') {
    if (t.frequency === 'hourly') {
      return SCHEDULE_FREQUENCY_LABELS.hourly;
    }
    if (t.frequency === 'daily') {
      return `Daily at ${t.time ?? '9:00 AM'}`;
    }
    const day =
      t.weekday != null ? SCHEDULE_WEEKDAY_LABELS[t.weekday] : 'Monday';
    return `Weekly on ${day}s at ${t.time ?? '9:00 AM'}`;
  }
  if (t.kind === 'playbook-event') {
    const label = PLAYBOOK_EVENT_LABELS[t.event];
    return t.playbookId ? `${label} · ${playbookLabelById(t.playbookId)}` : label;
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
  if (t.kind === 'schedule') return 'recurring-post';
  if (t.kind === 'playbook-event') return 'custom';
  return 'auto-responder';
}

/* ------------------------------------------------------------------ */
/* Scope — which channels a run is allowed to touch. An automation can  */
/* reach a channel directly, via its team, or via a channel attribute.  */
/* Options 1–3 / 3b: tools are agent-owned. Option 2b may also grant tools */
/* per automation (see AUTOMATION_GRANTABLE_TOOLS) without editing the  */
/* executor agent.                                                      */
/* ------------------------------------------------------------------ */

export interface AutomationScope {
  /** Channels the automation is explicitly scoped to. */
  channelIds?: string[];
  /** Teams whose channels the automation covers. */
  teamIds?: string[];
  /** Channel attributes (e.g. 'design') the automation covers. */
  attributes?: string[];
}

export interface AutomationGrantableTool {
  id: string;
  label: string;
  description: string;
  /** Pre-checked as a least-privilege default for typical tasks. */
  suggested: boolean;
}

/**
 * Option 2b — tools the creating user can grant on the automation itself.
 * These are independent of the chosen agent's permanent MCP set.
 */
export const AUTOMATION_GRANTABLE_TOOLS: AutomationGrantableTool[] = [
  {
    id: 'post-message',
    label: 'Post messages',
    description: 'Write into channels within this automation’s scope.',
    suggested: true,
  },
  {
    id: 'read-history',
    label: 'Read channel history',
    description: 'Read recent messages needed to draft a response.',
    suggested: true,
  },
  {
    id: 'github-issues',
    label: 'GitHub — issues',
    description: 'Create or update issues; grant only when the task needs it.',
    suggested: false,
  },
  {
    id: 'jira-tickets',
    label: 'Jira — tickets',
    description: 'Create or transition tickets via Atlassian MCP.',
    suggested: false,
  },
  {
    id: 'playbooks-run',
    label: 'Playbooks — start run',
    description: 'Start or update a playbook run from a trigger.',
    suggested: false,
  },
];

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
export type AutomationChannelType = 'public' | 'private';

export const AUTOMATION_CHANNEL_OPTIONS = [
  { id: 'ux-design', label: 'UX Design', type: 'public' as const },
  { id: 'ui-redesign', label: 'UI Redesign', type: 'public' as const },
  { id: 'orion', label: 'Orion', type: 'private' as const },
  { id: 'release-discussion', label: 'Release Discussion', type: 'public' as const },
  { id: 'softphone-ux', label: 'softphone-ux', type: 'private' as const },
] as const;

/** Teams offered when a trigger applies team-wide. */
export const AUTOMATION_TEAM_OPTIONS = [
  { id: 'contributors', label: 'Contributors' },
  { id: 'staff', label: 'Staff' },
] as const;

export function channelLabelById(channelId: string): string {
  return (
    AUTOMATION_CHANNEL_OPTIONS.find((channel) => channel.id === channelId)
      ?.label ?? channelId
  );
}

export function teamLabelById(teamId: string): string {
  return (
    AUTOMATION_TEAM_OPTIONS.find((team) => team.id === teamId)?.label ?? teamId
  );
}

export function draftScope(
  draft: Pick<AutomationDraft, 'triggerChannelId' | 'triggerTeamId'>,
): AutomationScope {
  if (draft.triggerTeamId) {
    return { teamIds: [draft.triggerTeamId] };
  }
  if (draft.triggerChannelId) {
    return { channelIds: [draft.triggerChannelId] };
  }
  return { channelIds: [ACTIVE_CHANNEL.id] };
}

export interface Automation {
  id: string;
  /** Agent that runs this automation (Options 1 & 2). */
  agentId: string;
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
  /** When true, the automation appears under the "Your automations" tab. */
  ownedByCurrentUser?: boolean;
}

/** The editable shape produced by the create/edit form. */
export interface AutomationDraft {
  agentId?: string;
  displayName?: string;
  username?: string;
  avatarSrc?: string;
  description?: string;
  name: string;
  triggerConfig: TriggerConfig;
  instructions: string;
  enabled: boolean;
  triggerChannelId?: string;
  triggerTeamId?: string;
}

/** Assemble a full automation from a form draft. */
export function draftToAutomation(
  draft: AutomationDraft,
  id: string,
  defaultAgentId: string = DEFAULT_OWNED_AGENT_ID,
): Automation {
  const agentId = draft.agentId ?? defaultAgentId;
  const agent = agentById(agentId);
  return {
    id,
    agentId,
    name: draft.name.trim(),
    type: triggerToType(draft.triggerConfig),
    triggerConfig: draft.triggerConfig,
    trigger: triggerSummary(draft.triggerConfig),
    instructions: draft.instructions.trim(),
    scope: draftScope(draft),
    enabled: draft.enabled,
    lastRun: null,
    createdBy: agent ? `${agent.displayName} (Agent)` : 'You',
    ownedByCurrentUser: true,
  };
}

/** Apply a form draft onto an existing automation (preserves id / run history). */
export function applyDraft(automation: Automation, draft: AutomationDraft): Automation {
  return {
    ...automation,
    ...(draft.agentId != null ? { agentId: draft.agentId } : {}),
    name: draft.name.trim(),
    type: triggerToType(draft.triggerConfig),
    triggerConfig: draft.triggerConfig,
    trigger: triggerSummary(draft.triggerConfig),
    instructions: draft.instructions.trim(),
    enabled: draft.enabled,
    ...(draft.triggerChannelId || draft.triggerTeamId
      ? { scope: draftScope(draft) }
      : {}),
  };
}

export function automationsForAgent(
  automations: Automation[],
  agentId: string,
): Automation[] {
  return automations.filter((a) => a.agentId === agentId);
}

export const INITIAL_AUTOMATIONS: Automation[] = [
  {
    id: 'standup',
    agentId: 'matty',
    scope: { channelIds: ['ux-design'] },
    name: 'Daily standup reminder',
    type: 'recurring-post',
    triggerConfig: { kind: 'schedule', frequency: 'daily', time: '9:00 AM' },
    trigger: 'Daily, 9:00 AM',
    instructions:
      'Post a friendly reminder asking the team to drop their standup update in the thread before 10:00 AM.',
    enabled: true,
    lastRun: 'Today at 9:00 AM',
    createdBy: 'Leonard Riley',
    ownedByCurrentUser: true,
  },
  {
    id: 'weekly-digest',
    agentId: 'matty',
    scope: { teamIds: ['contributors'] },
    name: 'Weekly design digest',
    type: 'recurring-post',
    triggerConfig: {
      kind: 'schedule',
      frequency: 'weekly',
      weekday: 'monday',
      time: '8:00 AM',
    },
    trigger: 'Mondays at 8:00 AM',
    instructions:
      'Summarize the past week of activity in this channel — decisions, shipped work, and open questions — and post the recap.',
    enabled: true,
    lastRun: 'Mon at 8:00 AM',
    createdBy: 'Leonard Riley',
    ownedByCurrentUser: true,
  },
  {
    id: 'after-hours',
    agentId: 'matty',
    scope: { attributes: ['design'] },
    name: 'After-hours auto-reply',
    type: 'auto-responder',
    triggerConfig: { kind: 'event', event: 'mention' },
    trigger: 'When the agent is @mentioned',
    instructions:
      'Reply letting the sender know the team is offline and will respond during business hours.',
    enabled: false,
    lastRun: null,
    createdBy: 'Leonard Riley',
    ownedByCurrentUser: true,
  },
  {
    id: 'release-playbook',
    agentId: 'devops',
    scope: { teamIds: ['contributors'] },
    name: 'Release playbook finished',
    type: 'custom',
    triggerConfig: {
      kind: 'playbook-event',
      event: 'run-finished',
      playbookId: 'release-checklist',
    },
    trigger: 'When a playbook run finishes · Release checklist',
    instructions:
      'Post a summary in the release channel with run outcomes, blockers, and follow-ups.',
    enabled: true,
    lastRun: 'Yesterday at 4:12 PM',
    createdBy: 'DevOps Agent (Agent)',
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
  /** Short summary shown in agent lists and Settings. */
  description: string;
  avatarSrc?: string;
  avatarFallbackColor?: UserAvatarFallbackColor;
  activeMcps: number;
  toolCount: number;
  /** AI service configured for this agent (System Console id). */
  aiServiceId: string;
  /** Model id within the selected AI service. */
  modelId: string;
  /** When true, the agent appears under the "Your agents" tab. */
  ownedByCurrentUser?: boolean;
}

export function agentAvatarProps(
  agent: Pick<Agent, 'displayName' | 'avatarSrc' | 'avatarFallbackColor'>,
) {
  return {
    alt: agent.displayName,
    name: agent.displayName,
    src: agent.avatarSrc,
    fallbackColor: agent.avatarFallbackColor ?? 'Blue',
  };
}

export const AGENTS: Agent[] = [
  {
    id: 'matty',
    displayName: 'Matty',
    username: 'matty',
    description:
      'A general-purpose assistant for chatting, drafting replies, and helping with everyday team work.',
    avatarSrc: avatarMatty,
    activeMcps: 3,
    toolCount: 12,
    aiServiceId: 'anthropic',
    modelId: 'claude-sonnet-4.6',
    ownedByCurrentUser: true,
  },
  {
    id: 'devops',
    displayName: 'DevOps Agent',
    username: 'devops-agent',
    description:
      'Monitors deployments, CI pipelines, and infra alerts so the team can respond faster.',
    avatarFallbackColor: 'Blue',
    activeMcps: 4,
    toolCount: 16,
    aiServiceId: 'openai',
    modelId: 'gpt-4.1',
  },
  {
    id: 'cloudops',
    displayName: 'CloudOps Agent',
    username: 'cloudops-agent',
    description:
      'Helps manage cloud resources, scaling, and operational runbooks across environments.',
    avatarFallbackColor: 'Cyan',
    activeMcps: 8,
    toolCount: 24,
    aiServiceId: 'anthropic',
    modelId: 'claude-opus',
  },
  {
    id: 'insights',
    displayName: 'Data Insights Agent',
    username: 'insights-agent',
    description:
      'Answers questions about metrics, trends, and reports from your connected data sources.',
    avatarFallbackColor: 'Purple',
    activeMcps: 5,
    toolCount: 20,
    aiServiceId: 'openai',
    modelId: 'gpt-4o',
  },
  {
    id: 'tracker',
    displayName: 'Project Tracker Agent',
    username: 'task-agent',
    description:
      'Keeps projects on track by summarizing status, flagging blockers, and updating tasks.',
    avatarFallbackColor: 'Orange',
    activeMcps: 2,
    toolCount: 7,
    aiServiceId: 'mattermost',
    modelId: 'mm-large',
  },
];

/** Blank agent used when opening the create-agent flow. */
export const NEW_AGENT_DRAFT: Agent = {
  id: 'new-agent',
  displayName: '',
  username: '',
  description: '',
  avatarSrc: avatarMatty,
  activeMcps: 0,
  toolCount: 0,
  aiServiceId: 'openai',
  modelId: 'gpt-4.1',
  ownedByCurrentUser: true,
};

/** The default agent used in channel RHS panels and automation fixtures. */
export const AGENT = AGENTS[0];

/** Default owned agent for chat persona fallback (Option 2). */
export const DEFAULT_OWNED_AGENT_ID = 'matty';

export function agentById(id: string): Agent | undefined {
  return AGENTS.find((a) => a.id === id);
}

export function defaultOwnedAgent(): Agent {
  return agentById(DEFAULT_OWNED_AGENT_ID) ?? AGENT;
}

export function agentCapabilitySummary(
  agent: Pick<Agent, 'activeMcps' | 'toolCount'>,
): string {
  return `${agent.activeMcps} MCP · ${agent.toolCount} tools · All channels`;
}

/* ------------------------------------------------------------------ */
/* AI services (system console) — Options 3 & 3b                      */
/* ------------------------------------------------------------------ */

export interface AiService {
  id: string;
  label: string;
}

export interface AiModelOption {
  id: string;
  label: string;
}

/** Services configured in System Console — fixture for entity automations. */
export const AI_SERVICES: AiService[] = [
  { id: 'openai', label: 'OpenAI' },
  { id: 'anthropic', label: 'Anthropic' },
  { id: 'azure-openai', label: 'Azure OpenAI' },
  { id: 'mattermost', label: 'Mattermost LLM' },
];

export const DEFAULT_AI_SERVICE_ID = AI_SERVICES[0].id;

/** Models available per AI service (from System Console config). */
export const AI_SERVICE_MODELS: Record<string, AiModelOption[]> = {
  openai: [
    { id: 'gpt-4.1', label: 'GPT-4.1' },
    { id: 'gpt-4o', label: 'GPT-4o' },
    { id: 'o3-mini', label: 'o3-mini' },
  ],
  anthropic: [
    { id: 'claude-sonnet-4.6', label: 'Sonnet 4.6' },
    { id: 'claude-sonnet', label: 'Claude Sonnet 4' },
    { id: 'claude-opus', label: 'Claude Opus 4' },
    { id: 'claude-haiku', label: 'Claude Haiku 3.5' },
  ],
  'azure-openai': [
    { id: 'gpt-4.1-azure', label: 'GPT-4.1 (Azure)' },
    { id: 'gpt-4o-azure', label: 'GPT-4o (Azure)' },
  ],
  mattermost: [
    { id: 'mm-large', label: 'Mattermost Large' },
    { id: 'mm-small', label: 'Mattermost Small' },
  ],
};

export function modelsForAiService(serviceId: string): AiModelOption[] {
  return AI_SERVICE_MODELS[serviceId] ?? AI_SERVICE_MODELS[DEFAULT_AI_SERVICE_ID];
}

export function agentModelLabel(
  agent: Pick<Agent, 'aiServiceId' | 'modelId'>,
): string {
  return (
    modelsForAiService(agent.aiServiceId).find(
      (entry) => entry.id === agent.modelId,
    )?.label ?? ''
  );
}

export function agentToolsSummary(
  agent: Pick<Agent, 'activeMcps' | 'toolCount'>,
): string {
  return `${agent.activeMcps} MCP · ${agent.toolCount} tools`;
}

/* ------------------------------------------------------------------ */
/* Option 3 — automation-as-agent entities                            */
/* ------------------------------------------------------------------ */

export interface AutomationEntity {
  id: string;
  displayName: string;
  username: string;
  avatarSrc: string;
  description: string;
  activeMcps: number;
  toolCount: number;
  enabled: boolean;
  name: string;
  type: AutomationType;
  triggerConfig: TriggerConfig;
  trigger: string;
  instructions: string;
  scope: AutomationScope;
  lastRun: string | null;
  /** When true, the automation appears under the "Your automations" tab. */
  ownedByCurrentUser?: boolean;
}

export interface AutomationEntityDraft {
  displayName: string;
  username: string;
  avatarSrc: string;
  description: string;
  activeMcps: number;
  toolCount: number;
  enabled: boolean;
  name: string;
  triggerConfig: TriggerConfig;
  instructions: string;
  triggerChannelId?: string;
  triggerTeamId?: string;
}

export function automationToEntity(automation: Automation, agent: Agent): AutomationEntity {
  return {
    id: automation.id,
    displayName: automation.name,
    username: agent.username,
    avatarSrc: agent.avatarSrc ?? '',
    description: agent.description,
    activeMcps: agent.activeMcps,
    toolCount: agent.toolCount,
    enabled: automation.enabled,
    name: automation.name,
    type: automation.type,
    triggerConfig: automation.triggerConfig,
    trigger: automation.trigger,
    instructions: automation.instructions,
    scope: automation.scope,
    lastRun: automation.lastRun,
  };
}

export function draftToAutomationEntity(
  draft: AutomationDraft,
  id: string,
): AutomationEntity {
  const displayName =
    draft.displayName?.trim() || draft.name.trim() || 'New automation';
  return {
    id,
    displayName,
    username: draft.username?.trim() || `automation-${id}`,
    avatarSrc: draft.avatarSrc ?? avatarMatty,
    description: draft.description?.trim() ?? '',
    activeMcps: 2,
    toolCount: 8,
    enabled: draft.enabled,
    name: draft.name.trim() || displayName,
    type: triggerToType(draft.triggerConfig),
    triggerConfig: draft.triggerConfig,
    trigger: triggerSummary(draft.triggerConfig),
    instructions: draft.instructions.trim(),
    scope: draftScope(draft),
    lastRun: null,
    ownedByCurrentUser: true,
  };
}

export function applyEntityDraftFromAutomationDraft(
  entity: AutomationEntity,
  draft: AutomationDraft,
): AutomationEntity {
  return applyEntityDraft(entity, {
    displayName: draft.displayName ?? entity.displayName,
    username: draft.username ?? entity.username,
    avatarSrc: draft.avatarSrc ?? entity.avatarSrc,
    description: draft.description ?? entity.description,
    activeMcps: entity.activeMcps,
    toolCount: entity.toolCount,
    enabled: draft.enabled,
    name: draft.name,
    triggerConfig: draft.triggerConfig,
    instructions: draft.instructions,
    triggerChannelId: draft.triggerChannelId,
    triggerTeamId: draft.triggerTeamId,
  });
}

export function applyEntityDraft(
  entity: AutomationEntity,
  draft: AutomationEntityDraft,
): AutomationEntity {
  return {
    ...entity,
    displayName: draft.displayName.trim() || entity.displayName,
    username: draft.username.trim() || entity.username,
    avatarSrc: draft.avatarSrc,
    description: draft.description.trim(),
    activeMcps: draft.activeMcps,
    toolCount: draft.toolCount,
    enabled: draft.enabled,
    name: draft.name.trim() || draft.displayName.trim(),
    type: triggerToType(draft.triggerConfig),
    triggerConfig: draft.triggerConfig,
    trigger: triggerSummary(draft.triggerConfig),
    instructions: draft.instructions.trim(),
    ...(draft.triggerChannelId || draft.triggerTeamId
      ? { scope: draftScope(draft) }
      : {}),
  };
}

export function entityToAgent(entity: AutomationEntity): Agent {
  return {
    id: entity.id,
    displayName: entity.displayName,
    username: entity.username,
    description: entity.description,
    avatarSrc: entity.avatarSrc,
    activeMcps: entity.activeMcps,
    toolCount: entity.toolCount,
    aiServiceId: AGENT.aiServiceId,
    modelId: AGENT.modelId,
  };
}

export function emptyAutomationEntityDraft(): AutomationEntityDraft {
  return {
    displayName: 'New automation',
    username: 'new-automation',
    avatarSrc: avatarMatty,
    description: '',
    activeMcps: 2,
    toolCount: 8,
    enabled: true,
    name: '',
    triggerConfig: { kind: 'schedule', frequency: 'daily', time: '9:00 AM' },
    instructions: '',
  };
}

export const INITIAL_AUTOMATION_ENTITIES: AutomationEntity[] = [
  {
    id: 'entity-standup',
    displayName: 'Daily standup reminder',
    username: 'standup-bot',
    avatarSrc: avatarMatty,
    description: 'Posts a daily standup prompt so the team can share updates in thread.',
    activeMcps: 3,
    toolCount: 12,
    enabled: true,
    name: 'Daily standup reminder',
    type: 'recurring-post',
    triggerConfig: { kind: 'schedule', frequency: 'daily', time: '9:00 AM' },
    trigger: 'Daily, 9:00 AM',
    instructions:
      'Post a friendly reminder asking the team to drop their standup update in the thread before 10:00 AM.',
    scope: { channelIds: ['ux-design'] },
    lastRun: 'Today at 9:00 AM',
    ownedByCurrentUser: true,
  },
  {
    id: 'entity-digest',
    displayName: 'Weekly design digest',
    username: 'digest-bot',
    avatarSrc: avatarAiko,
    description: 'Summarizes the week’s design activity into a Monday morning digest.',
    activeMcps: 5,
    toolCount: 20,
    enabled: true,
    name: 'Weekly design digest',
    type: 'recap',
    triggerConfig: {
      kind: 'schedule',
      frequency: 'weekly',
      weekday: 'monday',
      time: '8:00 AM',
    },
    trigger: 'Mondays at 8:00 AM',
    instructions:
      'Summarize the past week of activity in this channel — decisions, shipped work, and open questions — and post the recap.',
    scope: { teamIds: ['contributors'] },
    lastRun: 'Mon at 8:00 AM',
  },
  {
    id: 'entity-after-hours',
    displayName: 'After-hours auto-reply',
    username: 'after-hours-bot',
    avatarSrc: avatarEthan,
    description: 'Auto-replies when mentioned outside business hours.',
    activeMcps: 2,
    toolCount: 6,
    enabled: false,
    name: 'After-hours auto-reply',
    type: 'auto-responder',
    triggerConfig: { kind: 'event', event: 'mention' },
    trigger: 'When the agent is @mentioned',
    instructions:
      'Reply letting the sender know the team is offline and will respond during business hours.',
    scope: { attributes: ['design'] },
    lastRun: null,
    ownedByCurrentUser: true,
  },
  {
    id: 'entity-incident-playbook',
    displayName: 'Incident playbook started',
    username: 'incident-playbook',
    avatarSrc: avatarMarco,
    description: 'Announces new incident runs and asks for a severity update.',
    activeMcps: 4,
    toolCount: 14,
    enabled: true,
    name: 'Incident playbook started',
    type: 'custom',
    triggerConfig: {
      kind: 'playbook-event',
      event: 'run-started',
      playbookId: 'incident-response',
    },
    trigger: 'When a playbook run starts · Incident response',
    instructions:
      'Announce the new incident run, link the playbook, and ask for a severity update in thread.',
    scope: { teamIds: ['contributors'] },
    lastRun: 'Today at 11:05 AM',
  },
];

export function automationEntityById(id: string): AutomationEntity | undefined {
  return INITIAL_AUTOMATION_ENTITIES.find((e) => e.id === id);
}

/** Map an automation-entity to the list/automation shape for shared RHS UI. */
export function entityAsAutomation(entity: AutomationEntity): Automation {
  return {
    id: entity.id,
    agentId: entity.id,
    name: entity.name,
    type: entity.type,
    triggerConfig: entity.triggerConfig,
    trigger: entity.trigger,
    instructions: entity.instructions,
    scope: entity.scope,
    enabled: entity.enabled,
    lastRun: entity.lastRun,
    createdBy: entity.displayName,
    ownedByCurrentUser: entity.ownedByCurrentUser,
  };
}

/** The current user, shown as the author of replies in agent chats. */
export const CURRENT_USER = {
  name: 'You',
  avatarSrc: avatarEmma,
};
