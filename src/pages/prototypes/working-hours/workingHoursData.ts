export type DayId = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type DaysMode = 'every-day' | 'weekdays' | 'custom';
export type ManualStatus = 'online' | 'away' | 'offline';

export type TimeRange = { start: number; end: number };

/** Minutes from midnight. */
export const DEFAULT_RANGE: TimeRange = { start: 8 * 60, end: 20 * 60 };

export const DAYS: { id: DayId; label: string; short: string }[] = [
  { id: 'mon', label: 'Monday', short: 'Mon' },
  { id: 'tue', label: 'Tuesday', short: 'Tue' },
  { id: 'wed', label: 'Wednesday', short: 'Wed' },
  { id: 'thu', label: 'Thursday', short: 'Thu' },
  { id: 'fri', label: 'Friday', short: 'Fri' },
  { id: 'sat', label: 'Saturday', short: 'Sat' },
  { id: 'sun', label: 'Sunday', short: 'Sun' },
];

const WEEKDAY_IDS: DayId[] = ['mon', 'tue', 'wed', 'thu', 'fri'];

export const DAYS_MODE_OPTIONS: { value: DaysMode; label: string }[] = [
  { value: 'every-day', label: 'Every day' },
  { value: 'weekdays', label: 'Weekdays (Monday - Friday)' },
  { value: 'custom', label: 'Custom Schedule' },
];

export type PerDay = Record<DayId, { enabled: boolean; range: TimeRange }>;

export type ScheduleState = {
  mode: DaysMode;
  /** Single range used by Every day / Weekdays. */
  range: TimeRange;
  /** Per-day config used by Custom Schedule. */
  perDay: PerDay;
  /** Switch to Do Not Disturb outside working hours. */
  dndOutside: boolean;
  /** Auto-set a custom status outside working hours. */
  statusOutside: boolean;
  /** Emoji and text of that custom status. */
  statusEmoji: string;
  statusText: string;
};

export function buildInitialPerDay(): PerDay {
  return Object.fromEntries(
    DAYS.map((d) => [
      d.id,
      { enabled: WEEKDAY_IDS.includes(d.id), range: { ...DEFAULT_RANGE } },
    ]),
  ) as PerDay;
}

/** Custom status applied automatically outside working hours (the default; the user can change it). */
export const OUTSIDE_HOURS_STATUS = { emoji: '🌙', text: 'Outside work hours' };

export const INITIAL_SCHEDULE: ScheduleState = {
  mode: 'weekdays',
  range: { ...DEFAULT_RANGE },
  perDay: buildInitialPerDay(),
  dndOutside: true,
  statusOutside: true,
  statusEmoji: OUTSIDE_HOURS_STATUS.emoji,
  statusText: OUTSIDE_HOURS_STATUS.text,
};

/** Half-hour increments, 00:00 – 23:30, matching the custom-time DND modal. */
export const TIME_STEPS: number[] = Array.from(
  { length: 48 },
  (_, i) => i * 30,
);

