import type { ChangeEvent } from 'react';
import styles from './DevToolbar.module.scss';

export interface DevToolbarOption {
  /** State key written to `?state=`. */
  key: string;
  /** Human-readable label shown in the select. */
  label: string;
}

export interface DevToolbarProps {
  /** Current state key. */
  activeKey: string;
  /** Full state catalog. */
  options: readonly DevToolbarOption[];
  /** Called when the user picks a different state. */
  onChange: (key: string) => void;
}

/**
 * Thin floating toolbar for switching between prototype states.
 * Only visible when `?dev=1` is present in the URL — see `PBEFinalDesignV2`.
 */
export default function DevToolbar({
  activeKey,
  options,
  onChange,
}: DevToolbarProps) {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div
      className={styles['dev-toolbar']}
      role="toolbar"
      aria-label="Prototype state switcher"
    >
      <span className={styles['dev-toolbar__badge']}>Dev</span>
      <label className={styles['dev-toolbar__label']}>
        <span className={styles['dev-toolbar__label-text']}>State</span>
        <select
          className={styles['dev-toolbar__select']}
          value={activeKey}
          onChange={handleChange}
        >
          {options.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
