import {
  AUTOMATION_CHANNEL_OPTIONS,
  AUTOMATION_PLAYBOOK_OPTIONS,
  AUTOMATION_TEAM_OPTIONS,
  SCHEDULE_FREQUENCY_LABELS,
  SCHEDULE_TIMES,
  channelLabelById,
  playbookLabelById,
  teamLabelById,
  type AutomationChannelType,
  type ScheduleFrequency,
} from '../channelAutomationsData';
import type { FormValues } from './automationFormTypes';

export type CreateScriptStep =
  | 'idea'
  | 'trigger'
  | 'schedule-frequency'
  | 'schedule-time'
  | 'channel'
  | 'team'
  | 'keyword'
  | 'playbook'
  | 'done';

export interface ChatScriptOption {
  id: string;
  label: string;
  description?: string;
  muted?: boolean;
  channelType?: AutomationChannelType;
  patch: Partial<FormValues>;
  confirmText?: string;
}

export interface ChatStepSelection {
  title: string;
  options: ChatScriptOption[];
  ariaLabel: string;
  variant?: 'list' | 'autocomplete';
  selectLabel?: string;
}

export const CREATE_IDEA_TITLE =
  'What kind of automation would you like to create?';

export const CREATE_IDEA_OPTIONS: ChatScriptOption[] = [
  {
    id: 'standup',
    label: 'Post a recurring reminder',
    confirmText: 'a recurring reminder that posts on a schedule',
    patch: {
      name: 'Post a recurring reminder',
      kind: 'schedule',
      frequency: 'weekdays',
      time: '9:00 AM',
      instructions:
        'Post a reminder asking the team to share their standup update in the thread before 10:00 AM.',
    },
  },
  {
    id: 'welcome',
    label: 'Welcome new channel members',
    confirmText: 'a welcome message sent whenever someone joins the channel',
    patch: {
      name: 'Welcome new channel members',
      kind: 'event',
      event: 'join',
      instructions:
        'Greet new members, share the channel’s purpose, and point them to the pinned resources.',
    },
  },
  {
    id: 'recap',
    label: 'Send a weekly digest',
    confirmText: 'a weekly digest that posts every Monday at 8:00 AM',
    patch: {
      name: 'Send a weekly digest',
      kind: 'schedule',
      frequency: 'weekly',
      time: '8:00 AM',
      instructions:
        'Summarize the past week of activity in this channel — decisions, shipped work, and open questions — and post the recap.',
    },
  },
  {
    id: 'channel-created',
    label: 'Post when a new channel is created',
    confirmText: 'a post whenever a new channel is created',
    patch: {
      name: 'Post when a new channel is created',
      kind: 'event',
      event: 'channel-created',
      instructions:
        'Announce the new channel, summarize its purpose, and link to getting-started resources.',
    },
  },
  {
    id: 'release-playbook',
    label: 'Notify when a playbook run finishes',
    confirmText: 'a notification when a playbook run finishes',
    patch: {
      name: 'Release playbook finished',
      kind: 'playbook-event',
      playbookEvent: 'run-finished',
      instructions:
        'Post a summary with run outcomes, blockers, and follow-ups when the run completes.',
    },
  },
  {
    id: 'something-else',
    label: 'Something else',
    muted: true,
    patch: {},
  },
];

export const TRIGGER_TYPE_TITLE = 'When should the automation be executed?';

export const TRIGGER_TYPE_OPTIONS: ChatScriptOption[] = [
  {
    id: 'message',
    label: 'A message posted in a channel',
    patch: { kind: 'event', event: 'message' },
  },
  {
    id: 'join',
    label: 'Someone joining a channel or team',
    patch: { kind: 'event', event: 'join' },
  },
  {
    id: 'channel-created',
    label: 'A new channel is created',
    patch: { kind: 'event', event: 'channel-created' },
  },
  {
    id: 'schedule',
    label: 'On a scheduled date or time',
    patch: { kind: 'schedule' },
  },
  {
    id: 'playbook-run-started',
    label: 'A playbook run starts',
    patch: { kind: 'playbook-event', playbookEvent: 'run-started' },
  },
  {
    id: 'playbook-run-finished',
    label: 'A playbook run finishes',
    patch: { kind: 'playbook-event', playbookEvent: 'run-finished' },
  },
  {
    id: 'playbook-task-checked',
    label: 'A playbook task is checked',
    patch: { kind: 'playbook-event', playbookEvent: 'task-checked' },
  },
  {
    id: 'playbook-task-unchecked',
    label: 'A playbook task is unchecked',
    patch: { kind: 'playbook-event', playbookEvent: 'task-unchecked' },
  },
  {
    id: 'something-else',
    label: 'Something else',
    muted: true,
    patch: {},
  },
];

export const CHANNEL_SCOPE_TITLE =
  'Which channel should this automation run in?';

export const TEAM_SCOPE_TITLE = 'Which team should this apply to?';

export const KEYWORD_FILTER_TITLE =
  'Should this run for every message or only when a keyword is posted?';

export const PLAYBOOK_SCOPE_TITLE = 'Which playbook should this apply to?';

export const SCHEDULE_FREQUENCY_TITLE = 'How often should it run?';

export const SCHEDULE_TIME_TITLE = 'What time should it run?';

export function scheduleTriggerOptions(): ChatScriptOption[] {
  return (Object.keys(SCHEDULE_FREQUENCY_LABELS) as ScheduleFrequency[]).map(
    (frequency) => ({
      id: frequency,
      label: SCHEDULE_FREQUENCY_LABELS[frequency],
      patch: { kind: 'schedule', frequency },
    }),
  );
}

