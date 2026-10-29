import { useParams } from 'react-router-dom';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { ChannelHeader } from '@mattermost/compass-proto';
import MentionMessageInput from '../../components/MentionMessageInput';
import { useAgents } from '../../context/AgentsContext';
import ChannelIntro from './ChannelIntro';
import ChannelsProductSidebar from './ChannelsProductSidebar';
import homeStyles from './ChannelsHome.module.scss';
import styles from './CreatedChannelView.module.scss';

/** Center view for a channel created from the Matty panel. */
export default function CreatedChannelView({ basePath }: { basePath?: string } = {}) {
  const { channelId } = useParams<{ channelId: string }>();
  const { createdChannels } = useAgents();
  const channel = createdChannels.find((item) => item.id === channelId);

  if (!channel) return null;

  return (
    <div className={homeStyles['channels-home']}>
      <ChannelsProductSidebar basePath={basePath} activeChannelName={channel.name} />
      <div className={homeStyles['channels-home__inner']}>
        <div className={homeStyles['channels-home__center']}>
          <ChannelHeader
            type="channel"
            name={channel.name}
            description={channel.purpose}
            memberCount={1}
            pinnedCount={0}
          />
          <div className={styles['created-channel__messages']}>
            <Scrollbar>
              <div className={styles['created-channel__list']}>
                <ChannelIntro
                  name={channel.name}
                  createdBy="Priya"
                  createdAt="just now"
                  description={channel.purpose}
                  variant={channel.type}
                />
                {channel.board ? (
                  <p className={styles['created-channel__system']}>
                    Matty created a board for this channel.
                  </p>
                ) : null}
              </div>
            </Scrollbar>
          </div>
          <div className={styles['created-channel__composer']}>
            <MentionMessageInput placeholder={`Write to ${channel.name}`} onSend={() => undefined} />
          </div>
        </div>
      </div>
    </div>
  );
}
