import type { AutomationDraft } from '../channelAutomationsData';
import AutomationsShell from '../components/AutomationsShell';
import AutomationsPanel from '../components/AutomationsPanel';

export interface CreateSceneProps {
  onCreateAutomation: (draft: AutomationDraft) => void;
  onManage: () => void;
  onManageAgents: () => void;
  onClose: () => void;
}

/**
 * Create scene — opens the inline automation editor in the RHS, matching the
 * manage and discover create flows.
 */
export default function CreateScene({
  onCreateAutomation,
  onManage,
  onManageAgents,
  onClose,
}: CreateSceneProps) {
  return (
    <AutomationsShell
      onCreate={() => {}}
      onOpenManage={onManage}
      onManageAgents={onManageAgents}
      rhs={
        <AutomationsPanel
          automations={[]}
          creating
          onBackFromEditor={onClose}
          onCreateSubmit={(draft) => {
            onCreateAutomation(draft);
            onClose();
          }}
          onClose={onClose}
          onCreate={() => {}}
          onToggle={() => {}}
          onEdit={() => {}}
          onRequestDelete={() => {}}
        />
      }
    />
  );
}
