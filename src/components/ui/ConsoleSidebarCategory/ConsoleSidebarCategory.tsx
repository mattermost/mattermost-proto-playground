import type { ReactNode } from 'react';
import Icon from '@/components/ui/Icon/Icon';
import styles from './ConsoleSidebarCategory.module.scss';

export interface ConsoleSidebarCategoryProps {
  /** Compass icon component (e.g. `<CogOutlineIcon />`). */
  icon: ReactNode;
  /** Category label — rendered uppercase via CSS. */
  label: string;
  /** Optional CSS class name. */
  className?: string;
}

/**
 * System Console sidebar category header.
 * Section divider inside ConsoleSidebar: a leading compass icon plus an
 * uppercase label on a translucent strip.
 *
 * @see Figma: Compass System Console → Console Category
 */
export default function ConsoleSidebarCategory({
  icon,
  label,
  className = '',
}: ConsoleSidebarCategoryProps) {
  const rootClass = [styles['console-sidebar-category'], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      <Icon size="16" glyph={icon} />
      <span className={styles['console-sidebar-category__label']}>{label}</span>
    </div>
  );
}
