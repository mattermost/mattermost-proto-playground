import { useEffect, useMemo, useRef, useState } from 'react';
import type { AutomationDraft, AutomationEntity } from '../channelAutomationsData';
import type { AgentTabKey } from './EditAgentView';
import EditAgentView from './EditAgentView';
import AccessTab from './AccessTab';
import AutomationFormEditor, {
  AUTOMATION_EDITOR_VIEW_TABS,
  type AutomationFormEditorHandle,
} from './AutomationFormEditor';
import McpsTab from './McpsTab';
import styles from './EditAutomationEntityView.module.scss';

const BASE_TABS = AUTOMATION_EDITOR_VIEW_TABS.map((tab) => ({
  key: tab.id === 'form' ? ('configuration' as const) : tab.id,
  label: tab.label,
}));

export interface EditAutomationEntityViewProps {
  entity?: AutomationEntity;
  isNew?: boolean;
  onSubmit: (draft: AutomationDraft) => void;
  onClose: () => void;
  /** Option 3b — Chat + Settings + Tools + Access; Advanced holds model knobs only. */
  progressiveDisclosure?: boolean;
  showOperateWhere?: boolean;
}

export default function EditAutomationEntityView({
  entity,
  isNew = false,
  onSubmit,
  onClose,
  progressiveDisclosure = true,
  showOperateWhere = false,
}: EditAutomationEntityViewProps) {
  const [tab, setTab] = useState<AgentTabKey>(isNew ? 'chat' : 'configuration');
  const [name, setName] = useState(
    entity?.name ?? (isNew ? 'New automation' : ''),
  );
  const [enableTools, setEnableTools] = useState(true);
  const editorRef = useRef<AutomationFormEditorHandle>(null);

  const tabs = useMemo(() => {
    if (!progressiveDisclosure) return BASE_TABS;
    return [
      ...BASE_TABS,
      ...(enableTools ? [{ key: 'mcps' as const, label: 'Tools' }] : []),
      { key: 'access' as const, label: 'Access' },
    ];
  }, [progressiveDisclosure, enableTools]);

  useEffect(() => {
    if (!enableTools && tab === 'mcps') {
      setTab('configuration');
    }
  }, [enableTools, tab]);

  const isEditorTab = tab === 'chat' || tab === 'configuration';

  return (
    <EditAgentView
      title={name}
      titleEditable
      onTitleChange={setName}
      activeTab={tab}
      onTabChange={setTab}
      onClose={onClose}
      onSave={() => editorRef.current?.submit()}
      tabs={[...tabs]}
      tabsAriaLabel="Automation settings"
      flushBody={isEditorTab}
    >
      {tab === 'mcps' ? (
        <McpsTab
          activeMcps={entity?.activeMcps}
          toolCount={entity?.toolCount}
        />
      ) : null}
      {tab === 'access' ? <AccessTab entityLabel="automation" /> : null}
      {/* Keep mounted so form state and Save survive Tools / Access tabs. */}
      <div
        className={
          tab === 'chat'
            ? styles['entity-edit__chat']
            : styles['entity-edit__configuration']
        }
        hidden={!isEditorTab}
        aria-hidden={!isEditorTab}
      >
        <AutomationFormEditor
          ref={editorRef}
          initialEntity={entity}
          name={name}
          onNameChange={setName}
          onSubmit={onSubmit}
          onCancel={onClose}
          showViewTabs={false}
          showFooter={false}
          scrollBody={tab === 'chat'}
          editorKind="entity"
          progressiveDisclosure={progressiveDisclosure}
          showOperateWhere={showOperateWhere}
          enableTools={enableTools}
          onEnableToolsChange={setEnableTools}
          view={tab === 'chat' ? 'chat' : 'form'}
        />
      </div>
    </EditAgentView>
  );
}
