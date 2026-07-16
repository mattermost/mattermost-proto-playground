import { useState } from 'react';
import { NEW_AGENT_DRAFT, agentById } from '../channelAutomationsData';
import EditAgentView, { type AgentTabKey } from '../components/EditAgentView';
import AccessTab from '../components/AccessTab';
import AgentSettingsTab from '../components/AgentSettingsTab';
import AgentsShell from '../components/AgentsShell';
import McpsTab from '../components/McpsTab';
import PlaceholderTab from '../components/PlaceholderTab';

export interface AgentSceneProps {
  agentId: string;
  isNew?: boolean;
  onClose: () => void;
  onGoAutomations?: () => void;
}

export default function AgentScene({
  agentId,
  isNew = false,
  onClose,
  onGoAutomations,
}: AgentSceneProps) {
  const agent = isNew ? NEW_AGENT_DRAFT : agentById(agentId);
  const [tab, setTab] = useState<AgentTabKey>('configuration');

  return (
    <AgentsShell
      flushContent
      productNav={
        onGoAutomations
          ? {
              active: 'agents',
              onChange: (navTab) => {
                if (navTab === 'automations') onGoAutomations();
              },
            }
          : undefined
      }
    >
      <EditAgentView
        title={
          isNew
            ? 'New agent'
            : agent
              ? `Edit ${agent.displayName}`
              : 'Edit Agent'
        }
        activeTab={tab}
        onTabChange={setTab}
        onClose={onClose}
        onSave={onClose}
      >
        {tab === 'access' ? (
          <AccessTab />
        ) : tab === 'mcps' ? (
          <McpsTab
            activeMcps={agent?.activeMcps}
            toolCount={agent?.toolCount}
          />
        ) : tab === 'configuration' ? (
          agent ? (
            <AgentSettingsTab agent={agent} usernameEditable={isNew} />
          ) : (
            <PlaceholderTab tab={tab} />
          )
        ) : null}
      </EditAgentView>
    </AgentsShell>
  );
}
