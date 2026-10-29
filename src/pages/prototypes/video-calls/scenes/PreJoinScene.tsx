import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import {
  PopoverMenu,
  PopoverMenuTitle,
} from '@mattermost/compass-ui/components/popover-menu';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import { UserAvatarGroup } from '@mattermost/compass-ui/components/user-avatar-group';
import CheckIcon from '@mattermost/compass-icons/components/check';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import MicrophoneIcon from '@mattermost/compass-icons/components/microphone';
import MicrophoneOffIcon from '@mattermost/compass-icons/components/microphone-off';
import VideoOffOutlineIcon from '@mattermost/compass-icons/components/video-off-outline';
import VideoOutlineIcon from '@mattermost/compass-icons/components/video-outline';
import VolumeHighIcon from '@mattermost/compass-icons/components/volume-high';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import { MicLevelMeter } from '../components/MicLevelMeter';
import { PreJoinPanel } from '../components/PreJoinPanel';
import { VideoTile } from '../components/VideoTile';
import { playSound, setSoundsEnabled, stopSound } from '../callSounds';
import { useLocalCamera } from '../hooks/useLocalCamera';
import {
  useMediaDevices,
  type MediaDeviceOption,
} from '../hooks/useMediaDevices';
import { useMicLevel, useMicStream } from '../hooks/useMicLevel';
import { useVideoCall } from '../videoCallContext';
import { DM_PEER_ID, ROSTER, SELF_ID } from '../videoCallsData';
import { describePeople } from './callCopy';
import styles from './PreJoinScene.module.scss';

const PEER = ROSTER.find((p) => p.id === DM_PEER_ID) ?? ROSTER[1];
const SELF = ROSTER.find((p) => p.id === SELF_ID) ?? ROSTER[0];
const SPEAKER_TEST_MS = 1500;

const TITLES = {
  start: 'Ready to start the call?',
  accept: 'Ready to join?',
  'join-group': 'Ready to join the call?',
} as const;

interface DeviceControlProps {
  /** Heading inside the menu, e.g. "Microphone". */
  menuTitle: string;
  toggleLabel: string;
  menuButtonLabel: string;
  on: boolean;
  onGlyph: React.ReactElement;
  offGlyph: React.ReactElement;
  onToggle: () => void;
  devices: MediaDeviceOption[];
  selectedId?: string;
  onSelect: (deviceId: string) => void;
  fallbackLabel: string;
}

