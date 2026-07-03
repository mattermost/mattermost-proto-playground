import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import { RightSidebarHeader } from '@/components/ui/RightSidebar';
import shellStyles from '@/components/ui/ChannelShell/ChannelShell.module.scss';
import type {
  Automation,
  AutomationDraft,
  AutomationEntity,
  AutomationType,
} from '../channelAutomationsData';
import AgentSelector from './AgentSelector';
import AutomationFormEditor from './AutomationFormEditor';
import AutomationsList from './AutomationsList';
import type { EditorKind } from './automationFormTypes';
import styles from './AutomationsPanel.module.scss';

export interface AutomationsPanelProps {
  automations: Automation[];
  creating?: boolean;
  createType?: AutomationType;
  editing?: Automation | null;
  editingEntity?: AutomationEntity | null;
  onBackFromEditor?: () => void;
  onCreateSubmit?: (draft: AutomationDraft) => void;
  onUpdate?: (id: string, draft: AutomationDraft) => void;
  onBack?: () => void;
  onClose: () => void;
  onCreate: (type?: AutomationType) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onEdit: (id: string) => void;
  onRequestDelete: (id: string) => void;
  showAgentSelector?: boolean;
  showAgentPicker?: boolean;
  contextAgentId?: string;
  editorKind?: EditorKind;
}

export default function AutomationsPanel({
  automations,
  creating = false,
  createType,
  editing,
  editingEntity,
  onBackFromEditor,
  onCreateSubmit,
  onUpdate,
  onBack,
  onClose,
  onCreate,
  onToggle,
  onEdit,
  onRequestDelete,
  showAgentSelector = true,
  showAgentPicker = false,
  contextAgentId,
  editorKind = 'assignment',
}: AutomationsPanelProps) {
  const inEditor = creating || editing != null || editingEntity != null;
  const headerTitle = creating
    ? 'New automation'
    : editing || editingEntity
      ? 'Edit automation'
      : 'Automations';

  const handleSubmit = (draft: AutomationDraft) => {
    if (creating && onCreateSubmit) {
      onCreateSubmit(draft);
    } else if (editing && onUpdate) {
      onUpdate(editing.id, draft);
    } else if (editingEntity && onUpdate) {
      onUpdate(editingEntity.id, draft);
    }
    onBackFromEditor?.();
  };

  return (
    <aside className={shellStyles['channel-shell__right-sidebar']}>
      <RightSidebarHeader
        title={headerTitle}
        secondaryContent={
          showAgentSelector ? (
            <AgentSelector agentId={contextAgentId} />
          ) : undefined
        }
        onBack={inEditor ? onBackFromEditor : onBack}
        onClose={onClose}
      />
      <div className={shellStyles['channel-shell__right-sidebar-body']}>
        {inEditor && onBackFromEditor ? (
          <div className={styles['panel__editor']}>
            <AutomationFormEditor
              key={
                creating
                  ? `create-${createType ?? 'blank'}`
                  : (editing?.id ?? editingEntity?.id)
              }
              initial={editing ?? undefined}
              initialEntity={editingEntity ?? undefined}
              createType={creating ? createType : undefined}
              onSubmit={handleSubmit}
              onCancel={onBackFromEditor}
              showEnabledSwitch={false}
              showAgentPicker={showAgentPicker}
              contextAgentId={contextAgentId}
              editorKind={editorKind}
            />
          </div>
        ) : (
          <Scrollbars>
            <AutomationsList
              automations={automations}
              onCreate={onCreate}
              onToggle={onToggle}
              onEdit={onEdit}
              onRequestDelete={onRequestDelete}
            />
          </Scrollbars>
        )}
      </div>
    </aside>
  );
}
