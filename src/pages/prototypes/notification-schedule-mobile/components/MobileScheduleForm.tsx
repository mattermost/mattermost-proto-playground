import CheckIcon from '@mattermost/compass-icons/components/check';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { MobileMenuItem } from '@mattermost/compass-proto';
import {
  DAYS,
  DAYS_MODE_OPTIONS,
  type ScheduleState,
} from '@/pages/prototypes/notification-schedule/notificationScheduleData';
import { TimeRangeSelects } from './TimeRangeSelects';
import styles from '../NotificationScheduleMobile.module.scss';

type Props = {
  schedule: ScheduleState;
  clock24: boolean;
  onChange: (next: ScheduleState) => void;
  portalContainer: HTMLElement | null;
};

const checkGlyph = <Icon glyph={<CheckIcon />} size="20" />;

/** Mobile configuration: day-mode rows, then start/end (or per-day) times. */
export function MobileScheduleForm({
  schedule,
  clock24,
  onChange,
  portalContainer,
}: Props) {
  return (
    <div className={styles['mobile-form']}>
      <p className={styles['mobile-form__heading']}>Days of the week</p>
      <div role="radiogroup" aria-label="Days of the week">
        {DAYS_MODE_OPTIONS.map((o) => {
          const selected = schedule.mode === o.value;
          return (
            <MobileMenuItem
              key={o.value}
              label={o.label}
              leadingElement={false}
              trailingElement={selected}
              trailingVisual={selected ? checkGlyph : undefined}
              active={selected}
              role="radio"
              aria-checked={selected}
              onClick={() => onChange({ ...schedule, mode: o.value })}
            />
          );
        })}
      </div>

      {schedule.mode !== 'custom' ? (
        <>
          <p className={styles['mobile-form__heading']}>
            Receive notifications between
          </p>
          <div className={styles['mobile-form__fields']}>
            <TimeRangeSelects
              idPrefix="ns-m-range"
              range={schedule.range}
              clock24={clock24}
              size="large"
              showLabels
              portalContainer={portalContainer}
              onChange={(range) => onChange({ ...schedule, range })}
            />
          </div>
        </>
      ) : (
        <>
          <p className={styles['mobile-form__heading']}>Days and hours</p>
          {DAYS.map((d) => {
            const cfg = schedule.perDay[d.id];
            return (
              <div key={d.id}>
                <MobileMenuItem
                  label={d.label}
                  secondaryLabel={
                    cfg.enabled ? undefined : 'Do Not Disturb all day'
                  }
                  leadingElement={false}
                  trailingElement={cfg.enabled}
                  trailingVisual={cfg.enabled ? checkGlyph : undefined}
                  role="checkbox"
                  aria-checked={cfg.enabled}
                  onClick={() =>
                    onChange({
                      ...schedule,
                      perDay: {
                        ...schedule.perDay,
                        [d.id]: { ...cfg, enabled: !cfg.enabled },
                      },
                    })
                  }
                />
                {cfg.enabled && (
                  <div className={styles['mobile-form__fields']}>
                    <TimeRangeSelects
                      idPrefix={`ns-m-${d.id}`}
                      range={cfg.range}
                      clock24={clock24}
                      size="large"
                      showLabels
                      portalContainer={portalContainer}
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
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
