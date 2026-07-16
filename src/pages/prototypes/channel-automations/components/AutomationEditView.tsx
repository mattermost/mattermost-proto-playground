import { Button, Icon, IconButton, Scrollbar } from '@mattermost/compass-ui';
import { useRef, useState } from 'react';
import ArrowLeftIcon from '@mattermost/compass-icons/components/arrow-left';
import type { Automation, AutomationDraft } from '../channelAutomationsData';
import AutomationFormEditor, {
  AUTOMATION_EDITOR_VIEW_TABS,
  type AutomationFormEditorHandle,
  type EditorView,
} from './AutomationFormEditor';
import AutomationsTabs from './AutomationsTabs';
import EditableTitle from './EditableTitle';
import styles from './AutomationEditView.module.scss';

export interface AutomationEditViewProps {
  initial?: Automation;
  isNew?: boolean;
  onSubmit: (draft: AutomationDraft) => void;
  onClose: () => void;
  showAgentPicker?: boolean;
  contextAgentId?: string;
  showAgentCapabilities?: boolean;
  showAutomationToolScope?: boolean;
  showOperateWhere?: boolean;
}

export default function AutomationEditView({
  initial,
  isNew = false,
  onSubmit,
  onClose,
  showAgentPicker = true,
  contextAgentId,
  showAgentCapabilities = false,
  showAutomationToolScope = false,
  showOperateWhere = false,
}: AutomationEditViewProps) {
  const [name, setName] = useState(
    initial?.name ?? (isNew ? 'New automation' : ''),
  );
  const [view, setView] = useState<EditorView>('chat');
  const [canSave, setCanSave] = useState(false);
  const editorRef = useRef<AutomationFormEditorHandle>(null);
  const isChat = view === 'chat';

  const body = (
    <div
      className={[
        styles['automation-edit__body'],
        isChat ? styles['automation-edit__body--chat'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles['automation-edit__col']}>
        <AutomationFormEditor
          ref={editorRef}
          initial={initial}
          name={name}
          onNameChange={setName}
          onSubmit={onSubmit}
          onCancel={onClose}
          showViewTabs={false}
          showFooter={false}
          scrollBody={isChat}
          showAgentPicker={showAgentPicker}
          contextAgentId={contextAgentId}
          showAgentCapabilities={showAgentCapabilities}
          showAutomationToolScope={showAutomationToolScope}
          showOperateWhere={showOperateWhere}
          view={view}
          onViewChange={setView}
          onValidityChange={setCanSave}
        />
      </div>
    </div>
  );

  return (
    <div
      className={[
        styles['automation-edit'],
        isChat ? styles['automation-edit--chat'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles['automation-edit__chrome']}>
        <div className={styles['automation-edit__col']}>
          <div className={styles['automation-edit__head']}>
            <IconButton
              size="Small"
              aria-label="Back to automations"
              onClick={onClose}
              icon={<Icon size="20" glyph={<ArrowLeftIcon />} />}
            />
            <EditableTitle
              className={styles['automation-edit__title']}
              value={name}
              onChange={setName}
              size="page"
            />
          </div>
        </div>

        <div className={styles['automation-edit__tabs']}>
          <div className={styles['automation-edit__col']}>
            <AutomationsTabs
              tabs={AUTOMATION_EDITOR_VIEW_TABS.map((tab) => ({
                key: tab.id,
                label: tab.label,
              }))}
              activeKey={view}
              onChange={(id) => setView(id as EditorView)}
              ariaLabel="Automation editor view"
              showDivider={false}
            />
          </div>
        </div>
      </div>

      {isChat ? (
        <div className={styles['automation-edit__main']}>{body}</div>
      ) : (
        <div className={styles['automation-edit__scroll']}>
          <Scrollbar>{body}</Scrollbar>
        </div>
      )}

      <div className={styles['automation-edit__footer']}>
        <div className={styles['automation-edit__footer-col']}>
          <Button emphasis="Tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            emphasis="Primary"
            disabled={!canSave}
            onClick={() => editorRef.current?.submit()}
          >
            {isNew ? 'Add automation' : 'Save changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
