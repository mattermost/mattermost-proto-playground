import GlobeIcon from '@mattermost/compass-icons/components/globe';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import MessageTextOutlineIcon from '@mattermost/compass-icons/components/message-text-outline';
import SendOutlineIcon from '@mattermost/compass-icons/components/send-outline';
import ChartLineIcon from '@mattermost/compass-icons/components/chart-line';
import CircleMultipleOutlineIcon from '@mattermost/compass-icons/components/circle-multiple-outline';
import PhoneInTalkIcon from '@mattermost/compass-icons/components/phone-in-talk';
import DialpadIcon from '@mattermost/compass-icons/components/dialpad';
import { UserAvatar } from '@mattermost/compass-ui';
import { MentionBadge } from '@mattermost/compass-ui';
import styles from './MobileChannelSidebarItem.module.scss';

export type MobileChannelSidebarItemLeadingVisual =
  | 'Public'
  | 'Private'
  | 'Group Message'
  | 'Direct Message'
  | 'Drafts'
  | 'Insights'
  | 'Threads'
  | 'Dial Pad';

export type MobileChannelSidebarItemStatus = 'Read' | 'Unread' | 'Mention';

export interface MobileChannelSidebarItemProps {
  className?: string;
  /** Channel or user display name. */
  name: string;
  /**
   * Text-only row: no channel glyph; name aligns with label padding.
   */
  hideLeadingVisual?: boolean;
  /** Leading visual type. Default: Public. Ignored when `hideLeadingVisual`. */
  leadingVisual?: MobileChannelSidebarItemLeadingVisual;
  /** Read/unread/mention state. Default: Read. */
  status?: MobileChannelSidebarItemStatus;
  /** Muted channel — reduces visual prominence. */
  muted?: boolean;
  /** Shows a call-in-progress indicator on the right. */
  callActive?: boolean;
  /** Shows the shared-channel icon after the name. */
  sharedChannel?: boolean;
  /** Mention count shown in the badge when status='Mention'. */
  mentionCount?: number;
  /** Member count shown in the group icon when leadingVisual='Group Message'. */
  memberCount?: number;
  /** Avatar image URL for leadingVisual='Direct Message'. */
  avatarSrc?: string;
  /** Avatar alt text for leadingVisual='Direct Message'. */
  avatarAlt?: string;
  /** Shows status badge on the avatar when leadingVisual='Direct Message'. */
  showAvatarStatus?: boolean;
  /** Custom status emoji shown after the name for leadingVisual='Direct Message'. */
  customStatusEmoji?: string;
  onClick?: () => void;
}

function LeadingVisualContent({
  leadingVisual,
  memberCount,
  avatarSrc,
  avatarAlt,
  showAvatarStatus,
}: {
  leadingVisual: MobileChannelSidebarItemLeadingVisual;
  memberCount: number | undefined;
  avatarSrc: string | undefined;
  avatarAlt: string | undefined;
  showAvatarStatus: boolean | undefined;
}) {
  switch (leadingVisual) {
    case 'Private':
      return <LockOutlineIcon size={20} />;
    case 'Group Message':
      return (
        <div className={styles['mobile-channel-sidebar-item__group-icon']}>
          {memberCount ?? 2}
        </div>
      );
    case 'Direct Message':
      return (
        <UserAvatar
          src={avatarSrc ?? ''}
          alt={avatarAlt ?? ''}
          size='24'
          status={!!showAvatarStatus}
        />
      );
    case 'Drafts':
      return <SendOutlineIcon size={20} />;
    case 'Insights':
      return <ChartLineIcon size={20} />;
    case 'Threads':
      return <MessageTextOutlineIcon size={20} />;
    case 'Dial Pad':
      return <DialpadIcon size={20} />;
    case 'Public':
    default:
      return <GlobeIcon size={20} />;
  }
}

/**
 * Touch-sized sibling of desktop Channel Sidebar Item.
 */
export default function MobileChannelSidebarItem({
  className,
  name,
  hideLeadingVisual = false,
  leadingVisual = 'Public',
  status = 'Read',
  muted = false,
  callActive = false,
  sharedChannel = false,
  mentionCount,
  memberCount,
  avatarSrc,
  avatarAlt,
  showAvatarStatus = false,
  customStatusEmoji,
  onClick,
}: MobileChannelSidebarItemProps) {
  const isDM = !hideLeadingVisual && leadingVisual === 'Direct Message';
  const isDrafts = !hideLeadingVisual && leadingVisual === 'Drafts';
  const effectiveStatus = isDrafts && status === 'Unread' ? 'Read' : status;
  const hasMentionBadge = effectiveStatus === 'Mention';

  const rootClass = [
    styles['mobile-channel-sidebar-item'],
    hideLeadingVisual
      ? styles['mobile-channel-sidebar-item--text-only']
      : '',
    muted ? styles['mobile-channel-sidebar-item--muted'] : '',
    styles[
      `mobile-channel-sidebar-item--status-${effectiveStatus.toLowerCase()}`
    ],
    isDrafts ? styles['mobile-channel-sidebar-item--drafts'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const iconContainerClass = [
    styles['mobile-channel-sidebar-item__icon-container'],
    isDM ? styles['mobile-channel-sidebar-item__icon-container--dm'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      role='button'
      tabIndex={0}
      className={rootClass}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className={styles['mobile-channel-sidebar-item__left']}>
        {!hideLeadingVisual && (
          <div className={iconContainerClass}>
            <LeadingVisualContent
              leadingVisual={leadingVisual}
              memberCount={memberCount}
              avatarSrc={avatarSrc}
              avatarAlt={avatarAlt}
              showAvatarStatus={showAvatarStatus}
            />
          </div>
        )}
        <div className={styles['mobile-channel-sidebar-item__content']}>
          <span className={styles['mobile-channel-sidebar-item__name']}>
            {name}
          </span>
          {sharedChannel && (
            <span className={styles['mobile-channel-sidebar-item__shared-icon']}>
              <CircleMultipleOutlineIcon size={16} />
            </span>
          )}
          {isDM && customStatusEmoji && (
            <span
              className={styles['mobile-channel-sidebar-item__custom-status']}
            >
              {customStatusEmoji}
            </span>
          )}
        </div>
      </div>
      <div className={styles['mobile-channel-sidebar-item__right']}>
        {callActive && (
          <div className={styles['mobile-channel-sidebar-item__call']}>
            <PhoneInTalkIcon size={16} />
          </div>
        )}
        {hasMentionBadge && (
          <span
            className={styles['mobile-channel-sidebar-item__mention-badge']}
          >
            <MentionBadge
              count={mentionCount ?? 1}
              location='Sidebar'
              size='Medium'
            />
          </span>
        )}
      </div>
    </div>
  );
}
