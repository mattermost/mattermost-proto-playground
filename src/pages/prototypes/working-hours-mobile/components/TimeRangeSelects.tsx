import { useEffect, useState } from 'react';
import { Select } from '@mattermost/compass-ui/components/select';
import {
  formatTime,
  rangeError,
  timeOptions,
  type TimeRange,
} from '@/pages/prototypes/working-hours/workingHoursData';
import styles from '../WorkingHoursMobile.module.scss';

type Props = {
  idPrefix: string;
  range: TimeRange;
  clock24: boolean;
  onChange: (next: TimeRange) => void;
  /** Keep the menus inside a device frame. */
  portalContainer?: HTMLElement | null;
  size?: 'small' | 'medium' | 'large';
  /** Show "Start time" / "End time" labels above each field. */
  showLabels?: boolean;
};

/**
 * Start / end Select pair using half-hour steps and the user's clock display.
 *
 * Mobile has no Save step, so an invalid range (end not after start) stays here
 * as editable local state with its error and is only passed to `onChange` once
 * it is valid. That keeps the live schedule from silently going Do Not Disturb.
 */
export function TimeRangeSelects({
  idPrefix,
  range,
  clock24,
  onChange,
  portalContainer,
  size = 'medium',
  showLabels = false,
}: Props) {
  const options = timeOptions(clock24);
  // `range` is the committed value; `draft` is what the Selects show.
  const [draft, setDraft] = useState(range);
  useEffect(
    () => setDraft({ start: range.start, end: range.end }),
    [range.start, range.end],
  );
  const error = rangeError(draft);
  const update = (next: TimeRange) => {
    setDraft(next);
    if (!rangeError(next)) onChange(next);
  };
  return (
    <div className={styles['time-range']}>
      <div className={styles['time-range__fields']}>
        <Select
          id={`${idPrefix}-start`}
          aria-label={`Start time, ${formatTime(draft.start, clock24)}`}
          label={showLabels ? 'Start time' : undefined}
          size={size}
          options={options}
          value={String(draft.start)}
          invalid={!!error}
          portalContainer={portalContainer}
          onChange={(v) => update({ ...draft, start: Number(v) })}
        />
        {!showLabels && <span className={styles['time-range__to']}>to</span>}
        <Select
          id={`${idPrefix}-end`}
          aria-label={`End time, ${formatTime(draft.end, clock24)}`}
          label={showLabels ? 'End time' : undefined}
          size={size}
          options={options}
          value={String(draft.end)}
          invalid={!!error}
          portalContainer={portalContainer}
          onChange={(v) => update({ ...draft, end: Number(v) })}
        />
      </div>
      {error && (
        <p className={styles['time-range__error']} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
