import type { ReactNode } from 'react';
import Tooltip from '@/components/ui/Tooltip/Tooltip';
import styles from './HoverHint.module.scss';

export interface HoverHintProps {
  /** One short sentence. */
  label: string;
  /** Optional second line. */
  hint?: string;
  children: ReactNode;
}

/**
 * Hover/focus tooltip wrapper, local to this prototype.
 *
 * The wrapper is NOT focusable and carries no role — it wraps whatever it is
 * given rather than becoming a control. When it wraps a non-interactive element
 * (as it does on the "Inherited" badge) keyboard users get nothing from it, so
 * the same explanation is always ALSO present as visible copy in the composer
 * rail. The tooltip is reinforcement, never the only place the rule is stated.
 */
export default function HoverHint({ label, hint, children }: HoverHintProps) {
  return (
    <span className={styles['hover-hint']}>
      {children}
      <span className={styles['hover-hint__bubble']} aria-hidden>
        <Tooltip label={label} hint={hint} arrow="Bottom" />
      </span>
    </span>
  );
}
