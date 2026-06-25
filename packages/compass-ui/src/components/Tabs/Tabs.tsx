import type { ReactNode } from 'react';
import styles from './Tabs.module.scss';

export interface TabItem {
  /** Unique key for this tab. */
  key: string;
  /** Tab label text. */
  label: string;
  /** Optional count badge number. */
  countBadge?: number;
  /** When true, shows an unread dot badge. */
  unreadBadge?: boolean;
}

export interface TabsProps {
  /** Array of tab items to display. */
  tabs: TabItem[];
  /** Key of the currently active tab. */
  activeKey: string;
  /** Called when a tab is selected. */
  onChange: (key: string) => void;
  /** Optional CSS class name. */
  className?: string;
  /** Optional trailing controls rendered to the right of the tabs. */
  controls?: ReactNode;
}

/**
 * Tabs component matching Figma design.
 * Horizontal tab navigation with active state, count badges, and unread indicators.
 */
export default function Tabs({
  tabs,
  activeKey,
  onChange,
  className = '',
  controls,
}: TabsProps) {
  const rootClass = [styles.tabs, className].filter(Boolean).join(' ');

  return (
    <div className={rootClass}>
      <div className={styles['tabs__tab-list']} role="tablist">
        {tabs.map((tab) => {
          const isActive = tab.key === activeKey;
          const tabClass = [
            styles['tabs__tab'],
            isActive ? styles['tabs__tab--active'] : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <button
              key={tab.key}
              role="tab"
              type="button"
              aria-selected={isActive}
              className={tabClass}
              onClick={() => onChange(tab.key)}
            >
              <span className={styles['tabs__tab-label']}>{tab.label}</span>

              {tab.countBadge != null && (
                <span
                  className={[
                    styles['tabs__count-badge'],
                    isActive ? styles['tabs__count-badge--active'] : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {tab.countBadge}
                </span>
              )}

              {tab.unreadBadge && !isActive && (
                <span
                  className={styles['tabs__unread-badge']}
                  aria-label="Unread"
                />
              )}
            </button>
          );
        })}
      </div>

      {controls != null && (
        <div className={styles['tabs__controls']}>{controls}</div>
      )}
    </div>
  );
}
