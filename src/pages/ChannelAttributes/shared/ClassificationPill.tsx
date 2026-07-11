import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import Icon from '@/components/ui/Icon/Icon';
import {
  CLASSIFICATION_ABBREV,
  CLASSIFICATION_STYLES,
  type ClassificationLevel,
} from './channelAttrData';
import styles from './shared.module.scss';

/** Marking-style rendering for the pill text. */
export type MarkingStyle = 'abbrev' | 'full';

export interface ClassificationPillProps {
  level: ClassificationLevel;
  /** Show a lock affordance next to the pill (locked/governed attribute — FR-10, Gap-03). */
  locked?: boolean;
  size?: 'sm' | 'md';
  /**
   * Text rendering: `full` shows the level word (UNCLASSIFIED, SECRET, …);
   * `abbrev` shows the CAPCO portion-mark abbreviation (U, S, TS, …) and adds a
   * native tooltip carrying the full term. Color is identical in both modes.
   */
  variant?: MarkingStyle;
  /** Click handler — used to open the governed-change (reclassification) flow. */
  onClick?: () => void;
}

/**
 * Classification pill — text label + color background on EVERY render (WCAG 1.4.1,
 * never color alone). Text color is prescribed per level (black on TOP SECRET /
 * TS//SCI, white otherwise — WCAG 1.4.3 / C-2).
 *
 * The `variant` prop switches only the TEXT (full word vs CAPCO abbreviation) —
 * color is invariant so the marking never relies on color alone in either mode.
 */
export default function ClassificationPill({
  level,
  locked = false,
  size = 'sm',
  variant = 'full',
  onClick,
}: ClassificationPillProps) {
  const style = CLASSIFICATION_STYLES[level];
  const abbrev = variant === 'abbrev';
  const label = abbrev ? CLASSIFICATION_ABBREV[level] : level;
  const pill = (
    <span
      className={[styles['class-pill'], size === 'md' ? styles['class-pill--md'] : '']
        .filter(Boolean)
        .join(' ')}
      style={{ backgroundColor: style.bg, color: style.fg }}
      // Abbreviated marks are disambiguated by a native tooltip carrying the full
      // term; full marks need no tooltip (the label is already the full term).
      title={abbrev ? level : undefined}
    >
      {label}
    </span>
  );

  if (!locked) return pill;

  return (
    <button
      type="button"
      className={styles['class-pill-lock']}
      onClick={onClick}
      aria-label={`${level}, locked — change requires confirmation`}
    >
      {pill}
      <span className={styles['class-pill-lock__icon']} aria-hidden>
        <Icon size="16" glyph={<LockOutlineIcon />} />
      </span>
    </button>
  );
}
