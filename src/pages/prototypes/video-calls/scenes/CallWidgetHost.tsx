import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { CallInfoPanel, ParticipantsPanel } from '@mattermost/compass-proto';
import {
  DIAL_IN_NUMBER,
  DIAL_IN_PIN,
  EXTERNAL_LINK,
  INTERNAL_LINK,
} from '@/fixtures/calls/callConstants';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import { DeviceMenu } from '../components/DeviceMenu';
import { VideoCallWidget } from '../components/VideoCallWidget';
import { WidgetIncoming } from '../components/WidgetIncoming';
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
import CallMoreMenu from './CallMoreMenu';
import ExitingPopover from './ExitingPopover';
import { PhaseCrossfade } from '../components/PhaseCrossfade';
import { useCallSession } from './useCallSession';
import { useWidgetDrag } from './useWidgetDrag';
import styles from './CallWidgetHost.module.scss';

type Overlay =
  'participants' | 'more' | 'mic' | 'camera' | 'output' | 'info' | null;

const PEER = ROSTER.find((p) => p.id === DM_PEER_ID) ?? ROSTER[1];
const SELF = ROSTER.find((p) => p.id === SELF_ID) ?? ROSTER[0];

const FALLBACK_MICS = [
  { deviceId: 'fallback-mic-1', label: 'Default microphone' },
  { deviceId: 'fallback-mic-2', label: 'External USB microphone' },
];
const FALLBACK_SPEAKERS = [
  { deviceId: 'fallback-speaker-1', label: 'Default speakers' },
  { deviceId: 'fallback-speaker-2', label: 'External headphones' },
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
  const micLabel =
    mics.find((d) => d.deviceId === state.media.micDeviceId)?.label ??
    mics[0].label;
  const cameraLabel =
    cameras.find((d) => d.deviceId === state.media.cameraDeviceId)?.label ??
    cameras[0].label;
  return { micMenu, cameraMenu, micLabel, cameraLabel };
}

function IncomingWidget() {
  const { actions } = useVideoCall();
  return (
    <WidgetIncoming
      callerName={PEER.name}
      callerAvatarSrc={PEER.avatarSrc}
      onAccept={() => actions.accept()}
      onIgnore={actions.decline}
    />
  );
}

/**
 * Pre-join, calling and the live call are ONE card (`VideoCallWidget`) that
 * stays mounted while the phase changes, so its media row can animate and the
 * mic / camera controls keep their place.
 */
