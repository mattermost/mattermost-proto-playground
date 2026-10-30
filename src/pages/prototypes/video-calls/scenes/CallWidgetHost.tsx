import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { ParticipantsPanel } from '@mattermost/compass-proto';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import {
  PopoverMenu,
  PopoverMenuDivider,
} from '@mattermost/compass-ui/components/popover-menu';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import { DeviceMenu } from '../components/DeviceMenu';
import { VideoCallWidget } from '../components/VideoCallWidget';
import { WidgetCalling } from '../components/WidgetCalling';
import { WidgetIncoming } from '../components/WidgetIncoming';
import { WidgetPreJoin } from '../components/WidgetPreJoin';
import { useMediaDevices } from '../hooks/useMediaDevices';
import { useMicLevel } from '../hooks/useMicLevel';
import { useVideoCall } from '../videoCallContext';
import {
  CHANNEL_NAME,
  CLIPS,
  DM_PEER_ID,
  ROSTER,
  SELF_ID,
} from '../videoCallsData';
import { useCallSession } from './useCallSession';
import styles from './CallWidgetHost.module.scss';

type Overlay = 'participants' | 'more' | 'mic' | 'camera' | null;

const PEER = ROSTER.find((p) => p.id === DM_PEER_ID) ?? ROSTER[1];
const SELF = ROSTER.find((p) => p.id === SELF_ID) ?? ROSTER[0];

const FALLBACK_MICS = [
  { deviceId: 'fallback-mic-1', label: 'Default microphone' },
  { deviceId: 'fallback-mic-2', label: 'External USB microphone' },
];
const FALLBACK_CAMERAS = [
  { deviceId: 'fallback-camera-1', label: 'Built-in camera' },
  { deviceId: 'fallback-camera-2', label: 'External webcam' },
];

