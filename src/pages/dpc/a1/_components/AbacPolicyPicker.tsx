/**
 * DPC A1 — ABAC policy picker.
 *
 * Renders into ScenarioHeader's trailingControl slot (per intake Q5).
 * Drives the three ABAC scenarios that exercise the Confirm-and-Commit
 * modal's matched-user surface:
 *
 *   • typical (12 users) — fast path, first-N preview rendered inline
 *   • empty   (0 users)  — edge case: admin can still commit
 *   • slow    (2400 users) — NFR-5 boundary: skeleton + disabled primary
 */
import { ABAC_POLICIES } from '@/pages/dpc/shared';
import type { AbacPolicyKey } from '../useA1Store';
import styles from './AbacPolicyPicker.module.scss';

export interface AbacPolicyPickerProps {
  value: AbacPolicyKey;
  onChange: (next: AbacPolicyKey) => void;
}

const POLICY_OPTIONS: AbacPolicyKey[] = ['typical', 'empty', 'slow'];

export default function AbacPolicyPicker({
  value,
  onChange,
}: AbacPolicyPickerProps) {
  return (
    <label className={styles['abac-picker']}>
      <span className={styles['abac-picker__label']}>ABAC scenario</span>
      <select
        className={styles['abac-picker__select']}
        value={value}
        onChange={(e) => onChange(e.target.value as AbacPolicyKey)}
      >
        {POLICY_OPTIONS.map((key) => (
          <option key={key} value={key}>
            {ABAC_POLICIES[key].label}
          </option>
        ))}
      </select>
    </label>
  );
}
