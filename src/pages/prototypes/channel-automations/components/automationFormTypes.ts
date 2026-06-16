import type {
  EventType,
  ScheduleFrequency,
  TriggerKind,
} from '../channelAutomationsData';

/** The draft fields shared between the Form and Chat views. */
export interface FormValues {
  name: string;
  kind: TriggerKind;
  frequency: ScheduleFrequency;
  time: string;
  event: EventType;
  keyword: string;
  instructions: string;
  enabled: boolean;
}

export type FormPatch = (changes: Partial<FormValues>) => void;
