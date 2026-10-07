import { Tooltip } from '@mattermost/compass-ui/components/tooltip';
import { MATTY, resolveSingleAgentProfile } from '../../agents/agentsData';
import AgentAvatar from '../../agents/components/AgentAvatar';
import { useAgents } from '../../agents/context/AgentsContext';
import styles from './MattyHeaderButton.module.scss';

export default function MattyHeaderButton({ focusId }: { focusId?: string }) {
  const { mattyPanelOpen, setMattyPanelOpen, customAgents } = useAgents();
  const profile = resolveSingleAgentProfile(MATTY.id, customAgents);

  return (
    <button
      type="button"
      className={styles['matty-header-button']}
      aria-label={mattyPanelOpen ? 'Close Matty' : 'Ask Matty'}
      aria-pressed={mattyPanelOpen}
      data-wt-focus={focusId}
      onClick={() => setMattyPanelOpen(!mattyPanelOpen)}
    >
      <AgentAvatar
        shape={profile.shape}
        color={profile.color}
        size="xs"
        eyes
        shadow={false}
        imageSrc={profile.customImageSrc ?? undefined}
      />
      <span className={styles['matty-header-button__tooltip']} aria-hidden>
        <Tooltip label="Ask Matty" arrow="top" />
      </span>
    </button>
  );
}
