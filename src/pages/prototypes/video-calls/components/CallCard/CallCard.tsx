import type { ReactNode } from 'react';
import FileVideoOutlineIcon from '@mattermost/compass-icons/components/file-video-outline';
import PhoneHangupIcon from '@mattermost/compass-icons/components/phone-hangup';
import PhoneInTalkIcon from '@mattermost/compass-icons/components/phone-in-talk';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import {
  UserAvatarGroup,
  type UserAvatarGroupItem,
} from '@mattermost/compass-ui/components/user-avatar-group';
import styles from './CallCard.module.scss';

/**
 * `calling`: you're ringing someone (1:1). `active`: call in progress, you're
 * not in it. `joined`: you're in it. `ended`: call over.
 */
export type CallCardState = 'calling' | 'active' | 'joined' | 'ended';

export interface CallCardProps {
  /** Which step of the call the card shows. Default `active`. */
  state?: CallCardState;
  /** Heading, e.g. "Call started" / "Call ended". */
  title: string;
  /** Secondary line, e.g. "3 minutes ago by Leonard Riley". */
  meta?: string;
  /** People in the call (active / joined); the first `max` show, the rest collapse to "+N". */
  participants?: UserAvatarGroupItem[];
  /** Avatars shown before the overflow count. Default 3. */
  max?: number;
  joinLabel?: string;
  /** Active: omit to hide Join call. */
  onJoin?: () => void;
  /** Calling: cancel the outgoing ring. Omit to hide the button. */
  onCancel?: () => void;
  cancelLabel?: string;
  leaveLabel?: string;
  /** Joined: omit to hide Leave. */
  onLeave?: () => void;
  /** Ended: e.g. "1 recording". Ignored when `trailing` is set. */
  recordingLabel?: string;
  /** Replaces the right-hand content (e.g. a "Call back" button on a missed call). */
  trailing?: ReactNode;
  /** Accessible name for the card region. Default: the title. */
  ariaLabel?: string;
  className?: string;
}

/**
 * Call post card with every state from the Figma "Call Card": Active (Join
 * call), Active + Joined (Leave) and Inactive / ended (duration and
 * recordings). Below ~480px it stacks (header, divider, then avatars + the
 * action), like the Figma Narrow variant. Presentational and prop-driven so it
 * can move into compass-proto unchanged.
 */
export default function CallCard({
  state = 'active',
  title,
  meta,
  participants = [],
  max = 3,
  joinLabel = 'Join call',
  onJoin,
  leaveLabel = 'Leave',
  onLeave,
  onCancel,
  cancelLabel = 'Cancel',
  recordingLabel,
  trailing,
  ariaLabel,
  className,
}: CallCardProps) {
  const ended = state === 'ended';
  const hasAvatars = !ended && participants.length > 0;

  let right: ReactNode = null;
  if (trailing) {
    right = trailing;
  } else if (ended) {
    right = recordingLabel ? (
      <span className={styles['call-card__recording']}>
        <Icon size="16" glyph={<FileVideoOutlineIcon />} />
        {recordingLabel}
      </span>
    ) : null;
  } else if (state === 'calling') {
    right = onCancel ? (
      <Button emphasis="primary" destructive size="medium" onClick={onCancel}>
        {cancelLabel}
      </Button>
    ) : null;
  } else if (state === 'joined') {
    right = onLeave ? (
      <Button
        emphasis="primary"
        destructive
        size="medium"
        leadingIcon={<Icon size="16" glyph={<PhoneHangupIcon />} />}
        onClick={onLeave}
      >
        {leaveLabel}
      </Button>
    ) : null;
  } else {
    right = onJoin ? (
      <Button
        className={styles['call-card__join']}
        emphasis="primary"
        size="medium"
        leadingIcon={<Icon size="16" glyph={<PhoneInTalkIcon />} />}
        onClick={onJoin}
      >
        {joinLabel}
      </Button>
    ) : null;
  }

  return (
    <div
      className={[styles['call-card-frame'], className]
        .filter(Boolean)
        .join(' ')}
    >
      <section
        className={[
          styles['call-card'],
          ended && styles['call-card--ended'],
          state === 'calling' && styles['call-card--calling'],
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label={ariaLabel ?? title}
      >
        <div className={styles['call-card__left']}>
          <span className={styles['call-card__icon']} aria-hidden="true">
            <Icon
              glyph={ended ? <PhoneHangupIcon /> : <PhoneInTalkIcon />}
              size="20"
            />
          </span>
          <div className={styles['call-card__text']}>
            <p className={styles['call-card__title']}>{title}</p>
            {meta && <p className={styles['call-card__meta']}>{meta}</p>}
          </div>
        </div>
        {(hasAvatars || right) && (
          <div className={styles['call-card__right']}>
            {hasAvatars && (
              <UserAvatarGroup avatars={participants} max={max} size="28" />
            )}
            {right}
          </div>
        )}
      </section>
    </div>
  );
}
