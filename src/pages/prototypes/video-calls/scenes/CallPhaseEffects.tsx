import { useEffect } from 'react';
import { playSound, setSoundsEnabled, stopSound } from '../callSounds';
import { useVideoCall } from '../videoCallContext';

/** How long an outgoing call rings before the other person answers (demo). */
const CALLING_ANSWER_MS = 6000;
/** How long an incoming call rings before it becomes a missed call. */
const INCOMING_RING_MS = 25000;

/**
 * Surface-independent side effects of the call lifecycle: ring loops and the
 * timers that answer an outgoing call or miss an incoming one. Renders nothing.
 * Lives under the provider so the widget and the window share one behaviour.
 */
export default function CallPhaseEffects() {
  const { state, actions } = useVideoCall();
  const { phase, soundOn } = state;

  useEffect(() => {
    setSoundsEnabled(soundOn);
  }, [soundOn]);

  useEffect(() => {
    if (phase !== 'calling') return;
    playSound('ring-outgoing', { loop: true });
    const timer = window.setTimeout(actions.connect, CALLING_ANSWER_MS);
    return () => {
      window.clearTimeout(timer);
      stopSound('ring-outgoing');
    };
  }, [phase, soundOn, actions]);

  useEffect(() => {
    if (phase !== 'incoming') return;
    playSound('ring-incoming', { loop: true });
    const timer = window.setTimeout(actions.missIncoming, INCOMING_RING_MS);
    return () => {
      window.clearTimeout(timer);
      stopSound('ring-incoming');
    };
  }, [phase, soundOn, actions]);

  return null;
}
