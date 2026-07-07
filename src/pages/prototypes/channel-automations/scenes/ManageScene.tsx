import { useState } from 'react';
import AutomationsShell from '../components/AutomationsShell';
import AutomationsPanel from '../components/AutomationsPanel';
import AutomationDeleteModal from '../components/AutomationDeleteModal';
import type {
  Automation,
  AutomationDraft,
  AutomationType,
} from '../channelAutomationsData';
import type { AutomationsPanelOptions } from '../panelOptions';

export interface ManageSceneProps {
  automations: Automation[];
  onCreateAutomation: (draft: AutomationDraft) => void;
  onUpdate: (id: string, draft: AutomationDraft) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
  onClose: () => void;
  onManageAgents: () => void;
  panelOptions?: AutomationsPanelOptions;
  getEditingEntity?: (id: string) => import('../channelAutomationsData').AutomationEntity | null;
}

/** Manage scene — the management list in the RHS panel. */
export default function ManageScene({
  automations,
  onCreateAutomation,
  onUpdate,
  onToggle,
  onDelete,
  onBack,
  onClose,
  onManageAgents,
  panelOptions,
  getEditingEntity,
}: ManageSceneProps) {
  const requireAgent = panelOptions?.showAgentPicker ?? false;
  const [creating, setCreating] = useState(false);
  const [createType, setCreateType] = useState<AutomationType | undefined>();
  const [creatingContextAgentId, setCreatingContextAgentId] = useState<
    string | undefined
  >();
  const [agentPickerForCreate, setAgentPickerForCreate] = useState<{
    type?: AutomationType;
  } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Automation | null>(null);
  const editing =
    editingId != null
      ? automations.find((a) => a.id === editingId) ?? null
      : null;
  const editingEntity =
    editingId != null && getEditingEntity
      ? getEditingEntity(editingId)
      : null;

  const closeEditor = () => {
    setCreating(false);
    setCreateType(undefined);
    setCreatingContextAgentId(undefined);
    setEditingId(null);
  };

  const openCreate = (type?: AutomationType, agentId?: string) => {
    setEditingId(null);
    setCreateType(type);
    setCreatingContextAgentId(agentId);
    setCreating(true);
    setAgentPickerForCreate(null);
  };

  const requestCreate = (type?: AutomationType, agentId?: string) => {
    if (agentId || !requireAgent) {
      openCreate(type, agentId);
      return;
    }
    setAgentPickerForCreate({ type });
  };

  const completeAgentPick = (agentId: string) => {
    openCreate(agentPickerForCreate?.type, agentId);
  };

  const openEdit = (id: string) => {
    setCreating(false);
    setCreateType(undefined);
    setCreatingContextAgentId(undefined);
    setAgentPickerForCreate(null);
    setEditingId(id);
  };

  const openDeleteConfirm = (id: string) => {
    const automation = automations.find((a) => a.id === id);
    if (automation) setDeleteTarget(automation);
  };

  const closeDeleteConfirm = () => setDeleteTarget(null);

  const confirmDelete = () => {
    if (deleteTarget) {
      onDelete(deleteTarget.id);
    }
    closeDeleteConfirm();
  };

  return (
    <AutomationsShell
      onCreate={requestCreate}
      onOpenManage={() => {}}
      onManageAgents={onManageAgents}
      overlay={
        deleteTarget && (
          <AutomationDeleteModal
            automationName={deleteTarget.name}
            onConfirm={confirmDelete}
            onClose={closeDeleteConfirm}
          />
        )
      }
      rhs={
        <AutomationsPanel
          automations={automations}
          creating={creating}
          createType={createType}
          creatingContextAgentId={creatingContextAgentId}
          agentPickerMode={
            agentPickerForCreate
              ? {
                  onSelectAgent: completeAgentPick,
                  onCancel: () => setAgentPickerForCreate(null),
                }
              : null
          }
          editing={editingEntity ? null : editing}
          editingEntity={editingEntity}
          onBackFromEditor={closeEditor}
          onCreateSubmit={onCreateAutomation}
          onUpdate={onUpdate}
          onBack={onBack}
          onClose={onClose}
          onCreate={requestCreate}
          onToggle={onToggle}
          onEdit={openEdit}
          onRequestDelete={openDeleteConfirm}
          {...panelOptions}
          editorKind={panelOptions?.editorKind ?? 'assignment'}
          showAgentSelector={panelOptions?.showAgentSelector ?? false}
          showAgentPicker={panelOptions?.showAgentPicker ?? false}
        />
      }
    />
  );
}
