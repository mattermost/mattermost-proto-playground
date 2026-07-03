import { Icon, MessageInput, Scrollbars } from '@mattermost/compass-ui';
import type { ReactNode } from 'react';
import ClockOutlineIcon from '@mattermost/compass-icons/components/clock-outline';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import LightningBoltOutlineIcon from '@mattermost/compass-icons/components/lightning-bolt-outline';
import { RightSidebarHeader } from '@mattermost/compass-ui';
import { shellStyles } from '@mattermost/compass-ui';
import AgentSelector from './AgentSelector';
import styles from './AgentsPanel.module.scss';

export interface AgentsPanelProps {
  onClose: () => void;
  /** Open the automations management surface. */
  onViewAutomations: () => void;
  children: ReactNode;
}

/**
 * The Agents right sidebar chrome (Figma `4258-47129`): header with the agent
 * selector beside the title, Chats / Automations shortcuts, a scrolling body,
 * and the ask composer with a trust disclaimer.
 */
export default function AgentsPanel({
  onClose,
  onViewAutomations,
  children,
}: AgentsPanelProps) {
  return (
    <aside className={shellStyles['channel-shell__right-sidebar']}>
      <RightSidebarHeader
        title="Agents"
        onClose={onClose}
        secondaryContent={<AgentSelector />}
      />

      <div className={styles['agents__subbar']}>
        <button type="button" className={styles['agents__subbar-btn']}>
          <Icon size="12" glyph={<ClockOutlineIcon />} />
          <span>Chat history</span>
        </button>
        <div className={styles['agents__subbar-actions']}>
          <button
            type="button"
            className={styles['agents__subbar-btn']}
            onClick={onViewAutomations}
          >
            <Icon size="12" glyph={<LightningBoltOutlineIcon />} />
            <span>Automations</span>
          </button>
          <button type="button" className={styles['agents__subbar-btn']}>
            <span>Tools</span>
            <Icon size="12" glyph={<ChevronDownIcon />} />
          </button>
        </div>
      </div>

      <div className={shellStyles['channel-shell__right-sidebar-body']}>
        <Scrollbars className={styles['agents__scroll']}>
          <div className={styles['agents__body']}>{children}</div>
        </Scrollbars>
      </div>

      <div className={styles['agents__composer']}>
        <p className={styles['agents__disclaimer']}>
          This bot can make mistakes. Double-check responses.
        </p>
        <MessageInput
          placeholder="Ask anything…"
          width="narrow"
          showFormatting={false}
          showEmoji={false}
        />
      </div>
    </aside>
  );
}
