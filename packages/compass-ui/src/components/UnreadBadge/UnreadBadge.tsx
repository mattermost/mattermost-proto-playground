import { toKebab } from '@/utils/string';
import styles from './UnreadBadge.module.scss';

export type UnreadBadgeSize = '6' | '8';

export type UnreadBadgeContext = 'Team Icon' | 'Icon Button';

export interface UnreadBadgeProps {
  /** Dot size in px. Default: 8. */
  size?: UnreadBadgeSize;
  /** Display context affects dot colour. Default: Team Icon (same fill as MentionBadge). */
  context?: UnreadBadgeContext;
  /** Optional CSS class name. */
  className?: string;
  /** Accessible label. Default: "Unread". */
  'aria-label'?: string;
}

/**
 * Small unread dot indicator (no number).
 * Signals "something unread" without a count.
 * Two sizes (6/8 px) and two contexts (Team Icon / Icon Button).
 *
 * @see Figma Unread Badge (v2.0.0, Source: F3fippSczUZwF6C5yXoNFf)
 */
export default function UnreadBadge({
  'aria-label': ariaLabel = 'Unread',
  className = '',
  context = 'Team Icon',
  size = '8',
}: UnreadBadgeProps) {
  const sizeClass = styles[`unread-badge--size-${size}`];
  const contextClass = styles[`unread-badge--context-${toKebab(context)}`];
  const rootClass = [styles['unread-badge'], sizeClass, contextClass, className]
    .filter(Boolean)
    .join(' ');

  return <span className={rootClass} role="status" aria-label={ariaLabel} />;
}
