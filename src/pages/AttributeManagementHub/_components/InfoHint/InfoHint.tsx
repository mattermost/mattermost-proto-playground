import type { ReactNode } from 'react';
import Tooltip, { type TooltipArrow } from '@/components/ui/Tooltip/Tooltip';
import styles from './InfoHint.module.scss';

export interface InfoHintProps {
  /** One concise sentence, plain language, explaining the why. */
  label: string;
  /** Optional secondary explanation shown below the label. */
  hint?: string;
  /** The element the hint is attached to (icon, button, chip). */
  children: ReactNode;
  /** Arrow direction. Default: Bottom (hint sits above the trigger). */
  arrow?: TooltipArrow;
  className?: string;
}

/**
 * Hover/focus-reveal tooltip wrapper around the presentational Tooltip.
 * Keyboard-focusable; the hint text is bound via aria-label.
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
      role="button"
      tabIndex={0}
    >
      {children}
      <span className={styles['info-hint__bubble']} aria-hidden>
        <Tooltip label={label} hint={hint} arrow={arrow} />
      </span>
    </span>
  );
}
