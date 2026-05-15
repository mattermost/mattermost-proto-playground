import type { ReactNode } from 'react';
import Radio from '@/components/ui/Radio/Radio';
import styles from './RadioCard.module.scss';

export interface RadioCardProps {
  /** Shared radio group name. */
  name: string;
  /** This card's value. */
  value: string;
  /** Whether this card is the selected one in its group. */
  checked: boolean;
  /** Called when this card is selected (click anywhere on the card or the radio). */
  onSelect: (value: string) => void;
  /** Radio label text. */
  label: ReactNode;
  /**
   * Body content shown only when the card is selected (rules, chips, warning
   * notice, etc.). Hidden in the unselected state.
   */
  expandedBody?: ReactNode;
  /** Optional CSS class name. */
  className?: string;
}

/**
 * RadioCard — bordered radio container that expands its body when selected.
 *
 * Used in the EM Eligibility panel to present three mutually-exclusive
 * eligibility modes ("Users matching attribute rules", "Specific users",
 * "All users"), each revealing a configuration body when chosen.
 *
 * Page-local to the PBE Final Design V2 prototype. Gap G8 of the port plan.
 */
export default function RadioCard({
  name,
  value,
  checked,
  onSelect,
  label,
  expandedBody,
  className = '',
}: RadioCardProps) {
  const rootClass = [
    styles['radio-card'],
    checked ? styles['radio-card--selected'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={rootClass}
      onClick={() => onSelect(value)}
      role="presentation"
    >
      <Radio
        name={name}
        value={value}
        checked={checked}
        onChange={() => onSelect(value)}
      >
        {label}
      </Radio>
      {checked && expandedBody != null && (
        <div className={styles['radio-card__body']}>{expandedBody}</div>
      )}
    </div>
  );
}
