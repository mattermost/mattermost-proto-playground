import CallWindowHost from './CallWindowHost';

/**
 * Connected call: `VideoCallWindow` filling the orchestrator frame. Collapse
 * returns to the widget, share swaps in the share layout, Leave hangs up.
 */
export default function CallScene() {
  return <CallWindowHost playJoinSound />;
}
