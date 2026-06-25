import type { ReactNode } from 'react';
import Button from '@/components/Button/Button';
import IconButton from '@/components/IconButton/IconButton';
import Icon from '@/components/Icon/Icon';
import CloseIcon from '@mattermost/compass-icons/components/close';
import styles from './GlobalBanner.module.scss';

export type GlobalBannerType =
  | 'General'
  | 'Warning'
  | 'Danger'
  | 'Info'
  | 'Success';

export interface GlobalBannerProps {
  /** Optional CSS class name. */
  className?: string;
  /** The message text. */
  message: string;
  /** Optional type for color-coding. Default: General. */
  type?: GlobalBannerType;
  /** Optional leading icon. */
  leadingIcon?: ReactNode;
  /** Label for the optional action button. */
  actionLabel?: string;
  /** Callback when the action button is clicked. */
  onAction?: () => void;
  /** Called when dismiss button is clicked. When omitted, dismiss button is hidden. */
  onDismiss?: () => void;
}

/**
 * Global Banner — full-width persistent banner at the top of the app.
 * Used for system alerts: maintenance, license, updates.
 * Fixed 40px height. Dismissable.
 */
export default function GlobalBanner({
  className = '',
  message,
  type = 'General',
  leadingIcon,
  actionLabel,
  onAction,
  onDismiss,
}: GlobalBannerProps) {
  const typeClass =
    type !== 'General'
      ? styles[`global-banner--type-${type.toLowerCase()}`]
      : '';

  const rootClass = [styles['global-banner'], typeClass, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass} role="banner">
      <div className={styles['global-banner__content']}>
        {leadingIcon != null && (
          <span className={styles['global-banner__icon']} aria-hidden>
            {leadingIcon}
          </span>
        )}
        <span className={styles['global-banner__message']}>{message}</span>
        {actionLabel != null && (
          <Button
            className={styles['global-banner__action']}
            appearance="Default"
            emphasis="Tertiary"
            size="X-Small"
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        )}
      </div>
      {onDismiss != null && (
        <IconButton
          className={styles['global-banner__dismiss']}
          aria-label="Dismiss"
          size="Small"
          icon={<Icon glyph={<CloseIcon />} size="16" />}
          onClick={onDismiss}
        />
      )}
    </div>
  );
}
