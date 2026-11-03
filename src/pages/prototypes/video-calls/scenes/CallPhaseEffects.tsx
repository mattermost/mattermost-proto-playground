import { useEffect, useRef } from 'react';
import { startRingback, stopRingback } from '@/utils/phoneSounds';
import { playSound, setSoundsEnabled, stopSound } from '../callSounds';
import { useVideoCall } from '../videoCallContext';

/** How long an outgoing call rings before the other person answers (demo). */
const CALLING_ANSWER_MS = 6000;
/** How long an accepted incoming call shows "Joining…" before it is live. */
const JOINING_MS = 1800;
/** How long an incoming call rings before it becomes a missed call. */
const INCOMING_RING_MS = 30000;

/**
 * Surface-independent side effects of the call lifecycle: ring loops and the
 * timers that answer an outgoing call or miss an incoming one. Renders nothing.
 * Lives under the provider so the widget and the window share one behaviour.
 */
export default function CallPhaseEffects() {
  const { state, participants, actions } = useVideoCall();
  const { phase, soundOn, removedIds, mode } = state;

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
    // An outbound SIP phone call dials with the phone ringback from the Outbound
    // Calls prototype (the US two-tone cadence); Mattermost calls use the call ringback.
    if (mode === 'phone') {
      if (!soundOn) return;
      startRingback();
      return () => stopRingback();
    }
    playSound('ring-outgoing', { loop: true });
    return () => stopSound('ring-outgoing');
  }, [phase, soundOn, mode]);

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

  // Join / leave notices when the call size changes, whichever surface is
  // showing. A person the host removed already has a "was removed" notice.
  const prevPeople = useRef<{ id: string; name: string }[] | null>(null);
  useEffect(() => {
    if (phase !== 'active') {
      prevPeople.current = null;
      return;
    }
    const people = participants.map((p) => ({ id: p.id, name: p.name }));
    const before = prevPeople.current;
    prevPeople.current = people;
    if (!before) return;
    for (const added of people.filter(
      (p) => !before.some((q) => q.id === p.id),
    )) {
      actions.pushNotice({ kind: 'joined', text: `${added.name} joined` });
    }
    for (const left of before.filter(
      (p) => !people.some((q) => q.id === p.id),
    )) {
      if (removedIds.includes(left.id)) continue;
      actions.pushNotice({
        kind: 'left',
        text: `${left.name} left`,
      });
    }
  }, [phase, participants, removedIds, actions]);

  // On joining: a short hint about your mic, in the widget and the window.
  const micOnRef = useRef(state.media.micOn);
  useEffect(() => {
    micOnRef.current = state.media.micOn;
  });
  useEffect(() => {
    if (phase !== 'active') return;
    actions.pushNotice({
      kind: 'info',
      text: micOnRef.current
        ? "You're unmuted. Select the mic to mute."
        : "You're muted. Select the mic to unmute.",
    });
  }, [phase, actions]);

  // Raising your hand posts a notice on both surfaces.
  const prevHand = useRef(state.handRaised);
  useEffect(() => {
    if (state.handRaised === prevHand.current) return;
    prevHand.current = state.handRaised;
    if (phase !== 'active' || !state.handRaised) return;
    actions.pushNotice({ kind: 'raised-hand', text: 'You' });
  }, [state.handRaised, phase, actions]);

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
