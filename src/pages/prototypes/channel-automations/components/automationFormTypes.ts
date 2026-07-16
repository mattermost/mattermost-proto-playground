import type {
  EventType,
  PlaybookEventType,
  ScheduleFrequency,
  ScheduleWeekday,
  TriggerKind,
} from '../channelAutomationsData';

/** The draft fields shared between the Form and Chat views. */
export interface FormValues {
  agentId: string;
  name: string;
  kind: TriggerKind;
  frequency: ScheduleFrequency;
  time: string;
  weekday: ScheduleWeekday;
  event: EventType;
  keyword: string;
  playbookEvent: PlaybookEventType;
  playbookId: string;
  instructions: string;
  enabled: boolean;
  channelId: string;
  teamId: string;
  /** Option 3b — automation-as-agent persona fields. */
  displayName?: string;
  username?: string;
  avatarSrc?: string;
}

export type FormPatch = (changes: Partial<FormValues>) => void;

export type EditorKind = 'assignment' | 'entity';
