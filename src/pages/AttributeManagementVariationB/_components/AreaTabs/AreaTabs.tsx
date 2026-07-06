import { type AreaKey } from '../../bData';
import styles from './AreaTabs.module.scss';

export interface AreaTabsProps {
  active: AreaKey;
  onChange: (next: AreaKey) => void;
}

const TABS: { key: AreaKey; label: string }[] = [
  { key: 'attributes', label: 'Resource Attributes' },
  { key: 'user', label: 'User Attributes' },
];

/**
 * Variation B's only top-level navigation: a clean in-page tab strip
 * `[ Attributes ] [ User Attributes ]`. NOT a System Console nav.
 *
 * This is the single legitimate chrome divergence from Variation A — A folds
 * Users into one list via resource pills; B splits into two areas.
 */
export default function AreaTabs({ active, onChange }: AreaTabsProps) {
  return (
    <div
      className={styles['area-tabs']}
      role="tablist"
      aria-label="Attribute areas"
    >
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`${styles['area-tabs__tab']} ${isActive ? styles['area-tabs__tab--active'] : ''}`}
            onClick={() => onChange(tab.key)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
