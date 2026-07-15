import { useRef, useState } from 'react';
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

const ENTITY_TABS = [
  { key: 'chat', label: 'Chat' },
  { key: 'configuration', label: 'Settings' },
  { key: 'access', label: 'Access' },
  { key: 'mcps', label: 'Tools' },
] as const;

const PROGRESSIVE_TABS = AUTOMATION_EDITOR_VIEW_TABS.map((tab) => ({
  key: tab.id === 'form' ? ('configuration' as const) : tab.id,
  label: tab.label,
}));

export interface EditAutomationEntityViewProps {
  entity?: AutomationEntity;
  isNew?: boolean;
  onSubmit: (draft: AutomationDraft) => void;
  onClose: () => void;
  /** Option 3b — Chat + Settings only; agent plumbing lives in Advanced. */
  progressiveDisclosure?: boolean;
  showOperateWhere?: boolean;
}

export default function EditAutomationEntityView({
  entity,
  isNew = false,
  onSubmit,
  onClose,
  progressiveDisclosure = false,
  showOperateWhere = false,
}: EditAutomationEntityViewProps) {
  const [tab, setTab] = useState<AgentTabKey>(isNew ? 'chat' : 'configuration');
  const [name, setName] = useState(
    entity?.name ?? (isNew ? 'New automation' : ''),
  );
  const editorRef = useRef<AutomationFormEditorHandle>(null);

  const tabs = progressiveDisclosure
    ? PROGRESSIVE_TABS
    : [...ENTITY_TABS];

  const renderBody = () => {
    if (!progressiveDisclosure) {
      if (tab === 'access') return <AccessTab />;
      if (tab === 'mcps') {
        return (
          <McpsTab
            activeMcps={entity?.activeMcps}
            toolCount={entity?.toolCount}
          />
        );
      }
    }

    return (
      <div
        className={
          tab === 'chat'
            ? styles['entity-edit__chat']
            : styles['entity-edit__configuration']
        }
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
          editorKind="entity"
          progressiveDisclosure={progressiveDisclosure}
          showOperateWhere={showOperateWhere}
          view={tab === 'chat' ? 'chat' : 'form'}
        />
      </div>
    );
  };

  return (
    <EditAgentView
      title={name}
      titleEditable
      onTitleChange={setName}
      activeTab={tab}
      onTabChange={setTab}
      onClose={onClose}
      onSave={() => editorRef.current?.submit()}
      showAutomationsTab={false}
      tabs={[...tabs]}
      tabsAriaLabel="Automation settings"
      flushBody={
        progressiveDisclosure || tab === 'chat' || tab === 'configuration'
      }
    >
      {renderBody()}
    </EditAgentView>
  );
}
