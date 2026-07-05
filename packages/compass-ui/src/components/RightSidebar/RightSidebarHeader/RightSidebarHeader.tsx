import type { ReactNode } from 'react';
import ArrowBackIosIcon from '@mattermost/compass-icons/components/arrow-back-ios';
import ArrowExpandIcon from '@mattermost/compass-icons/components/arrow-expand';
import CloseIcon from '@mattermost/compass-icons/components/close';
import Icon from '@/components/Icon/Icon';
import IconButton from '@/components/IconButton/IconButton';
import Tag from '@/components/Tag/Tag';
import type { TagType } from '@/components/Tag/Tag';
import styles from './RightSidebarHeader.module.scss';

export interface RightSidebarHeaderProps {
  /** Primary title text. */
  title: string;
  /** Secondary title shown to the right of a vertical divider (e.g. parent channel name). */
  secondaryTitle?: string;
  /** Optional tag rendered next to the title (e.g. "BETA"). */
  tag?: string;
  /** Tag visual style. Default: Info. */
  tagType?: TagType;
  /** Optional leading element shown before the title — typically a UserAvatar or Icon. */
  leadingIcon?: ReactNode;
  /** When set, shows a back button and calls this on click. */
  onBack?: () => void;
  /** When set, shows an expand button and calls this on click. */
  onExpand?: () => void;
  /** When set, shows a close button and calls this on click. */
  onClose?: () => void;
  /** Optional inline action label (e.g. "Follow"). */
  actionLabel?: string;
  /** Click handler for the action label. */
  onActionClick?: () => void;
  /** When true, the action button shows in its active state. */
  actionActive?: boolean;
  className?: string;
}

export default function RightSidebarHeader({
  title,
  secondaryTitle,
  tag,
  tagType = 'Info',
  leadingIcon,
  onBack,
  onExpand,
  onClose,
  actionLabel,
  onActionClick,
  actionActive = false,
  className = '',
}: RightSidebarHeaderProps) {
  const rootClass = [styles['right-sidebar-header'], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      <div className={styles['right-sidebar-header__left']}>
        <div className={styles['right-sidebar-header__primary']}>
          {onBack && (
            <IconButton
              className={styles['right-sidebar-header__back']}
              size="Small"
              aria-label="Back"
              onClick={onBack}
              icon={<Icon size="16" glyph={<ArrowBackIosIcon />} />}
            />
          )}
          {leadingIcon && (
            <span className={styles['right-sidebar-header__leading-icon']}>
              {leadingIcon}
            </span>
          )}
          <span className={styles['right-sidebar-header__title']}>{title}</span>
          {tag && (
            <span className={styles['right-sidebar-header__tag']}>
              <Tag
                label={tag}
                type={tagType}
                size="X-Small"
                casing="All Caps"
              />
            </span>
          )}
        </div>
        {secondaryTitle && (
          <div className={styles['right-sidebar-header__secondary']}>
            <span className={styles['right-sidebar-header__secondary-text']}>
              {secondaryTitle}
            </span>
          </div>
        )}
      </div>

      <div className={styles['right-sidebar-header__actions']}>
        {actionLabel && (
          <button
            type="button"
            className={[
              styles['right-sidebar-header__action'],
              actionActive
                ? styles['right-sidebar-header__action--active']
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={onActionClick}
            aria-pressed={actionActive ? true : undefined}
          >
            {actionLabel}
          </button>
        )}
        {onExpand && (
          <IconButton
            size="Small"
            aria-label="Expand"
            onClick={onExpand}
            icon={<Icon size="16" glyph={<ArrowExpandIcon />} />}
          />
        )}
        {onClose && (
          <IconButton
            size="Small"
            aria-label="Close"
            onClick={onClose}
            icon={<Icon size="16" glyph={<CloseIcon />} />}
          />
        )}
      </div>
    </div>
  );
}
