import type { ReactNode } from 'react';
import styles from './AppBarItem.module.scss';

export type AppBarItemState = 'Default' | 'Selected';

export interface AppBarItemProps {
  /** Icon element (image or SVG) representing the app. */
  icon: ReactNode;
  /** Accessible label for the app item. */
  label: string;
  /** Interaction state. Default: Default. */
  state?: AppBarItemState;
  /** When true, shows a mention count badge. */
  mentionBadge?: number;
  /** When true, shows an unread dot badge. */
  unreadBadge?: boolean;
  /** Click handler. */
  onClick?: () => void;
  /** Optional CSS class name. */
  className?: string;
}

/**
 * App Bar Item component matching Figma design.
 * Circular app icon for the right-side app bar with optional selection indicator and badges.
 */
export default function AppBarItem({
  icon,
  label,
  state = 'Default',
  mentionBadge,
  unreadBadge = false,
  onClick,
  className = '',
}: AppBarItemProps) {
  const isSelected = state === 'Selected';

  const rootClass = [
    styles['app-bar-item'],
    isSelected ? styles['app-bar-item--selected'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={rootClass}
      aria-label={label}
      aria-pressed={isSelected}
      onClick={onClick}
    >
      <span className={styles['app-bar-item__icon']}>{icon}</span>

      {mentionBadge != null && mentionBadge > 0 && (
        <span
          className={styles['app-bar-item__mention-badge']}
          aria-label={`${mentionBadge} mentions`}
        >
          {mentionBadge}
        </span>
      )}

      {unreadBadge && mentionBadge == null && (
        <span
          className={styles['app-bar-item__unread-badge']}
          aria-label="Unread"
        />
      )}
    </button>
  );
}
