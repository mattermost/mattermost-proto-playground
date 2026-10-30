import type { ReactNode } from 'react';
import MicrophoneIcon from '@mattermost/compass-icons/components/microphone';
import MicrophoneOffIcon from '@mattermost/compass-icons/components/microphone-off';
import VideoOffOutlineIcon from '@mattermost/compass-icons/components/video-off-outline';
import VideoOutlineIcon from '@mattermost/compass-icons/components/video-outline';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { DeviceMenu, type DeviceMenuDevice } from '../DeviceMenu';
import { SegmentedIconButton } from '../SegmentedIconButton';
import styles from './WindowDeviceControls.module.scss';

export type WindowDeviceMenuId = 'mic' | 'camera';

export interface WindowDeviceControlsLabels {
  muteMic?: string;
  unmuteMic?: string;
  micOptions?: string;
  micMenuTitle?: string;
  cameraOn?: string;
  cameraOff?: string;
  cameraOptions?: string;
  cameraMenuTitle?: string;
}

export interface WindowDeviceControlsProps {
  micOn: boolean;
  onToggleMic: () => void;
  mics: DeviceMenuDevice[];
  micDeviceId?: string;
  onSelectMic: (id: string) => void;

  cameraOn: boolean;
  /** The opt-in gesture: turning the camera on asks for the webcam. */
  onToggleCamera: () => void;
  cameras: DeviceMenuDevice[];
  cameraDeviceId?: string;
  onSelectCamera: (id: string) => void;

  /** Host-owned: which device menu is open. */
  openMenu: WindowDeviceMenuId | null;
  onOpenMenuChange: (menu: WindowDeviceMenuId | null) => void;

  /** Menus open upward (default, as in the controls bar) or downward. */
  menuPlacement?: 'top' | 'bottom';
  labels?: WindowDeviceControlsLabels;
  className?: string;
}

const DEFAULT_LABELS: Required<WindowDeviceControlsLabels> = {
  muteMic: 'Mute microphone',
  unmuteMic: 'Unmute microphone',
  micOptions: 'Microphone options',
  micMenuTitle: 'Microphone',
  cameraOn: 'Turn camera on',
  cameraOff: 'Turn camera off',
  cameraOptions: 'Camera options',
  cameraMenuTitle: 'Camera',
};

const cx = (...names: (string | false | undefined)[]) =>
  names.filter(Boolean).join(' ');

/**
 * Mic and camera as two inverted `SegmentedIconButton`s with `DeviceMenu`s, for
 * the dark call window's pre-join and calling states (the in-call bar has its own
 * copy of this chrome). Presentational: toggles and menu state are host-owned.
 */
export function WindowDeviceControls({
  micOn,
  onToggleMic,
  mics,
  micDeviceId,
  onSelectMic,
  cameraOn,
  onToggleCamera,
  cameras,
  cameraDeviceId,
  onSelectCamera,
  openMenu,
  onOpenMenuChange,
  menuPlacement = 'top',
  labels,
  className,
}: WindowDeviceControlsProps) {
  const l = { ...DEFAULT_LABELS, ...labels };
  const close = () => onOpenMenuChange(null);
  const toggleMenu = (id: WindowDeviceMenuId) =>
    onOpenMenuChange(openMenu === id ? null : id);

  const slot = (
    id: WindowDeviceMenuId,
    on: boolean,
    toggleLabel: string,
    optionsLabel: string,
    glyph: ReactNode,
    onToggle: () => void,
    menu: ReactNode,
  ) => (
    <div className={styles['window-device-controls__slot']}>
      <SegmentedIconButton
        size="medium"
        style="inverted"
        className={styles['window-device-controls__segment']}
        mainClassName={cx(
          styles['window-device-controls__toggle'],
          on
            ? styles['window-device-controls__toggle--on']
            : styles['window-device-controls__toggle--off'],
        )}
        menuOpen={openMenu === id}
        label={toggleLabel}
        chevronLabel={optionsLabel}
        icon={<Icon size="20" glyph={glyph} />}
        onClick={onToggle}
        onChevronClick={() => toggleMenu(id)}
      />
      <div
        className={cx(
          styles['window-device-controls__popover'],
          menuPlacement === 'bottom' &&
            styles['window-device-controls__popover--bottom'],
        )}
      >
        {menu}
      </div>
    </div>
  );

  return (
    <div className={cx(styles['window-device-controls'], className)}>
      {slot(
        'mic',
        micOn,
        micOn ? l.muteMic : l.unmuteMic,
        l.micOptions,
        micOn ? <MicrophoneIcon /> : <MicrophoneOffIcon />,
        onToggleMic,
        <DeviceMenu
          open={openMenu === 'mic'}
          title={l.micMenuTitle}
          devices={mics}
          selectedId={micDeviceId}
          onSelect={(id) => {
            onSelectMic(id);
            close();
          }}
          onClose={close}
        />,
      )}
      {slot(
        'camera',
        cameraOn,
        cameraOn ? l.cameraOff : l.cameraOn,
        l.cameraOptions,
        cameraOn ? <VideoOutlineIcon /> : <VideoOffOutlineIcon />,
        onToggleCamera,
        <DeviceMenu
          open={openMenu === 'camera'}
          title={l.cameraMenuTitle}
          devices={cameras}
          selectedId={cameraDeviceId}
          onSelect={(id) => {
            onSelectCamera(id);
            close();
          }}
          onClose={close}
        />,
      )}
    </div>
  );
}
