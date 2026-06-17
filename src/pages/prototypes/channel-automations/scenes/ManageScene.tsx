import { useState } from 'react';
import AutomationsShell from '../components/AutomationsShell';
import AutomationsPanel from '../components/AutomationsPanel';
import AutomationDeleteModal from '../components/AutomationDeleteModal';
import type {
  Automation,
  AutomationDraft,
} from '../channelAutomationsData';

export interface ManageSceneProps {
  automations: Automation[];
  onCreateAutomation: (draft: AutomationDraft) => void;
  onUpdate: (id: string, draft: AutomationDraft) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
  /** Return to the agents-panel scene the management view was opened from. */
  onBack: () => void;
  onClose: () => void;
  onManageAgents: () => void;
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
}: ManageSceneProps) {
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Automation | null>(null);
  const editing =
    editingId != null
      ? automations.find((a) => a.id === editingId) ?? null
      : null;

  const closeEditor = () => {
    setCreating(false);
    setEditingId(null);
  };

  const openCreate = () => {
    setEditingId(null);
    setCreating(true);
  };

  const openEdit = (id: string) => {
    setCreating(false);
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
          editing={editing}
          onBackFromEditor={closeEditor}
          onCreateSubmit={onCreateAutomation}
          onUpdate={onUpdate}
          onBack={onBack}
          onClose={onClose}
          onCreate={openCreate}
          onToggle={onToggle}
          onEdit={openEdit}
          onRequestDelete={openDeleteConfirm}
        />
      }
    />
  );
}
