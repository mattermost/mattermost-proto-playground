import type { ReactNode } from 'react';
import Button from '@/components/Button/Button';
import IconButton from '@/components/IconButton/IconButton';
import Icon from '@/components/Icon/Icon';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import CheckCircleOutlineIcon from '@mattermost/compass-icons/components/check-circle-outline';
import CloseIcon from '@mattermost/compass-icons/components/close';
import styles from './SectionNotice.module.scss';

export type SectionNoticeType =
  | 'Info'
  | 'Warning'
  | 'Danger'
  | 'Success'
  | 'Hint';

export interface SectionNoticeProps {
  /** Optional CSS class name. */
  className?: string;
  /** Type controls color-coding. Default: Info. */
  type?: SectionNoticeType;
  /** Optional leading icon. When omitted a default type icon is shown. */
  icon?: ReactNode;
  /** Title / headline text. */
  title: string;
  /** Optional body description. */
  description?: ReactNode;
  /** Primary action button label. */
  primaryButtonLabel?: string;
  /** Primary action callback. */
  onPrimaryAction?: () => void;
  /** Secondary action button label. */
  secondaryButtonLabel?: string;
  /** Secondary action callback. */
  onSecondaryAction?: () => void;
  /** Called when dismiss (×) button is clicked. When omitted, dismiss button is hidden. */
  onDismiss?: () => void;
}

const DEFAULT_ICONS: Record<SectionNoticeType, ReactNode> = {
  Info: <Icon size="20" glyph={<InformationOutlineIcon />} />,
  Warning: <Icon size="20" glyph={<AlertCircleOutlineIcon />} />,
  Danger: <Icon size="20" glyph={<AlertOutlineIcon />} />,
  Success: <Icon size="20" glyph={<CheckCircleOutlineIcon />} />,
  Hint: <Icon size="20" glyph={<InformationOutlineIcon />} />,
};

/**
 * Section Notice — in-context notice block for settings and admin panels.
 * Color-coded by severity. Supports title, description, primary/secondary
 * action buttons, and dismiss.
 */
export default function SectionNotice({
  className = '',
  type = 'Info',
  icon,
  title,
  description,
  primaryButtonLabel,
  onPrimaryAction,
  secondaryButtonLabel,
  onSecondaryAction,
  onDismiss,
}: SectionNoticeProps) {
  const typeClass = styles[`section-notice--type-${type.toLowerCase()}`];

  const rootClass = [styles['section-notice'], typeClass, className]
    .filter(Boolean)
    .join(' ');

  const resolvedIcon = icon !== undefined ? icon : DEFAULT_ICONS[type];

  const hasActions = primaryButtonLabel != null || secondaryButtonLabel != null;

  return (
    <div className={rootClass}>
      <div className={styles['section-notice__content']}>
        {resolvedIcon != null && (
          <span className={styles['section-notice__icon']} aria-hidden>
            {resolvedIcon}
          </span>
        )}
        <div className={styles['section-notice__body']}>
          <p className={styles['section-notice__title']}>{title}</p>
          {description != null && (
            <div className={styles['section-notice__description']}>
              {description}
            </div>
          )}
          {hasActions && (
            <div className={styles['section-notice__actions']}>
              {primaryButtonLabel != null && (
                <Button
                  emphasis="Primary"
                  size="Small"
                  onClick={onPrimaryAction}
                >
                  {primaryButtonLabel}
                </Button>
              )}
              {secondaryButtonLabel != null && (
                <Button
                  emphasis="Secondary"
                  size="Small"
                  onClick={onSecondaryAction}
                >
                  {secondaryButtonLabel}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      {onDismiss != null && (
        <IconButton
          className={styles['section-notice__dismiss']}
          aria-label="Dismiss"
          size="Small"
          icon={<Icon size="16" glyph={<CloseIcon />} />}
          onClick={onDismiss}
        />
      )}
    </div>
  );
}
