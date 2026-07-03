import { useEffect, useState } from 'react';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import {
  INITIAL_AUTOMATIONS,
  applyDraft,
  draftToAutomation,
  type Automation,
  type AutomationDraft,
} from '@/pages/prototypes/channel-automations/channelAutomationsData';
import { OPTION2_PANEL_OPTIONS } from '@/pages/prototypes/channel-automations/panelOptions';
import AgentScene from '@/pages/prototypes/channel-automations/scenes/AgentScene';
import AgentsIndexScene from '@/pages/prototypes/channel-automations/scenes/AgentsIndexScene';
import DiscoverScene from '@/pages/prototypes/channel-automations/scenes/DiscoverScene';
import ManageScene from '@/pages/prototypes/channel-automations/scenes/ManageScene';
import {
  AutomationEditScene,
  AutomationsIndexScene,
} from './scenes/AutomationsProductScenes';
import { EXTENDED_SCENES, type ExtendedSceneId } from './extendedScenes';
import frameStyles from '@/pages/prototypes/channel-automations/PrototypeAppFrame.module.scss';

export default function StandaloneAutomations() {
  const { setCenterSlot } = usePrototypeChrome();

  const [scene, setScene] = useState<ExtendedSceneId>('discover');
  const [automations, setAutomations] =
    useState<Automation[]>(INITIAL_AUTOMATIONS);
  const [manageOrigin, setManageOrigin] = useState<ExtendedSceneId>('discover');
  const [selectedAgentId, setSelectedAgentId] = useState('matty');
  const [selectedAutomationId, setSelectedAutomationId] = useState<string | null>(
    null,
  );
  const [automationIsNew, setAutomationIsNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Automation | null>(null);

  useEffect(() => {
    setCenterSlot(
      <SceneSwitcher
        scenes={EXTENDED_SCENES}
        activeId={scene}
        onChange={(id) => setScene(id as ExtendedSceneId)}
        ariaLabel="Standalone automations scene"
      />,
    );
    return () => setCenterSlot(null);
  }, [scene, setCenterSlot]);

  const toggleAutomation = (id: string, enabled: boolean) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled } : a)),
    );
  };

  const deleteAutomation = (id: string) => {
    setAutomations((prev) => prev.filter((a) => a.id !== id));
  };

  const createAutomation = (draft: AutomationDraft) => {
    setAutomations((prev) => [
      draftToAutomation(draft, `auto-${Date.now()}`),
      ...prev,
    ]);
  };

  const updateAutomation = (id: string, draft: AutomationDraft) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? applyDraft(a, draft) : a)),
    );
  };

  const goDiscover = () => setScene('discover');
  const goManageFrom = (origin: ExtendedSceneId) => {
    setManageOrigin(origin);
    setScene('manage');
  };
  const goBackFromManage = () => setScene(manageOrigin);
  const goAgents = () => setScene('agents');
  const goAutomations = () => setScene('automations');

  const goEditAgent = (agentId: string) => {
    setSelectedAgentId(agentId);
    setScene('agent');
  };

  const goEditAutomation = (id: string) => {
    setSelectedAutomationId(id);
    setAutomationIsNew(false);
    setScene('automation');
  };

  const goNewAutomation = () => {
    setSelectedAutomationId(null);
    setAutomationIsNew(true);
    setScene('automation');
  };

  const selectedAutomation =
    selectedAutomationId != null
      ? automations.find((a) => a.id === selectedAutomationId) ?? null
      : null;

  const openDeleteConfirm = (id: string) => {
    const automation = automations.find((a) => a.id === id);
    if (automation) setDeleteTarget(automation);
  };

  const confirmDelete = () => {
    if (deleteTarget) deleteAutomation(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className={frameStyles['prototype-app-frame']}>
      {scene === 'discover' && (
        <DiscoverScene
          automations={automations}
          panelOptions={OPTION2_PANEL_OPTIONS}
          onCreateAutomation={createAutomation}
          onManage={() => goManageFrom('discover')}
          onManageAgents={goAgents}
        />
      )}

      {scene === 'manage' && (
        <ManageScene
          automations={automations}
          panelOptions={OPTION2_PANEL_OPTIONS}
          onCreateAutomation={createAutomation}
          onUpdate={updateAutomation}
          onToggle={toggleAutomation}
          onDelete={deleteAutomation}
          onBack={goBackFromManage}
          onClose={goDiscover}
          onManageAgents={goAgents}
        />
      )}

      {scene === 'agents' && (
        <AgentsIndexScene
          onSelectAgent={goEditAgent}
          onNewAutomation={() => {}}
          showNewAutomation={false}
          onGoAutomations={goAutomations}
        />
      )}

      {scene === 'agent' && (
        <AgentScene
          agentId={selectedAgentId}
          automations={automations}
          onCreate={createAutomation}
          onUpdate={updateAutomation}
          onToggle={toggleAutomation}
          onDelete={deleteAutomation}
          onClose={goAgents}
          showAutomationsTab={false}
          onGoAutomations={goAutomations}
        />
      )}

      {scene === 'automations' && (
        <AutomationsIndexScene
          automations={automations}
          onSelectAutomation={goEditAutomation}
          onNewAutomation={goNewAutomation}
          onToggle={toggleAutomation}
          onRequestDelete={openDeleteConfirm}
          deleteTarget={deleteTarget}
          onConfirmDelete={confirmDelete}
          onCloseDelete={() => setDeleteTarget(null)}
          onGoAgents={goAgents}
        />
      )}

      {scene === 'automation' && (
        <AutomationEditScene
          automation={selectedAutomation}
          isNew={automationIsNew}
          deleteTarget={deleteTarget}
          onSubmit={(draft) => {
            if (automationIsNew) {
              createAutomation(draft);
            } else if (selectedAutomation) {
              updateAutomation(selectedAutomation.id, draft);
            }
            goAutomations();
          }}
          onClose={goAutomations}
          onConfirmDelete={() => {
            if (deleteTarget) deleteAutomation(deleteTarget.id);
            setDeleteTarget(null);
            goAutomations();
          }}
          onCloseDelete={() => setDeleteTarget(null)}
          onGoAgents={goAgents}
        />
      )}
    </div>
  );
}
