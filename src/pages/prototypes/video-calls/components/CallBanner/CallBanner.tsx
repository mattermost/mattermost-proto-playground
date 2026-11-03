import type { ReactNode } from 'react';
import CloseIcon from '@mattermost/compass-icons/components/close';
import VideoOutlineIcon from '@mattermost/compass-icons/components/video-outline';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import styles from './CallBanner.module.scss';

export interface CallBannerProps {
  /** Main line, e.g. "3 people in a call". */
  message: ReactNode;
  /** Secondary text after the message, e.g. elapsed time "12:40". */
  meta?: ReactNode;
  joinLabel?: string;
  onJoin: () => void;
  /** Shows a close button; omit for a banner that can't be dismissed. */
  onDismiss?: () => void;
  dismissLabel?: string;
  /** Accessible name for the banner region. */
  ariaLabel?: string;
  className?: string;
}

/**
 * Ongoing-call banner: a green, dismissable pill at toast height with the call
 * status and a Join action. Floats; the host positions it (see GroupChat).
 */
export default function CallBanner({
  message,
  meta,
  joinLabel = 'Join',
  onJoin,
  onDismiss,
  dismissLabel = 'Dismiss',
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
        size="x-small"
        onClick={onJoin}
      >
        {joinLabel}
      </Button>
      {onDismiss && (
        <IconButton
          className={styles['call-banner__dismiss']}
          size="small"
          padding="compact"
          style="inverted"
          aria-label={dismissLabel}
          title={dismissLabel}
          icon={<Icon size="16" glyph={<CloseIcon />} />}
          onClick={onDismiss}
        />
      )}
    </section>
  );
}