function CardWidget({
  ov,
  phase,
}: {
  ov: WidgetOverlay;
  phase: 'pre-join' | 'calling' | 'active';
}) {
  const { state, participants, actions, selfCamera, elapsedLabel } =
    useCallSession();
  const { micMenu, cameraMenu, micLabel, cameraLabel } = useDeviceMenus(ov);
  const { overlay, close, toggle } = ov;
  const micLevel = useMicLevel({
    enabled: phase === 'pre-join' && state.media.micOn,
    simulated: true,
  });
  const devices = useMediaDevices({ enabled: true });
  const speakers = devices.speakers.length
    ? devices.speakers
    : FALLBACK_SPEAKERS;
  const outputLabel =
    speakers.find((d) => d.deviceId === state.media.speakerDeviceId)?.label ??
    speakers[0].label;

  const people = participants
    .filter((p) => !p.self)
    .map((p) => ({ key: p.id, name: p.name, src: p.avatarSrc }));

  return (
    <VideoCallWidget
      phase={phase}
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
      selfStream={selfCamera.stream}
      onExpand={actions.expand}
      onCancel={actions.cancelCall}
      joinMode={state.callContext === 'dm' ? 'start' : 'join'}
      selfName={SELF.name}
      selfAvatarSrc={SELF.avatarSrc}
      micLevel={micLevel}
      people={people}
      onPrimary={actions.confirmPreJoin}
      peerName={PEER.name}
      peerAvatarSrc={PEER.avatarSrc}
      channelName={CHANNEL_NAME}
      elapsedLabel={elapsedLabel}
      participants={participants}
      clips={CLIPS}
      participantCount={participants.length}
      participantsOpen={overlay === 'participants'}
      onToggleParticipants={() => toggle('participants')}
      participantsPopover={
        <ExitingPopover open={overlay === 'participants'}>
          <ParticipantsPanel
            variant="widget"
            participants={participants}
            currentUserId={SELF_ID}
          />
        </ExitingPopover>
      }
      sharing={state.sharing}
      onToggleShare={() => {
        close();
        actions.toggleShare();
      }}
      moreOpen={overlay === 'more'}
      onToggleMore={() => toggle('more')}
      moreMenu={
        <CallMoreMenu
          open={overlay === 'more'}
          recording={state.recording}
          handRaised={state.handRaised}
          onToggleHand={() => {
            actions.toggleHand();
            close();
          }}
          outputLabel={outputLabel}
          micLabel={micLabel}
          onShowMic={() => toggle('mic')}
          cameraLabel={cameraLabel}
          onShowCamera={() => toggle('camera')}
          onShowOutput={() => toggle('output')}
          onToggleRecording={() => {
            actions.toggleRecording();
            close();
          }}
          onShowChat={() => {
            close();
            actions.expand();
            if (state.pane !== 'chat') actions.togglePane('chat');
          }}
          onShowInfo={() => toggle('info')}
        />
      }
      recording={state.recording}
      extraPopovers={
        <>
          <DeviceMenu
            open={overlay === 'output'}
            title="Audio output"
            devices={speakers.map((d) => ({ id: d.deviceId, label: d.label }))}
            selectedId={state.media.speakerDeviceId}
            onSelect={(id) => {
              actions.setMedia({ speakerDeviceId: id });
              close();
            }}
            onClose={ov.closeFromMenu}
          />
          <ExitingPopover open={overlay === 'info'}>
            <CallInfoPanel
              fullWidth
              variant="host"
              onClose={close}
              internalLink={INTERNAL_LINK}
              externalLink={EXTERNAL_LINK}
              dialInNumber={DIAL_IN_NUMBER}
              dialInPin={DIAL_IN_PIN}
              externalEnabled={state.externalEnabled}
              onExternalEnabledChange={actions.setExternalEnabled}
            />
          </ExitingPopover>
        </>
      }
      onLeave={actions.leave}
    />
  );
}

/**
 * The call widget (bottom-left over the sidebar): hosts every phase on the
 * widget surface (pre-join, calling, incoming, active). Owns the one-at-a-time
 * menu / popover state and its dismissal (outside click, Escape).
 */
export interface CallWidgetHostProps {
  /** True while the widget plays its exit animation (the call already ended). */
  exiting?: boolean;
}

export default function CallWidgetHost({
  exiting = false,
}: CallWidgetHostProps) {
  const { state } = useVideoCall();
  const ov = useWidgetOverlay();

  // Keep rendering the last live phase while the widget fades out after Leave /
  // Cancel / Decline (the state is already idle by then).
  const [heldPhase, setHeldPhase] = useState(state.phase);
  if (state.phase !== 'idle' && state.phase !== heldPhase) {
    setHeldPhase(state.phase);
  }
  const phase = state.phase === 'idle' ? heldPhase : state.phase;

  // Menus never carry across phases.
  const { close } = ov;
  useEffect(() => {
    close();
  }, [state.phase, close]);

  const widgetDrag = useWidgetDrag(ov.widgetRef);

  if (phase === 'idle') return null;

  return (
    <div
      ref={ov.widgetRef}
      className={[
        styles['call-widget-host'],
        exiting && styles['call-widget-host--exiting'],
        widgetDrag.dragging && styles['call-widget-host--dragging'],
        widgetDrag.snapping && styles['call-widget-host--snapping'],
      ]
        .filter(Boolean)
        .join(' ')}
      style={widgetDrag.style}
      onPointerDownCapture={ov.onPointerDownCapture}
      {...widgetDrag.handlers}
    >
      <PhaseCrossfade phaseKey={phase === 'incoming' ? 'incoming' : 'card'}>
        {phase === 'incoming' ? (
          <IncomingWidget />
        ) : (
          <CardWidget ov={ov} phase={phase} />
        )}
      </PhaseCrossfade>
    </div>
  );
}
