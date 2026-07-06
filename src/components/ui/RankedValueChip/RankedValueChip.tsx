import type { MouseEvent } from 'react';
import Chip from '@/components/ui/Chip/Chip';
import type { ChipSize } from '@/components/ui/Chip/Chip';
import LabelTag from '@/components/ui/LabelTag/LabelTag';
import styles from './RankedValueChip.module.scss';

export interface RankedValueChipProps {
  /** Value label, e.g. "Top Secret". */
  label: string;
  /**
   * Integer rank. When provided, renders as an inline LabelTag to the LEFT
   * of the label (visual exploration N1 from the 2026-05-22 sync — moves the
   * rank badge to the leading edge of the chip).
   */
  rank?: number;
  /** Chip size. Default: Small (matches the System Console table density). */
  size?: ChipSize;
  /**
   * When provided, the chip renders the trailing close (×) and calls this
   * on click. Omit for read-only contexts (UAS-sourced schemas) and for
   * values where deletion is hard-blocked by policy references — the
   * caller is responsible for that gating.
   */
  onRemove?: (e: MouseEvent<HTMLButtonElement>) => void;
  /** Accessible label for the remove button. Default: `Remove ${label}`. */
  removeLabel?: string;
  /**
   * When provided, the chip itself becomes a button and calls this on click.
   * The remove button always takes precedence inside the chip.
   */
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  /** Active = popover is currently open on this chip (D1 affordance). */
  active?: boolean;
  className?: string;
}

/**
 * Canonical chip used to render a single value of a Ranked attribute.
 *
 * 2026-05-22 PM+Eng sync updates:
 *  - **Color picker descoped for v1.0** — the chip renders a single neutral
 *    tone regardless of any `color` field on the underlying data. The
 *    `color` prop has been removed. Forward-compat for v1.1 lives at the
 *    data layer (`RankedValue.color` is retained, just ignored by the UI).
 *  - **Rank badge moves to the LEFT** of the label — `[LabelTag rank] [label] [×]`.
 *    Tighter visual footprint in dense tables; matches Krauser's "before the
 *    word" suggestion from the sync notes (00:06:47).
 */
export default function RankedValueChip({
  label,
  rank,
  size = 'Small',
  onRemove,
  removeLabel,
  onClick,
  active = false,
  className = '',
}: RankedValueChipProps) {
  const activeClass = active ? styles['ranked-value-chip--active'] : '';

  const rootClass = [styles['ranked-value-chip'], activeClass, className]
    .filter(Boolean)
    .join(' ');

  return (
    <Chip
      as={onClick ? 'button' : 'div'}
      onClick={onClick}
      size={size}
      tone="neutral"
      onRemove={onRemove}
      removeLabel={removeLabel ?? `Remove ${label}`}
      className={rootClass}
      aria-expanded={onClick ? active : undefined}
    >
      {rank != null && (
        <LabelTag
          label={String(rank)}
          type="Default"
          size="X-Small"
          className={styles['ranked-value-chip__rank']}
        />
      )}
      <span className={styles['ranked-value-chip__label']}>{label}</span>
    </Chip>
  );
}
