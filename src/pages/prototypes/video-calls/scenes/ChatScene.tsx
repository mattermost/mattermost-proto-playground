import { useVideoCall } from '../videoCallContext';
import CallWidgetHost from './CallWidgetHost';
import DMChat from './DMChat';
import GroupChat from './GroupChat';

/**
 * The conversation (DM, group DM or channel) with the call widget floating
 * over the sidebar whenever a call is in progress on the widget surface.
 */
export default function ChatScene() {
  const { state } = useVideoCall();
  const widget = state.phase === 'idle' ? undefined : <CallWidgetHost />;

  if (state.callContext === 'dm') return <DMChat floating={widget} />;
  return <GroupChat kind={state.callContext} floating={widget} />;
}
