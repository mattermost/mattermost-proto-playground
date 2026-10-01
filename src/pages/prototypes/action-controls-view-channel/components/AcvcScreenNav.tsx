import styles from './AcvcScreenNav.module.scss';

export interface AcvcScreen {
  id: string;
  label: string;
}

export interface AcvcScreenNavProps {
  screens: readonly AcvcScreen[];
  activeId: string;
  onChange: (id: string) => void;
  ariaLabel?: string;
}

/**
 * Sub-screen navigation inside a single surface. The prototype's centre slot
 * switches surfaces; this switches screens within one.
 */
export default function AcvcScreenNav({
  screens,
  activeId,
  onChange,
  ariaLabel = 'Screen selection',
}: AcvcScreenNavProps) {
  return (
    <nav className={styles['acvc-screen-nav']} aria-label={ariaLabel}>
      {screens.map((screen) => {
        const isActive = screen.id === activeId;
        return (
          <button
            key={screen.id}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            className={[
              styles['acvc-screen-nav__item'],
              isActive ? styles['acvc-screen-nav__item--active'] : '',
            ]
              .join(' ')
              .trim()}
            onClick={() => onChange(screen.id)}
          >
            {screen.label}
          </button>
        );
      })}
    </nav>
  );
}
