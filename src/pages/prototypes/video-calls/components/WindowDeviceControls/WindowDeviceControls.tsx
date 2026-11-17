import type { ReactNode } from 'react';
import MicrophoneIcon from '@mattermost/compass-icons/components/microphone';
import MicrophoneOffIcon from '@mattermost/compass-icons/components/microphone-off';
import VideoOffOutlineIcon from '@mattermost/compass-icons/components/video-off-outline';
import VideoOutlineIcon from '@mattermost/compass-icons/components/video-outline';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
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
  outputMenuTitle?: string;
  backgroundMenuTitle?: string;
  blurBackground?: string;
}

export interface WindowDeviceControlsProps {
  micOn: boolean;
  onToggleMic: () => void;
  mics: DeviceMenuDevice[];
  micDeviceId?: string;
  onSelectMic: (id: string) => void;
  /** Audio output devices: adds an "Audio output" group to the microphone menu. */
  speakers?: DeviceMenuDevice[];
  speakerDeviceId?: string;
  onSelectSpeaker?: (id: string) => void;

  cameraOn: boolean;
  /** The opt-in gesture: turning the camera on asks for the webcam. */
  onToggleCamera: () => void;
  cameras: DeviceMenuDevice[];
  cameraDeviceId?: string;
  onSelectCamera: (id: string) => void;
  /** Adds a "Blur background" row to the camera menu. */
  blurBackground?: boolean;
  onToggleBlur?: (on: boolean) => void;
  /** Audio-only calls have no camera: show the microphone alone. */
  hideCamera?: boolean;

  /** Host-owned: which device menu is open. */
  openMenu: WindowDeviceMenuId | null;
  onOpenMenuChange: (menu: WindowDeviceMenuId | null) => void;

  /** Menus open upward (default, as in the controls bar) or downward. */
  menuPlacement?: 'top' | 'bottom';
  /** Plain toggles without the chevron menus (the host offers the pickers elsewhere). Default true. */
  showMenus?: boolean;
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
  outputMenuTitle: 'Audio output',
  backgroundMenuTitle: 'Background',
  blurBackground: 'Blur background',
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
  speakers,
  speakerDeviceId,
  onSelectSpeaker,
  cameraOn,
  onToggleCamera,
  cameras,
  cameraDeviceId,
  onSelectCamera,
  blurBackground = false,
  onToggleBlur,
  hideCamera = false,
  openMenu,
  onOpenMenuChange,
  menuPlacement = 'top',
  showMenus = true,
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
  ) =>
    !showMenus ? (
      <IconButton
        size="medium"
        style="inverted"
        className={cx(
          styles['window-device-controls__toggle'],
          on
            ? styles['window-device-controls__toggle--on']
            : styles['window-device-controls__toggle--off'],
        )}
        aria-label={toggleLabel}
        title={toggleLabel}
        icon={<Icon size="20" glyph={glyph} />}
        onClick={onToggle}
      />
    ) : (
      <div className={styles['window-device-controls__slot']} data-menu-anchor>
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
          title={
            speakers
              ? `${l.micMenuTitle} and ${l.outputMenuTitle.toLowerCase()}`
              : l.micMenuTitle
          }
          {...(speakers
            ? {
                sections: [
                  {
                    id: 'mic',
                    title: l.micMenuTitle,
                    devices: mics,
                    selectedId: micDeviceId,
                    onSelect: (id: string) => {
                      onSelectMic(id);
                      close();
                    },
                  },
                  {
                    id: 'output',
                    title: l.outputMenuTitle,
                    devices: speakers,
                    selectedId: speakerDeviceId,
                    onSelect: (id: string) => {
                      onSelectSpeaker?.(id);
                      close();
                    },
                  },
                ],
              }
            : {
                devices: mics,
                selectedId: micDeviceId,
                onSelect: (id: string) => {
                  onSelectMic(id);
                  close();
                },
              })}
          onClose={close}
        />,
      )}
      {!hideCamera &&
        slot(
          'camera',
          cameraOn,
          cameraOn ? l.cameraOff : l.cameraOn,
          l.cameraOptions,
          cameraOn ? <VideoOutlineIcon /> : <VideoOffOutlineIcon />,
          onToggleCamera,
          <DeviceMenu
            open={openMenu === 'camera'}
            title={l.cameraMenuTitle}
            {...(onToggleBlur
              ? {
                  sections: [
                    {
                      id: 'camera',
                      title: l.cameraMenuTitle,
                      devices: cameras,
                      selectedId: cameraDeviceId,
                      onSelect: (id: string) => {
                        onSelectCamera(id);
                        close();
                      },
                    },
                    {
                      id: 'background',
                      title: l.backgroundMenuTitle,
                      toggles: [
                        {
                          id: 'blur',
                          label: l.blurBackground,
                          checked: blurBackground,
                          onChange: onToggleBlur,
                        },
                      ],
                    },
                  ],
                }
              : {
                  devices: cameras,
                  selectedId: cameraDeviceId,
                  onSelect: (id: string) => {
                    onSelectCamera(id);
                    close();
                  },
                })}
            onClose={close}
          />,
        )}
    </div>
  );
}
