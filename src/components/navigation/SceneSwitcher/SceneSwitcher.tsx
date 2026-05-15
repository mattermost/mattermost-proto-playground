import styles from './SceneSwitcher.module.scss';

export interface SceneSwitcherScene {
  id: string;
  label: string;
}

export interface SceneSwitcherProps {
  scenes: SceneSwitcherScene[];
  activeId: string;
  onChange: (id: string) => void;
  /** Optional caption before the segmented control. Omit for label-free toolbars. */
  label?: string;
  /** Accessible name for the tablist. */
  ariaLabel?: string;
}

export default function SceneSwitcher({
  scenes,
  activeId,
  onChange,
  label,
  ariaLabel = 'Scene selection',
}: SceneSwitcherProps) {
  return (
    <div
      className={styles['scene-switcher']}
      role="tablist"
      aria-label={ariaLabel}
    >
      {label ? (
        <span className={styles['scene-switcher__label']}>{label}</span>
      ) : null}
      <div className={styles['scene-switcher__segmented']}>
        {scenes.map((s) => {
          const isActive = s.id === activeId;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`${styles['scene-switcher__tab']} ${
                isActive ? styles['scene-switcher__tab--active'] : ''
              }`}
              onClick={() => onChange(s.id)}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
