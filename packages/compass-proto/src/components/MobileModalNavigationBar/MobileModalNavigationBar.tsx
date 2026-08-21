import type {ReactNode} from 'react';
import ArrowBackIosIcon from '@mattermost/compass-icons/components/arrow-back-ios';
import CloseIcon from '@mattermost/compass-icons/components/close';
import { Icon } from '@mattermost/compass-ui';
import { IconButton } from '@mattermost/compass-ui';
import { UserAvatar } from '@mattermost/compass-ui';
import styles from './MobileModalNavigationBar.module.scss';

export type MobileModalNavigationBarVariant = 'Parent' | 'Child';

export interface MobileModalNavigationBarProps {
  /** Parent shows Close; Child shows Back. Default: Parent. */
  variant?: MobileModalNavigationBarVariant;
  /** Centered modal title. */
  title: string;
  /**
   * Optional secondary line under the title (Body 75).
   * When set, replaces the optional title avatar layout.
   */
  subtitle?: string;
  /** Optional 24px avatar before the title (ignored when subtitle is set). */
  avatarSrc?: string;
  avatarAlt?: string;
  /** Text action on the right (e.g. Done, Save). */
  actionLabel?: string;
  onActionClick?: () => void;
  /** Optional trailing icon button (e.g. Send). */
  trailingIcon?: ReactNode;
  onTrailingIconClick?: () => void;
  /** Parent — close control. */
  onCloseClick?: () => void;
  /** Child — back control. */
  onBackClick?: () => void;
  className?: string;
}

/**
 * Mobile iOS top nav for modal screens (Parent close / Child back).
 * Sidebar surface with rounded top corners — no status-bar spacer.
 *
 * @see Figma Patterns — Mobile — Top Nav Bar — Modal
 */
export default function MobileModalNavigationBar({
  variant = 'Parent',
  title,
  subtitle,
  avatarSrc,
  avatarAlt = '',
  actionLabel,
  onActionClick,
  trailingIcon,
  onTrailingIconClick,
  onCloseClick,
  onBackClick,
  className = '',
}: MobileModalNavigationBarProps) {
  const isParent = variant === 'Parent';
  const showSubtitle = Boolean(subtitle);

  const rootClass = [
    styles['mobile-modal-navigation-bar'],
    showSubtitle ? styles['mobile-modal-navigation-bar--subtitle'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={rootClass}>
      <div className={styles['mobile-modal-navigation-bar__bar']}>
        <div className={styles['mobile-modal-navigation-bar__left']}>
          {isParent ? (
            <IconButton
              aria-label='Close'
              size='Medium'
              style='Inverted'
              onClick={onCloseClick}
              icon={<Icon size='20' glyph={<CloseIcon />} />}
            />
          ) : (
            <IconButton
              aria-label='Back'
              size='Medium'
              style='Inverted'
              onClick={onBackClick}
              icon={<Icon size='20' glyph={<ArrowBackIosIcon />} />}
            />
          )}
        </div>

        <div className={styles['mobile-modal-navigation-bar__titles']}>
          {showSubtitle ? (
            <>
              <span className={styles['mobile-modal-navigation-bar__title']}>
                {title}
              </span>
              <span className={styles['mobile-modal-navigation-bar__subtitle']}>
                {subtitle}
              </span>
            </>
          ) : (
            <div className={styles['mobile-modal-navigation-bar__primary-title']}>
              {avatarSrc && (
                <UserAvatar src={avatarSrc} alt={avatarAlt} size='24' />
              )}
              <span className={styles['mobile-modal-navigation-bar__title']}>
                {title}
              </span>
            </div>
          )}
        </div>

        <div className={styles['mobile-modal-navigation-bar__right']}>
          {actionLabel && (
            <button
              type='button'
              className={styles['mobile-modal-navigation-bar__action']}
              onClick={onActionClick}
            >
              {actionLabel}
            </button>
          )}
          {trailingIcon && (
            <IconButton
              aria-label='Action'
              size='Medium'
              style='Inverted'
              onClick={onTrailingIconClick}
              icon={trailingIcon}
            />
          )}
        </div>
      </div>
    </header>
  );
}