/** `padHour` zero-pads the 12-hour clock (09:00 AM), as the settings design shows. */
export function formatTime(
  minutes: number,
  clock24: boolean,
  padHour = false,
): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const mm = String(m).padStart(2, '0');
  if (clock24) return `${String(h).padStart(2, '0')}:${mm}`;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${padHour ? String(h12).padStart(2, '0') : h12}:${mm} ${suffix}`;
}

export function timeOptions(clock24: boolean, padHour = false) {
  return TIME_STEPS.map((m) => ({
    value: String(m),
    label: formatTime(m, clock24, padHour),
  }));
}

/** Active day ids and their ranges for the current schedule. */
export function activeWindows(
  s: ScheduleState,
): Partial<Record<DayId, TimeRange>> {
  const out: Partial<Record<DayId, TimeRange>> = {};
  for (const d of DAYS) {
    if (s.mode === 'every-day') out[d.id] = s.range;
    else if (s.mode === 'weekdays') {
      if (WEEKDAY_IDS.includes(d.id)) out[d.id] = s.range;
    } else if (s.perDay[d.id].enabled) out[d.id] = s.perDay[d.id].range;
  }
  return out;
}

/** Simulated "now" — a fixed moment so the in-action scenes are deterministic. */
export type SimulatedNow = { day: DayId; minutes: number };

export const NOW_INSIDE: SimulatedNow = { day: 'wed', minutes: 11 * 60 };
export const NOW_OUTSIDE: SimulatedNow = { day: 'fri', minutes: 18 * 60 + 30 };

/**
 * Simulated moments for the prototype's time controls, derived from the saved
 * schedule so "in hours" and "off hours" are always what they say. `inside` is
 * null when the schedule has no working day at all.
 */
export function simulatedTimes(s: ScheduleState): {
  inside: SimulatedNow | null;
  outside: SimulatedNow;
} {
  const rotate = (from: DayId) => {
    const i = DAYS.findIndex((d) => d.id === from);
    return [...DAYS.slice(i), ...DAYS.slice(0, i)];
  };

  // Off hours: prefer Friday evening, then try other days and times.
  const outsideMinutes = [18 * 60 + 30, 22 * 60, 6 * 60, 23 * 60 + 45];
  let outside: SimulatedNow = NOW_OUTSIDE;
  search: for (const d of rotate('fri')) {
    for (const minutes of outsideMinutes) {
      const candidate = { day: d.id, minutes };
      if (!isWithinSchedule(s, candidate)) {
        outside = candidate;
        break search;
      }
    }
  }

  // In hours: prefer Wednesday, two hours into the first working window.
  const windows = activeWindows(s);
  let inside: SimulatedNow | null = null;
  for (const d of rotate('wed')) {
    const r = windows[d.id];
    if (r && r.end > r.start) {
      inside = {
        day: d.id,
        minutes: Math.max(r.start, Math.min(r.start + 120, r.end - 30)),
      };
      break;
    }
  }
  return { inside, outside };
}

export function formatMoment(m: SimulatedNow, clock24: boolean): string {
  const day = DAYS.find((d) => d.id === m.day)?.short ?? '';
  return `${day} ${formatTime(m.minutes, clock24)}`;
}

export function isWithinSchedule(s: ScheduleState, now: SimulatedNow): boolean {
  const r = activeWindows(s)[now.day];
  return !!r && now.minutes >= r.start && now.minutes < r.end;
}

/** Next moment (day + minutes) when working hours resume, or null if no active days. */
export function nextWindowStart(
  s: ScheduleState,
  now: SimulatedNow,
): {
  day: DayId;
  minutes: number;
  isToday: boolean;
  isTomorrow: boolean;
} | null {
  const windows = activeWindows(s);
  const startIdx = DAYS.findIndex((d) => d.id === now.day);
  for (let offset = 0; offset <= 7; offset++) {
    const day = DAYS[(startIdx + offset) % 7].id;
    const r = windows[day];
    if (!r) continue;
    if (offset === 0 && r.start <= now.minutes) continue;
    return {
      day,
      minutes: r.start,
      isToday: offset === 0,
      isTomorrow: offset === 1,
    };
  }
  return null;
}

export function untilLabel(
  s: ScheduleState,
  now: SimulatedNow,
  clock24: boolean,
): string {
  const next = nextWindowStart(s, now);
  if (!next) return 'Do Not Disturb';
  const time = formatTime(next.minutes, clock24);
  if (next.isToday) return `until ${time}`;
  if (next.isTomorrow) return `until tomorrow ${time}`;
  const label = DAYS.find((d) => d.id === next.day)?.label ?? '';
  return `until ${label} ${time}`;
}

/** One-line summary shown on the collapsed section / mobile row. */
export function scheduleSummary(s: ScheduleState, clock24: boolean): string {
  if (s.mode === 'custom') {
    const n = DAYS.filter((d) => s.perDay[d.id].enabled).length;
    return `Custom · ${n} ${n === 1 ? 'day' : 'days'}`;
  }
  const days = s.mode === 'every-day' ? 'Every day' : 'Weekdays';
  return `${days}, ${formatTime(s.range.start, clock24)} – ${formatTime(s.range.end, clock24)}`;
}

export function rangeError(r: TimeRange): string | null {
  return r.end <= r.start ? 'End time must be after start time.' : null;
}

export const MANUAL_STATUS_LABEL: Record<ManualStatus, string> = {
  online: 'Online',
  away: 'Away',
  offline: 'Offline',
};

export type EffectiveStatus = ManualStatus | 'do-not-disturb';

export function isWithinRange(minutes: number, r: TimeRange): boolean {
  return minutes >= r.start && minutes < r.end;
}

/** A DM partner, used by the late-hours notice above the message input. */
export const TEAMMATE = {
  name: 'Aiko Tan',
  hours: { start: 9 * 60, end: 17 * 60 } as TimeRange,
  /** Simulated local times for the teammate. */
  localInside: 14 * 60 + 20,
  localOutside: 60 + 20,
};

/** The custom status switched on outside working hours. */
export function outsideHoursStatus(s: ScheduleState) {
  return { emoji: s.statusEmoji, text: s.statusText.trim() };
}

/** The custom status option is on but has no message. */
export function statusInvalid(s: ScheduleState): boolean {
  return s.statusOutside && s.statusText.trim() === '';
}
