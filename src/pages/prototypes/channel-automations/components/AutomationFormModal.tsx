import { Modal } from '@mattermost/compass-ui';
import { useState } from 'react';
import type { Automation, AutomationDraft } from '../channelAutomationsData';
import AutomationFormEditor, {
  AUTOMATION_EDITOR_VIEW_TABS,
  type EditorView,
} from './AutomationFormEditor';
import AutomationsTabs from './AutomationsTabs';
import EditableTitle from './EditableTitle';
import styles from './AutomationFormModal.module.scss';

export interface AutomationFormModalProps {
  initial?: Automation;
  contextAgentId?: string;
  showAgentPicker?: boolean;
  onSubmit: (draft: AutomationDraft) => void;
  onClose: () => void;
}

/**
 * Modal host for the automation create/edit editor in the Agents scene. Wraps
 * the self-contained AutomationFormEditor in a fixed-height dialog so the
 * Chat/Settings views never resize the surface.
 */
export default function AutomationFormModal({
  initial,
  contextAgentId,
  showAgentPicker = false,
  onSubmit,
  onClose,
}: AutomationFormModalProps) {
  const isEdit = initial != null;
  const [name, setName] = useState(
    initial?.name ?? (isEdit ? '' : 'New automation'),
  );
  const [view, setView] = useState<EditorView>('chat');

  const headerBottom = (
    <AutomationsTabs
      tabs={AUTOMATION_EDITOR_VIEW_TABS.map((tab) => ({ key: tab.id, label: tab.label }))}
      activeKey={view}
      onChange={(id) => setView(id as EditorView)}
      ariaLabel="Automation editor view"
      showDivider={false}
      inset
    />
  );

  return (
    <div className={styles['layer']}>
      <div className={styles['layer__backdrop']} aria-hidden onClick={onClose} />
      <div className={styles['layer__modal']}>
        <Modal
          size="Large"
          title={
            <EditableTitle
              value={name}
              onChange={setName}
              size="modal"
            />
          }
          onClose={onClose}
          headerBottom={headerBottom}
          headerDivider={false}
          bodyClassName={styles['modal-body']}
        >
          <AutomationFormEditor
            initial={initial}
            name={name}
            onNameChange={setName}
            onSubmit={onSubmit}
            onCancel={onClose}
            showViewTabs={false}
            showEnabledSwitch={false}
            showAgentPicker={showAgentPicker}
            contextAgentId={contextAgentId}
            view={view}
            onViewChange={setView}
          />
        </Modal>
      </div>
    </div>
  );
}
