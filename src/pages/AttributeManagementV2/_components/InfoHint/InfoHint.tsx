import type { ReactNode } from 'react';
import Tooltip, { type TooltipArrow } from '@/components/ui/Tooltip/Tooltip';
import styles from './InfoHint.module.scss';

export interface InfoHintProps {
  /** One concise sentence, plain language, explaining the why. */
  label: string;
  /** Optional secondary explanation shown below the label in the tooltip. */
  hint?: string;
  /** The element the hint is attached to (icon, button, chip). */
  children: ReactNode;
  /** Arrow direction. Default: Bottom (hint sits above the trigger). */
  arrow?: TooltipArrow;
  className?: string;
}

/**
 * Hover/focus-reveal tooltip wrapper around the presentational Tooltip
 * component. Reusable across the surface so every disabled control and info
 * glyph has one consistent, accessible hint treatment.
 *
 * The wrapper is keyboard-focusable; the tooltip text is bound to the trigger
 * via aria-label so assistive tech reads the why, not just the symbol.
 */
export default function InfoHint({
  label,
  hint,
  children,
  arrow = 'Bottom',
  className = '',
}: InfoHintProps) {
  const aria = hint ? `${label}. ${hint}` : label;
  return (
    <span
      className={[styles['info-hint'], className].filter(Boolean).join(' ')}
      aria-label={aria}
    >
      {children}
      <span className={styles['info-hint__bubble']} aria-hidden>
        <Tooltip label={label} hint={hint} arrow={arrow} />
      </span>
    </span>
  );
}
