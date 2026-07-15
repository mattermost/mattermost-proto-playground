import { useState } from 'react';
import type { Automation, AutomationDraft } from '../channelAutomationsData';
import {
  agentById,
  automationsForAgent,
} from '../channelAutomationsData';
import EditAgentView, { type AgentTabKey } from '../components/EditAgentView';
import AccessTab from '../components/AccessTab';
import AgentAutomationsTab from '../components/AgentAutomationsTab';
import AgentSettingsTab from '../components/AgentSettingsTab';
import AgentsShell from '../components/AgentsShell';
import AutomationDeleteModal from '../components/AutomationDeleteModal';
import AutomationFormModal from '../components/AutomationFormModal';
import McpsTab from '../components/McpsTab';
import PlaceholderTab from '../components/PlaceholderTab';

export interface AgentSceneProps {
  agentId: string;
  openCreateOnMount?: boolean;
  automations: Automation[];
  onCreate: (draft: AutomationDraft) => void;
  onUpdate: (id: string, draft: AutomationDraft) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  showAutomationsTab?: boolean;
  onGoAutomations?: () => void;
}

type FormState =
  | { mode: 'create' }
  | { mode: 'edit'; automation: Automation }
  | null;

export default function AgentScene({
  agentId,
  openCreateOnMount = false,
  automations,
  onCreate,
  onUpdate,
  onToggle,
  onDelete,
  onClose,
  showAutomationsTab = true,
  onGoAutomations,
}: AgentSceneProps) {
  const agent = agentById(agentId);
  const agentAutomations = automationsForAgent(automations, agentId);
  const [tab, setTab] = useState<AgentTabKey>(
    showAutomationsTab ? 'automations' : 'configuration',
  );
  const [form, setForm] = useState<FormState>(() =>
    openCreateOnMount && showAutomationsTab ? { mode: 'create' } : null,
  );
  const [deleteTarget, setDeleteTarget] = useState<Automation | null>(null);

  const openEdit = (id: string) => {
    const automation = agentAutomations.find((a) => a.id === id);
    if (automation) setForm({ mode: 'edit', automation });
  };

  const openDeleteConfirm = (id: string) => {
    const automation = agentAutomations.find((a) => a.id === id);
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
    const withAgent = { ...draft, agentId: draft.agentId ?? agentId };
    if (form?.mode === 'edit') {
      onUpdate(form.automation.id, withAgent);
    } else {
      onCreate(withAgent);
    }
    setForm(null);
  };

  return (
    <AgentsShell
      flushContent
      productNav={
        onGoAutomations
          ? {
              active: 'agents',
              onChange: (navTab) => {
                if (navTab === 'automations') onGoAutomations();
              },
            }
          : undefined
      }
      overlay={
        <>
          {form && (
            <AutomationFormModal
              initial={form.mode === 'edit' ? form.automation : undefined}
              contextAgentId={agentId}
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
        showAutomationsTab={showAutomationsTab}
      >
        {tab === 'automations' && showAutomationsTab ? (
          <AgentAutomationsTab
            automations={agentAutomations}
            onNew={() => setForm({ mode: 'create' })}
            onEdit={openEdit}
            onToggle={onToggle}
            onRequestDelete={openDeleteConfirm}
          />
        ) : tab === 'access' ? (
          <AccessTab />
        ) : tab === 'mcps' ? (
          <McpsTab
            activeMcps={agent?.activeMcps}
            toolCount={agent?.toolCount}
          />
        ) : tab === 'configuration' ? (
          agent ? (
            <AgentSettingsTab agent={agent} />
          ) : (
            <PlaceholderTab tab={tab} />
          )
        ) : null}
      </EditAgentView>
    </AgentsShell>
  );
}
