import { Dropdown, UserAvatar } from '@mattermost/compass-ui';
import { AGENT, agentAvatarProps, agentById } from '../channelAutomationsData';

export interface AgentSelectorProps {
  agentId?: string;
}

export default function AgentSelector({ agentId }: AgentSelectorProps) {
  const agent = agentId ? agentById(agentId) ?? AGENT : AGENT;

  return (
    <Dropdown
      size="Small"
      aria-label={`Agent: ${agent.displayName}`}
      leadingIcon={
        <UserAvatar size="16" {...agentAvatarProps(agent)} />
      }
    >
      {agent.displayName}
    </Dropdown>
  );
}
