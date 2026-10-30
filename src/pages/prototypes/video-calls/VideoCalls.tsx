import { useEffect, useMemo } from 'react';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import { useWalkthrough } from '@/walkthrough';
import type { CallContext, CallPhase, CallSurface } from '@/types/videoCall';
import ParticipantCountControl from './chrome/ParticipantCountControl';
import SoundToggle from './chrome/SoundToggle';
import CallPhaseEffects from './scenes/CallPhaseEffects';
import CallWindowScene from './scenes/CallWindowScene';
import ChatScene from './scenes/ChatScene';
import { useSelfCamera } from './useSelfCamera';
import { useVideoCallState } from './useVideoCallState';
import { VideoCallContext } from './videoCallContext';
import {
  CONTEXTS,
  PHASES,
  SURFACES,
  phaseAvailable,
  surfaceAvailable,
} from './videoCalls.scenes';
import styles from './VideoCalls.module.scss';

export default function VideoCalls() {
  const { setCenterSlot } = usePrototypeChrome();
  const { active: walkthroughActive } = useWalkthrough();
  const { state, participants, actions } = useVideoCallState();
  const { callContext, phase, surface, count } = state;
  const selfCamera = useSelfCamera(state.media, actions, walkthroughActive);

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
          scenes={PHASES.filter((p) => phaseAvailable(callContext, p.id))}
          activeId={phase}
          onChange={(id) => actions.setPhase(id as CallPhase)}
          ariaLabel="Call phase"
        />
        <SceneSwitcher
          scenes={SURFACES.filter((s) => surfaceAvailable(phase, s.id))}
          activeId={surface}
          onChange={(id) => actions.setSurface(id as CallSurface)}
          ariaLabel="Call surface"
        />
        <ParticipantCountControl
          count={count}
          onChange={actions.setCount}
          disabled={callContext === 'dm'}
        />
        <SoundToggle on={state.soundOn} onChange={actions.setSoundOn} />
      </div>,
    );
    return () => setCenterSlot(null);
  }, [
    callContext,
    phase,
    surface,
    count,
    state.soundOn,
    actions,
    setCenterSlot,
    walkthroughActive,
  ]);

  const value = useMemo(
    () => ({ state, participants, actions, selfCamera }),
    [state, participants, actions, selfCamera],
  );

  // The window hosts every phase except idle and incoming (those are widget-only).
  const showWindow =
    surface === 'window' && phase !== 'idle' && phase !== 'incoming';

  return (
    <VideoCallContext.Provider value={value}>
      <CallPhaseEffects />
      <div className={styles['video-calls']}>
        <div className={styles['video-calls__frame']}>
          {/* The conversation stays visible behind the popout window. */}
          <ChatScene widgetHidden={showWindow} />
          {showWindow && (
            <div className={styles['video-calls__window']}>
              <CallWindowScene />
            </div>
          )}
        </div>
      </div>
    </VideoCallContext.Provider>
  );
}
