import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import HandRightIcon from '@mattermost/compass-icons/components/hand-right';
import HandRightOutlineIcon from '@mattermost/compass-icons/components/hand-right-outline';
import MicrophoneIcon from '@mattermost/compass-icons/components/microphone';
import VideoOutlineIcon from '@mattermost/compass-icons/components/video-outline';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import MessageTextOutlineIcon from '@mattermost/compass-icons/components/message-text-outline';
import RecordCircleOutlineIcon from '@mattermost/compass-icons/components/record-circle-outline';
import RecordSquareOutlineIcon from '@mattermost/compass-icons/components/record-square-outline';
import VolumeHighIcon from '@mattermost/compass-icons/components/volume-high';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import {
  PopoverMenu,
  PopoverMenuDivider,
} from '@mattermost/compass-ui/components/popover-menu';
import {
  DeviceMenu,
  type DeviceMenuDevice,
  type DeviceMenuSection,
} from '../components/DeviceMenu';
import styles from './CallMoreMenu.module.scss';

/** One device submenu: its devices, the selected id and the pick handler. */
export interface CallMoreMenuDevices {
  devices: DeviceMenuDevice[];
  selectedId?: string;
  onSelect: (id: string) => void;
  /** Extra sections after the device list (e.g. the camera's "Blur background"). */
  extraSections?: DeviceMenuSection[];
}

export interface CallMoreMenuProps {
  open: boolean;
  recording: boolean;
  /** Raise / lower hand row; omitted where the surface has its own hand button. */
  handRaised?: boolean;
  onToggleHand?: () => void;
  /** Microphone submenu; omit to hide the row. */
  mic?: CallMoreMenuDevices & { label?: string };
  /** Audio output submenu. */
  output: CallMoreMenuDevices & { label?: string };
  /** Camera submenu; omit to hide the row (audio and phone calls). */
  camera?: CallMoreMenuDevices & { label?: string };
  onToggleRecording: () => void;
  /** Omitted when there is no chat pane to show (phone calls stay in the widget). */
  onShowChat?: () => void;
  onShowInfo: () => void;
  /** Called after a device is picked so the host can close the whole menu. */
  onPicked?: () => void;
}

type SubmenuId = 'mic' | 'output' | 'camera';

/** Grace period so a diagonal move from the row into its submenu doesn't close it. */
const HOVER_CLOSE_MS = 160;

interface SubmenuRowProps {
  id: SubmenuId;
  label: string;
  secondaryLabel?: string;
  glyph: ReactNode;
  openId: SubmenuId | null;
  onOpen: (id: SubmenuId, focusFirst?: boolean) => void;
  onClose: (refocus?: boolean) => void;
  config: CallMoreMenuDevices;
  onPicked?: () => void;
}

/**
 * A menu row that opens a child menu beside it: on hover, click, Enter / Space
 * or ArrowRight. Row and child share one wrapper, so the pointer can travel
 * from one to the other without closing it.
 */
