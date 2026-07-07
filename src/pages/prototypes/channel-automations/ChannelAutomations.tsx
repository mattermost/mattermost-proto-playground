import { useEffect, useState } from 'react';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import {
  INITIAL_AUTOMATIONS,
  applyDraft,
  draftToAutomation,
  type Automation,
  type AutomationDraft,
} from './channelAutomationsData';
import { SCENES, type SceneId } from './channelAutomationsScenes';
import { OPTION1_PANEL_OPTIONS } from './panelOptions';
import DiscoverScene from './scenes/DiscoverScene';
import ManageScene from './scenes/ManageScene';
import AgentsIndexScene from './scenes/AgentsIndexScene';
import AgentScene from './scenes/AgentScene';
import styles from './PrototypeAppFrame.module.scss';

export default function ChannelAutomations() {
  const { setCenterSlot } = usePrototypeChrome();

  const [scene, setScene] = useState<SceneId>('discover');
  const [automations, setAutomations] =
    useState<Automation[]>(INITIAL_AUTOMATIONS);
  // Which scene opened the management view, so the Automations RHS back button
  // can return to that agents-panel starting point.
  const [manageOrigin, setManageOrigin] = useState<SceneId>('discover');
  const [selectedAgentId, setSelectedAgentId] = useState('matty');
  const [agentOpenCreate, setAgentOpenCreate] = useState(false);

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
      draftToAutomation(
        { ...draft, agentId: draft.agentId ?? selectedAgentId },
        `auto-${Date.now()}`,
      ),
      ...prev,
    ]);
  };

  const updateAutomation = (id: string, draft: AutomationDraft) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? applyDraft(a, draft) : a)),
    );
  };

  const goDiscover = () => setScene('discover');

  const goManageFrom = (origin: SceneId) => {
    setManageOrigin(origin);
    setScene('manage');
  };
  const goBackFromManage = () => setScene(manageOrigin);

  const goAgents = () => setScene('agents');
  const goEditAgent = (agentId: string) => {
    setSelectedAgentId(agentId);
    setAgentOpenCreate(false);
    setScene('agent');
  };

  const goNewAutomationForAgent = (agentId: string) => {
    setSelectedAgentId(agentId);
    setAgentOpenCreate(true);
    setScene('agent');
  };

  return (
    <div className={styles['prototype-app-frame']}>
      {scene === 'discover' && (
        <DiscoverScene
          panelOptions={OPTION1_PANEL_OPTIONS}
          onCreateAutomation={createAutomation}
          onManage={() => goManageFrom('discover')}
          onManageAgents={goAgents}
        />
      )}

      {scene === 'manage' && (
        <ManageScene
          automations={automations}
          panelOptions={OPTION1_PANEL_OPTIONS}
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
          onNewAutomation={goNewAutomationForAgent}
        />
      )}

      {scene === 'agent' && (
        <AgentScene
          agentId={selectedAgentId}
          openCreateOnMount={agentOpenCreate}
          automations={automations}
          onCreate={createAutomation}
          onUpdate={updateAutomation}
          onToggle={toggleAutomation}
          onDelete={deleteAutomation}
          onClose={goAgents}
        />
      )}
    </div>
  );
}
