import Icon from '@/components/Icon/Icon';
import ArrowDownIcon from '@mattermost/compass-icons/components/arrow-down';
import CloseIcon from '@mattermost/compass-icons/components/close';
import styles from './NewMessageBanner.module.scss';

export type NewMessageBannerType = 'JumpToUnreads' | 'NewReplies';

export interface NewMessageBannerProps {
  /** Optional CSS class name. */
  className?: string;
  /** Type controls the layout. Default: JumpToUnreads. */
  type?: NewMessageBannerType;
  /** Unread count label text (e.g. "21 new messages since Saturday"). Used in JumpToUnreads type. */
  countLabel?: string;
  /** Called when the banner itself is clicked. */
  onClick?: () => void;
  /** Called when the dismiss (×) button is clicked. */
  onDismiss?: () => void;
}

/**
 * New Message Banner — blue pill banner for unread message navigation.
 * 'Jump to unreads' shows full-width with count. 'New replies' is compact.
 * Dismissable with X button.
 */
export default function NewMessageBanner({
  className = '',
  type = 'JumpToUnreads',
  countLabel,
  onClick,
  onDismiss,
}: NewMessageBannerProps) {
  const typeClass =
    styles[
      `new-message-banner--type-${type === 'JumpToUnreads' ? 'jump-to-unreads' : 'new-replies'}`
    ];

  const rootClass = [
    styles['new-message-banner'],
    typeClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      <button
        className={styles['new-message-banner__main']}
        type="button"
        onClick={onClick}
        aria-label={
          type === 'JumpToUnreads'
            ? countLabel != null
              ? `Jump to unreads, ${countLabel}`
              : 'Jump to unreads'
            : undefined
        }
      >
        <span className={styles['new-message-banner__left']}>
          <span className={styles['new-message-banner__icon']} aria-hidden>
            <Icon size="16" glyph={<ArrowDownIcon />} />
          </span>
          <span className={styles['new-message-banner__jump-label']}>
            {type === 'JumpToUnreads' ? 'Jump to unreads' : 'New replies'}
          </span>
        </span>
      </button>
      {type === 'JumpToUnreads' && countLabel != null && (
        <span className={styles['new-message-banner__count']} aria-hidden>
          {countLabel}
        </span>
      )}
      {onDismiss != null && (
        <button
          className={styles['new-message-banner__dismiss']}
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          <Icon size="16" glyph={<CloseIcon />} />
        </button>
      )}
    </div>
  );
}
