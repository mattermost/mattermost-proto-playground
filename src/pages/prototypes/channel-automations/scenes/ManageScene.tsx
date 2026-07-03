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
  const [creating, setCreating] = useState(false);
  const [createType, setCreateType] = useState<AutomationType | undefined>();
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
    setEditingId(null);
  };

  const openCreate = (type?: AutomationType) => {
    setEditingId(null);
    setCreateType(type);
    setCreating(true);
  };

  const openEdit = (id: string) => {
    setCreating(false);
    setCreateType(undefined);
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
      onCreate={openCreate}
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
          editing={editingEntity ? null : editing}
          editingEntity={editingEntity}
          onBackFromEditor={closeEditor}
          onCreateSubmit={onCreateAutomation}
          onUpdate={onUpdate}
          onBack={onBack}
          onClose={onClose}
          onCreate={openCreate}
          onToggle={onToggle}
          onEdit={openEdit}
          onRequestDelete={openDeleteConfirm}
          {...panelOptions}
        />
      }
    />
  );
}
