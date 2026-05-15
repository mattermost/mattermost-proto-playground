/**
 * Scenario switcher — the trailingControl rendered in the prototype
 * ScenarioHeader for A4.
 *
 * A4's most important comparative interaction is toggling between the
 * tenured-user view (populated reference surfaces) and the newer-user view
 * (the [FAILURE MODE #1 VISIBLE] composite). This control lives in the
 * scenario-header trailingControl slot per §3.4.13: *"the prototype must
 * make it switchable via a 'view as: tenured user / newer user' toggle in
 * the prototype-playground viewer"*.
 *
 * Implemented as a small toggle that calls usePersona() under the hood —
 * we switch the persona to `end-user-tenured` or `end-user-newer`. The main
 * A4 page reads persona via usePersona() and renders the correct branch.
 *
 * (We don't replace the existing 5-persona dropdown — that's the
 * authoritative persona selector. This toggle is a one-tap shortcut for
 * the failure-mode demonstration specifically.)
 */
import { usePersona } from '@/pages/dpc/shared';
import type { Persona } from '@/pages/dpc/shared';
import styles from './ScenarioSwitcher.module.scss';

export default function ScenarioSwitcher() {
  const { persona, setPersona } = usePersona();

  const tenuredActive = persona === 'end-user-tenured';
  const newerActive = persona === 'end-user-newer';
  const showsToggle = tenuredActive || newerActive;

  if (!showsToggle) {
    return (
      <div className={styles['scenario-switcher']}>
        <span className={styles['scenario-switcher__hint']}>
          End-user persona to enable view toggle
        </span>
      </div>
    );
  }

  const select = (p: Persona) => () => setPersona(p);

  return (
    <div
      className={styles['scenario-switcher']}
      role="group"
      aria-label="A4 view-as toggle"
    >
      <span className={styles['scenario-switcher__label']}>View as</span>
      <div className={styles['scenario-switcher__toggle']}>
        <button
          type="button"
          className={[
            styles['scenario-switcher__option'],
            tenuredActive
              ? styles['scenario-switcher__option--active']
              : '',
          ].join(' ')}
          onClick={select('end-user-tenured')}
          aria-pressed={tenuredActive}
        >
          Tenured user
        </button>
        <button
          type="button"
          className={[
            styles['scenario-switcher__option'],
            newerActive
              ? styles['scenario-switcher__option--active']
              : '',
            styles['scenario-switcher__option--danger'],
          ].join(' ')}
          onClick={select('end-user-newer')}
          aria-pressed={newerActive}
        >
          Newer user · failure mode #1
        </button>
      </div>
    </div>
  );
}
