import { useEffect, useState } from 'react';
import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import {
  INITIAL_AUTOMATION_ENTITIES,
  applyEntityDraftFromAutomationDraft,
  draftToAutomationEntity,
  entityAsAutomation,
  type AutomationDraft,
  type AutomationEntity,
} from '@/pages/prototypes/channel-automations/channelAutomationsData';
import { OPTION5_PANEL_OPTIONS } from '@/pages/prototypes/channel-automations/panelOptions';
import AgentScene from '@/pages/prototypes/channel-automations/scenes/AgentScene';
import AgentsIndexScene from '@/pages/prototypes/channel-automations/scenes/AgentsIndexScene';
import DiscoverScene from '@/pages/prototypes/channel-automations/scenes/DiscoverScene';
import ManageScene from '@/pages/prototypes/channel-automations/scenes/ManageScene';
import {
  EXTENDED_SCENES,
  type ExtendedSceneId,
} from '@/pages/prototypes/standalone-automations/extendedScenes';
import {
  AutomationEntitiesIndexScene,
  AutomationEntityEditScene,
} from '@/pages/prototypes/automation-agents/scenes/AutomationsProductScenes';
import frameStyles from '@/pages/prototypes/channel-automations/PrototypeAppFrame.module.scss';

/**
 * Option 3b — each automation is a dedicated agent, with agent plumbing
 * collapsed behind Advanced (progressive disclosure).
 */
export default function ProgressiveAutomationAgents() {
  const { setCenterSlot } = usePrototypeChrome();

  const [scene, setScene] = useState<ExtendedSceneId>('discover');
  const [entities, setEntities] = useState<AutomationEntity[]>(
    INITIAL_AUTOMATION_ENTITIES,
  );
  const [manageOrigin, setManageOrigin] = useState<ExtendedSceneId>('discover');
  const [selectedAgentId, setSelectedAgentId] = useState('matty');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [entityIsNew, setEntityIsNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AutomationEntity | null>(null);

  const automationsList = entities.map(entityAsAutomation);

  useEffect(() => {
    setCenterSlot(
      <SceneSwitcher
        scenes={EXTENDED_SCENES}
        activeId={scene}
        onChange={(id) => setScene(id as ExtendedSceneId)}
        ariaLabel="Progressive automation agents scene"
      />,
    );
    return () => setCenterSlot(null);
  }, [scene, setCenterSlot]);

  const toggleAutomation = (id: string, enabled: boolean) => {
    setEntities((prev) =>
      prev.map((e) => (e.id === id ? { ...e, enabled } : e)),
    );
  };

  const deleteEntity = (id: string) => {
    setEntities((prev) => prev.filter((e) => e.id !== id));
  };

  const createEntity = (draft: AutomationDraft) => {
    setEntities((prev) => [
      draftToAutomationEntity(draft, `entity-${Date.now()}`),
      ...prev,
    ]);
  };

  const updateEntity = (id: string, draft: AutomationDraft) => {
    setEntities((prev) =>
      prev.map((e) =>
        e.id === id ? applyEntityDraftFromAutomationDraft(e, draft) : e,
      ),
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

  const goEditEntity = (id: string) => {
    setSelectedEntityId(id);
    setEntityIsNew(false);
    setScene('automation');
  };

  const goNewEntity = () => {
    setSelectedEntityId(null);
    setEntityIsNew(true);
    setScene('automation');
  };

  const selectedEntity =
    selectedEntityId != null
      ? entities.find((e) => e.id === selectedEntityId) ?? null
      : null;

  const openDeleteConfirm = (id: string) => {
    const entity = entities.find((e) => e.id === id);
    if (entity) setDeleteTarget(entity);
  };

  const confirmDelete = () => {
    if (deleteTarget) deleteEntity(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className={frameStyles['prototype-app-frame']}>
      {scene === 'discover' && (
        <DiscoverScene
          automations={automationsList}
          panelOptions={OPTION5_PANEL_OPTIONS}
          onCreateAutomation={createEntity}
          onManage={() => goManageFrom('discover')}
          onManageAgents={goAgents}
        />
      )}

      {scene === 'manage' && (
        <ManageScene
          automations={automationsList}
          panelOptions={OPTION5_PANEL_OPTIONS}
          onCreateAutomation={createEntity}
          onUpdate={updateEntity}
          onToggle={toggleAutomation}
          onDelete={deleteEntity}
          onBack={goBackFromManage}
          onClose={goDiscover}
          onManageAgents={goAgents}
          getEditingEntity={(id) => entities.find((e) => e.id === id) ?? null}
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
          automations={[]}
          onCreate={() => {}}
          onUpdate={() => {}}
          onToggle={() => {}}
          onDelete={() => {}}
          onClose={goAgents}
          showAutomationsTab={false}
          onGoAutomations={goAutomations}
        />
      )}

      {scene === 'automations' && (
        <AutomationEntitiesIndexScene
          entities={entities}
          onSelectEntity={goEditEntity}
          onNewAutomation={goNewEntity}
          onToggle={toggleAutomation}
          onRequestDelete={openDeleteConfirm}
          deleteTarget={deleteTarget}
          onConfirmDelete={confirmDelete}
          onCloseDelete={() => setDeleteTarget(null)}
          onGoAgents={goAgents}
        />
      )}

      {scene === 'automation' && (
        <AutomationEntityEditScene
          entity={selectedEntity}
          isNew={entityIsNew}
          deleteTarget={deleteTarget}
          progressiveDisclosure
          showBlastRadius
          onSubmit={(draft) => {
            if (entityIsNew) {
              createEntity(draft);
            } else if (selectedEntity) {
              updateEntity(selectedEntity.id, draft);
            }
            goAutomations();
          }}
          onClose={goAutomations}
          onConfirmDelete={() => {
            if (deleteTarget) deleteEntity(deleteTarget.id);
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
