import { useState } from 'react';
import type { AutomationDraft, AutomationType } from '../channelAutomationsData';
import type { AutomationsPanelOptions } from '../panelOptions';
import AutomationsShell from '../components/AutomationsShell';
import AgentsPanel from '../components/AgentsPanel';
import AgentsEmptyState from '../components/AgentsEmptyState';
import AutomationsPanel from '../components/AutomationsPanel';
import ChooseAgentPrompt from '../components/ChooseAgentPrompt';

export interface DiscoverSceneProps {
  onCreateAutomation: (draft: AutomationDraft) => void;
  onManage: () => void;
  onManageAgents: () => void;
  panelOptions?: AutomationsPanelOptions;
  automations?: import('../channelAutomationsData').Automation[];
}

/** Discover scene — channel with the Agents menu and RHS empty-state CTA. */
export default function DiscoverScene({
  onCreateAutomation,
  onManage,
  onManageAgents,
  panelOptions,
  automations = [],
}: DiscoverSceneProps) {
  const requireAgent = panelOptions?.showAgentPicker ?? false;
  const [agentsOpen, setAgentsOpen] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createType, setCreateType] = useState<AutomationType | undefined>();
  const [creatingContextAgentId, setCreatingContextAgentId] = useState<
    string | undefined
  >();
  const [agentPickerForCreate, setAgentPickerForCreate] = useState<{
    type?: AutomationType;
  } | null>(null);

  const openCreate = (type?: AutomationType, agentId?: string) => {
    setCreateType(type);
    setCreatingContextAgentId(agentId);
    setCreating(true);
    setAgentPickerForCreate(null);
  };

  const closeCreate = () => {
    setCreating(false);
    setCreateType(undefined);
    setCreatingContextAgentId(undefined);
  };

  const requestCreate = (type?: AutomationType, agentId?: string) => {
    if (agentId || !requireAgent) {
      openCreate(type, agentId);
      return;
    }
    setAgentPickerForCreate({ type });
    setAgentsOpen(true);
  };

  const completeAgentPick = (agentId: string) => {
    openCreate(agentPickerForCreate?.type, agentId);
  };

  const rhs = !agentsOpen
    ? undefined
    : creating
      ? (
          <AutomationsPanel
            automations={automations}
            creating
            createType={createType}
            creatingContextAgentId={creatingContextAgentId}
            onBackFromEditor={closeCreate}
            onCreateSubmit={(draft) => {
              onCreateAutomation(draft);
              closeCreate();
            }}
            onClose={() => setAgentsOpen(false)}
            onCreate={requestCreate}
            onToggle={() => {}}
            onEdit={() => {}}
            onRequestDelete={() => {}}
            {...panelOptions}
            editorKind={panelOptions?.editorKind ?? 'assignment'}
          />
        )
      : (
          <AgentsPanel
            onClose={() => setAgentsOpen(false)}
            onViewAutomations={onManage}
          >
            {agentPickerForCreate ? (
              <ChooseAgentPrompt
                onSelectAgent={completeAgentPick}
                onCancel={() => setAgentPickerForCreate(null)}
              />
            ) : (
              <AgentsEmptyState
                onCreateForAgent={
                  requireAgent ? (agentId) => openCreate(undefined, agentId) : undefined
                }
                onCreate={requireAgent ? undefined : () => openCreate()}
              />
            )}
          </AgentsPanel>
        );

  return (
    <AutomationsShell
      onCreate={requestCreate}
      onOpenManage={onManage}
      onManageAgents={onManageAgents}
      rhs={rhs}
    />
  );
}
