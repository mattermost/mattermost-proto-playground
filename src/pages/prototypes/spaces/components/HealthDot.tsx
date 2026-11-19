import { HEALTH_LABEL, type Health } from '../spacesData';
import styles from './HealthDot.module.scss';

/**
 * Small health indicator. Prototype-only: Compass has StatusBadge for
 * presence, but nothing for work health (on track / at risk / off track).
 * Never colour alone: the label is read by screen readers and shown in tooltips by hosts.
 */
export function HealthDot({ health }: { health: Health }) {
  return (
    <span
      className={`${styles['health-dot']} ${styles[`health-dot--${health}`]}`}
      role="img"
      aria-label={HEALTH_LABEL[health]}
    />
  );
}