/** Toggle plus chevron that opens a host-owned device menu. */
function DeviceControl({
  menuTitle,
  toggleLabel,
  menuButtonLabel,
  on,
  onGlyph,
  offGlyph,
  onToggle,
  devices,
  selectedId,
  onSelect,
  fallbackLabel,
}: DeviceControlProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useOutsideClose(ref, open, close);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      chevronRef.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const options: MediaDeviceOption[] =
    devices.length > 0 ? devices : [{ deviceId: '', label: fallbackLabel }];
  const current = selectedId ?? options[0].deviceId;

  return (
    <div className={styles['pre-join-scene__control']} ref={ref}>
      <IconButton
        size="large"
        rounded
        destructive={!on}
        aria-label={toggleLabel}
        icon={<Icon glyph={on ? onGlyph : offGlyph} />}
        onClick={onToggle}
      />
      <IconButton
        ref={chevronRef}
        size="small"
        rounded
        aria-label={menuButtonLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        icon={<Icon glyph={<ChevronDownIcon />} />}
        onClick={() => setOpen((v) => !v)}
      />
      <PopoverMenu
        className={styles['pre-join-scene__menu']}
        open={open}
        role="menu"
        aria-label={menuTitle}
      >
        <PopoverMenuTitle>{menuTitle}</PopoverMenuTitle>
        {options.map((d) => (
          <MenuItem
            key={d.deviceId || d.label}
            role="menuitemradio"
            aria-checked={d.deviceId === current}
            label={d.label}
            leadingElement={false}
            trailingElement={d.deviceId === current}
            trailingVisual={<Icon glyph={<CheckIcon />} />}
            onClick={() => {
              onSelect(d.deviceId);
              setOpen(false);
              chevronRef.current?.focus();
            }}
          />
        ))}
      </PopoverMenu>
    </div>
  );
}

/** "Ready to join?" check before a call. Camera and mic are never requested without a click. */
export default function PreJoinScene() {
  const { state, participants, actions } = useVideoCall();
  const { media, joinMode, soundOn } = state;
  const [micCheck, setMicCheck] = useState(false);
  const [testing, setTesting] = useState(false);
  const [devicesWanted, setDevicesWanted] = useState(false);
  const testTimer = useRef<number | null>(null);

  const camera = useLocalCamera({
    enabled: media.useWebcam && media.cameraOn,
    deviceId: media.cameraDeviceId,
  });
  const micStream = useMicStream({
    enabled: micCheck && media.micOn,
    deviceId: media.micDeviceId,
  });
  const level = useMicLevel({
    stream: micStream.stream,
    enabled: media.micOn,
    simulated: !micStream.stream,
  });
  const devices = useMediaDevices({
    enabled: devicesWanted || media.useWebcam || micCheck,
  });

  useEffect(
    () => () => {
      if (testTimer.current !== null) window.clearTimeout(testTimer.current);
      stopSound('join');
    },
    [],
  );

  const testSpeakers = () => {
    if (testTimer.current !== null) window.clearTimeout(testTimer.current);
    setSoundsEnabled(soundOn);
    playSound('join');
    setTesting(true);
    testTimer.current = window.setTimeout(() => {
      stopSound('join');
      setTesting(false);
      testTimer.current = null;
    }, SPEAKER_TEST_MS);
  };

  const cameraBlocked =
    media.useWebcam &&
    media.cameraOn &&
    (camera.status === 'denied' || camera.status === 'unavailable');
  const cameraStarting =
    media.useWebcam && media.cameraOn && camera.status === 'requesting';

  const others = participants.filter((p) => !p.self);
  const isStart = joinMode === 'start';

  const who =
    joinMode === 'join-group' ? (
      <div className={styles['pre-join-scene__who']}>
        {others.length > 0 && (
          <UserAvatarGroup
            size="32"
            max={4}
            avatars={others.map((p) => ({
              key: p.id,
              name: p.name,
              src: p.avatarSrc,
            }))}
          />
        )}
        <p className={styles['pre-join-scene__who-text']}>
          {others.length > 0
            ? `${describePeople(others.map((p) => p.name))} ${others.length === 1 ? 'is' : 'are'} in the call`
            : 'No one else is here yet'}
        </p>
      </div>
    ) : (
      <div className={styles['pre-join-scene__who']}>
        <UserAvatar src={PEER.avatarSrc} alt="" name={PEER.name} size="40" />
        <p className={styles['pre-join-scene__who-text']}>
          <span className={styles['pre-join-scene__who-name']}>
            {PEER.name}
          </span>{' '}
          {isStart ? 'will be called' : 'is waiting for you'}
        </p>
      </div>
    );

  const cancelTarget = joinMode === 'join-group' ? 'channel' : 'dm';

  return (
    <div className={styles['pre-join-scene']}>
      <PreJoinPanel
        title={TITLES[joinMode]}
        subtitle="Check your camera and microphone first."
        ariaLabel={TITLES[joinMode]}
        preview={
          <>
            <VideoTile
              name={SELF.name}
              selfLabel="You"
              avatarSrc={SELF.avatarSrc}
              cameraOn={media.cameraOn}
              stream={camera.stream}
              muted={!media.micOn}
              mirrored
            />
            {media.cameraOn && !media.useWebcam && (
              <div className={styles['pre-join-scene__overlay']}>
                <Button
                  emphasis="secondary"
                  appearance="inverted"
                  size="small"
                  onClick={() => actions.setMedia({ useWebcam: true })}
                >
                  Use my camera
                </Button>
              </div>
            )}
            {cameraStarting && (
              <div className={styles['pre-join-scene__overlay']} role="status">
                <p className={styles['pre-join-scene__message']}>
                  Starting camera…
                </p>
              </div>
            )}
            {cameraBlocked && (
              <div className={styles['pre-join-scene__overlay']} role="alert">
                <p className={styles['pre-join-scene__message']}>
                  {camera.status === 'denied'
                    ? 'Camera access is blocked. Allow it in your browser, then try again.'
                    : 'We could not find a working camera.'}
                </p>
                <Button
                  emphasis="link"
                  appearance="inverted"
                  size="small"
                  onClick={camera.retry}
                >
                  Retry
                </Button>
              </div>
            )}
          </>
        }
        previewControls={
          <>
            <DeviceControl
              menuTitle="Microphone"
              toggleLabel={
                media.micOn ? 'Turn off microphone' : 'Turn on microphone'
              }
              menuButtonLabel="Choose microphone"
              on={media.micOn}
              onGlyph={<MicrophoneIcon />}
              offGlyph={<MicrophoneOffIcon />}
              onToggle={actions.toggleMic}
              devices={devices.microphones}
              selectedId={media.micDeviceId}
              onSelect={(id) => {
                setDevicesWanted(true);
                actions.setMedia({ micDeviceId: id || undefined });
              }}
              fallbackLabel="Default microphone"
            />
            <DeviceControl
              menuTitle="Camera"
              toggleLabel={
                media.cameraOn ? 'Turn off camera' : 'Turn on camera'
              }
              menuButtonLabel="Choose camera"
              on={media.cameraOn}
              onGlyph={<VideoOutlineIcon />}
              offGlyph={<VideoOffOutlineIcon />}
              onToggle={actions.toggleCamera}
              devices={devices.cameras}
              selectedId={media.cameraDeviceId}
              onSelect={(id) => {
                setDevicesWanted(true);
                actions.setMedia({ cameraDeviceId: id || undefined });
              }}
              fallbackLabel="Default camera"
            />
          </>
        }
        participants={who}
        checks={
          <>
            <MicLevelMeter level={level} muted={!media.micOn} />
            <div className={styles['pre-join-scene__check-row']}>
              {!micCheck && (
                <Button
                  emphasis="tertiary"
                  size="small"
                  disabled={!media.micOn}
                  onClick={() => setMicCheck(true)}
                >
                  Check my microphone
                </Button>
              )}
              <Button
                emphasis="tertiary"
                size="small"
                leadingIcon={<Icon glyph={<VolumeHighIcon />} />}
                disabled={!soundOn || testing}
                onClick={testSpeakers}
              >
                {testing ? 'Playing…' : 'Test speakers'}
              </Button>
            </div>
            <p className={styles['pre-join-scene__helper']} role="status">
              {micCheck && micStream.status === 'denied'
                ? 'Microphone access is blocked. Allow it in your browser to check it.'
                : micCheck && micStream.status === 'unavailable'
                  ? 'We could not find a working microphone.'
                  : micCheck
                    ? 'Say something to see the meter move.'
                    : 'The meter is simulated until you check your microphone.'}
              {!soundOn &&
                ' Turn on sounds in the prototype controls to hear the speaker test.'}
            </p>
          </>
        }
        actions={
          <>
            <Button emphasis="primary" onClick={actions.confirmPreJoin}>
              {isStart ? 'Start call' : 'Join call'}
            </Button>
            <Button
              emphasis="secondary"
              onClick={() => actions.go(cancelTarget)}
            >
              Cancel
            </Button>
          </>
        }
      />
    </div>
  );
}
