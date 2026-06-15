import type { ReactNode } from 'react';
import RestoreIcon from '@mattermost/compass-icons/components/restore';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import Icon from '@/components/ui/Icon/Icon';
import MessageInput from '@/components/ui/MessageInput';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import { RightSidebarHeader } from '@/components/ui/RightSidebar';
import shellStyles from '@/components/ui/ChannelShell/ChannelShell.module.scss';
import { AGENT } from '../channelAutomationsData';
import styles from './AgentsPanel.module.scss';

export interface AgentsPanelProps {
  onClose: () => void;
  children: ReactNode;
}

/**
 * The Agents right sidebar chrome (Figma `4258-47129`): header with a chat-history
 * link and agent selector, a scrolling body, and the ask composer with a
 * trust disclaimer. The body content (empty state or conversation) is passed in.
 */
export default function AgentsPanel({ onClose, children }: AgentsPanelProps) {
  return (
    <aside className={shellStyles['channel-shell__right-sidebar']}>
      <RightSidebarHeader title="Agents" onClose={onClose} />

      <div className={styles['agents__subbar']}>
        <button type="button" className={styles['agents__history']}>
          <Icon size="16" glyph={<RestoreIcon />} />
          <span>View chat history</span>
        </button>
        <button type="button" className={styles['agents__selector']}>
          <UserAvatar src={AGENT.avatarSrc} alt={AGENT.name} size="20" />
          <span className={styles['agents__selector-name']}>{AGENT.name}</span>
          <Icon size="16" glyph={<ChevronDownIcon />} />
        </button>
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
