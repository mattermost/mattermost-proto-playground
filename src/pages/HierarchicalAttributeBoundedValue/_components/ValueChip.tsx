import type { MouseEvent } from 'react';
import Chip from '@/components/ui/Chip/Chip';
import type { ChipSize } from '@/components/ui/Chip/Chip';
import { optionLabel, type ValueScheme } from '../boundsModel';
import styles from './ValueChip.module.scss';

export interface ValueChipProps {
  scheme: ValueScheme;
  /** Value id, or `null` for the "no value" register. */
  valueId: string | null;
  /** Copy used when `valueId` is null, e.g. "Set classification". */
  emptyLabel?: string;
  size?: ChipSize;
  /** Renders the chip as a button. */
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  /** Picker is open on this chip. */
  active?: boolean;
  /** Danger register — used by the rejected-write state. */
  error?: boolean;
  className?: string;
  'aria-label'?: string;
}

/**
 * One value of a bounded field, with the value-list colour as a leading dot.
 *
 * Deliberately carries NO provenance marker of its own — inherited vs explicit
 * is not a property of the value, and putting it on the chip would imply a flag
 * that does not exist. The surrounding surface states it in words instead.
 */
export default function ValueChip({
  scheme,
  valueId,
  emptyLabel = 'No value',
  size = 'Medium Compact',
  onClick,
  active = false,
  error = false,
  className = '',
  'aria-label': ariaLabel,
}: ValueChipProps) {
  const label = valueId ? optionLabel(scheme, valueId) : emptyLabel;
  const color = valueId
    ? scheme.options.find((o) => o.id === valueId)?.color
    : undefined;

  const rootClass = [
    styles['value-chip'],
    active ? styles['value-chip--active'] : '',
    !valueId ? styles['value-chip--empty'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Chip
      className={rootClass}
      as={onClick ? 'button' : 'div'}
      onClick={onClick}
      size={size}
      tone={error ? 'danger' : 'neutral'}
      error={error}
      aria-label={ariaLabel}
      leadingIcon={
        <span
          className={styles['value-chip__dot']}
          style={color ? { background: color } : undefined}
          aria-hidden
        />
      }
    >
      <span className={styles['value-chip__label']}>{label}</span>
    </Chip>
  );
}
