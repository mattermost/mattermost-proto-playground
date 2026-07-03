import AgentsShell from '@/pages/prototypes/channel-automations/components/AgentsShell';
import AutomationEditView from '@/pages/prototypes/channel-automations/components/AutomationEditView';
import AutomationsIndexView from '@/pages/prototypes/channel-automations/components/AutomationsIndexView';
import AutomationDeleteModal from '@/pages/prototypes/channel-automations/components/AutomationDeleteModal';
import type { Automation, AutomationDraft } from '@/pages/prototypes/channel-automations/channelAutomationsData';

export interface AutomationsIndexSceneProps {
  automations: Automation[];
  onSelectAutomation: (id: string) => void;
  onNewAutomation: () => void;
  onToggle: (id: string, enabled: boolean) => void;
  onRequestDelete?: (id: string) => void;
  deleteTarget?: Automation | null;
  onConfirmDelete?: () => void;
  onCloseDelete?: () => void;
  onGoAgents: () => void;
}

export function AutomationsIndexScene({
  automations,
  onSelectAutomation,
  onNewAutomation,
  onToggle,
  onRequestDelete,
  deleteTarget = null,
  onConfirmDelete,
  onCloseDelete,
  onGoAgents,
}: AutomationsIndexSceneProps) {
  return (
    <AgentsShell
      flushContent
      productNav={{
        active: 'automations',
        onChange: (tab) => {
          if (tab === 'agents') onGoAgents();
        },
      }}
      overlay={
        deleteTarget && onConfirmDelete && onCloseDelete ? (
          <AutomationDeleteModal
            automationName={deleteTarget.name}
            onConfirm={onConfirmDelete}
            onClose={onCloseDelete}
          />
        ) : null
      }
    >
      <AutomationsIndexView
        automations={automations}
        onSelectAutomation={onSelectAutomation}
        onNewAutomation={onNewAutomation}
        onToggle={onToggle}
        onRequestDelete={onRequestDelete}
        showAgent
      />
    </AgentsShell>
  );
}

export interface AutomationEditSceneProps {
  automation: Automation | null;
  isNew: boolean;
  deleteTarget: Automation | null;
  onSubmit: (draft: AutomationDraft) => void;
  onClose: () => void;
  onConfirmDelete: () => void;
  onCloseDelete: () => void;
  onGoAgents: () => void;
}

export function AutomationEditScene({
  automation,
  isNew,
  deleteTarget,
  onSubmit,
  onClose,
  onConfirmDelete,
  onCloseDelete,
  onGoAgents,
}: AutomationEditSceneProps) {
  return (
    <AgentsShell
      productNav={{
        active: 'automations',
        onChange: (tab) => {
          if (tab === 'agents') onGoAgents();
        },
      }}
      overlay={
        deleteTarget ? (
          <AutomationDeleteModal
            automationName={deleteTarget.name}
            onConfirm={onConfirmDelete}
            onClose={onCloseDelete}
          />
        ) : null
      }
    >
      <AutomationEditView
        initial={automation ?? undefined}
        isNew={isNew}
        onSubmit={onSubmit}
        onClose={onClose}
        showAgentPicker
      />
    </AgentsShell>
  );
}
