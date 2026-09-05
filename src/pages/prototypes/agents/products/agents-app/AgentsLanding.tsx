import { useNavigate } from 'react-router-dom';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { AGENTS_BASE } from '../../agentsScenes';
import { MATTY } from '../../agentsData';
import AgentAvatar from '../../components/AgentAvatar';
import { useAgents } from '../../context/AgentsContext';
import AgentsProductSidebar from './AgentsProductSidebar';
import styles from './AgentsLanding.module.scss';

/** Agents product first-time experience — Meet your first agent. */
export default function AgentsLanding() {
  const navigate = useNavigate();
  const { openNewAgent } = useAgents();

  return (
    <div className={styles['agents-landing']}>
      <AgentsProductSidebar activeNav="all-agents" />

      <div className={styles['agents-landing__center']}>
        <div className={styles['agents-landing__intro']}>
          <h1 className={styles['agents-landing__title']}>
            Meet your first agent
          </h1>
          <p className={styles['agents-landing__subtitle']}>
            You can work with many agents personally or alongside your team.
          </p>
        </div>

        <div className={styles['agents-landing__cards']}>
          <article className={styles['agents-landing__card']}>
            <AgentAvatar
              shape={MATTY.shape}
              color={MATTY.color}
              size="lg"
              eyes
              shadow
            />
            <div className={styles['agents-landing__card-copy']}>
              <h2 className={styles['agents-landing__card-title']}>
                {MATTY.name}
              </h2>
              <p className={styles['agents-landing__card-body']}>
                {MATTY.description}
              </p>
            </div>
            <Button
              emphasis="tertiary"
              onClick={() => navigate(`${AGENTS_BASE}/agents/matty`)}
            >
              Chat with Matty
            </Button>
          </article>

          <article
            className={[
              styles['agents-landing__card'],
              styles['agents-landing__card--create'],
            ].join(' ')}
          >
            <span className={styles['agents-landing__create-icon']} aria-hidden>
              <Icon glyph={<PlusIcon />} size="32" />
            </span>
            <div className={styles['agents-landing__card-copy']}>
              <h2 className={styles['agents-landing__card-title']}>
                Create your own
              </h2>
              <p className={styles['agents-landing__card-body']}>
                Create a custom agent you can share or keep for your private use.
              </p>
            </div>
            <Button emphasis="primary" onClick={openNewAgent}>
              Get started
            </Button>
          </article>
        </div>
      </div>
    </div>
  );
}
