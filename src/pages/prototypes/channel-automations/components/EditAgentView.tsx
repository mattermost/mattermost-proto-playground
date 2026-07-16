import { Button, Icon, IconButton, Scrollbar } from '@mattermost/compass-ui';
import type { ReactNode } from 'react';
import ArrowLeftIcon from '@mattermost/compass-icons/components/arrow-left';
import AutomationsTabs from './AutomationsTabs';
import type { AutomationsTabItem } from './AutomationsTabs';
import EditableTitle from './EditableTitle';
import styles from './EditAgentView.module.scss';

export type AgentTabKey =
  | 'chat'
  | 'configuration'
  | 'access'
  | 'mcps';

const TABS: AutomationsTabItem[] = [
  { key: 'configuration', label: 'Settings' },
  { key: 'access', label: 'Access' },
  { key: 'mcps', label: 'Tools' },
];

export interface EditAgentViewProps {
  title?: string;
  titleEditable?: boolean;
  onTitleChange?: (title: string) => void;
  activeTab: AgentTabKey;
  onTabChange: (key: AgentTabKey) => void;
  onClose: () => void;
  onSave: () => void;
  children: ReactNode;
  tabs?: AutomationsTabItem[];
  tabsAriaLabel?: string;
  /** When true, body skips its own padding so nested editors can own spacing. */
  flushBody?: boolean;
}

/**
 * Edit Agent settings view — full-bleed chrome/scroll/footer with an 800px
 * content column, matching the Agents list edge-scrollbar layout.
 */
export default function EditAgentView({
  title = 'Edit Agent',
  titleEditable = false,
  onTitleChange,
  activeTab,
  onTabChange,
  onClose,
  onSave,
  children,
  tabs: tabsOverride,
  tabsAriaLabel = 'Agent settings',
  flushBody = false,
}: EditAgentViewProps) {
  const tabs = tabsOverride ?? TABS;

  const isChatTab = activeTab === 'chat';

  const chrome = (
    <div className={styles['edit-agent__chrome']}>
      <div className={styles['edit-agent__col']}>
        <div className={styles['edit-agent__head']}>
          <IconButton
            size="Small"
            aria-label="Back to agents"
            onClick={onClose}
            icon={<Icon size="20" glyph={<ArrowLeftIcon />} />}
          />
          {titleEditable && onTitleChange ? (
            <EditableTitle
              className={styles['edit-agent__title']}
              value={title}
              onChange={onTitleChange}
              size="page"
            />
          ) : (
            <h1 className={styles['edit-agent__title']}>{title}</h1>
          )}
        </div>
      </div>

      <div className={styles['edit-agent__tabs']}>
        <div className={styles['edit-agent__col']}>
          <AutomationsTabs
            tabs={tabs}
            activeKey={activeTab}
            onChange={(key) => onTabChange(key as AgentTabKey)}
            ariaLabel={tabsAriaLabel}
            showDivider={false}
          />
        </div>
      </div>
    </div>
  );

  const body = (
    <div
      className={[
        styles['edit-agent__body'],
        isChatTab ? styles['edit-agent__body--chat'] : '',
        flushBody ? styles['edit-agent__body--flush'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles['edit-agent__col']}>{children}</div>
    </div>
  );

  return (
    <div
      className={[
        styles['edit-agent'],
        isChatTab ? styles['edit-agent--chat'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {chrome}

      {isChatTab ? (
        <div className={styles['edit-agent__main']}>{body}</div>
      ) : (
        <div className={styles['edit-agent__scroll']}>
          <Scrollbar>{body}</Scrollbar>
        </div>
      )}

      {activeTab !== 'chat' ? (
        <div className={styles['edit-agent__footer']}>
          <div className={styles['edit-agent__footer-col']}>
            <Button emphasis="Tertiary" onClick={onClose}>
              Cancel
            </Button>
            <Button emphasis="Primary" onClick={onSave}>
              Save
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
