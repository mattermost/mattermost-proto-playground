/**
 * DPC ScenarioHeader — the per-prototype harness header.
 *
 * Renders at the top of every DPC prototype. Hosts:
 *   - Prototype label (passed by the prototype as a prop)
 *   - Persona dropdown (5 personas per intake Q4)
 *   - Viewport toggle (desktop ↔ mobile per intake Q6)
 *   - Optional approach-specific dropdown slot (A1 uses this for the
 *     ABAC policy scale picker per intake Q5)
 *
 * No prototype content is rendered here; this is purely the harness chrome.
 */
import { type ReactNode } from 'react';
import { usePersona } from './PersonaContext';
import { useViewport } from './ViewportContext';
import { PERSONAS, PERSONA_ORDER, type Persona } from './fixtures';
import styles from './ScenarioHeader.module.scss';

export interface ScenarioHeaderProps {
  /** Display label for the prototype, e.g. "DPC — A1: Confirm-and-Commit". */
  label: string;
  /** Optional extra control rendered inline (e.g. A1's policy picker). */
  trailingControl?: ReactNode;
}

export default function ScenarioHeader({
  label,
  trailingControl,
}: ScenarioHeaderProps) {
  const { persona, setPersona } = usePersona();
  const { viewport, toggle: toggleViewport } = useViewport();

  return (
    <header className={styles['dpc-header']}>
      <div className={styles['dpc-header__label']}>
        <span className={styles['dpc-header__eyebrow']}>Prototype</span>
        <span className={styles['dpc-header__title']}>{label}</span>
      </div>

      <div className={styles['dpc-header__controls']}>
        <label className={styles['dpc-header__field']}>
          <span className={styles['dpc-header__field-label']}>Persona</span>
          <select
            className={styles['dpc-header__select']}
            value={persona}
            onChange={(e) => setPersona(e.target.value as Persona)}
          >
            {PERSONA_ORDER.map((p) => (
              <option key={p} value={p}>
                {PERSONAS[p].roleLabel} — {PERSONAS[p].displayName}
              </option>
            ))}
          </select>
        </label>

        {trailingControl != null && (
          <div className={styles['dpc-header__slot']}>{trailingControl}</div>
        )}

        <button
          type="button"
          className={styles['dpc-header__viewport']}
          onClick={toggleViewport}
          aria-pressed={viewport === 'mobile'}
        >
          <span
            className={`${styles['dpc-header__viewport-option']} ${
              viewport === 'desktop'
                ? styles['dpc-header__viewport-option--active']
                : ''
            }`}
          >
            Desktop · 1280
          </span>
          <span
            className={`${styles['dpc-header__viewport-option']} ${
              viewport === 'mobile'
                ? styles['dpc-header__viewport-option--active']
                : ''
            }`}
          >
            Mobile · 360
          </span>
        </button>
      </div>
    </header>
  );
}
