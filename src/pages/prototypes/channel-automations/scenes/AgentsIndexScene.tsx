import { AGENTS } from '../channelAutomationsData';
import AgentsIndexView from '../components/AgentsIndexView';
import AgentsShell from '../components/AgentsShell';

export interface AgentsIndexSceneProps {
  onSelectAgent: (id: string) => void;
  onNewAutomation: (agentId: string) => void;
}

/**
 * Agents product index scene — the standalone Agents shell with the main agent
 * listing.
 */
export default function AgentsIndexScene({
  onSelectAgent,
  onNewAutomation,
}: AgentsIndexSceneProps) {
  return (
    <AgentsShell flushContent>
      <AgentsIndexView
        agents={AGENTS}
        onSelectAgent={onSelectAgent}
        onNewAutomation={onNewAutomation}
      />
    </AgentsShell>
  );
}
