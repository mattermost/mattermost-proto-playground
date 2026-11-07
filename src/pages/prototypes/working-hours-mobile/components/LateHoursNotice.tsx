import { Icon } from '@mattermost/compass-ui/components/icon';
import styles from '../WorkingHoursMobile.module.scss';

// compass-icons has no moon glyph; the notice draws its own crescent.
const moonGlyph = (
  <svg
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-hidden
  >
    <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.39 5.39 0 0 1-4.4 2.26 5.4 5.4 0 0 1-3.14-9.8A9.7 9.7 0 0 0 12 3Z" />
  </svg>
);

/** "The time for {name} is {time}" — shown above the composer when the DM partner is outside their working hours. */
export function LateHoursNotice({
  name,
  time,
}: {
  name: string;
  time: string;
}) {
  return (
    <div className={styles['late-notice']} data-testid="late-hours-notice">
      <span className={styles['late-notice__icon']}>
        <Icon glyph={moonGlyph} size="16" />
      </span>
      <span>
        The time for {name} is <strong>{time}</strong>
      </span>
    </div>
  );
}
