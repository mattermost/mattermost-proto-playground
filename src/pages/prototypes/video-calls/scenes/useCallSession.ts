import { useCallTimer } from '../hooks/useCallTimer';
import { useVideoCall } from '../videoCallContext';

/**
 * Shared wiring for the live-call surfaces (widget and window): the call
 * context plus the elapsed-time label. Call start time is set by the state
 * actions and ring/sound effects live in `CallPhaseEffects`.
 */
export function useCallSession() {
  const ctx = useVideoCall();
  const { label: elapsedLabel } = useCallTimer(ctx.state.callStartedAt);
  return { ...ctx, elapsedLabel };
}
