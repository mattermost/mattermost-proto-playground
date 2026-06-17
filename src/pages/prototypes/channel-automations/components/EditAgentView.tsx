import type { ReactNode } from 'react';
import ArrowLeftIcon from '@mattermost/compass-icons/components/arrow-left';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import IconButton from '@/components/ui/IconButton/IconButton';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import AutomationsTabs from './AutomationsTabs';
import type { AutomationsTabItem } from './AutomationsTabs';
import styles from './EditAgentView.module.scss';

export type AgentTabKey = 'configuration' | 'access' | 'automations' | 'mcps';

const TABS: AutomationsTabItem[] = [
  { key: 'configuration', label: 'Configuration' },
  { key: 'access', label: 'Access' },
  { key: 'automations', label: 'Automations' },
  { key: 'mcps', label: 'MCPs' },
];

export interface EditAgentViewProps {
  /** Page title shown beside the back button. */
  title?: string;
  activeTab: AgentTabKey;
  onTabChange: (key: AgentTabKey) => void;
  /** Back arrow + Cancel both return to the agents index. */
  onClose: () => void;
  /** Save commits the agent; in this prototype changes already apply live. */
  onSave: () => void;
  /** Active tab content. */
  children: ReactNode;
  /** When set, replaces the Edit Agent header and tab strip for a drill-in step. */
  subview?: {
    title: string;
    onBack: () => void;
  };
  /** Let the tab body fill remaining height (for chat editors). */
  fillBody?: boolean;
  /** Hide the agent-level Cancel / Save footer. */
  hideFooter?: boolean;
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
  subview,
  fillBody = false,
  hideFooter = false,
}: EditAgentViewProps) {
  const colClass = [
    styles['edit-agent__col'],
    fillBody ? styles['edit-agent__col--fill'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  const bodyClass = [
    styles['edit-agent__body'],
    fillBody ? styles['edit-agent__body--fill'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  const main = (
    <div className={colClass}>
      {subview ? (
        <div className={styles['edit-agent__head']}>
          <IconButton
            size="Small"
            aria-label="Back to agent settings"
            onClick={subview.onBack}
            icon={<Icon size="20" glyph={<ArrowLeftIcon />} />}
          />
          <h1 className={styles['edit-agent__title']}>{subview.title}</h1>
        </div>
      ) : (
        <>
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
            tabs={TABS}
            activeKey={activeTab}
            onChange={(key) => onTabChange(key as AgentTabKey)}
            ariaLabel="Agent settings"
          />
        </>
      )}

      <div className={bodyClass}>{children}</div>
    </div>
  );

  return (
    <div className={styles['edit-agent']}>
      <div className={styles['edit-agent__scroll']}>
        {fillBody ? main : <Scrollbars>{main}</Scrollbars>}
      </div>

      {!hideFooter && (
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
      )}
    </div>
  );
}
