import { useRef, useState } from 'react';
import type { AutomationDraft, AutomationEntity } from '../channelAutomationsData';
import type { AgentTabKey } from './EditAgentView';
import EditAgentView from './EditAgentView';
import AccessTab from './AccessTab';
import AutomationFormEditor, {
  type AutomationFormEditorHandle,
} from './AutomationFormEditor';
import McpsTab from './McpsTab';
import styles from './EditAutomationEntityView.module.scss';

const ENTITY_TABS = [
  { key: 'chat', label: 'Chat' },
  { key: 'configuration', label: 'Configuration' },
  { key: 'access', label: 'Access' },
  { key: 'mcps', label: 'MCPs' },
] as const;

export interface EditAutomationEntityViewProps {
  entity?: AutomationEntity;
  isNew?: boolean;
  onSubmit: (draft: AutomationDraft) => void;
  onClose: () => void;
}

export default function EditAutomationEntityView({
  entity,
  isNew = false,
  onSubmit,
  onClose,
}: EditAutomationEntityViewProps) {
  const [tab, setTab] = useState<AgentTabKey>(isNew ? 'chat' : 'configuration');
  const editorRef = useRef<AutomationFormEditorHandle>(null);

  const title = isNew
    ? 'New automation'
    : `Edit ${entity?.displayName ?? 'automation'}`;

  const renderBody = () => {
    if (tab === 'access') return <AccessTab />;
    if (tab === 'mcps') {
      return (
        <McpsTab
          activeMcps={entity?.activeMcps}
          toolCount={entity?.toolCount}
        />
      );
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
          onSubmit={onSubmit}
          onCancel={onClose}
          showViewTabs={false}
          showFooter={false}
          editorKind="entity"
          view={tab === 'chat' ? 'chat' : 'form'}
        />
      </div>
    );
  };

  return (
    <EditAgentView
      title={title}
      activeTab={tab}
      onTabChange={setTab}
      onClose={onClose}
      onSave={() => editorRef.current?.submit()}
      showAutomationsTab={false}
      tabs={[...ENTITY_TABS]}
      tabsAriaLabel="Automation settings"
    >
      {renderBody()}
    </EditAgentView>
  );
}
