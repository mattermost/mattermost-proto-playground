import { useParams } from 'react-router-dom';
import AgentChat from '../agents-app/AgentChat';
import ChannelsProductSidebar from './ChannelsProductSidebar';
import styles from './ChannelsHome.module.scss';

/**
 * Agent DM inside the Channels product — Channels LHS stays; center is AgentChat.
 */
export default function ChannelsAgentDm() {
  const { agentId = 'matty' } = useParams<{ agentId: string }>();

  return (
    <div className={styles['channels-home']}>
      <ChannelsProductSidebar />
      <div className={styles['channels-home__inner']}>
        <div className={styles['channels-home__center']}>
          <AgentChat agentId={agentId} embedded />
        </div>
      </div>
    </div>
  );
}
