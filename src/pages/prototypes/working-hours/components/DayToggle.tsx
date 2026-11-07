import styles from '../WorkingHours.module.scss';

type Props = {
  /** Full day name, used as the accessible name. */
  label: string;
  /** Single-letter face (S M T W T F S). */
  letter: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

/**
 * Circular day-of-week toggle from the Working Hours design (Figma "Day Tag").
 * Compass has no day-picker control — Chip is a rounded token, not a 40px circle —
 * so this is prototype-only, built from tokens.
 */
export function DayToggle({ label, letter, checked, onChange }: Props) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      className={[styles['day-toggle'], checked && styles['day-toggle--on']]
        .filter(Boolean)
        .join(' ')}
      onClick={() => onChange(!checked)}
    >
      {letter}
    </button>
  );
}
