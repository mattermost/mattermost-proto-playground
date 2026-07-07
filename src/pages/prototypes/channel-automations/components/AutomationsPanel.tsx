import { Scrollbar } from '@mattermost/compass-ui';
import { RightSidebarHeader } from '@mattermost/compass-ui';
import { shellStyles } from '@mattermost/compass-ui';
import type {
  Automation,
  AutomationDraft,
  AutomationEntity,
  AutomationType,
} from '../channelAutomationsData';
import AgentSelector from './AgentSelector';
import AutomationFormEditor from './AutomationFormEditor';
import AutomationsList from './AutomationsList';
import ChooseAgentPrompt from './ChooseAgentPrompt';
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
  onCreate: (type?: AutomationType, agentId?: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onEdit: (id: string) => void;
  onRequestDelete: (id: string) => void;
  showAgentSelector?: boolean;
  showAgentPicker?: boolean;
  contextAgentId?: string;
  creatingContextAgentId?: string;
  agentPickerMode?: {
    onSelectAgent: (agentId: string) => void;
    onCancel: () => void;
  } | null;
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
  showAgentSelector = false,
  showAgentPicker = false,
  contextAgentId,
  creatingContextAgentId,
  agentPickerMode = null,
  editorKind = 'assignment',
}: AutomationsPanelProps) {
  const inEditor = creating || editing != null || editingEntity != null;
  const choosingAgent = agentPickerMode != null;
  const editorContextAgentId = creatingContextAgentId ?? contextAgentId;
  const headerTitle = choosingAgent || creating
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

  const showHeaderAgentSelector = showAgentSelector;

  return (
    <aside className={shellStyles['channel-shell__right-sidebar']}>
      <RightSidebarHeader
        title={headerTitle}
        secondaryContent={
          showHeaderAgentSelector ? (
            <AgentSelector agentId={contextAgentId} />
          ) : undefined
        }
        onBack={
          choosingAgent
            ? agentPickerMode?.onCancel
            : inEditor
              ? onBackFromEditor
              : onBack
        }
        onClose={onClose}
      />
      <div className={shellStyles['channel-shell__right-sidebar-body']}>
        {inEditor && onBackFromEditor ? (
          <div className={styles['panel__editor']}>
            <AutomationFormEditor
              key={
                creating
                  ? `create-${createType ?? 'blank'}-${creatingContextAgentId ?? ''}`
                  : (editing?.id ?? editingEntity?.id)
              }
              initial={editing ?? undefined}
              initialEntity={editingEntity ?? undefined}
              createType={creating ? createType : undefined}
              onSubmit={handleSubmit}
              onCancel={onBackFromEditor}
              showEnabledSwitch={false}
              showAgentPicker={showAgentPicker}
              contextAgentId={editorContextAgentId}
              editorKind={editorKind}
            />
          </div>
        ) : choosingAgent && agentPickerMode ? (
          <Scrollbar>
            <ChooseAgentPrompt
              onSelectAgent={agentPickerMode.onSelectAgent}
              onCancel={agentPickerMode.onCancel}
            />
          </Scrollbar>
        ) : (
          <Scrollbar>
            <AutomationsList
              automations={automations}
              onCreate={() => onCreate()}
              onCreateForAgent={
                showAgentPicker
                  ? (agentId) => onCreate(undefined, agentId)
                  : undefined
              }
              onToggle={onToggle}
              onEdit={onEdit}
              onRequestDelete={onRequestDelete}
            />
          </Scrollbar>
        )}
      </div>
    </aside>
  );
}
