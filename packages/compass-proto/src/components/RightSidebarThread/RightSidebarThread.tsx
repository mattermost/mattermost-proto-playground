import type { ReactNode } from 'react';
import {
  Message,
  MessageSeparator,
  messageStyles,
} from '@mattermost/compass-ui';
import styles from './RightSidebarThread.module.scss';

export interface RightSidebarThreadMessage {
  avatarSrc?: string;
  avatarAlt: string;
  username: string;
  timestamp: string;
  body: ReactNode;
}

export interface RightSidebarThreadProps {
  messages?: RightSidebarThreadMessage[];
  replySeparatorLabel?: string;
}

const DEFAULT_MESSAGES: RightSidebarThreadMessage[] = [
  {
    avatarAlt: 'Leonard Riley',
    username: 'Leonard Riley',
    timestamp: 'Today at 9:41 AM',
    body: (
      <p className={messageStyles['message__body-text']}>
        Quick gut-check: should the sidebar header always show the parent channel
        as a secondary title, or only when the content is scoped to a channel?
      </p>
    ),
  },
  {
    avatarAlt: 'Aiko Tan',
    username: 'Aiko Tan',
    timestamp: 'Today at 9:48 AM',
    body: (
      <p className={messageStyles['message__body-text']}>
        I&apos;d lean on showing it whenever there&apos;s a meaningful parent —
        threads, pinned messages, files. Skip it for global views like Saved
        Messages.
      </p>
    ),
  },
  {
    avatarAlt: 'Danielle Okoro',
    username: 'Danielle Okoro',
    timestamp: 'Today at 9:52 AM',
    body: (
      <p className={messageStyles['message__body-text']}>
        +1. The divider treatment also reads as &quot;scoped to&quot; which
        reinforces the relationship.
      </p>
    ),
  },
];

export default function RightSidebarThread({
  messages = DEFAULT_MESSAGES,
  replySeparatorLabel = '7 replies',
}: RightSidebarThreadProps) {
  const [first, ...rest] = messages;

  return (
    <div className={styles['right-sidebar-thread']}>
      <div className={styles['right-sidebar-thread__messages-list']}>
        {first != null && (
          <Message
            avatarSrc={first.avatarSrc}
            avatarAlt={first.avatarAlt}
            username={first.username}
            timestamp={first.timestamp}
          >
            {first.body}
          </Message>
        )}
        {rest.length > 0 && (
          <MessageSeparator type="Reply Count" label={replySeparatorLabel} />
        )}
        {rest.map((message) => (
          <Message
            key={`${message.username}-${message.timestamp}`}
            avatarSrc={message.avatarSrc}
            avatarAlt={message.avatarAlt}
            username={message.username}
            timestamp={message.timestamp}
          >
            {message.body}
          </Message>
        ))}
      </div>
    </div>
  );
}
