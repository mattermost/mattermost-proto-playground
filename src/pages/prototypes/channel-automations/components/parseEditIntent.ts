import {
  AUTOMATION_CHANNEL_OPTIONS,
  SCHEDULE_TIMES,
} from '../channelAutomationsData';
import type { FormValues } from './automationFormTypes';

export type EditIntentPatch = Partial<FormValues>;

const TIME_ALIASES: Record<string, string> = {
  '8am': '8:00 AM',
  '8:00 am': '8:00 AM',
  '9am': '9:00 AM',
  '9:00 am': '9:00 AM',
  '12pm': '12:00 PM',
  'noon': '12:00 PM',
  '5pm': '5:00 PM',
  '5:00 pm': '5:00 PM',
};

export function parseEditIntent(text: string): EditIntentPatch | null {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return null;

  const renameMatch = normalized.match(
    /^(?:rename (?:it )?to|call it|name it)\s+(.+)$/i,
  );
  if (renameMatch) {
    return { name: renameMatch[1].trim() };
  }

  const instructionsMatch = normalized.match(
    /^(?:update instructions to|change instructions to|instructions:)\s+(.+)$/i,
  );
  if (instructionsMatch) {
    return { instructions: instructionsMatch[1].trim() };
  }

  const timeMatch = normalized.match(
    /^(?:change time to|set time to|run at|schedule for)\s+(.+)$/i,
  );
  if (timeMatch) {
    const raw = timeMatch[1].trim().toLowerCase();
    const time =
      TIME_ALIASES[raw] ??
      SCHEDULE_TIMES.find((t) => t.toLowerCase() === raw) ??
      SCHEDULE_TIMES.find((t) => t.toLowerCase().startsWith(raw));
    if (time) {
      return { kind: 'schedule', time };
    }
  }

  if (normalized.includes('weekday') || normalized.includes('every weekday')) {
    return { kind: 'schedule', frequency: 'weekdays' };
  }
  if (normalized.includes('every day') || normalized.includes('daily')) {
    return { kind: 'schedule', frequency: 'daily' };
  }
  if (normalized.includes('monday') || normalized.includes('weekly')) {
    return { kind: 'schedule', frequency: 'weekly' };
  }
  if (normalized.includes('mention')) {
    return { kind: 'event', event: 'mention' };
  }
  if (normalized.includes('join')) {
    return { kind: 'event', event: 'join' };
  }

  const channelMatch = normalized.match(
    /^(?:change channel to|move to channel|run in)\s+(.+)$/i,
  );
  if (channelMatch) {
    const raw = channelMatch[1].trim().toLowerCase();
    const channel = AUTOMATION_CHANNEL_OPTIONS.find(
      (item) =>
        item.label.toLowerCase() === raw ||
        item.id.toLowerCase() === raw.replace(/\s+/g, '-'),
    );
    if (channel) {
      return { channelId: channel.id, teamId: '' };
    }
  }

  if (normalized.length > 12) {
    return { instructions: text.trim() };
  }

  return null;
}
