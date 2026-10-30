import { useState } from 'react';
import { WindowCalling } from '../components/WindowCalling';
import {
  WindowDeviceControls,
  type WindowDeviceMenuId,
} from '../components/WindowDeviceControls';
import { useMediaDevices } from '../hooks/useMediaDevices';
import { useVideoCall } from '../videoCallContext';
import { DM_PEER_ID, ROSTER } from '../videoCallsData';
import CallScene from './CallScene';
import { PhaseCrossfade } from '../components/PhaseCrossfade';
import PreJoinScene from './PreJoinScene';
import ScreenShareScene from './ScreenShareScene';
import styles from './CallWindowScene.module.scss';

const PEER = ROSTER.find((p) => p.id === DM_PEER_ID) ?? ROSTER[1];

const FALLBACK_MICS = [
  { deviceId: 'fallback-mic-1', label: 'Default microphone' },
  { deviceId: 'fallback-mic-2', label: 'External USB microphone' },
];
const FALLBACK_CAMERAS = [
  { deviceId: 'fallback-camera-1', label: 'Built-in camera' },
  { deviceId: 'fallback-camera-2', label: 'External webcam' },
];

/**
 * Expanded "calling" state: a larger ringing screen in the dark window chrome.
 * Collapse returns to the widget (the call keeps ringing); Cancel hangs up.
 * `CallPhaseEffects` connects the call after the answer delay.
 */
function CallingWindow() {
  const { state, actions, selfCamera } = useVideoCall();
  const { media } = state;
  const [openMenu, setOpenMenu] = useState<WindowDeviceMenuId | null>(null);
  const devices = useMediaDevices({ enabled: media.useWebcam });
  const mics = devices.microphones.length ? devices.microphones : FALLBACK_MICS;
  const cameras = devices.cameras.length ? devices.cameras : FALLBACK_CAMERAS;

  return (
    <div className={styles['call-window-scene']}>
      <WindowCalling
        peerName={PEER.name}
        peerAvatarSrc={PEER.avatarSrc}
        onCollapse={actions.collapse}
        onCancel={actions.cancelCall}
        controls={
          <WindowDeviceControls
            micOn={media.micOn}
            onToggleMic={actions.toggleMic}
            mics={mics.map((m) => ({ id: m.deviceId, label: m.label }))}
            micDeviceId={media.micDeviceId}
            onSelectMic={(id) => actions.setMedia({ micDeviceId: id })}
            cameraOn={media.cameraOn}
            onToggleCamera={selfCamera.toggle}
            cameras={cameras.map((c) => ({ id: c.deviceId, label: c.label }))}
            cameraDeviceId={media.cameraDeviceId}
            onSelectCamera={(id) => actions.setMedia({ cameraDeviceId: id })}
            openMenu={openMenu}
            onOpenMenuChange={setOpenMenu}
          />
        }
      />
    </div>
  );
}

/**
 * The expanded call window. It hosts every phase (pre-join, calling, live,
 * sharing) so the lifecycle never leaves the surface the user chose.
 */
export default function CallWindowScene() {
  const { state } = useVideoCall();
  const scene =
    state.phase === 'pre-join' ? (
      <PreJoinScene />
    ) : state.phase === 'calling' ? (
      <CallingWindow />
    ) : state.sharing ? (
      <ScreenShareScene />
    ) : (
      <CallScene />
    );
  return (
    <PhaseCrossfade phaseKey={state.phase} align="fill">
      {scene}
    </PhaseCrossfade>
  );
}
