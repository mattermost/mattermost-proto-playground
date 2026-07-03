import type { ReactNode } from 'react';
import Message from '@/components/ui/Message/Message';
import { CURRENT_USER, type Agent } from '../channelAutomationsData';
import styles from './AgentChatMessage.module.scss';

const TIMESTAMP = 'Just now';

export interface ChatMessageProps {
  children: ReactNode;
  agent?: Agent;
  timestamp?: string;
}

export function AgentMessage({
  children,
  agent,
  timestamp = TIMESTAMP,
}: ChatMessageProps) {
  const displayName = agent?.displayName ?? 'Agent';
  const avatarAlt = agent?.displayName ?? 'Agent';

  return (
    <Message
      avatarSrc={agent?.avatarSrc}
      avatarFallbackColor={agent?.avatarFallbackColor}
      avatarAlt={avatarAlt}
      username={displayName}
      timestamp={timestamp}
      isBot
      botLabel="AGENT"
      showMessageActions={false}
    >
      {children}
    </Message>
  );
}

export function UserMessage({ children, timestamp = TIMESTAMP }: ChatMessageProps) {
  return (
    <Message
      avatarSrc={CURRENT_USER.avatarSrc}
      avatarAlt={CURRENT_USER.name}
      username={CURRENT_USER.name}
      timestamp={timestamp}
      showMessageActions={false}
    >
      {children}
    </Message>
  );
}

export function ChatText({ children }: { children: ReactNode }) {
  return <p className={styles['text']}>{children}</p>;
}
