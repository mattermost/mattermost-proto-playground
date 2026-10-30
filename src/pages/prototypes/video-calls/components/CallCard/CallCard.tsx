import PhoneInTalkIcon from '@mattermost/compass-icons/components/phone-in-talk';
import PhoneIcon from '@mattermost/compass-icons/components/phone';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import {
  UserAvatarGroup,
  type UserAvatarGroupItem,
} from '@mattermost/compass-ui/components/user-avatar-group';
import styles from './CallCard.module.scss';

export interface CallCardProps {
  /** Heading, e.g. "Call started". */
  title: string;
  /** Secondary line, e.g. "3 minutes ago by Leonard Riley". */
  meta?: string;
  /** People in the call; the first `max` show, the rest collapse to "+N". */
  participants?: UserAvatarGroupItem[];
  /** Avatars shown before the overflow count. Default 3. */
  max?: number;
  /** Join button label. */
  joinLabel?: string;
  /** Omit to hide the Join button (e.g. you are already in the call). */
  onJoin?: () => void;
  /** Accessible name for the card region. Default: the title. */
  ariaLabel?: string;
  className?: string;
}

/**
 * Call post card: green call icon, "Call started" with who and when, the
 * people in the call and a Join call button. Adapted from the Figma "Call
 * Card" (Active state). Presentational and prop-driven so it can move into
 * compass-proto unchanged.
 */
export default function CallCard({
  title,
  meta,
  participants = [],
  max = 3,
  joinLabel = 'Join call',
  onJoin,
  ariaLabel,
  className,
}: CallCardProps) {
  return (
    <section
      className={[styles['call-card'], className].filter(Boolean).join(' ')}
      aria-label={ariaLabel ?? title}
    >
      <div className={styles['call-card__left']}>
        <span className={styles['call-card__icon']} aria-hidden="true">
          <Icon glyph={<PhoneInTalkIcon />} size="20" />
        </span>
        <div className={styles['call-card__text']}>
          <p className={styles['call-card__title']}>{title}</p>
          {meta && <p className={styles['call-card__meta']}>{meta}</p>}
        </div>
      </div>
      <div className={styles['call-card__right']}>
        {participants.length > 0 && (
          <UserAvatarGroup avatars={participants} max={max} size="28" />
        )}
        {onJoin && (
          <Button
            className={styles['call-card__join']}
            emphasis="primary"
            size="medium"
            leadingIcon={<Icon size="16" glyph={<PhoneIcon />} />}
            onClick={onJoin}
          >
            {joinLabel}
          </Button>
        )}
      </div>
    </section>
  );
}
