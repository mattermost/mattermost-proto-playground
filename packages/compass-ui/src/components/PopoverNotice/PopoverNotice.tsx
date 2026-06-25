import type { ReactNode } from 'react';
import CloseIcon from '@mattermost/compass-icons/components/close';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import CheckCircleOutlineIcon from '@mattermost/compass-icons/components/check-circle-outline';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import Button from '@/components/Button/Button';
import Checkbox from '@/components/Checkbox/Checkbox';
import IconButton from '@/components/IconButton/IconButton';
import Icon from '@/components/Icon/Icon';
import styles from './PopoverNotice.module.scss';

export type PopoverNoticeVariant = 'info' | 'success' | 'warning' | 'danger';

export interface PopoverNoticeAction {
  label: string;
  onClick?: () => void;
  emphasis?: 'primary' | 'tertiary';
}

export interface PopoverNoticeProps {
  /** Popover title text. */
  title: string;
  /** Body content. */
  children: ReactNode;
  /**
   * Semantic variant — sets the icon and its color automatically.
   * Ignored if `icon` is also provided.
   */
  variant?: PopoverNoticeVariant;
  /** Optional icon shown to the left of the title. Overrides variant icon. */
  icon?: ReactNode;
  /** Action buttons rendered below the body. */
  actions?: PopoverNoticeAction[];
  /** When true, shows a "Don't show this again" checkbox. */
  showCheckbox?: boolean;
  /** Checkbox label override. */
  checkboxLabel?: string;
  /** Callback when close button is clicked. */
  onClose?: () => void;
  /** Optional CSS class name. */
  className?: string;
}

const VARIANT_ICONS: Record<PopoverNoticeVariant, ReactNode> = {
  info: <Icon size="20" glyph={<InformationOutlineIcon />} />,
  success: <Icon size="20" glyph={<CheckCircleOutlineIcon />} />,
  warning: <Icon size="20" glyph={<AlertCircleOutlineIcon />} />,
  danger: <Icon size="20" glyph={<AlertOutlineIcon />} />,
};

const VARIANT_ICON_CLASS: Record<PopoverNoticeVariant, string> = {
  info: styles['popover-notice__icon--info'],
  success: styles['popover-notice__icon--success'],
  warning: styles['popover-notice__icon--warning'],
  danger: styles['popover-notice__icon--danger'],
};

export default function PopoverNotice({
  title,
  children,
  variant,
  icon,
  actions,
  showCheckbox = false,
  checkboxLabel = "Don't show this confirmation again",
  onClose,
  className = '',
}: PopoverNoticeProps) {
  const rootClass = [styles['popover-notice'], className]
    .filter(Boolean)
    .join(' ');

  const resolvedIcon = icon ?? (variant ? VARIANT_ICONS[variant] : null);
  const iconColorClass = !icon && variant ? VARIANT_ICON_CLASS[variant] : '';

  return (
    <div className={rootClass}>
      <div className={styles['popover-notice__content']}>
        {resolvedIcon != null && (
          <div
            className={[styles['popover-notice__icon'], iconColorClass]
              .filter(Boolean)
              .join(' ')}
            aria-hidden
          >
            {resolvedIcon}
          </div>
        )}

        <div className={styles['popover-notice__body']}>
          <div className={styles['popover-notice__title-row']}>
            <span className={styles['popover-notice__title']}>{title}</span>
          </div>

          <div className={styles['popover-notice__description']}>
            {children}
          </div>

          {actions && actions.length > 0 && (
            <div className={styles['popover-notice__actions']}>
              {actions.map((action, i) => (
                <Button
                  key={i}
                  emphasis={
                    action.emphasis === 'tertiary' ? 'Tertiary' : 'Primary'
                  }
                  size="Small"
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          {showCheckbox && <Checkbox size="Medium">{checkboxLabel}</Checkbox>}
        </div>
      </div>

      {onClose && (
        <IconButton
          className={styles['popover-notice__close']}
          aria-label="Close"
          size="Small"
          icon={<Icon size="16" glyph={<CloseIcon />} />}
          onClick={onClose}
        />
      )}
    </div>
  );
}
