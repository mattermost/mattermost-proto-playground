import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import MentionBadge from '@/components/ui/MentionBadge/MentionBadge';
import styles from './PBEChannelRow.module.scss';

export interface PBEChannelRowProps {
  /** Channel display name. */
  name: string;
  /** Highlighted as the currently active channel. */
  active?: boolean;
  /** Visually emphasises the row when there are unread messages. */
  unread?: boolean;
  /** When > 0, renders a MentionBadge with this count. */
  mentionCount?: number;
  /** Click handler. */
  onClick?: () => void;
}

/**
 * Sidebar row for a Program-Protected channel. The dest `ChannelSidebarItem`
 * `leadingVisual` enum has no `Shield` variant, so PBE channel rows render via
 * this page-local component. See gap G1 in the port plan.
 */
export default function PBEChannelRow({
  name,
  active = false,
  unread = false,
  mentionCount,
  onClick,
}: PBEChannelRowProps) {
  const rootClass = [
    styles['pbe-channel-row'],
    active ? styles['pbe-channel-row--active'] : '',
    unread ? styles['pbe-channel-row--unread'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={rootClass}
      aria-current={active ? 'true' : undefined}
      onClick={onClick}
    >
      <span className={styles['pbe-channel-row__icon']} aria-hidden>
        <ShieldOutlineIcon size={16} />
      </span>
      <span className={styles['pbe-channel-row__name']}>{name}</span>
      {mentionCount != null && mentionCount > 0 && (
        <MentionBadge count={mentionCount} />
      )}
    </button>
  );
}
