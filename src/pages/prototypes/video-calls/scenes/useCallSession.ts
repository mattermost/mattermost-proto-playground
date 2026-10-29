import { useEffect } from 'react';
import { setSoundsEnabled } from '../callSounds';
import { useCallTimer } from '../hooks/useCallTimer';
import { useVideoCall } from '../videoCallContext';

/**
 * Shared wiring for the in-call scenes (call, screen-share, minimized):
 * guarantees a call start time (SceneSwitcher can land here without going
 * through connect), keeps the sound flag in sync and exposes the elapsed label.
 */
export function useCallSession() {
  const ctx = useVideoCall();
  const { state, actions } = ctx;
  const { label: elapsedLabel } = useCallTimer(state.callStartedAt);

  useEffect(() => {
    if (state.callStartedAt === null) {
      actions.patch({ callStartedAt: Date.now() });
    }
  }, [state.callStartedAt, actions]);

  useEffect(() => {
    setSoundsEnabled(state.soundOn);
  }, [state.soundOn]);

  return { ...ctx, elapsedLabel };
}
