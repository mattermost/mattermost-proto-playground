import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ModalOverlay } from '@mattermost/compass-ui/components/modal';
import { useExitAnimation } from '@/hooks/useExitAnimation';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import { useRegisterWalkthrough, useWalkthrough } from '@/walkthrough';
import type { WalkthroughSceneState } from '@/walkthrough';
import type { CallContext, CallPhase, CallSurface } from '@/types/videoCall';
import PrototypeSettings from './chrome/PrototypeSettings';
import ParticipantCountControl from './chrome/ParticipantCountControl';
import { UserSettingsModal } from './components/UserSettingsModal';
import CallPhaseEffects from './scenes/CallPhaseEffects';
import SelfVoiceActivity from './scenes/SelfVoiceActivity';
import CallWindowScene from './scenes/CallWindowScene';
import ChatScene from './scenes/ChatScene';
import { useScreenShare } from './useScreenShare';
import { useSelfCamera } from './useSelfCamera';
import { useVideoCallState } from './useVideoCallState';
import { VideoCallContext } from './videoCallContext';
import { DM_PEER_ID, ROSTER } from './videoCallsData';
import {
  CONTEXTS,
  DEMO_SCENES,
  PHASES,
  SURFACES,
  phaseAvailableForMode,
  surfaceAvailable,
  type DemoSceneId,
} from './videoCalls.scenes';
import { videoCallsWalkthrough } from './videoCallsWalkthrough';
import { stampVideoCallsWalkthroughFocus } from './videoCallsWalkthroughFocus';
import styles from './VideoCalls.module.scss';

/** First name of the person the in-between video states apply to in a group. */
const FOCUS_NAME =
  ROSTER.find((p) => p.id === DM_PEER_ID)?.name.split(' ')[0] ?? 'One person';

