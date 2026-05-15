import type { ReactNode } from 'react';
import styles from './ChannelTypeCard.module.scss';

export interface ChannelTypeCardProps {
  /** Card icon (compass icon element). */
  icon: ReactNode;
  /** Card title (e.g. "Public", "Private", "Encrypted"). */
  label: string;
  /** Short description shown beneath the label. */
  description: string;
  /** Selection state — drives the highlighted border + tinted fill. */
  selected?: boolean;
  /** Called when the card is clicked. */
  onClick?: () => void;
  /** Optional aria-label override. Defaults to label. */
  ariaLabel?: string;
}

/**
 * Channel type selectable card (gap G7) — used in the Create Channel
 * Step 1 modal to pick Public / Private / Encrypted. Three cards lay out
 * side-by-side in a flex row.
 *
 * Visual reference: source `pbe__type-option` block. Figma node `4297:18394`
 * (Step 1 modal) was inaccessible in this run; styling follows the source
 * SCSS retranslated to semantic tokens.
 */
export default function ChannelTypeCard({
  icon,
  label,
  description,
  selected = false,
  onClick,
  ariaLabel,
}: ChannelTypeCardProps) {
  const rootClass = [
    styles['channel-type-card'],
    selected ? styles['channel-type-card--selected'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={rootClass}
      onClick={onClick}
      aria-pressed={selected}
      aria-label={ariaLabel ?? label}
    >
      <span className={styles['channel-type-card__icon']} aria-hidden>
        {icon}
      </span>
      <span className={styles['channel-type-card__label']}>{label}</span>
      <span className={styles['channel-type-card__description']}>
        {description}
      </span>
    </button>
  );
}
