import { useState } from 'react';
import type { Automation, AutomationDraft } from '../channelAutomationsData';
import { agentById } from '../channelAutomationsData';
import EditAgentView, {
  type AgentTabKey,
} from '../components/EditAgentView';
import AgentAutomationsTab from '../components/AgentAutomationsTab';
import AgentsShell from '../components/AgentsShell';
import AutomationFormEditor from '../components/AutomationFormEditor';
import PlaceholderTab from '../components/PlaceholderTab';

export interface AgentSceneProps {
  agentId: string;
  automations: Automation[];
  /** Create from the form. */
  onCreate: (draft: AutomationDraft) => void;
  /** Save edits to an existing automation. */
  onUpdate: (id: string, draft: AutomationDraft) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onDuplicate: (id: string) => void;
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
  automations,
  onCreate,
  onUpdate,
  onToggle,
  onDuplicate,
  onDelete,
  onClose,
}: AgentSceneProps) {
  const agent = agentById(agentId);
  const [tab, setTab] = useState<AgentTabKey>('automations');
  const [form, setForm] = useState<FormState>(null);

  const inEditor = form != null;

  const openEdit = (id: string) => {
    const automation = automations.find((a) => a.id === id);
    if (automation) setForm({ mode: 'edit', automation });
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
    <AgentsShell>
      <EditAgentView
        title={agent ? `Edit ${agent.displayName}` : 'Edit Agent'}
        activeTab={tab}
        onTabChange={setTab}
        onClose={onClose}
        onSave={onClose}
        subview={
          inEditor
            ? {
                title:
                  form.mode === 'edit' ? 'Edit automation' : 'New automation',
                onBack: closeEditor,
              }
            : undefined
        }
        fillBody={inEditor}
        hideFooter={inEditor}
      >
        {tab === 'automations' ? (
          inEditor ? (
            <AutomationFormEditor
              initial={form.mode === 'edit' ? form.automation : undefined}
              onSubmit={handleSubmit}
              onCancel={closeEditor}
            />
          ) : (
            <AgentAutomationsTab
              automations={automations}
              onNew={() => setForm({ mode: 'create' })}
              onEdit={openEdit}
              onToggle={onToggle}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
          )
        ) : (
          <PlaceholderTab tab={tab} />
        )}
      </EditAgentView>
    </AgentsShell>
  );
}
