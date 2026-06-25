import type { HTMLAttributes } from 'react';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import Button from '@/components/Button/Button';
import Icon from '@/components/Icon/Icon';
import ReplyOutlineIcon from '@mattermost/compass-icons/components/reply-outline';
import styles from './ThreadFooter.module.scss';

export type ThreadFooterBadge = 'None' | 'Unread' | 'Mention';

export interface AvatarData {
  src: string;
  alt: string;
}

export interface ThreadFooterProps extends HTMLAttributes<HTMLDivElement> {
  /** Reply count. Default: 3. */
  replyCount?: number;
  /** Participant avatars (first 3 shown, overflow as +N). */
  avatars?: AvatarData[];
  /** Badge variant. Default: None. */
  badge?: ThreadFooterBadge;
  /** Whether the current user is following the thread. Default: false. */
  following?: boolean;
  /** Last reply timestamp label. Shown when following. */
  lastReplyTime?: string;
  /** Called when Reply is clicked. */
  onReply?: () => void;
  /** Called when Follow/Following is clicked. */
  onFollowToggle?: () => void;
  /** Hover / active state for button highlight. Default: false. */
  hovered?: boolean;
  /** Optional CSS class name. */
  className?: string;
}

/**
 * Reply summary bar at the bottom of messages.
 * Shows participant avatars, reply count, Follow/Following toggle,
 * and last reply time. Badge variants: None, Unread dot, Mention count.
 */
export default function ThreadFooter({
  replyCount = 3,
  avatars = [],
  badge = 'None',
  following = false,
  lastReplyTime,
  onReply,
  onFollowToggle,
  hovered = false,
  className = '',
  ...rest
}: ThreadFooterProps) {
  const rootClass = [styles['thread-footer'], className]
    .filter(Boolean)
    .join(' ');

  const MAX_VISIBLE = 3;
  const visibleAvatars = avatars.slice(0, MAX_VISIBLE);
  const overflowCount =
    avatars.length > MAX_VISIBLE ? avatars.length - MAX_VISIBLE : 0;

  return (
    <div className={rootClass} {...rest}>
      <div className={styles['thread-footer__inner']}>
        {/* Badge + Avatars */}
        <div className={styles['thread-footer__avatars-group']}>
          {badge === 'Unread' && (
            <span
              className={styles['thread-footer__unread-dot']}
              aria-label="Unread replies"
            />
          )}
          {badge === 'Mention' && (
            <span className={styles['thread-footer__mention-badge']}>@</span>
          )}

          {/* Avatar stack */}
          {visibleAvatars.length > 0 && (
            <div className={styles['thread-footer__avatars']}>
              {visibleAvatars.map((av, i) => (
                <UserAvatar
                  key={i}
                  src={av.src}
                  alt={av.alt}
                  size="20"
                  className={styles['thread-footer__avatar']}
                />
              ))}
              {overflowCount > 0 && (
                <span className={styles['thread-footer__avatar-overflow']}>
                  +{overflowCount}
                </span>
              )}
            </div>
          )}

          {/* Placeholder avatars when none provided */}
          {visibleAvatars.length === 0 && (
            <div className={styles['thread-footer__avatars']}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={styles['thread-footer__avatar-placeholder']}
                />
              ))}
              <span className={styles['thread-footer__avatar-overflow']}>
                +2
              </span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className={styles['thread-footer__buttons']}>
          {/* Reply button */}
          <Button
            emphasis="Quaternary"
            size="X-Small"
            className={[
              styles['thread-footer__reply-btn'],
              hovered ? styles['thread-footer__reply-btn--hovered'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={onReply}
            aria-label={`${replyCount} repl${replyCount === 1 ? 'y' : 'ies'}`}
            leadingIcon={<Icon size="12" glyph={<ReplyOutlineIcon />} />}
          >
            <span className={styles['thread-footer__btn-label']}>
              {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
            </span>
          </Button>

          <div className={styles['thread-footer__divider']} aria-hidden />

          {/* Follow / Following button */}
          <Button
            emphasis="Quaternary"
            size="X-Small"
            className={[
              styles['thread-footer__follow-btn'],
              following ? styles['thread-footer__follow-btn--following'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={onFollowToggle}
            aria-pressed={following}
            aria-label={following ? 'Unfollow thread' : 'Follow thread'}
          >
            {following ? 'Following' : 'Follow'}
          </Button>

          {/* Last reply time — visible when following */}
          {following && lastReplyTime && (
            <>
              <div className={styles['thread-footer__divider']} aria-hidden />
              <span className={styles['thread-footer__last-reply']}>
                {lastReplyTime}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
