import { Button, Icon, IconButton, Scrollbar } from '@mattermost/compass-ui';
import { useState } from 'react';
import ArrowLeftIcon from '@mattermost/compass-icons/components/arrow-left';
import type { Automation, AutomationDraft } from '../channelAutomationsData';
import AutomationFormEditor, {
  EDITOR_VIEW_TABS,
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
}

export default function AutomationEditView({
  initial,
  isNew = false,
  onSubmit,
  onClose,
  showAgentPicker = true,
}: AutomationEditViewProps) {
  const title = isNew ? 'New automation' : 'Edit automation';
  const [view, setView] = useState<EditorView>('chat');

  return (
    <div className={styles['automation-edit']}>
      <div className={styles['automation-edit__scroll']}>
        <Scrollbar>
          <div className={styles['automation-edit__col']}>
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
              tabs={EDITOR_VIEW_TABS.map((tab) => ({
                key: tab.id,
                label: tab.label,
              }))}
              activeKey={view}
              onChange={(id) => setView(id as EditorView)}
              ariaLabel="Automation editor view"
            />

            <div className={styles['automation-edit__body']}>
              <AutomationFormEditor
                initial={initial}
                onSubmit={onSubmit}
                onCancel={onClose}
                showViewTabs={false}
                showFooter={false}
                showAgentPicker={showAgentPicker}
                view={view}
                onViewChange={setView}
              />
            </div>
          </div>
        </Scrollbar>
      </div>

      <div className={styles['automation-edit__footer']}>
        <div className={styles['automation-edit__footer-col']}>
          <Button emphasis="Tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button emphasis="Primary" onClick={onClose}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
