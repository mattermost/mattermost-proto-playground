import type { ReactNode } from 'react';
import styles from './CallingPulse.module.scss';

export interface CallingPulseProps {
  /** What the pulse radiates from, usually the peer's avatar. */
  children: ReactNode;
  className?: string;
}

/**
 * The "calling" pulse: two filled circles that grow behind `children` and fade
 * out, staggered by half a cycle. Shared by the call widget and the popout.
 * Tune it with CSS custom properties on this element or an ancestor:
 * `--calling-pulse-color` (default green-600 at 32%) and
 * `--calling-pulse-scale` (default 1.5, how far the circles grow). Purely
 * decorative; reduced motion shows one static halo.
 */
export default function CallingPulse({
  children,
  className,
}: CallingPulseProps) {
  return (
    <span
      className={[styles['calling-pulse'], className].filter(Boolean).join(' ')}
    >
      {children}
    </span>
  );
}
