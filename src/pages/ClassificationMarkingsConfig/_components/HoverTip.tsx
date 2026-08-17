import type { ReactNode } from 'react';
import Tooltip from '@/components/ui/Tooltip/Tooltip';
import styles from './HoverTip.module.scss';

export interface HoverTipProps {
  /** One short sentence. The wrapped control keeps its own accessible name. */
  label: string;
  /** Optional second line. */
  hint?: string;
  /** Align the bubble to the wrapper's right edge (for end-of-row actions). */
  align?: 'center' | 'end';
  children: ReactNode;
}

/**
 * Hover/focus tooltip wrapper for an already-interactive control.
 *
 * The wrapper is NOT itself focusable and carries no role — it wraps a real
 * button, so adding role/tabIndex here would nest two interactive elements and
 * double the tab stop. The bubble reveals on `:focus-within`, so keyboard users
 * get it from the button's own focus.
 *
 * The bubble is `aria-hidden`, so anything load-bearing in `label`/`hint` must
 * also reach assistive tech through the wrapped control's own accessible name
 * or an `aria-describedby` target.
 */
export default function HoverTip({
  label,
  hint,
  align = 'center',
  children,
}: HoverTipProps) {
  return (
    <span
      className={[
        styles['hover-tip'],
        align === 'end' ? styles['hover-tip--end'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
      <span className={styles['hover-tip__bubble']} aria-hidden>
        <Tooltip label={label} hint={hint} arrow="Bottom" />
      </span>
    </span>
  );
}
