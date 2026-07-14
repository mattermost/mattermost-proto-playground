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
  showBlastRadius?: boolean;
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
  showBlastRadius = false,
}: AutomationEditViewProps) {
  const title = isNew ? 'New automation' : 'Edit automation';
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
      <AutomationFormEditor
        ref={editorRef}
        initial={initial}
        onSubmit={onSubmit}
        onCancel={onClose}
        showViewTabs={false}
        showFooter={false}
        showAgentPicker={showAgentPicker}
        contextAgentId={contextAgentId}
        showAgentCapabilities={showAgentCapabilities}
        showAutomationToolScope={showAutomationToolScope}
        showBlastRadius={showBlastRadius}
        view={view}
        onViewChange={setView}
        onValidityChange={setCanSave}
      />
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
      <div className={styles['automation-edit__col']}>
        <div className={styles['automation-edit__chrome']}>
          <div className={styles['automation-edit__head']}>
            <IconButton
              size="Small"
              aria-label="Back to automations"
              onClick={onClose}
              icon={<Icon size="20" glyph={<ArrowLeftIcon />} />}
            />
            <h1 className={styles['automation-edit__title']}>{title}</h1>
          </div>

          <AutomationsTabs
            tabs={AUTOMATION_EDITOR_VIEW_TABS.map((tab) => ({
              key: tab.id,
              label: tab.label,
            }))}
            activeKey={view}
            onChange={(id) => setView(id as EditorView)}
            ariaLabel="Automation editor view"
          />
        </div>

        {isChat ? (
          body
        ) : (
          <div className={styles['automation-edit__scroll']}>
            <Scrollbar>{body}</Scrollbar>
          </div>
        )}
      </div>

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
