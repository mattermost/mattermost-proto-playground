/**
 * A small reference panel docked at the bottom-right of each prototype.
 * Lists "how to open each Figma view in THIS concept." Collapsible.
 */
import { useState } from 'react';
import styles from './NavigationMap.module.scss';

export interface NavStep {
  view: string;
  step: string;
}

interface NavigationMapProps {
  conceptLabel: string;
  steps: NavStep[];
}

export default function NavigationMap({ conceptLabel, steps }: NavigationMapProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className={[styles['nm'], open ? styles['nm--open'] : ''].filter(Boolean).join(' ')}>
      <button
        type="button"
        className={styles['nm__toggle']}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className={styles['nm__toggle-icon']}>{open ? '▾' : '▸'}</span>
        <span className={styles['nm__toggle-label']}>Navigation Map</span>
        <span className={styles['nm__toggle-meta']}>{steps.length} views</span>
      </button>
      {open ? (
        <div className={styles['nm__body']}>
          <div className={styles['nm__intro']}>
            How to reach each Figma view in <strong>{conceptLabel}</strong>:
          </div>
          <ul className={styles['nm__list']}>
            {steps.map((s, i) => (
              <li key={i} className={styles['nm__row']}>
                <span className={styles['nm__view']}>{s.view}</span>
                <span className={styles['nm__step']}>{s.step}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
