import { useExitAnimation } from '@/hooks/useExitAnimation';
import { useVideoCall } from '../videoCallContext';
import CallWidgetHost from './CallWidgetHost';
import DMChat from './DMChat';
import GroupChat from './GroupChat';

const WIDGET_EXIT_MS = 150;

/**
 * The conversation (DM, group DM or channel) with the call widget floating
 * over the sidebar whenever a call is in progress on the widget surface. The
 * widget stays mounted through its exit animation after the call ends.
 */
export default function ChatScene() {
  const { state } = useVideoCall();
  const { rendered, exiting } = useExitAnimation(
    state.phase !== 'idle',
    WIDGET_EXIT_MS,
  );
  const widget = rendered ? <CallWidgetHost exiting={exiting} /> : undefined;

  if (state.callContext === 'dm') return <DMChat floating={widget} />;
  return <GroupChat kind={state.callContext} floating={widget} />;
}
