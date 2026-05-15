import type { ReactNode } from 'react';
import styles from './StatusPill.module.scss';

export type StatusPillTone = 'success' | 'warning' | 'neutral';

export interface StatusPillProps {
  /** Pill label. */
  label: ReactNode;
  /** Tone. Controls the dot color and the pill tint. Default: 'success'. */
  tone?: StatusPillTone;
}

/**
 * Pill with a leading colored dot (gap G11). Dest `LabelTag` doesn't expose
 * a leading-dot slot, so this is a small purpose-built component.
 */
export default function StatusPill({
  label,
  tone = 'success',
}: StatusPillProps) {
  const rootClass = [
    styles['status-pill'],
    styles[`status-pill--tone-${tone}`],
  ].join(' ');

  return (
    <span className={rootClass}>
      <span className={styles['status-pill__dot']} aria-hidden />
      <span className={styles['status-pill__label']}>{label}</span>
    </span>
  );
}
