/**
 * MembersIconWithDot — extracted from MembersIconIndicator.tsx so both
 * the standalone members-icon-dot screen and the consolidated
 * PendingRequestIndicators showcase share a single source of truth for
 * the channel-header members button anatomy with the 6px theme-aware
 * pending dot (Figma 4888:61576 Unread Badge pattern).
 *
 * Anatomy (top-down) per Figma 4888:61576:
 *
 *   button.members-btn (padding 6px)
 *     span.content (flex row, gap 4px, position: relative)
 *       span.icon-wrap (12px square)
 *         Icon (account-outline, 12px)
 *       span.dot (absolute, top -2px / left 8px, 6px)  [if pending]
 *       span.count ("48")
 *
 * The dot color resolves through `--sidebar-text-active-border` so all
 * five themes (denim / sapphire / quartz / indigo / onyx) drive the same
 * surface treatment as the LHS row dot — single token, two surfaces.
 */
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import Icon from '@/components/ui/Icon/Icon';
import styles from './MembersIconWithDot.module.scss';

export interface MembersIconWithDotProps {
  memberCount: number;
  pendingCount: number;
}

export default function MembersIconWithDot({
  memberCount,
  pendingCount,
}: MembersIconWithDotProps) {
  const hasPending = pendingCount >= 1;
  const ariaLabel = hasPending
    ? `${memberCount} members (pending requests)`
    : `${memberCount} members`;

  return (
    <button
      type="button"
      className={styles['members-icon-with-dot']}
      aria-label={ariaLabel}
    >
      <span className={styles['members-icon-with-dot__content']}>
        <span className={styles['members-icon-with-dot__icon-wrap']}>
          <Icon size="12" glyph={<AccountOutlineIcon />} />
        </span>
        {hasPending && (
          <span
            className={styles['members-icon-with-dot__dot']}
            aria-hidden
            title="Pending join requests on this channel"
          />
        )}
        <span className={styles['members-icon-with-dot__count']}>
          {memberCount}
        </span>
      </span>
    </button>
  );
}
