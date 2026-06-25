import Icon from '@/components/Icon/Icon';
import ArrowUpIcon from '@mattermost/compass-icons/components/arrow-up';
import ArrowDownIcon from '@mattermost/compass-icons/components/arrow-down';
import styles from './MoreUnreadsBanner.module.scss';

export type MoreUnreadsBannerDirection = 'Up' | 'Down';
export type MoreUnreadsBannerSize = 'Small' | 'Medium' | 'Large';

export interface MoreUnreadsBannerProps {
  /** Optional CSS class name. */
  className?: string;
  /** Arrow direction. Default: Up. */
  direction?: MoreUnreadsBannerDirection;
  /** Size variant. Default: Medium. */
  size?: MoreUnreadsBannerSize;
  /** Callback when the banner is clicked. */
  onClick?: () => void;
}

/**
 * More Unreads Banner — simple pill banner indicating unread messages
 * above or below the viewport in channel view.
 */
export default function MoreUnreadsBanner({
  className = '',
  direction = 'Up',
  size = 'Medium',
  onClick,
}: MoreUnreadsBannerProps) {
  const sizeClass = styles[`more-unreads-banner--size-${size.toLowerCase()}`];

  const rootClass = [styles['more-unreads-banner'], sizeClass, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={rootClass} type="button" onClick={onClick}>
      <span className={styles['more-unreads-banner__icon']} aria-hidden>
        {direction === 'Up' ? (
          <Icon size="12" glyph={<ArrowUpIcon />} />
        ) : (
          <Icon size="12" glyph={<ArrowDownIcon />} />
        )}
      </span>
      <span className={styles['more-unreads-banner__label']}>More unreads</span>
    </button>
  );
}
