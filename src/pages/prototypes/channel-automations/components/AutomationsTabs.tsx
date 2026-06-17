import type { ReactNode } from 'react';
import styles from './AutomationsTabs.module.scss';

export interface AutomationsTabItem {
  key: string;
  label: string;
}

export interface AutomationsTabsProps {
  tabs: AutomationsTabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
  /** Optional trailing controls rendered to the right of the tabs. */
  controls?: ReactNode;
  ariaLabel?: string;
  /** When false, omits the strip divider (e.g. when a parent header owns it). Default: true. */
  showDivider?: boolean;
  /** When true, indents the tab row (Figma modal tab bar uses 20px). Default: false. */
  inset?: boolean;
  /** When true, adds 12px left padding for the RHS editor tab strip. Default: false. */
  rhsInset?: boolean;
}

/**
 * Underline tab strip for the Channel Automations prototype (Figma TabAlt
 * `4340-122579`). Use in place of the pill Tabs styles within this prototype.
 */
export default function AutomationsTabs({
  tabs,
  activeKey,
  onChange,
  className = '',
  controls,
  ariaLabel,
  showDivider = true,
  inset = false,
  rhsInset = false,
}: AutomationsTabsProps) {
  const rootClass = [
    styles['automations-tabs'],
    !showDivider && styles['automations-tabs--no-divider'],
    inset && styles['automations-tabs--inset'],
    rhsInset && styles['automations-tabs--rhs-inset'],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      <div
        className={styles['automations-tabs__list']}
        role="tablist"
        aria-label={ariaLabel}
      >
        {tabs.map((tab) => {
          const isActive = tab.key === activeKey;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={[
                styles['automations-tabs__tab'],
                isActive ? styles['automations-tabs__tab--active'] : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onChange(tab.key)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {controls != null && (
        <div className={styles['automations-tabs__controls']}>{controls}</div>
      )}
    </div>
  );
}
