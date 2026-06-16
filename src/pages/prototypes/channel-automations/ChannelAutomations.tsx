import { useEffect, useState } from 'react';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import {
  INITIAL_AUTOMATIONS,
  SCRIPTED_RESULT,
  applyDraft,
  draftToAutomation,
  type Automation,
  type AutomationDraft,
} from './channelAutomationsData';
import {
  SCENES,
  type HeaderEntryPoint,
  type ManagePresentation,
  type SceneId,
} from './channelAutomationsScenes';
import DiscoverScene from './scenes/DiscoverScene';
import CreateScene from './scenes/CreateScene';
import ManageScene from './scenes/ManageScene';
import AgentsIndexScene from './scenes/AgentsIndexScene';
import AgentScene from './scenes/AgentScene';
import ExploreAlternatesControl from './components/ExploreAlternatesControl';
import styles from './ChannelAutomations.module.scss';

export default function ChannelAutomations() {
  const { setCenterSlot } = usePrototypeChrome();

  const [scene, setScene] = useState<SceneId>('discover');
  const [automations, setAutomations] =
    useState<Automation[]>(INITIAL_AUTOMATIONS);
  const [showAlternates, setShowAlternates] = useState(false);
  const [headerEntryPoint, setHeaderEntryPoint] =
    useState<HeaderEntryPoint>('agents-menu');
  const [managePresentation, setManagePresentation] =
    useState<ManagePresentation>('rhs');
  // Which scene opened the management view, so the Automations RHS back button
  // can return to that agents-panel starting point.
  const [manageOrigin, setManageOrigin] = useState<SceneId>('discover');
  const [selectedAgentId, setSelectedAgentId] = useState('matty');

  useEffect(() => {
    setCenterSlot(
      <SceneSwitcher
        scenes={SCENES}
        activeId={scene}
        onChange={(id) => setScene(id as SceneId)}
        ariaLabel="Channel automations scene"
      />,
    );
    return () => setCenterSlot(null);
  }, [scene, setCenterSlot]);

  const addScriptedAutomation = () => {
    setAutomations((prev) => {
      if (prev.some((a) => a.id === 'scripted-standup')) return prev;
      return [{ ...SCRIPTED_RESULT, id: 'scripted-standup' }, ...prev];
    });
  };

  const toggleAutomation = (id: string, enabled: boolean) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled } : a)),
    );
  };

  const deleteAutomation = (id: string) => {
    setAutomations((prev) => prev.filter((a) => a.id !== id));
  };

  // Form-based create (from the agent's Automations tab). Chat-based create
  // lives in addScriptedAutomation; both write to the same shared list.
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

  const duplicateAutomation = (id: string) => {
    setAutomations((prev) => {
      const source = prev.find((a) => a.id === id);
      if (!source) return prev;
      const copy: Automation = {
        ...source,
        id: `${id}-copy-${Date.now()}`,
        name: `${source.name} (copy)`,
        enabled: false,
        lastRun: null,
      };
      const index = prev.findIndex((a) => a.id === id);
      return [...prev.slice(0, index + 1), copy, ...prev.slice(index + 1)];
    });
  };

  // In this prototype, "Create" / "Edit" both land in the scripted Agent flow.
  // The selected automation type is accepted by callers but not branched on yet.
  const goCreate = () => setScene('create');
  const goDiscover = () => setScene('discover');

  const goManageFrom = (origin: SceneId) => {
    setManageOrigin(origin);
    setScene('manage');
  };
  const goBackFromManage = () => setScene(manageOrigin);

  const goAgents = () => setScene('agents');
  const goEditAgent = (agentId: string) => {
    setSelectedAgentId(agentId);
    setScene('agent');
  };

  return (
    <div className={styles['channel-automations']}>
      {scene === 'discover' && (
        <DiscoverScene
          automations={automations}
          headerEntryPoint={headerEntryPoint}
          showAlternates={showAlternates}
          onCreate={goCreate}
          onManage={() => goManageFrom('discover')}
        />
      )}

      {scene === 'create' && (
        <CreateScene
          automations={automations}
          headerEntryPoint={headerEntryPoint}
          showAlternates={showAlternates}
          onCreate={goCreate}
          onAddAutomation={addScriptedAutomation}
          onManage={() => goManageFrom('create')}
          onClose={goDiscover}
        />
      )}

      {scene === 'manage' && (
        <ManageScene
          automations={automations}
          headerEntryPoint={headerEntryPoint}
          showAlternates={showAlternates}
          presentation={managePresentation}
          onPresentationChange={setManagePresentation}
          onCreate={goCreate}
          onToggle={toggleAutomation}
          onEdit={() => goCreate()}
          onDuplicate={duplicateAutomation}
          onDelete={deleteAutomation}
          onBack={goBackFromManage}
          onClose={goDiscover}
        />
      )}

      {scene === 'agents' && (
        <AgentsIndexScene onSelectAgent={goEditAgent} />
      )}

      {scene === 'agent' && (
        <AgentScene
          agentId={selectedAgentId}
          automations={automations}
          onCreate={createAutomation}
          onUpdate={updateAutomation}
          onToggle={toggleAutomation}
          onDuplicate={duplicateAutomation}
          onDelete={deleteAutomation}
          onClose={goAgents}
        />
      )}

      <ExploreAlternatesControl
        headerEntryPoint={headerEntryPoint}
        onHeaderEntryPointChange={setHeaderEntryPoint}
        showAlternates={showAlternates}
        onShowAlternatesChange={setShowAlternates}
        managePresentation={managePresentation}
        onManagePresentationChange={setManagePresentation}
      />
    </div>
  );
}
