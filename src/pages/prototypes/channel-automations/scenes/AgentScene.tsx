import { useState } from 'react';
import type { Automation, AutomationDraft } from '../channelAutomationsData';
import { agentById } from '../channelAutomationsData';
import EditAgentView, {
  type AgentTabKey,
} from '../components/EditAgentView';
import AgentAutomationsTab from '../components/AgentAutomationsTab';
import AgentsShell from '../components/AgentsShell';
import AutomationDeleteModal from '../components/AutomationDeleteModal';
import AutomationFormModal from '../components/AutomationFormModal';
import PlaceholderTab from '../components/PlaceholderTab';

export interface AgentSceneProps {
  agentId: string;
  /** When true, opens the new-automation modal on the Automations tab on mount. */
  openCreateOnMount?: boolean;
  automations: Automation[];
  /** Create from the form. */
  onCreate: (draft: AutomationDraft) => void;
  /** Save edits to an existing automation. */
  onUpdate: (id: string, draft: AutomationDraft) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
  /** Leave the edit-agent view (back / cancel / save). */
  onClose: () => void;
}

type FormState =
  | { mode: 'create' }
  | { mode: 'edit'; automation: Automation }
  | null;

/**
 * Edit Agent scene — the agent settings view whose Automations tab is the
 * second place (alongside the chat RHS) where channel automations are created.
 * Both surfaces write to the same shared automations list.
 */
export default function AgentScene({
  agentId,
  openCreateOnMount = false,
  automations,
  onCreate,
  onUpdate,
  onToggle,
  onDelete,
  onClose,
}: AgentSceneProps) {
  const agent = agentById(agentId);
  const [tab, setTab] = useState<AgentTabKey>('automations');
  const [form, setForm] = useState<FormState>(() =>
    openCreateOnMount ? { mode: 'create' } : null,
  );
  const [deleteTarget, setDeleteTarget] = useState<Automation | null>(null);

  const openEdit = (id: string) => {
    const automation = automations.find((a) => a.id === id);
    if (automation) setForm({ mode: 'edit', automation });
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

  const closeEditor = () => setForm(null);

  const handleSubmit = (draft: AutomationDraft) => {
    if (form?.mode === 'edit') {
      onUpdate(form.automation.id, draft);
    } else {
      onCreate(draft);
    }
    setForm(null);
  };

  return (
    <AgentsShell
      overlay={
        <>
          {form && (
            <AutomationFormModal
              initial={form.mode === 'edit' ? form.automation : undefined}
              onSubmit={handleSubmit}
              onClose={closeEditor}
            />
          )}
          {deleteTarget && (
            <AutomationDeleteModal
              automationName={deleteTarget.name}
              onConfirm={confirmDelete}
              onClose={closeDeleteConfirm}
            />
          )}
        </>
      }
    >
      <EditAgentView
        title={agent ? `Edit ${agent.displayName}` : 'Edit Agent'}
        activeTab={tab}
        onTabChange={setTab}
        onClose={onClose}
        onSave={onClose}
      >
        {tab === 'automations' ? (
          <AgentAutomationsTab
            automations={automations}
            onNew={() => setForm({ mode: 'create' })}
            onEdit={openEdit}
            onToggle={onToggle}
            onRequestDelete={openDeleteConfirm}
          />
        ) : (
          <PlaceholderTab tab={tab} />
        )}
      </EditAgentView>
    </AgentsShell>
  );
}
