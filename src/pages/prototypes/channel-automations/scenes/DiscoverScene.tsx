import { useState } from 'react';
import type { AutomationDraft, AutomationType } from '../channelAutomationsData';
import AutomationsShell from '../components/AutomationsShell';
import AgentsPanel from '../components/AgentsPanel';
import AgentsEmptyState from '../components/AgentsEmptyState';
import AutomationsPanel from '../components/AutomationsPanel';

export interface DiscoverSceneProps {
  onCreateAutomation: (draft: AutomationDraft) => void;
  onManage: () => void;
  onManageAgents: () => void;
}

/** Discover scene — channel with the Agents menu and RHS empty-state CTA. */
export default function DiscoverScene({
  onCreateAutomation,
  onManage,
  onManageAgents,
}: DiscoverSceneProps) {
  const [agentsOpen, setAgentsOpen] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createType, setCreateType] = useState<AutomationType | undefined>();

  const openCreate = (type?: AutomationType) => {
    setCreateType(type);
    setCreating(true);
  };
  const closeCreate = () => {
    setCreating(false);
    setCreateType(undefined);
  };

  const rhs = !agentsOpen
    ? undefined
    : creating
      ? (
          <AutomationsPanel
            automations={[]}
            creating
            createType={createType}
            onBackFromEditor={closeCreate}
            onCreateSubmit={(draft) => {
              onCreateAutomation(draft);
              closeCreate();
            }}
            onClose={() => setAgentsOpen(false)}
            onCreate={openCreate}
            onToggle={() => {}}
            onEdit={() => {}}
            onRequestDelete={() => {}}
          />
        )
      : (
          <AgentsPanel
            onClose={() => setAgentsOpen(false)}
            onViewAutomations={onManage}
          >
            <AgentsEmptyState onCreate={() => openCreate()} />
          </AgentsPanel>
        );

  return (
    <AutomationsShell
      onCreate={openCreate}
      onOpenManage={onManage}
      onManageAgents={onManageAgents}
      rhs={rhs}
    />
  );
}
