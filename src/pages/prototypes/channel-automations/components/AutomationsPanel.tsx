import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import { RightSidebarHeader } from '@/components/ui/RightSidebar';
import shellStyles from '@/components/ui/ChannelShell/ChannelShell.module.scss';
import type { Automation, AutomationDraft } from '../channelAutomationsData';
import AgentSelector from './AgentSelector';
import AutomationFormEditor from './AutomationFormEditor';
import AutomationsList from './AutomationsList';
import styles from './AutomationsPanel.module.scss';

export interface AutomationsPanelProps {
  automations: Automation[];
  /** When true, shows the inline create editor. */
  creating?: boolean;
  /** When set, shows the inline edit editor for this automation. */
  editing?: Automation | null;
  onBackFromEditor?: () => void;
  onCreateSubmit?: (draft: AutomationDraft) => void;
  onUpdate?: (id: string, draft: AutomationDraft) => void;
  /** Return to the agents panel the list was opened from. */
  onBack?: () => void;
  onClose: () => void;
  onCreate: () => void;
  onToggle: (id: string, enabled: boolean) => void;
  onEdit: (id: string) => void;
  onRequestDelete: (id: string) => void;
}

/** RHS container for the management list and inline create/edit views. */
export default function AutomationsPanel({
  automations,
  creating = false,
  editing,
  onBackFromEditor,
  onCreateSubmit,
  onUpdate,
  onBack,
  onClose,
  onCreate,
  onToggle,
  onEdit,
  onRequestDelete,
}: AutomationsPanelProps) {
  const inEditor = creating || editing != null;
  const headerTitle = creating
    ? 'New automation'
    : editing
      ? 'Edit automation'
      : 'Automations';

  const handleSubmit = (draft: AutomationDraft) => {
    if (creating && onCreateSubmit) {
      onCreateSubmit(draft);
    } else if (editing && onUpdate) {
      onUpdate(editing.id, draft);
    }
    onBackFromEditor?.();
  };

  return (
    <aside className={shellStyles['channel-shell__right-sidebar']}>
      <RightSidebarHeader
        title={headerTitle}
        secondaryContent={<AgentSelector />}
        onBack={inEditor ? onBackFromEditor : onBack}
        onClose={onClose}
      />
      <div className={shellStyles['channel-shell__right-sidebar-body']}>
        {inEditor && onBackFromEditor ? (
          <div className={styles['panel__editor']}>
            <AutomationFormEditor
              initial={editing ?? undefined}
              onSubmit={handleSubmit}
              onCancel={onBackFromEditor}
              showEnabledSwitch={false}
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
