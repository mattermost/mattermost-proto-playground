import CallWindowHost from './CallWindowHost';

/**
 * Connected call: `VideoCallWindow` filling the orchestrator frame. Collapse goes
 * to `minimized`, share to `screen-share`, Leave to `ended` (all via actions).
 */
export default function CallScene() {
  return <CallWindowHost playJoinSound />;
}
