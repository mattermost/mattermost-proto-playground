import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import Icon from '@/components/ui/Icon/Icon';
import styles from './ClassificationPill.module.scss';

/**
 * Classification value pill, colored per the standard US/DoD banner scheme:
 *   TOP SECRET → orange · SECRET → red · CONFIDENTIAL → blue ·
 *   CUI → purple · UNCLASSIFIED → green.
 *
 * Used wherever a Classification value is displayed (Channel admin assign,
 * Channel/Post attribute tables, composer). Kept page-local rather than forking
 * the design-system `RankedValueChip` (whose color treatment is descoped for
 * v1.0). Color + the uppercase text label both carry the level — color is never
 * the sole signal (WCAG 1.4.1 / Section 508).
 */

/** Maps a Classification value id to its banner-color modifier. */
const LEVEL_BY_ID: Record<string, string> = {
  ts: 'ts',
  s: 's',
  c: 'c',
  cui: 'cui',
  u: 'u',
};

export interface ClassificationPillProps {
  /** Classification value id (ts | s | c | cui | u). */
  valueId: string;
  label: string;
  size?: 'Small' | 'Medium';
  /** Render a leading lock glyph (e.g. value is locked after assignment). */
  locked?: boolean;
}

export default function ClassificationPill({
  valueId,
  label,
  size = 'Small',
  locked = false,
}: ClassificationPillProps) {
  const level = LEVEL_BY_ID[valueId] ?? 'u';
  return (
    <span
      className={[
        styles.pill,
        styles[`pill--${level}`],
        size === 'Medium' ? styles['pill--medium'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {locked && (
        <span className={styles.pill__lock} aria-hidden>
          <Icon size="10" glyph={<LockOutlineIcon />} />
        </span>
      )}
      <span className={styles.pill__label}>{label}</span>
    </span>
  );
}
