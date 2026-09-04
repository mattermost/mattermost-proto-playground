import { ChannelHeader } from '@mattermost/compass-ui/components/channel-header';
import { Message } from '@mattermost/compass-ui/components/message';
import { MessageInput } from '@mattermost/compass-ui/components/message-input';
import { MessageSeparator } from '@mattermost/compass-ui/components/message-separator';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { SERVICE_STATUS_MESSAGES } from '../../agentsData';
import ChannelsProductSidebar from './ChannelsProductSidebar';
import styles from './ChannelsHome.module.scss';

/** Channels product — quiet `#service-status` home for the vision demo. */
export default function ChannelsHome() {
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
              {SERVICE_STATUS_MESSAGES.map((message) => (
                <Message
                  key={message.id}
                  avatarSrc={message.avatarSrc}
                  avatarAlt={message.avatarAlt}
                  username={message.username}
                  timestamp={message.timestamp}
                >
                  <p className={styles['channels-home__post']}>{message.body}</p>
                </Message>
              ))}
            </div>
          </Scrollbar>
        </div>
        <div className={styles['channels-home__composer']}>
          <MessageInput placeholder="Write to service-status" />
        </div>
      </div>
    </div>
  );
}
