import GlobeIcon from '@mattermost/compass-icons/components/globe';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import MessageTextOutlineIcon from '@mattermost/compass-icons/components/message-text-outline';
import SendOutlineIcon from '@mattermost/compass-icons/components/send-outline';
import ChartLineIcon from '@mattermost/compass-icons/components/chart-line';
import CircleMultipleOutlineIcon from '@mattermost/compass-icons/components/circle-multiple-outline';
import PhoneInTalkIcon from '@mattermost/compass-icons/components/phone-in-talk';
import DotsVerticalIcon from '@mattermost/compass-icons/components/dots-vertical';
import DialpadIcon from '@mattermost/compass-icons/components/dialpad';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import MentionBadge from '@/components/MentionBadge/MentionBadge';
import IconButton from '@/components/IconButton/IconButton';
import styles from './ChannelSidebarItem.module.scss';

export type ChannelSidebarItemLeadingVisual =
  | 'Public'
  | 'Private'
  | 'Group Message'
  | 'Direct Message'
  | 'Drafts'
  | 'Insights'
  | 'Threads'
  | 'Dial Pad';

export type ChannelSidebarItemStatus = 'Read' | 'Unread' | 'Mention';

export interface ChannelSidebarItemProps {
  className?: string;
  /** Channel or user display name. */
  name: string;
  /**
   * Text-only row (e.g. System Console navigation): no channel glyph or
   * overflow menu; name aligns with channel sidebar label padding.
   */
  hideLeadingVisual?: boolean;
  /** Leading visual type. Default: Public. Ignored when `hideLeadingVisual`. */
  leadingVisual?: ChannelSidebarItemLeadingVisual;
  /** Read/unread/mention state. Default: Read. */
  status?: ChannelSidebarItemStatus;
  /** Highlighted as the currently active item. */
  active?: boolean;
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
  leadingVisual: ChannelSidebarItemLeadingVisual;
  memberCount: number | undefined;
  avatarSrc: string | undefined;
  avatarAlt: string | undefined;
  showAvatarStatus: boolean | undefined;
}) {
  switch (leadingVisual) {
    case 'Private':
      return <LockOutlineIcon size={16} />;
    case 'Group Message':
      return (
        <div className={styles['channel-sidebar-item__group-icon']}>
          {memberCount ?? 2}
        </div>
      );
    case 'Direct Message':
      return (
        <UserAvatar
          src={avatarSrc ?? ''}
          alt={avatarAlt ?? ''}
          size="20"
          status={!!showAvatarStatus}
        />
      );
    case 'Drafts':
      return <SendOutlineIcon size={16} />;
    case 'Insights':
      return <ChartLineIcon size={16} />;
    case 'Threads':
      return <MessageTextOutlineIcon size={16} />;
    case 'Dial Pad':
      return <DialpadIcon size={16} />;
    case 'Public':
    default:
      return <GlobeIcon size={16} />;
  }
}

export default function ChannelSidebarItem({
  className,
  name,
  hideLeadingVisual = false,
  leadingVisual = 'Public',
  status = 'Read',
  active = false,
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
}: ChannelSidebarItemProps) {
  const isDM = !hideLeadingVisual && leadingVisual === 'Direct Message';
  const isDrafts = !hideLeadingVisual && leadingVisual === 'Drafts';
  const effectiveStatus = isDrafts && status === 'Unread' ? 'Read' : status;
  const hasMentionBadge = effectiveStatus === 'Mention';
  const isChannelOrDM =
    !hideLeadingVisual &&
    ['Public', 'Private', 'Group Message', 'Direct Message'].includes(
      leadingVisual,
    );

  const rootClass = [
    styles['channel-sidebar-item'],
    hideLeadingVisual ? styles['channel-sidebar-item--text-only'] : '',
    active ? styles['channel-sidebar-item--active'] : '',
    muted ? styles['channel-sidebar-item--muted'] : '',
    styles[`channel-sidebar-item--status-${effectiveStatus.toLowerCase()}`],
    isDrafts ? styles['channel-sidebar-item--drafts'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const iconContainerClass = [
    styles['channel-sidebar-item__icon-container'],
    isDM ? styles['channel-sidebar-item__icon-container--dm'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  const rightClass = styles['channel-sidebar-item__right'];

  return (
    <div
      role="button"
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
      {active && (
        <div className={styles['channel-sidebar-item__active-border']} />
      )}
      <div className={styles['channel-sidebar-item__left']}>
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
        <div className={styles['channel-sidebar-item__content']}>
          <span className={styles['channel-sidebar-item__name']}>{name}</span>
          {sharedChannel && (
            <span className={styles['channel-sidebar-item__shared-icon']}>
              <CircleMultipleOutlineIcon size={12} />
            </span>
          )}
          {isDM && customStatusEmoji && (
            <span className={styles['channel-sidebar-item__custom-status']}>
              {customStatusEmoji}
            </span>
          )}
        </div>
      </div>
      <div className={rightClass}>
        {callActive && (
          <div className={styles['channel-sidebar-item__call']}>
            <PhoneInTalkIcon size={12} />
          </div>
        )}
        {hasMentionBadge && (
          <span className={styles['channel-sidebar-item__mention-badge']}>
            <MentionBadge
              count={mentionCount ?? 1}
              location="Sidebar"
              size="Medium"
            />
          </span>
        )}
        {isChannelOrDM && (
          <span className={styles['channel-sidebar-item__menu-button']}>
            <IconButton
              size="X-Small"
              style="Inverted"
              icon={<DotsVerticalIcon size={12} />}
              aria-label="Channel options"
              onClick={(e) => e.stopPropagation()}
            />
          </span>
        )}
      </div>
    </div>
  );
}
