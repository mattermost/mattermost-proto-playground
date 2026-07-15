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
  | 'automations'
  | 'mcps';

const TABS: AutomationsTabItem[] = [
  { key: 'configuration', label: 'Settings' },
  { key: 'access', label: 'Access' },
  { key: 'automations', label: 'Automations' },
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
  showAutomationsTab?: boolean;
  tabs?: AutomationsTabItem[];
  tabsAriaLabel?: string;
  /** When true, body skips its own padding so nested editors can own spacing. */
  flushBody?: boolean;
}

/**
 * Edit Agent settings view (Figma `4303-35266`) — an 800px-wide centered card
 * with a back-to-agents header, the Settings / Access / Automations / Tools
 * tab strip, the active tab body, and a Cancel / Save footer.
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
  showAutomationsTab = true,
  tabs: tabsOverride,
  tabsAriaLabel = 'Agent settings',
  flushBody = false,
}: EditAgentViewProps) {
  const tabs =
    tabsOverride ??
    (showAutomationsTab
      ? TABS
      : TABS.filter((tab) => tab.key !== 'automations'));

  const isChatTab = activeTab === 'chat';

  const chrome = (
    <div className={styles['edit-agent__chrome']}>
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

      <AutomationsTabs
        tabs={tabs}
        activeKey={activeTab}
        onChange={(key) => onTabChange(key as AgentTabKey)}
        ariaLabel={tabsAriaLabel}
      />
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
      {children}
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
      <div
        className={[
          styles['edit-agent__col'],
          isChatTab ? styles['edit-agent__col--chat'] : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {chrome}

        {isChatTab ? (
          body
        ) : (
          <div className={styles['edit-agent__scroll']}>
            <Scrollbar>{body}</Scrollbar>
          </div>
        )}
      </div>

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
