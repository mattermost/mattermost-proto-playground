import ArrowExpandIcon from '@mattermost/compass-icons/components/arrow-expand';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import type { ReactNode } from 'react';
import { WidgetFrame } from '../WidgetFrame';
import {
  WidgetMediaControls,
  type WidgetMediaControlsLabels,
} from '../WidgetMediaControls';
import styles from './WidgetCalling.module.scss';

export interface WidgetCallingLabels extends WidgetMediaControlsLabels {
  region?: string;
  /** Small heading in the card header. */
  heading?: string;
  /** "Calling Name…". */
  calling?: (name: string) => string;
  expand?: string;
  cancel?: string;
}

export interface WidgetCallingProps {
  peerName: string;
  peerAvatarSrc?: string;
  micOn: boolean;
  onToggleMic: () => void;
  onOpenMicMenu: () => void;
  micMenuOpen?: boolean;
  cameraOn: boolean;
  onToggleCamera: () => void;
  onOpenCameraMenu: () => void;
  cameraMenuOpen?: boolean;
  /** Host-rendered device menus, anchored above the card. */
  micMenu?: ReactNode;
  cameraMenu?: ReactNode;
  onExpand: () => void;
  onCancel: () => void;
  labels?: WidgetCallingLabels;
  className?: string;
}

const DEFAULT_LABELS: Required<WidgetCallingLabels> = {
  region: 'Outgoing call',
  heading: 'Video call',
  calling: (name) => `Calling ${name}…`,
  expand: 'Expand call window',
  cancel: 'Cancel',
  mute: 'Mute microphone',
  unmute: 'Unmute microphone',
  micOptions: 'Microphone options',
  cameraOn: 'Turn camera on',
  cameraOff: 'Turn camera off',
  cameraOptions: 'Camera options',
};

/**
 * Outgoing-call state of the widget: peer avatar with a soft pulsing ring,
 * "Calling name…", segmented mic / camera and a destructive Cancel.
 * Presentational; the host owns media state, menus and the connect timer.
 */
export default function WidgetCalling({
  peerName,
  peerAvatarSrc,
  micOn,
  onToggleMic,
  onOpenMicMenu,
  micMenuOpen,
  cameraOn,
  onToggleCamera,
  onOpenCameraMenu,
  cameraMenuOpen,
  micMenu,
  cameraMenu,
  onExpand,
  onCancel,
  labels,
  className,
}: WidgetCallingProps) {
  const l = { ...DEFAULT_LABELS, ...labels };
  return (
    <WidgetFrame
      ariaLabel={l.region}
      className={className}
      popovers={
        <>
          {micMenu}
          {cameraMenu}
        </>
      }
    >
      <div className={styles['widget-calling__header']}>
        <span className={styles['widget-calling__heading']}>{l.heading}</span>
        <IconButton
          size="small"
          padding="compact"
          aria-label={l.expand}
          title={l.expand}
          icon={<Icon size="16" glyph={<ArrowExpandIcon />} />}
          onClick={onExpand}
        />
      </div>

      <div className={styles['widget-calling__peer']} aria-live="polite">
        <span className={styles['widget-calling__avatar']}>
          <UserAvatar src={peerAvatarSrc} alt="" name={peerName} size="48" />
        </span>
        <p className={styles['widget-calling__status']}>
          {l.calling(peerName)}
        </p>
      </div>

      <div className={styles['widget-calling__footer']}>
        <WidgetMediaControls
          micOn={micOn}
          onToggleMic={onToggleMic}
          onOpenMicMenu={onOpenMicMenu}
          micMenuOpen={micMenuOpen}
          cameraOn={cameraOn}
          onToggleCamera={onToggleCamera}
          onOpenCameraMenu={onOpenCameraMenu}
          cameraMenuOpen={cameraMenuOpen}
          labels={labels}
        />
        <Button emphasis="primary" destructive size="small" onClick={onCancel}>
          {l.cancel}
        </Button>
      </div>
    </WidgetFrame>
  );
}
