import MenuVariantIcon from '@mattermost/compass-icons/components/menu-variant';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import styles from './ConsoleHeader.module.scss';

export interface ConsoleHeaderProps {
  /** Avatar image URL. */
  avatarSrc: string;
  /** Alt text for the avatar. */
  avatarAlt?: string;
  /** Username displayed below the title (without leading @). */
  username: string;
  /** Title text. Default: "System Console". */
  title?: string;
  /** Callback when the menu icon is clicked. */
  onMenuClick?: () => void;
  /** Optional CSS class name. */
  className?: string;
}

/**
 * System Console sidebar header — the strip at the top of the admin sidebar
 * that identifies the current admin and surfaces a menu trigger.
 *
 * Sits above ConsoleSearch inside ConsoleSidebar. Renders on the sidebar's
 * dark surface, so all foreground uses the sidebar text token family.
 *
 * @see Figma: Compass System Console → Console Header
 */
export default function ConsoleHeader({
  avatarSrc,
  avatarAlt = '',
  username,
  title = 'System Console',
  onMenuClick,
  className = '',
}: ConsoleHeaderProps) {
  const rootClass = [styles['console-header'], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      <div className={styles['console-header__left']}>
        <UserAvatar src={avatarSrc} alt={avatarAlt} size="40" />
        <div className={styles['console-header__text']}>
          <span className={styles['console-header__title']}>{title}</span>
          <span className={styles['console-header__username']}>
            @{username}
          </span>
        </div>
      </div>
      <IconButton
        size="Small"
        style="Inverted"
        aria-label="Open admin menu"
        icon={<Icon size="16" glyph={<MenuVariantIcon />} />}
        onClick={onMenuClick}
      />
    </div>
  );
}
