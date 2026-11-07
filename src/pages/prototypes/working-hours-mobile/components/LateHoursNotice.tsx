import { Icon } from '@mattermost/compass-ui/components/icon';
import styles from '../WorkingHoursMobile.module.scss';

// compass-icons has no moon glyph. This is the webapp's own moon (components/common/svg_images_components/moon_svg).
const moonGlyph = (
  <svg
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-hidden
  >
    <path d="M18.73,18C15.4,21.69 9.71,22 6,18.64C2.33,15.31 2.04,9.62 5.37,5.93C6.9,4.25 9,3.2 11.27,3C7.96,6.7 8.27,12.39 12,15.71C13.63,17.19 15.78,18 18,18C18.25,18 18.5,18 18.73,18Z" />
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
