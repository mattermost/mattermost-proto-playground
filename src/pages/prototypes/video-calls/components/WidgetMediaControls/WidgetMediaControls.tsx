import MicrophoneIcon from '@mattermost/compass-icons/components/microphone';
import MicrophoneOffIcon from '@mattermost/compass-icons/components/microphone-off';
import VideoOffOutlineIcon from '@mattermost/compass-icons/components/video-off-outline';
import VideoOutlineIcon from '@mattermost/compass-icons/components/video-outline';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { SegmentedIconButton } from '../SegmentedIconButton';
import styles from './WidgetMediaControls.module.scss';

export interface WidgetMediaControlsLabels {
  mute?: string;
  unmute?: string;
  micOptions?: string;
  cameraOn?: string;
  cameraOff?: string;
  cameraOptions?: string;
}

export interface WidgetMediaControlsProps {
  micOn: boolean;
  onToggleMic: () => void;
  /** Device-menu chevron next to the mic; omit for a plain toggle (the host puts the picker elsewhere). */
  onOpenMicMenu?: () => void;
  micMenuOpen?: boolean;
  cameraOn: boolean;
  onToggleCamera: () => void;
  /** Device-menu chevron next to the camera; omit for a plain toggle. */
  onOpenCameraMenu?: () => void;
  cameraMenuOpen?: boolean;
  labels?: WidgetMediaControlsLabels;
  className?: string;
}

const DEFAULT_LABELS: Required<WidgetMediaControlsLabels> = {
  mute: 'Mute microphone',
  unmute: 'Unmute microphone',
  micOptions: 'Microphone options',
  cameraOn: 'Turn camera on',
  cameraOff: 'Turn camera off',
  cameraOptions: 'Camera options',
};

const cx = (...names: (string | false | undefined)[]) =>
  names.filter(Boolean).join(' ');

/**
 * Microphone and camera as two segmented buttons (toggle + device-menu
 * chevron), sized for the call widget. Presentational: the host owns media
 * state and the device menus.
 */
export default function WidgetMediaControls({
  micOn,
  onToggleMic,
  onOpenMicMenu,
  micMenuOpen = false,
  cameraOn,
  onToggleCamera,
  onOpenCameraMenu,
  cameraMenuOpen = false,
  labels,
  className,
}: WidgetMediaControlsProps) {
  const l = { ...DEFAULT_LABELS, ...labels };
  const micIcon = (
    <Icon
      size="16"
      glyph={micOn ? <MicrophoneIcon /> : <MicrophoneOffIcon />}
    />
  );
  const cameraIcon = (
    <Icon
      size="16"
      glyph={cameraOn ? <VideoOutlineIcon /> : <VideoOffOutlineIcon />}
    />
  );
  return (
    <div className={cx(styles['widget-media-controls'], className)}>
      {onOpenMicMenu ? (
        <SegmentedIconButton
          size="small"
          style="default"
          menuOpen={micMenuOpen}
          label={micOn ? l.mute : l.unmute}
          chevronLabel={l.micOptions}
          mainClassName={cx(
            styles['widget-media-controls__toggle'],
            !micOn && styles['widget-media-controls__toggle--off'],
          )}
          icon={micIcon}
          onClick={onToggleMic}
          onChevronClick={onOpenMicMenu}
        />
      ) : (
        <IconButton
          size="small"
          padding="compact"
          className={cx(
            styles['widget-media-controls__toggle'],
            !micOn && styles['widget-media-controls__toggle--off'],
          )}
          aria-label={micOn ? l.mute : l.unmute}
          title={micOn ? l.mute : l.unmute}
          icon={micIcon}
          onClick={onToggleMic}
        />
      )}
      {onOpenCameraMenu ? (
        <SegmentedIconButton
          size="small"
          style="default"
          menuOpen={cameraMenuOpen}
          label={cameraOn ? l.cameraOff : l.cameraOn}
          chevronLabel={l.cameraOptions}
          mainClassName={cx(
            styles['widget-media-controls__toggle'],
            !cameraOn && styles['widget-media-controls__toggle--off'],
          )}
          icon={cameraIcon}
          onClick={onToggleCamera}
          onChevronClick={onOpenCameraMenu}
        />
      ) : (
        <IconButton
          size="small"
          padding="compact"
          className={cx(
            styles['widget-media-controls__toggle'],
            !cameraOn && styles['widget-media-controls__toggle--off'],
          )}
          aria-label={cameraOn ? l.cameraOff : l.cameraOn}
          title={cameraOn ? l.cameraOff : l.cameraOn}
          icon={cameraIcon}
          onClick={onToggleCamera}
        />
      )}
    </div>
  );
}
