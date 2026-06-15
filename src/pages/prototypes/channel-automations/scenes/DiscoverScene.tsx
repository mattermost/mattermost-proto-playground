import { useState } from 'react';
import AutomationsShell from '../components/AutomationsShell';
import AgentsPanel from '../components/AgentsPanel';
import AgentsEmptyState from '../components/AgentsEmptyState';
import type { Automation, AutomationType } from '../channelAutomationsData';
import type { HeaderEntryPoint } from '../channelAutomationsScenes';

export interface DiscoverSceneProps {
  automations: Automation[];
  headerEntryPoint: HeaderEntryPoint;
  showAlternates: boolean;
  onCreate: (type?: AutomationType) => void;
  onManage: () => void;
}

/**
 * Discover scene — the channel with the three featured entry points live
 * (header Agents menu, automations count icon, Agents RHS empty-state CTA),
 * plus the toggleable alternates.
 */
export default function DiscoverScene({
  automations,
  headerEntryPoint,
  showAlternates,
  onCreate,
  onManage,
}: DiscoverSceneProps) {
  const [agentsOpen, setAgentsOpen] = useState(true);

  return (
    <AutomationsShell
      automations={automations}
      headerEntryPoint={headerEntryPoint}
      showAlternates={showAlternates}
      onCreate={onCreate}
      onOpenManage={onManage}
      rhs={
        agentsOpen ? (
          <AgentsPanel onClose={() => setAgentsOpen(false)}>
            <AgentsEmptyState onCreate={() => onCreate()} />
          </AgentsPanel>
        ) : undefined
      }
    />
  );
}
