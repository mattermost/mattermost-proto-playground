/**
 * DPC V2 A1 — ABAC policy picker.
 *
 * Mirrors the dpc/a1 picker so the V2 orchestrator can stay self-contained
 * without reaching into the original dpc/a1 folder. Drives the three ABAC
 * scenarios that exercise the revised Confirm-and-Commit modal:
 *
 *   • typical (12 users) — fast path, first-N preview rendered inline
 *   • empty   (0 users)  — edge case: admin can still commit
 *   • slow    (2400 users) — NFR-5 boundary: skeleton + disabled primary
 */
import { ABAC_POLICIES } from '@/pages/dpc/shared';
import type { AbacPolicyKey } from '../useA1V2Store';
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
