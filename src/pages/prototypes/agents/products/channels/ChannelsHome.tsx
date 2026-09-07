import { useEffect, useRef, useState } from 'react';
import { Chip } from '@mattermost/compass-ui/components/chip';
import { ChannelHeader } from '@mattermost/compass-ui/components/channel-header';
import { Message } from '@mattermost/compass-ui/components/message';
import { MessageSeparator } from '@mattermost/compass-ui/components/message-separator';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import {
  SERVICE_STATUS_MESSAGES,
  VIEWER,
  type ChannelMessage,
  type ChannelMessagePart,
} from '../../agentsData';
import MentionMessageInput from '../../components/MentionMessageInput';
import mentionStyles from '../../components/MentionMessageInput.module.scss';
import ChannelsProductSidebar from './ChannelsProductSidebar';
import styles from './ChannelsHome.module.scss';

function formatChannelTime(date = new Date()) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function MessageBody({
  body,
  parts,
}: {
  body: string;
  parts?: ChannelMessagePart[];
}) {
  if (!parts?.length) {
    return <p className={styles['channels-home__post']}>{body}</p>;
  }

  return (
    <p className={mentionStyles['mention-input__post']}>
      {parts.map((part, index) =>
        part.type === 'text' ? (
          <span key={`t-${index}`}>{part.text}</span>
        ) : (
          <Chip
            key={`m-${part.id}-${index}`}
            size="small"
            colored
            leadingAvatar={{ src: part.avatarSrc, alt: part.label }}
            className={[
              mentionStyles['mention-input__post-chip'],
              part.kind === 'agent'
                ? mentionStyles['mention-input__post-chip--agent']
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {part.label}
          </Chip>
        ),
      )}
    </p>
  );
}

/** Channels product — quiet `#service-status` home for the vision demo. */
export default function ChannelsHome() {
  const [messages, setMessages] = useState<ChannelMessage[]>(
    SERVICE_STATUS_MESSAGES,
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  const handleSend = ({
    parts,
    body,
  }: {
    parts: ChannelMessagePart[];
    body: string;
  }) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `live-${Date.now()}`,
        username: VIEWER.name,
        avatarSrc: VIEWER.avatarSrc,
        avatarAlt: VIEWER.avatarAlt,
        timestamp: formatChannelTime(),
        body,
        parts,
      },
    ]);
  };

  return (
    <div className={styles['channels-home']}>
      <ChannelsProductSidebar />
      <div className={styles['channels-home__center']}>
        <ChannelHeader
          type="channel"
          name="service-status"
          description="Customer-facing reliability and checkout health."
          memberCount={6}
          pinnedCount={1}
        />
        <div className={styles['channels-home__messages']}>
          <Scrollbar>
            <div className={styles['channels-home__messages-list']}>
              <MessageSeparator type="date" label="Today" />
              {messages.map((message) => (
                <Message
                  key={message.id}
                  avatarSrc={message.avatarSrc}
                  avatarAlt={message.avatarAlt}
                  username={message.username}
                  timestamp={message.timestamp}
                  showMessageActions={false}
                >
                  <MessageBody body={message.body} parts={message.parts} />
                </Message>
              ))}
              <div ref={bottomRef} />
            </div>
          </Scrollbar>
        </div>
        <div className={styles['channels-home__composer']}>
          <MentionMessageInput
            placeholder="Write to service-status"
            onSend={handleSend}
          />
        </div>
      </div>
    </div>
  );
}
