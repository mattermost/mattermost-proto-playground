import type { ReactNode } from 'react';
import ConsoleHeader from '@/components/ui/ConsoleHeader/ConsoleHeader';
import ConsoleSearch from '@/components/ui/ConsoleSearch/ConsoleSearch';
import ConsoleSidebarCategory from '@/components/ui/ConsoleSidebarCategory/ConsoleSidebarCategory';
import ConsoleSidebarItem from '@/components/ui/ConsoleSidebarItem/ConsoleSidebarItem';
import styles from './ConsoleSidebar.module.scss';

export interface ConsoleSidebarNavItem {
  /** Unique item id. */
  id: string;
  /** Display label. */
  label: string;
  /** Optional tag badge (e.g. "Beta"). */
  tag?: string;
}

export interface ConsoleSidebarCategoryData {
  /** Unique category id. */
  id: string;
  /** Category title (rendered uppercase). */
  label: string;
  /** Compass icon element. */
  icon: ReactNode;
  /** Nav items in this category. */
  items: ConsoleSidebarNavItem[];
}

export interface ConsoleSidebarProps {
  /** Avatar image URL for the header. */
  avatarSrc: string;
  /** Alt text for the avatar. */
  avatarAlt?: string;
  /** Username shown in the header (without leading @). */
  username: string;
  /** Categories and their nav items. */
  categories: ConsoleSidebarCategoryData[];
  /** Currently selected item id. */
  activeItemId?: string;
  /** Callback when a nav item is clicked. */
  onItemClick?: (itemId: string) => void;
  /** Callback when the header menu icon is clicked. */
  onMenuClick?: () => void;
  /** Optional CSS class name. */
  className?: string;
}

/**
 * Full System Console sidebar — composes ConsoleHeader, ConsoleSearch,
 * ConsoleSidebarCategory, and ConsoleSidebarItem into the complete admin
 * navigation rail.
 *
 * Fixed 220px width; the header and search are pinned to the top, and the
 * category list scrolls independently below.
 *
 * @see Figma: Compass System Console → Console Sidebar
 */
export default function ConsoleSidebar({
  avatarSrc,
  avatarAlt,
  username,
  categories,
  activeItemId,
  onItemClick,
  onMenuClick,
  className = '',
}: ConsoleSidebarProps) {
  const rootClass = [styles['console-sidebar'], className]
    .filter(Boolean)
    .join(' ');

  return (
    <nav className={rootClass}>
      <div className={styles['console-sidebar__header']}>
        <ConsoleHeader
          avatarSrc={avatarSrc}
          avatarAlt={avatarAlt}
          username={username}
          onMenuClick={onMenuClick}
        />
        <div className={styles['console-sidebar__search']}>
          <ConsoleSearch />
        </div>
      </div>

      <div className={styles['console-sidebar__scroll']}>
        <div className={styles['console-sidebar__categories']}>
          {categories.map((cat) => (
            <div key={cat.id} className={styles['console-sidebar__category']}>
              <ConsoleSidebarCategory icon={cat.icon} label={cat.label} />
              <div className={styles['console-sidebar__items']}>
                {cat.items.map((item) => (
                  <ConsoleSidebarItem
                    key={item.id}
                    label={item.label}
                    tag={item.tag}
                    active={item.id === activeItemId}
                    onClick={() => onItemClick?.(item.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
