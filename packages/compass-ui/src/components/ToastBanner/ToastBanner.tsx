import type { ReactNode } from 'react';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import CheckIcon from '@mattermost/compass-icons/components/check';
import CloseIcon from '@mattermost/compass-icons/components/close';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import Button from '@/components/Button/Button';
import Icon from '@/components/Icon/Icon';
import IconButton from '@/components/IconButton/IconButton';
import styles from './ToastBanner.module.scss';

export type ToastBannerType =
  | 'General'
  | 'Info'
  | 'Success'
  | 'Warning'
  | 'Danger';

export interface ToastBannerProps {
  className?: string;
  message: string;
  type?: ToastBannerType;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}

const TYPE_ICONS: Record<ToastBannerType, ReactNode> = {
  General: <AlertCircleOutlineIcon />,
  Info: <InformationOutlineIcon />,
  Success: <CheckIcon />,
  Danger: <AlertOutlineIcon />,
  Warning: <AlertCircleOutlineIcon />,
};

export default function ToastBanner({
  className = '',
  message,
  type = 'General',
  actionLabel,
  onAction,
  onDismiss,
}: ToastBannerProps) {
  const typeClass = styles[`toast-banner--type-${type.toLowerCase()}`];
  const rootClass = [styles['toast-banner'], typeClass, className]
    .filter(Boolean)
    .join(' ');

  const showActions = actionLabel != null || onDismiss != null;

  return (
    <div className={rootClass} role="status" aria-live="polite">
      <div className={styles['toast-banner__content']}>
        <span className={styles['toast-banner__icon']} aria-hidden>
          <Icon glyph={TYPE_ICONS[type]} size="16" />
        </span>
        <span className={styles['toast-banner__message']}>{message}</span>
      </div>
      {showActions && (
        <div className={styles['toast-banner__actions']}>
          {actionLabel != null && (
            <Button
              appearance="Default"
              emphasis="Tertiary"
              size="X-Small"
              className={[
                styles['toast-banner__action-btn'],
                type === 'Warning'
                  ? styles['toast-banner__action-btn--warning']
                  : styles['toast-banner__action-btn--on-dark'],
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          )}
          {onDismiss != null && (
            <IconButton
              aria-label="Dismiss"
              size="Small"
              className={[
                styles['toast-banner__dismiss'],
                type === 'Warning'
                  ? styles['toast-banner__dismiss--warning']
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
              icon={<Icon glyph={<CloseIcon />} size="16" />}
              onClick={onDismiss}
            />
          )}
        </div>
      )}
    </div>
  );
}
