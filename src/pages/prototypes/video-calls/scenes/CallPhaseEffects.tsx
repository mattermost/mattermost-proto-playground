import { useEffect, useRef } from 'react';
import { playSound, setSoundsEnabled, stopSound } from '../callSounds';
import { useVideoCall } from '../videoCallContext';

/** How long an outgoing call rings before the other person answers (demo). */
const CALLING_ANSWER_MS = 6000;
/** How long an accepted incoming call shows "Joining…" before it is live. */
const JOINING_MS = 1800;
/** How long an incoming call rings before it becomes a missed call. */
const INCOMING_RING_MS = 25000;

/**
 * Surface-independent side effects of the call lifecycle: ring loops and the
 * timers that answer an outgoing call or miss an incoming one. Renders nothing.
 * Lives under the provider so the widget and the window share one behaviour.
 */
export default function CallPhaseEffects() {
  const { state, participants, actions } = useVideoCall();
  const { phase, soundOn } = state;

  useEffect(() => {
    setSoundsEnabled(soundOn);
  }, [soundOn]);

  useEffect(() => {
    if (phase !== 'calling') return;
    const timer = window.setTimeout(actions.connect, CALLING_ANSWER_MS);
    return () => window.clearTimeout(timer);
  }, [phase, actions]);

  // Toggling sounds restarts only the ring, never the lifecycle timer.
  useEffect(() => {
    if (phase !== 'calling') return;
    playSound('ring-outgoing', { loop: true });
    return () => stopSound('ring-outgoing');
  }, [phase, soundOn]);

  useEffect(() => {
    if (phase !== 'incoming') return;
    const timer = window.setTimeout(actions.missIncoming, INCOMING_RING_MS);
    return () => window.clearTimeout(timer);
  }, [phase, actions]);

  useEffect(() => {
    if (phase !== 'joining') return;
    const timer = window.setTimeout(actions.joined, JOINING_MS);
    return () => window.clearTimeout(timer);
  }, [phase, actions]);

  // Toggling sounds restarts only the ring, never the lifecycle timer.
  useEffect(() => {
    if (phase !== 'incoming') return;
    playSound('ring-incoming', { loop: true });
    return () => stopSound('ring-incoming');
  }, [phase, soundOn]);

  // Connecting: you hear join-self, except the DM caller, who just heard the
  // ringback and instead hears join-user when the other person answers (the
  // plugin treats the callee as someone else joining).
  const prevPhase = useRef(phase);
  useEffect(() => {
    const from = prevPhase.current;
    prevPhase.current = phase;
    if (phase !== 'active' || from === 'active') return;
    playSound(from === 'calling' ? 'join-user' : 'join-self');
  }, [phase]);

  // Someone else joining while you are in the call.
  const prevIds = useRef<string[] | null>(null);
  useEffect(() => {
    if (phase !== 'active') {
      prevIds.current = null;
      return;
    }
    const ids = participants.map((p) => p.id);
    const before = prevIds.current;
    prevIds.current = ids;
    if (before && ids.some((id) => !before.includes(id))) {
      playSound('join-user');
    }
  }, [phase, participants]);

  // Leave cue when you hang up (a Leave sets `endedAt`; cancel and decline do not).
  const prevEndedAt = useRef(state.endedAt);
  useEffect(() => {
    if (state.endedAt !== null && state.endedAt !== prevEndedAt.current) {
      playSound('leave');
    }
    prevEndedAt.current = state.endedAt;
  }, [state.endedAt]);

  return null;
}
