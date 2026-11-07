import { Select } from '@mattermost/compass-ui/components/select';
import {
  formatTime,
  rangeError,
  timeOptions,
  type TimeRange,
} from '../notificationScheduleData';
import styles from '../NotificationSchedule.module.scss';

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

/** Start / end Select pair using half-hour steps and the user's clock display. */
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
  const error = rangeError(range);
  return (
    <div className={styles['time-range']}>
      <div className={styles['time-range__fields']}>
        <Select
          id={`${idPrefix}-start`}
          aria-label={`Start time, ${formatTime(range.start, clock24)}`}
          label={showLabels ? 'Start time' : undefined}
          size={size}
          options={options}
          value={String(range.start)}
          invalid={!!error}
          portalContainer={portalContainer}
          onChange={(v) => onChange({ ...range, start: Number(v) })}
        />
        {!showLabels && <span className={styles['time-range__to']}>to</span>}
        <Select
          id={`${idPrefix}-end`}
          aria-label={`End time, ${formatTime(range.end, clock24)}`}
          label={showLabels ? 'End time' : undefined}
          size={size}
          options={options}
          value={String(range.end)}
          invalid={!!error}
          portalContainer={portalContainer}
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
