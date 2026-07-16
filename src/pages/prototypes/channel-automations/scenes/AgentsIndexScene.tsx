import { useState } from 'react';
import { AGENTS, agentById } from '../channelAutomationsData';
import AgentsIndexView from '../components/AgentsIndexView';
import AgentsShell from '../components/AgentsShell';
import AutomationDeleteModal from '../components/AutomationDeleteModal';

export interface AgentsIndexSceneProps {
  onSelectAgent: (id: string) => void;
  onNewAgent: () => void;
  onGoAutomations?: () => void;
}

export default function AgentsIndexScene({
  onSelectAgent,
  onNewAgent,
  onGoAutomations,
}: AgentsIndexSceneProps) {
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const deleteTarget =
    deleteTargetId != null ? agentById(deleteTargetId) : undefined;

  return (
    <AgentsShell
      flushContent
      productNav={
        onGoAutomations
          ? {
              active: 'agents',
              onChange: (tab) => {
                if (tab === 'automations') onGoAutomations();
              },
            }
          : undefined
      }
      overlay={
        deleteTarget ? (
          <AutomationDeleteModal
            automationName={deleteTarget.displayName}
            onConfirm={() => setDeleteTargetId(null)}
            onClose={() => setDeleteTargetId(null)}
          />
        ) : null
      }
    >
      <AgentsIndexView
        agents={AGENTS}
        onSelectAgent={onSelectAgent}
        onNewAgent={onNewAgent}
        onRequestDelete={setDeleteTargetId}
      />
    </AgentsShell>
  );
}
