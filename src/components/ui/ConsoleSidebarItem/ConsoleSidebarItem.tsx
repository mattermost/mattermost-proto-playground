import styles from './ConsoleSidebarItem.module.scss';

export interface ConsoleSidebarItemProps {
  /** Nav item label text. */
  label: string;
  /** Whether this item is currently selected / active. */
  active?: boolean;
  /** Optional tag badge text shown after the label (e.g. "Beta"). */
  tag?: string;
  /** Click handler. */
  onClick?: () => void;
  /** Optional CSS class name. */
  className?: string;
}

/**
 * System Console sidebar navigation item.
 * Sits under a ConsoleSidebarCategory. Supports default and selected states.
 * Selected state shows a subtle background highlight and a right-edge caret
 * pointing into the content area.
 *
 * @see Figma: Compass System Console → Console Nav Item (Default / Selected)
 */
export default function ConsoleSidebarItem({
  label,
  active = false,
  tag,
  onClick,
  className = '',
}: ConsoleSidebarItemProps) {
  const rootClass = [
    styles['console-sidebar-item'],
    active ? styles['console-sidebar-item--active'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type="button" className={rootClass} onClick={onClick}>
      <div className={styles['console-sidebar-item__content']}>
        <span className={styles['console-sidebar-item__label']}>{label}</span>
        {tag != null && (
          <span className={styles['console-sidebar-item__tag']}>{tag}</span>
        )}
      </div>
      {active && (
        <span className={styles['console-sidebar-item__caret']} aria-hidden />
      )}
    </button>
  );
}
