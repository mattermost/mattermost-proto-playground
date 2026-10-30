import { useEffect, useRef, useState } from 'react';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import { UserAvatarGroup } from '@mattermost/compass-ui/components/user-avatar-group';
import VolumeHighIcon from '@mattermost/compass-icons/components/volume-high';
import { CallNotice } from '../components/CallNotice';
import { MicLevelMeter } from '../components/MicLevelMeter';
import { PreJoinPanel } from '../components/PreJoinPanel';
import { VideoCallWindowFrame } from '../components/VideoCallWindow';
import { VideoTile } from '../components/VideoTile';
import {
  WindowDeviceControls,
  type WindowDeviceMenuId,
} from '../components/WindowDeviceControls';
import { playSound, setSoundsEnabled, stopSound } from '../callSounds';
import { useMediaDevices } from '../hooks/useMediaDevices';
import { useMicLevel, useMicStream } from '../hooks/useMicLevel';
import { useVideoCall } from '../videoCallContext';
import { DM_PEER_ID, ROSTER, SELF_ID } from '../videoCallsData';
import { describePeople } from './callCopy';
import styles from './PreJoinScene.module.scss';

const PEER = ROSTER.find((p) => p.id === DM_PEER_ID) ?? ROSTER[1];
const SELF = ROSTER.find((p) => p.id === SELF_ID) ?? ROSTER[0];
const SPEAKER_TEST_MS = 1500;

const FALLBACK_MICS = [
  { deviceId: 'fallback-mic-1', label: 'Default microphone' },
  { deviceId: 'fallback-mic-2', label: 'External USB microphone' },
];
const FALLBACK_CAMERAS = [
  { deviceId: 'fallback-camera-1', label: 'Built-in camera' },
  { deviceId: 'fallback-camera-2', label: 'External webcam' },
];

const TITLES = {
  start: 'Ready to start the call?',
  accept: 'Ready to join?',
  'join-group': 'Ready to join the call?',
} as const;

/**
 * Large "ready to join" check inside the dark call window. Camera and mic are
 * never requested without a click: the camera button IS the opt-in
 * (`selfCamera.toggle`).
 */
export default function PreJoinScene() {
  const { state, participants, actions, selfCamera } = useVideoCall();
  const { media, joinMode, soundOn } = state;
  const [openMenu, setOpenMenu] = useState<WindowDeviceMenuId | null>(null);
  const [micCheck, setMicCheck] = useState(false);
  const [testing, setTesting] = useState(false);
  const testTimer = useRef<number | null>(null);

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
    enabled: media.useWebcam || micCheck || openMenu !== null,
  });
  const mics = devices.microphones.length ? devices.microphones : FALLBACK_MICS;
  const cameras = devices.cameras.length ? devices.cameras : FALLBACK_CAMERAS;

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

  return (
    <div className={styles['pre-join-scene']}>
      <VideoCallWindowFrame onCollapse={actions.collapse}>
        <div className={styles['pre-join-scene__body']}>
          <PreJoinPanel
            appearance="dark"
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
                  stream={selfCamera.stream}
                  muted={!media.micOn}
                  mirrored
                />
                {selfCamera.status === 'requesting' && (
                  <div
                    className={styles['pre-join-scene__overlay']}
                    role="status"
                  >
                    <p className={styles['pre-join-scene__message']}>
                      Starting camera…
                    </p>
                  </div>
                )}
                <CallNotice
                  notices={state.notices}
                  onDismiss={actions.dismissNotice}
                />
              </>
            }
            previewControls={
              <WindowDeviceControls
                micOn={media.micOn}
                onToggleMic={actions.toggleMic}
                mics={mics.map((m) => ({ id: m.deviceId, label: m.label }))}
                micDeviceId={media.micDeviceId}
                onSelectMic={(id) => actions.setMedia({ micDeviceId: id })}
                cameraOn={media.cameraOn}
                onToggleCamera={selfCamera.toggle}
                cameras={cameras.map((c) => ({
                  id: c.deviceId,
                  label: c.label,
                }))}
                cameraDeviceId={media.cameraDeviceId}
                onSelectCamera={(id) =>
                  actions.setMedia({ cameraDeviceId: id })
                }
                openMenu={openMenu}
                onOpenMenuChange={setOpenMenu}
              />
            }
            participants={who}
            checks={
              <>
                <MicLevelMeter level={level} muted={!media.micOn} />
                <div className={styles['pre-join-scene__check-row']}>
                  {!micCheck && (
                    <Button
                      emphasis="tertiary"
                      appearance="inverted"
                      size="small"
                      disabled={!media.micOn}
                      onClick={() => setMicCheck(true)}
                    >
                      Check my microphone
                    </Button>
                  )}
                  <Button
                    emphasis="tertiary"
                    appearance="inverted"
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
                  emphasis="tertiary"
                  appearance="inverted"
                  onClick={actions.cancelCall}
                >
                  Cancel
                </Button>
              </>
            }
          />
        </div>
      </VideoCallWindowFrame>
    </div>
  );
}