export function scheduleTimeOptions(): ChatScriptOption[] {
  return SCHEDULE_TIMES.map((time) => ({
    id: time,
    label: time,
    patch: { kind: 'schedule', time },
  }));
}

export function channelScopeOptions(): ChatScriptOption[] {
  return AUTOMATION_CHANNEL_OPTIONS.map((channel) => ({
    id: channel.id,
    label: channel.label,
    channelType: channel.type,
    patch: { channelId: channel.id, teamId: '' },
  }));
}

export function teamScopeOptions(): ChatScriptOption[] {
  return AUTOMATION_TEAM_OPTIONS.map((team) => ({
    id: team.id,
    label: team.label,
    patch: { teamId: team.id, channelId: '' },
  }));
}

export function playbookScopeOptions(): ChatScriptOption[] {
  return AUTOMATION_PLAYBOOK_OPTIONS.map((playbook) => ({
    id: playbook.id,
    label: playbook.label,
    patch: { playbookId: playbook.id },
  }));
}

export const KEYWORD_FILTER_OPTIONS: ChatScriptOption[] = [
  {
    id: 'any',
    label: 'Every message in the channel',
    patch: { kind: 'event', event: 'message', keyword: '' },
  },
  {
    id: 'standup',
    label: 'Messages containing "standup"',
    patch: { kind: 'event', event: 'keyword', keyword: 'standup' },
  },
  {
    id: 'release',
    label: 'Messages containing "release"',
    patch: { kind: 'event', event: 'keyword', keyword: 'release' },
  },
  {
    id: 'something-else',
    label: 'Something else',
    muted: true,
    patch: {},
  },
];

export function promptForStep(step: CreateScriptStep): string {
  switch (step) {
    case 'trigger':
      return 'Ok, got it. When should the automation be executed?';
    case 'schedule-frequency':
      return 'How often should it run?';
    case 'schedule-time':
      return 'What time should it run?';
    case 'channel':
      return 'Which channel should this automation run in?';
    case 'team':
      return 'Which team should this apply to?';
    case 'keyword':
      return 'Should this run for every message or only when a keyword is posted?';
    case 'playbook':
      return 'Which playbook should this apply to?';
    default:
      return '';
  }
}

export function getStepSelection(step: CreateScriptStep): ChatStepSelection | null {
  switch (step) {
    case 'idea':
      return {
        title: CREATE_IDEA_TITLE,
        options: CREATE_IDEA_OPTIONS,
        ariaLabel: 'Automation ideas',
      };
    case 'trigger':
      return {
        title: TRIGGER_TYPE_TITLE,
        options: TRIGGER_TYPE_OPTIONS,
        ariaLabel: 'Trigger options',
      };
    case 'schedule-frequency':
      return {
        title: SCHEDULE_FREQUENCY_TITLE,
        options: scheduleTriggerOptions(),
        ariaLabel: 'Schedule frequency',
      };
    case 'schedule-time':
      return {
        title: SCHEDULE_TIME_TITLE,
        options: scheduleTimeOptions(),
        ariaLabel: 'Schedule time',
      };
    case 'channel':
      return {
        title: CHANNEL_SCOPE_TITLE,
        options: channelScopeOptions(),
        ariaLabel: 'Channel scope',
        variant: 'autocomplete',
        selectLabel: 'Channel',
      };
    case 'team':
      return {
        title: TEAM_SCOPE_TITLE,
        options: teamScopeOptions(),
        ariaLabel: 'Team scope',
      };
    case 'keyword':
      return {
        title: KEYWORD_FILTER_TITLE,
        options: KEYWORD_FILTER_OPTIONS,
        ariaLabel: 'Keyword filter',
      };
    case 'playbook':
      return {
        title: PLAYBOOK_SCOPE_TITLE,
        options: playbookScopeOptions(),
        ariaLabel: 'Playbook scope',
      };
    default:
      return null;
  }
}

function advanceAfterIdea(option: ChatScriptOption): CreateScriptStep {
  if (option.id === 'something-else') return 'trigger';
  if (option.id === 'welcome') return 'channel';
  if (option.id === 'channel-created') return 'team';
  if (option.patch.kind === 'playbook-event') return 'playbook';
  if (option.patch.kind === 'schedule') return 'schedule-frequency';
  return 'trigger';
}

function advanceAfterTrigger(option: ChatScriptOption): CreateScriptStep {
  if (option.id === 'something-else') return 'done';
  if (option.patch.kind === 'schedule') return 'schedule-frequency';
  if (option.patch.kind === 'playbook-event') return 'playbook';
  if (option.patch.event === 'join' || option.patch.event === 'message') {
    return 'channel';
  }
  if (option.patch.event === 'channel-created') return 'team';
  return 'done';
}

export function advanceAfterStep(
  step: CreateScriptStep,
  values: FormValues,
  accepted?: ChatScriptOption,
): CreateScriptStep {
  switch (step) {
    case 'idea':
      return accepted ? advanceAfterIdea(accepted) : 'trigger';
    case 'trigger':
      return accepted ? advanceAfterTrigger(accepted) : 'done';
    case 'schedule-frequency':
      return 'schedule-time';
    case 'schedule-time':
      return 'channel';
    case 'channel':
      return values.event === 'message' ? 'keyword' : 'done';
    case 'team':
    case 'keyword':
    case 'playbook':
      return 'done';
    default:
      return 'done';
  }
}

export function scopeSummaryFromValues(values: FormValues): string | null {
  if (values.teamId) {
    return teamLabelById(values.teamId);
  }
  if (values.channelId) {
    return channelLabelById(values.channelId);
  }
  if (values.playbookId) {
    return playbookLabelById(values.playbookId);
  }
  return null;
}
