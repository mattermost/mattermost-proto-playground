import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import Icon from '@/components/ui/Icon/Icon';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import type { Agent } from '../channelAutomationsData';
import styles from './AgentListItem.module.scss';

export interface AgentListItemProps {
  agent: Agent;
  onSelect: (id: string) => void;
}

/**
 * Agent row in the Agents index list (Figma `4312-17844` Service Header).
 * Opens the agent configuration view when selected.
 */
export default function AgentListItem({ agent, onSelect }: AgentListItemProps) {
  return (
    <button
      type="button"
      className={styles['agent-item']}
      onClick={() => onSelect(agent.id)}
    >
      <div className={styles['agent-item__main']}>
        <div className={styles['agent-item__identity']}>
          <UserAvatar src={agent.avatarSrc} alt={agent.displayName} size="24" />
          <p className={styles['agent-item__name']}>{agent.displayName}</p>
          <p className={styles['agent-item__username']}>
            (@{agent.username})
          </p>
        </div>

        <div className={styles['agent-item__stats']}>
          <span className={styles['agent-item__stat']}>
            <span className={styles['agent-item__stat-dot']} aria-hidden />
            {agent.activeMcps} MCPs Active
          </span>
          <span className={styles['agent-item__stat-divider']} aria-hidden />
          <span className={styles['agent-item__stat']}>
            {agent.toolCount} tools
          </span>
        </div>
      </div>

      <span className={styles['agent-item__chevron']} aria-hidden>
        <Icon size="16" glyph={<ChevronRightIcon />} />
      </span>
    </button>
  );
}
