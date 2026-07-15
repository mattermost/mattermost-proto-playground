import AgentsShell from '@/pages/prototypes/channel-automations/components/AgentsShell';
import AutomationEntitiesIndexView from '@/pages/prototypes/channel-automations/components/AutomationEntitiesIndexView';
import EditAutomationEntityView from '@/pages/prototypes/channel-automations/components/EditAutomationEntityView';
import AutomationDeleteModal from '@/pages/prototypes/channel-automations/components/AutomationDeleteModal';
import type {
  AutomationDraft,
  AutomationEntity,
} from '@/pages/prototypes/channel-automations/channelAutomationsData';

export interface AutomationEntitiesIndexSceneProps {
  entities: AutomationEntity[];
  onSelectEntity: (id: string) => void;
  onNewAutomation: () => void;
  onToggle: (id: string, enabled: boolean) => void;
  onRequestDelete?: (id: string) => void;
  deleteTarget?: AutomationEntity | null;
  onConfirmDelete?: () => void;
  onCloseDelete?: () => void;
  onGoAgents: () => void;
}

export function AutomationEntitiesIndexScene({
  entities,
  onSelectEntity,
  onNewAutomation,
  onToggle,
  onRequestDelete,
  deleteTarget = null,
  onConfirmDelete,
  onCloseDelete,
  onGoAgents,
}: AutomationEntitiesIndexSceneProps) {
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
            automationName={deleteTarget.displayName}
            onConfirm={onConfirmDelete}
            onClose={onCloseDelete}
          />
        ) : null
      }
    >
      <AutomationEntitiesIndexView
        entities={entities}
        onSelectEntity={onSelectEntity}
        onNewAutomation={onNewAutomation}
        onToggle={onToggle}
        onRequestDelete={onRequestDelete}
      />
    </AgentsShell>
  );
}

export interface AutomationEntityEditSceneProps {
  entity: AutomationEntity | null;
  isNew: boolean;
  deleteTarget: AutomationEntity | null;
  onSubmit: (draft: AutomationDraft) => void;
  onClose: () => void;
  onConfirmDelete: () => void;
  onCloseDelete: () => void;
  onGoAgents: () => void;
  progressiveDisclosure?: boolean;
  showOperateWhere?: boolean;
}

export function AutomationEntityEditScene({
  entity,
  isNew,
  deleteTarget,
  onSubmit,
  onClose,
  onConfirmDelete,
  onCloseDelete,
  onGoAgents,
  progressiveDisclosure = false,
  showOperateWhere = false,
}: AutomationEntityEditSceneProps) {
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
            automationName={deleteTarget.displayName}
            onConfirm={onConfirmDelete}
            onClose={onCloseDelete}
          />
        ) : null
      }
    >
      <EditAutomationEntityView
        entity={entity ?? undefined}
        isNew={isNew}
        onSubmit={onSubmit}
        onClose={onClose}
        progressiveDisclosure={progressiveDisclosure}
        showOperateWhere={showOperateWhere}
      />
    </AgentsShell>
  );
}
