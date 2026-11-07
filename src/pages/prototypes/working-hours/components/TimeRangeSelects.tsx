import ClockOutlineIcon from '@mattermost/compass-icons/components/clock-outline';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Select } from '@mattermost/compass-ui/components/select';
import {
  formatTime,
  rangeError,
  timeOptions,
  type TimeRange,
} from '../workingHoursData';
import styles from '../WorkingHours.module.scss';

type Props = {
  idPrefix: string;
  range: TimeRange;
  clock24: boolean;
  onChange: (next: TimeRange) => void;
  /** Fixed-width fields for the per-day rows of a custom schedule. */
  compact?: boolean;
  /** Greyed out and not interactive (day switched off). */
  disabled?: boolean;
};

/** Start / end Select pair using half-hour steps and the user's clock display. */
export function TimeRangeSelects({
  idPrefix,
  range,
  clock24,
  onChange,
  compact = false,
  disabled = false,
}: Props) {
  const options = timeOptions(clock24);
  const error = rangeError(range);
  const icon = <Icon glyph={<ClockOutlineIcon />} />;
  return (
    <div
      className={[
        styles['time-range'],
        compact && styles['time-range--compact'],
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles['time-range__fields']}>
        <Select
          id={`${idPrefix}-start`}
          aria-label={`Start time, ${formatTime(range.start, clock24)}`}
          leadingIcon={icon}
          options={options}
          value={String(range.start)}
          invalid={!!error}
          disabled={disabled}
          onChange={(v) => onChange({ ...range, start: Number(v) })}
        />
        <span className={styles['time-range__to']}>to</span>
        <Select
          id={`${idPrefix}-end`}
          aria-label={`End time, ${formatTime(range.end, clock24)}`}
          leadingIcon={icon}
          options={options}
          value={String(range.end)}
          invalid={!!error}
          disabled={disabled}
          onChange={(v) => onChange({ ...range, end: Number(v) })}
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
