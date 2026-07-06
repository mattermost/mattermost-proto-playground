import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import { type KeyboardEvent, type MouseEvent, useCallback } from 'react';
import Icon from '@/components/Icon/Icon';
import IconButton from '@/components/IconButton/IconButton';
import Tag from '@/components/Tag/Tag';
import MentionBadge from '../MentionBadge/MentionBadge';
import UnreadBadge from '../UnreadBadge/UnreadBadge';
import UserAvatarGroup, {
  type UserAvatarGroupItem,
} from '../UserAvatarGroup/UserAvatarGroup';
import styles from './ThreadListItem.module.scss';

const DEFAULT_PARTICIPANTS: UserAvatarGroupItem[] = [
  { key: 'leonard', name: 'Leonard Riley' },
  { key: 'aiko', name: 'Aiko Tan' },
  { key: 'arjun', name: 'Arjun Patel' },
  { key: 'marco', name: 'Marco Rinaldi' },
  { key: 'sofia', name: 'Sofia Bauer' },
];

export interface ThreadListItemProps {
  /** Whether this item is the active/selected thread. */
  active?: boolean;
  /** Badge in the left gutter. Default: None. Hidden when `active` is true. */
  badge?: 'None' | 'Unread' | 'Mention';
  /** Shown when `badge` is Mention. Default: 1. */
  mentionCount?: number;
  /** Author name. */
  authorName?: string;
  /** Channel/team label. */
  channelLabel?: string;
  /** Message preview text. */
  previewText?: string;
  /** Timestamp label. */
  timestamp?: string;
  /** Number of replies. */
  replyCount?: number;
  /** Stacked avatars for recent participants. Pass `[]` to hide. When omitted, uses demo participants. */
  participants?: UserAvatarGroupItem[];
  /** Optional thread title. */
  threadTitle?: string;
  /** Optional CSS class name. */
  className?: string;
  /** Click handler. */
  onClick?: () => void;
  /** Thread overflow menu handler. */
  onMenuClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

/**
 * Thread entry in the Threads view. Shows author, team badge, preview text,
 * timestamp, participant avatars, reply count. Badge variants: None, Unread,
 * Mention. More actions (⋯) appear on row hover or focus.
 */
export default function ThreadListItem({
  active = false,
  badge = 'None',
  mentionCount = 1,
  authorName = 'Martin Kraft',
  channelLabel = 'ENTERPRISE TEAM',
  previewText = 'Do we have a guideline for what minimum width we should support in the system console? I know that…',
  timestamp = '5 mins ago',
  replyCount = 3,
  participants: participantsProp,
  threadTitle,
  className = '',
  onClick,
  onMenuClick,
}: ThreadListItemProps) {
  const participants =
    participantsProp === undefined ? DEFAULT_PARTICIPANTS : participantsProp;
  const showParticipants = participants.length > 0;
  const showGutterBadge =
    !active && (badge === 'Unread' || badge === 'Mention');
  const replyLabel = replyCount === 1 ? '1 reply' : `${replyCount} replies`;

  const rootClass = [
    styles['thread-list-item'],
    active ? styles['thread-list-item--active'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!onClick) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick();
      }
    },
    [onClick],
  );

  return (
    <div
      className={rootClass}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
    >
      <div className={styles['thread-list-item__thread']}>
        <div className={styles['thread-list-item__container']}>
          <div className={styles['thread-list-item__post-content']}>
            <div className={styles['thread-list-item__gutter']}>
              {showGutterBadge && badge === 'Unread' && (
                <UnreadBadge
                  className={styles['thread-list-item__unread-badge']}
                  context="Icon Button"
                />
              )}
              {showGutterBadge && badge === 'Mention' && (
                <span className={styles['thread-list-item__mention-gutter']}>
                  <MentionBadge
                    count={mentionCount}
                    location="Channel"
                    size="Medium"
                  />
                </span>
              )}
            </div>
            <div className={styles['thread-list-item__post-body']}>
              <div className={styles['thread-list-item__post-body-content']}>
                <div className={styles['thread-list-item__name-row']}>
                  <div className={styles['thread-list-item__name-group']}>
                    <span className={styles['thread-list-item__author']}>
                      {authorName}
                    </span>
                    <Tag
                      casing="All Caps"
                      label={channelLabel}
                    />
                  </div>
                  <span className={styles['thread-list-item__timestamp']}>
                    {timestamp}
                  </span>
                </div>
                {threadTitle != null && (
                  <div className={styles['thread-list-item__title-row']}>
                    <p className={styles['thread-list-item__title']}>
                      {threadTitle}
                    </p>
                  </div>
                )}
                <p className={styles['thread-list-item__preview']}>
                  {previewText}
                </p>
              </div>
            </div>
          </div>
          <div className={styles['thread-list-item__replies']}>
            <div className={styles['thread-list-item__replies-inner']}>
              {showParticipants && (
                <UserAvatarGroup
                  avatars={participants}
                  className={styles['thread-list-item__avatar-group']}
                  max={3}
                  size="20"
                />
              )}
              <span className={styles['thread-list-item__reply-count']}>
                {replyLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles['thread-list-item__actions']}>
        <span className={styles['thread-list-item__menu-button']}>
          <IconButton
            aria-label="Thread actions"
            icon={<Icon size="16" glyph={<DotsHorizontalIcon />} />}
            padding="Compact"
            size="Small"
            style="Default"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMenuClick?.(e);
            }}
          />
        </span>
      </div>
    </div>
  );
}
