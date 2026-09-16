import { MATTY, resolveSingleAgentProfile } from '../agentsData';
import { useAgents } from '../context/AgentsContext';
import AgentAvatar from './AgentAvatar';
import styles from './MattyFab.module.scss';

export default function MattyFab() {
  const { mattyPanelOpen, setMattyPanelOpen, customAgents } = useAgents();
  const mattyProfile = resolveSingleAgentProfile(MATTY.id, customAgents);

  return (
    <button
      type="button"
      className={[
        styles['matty-fab'],
        mattyPanelOpen ? styles['matty-fab--open'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={mattyPanelOpen ? 'Close Matty' : 'Ask Matty'}
      aria-pressed={mattyPanelOpen}
      onClick={() => setMattyPanelOpen(!mattyPanelOpen)}
    >
      <span className={styles['matty-fab__label']}>Ask Matty</span>
      <span className={styles['matty-fab__avatar']}>
        <AgentAvatar
          shape={mattyProfile.shape}
          color={mattyProfile.color}
          size="md"
          eyes
          shadow={false}
          imageSrc={mattyProfile.customImageSrc ?? undefined}
        />
      </span>
    </button>
  );
}
