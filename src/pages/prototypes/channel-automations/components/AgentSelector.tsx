import Dropdown from '@/components/ui/Dropdown/Dropdown';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import { AGENT } from '../channelAutomationsData';

/**
 * The agent picker shown in the Agents panel and the Automations RHS header —
 * automations belong to an agent, so the selector conveys which agent owns
 * them. Built on the shared Dropdown trigger.
 */
export default function AgentSelector() {
  return (
    <Dropdown
      size="Small"
      aria-label={`Agent: ${AGENT.displayName}`}
      leadingIcon={<UserAvatar src={AGENT.avatarSrc} alt={AGENT.displayName} size="16" />}
    >
      {AGENT.displayName}
    </Dropdown>
  );
}
