import { Button, Icon, IconButton, Scrollbar } from '@mattermost/compass-ui';
import type { ReactNode } from 'react';
import ArrowLeftIcon from '@mattermost/compass-icons/components/arrow-left';
import AutomationsTabs from './AutomationsTabs';
import type { AutomationsTabItem } from './AutomationsTabs';
import styles from './EditAgentView.module.scss';

export type AgentTabKey =
  | 'chat'
  | 'configuration'
  | 'access'
  | 'automations'
  | 'mcps';

const TABS: AutomationsTabItem[] = [
  { key: 'configuration', label: 'Configuration' },
  { key: 'access', label: 'Access' },
  { key: 'automations', label: 'Automations' },
  { key: 'mcps', label: 'MCPs' },
];

export interface EditAgentViewProps {
  title?: string;
  activeTab: AgentTabKey;
  onTabChange: (key: AgentTabKey) => void;
  onClose: () => void;
  onSave: () => void;
  children: ReactNode;
  showAutomationsTab?: boolean;
  tabs?: AutomationsTabItem[];
  tabsAriaLabel?: string;
}

/**
 * Edit Agent settings view (Figma `4303-35266`) — an 800px-wide centered card
 * with a back-to-agents header, the Configuration / Access / Automations / MCPs
 * tab strip, the active tab body, and a Cancel / Save footer.
 */
export default function EditAgentView({
  title = 'Edit Agent',
  activeTab,
  onTabChange,
  onClose,
  onSave,
  children,
  showAutomationsTab = true,
  tabs: tabsOverride,
  tabsAriaLabel = 'Agent settings',
}: EditAgentViewProps) {
  const tabs =
    tabsOverride ??
    (showAutomationsTab
      ? TABS
      : TABS.filter((tab) => tab.key !== 'automations'));

  const isChatTab = activeTab === 'chat';

  const column = (
    <div
      className={[
        styles['edit-agent__col'],
        isChatTab ? styles['edit-agent__col--chat'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles['edit-agent__head']}>
        <IconButton
          size="Small"
          aria-label="Back to agents"
          onClick={onClose}
          icon={<Icon size="20" glyph={<ArrowLeftIcon />} />}
        />
        <h1 className={styles['edit-agent__title']}>{title}</h1>
      </div>

      <AutomationsTabs
        tabs={tabs}
        activeKey={activeTab}
        onChange={(key) => onTabChange(key as AgentTabKey)}
        ariaLabel={tabsAriaLabel}
      />

      <div
        className={[
          styles['edit-agent__body'],
          isChatTab ? styles['edit-agent__body--chat'] : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </div>
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
      {isChatTab ? (
        <div className={styles['edit-agent__chat-pane']}>{column}</div>
      ) : (
        <div className={styles['edit-agent__scroll']}>
          <Scrollbar>{column}</Scrollbar>
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
