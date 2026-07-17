import { toKebab } from '@/utils/string';
import styles from './MentionBadge.module.scss';

/** Figma Mention Badge location context — controls color scheme. */
export type MentionBadgeLocation =
  | 'Sidebar'
  | 'Menu Item'
  | 'Icon Button'
  | 'Channel';

/** Figma Mention Badge size. */
export type MentionBadgeSize = 'Small' | 'Medium' | 'Large';

export interface MentionBadgeProps {
  /** Optional CSS class name. */
  className?: string;
  /** Mention count. Displays as-is up to 99; shows "99+" above that. */
  count: number;
  /** Color context. Figma: Location. Default: Sidebar. */
  location?: MentionBadgeLocation;
  /** Size variant. Figma: Size. Default: Small. */
  size?: MentionBadgeSize;
}

/**
 * Mention badge — displays a numeric count in a pill.
 * Matches Figma Mention Badge v2.0.1.
 *
 * @see Figma Mention Badge (Node ID: 322:4608)
 */
export default function MentionBadge({
  className = '',
  count,
  location = 'Sidebar',
  size = 'Small',
}: MentionBadgeProps) {
  const displayText = count > 99 ? '99+' : String(count);
  const digitCount = displayText.length; // 1, 2, or 3 (for "99+")

  const rootClass = [
    styles['mention-badge'],
    styles[`mention-badge--size-${toKebab(size)}`],
    styles[`mention-badge--digits-${digitCount}`],
    location !== 'Sidebar'
      ? styles[`mention-badge--location-${toKebab(location)}`]
      : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      className={rootClass}
      aria-label={`${count} mention${count === 1 ? '' : 's'}`}
    >
      {displayText}
    </span>
  );
}
