import PowerSleepIcon from '@mattermost/compass-icons/components/power-sleep';
import { Icon } from '@mattermost/compass-ui/components/icon';
import styles from '../WorkingHours.module.scss';

/** "The time for {name} is {time}" — shown above the composer when the DM partner is outside their working hours. */
export function LateHoursNotice({
  name,
  time,
}: {
  name: string;
  time: string;
}) {
  return (
    <div
      className={styles['late-notice']}
      data-testid="late-hours-notice"
      data-wt-focus="wh-notice"
    >
      <span className={styles['late-notice__icon']}>
        <Icon glyph={<PowerSleepIcon />} size="16" />
      </span>
      <span>
        The time for {name} is <strong>{time}</strong>
      </span>
    </div>
  );
}
