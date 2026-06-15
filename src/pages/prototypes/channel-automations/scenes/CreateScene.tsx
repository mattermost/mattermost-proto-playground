import AutomationsShell from '../components/AutomationsShell';
import AgentsPanel from '../components/AgentsPanel';
import ScriptedAgentConversation from '../components/ScriptedAgentConversation';
import type { Automation, AutomationType } from '../channelAutomationsData';
import type { HeaderEntryPoint } from '../channelAutomationsScenes';

export interface CreateSceneProps {
  automations: Automation[];
  headerEntryPoint: HeaderEntryPoint;
  showAlternates: boolean;
  /** Re-entering the create flow from a header/menu entry point. */
  onCreate: (type?: AutomationType) => void;
  /** Add the scripted automation to the managed list. */
  onAddAutomation: () => void;
  onManage: () => void;
  onClose: () => void;
}

/**
 * Create scene — the Agents RHS runs the scripted builder conversation; on
 * finish it adds a real automation and links to the management surface.
 */
export default function CreateScene({
  automations,
  headerEntryPoint,
  showAlternates,
  onCreate,
  onAddAutomation,
  onManage,
  onClose,
}: CreateSceneProps) {
  return (
    <AutomationsShell
      automations={automations}
      headerEntryPoint={headerEntryPoint}
      showAlternates={showAlternates}
      onCreate={onCreate}
      onOpenManage={onManage}
      rhs={
        <AgentsPanel onClose={onClose}>
          <ScriptedAgentConversation
            onCreate={onAddAutomation}
            onViewAutomations={onManage}
          />
        </AgentsPanel>
      }
    />
  );
}
