import type { ReactNode } from 'react';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import {
  UserAvatarGroup,
  type UserAvatarGroupItem,
} from '@mattermost/compass-ui/components/user-avatar-group';
import VideoOutlineIcon from '@mattermost/compass-icons/components/video-outline';
import styles from './CallBanner.module.scss';

export interface CallBannerProps {
  /** Participants already in the call. */
  participants: UserAvatarGroupItem[];
  /** Main line, e.g. "3 people in a call". */
  message: ReactNode;
  /** Secondary text after the message, e.g. elapsed time "12:40". */
  meta?: ReactNode;
  joinLabel?: string;
  onJoin: () => void;
  /** Accessible name for the banner region. */
  ariaLabel?: string;
  className?: string;
}

/**
 * Ongoing-call banner: a green, toast-like pill with the people in the call and
 * a Join action. Floats; the host positions it (see GroupChat).
 */
export default function CallBanner({
  participants,
  message,
  meta,
  joinLabel = 'Join',
  onJoin,
  ariaLabel = 'Ongoing call',
  className,
}: CallBannerProps) {
  return (
    <section
      className={[styles['call-banner'], className ?? '']
        .filter(Boolean)
        .join(' ')}
      aria-label={ariaLabel}
    >
      <span className={styles['call-banner__icon']} aria-hidden="true">
        <Icon glyph={<VideoOutlineIcon />} size="20" />
      </span>
      <UserAvatarGroup avatars={participants} size="24" max={3} />
      <p className={styles['call-banner__text']}>
        <span className={styles['call-banner__message']}>{message}</span>
        {meta && (
          <>
            <span aria-hidden="true"> · </span>
            <span className={styles['call-banner__meta']}>{meta}</span>
          </>
        )}
      </p>
      <Button
        className={styles['call-banner__join']}
        emphasis="primary"
        appearance="inverted"
        size="small"
        onClick={onJoin}
      >
        {joinLabel}
      </Button>
    </section>
  );
}
