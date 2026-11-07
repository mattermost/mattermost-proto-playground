import { Checkbox } from '@mattermost/compass-ui/components/checkbox';
import { Select } from '@mattermost/compass-ui/components/select';
import {
  DAYS,
  DAYS_MODE_OPTIONS,
  type DaysMode,
  type ScheduleState,
} from '../workingHoursData';
import { TimeRangeSelects } from './TimeRangeSelects';
import styles from '../WorkingHours.module.scss';

type Props = {
  schedule: ScheduleState;
  clock24: boolean;
  onChange: (next: ScheduleState) => void;
};

/**
 * Desktop configuration: days-of-week Select, then one time range, or — for
 * Custom Schedule — every day of the week with its own range.
 */
export function ScheduleForm({ schedule, clock24, onChange }: Props) {
  return (
    <div className={styles['schedule-form']}>
      <Select
        id="ns-days-mode"
        label="Days of the week"
        options={DAYS_MODE_OPTIONS}
        value={schedule.mode}
        onChange={(v) => onChange({ ...schedule, mode: v as DaysMode })}
      />

      {schedule.mode !== 'custom' ? (
        <div className={styles['schedule-form__group']}>
          <p className={styles['schedule-form__label']}>
            Receive notifications between
          </p>
          <TimeRangeSelects
            idPrefix="ns-range"
            range={schedule.range}
            clock24={clock24}
            onChange={(range) => onChange({ ...schedule, range })}
          />
        </div>
      ) : (
        <ul
          className={styles['schedule-form__days']}
          aria-label="Notification hours by day"
        >
          {DAYS.map((d) => {
            const cfg = schedule.perDay[d.id];
            return (
              <li key={d.id} className={styles['schedule-form__day']}>
                <Checkbox
                  checked={cfg.enabled}
                  onChange={(e) =>
                    onChange({
                      ...schedule,
                      perDay: {
                        ...schedule.perDay,
                        [d.id]: { ...cfg, enabled: e.target.checked },
                      },
                    })
                  }
                >
                  {d.label}
                </Checkbox>
                <div className={styles['schedule-form__day-range']}>
                  {cfg.enabled ? (
                    <TimeRangeSelects
                      idPrefix={`ns-${d.id}`}
                      range={cfg.range}
                      clock24={clock24}
                      size="small"
                      onChange={(range) =>
                        onChange({
                          ...schedule,
                          perDay: {
                            ...schedule.perDay,
                            [d.id]: { ...cfg, range },
                          },
                        })
                      }
                    />
                  ) : (
                    <span className={styles['schedule-form__off']}>
                      Do Not Disturb all day
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