/** Overlay (one at a time) shared by every widget phase. */
function useWidgetOverlay() {
  const [overlay, setOverlay] = useState<Overlay>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const onTrigger = useRef(false);

  const close = useCallback(() => setOverlay(null), []);
  const toggle = useCallback(
    (id: Exclude<Overlay, null>) =>
      setOverlay((cur) => (cur === id ? null : id)),
    [],
  );

  useOutsideClose(widgetRef, overlay !== null, close);
  useEffect(() => {
    if (overlay === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOverlay(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [overlay]);

  // A press on a menu trigger is the trigger's own toggle: the device menu's
  // outside-pointerdown dismissal must not close it first (it would re-open).
  const onPointerDownCapture = useCallback((e: ReactPointerEvent) => {
    onTrigger.current = !!(e.target as Element).closest('[aria-haspopup]');
    window.setTimeout(() => {
      onTrigger.current = false;
    }, 0);
  }, []);
  const closeFromMenu = useCallback(() => {
    if (!onTrigger.current) setOverlay(null);
  }, []);

  return {
    overlay,
    widgetRef,
    close,
    toggle,
    closeFromMenu,
    onPointerDownCapture,
  };
}

type WidgetOverlay = ReturnType<typeof useWidgetOverlay>;

/** Device menus + devices shared by the phases that show mic / camera controls. */
function useDeviceMenus(ov: WidgetOverlay) {
  const { state, actions } = useVideoCall();
  const devices = useMediaDevices({ enabled: true });
  const mics = devices.microphones.length ? devices.microphones : FALLBACK_MICS;
  const cameras = devices.cameras.length ? devices.cameras : FALLBACK_CAMERAS;

  const micMenu = (
    <DeviceMenu
      open={ov.overlay === 'mic'}
      title="Microphone"
      devices={mics.map((m) => ({ id: m.deviceId, label: m.label }))}
      selectedId={state.media.micDeviceId}
      onSelect={(id) => {
        actions.setMedia({ micDeviceId: id });
        ov.close();
      }}
      onClose={ov.closeFromMenu}
    />
  );
  const cameraMenu = (
    <DeviceMenu
      open={ov.overlay === 'camera'}
      title="Camera"
      devices={cameras.map((c) => ({ id: c.deviceId, label: c.label }))}
      selectedId={state.media.cameraDeviceId}
      onSelect={(id) => {
        actions.setMedia({ cameraDeviceId: id });
        ov.close();
      }}
      onClose={ov.closeFromMenu}
    />
  );
  return { micMenu, cameraMenu };
}

/** Pre-join: self preview, mic test, device menus, Start / Join. */
function PreJoinWidget({ ov }: { ov: WidgetOverlay }) {
  const { state, participants, actions, selfCamera } = useVideoCall();
  const { micMenu, cameraMenu } = useDeviceMenus(ov);
  const micLevel = useMicLevel({
    enabled: state.media.micOn,
    simulated: true,
  });
  const mode = state.callContext === 'dm' ? 'start' : 'join';
  const people = participants
    .filter((p) => !p.self)
    .map((p) => ({ key: p.id, name: p.name, src: p.avatarSrc }));

  return (
    <WidgetPreJoin
      mode={mode}
      selfName={SELF.name}
      selfAvatarSrc={SELF.avatarSrc}
      cameraStream={selfCamera.stream}
      micOn={state.media.micOn}
      micLevel={micLevel}
      cameraOn={state.media.cameraOn}
      onToggleMic={actions.toggleMic}
      onOpenMicMenu={() => ov.toggle('mic')}
      micMenuOpen={ov.overlay === 'mic'}
      micMenu={micMenu}
      onToggleCamera={selfCamera.toggle}
      onOpenCameraMenu={() => ov.toggle('camera')}
      cameraMenuOpen={ov.overlay === 'camera'}
      cameraMenu={cameraMenu}
      people={people}
      onPrimary={actions.confirmPreJoin}
      onCancel={actions.cancelCall}
      onExpand={actions.expand}
    />
  );
}

/** Outgoing 1:1 ring. The connect timer lives in CallPhaseEffects. */
function CallingWidget({ ov }: { ov: WidgetOverlay }) {
  const { state, actions, selfCamera } = useVideoCall();
  const { micMenu, cameraMenu } = useDeviceMenus(ov);
  return (
    <WidgetCalling
      peerName={PEER.name}
      peerAvatarSrc={PEER.avatarSrc}
      micOn={state.media.micOn}
      onToggleMic={actions.toggleMic}
      onOpenMicMenu={() => ov.toggle('mic')}
      micMenuOpen={ov.overlay === 'mic'}
      micMenu={micMenu}
      cameraOn={state.media.cameraOn}
      onToggleCamera={selfCamera.toggle}
      onOpenCameraMenu={() => ov.toggle('camera')}
      cameraMenuOpen={ov.overlay === 'camera'}
      cameraMenu={cameraMenu}
      onExpand={actions.expand}
      onCancel={actions.cancelCall}
    />
  );
}

function IncomingWidget() {
  const { actions } = useVideoCall();
  return (
    <WidgetIncoming
      callerName={PEER.name}
      callerAvatarSrc={PEER.avatarSrc}
      onAccept={() => actions.accept()}
      onAcceptAudio={() => actions.accept({ audioOnly: true })}
      onDecline={actions.decline}
    />
  );
}

/** Live call: thumbnails, controls, participants + more popovers. */
function ActiveWidget({ ov }: { ov: WidgetOverlay }) {
  const { state, participants, actions, selfCamera, elapsedLabel } =
    useCallSession();
  const { micMenu, cameraMenu } = useDeviceMenus(ov);
  const { overlay, close, toggle } = ov;

  return (
    <VideoCallWidget
      channelName={CHANNEL_NAME}
      elapsedLabel={elapsedLabel}
      participants={participants}
      clips={CLIPS}
      selfStream={selfCamera.stream}
      participantCount={participants.length}
      participantsOpen={overlay === 'participants'}
      onToggleParticipants={() => toggle('participants')}
      participantsPopover={
        overlay === 'participants' ? (
          <ParticipantsPanel
            variant="widget"
            participants={participants}
            currentUserId={SELF_ID}
          />
        ) : undefined
      }
      micOn={state.media.micOn}
      onToggleMic={actions.toggleMic}
      onOpenMicMenu={() => toggle('mic')}
      micMenuOpen={overlay === 'mic'}
      micMenu={micMenu}
      cameraOn={state.media.cameraOn}
      onToggleCamera={selfCamera.toggle}
      onOpenCameraMenu={() => toggle('camera')}
      cameraMenuOpen={overlay === 'camera'}
      cameraMenu={cameraMenu}
      handRaised={state.handRaised}
      onToggleHand={actions.toggleHand}
      sharing={state.sharing}
      onToggleShare={() => {
        close();
        actions.toggleShare();
      }}
      moreOpen={overlay === 'more'}
      onToggleMore={() => toggle('more')}
      moreMenu={
        <PopoverMenu
          open={overlay === 'more'}
          role="menu"
          aria-label="More options"
        >
          <MenuItem
            label="Show call chat"
            leadingElement={false}
            onClick={() => {
              close();
              actions.expand();
              actions.togglePane('chat');
            }}
          />
          <MenuItem
            label={
              state.soundOn ? 'Turn call sounds off' : 'Turn call sounds on'
            }
            leadingElement={false}
            onClick={() => {
              actions.setSoundOn(!state.soundOn);
              close();
            }}
          />
          <PopoverMenuDivider />
          <MenuItem
            label="Copy call link"
            leadingElement={false}
            onClick={() => {
              actions.pushNotice({ kind: 'info', text: 'Call link copied' });
              close();
            }}
          />
        </PopoverMenu>
      }
      onExpand={actions.expand}
      onLeave={actions.leave}
    />
  );
}

/**
 * The call widget (bottom-left over the sidebar): hosts every phase on the
 * widget surface (pre-join, calling, incoming, active). Owns the one-at-a-time
 * menu / popover state and its dismissal (outside click, Escape).
 */
export default function CallWidgetHost() {
  const { state } = useVideoCall();
  const ov = useWidgetOverlay();

  // Menus never carry across phases.
  const { close } = ov;
  useEffect(() => {
    close();
  }, [state.phase, close]);

  if (state.phase === 'idle') return null;

  return (
    <div
      ref={ov.widgetRef}
      className={styles['call-widget-host']}
      onPointerDownCapture={ov.onPointerDownCapture}
    >
      {state.phase === 'pre-join' && <PreJoinWidget ov={ov} />}
      {state.phase === 'calling' && <CallingWidget ov={ov} />}
      {state.phase === 'incoming' && <IncomingWidget />}
      {state.phase === 'active' && <ActiveWidget ov={ov} />}
    </div>
  );
}