function SubmenuRow({
  id,
  label,
  secondaryLabel,
  glyph,
  openId,
  onOpen,
  onClose,
  config,
  onPicked,
}: SubmenuRowProps) {
  const open = openId === id;
  const wrapRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  // Open to the right of the row; flip left when it would leave the viewport.
  const [flip, setFlip] = useState(false);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  useLayoutEffect(() => {
    if (!open) return;
    const wrap = wrapRef.current;
    const sub = subRef.current;
    if (!wrap || !sub) return;
    const room = window.innerWidth - wrap.getBoundingClientRect().right;
    setFlip(room < sub.offsetWidth + 16);
  }, [open]);

  const cancelClose = () => window.clearTimeout(closeTimer.current);
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => onClose(), HOVER_CLOSE_MS);
  };

  const focusFirst = () => {
    // The submenu mounts a frame after `open` flips: retry briefly.
    let tries = 0;
    const tick = () => {
      const first = subRef.current?.querySelector<HTMLElement>(
        '[role^="menuitem"]:not(:disabled)',
      );
      if (first) first.focus({ preventScroll: true });
      else if (tries++ < 10) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const inSub = subRef.current?.contains(e.target as Node);
    if (!inSub && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
      // Directional keys follow the side the submenu opens to.
      const forward = flip ? 'ArrowLeft' : 'ArrowRight';
      if (e.key === forward) {
        e.preventDefault();
        onOpen(id);
        focusFirst();
      }
    } else if (
      inSub &&
      (e.key === (flip ? 'ArrowRight' : 'ArrowLeft') || e.key === 'Escape')
    ) {
      // Close just the submenu; the host's Escape would close the whole menu.
      e.preventDefault();
      e.nativeEvent.stopPropagation();
      onClose(true);
    }
  };

  const sections: DeviceMenuSection[] = [
    {
      id,
      title: label,
      devices: config.devices,
      selectedId: config.selectedId,
      onSelect: (deviceId) => {
        config.onSelect(deviceId);
        onPicked?.();
      },
    },
    ...(config.extraSections ?? []),
  ];

  return (
    <div
      ref={wrapRef}
      role="presentation"
      className={styles['call-more-menu__submenu']}
      onMouseEnter={() => {
        cancelClose();
        onOpen(id);
      }}
      onMouseLeave={scheduleClose}
      onKeyDown={onKeyDown}
    >
      <MenuItem
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={open}
        active={open}
        label={label}
        secondaryLabel={secondaryLabel}
        leadingVisual={<Icon size="16" glyph={glyph} />}
        trailingElement
        trailingVisual={<Icon size="16" glyph={<ChevronRightIcon />} />}
        onClick={() => {
          cancelClose();
          onOpen(id, true);
          focusFirst();
        }}
      />
      <div
        ref={subRef}
        className={[
          styles['call-more-menu__child'],
          flip && styles['call-more-menu__child--flip'],
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <DeviceMenu
          nested
          open={open}
          title={label}
          // One heading is enough: a lone device list takes the row's name.
          {...(config.extraSections
            ? { sections }
            : {
                devices: config.devices,
                selectedId: config.selectedId,
                onSelect: sections[0].onSelect,
              })}
          onClose={() => onClose()}
        />
      </div>
    </div>
  );
}

/**
 * The call's "More" menu, shared by the widget and the window. Mirrors the
 * compass-proto `CallWidget` menu recipe (Audio output, Record call, Show chat
 * thread, Call info). Devices are listed Microphone, Audio output, then Camera;
 * each opens a submenu beside its row on hover (or click / ArrowRight) instead
 * of replacing the menu.
 */
export default function CallMoreMenu({
  open,
  recording,
  mic,
  output,
  camera,
  handRaised = false,
  onToggleHand,
  onToggleRecording,
  onShowChat,
  onShowInfo,
  onPicked,
}: CallMoreMenuProps) {
  const [sub, setSub] = useState<SubmenuId | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  // A fresh open never starts with a submenu showing.
  useEffect(() => {
    if (!open) setSub(null);
  }, [open]);

  const openSub = useCallback((id: SubmenuId) => setSub(id), []);
  const closeSub = useCallback((refocus = false) => {
    setSub((cur) => {
      if (cur && refocus) {
        requestAnimationFrame(() =>
          parentRef.current
            ?.querySelector<HTMLElement>(
              '[aria-expanded="false"][aria-haspopup]',
            )
            ?.focus(),
        );
      }
      return null;
    });
  }, []);

  const rowProps = {
    openId: sub,
    onOpen: openSub,
    onClose: closeSub,
    onPicked,
  };
  // Plain rows close any open submenu as the pointer moves onto them.
  const plain = { onMouseEnter: () => setSub(null) };

  return (
    <div ref={parentRef} className={styles['call-more-menu']}>
      <PopoverMenu open={open} role="menu" aria-label="More options">
        {mic && (
          <SubmenuRow
            {...rowProps}
            id="mic"
            label="Microphone"
            secondaryLabel={mic.label}
            glyph={<MicrophoneIcon />}
            config={mic}
          />
        )}
        <SubmenuRow
          {...rowProps}
          id="output"
          label="Audio output"
          secondaryLabel={output.label}
          glyph={<VolumeHighIcon />}
          config={output}
        />
        {camera && (
          <SubmenuRow
            {...rowProps}
            id="camera"
            label="Camera"
            secondaryLabel={camera.label}
            glyph={<VideoOutlineIcon />}
            config={camera}
          />
        )}
        <PopoverMenuDivider />
        {onToggleHand && (
          <MenuItem
            {...plain}
            role="menuitem"
            label={handRaised ? 'Lower hand' : 'Raise hand'}
            leadingVisual={
              <Icon
                size="16"
                glyph={
                  handRaised ? <HandRightIcon /> : <HandRightOutlineIcon />
                }
              />
            }
            onClick={onToggleHand}
          />
        )}
        <MenuItem
          {...plain}
          role="menuitem"
          label={recording ? 'Stop recording' : 'Record call'}
          leadingVisual={
            <Icon
              size="16"
              glyph={
                recording ? (
                  <RecordSquareOutlineIcon />
                ) : (
                  <RecordCircleOutlineIcon />
                )
              }
            />
          }
          onClick={onToggleRecording}
        />
        {onShowChat && (
          <MenuItem
            {...plain}
            role="menuitem"
            label="Show chat thread"
            leadingVisual={
              <Icon size="16" glyph={<MessageTextOutlineIcon />} />
            }
            onClick={onShowChat}
          />
        )}
        <MenuItem
          {...plain}
          role="menuitem"
          label="Call info"
          leadingVisual={<Icon size="16" glyph={<InformationOutlineIcon />} />}
          onClick={onShowInfo}
        />
      </PopoverMenu>
    </div>
  );
}