export default function VideoCalls() {
  const { setCenterSlot } = usePrototypeChrome();
  const { active: walkthroughActive } = useWalkthrough();
  const { state, participants, actions } = useVideoCallState();
  const { callContext, phase, surface, count, mode, features } = state;
  const [startCallMenuOpen, setStartCallMenuOpen] = useState(false);
  const selfCamera = useSelfCamera(state.media, actions, walkthroughActive);
  const screenShare = useScreenShare(state.sharing, actions, walkthroughActive);

  // Each walkthrough step names a demo scene (a combination of the three axes).
  const onWalkthroughScene = useCallback(
    (next: string, sceneState?: WalkthroughSceneState) => {
      if (DEMO_SCENES.some((d) => d.id === next)) {
        actions.goToDemo(next as DemoSceneId);
      }
      setStartCallMenuOpen(sceneState?.startCallMenu === true);
    },
    [actions],
  );
  useRegisterWalkthrough(videoCallsWalkthrough, {
    onScene: onWalkthroughScene,
  });

  // Stamp focus anchors after each scene paints (widget / window animate in).
  useLayoutEffect(() => {
    if (!walkthroughActive) return;
    let cleanup = stampVideoCallsWalkthroughFocus();
    const t = window.setTimeout(() => {
      cleanup();
      cleanup = stampVideoCallsWalkthroughFocus();
    }, 180);
    return () => {
      window.clearTimeout(t);
      cleanup();
    };
  }, [walkthroughActive, callContext, phase, surface, state.sharing]);

  useEffect(() => {
    if (!walkthroughActive) setStartCallMenuOpen(false);
  }, [walkthroughActive]);

  useEffect(() => {
    if (walkthroughActive) {
      setCenterSlot(null);
      return () => setCenterSlot(null);
    }
    setCenterSlot(
      <div className={styles['video-calls__chrome']}>
        <SceneSwitcher
          scenes={CONTEXTS}
          activeId={callContext}
          onChange={(id) => actions.setContext(id as CallContext)}
          ariaLabel="Conversation"
        />
        <SceneSwitcher
          scenes={PHASES.map((p) => ({
            ...p,
            disabled: !phaseAvailableForMode(mode, callContext, p.id),
          }))}
          activeId={phase}
          onChange={(id) => actions.setPhase(id as CallPhase)}
          ariaLabel="Call phase"
        />
        <SceneSwitcher
          scenes={SURFACES.map((s) => ({
            ...s,
            disabled: !surfaceAvailable(phase, s.id, mode),
          }))}
          activeId={surface}
          onChange={(id) => actions.setSurface(id as CallSurface)}
          ariaLabel="Call surface"
        />
        <ParticipantCountControl
          count={count}
          onChange={actions.setCount}
          disabled={callContext === 'dm'}
        />
        <PrototypeSettings
          skipPreJoin={state.skipPreJoin}
          onSkipPreJoinChange={actions.setSkipPreJoin}
          features={features}
          onFeaturesChange={actions.setFeatures}
          soundOn={state.soundOn}
          onSoundChange={actions.setSoundOn}
          remoteVideo={state.remoteVideo}
          onRemoteVideoChange={actions.setRemoteVideo}
          canSetRemoteVideo={phase === 'active'}
          isDm={callContext === 'dm'}
          canSetMixedVideo={count >= 3}
          focusName={FOCUS_NAME}
          myConnection={state.myConnection}
          onMyConnectionChange={actions.setMyConnection}
          onOpenCallLink={() => actions.startCall({ fromLink: true })}
          canOpenCallLink={phase === 'idle' || phase === 'ongoing'}
        />
      </div>,
    );
    return () => setCenterSlot(null);
  }, [
    callContext,
    phase,
    surface,
    count,
    mode,
    features,
    state.skipPreJoin,
    state.soundOn,
    state.remoteVideo,
    state.myConnection,
    actions,
    setCenterSlot,
    walkthroughActive,
  ]);

  const [settingsOpen, setSettingsOpen] = useState(false);

  const value = useMemo(
    () => ({
      state,
      participants,
      actions,
      selfCamera,
      screenShare,
      startCallMenuOpen,
      settingsOpen,
      setSettingsOpen,
    }),
    [
      state,
      participants,
      actions,
      selfCamera,
      screenShare,
      startCallMenuOpen,
      settingsOpen,
    ],
  );

  // The window hosts every phase except idle, incoming and joining (those are widget-only).
  const showWindow =
    surface === 'window' &&
    phase !== 'idle' &&
    phase !== 'ongoing' &&
    phase !== 'incoming' &&
    phase !== 'joining';
  // The scrim portals into the channels frame (not document.body), so it is
  // clipped to the app layout. The window stays mounted through the fade-out.
  const [frameEl, setFrameEl] = useState<HTMLDivElement | null>(null);
  const windowRendered = useExitAnimation(showWindow, 150).rendered;

  // The window is modeless (the chat stays usable), so no focus trap: focus
  // moves into the window when it opens and returns to the control that
  // opened it when it collapses. The opener (the widget's expand button) is
  // unmounted before this effect runs, so remember the last focused control
  // as it happens and fall back to finding its twin by label afterwards.
  const windowBodyRef = useRef<HTMLDivElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      if (
        e.target instanceof HTMLElement &&
        !windowBodyRef.current?.contains(e.target)
      ) {
        lastFocusRef.current = e.target;
      }
    };
    document.addEventListener('focusin', onFocusIn);
    return () => document.removeEventListener('focusin', onFocusIn);
  }, []);
  // A pending restore from a collapse must not run once the window is back.
  const showWindowRef = useRef(showWindow);
  useEffect(() => {
    showWindowRef.current = showWindow;
  }, [showWindow]);
  useEffect(() => {
    if (!showWindow) return;
    const opener = lastFocusRef.current;
    const openerLabel = opener?.getAttribute('aria-label') ?? null;
    return () => {
      // The widget remounts a moment after the window closes, so retry for
      // a few frames, and never steal focus the person already moved.
      let frames = 0;
      const restore = () => {
        if (showWindowRef.current) return;
        const target =
          opener && opener.isConnected
            ? opener
            : openerLabel
              ? document.querySelector<HTMLElement>(
                  `button[aria-label="${CSS.escape(openerLabel)}"]`,
                )
              : null;
        const active = document.activeElement;
        const focusFree =
          !active ||
          active === document.body ||
          !!active.closest('[role="dialog"][aria-modal="false"]');
        if (!focusFree) return;
        if (target) target.focus({ preventScroll: true });
        else if (++frames < 30) requestAnimationFrame(restore);
      };
      requestAnimationFrame(restore);
    };
  }, [showWindow]);
  const windowOpen = showWindow && windowRendered;
  useEffect(() => {
    if (!windowOpen) return;
    const raf = requestAnimationFrame(() => {
      windowBodyRef.current
        ?.querySelector<HTMLElement>('[role="dialog"]')
        ?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(raf);
  }, [windowOpen]);

  return (
    <VideoCallContext.Provider value={value}>
      <CallPhaseEffects />
      <SelfVoiceActivity walkthroughActive={walkthroughActive} />
      <div
        className={styles['video-calls']}
        data-call-pill={
          phase === 'incoming' || phase === 'joining' || phase === 'active'
            ? 'true'
            : undefined
        }
      >
        <div ref={setFrameEl} className={styles['video-calls__frame']}>
          {/* The conversation stays visible behind the popout window. */}
          <ChatScene widgetHidden={showWindow} />
          <ModalOverlay
            open={showWindow}
            container={frameEl}
            lockScroll={false}
            className={styles['video-calls__scrim']}
            style={{ position: 'absolute' }}
          >
            {windowRendered && (
              <div
                ref={windowBodyRef}
                className={styles['video-calls__window-body']}
              >
                <CallWindowScene />
              </div>
            )}
          </ModalOverlay>
          <UserSettingsModal
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            container={frameEl}
          />
        </div>
      </div>
    </VideoCallContext.Provider>
  );
}
