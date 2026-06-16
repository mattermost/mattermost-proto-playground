import type { ReactNode } from 'react';
import Message from '@/components/ui/Message/Message';
import { AGENT, CURRENT_USER } from '../channelAutomationsData';
import styles from './AgentChatMessage.module.scss';

const TIMESTAMP = 'Just now';

export interface ChatMessageProps {
  children: ReactNode;
  /** Override the timestamp shown next to the author. */
  timestamp?: string;
}

/**
 * Agent-authored chat message. All agent conversations (the create flow and the
 * automation editor) render through the shared `Message` component so chat
 * messages match the product's message styling everywhere.
 */
export function AgentMessage({ children, timestamp = TIMESTAMP }: ChatMessageProps) {
  return (
    <Message
      avatarSrc={AGENT.avatarSrc}
      avatarAlt={AGENT.displayName}
      username={AGENT.displayName}
      timestamp={timestamp}
      isBot
      botLabel="AGENT"
      showMessageActions={false}
    >
      {children}
    </Message>
  );
}

/** User-authored reply in an agent chat. */
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

/** Standard text body for a chat message (matches message typography). */
export function ChatText({ children }: { children: ReactNode }) {
  return <p className={styles['text']}>{children}</p>;
}
