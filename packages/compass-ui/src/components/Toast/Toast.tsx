import type { ReactNode } from 'react';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import CheckIcon from '@mattermost/compass-icons/components/check';
import CloseIcon from '@mattermost/compass-icons/components/close';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import Button from '@/components/Button/Button';
import Icon from '@/components/Icon/Icon';
import IconButton from '@/components/IconButton/IconButton';
import styles from './Toast.module.scss';

export type ToastType =
  | 'General'
  | 'Info'
  | 'Success'
  | 'Warning'
  | 'Danger';

export interface ToastProps {
  className?: string;
  message: string;
  type?: ToastType;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}

const TYPE_ICONS: Record<ToastType, ReactNode> = {
  General: <AlertCircleOutlineIcon />,
  Info: <InformationOutlineIcon />,
  Success: <CheckIcon />,
  Danger: <AlertOutlineIcon />,
  Warning: <AlertCircleOutlineIcon />,
};

export default function Toast({
  className = '',
  message,
  type = 'General',
  actionLabel,
  onAction,
  onDismiss,
}: ToastProps) {
  const typeClass = styles[`toast--type-${type.toLowerCase()}`];
  const rootClass = [styles.toast, typeClass, className].filter(Boolean).join(' ');

  return (
    <div className={rootClass} role="status" aria-live="polite">
      <div className={styles['toast__content']}>
        <span className={styles['toast__icon']} aria-hidden>
          <Icon glyph={TYPE_ICONS[type]} size="16" />
        </span>
        <span className={styles['toast__message']}>{message}</span>
        {actionLabel != null && (
          <Button
            appearance="Default"
            emphasis="Tertiary"
            size="X-Small"
            className={styles['toast__action-btn--on-dark']}
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        )}
      </div>
      {onDismiss != null && (
        <IconButton
          aria-label="Dismiss"
          size="Small"
          className={styles['toast__dismiss']}
          icon={<Icon glyph={<CloseIcon />} size="16" />}
          onClick={onDismiss}
        />
      )}
    </div>
  );
}
