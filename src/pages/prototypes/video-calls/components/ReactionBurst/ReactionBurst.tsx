import type { CSSProperties } from 'react';
import styles from './ReactionBurst.module.scss';

export interface ReactionBurstProps {
  /** Emoji to float up. Nothing renders when undefined. */
  emoji?: string;
  /** Change to replay the same emoji. */
  burstKey?: string | number;
  /** Particles per burst. Default 6. */
  count?: number;
  className?: string;
}

// Deterministic spread so a burst is stable across renders (no Math.random).
const DRIFT = [-36, 22, -12, 40, -26, 8, 30, -44];
const DELAY = [0, 1, 2, 1, 3, 2, 4, 3];

/**
 * Decorative floating-emoji burst for a stage or tile. Pointer-transparent and
 * `aria-hidden`; hidden under `prefers-reduced-motion` (announce the reaction
 * elsewhere, e.g. a notice). The host clears `emoji` when the reaction ends.
 */
export function ReactionBurst({
  emoji,
  burstKey,
  count = 6,
  className,
}: ReactionBurstProps) {
  if (!emoji) return null;
  const n = Math.max(1, Math.min(count, DRIFT.length));
  return (
    <div
      key={burstKey ?? emoji}
      className={[styles['reaction-burst'], className]
        .filter(Boolean)
        .join(' ')}
      aria-hidden
    >
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          className={styles['reaction-burst__particle']}
          style={
            {
              '--reaction-burst-drift': `${DRIFT[i]}px`,
              '--reaction-burst-delay': DELAY[i],
            } as CSSProperties
          }
        >
          {emoji}
        </span>
      ))}
    </div>
  );
}
