import { Select } from '@mattermost/compass-ui/components/select';
import {
  DAYS,
  DAYS_MODE_OPTIONS,
  type DaysMode,
  type ScheduleState,
} from '../workingHoursData';
import { DayToggle } from './DayToggle';
import { TimeRangeSelects } from './TimeRangeSelects';
import styles from '../WorkingHours.module.scss';

type Props = {
  schedule: ScheduleState;
  clock24: boolean;
  onChange: (next: ScheduleState) => void;
};

/**
 * Desktop configuration (Figma "Schedule"): a days Select, then one time range,
 * or — for Custom Schedule — a day toggle and time range for every day.
 */
export function ScheduleForm({ schedule, clock24, onChange }: Props) {
  return (
    <div className={styles['schedule-form']}>
      <p className={styles['schedule-form__label']}>Working days</p>
      <Select
        id="wh-days-mode"
        aria-label="Working days"
        options={DAYS_MODE_OPTIONS}
        value={schedule.mode}
        onChange={(v) => onChange({ ...schedule, mode: v as DaysMode })}
      />

      {schedule.mode !== 'custom' ? (
        <TimeRangeSelects
          idPrefix="wh-range"
          range={schedule.range}
          clock24={clock24}
          onChange={(range) => onChange({ ...schedule, range })}
        />
      ) : (
        <ul
          className={styles['schedule-form__days']}
          aria-label="Working hours by day"
        >
          {DAYS.map((d) => {
            const cfg = schedule.perDay[d.id];
            return (
              <li key={d.id} className={styles['schedule-form__day']}>
                <DayToggle
                  label={d.label}
                  letter={d.label[0]}
                  checked={cfg.enabled}
                  onChange={(enabled) =>
                    onChange({
                      ...schedule,
                      perDay: {
                        ...schedule.perDay,
                        [d.id]: { ...cfg, enabled },
                      },
                    })
                  }
                />
                <TimeRangeSelects
                  idPrefix={`wh-${d.id}`}
                  range={cfg.range}
                  clock24={clock24}
                  compact
                  disabled={!cfg.enabled}
                  onChange={(range) =>
                    onChange({
                      ...schedule,
                      perDay: { ...schedule.perDay, [d.id]: { ...cfg, range } },
                    })
                  }
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
