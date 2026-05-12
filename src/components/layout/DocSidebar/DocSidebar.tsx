import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './DocSidebar.module.scss';

export interface SidebarItem {
  /** Stable key. */
  key: string;
  /** Display label. */
  name: string;
  /** Destination URL. */
  to: string;
  /** When true, the link only matches an exact path (no nested matches). */
  end?: boolean;
}

export interface SidebarGroup {
  /** Section heading shown above the items. Empty string = no heading. */
  label: string;
  items: SidebarItem[];
}

interface DocSidebarProps {
  groups: SidebarGroup[];
  /** Optional content rendered above all section groups (e.g. back button). */
  header?: ReactNode;
}

export default function DocSidebar({ groups, header }: DocSidebarProps) {
  return (
    <nav className={styles['doc-sidebar']} aria-label="Section navigation">
      {header && <div className={styles['doc-sidebar__header']}>{header}</div>}
      {groups.map((group, i) =>
        group.items.length === 0 ? null : (
          <div key={`${group.label}-${i}`} className={styles['doc-sidebar__group']}>
            {group.label && (
              <div className={styles['doc-sidebar__group-header']}>
                {group.label}
              </div>
            )}
            <ul className={styles['doc-sidebar__list']}>
              {group.items.map((item) => (
                <li key={item.key} className={styles['doc-sidebar__list-item']}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      [
                        styles['doc-sidebar__item'],
                        isActive ? styles['doc-sidebar__item--active'] : '',
                      ]
                        .filter(Boolean)
                        .join(' ')
                    }
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ),
      )}
    </nav>
  );
}
