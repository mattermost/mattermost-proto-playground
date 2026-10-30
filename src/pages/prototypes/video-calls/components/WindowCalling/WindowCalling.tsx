import type { ReactNode } from 'react';
import { Button } from '@mattermost/compass-ui/components/button';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import { VideoCallWindowFrame } from '../VideoCallWindow';
import styles from './WindowCalling.module.scss';

export interface WindowCallingLabels {
  /** Status line, e.g. "Calling Marco Rinaldi…". */
  calling?: (name: string) => string;
  /** Helper under the status line. */
  hint?: string;
  cancel?: string;
  title?: string;
  collapse?: string;
  closeWindow?: string;
}

export interface WindowCallingProps {
  /** Person being called. */
  peerName: string;
  peerAvatarSrc?: string;
  /** Mic / camera controls (e.g. `WindowDeviceControls`). */
  controls?: ReactNode;
  /** Collapse to the widget; the call keeps ringing. */
  onCollapse: () => void;
  /** Hang up before anyone answers. */
  onCancel: () => void;
  variant?: 'windowed' | 'fullscreen';
  labels?: WindowCallingLabels;
  className?: string;
}

const DEFAULT_LABELS: Required<WindowCallingLabels> = {
  calling: (name) => `Calling ${name}…`,
  hint: 'Waiting for them to answer.',
  cancel: 'Cancel',
  title: 'Mattermost Call',
  collapse: 'Collapse call',
  closeWindow: 'Close call window',
};

/**
 * Large "calling" state for the dark call window: big avatar with a pulsing
 * ring, status line, mic / camera slot and a destructive Cancel. Presentational;
 * the host owns the call lifecycle.
 */
export function WindowCalling({
  peerName,
  peerAvatarSrc,
  controls,
  onCollapse,
  onCancel,
  variant,
  labels,
  className,
}: WindowCallingProps) {
  const l = { ...DEFAULT_LABELS, ...labels };
  return (
    <VideoCallWindowFrame
      variant={variant}
      onCollapse={onCollapse}
      className={className}
      labels={{
        title: l.title,
        collapse: l.collapse,
        closeWindow: l.closeWindow,
      }}
    >
      <div className={styles['window-calling']}>
        <div className={styles['window-calling__avatar']}>
          <span className={styles['window-calling__ring']} aria-hidden="true" />
          <span
            className={`${styles['window-calling__ring']} ${styles['window-calling__ring--delayed']}`}
            aria-hidden="true"
          />
          <UserAvatar src={peerAvatarSrc} alt="" name={peerName} size="120" />
        </div>
        <div className={styles['window-calling__text']} role="status">
          <h2 className={styles['window-calling__title']}>
            {l.calling(peerName)}
          </h2>
          <p className={styles['window-calling__hint']}>{l.hint}</p>
        </div>
        {controls}
        <Button emphasis="primary" destructive onClick={onCancel}>
          {l.cancel}
        </Button>
      </div>
    </VideoCallWindowFrame>
  );
}
