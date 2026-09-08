import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { SearchInput } from '@mattermost/compass-ui/components/search-input';
import { Tag } from '@mattermost/compass-ui/components/tag';
import { AGENTS_BASE } from '../../agentsScenes';
import {
  MATTY,
  buildWorkspaceDirectory,
  formatChannelList,
  type WorkspaceAgent,
} from '../../agentsData';
import AgentAvatar from '../../components/AgentAvatar';
import { useAgents } from '../../context/AgentsContext';
import AgentsProductSidebar from './AgentsProductSidebar';
import styles from './AgentsLanding.module.scss';

function FirstTimeHome({
  onChatMatty,
  onCreate,
}: {
  onChatMatty: () => void;
  onCreate: () => void;
}) {
  return (
    <div className={styles['agents-landing__fte']}>
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
          <Button emphasis="tertiary" onClick={onChatMatty}>
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
          <Button emphasis="primary" onClick={onCreate}>
            Get started
          </Button>
        </article>
      </div>
    </div>
  );
}

function DirectoryHome({
  agents,
  onOpenAgent,
  onCreate,
}: {
  agents: WorkspaceAgent[];
  onOpenAgent: (id: string) => void;
  onCreate: () => void;
}) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return agents;
    return agents.filter((agent) => {
      const channels = formatChannelList(agent.channels).toLowerCase();
      return (
        agent.name.toLowerCase().includes(q) ||
        agent.role.toLowerCase().includes(q) ||
        agent.owner.toLowerCase().includes(q) ||
        (agent.managedBy ?? '').toLowerCase().includes(q) ||
        channels.includes(q)
      );
    });
  }, [agents, query]);

  return (
    <div className={styles['agents-landing__directory']}>
      <div className={styles['agents-landing__dir-header']}>
        <div className={styles['agents-landing__dir-heading']}>
          <h1 className={styles['agents-landing__dir-title']}>All agents</h1>
          <p className={styles['agents-landing__dir-subtitle']}>
            Agents live at the workspace level — like people. Invite them into
            any channel that needs them.
          </p>
        </div>
        <Button
          emphasis="tertiary"
          leadingIcon={<Icon glyph={<PlusIcon />} size="16" />}
          onClick={onCreate}
        >
          Create an agent
        </Button>
      </div>

      <SearchInput
        placeholder="Find agents"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onClear={() => setQuery('')}
        aria-label="Find agents"
      />

      <div className={styles['agents-landing__dir-list']}>
        <div className={styles['agents-landing__dir-cols']} aria-hidden>
          <span>Agent</span>
          <span>Role</span>
          <span>Created by</span>
          <span>Channels</span>
        </div>
        <Scrollbar className={styles['agents-landing__dir-scroll']}>
          <div className={styles['agents-landing__dir-rows']}>
            {filtered.map((agent) => (
              <button
                key={agent.id}
                type="button"
                className={styles['agents-landing__row']}
                onClick={() => onOpenAgent(agent.id)}
              >
                <span className={styles['agents-landing__row-agent']}>
                  <AgentAvatar
                    shape={agent.shape}
                    color={agent.color}
                    size="xs"
                    eyes
                    imageSrc={agent.customImageSrc}
                  />
                  <span className={styles['agents-landing__row-name']}>
                    {agent.name}
                  </span>
                  {agent.fresh ? (
                    <Tag label="New" type="info" size="x-small" />
                  ) : null}
                </span>
                <span className={styles['agents-landing__row-role']}>
                  <Tag label={agent.role} size="x-small" />
                </span>
                <span className={styles['agents-landing__row-owner']}>
                  {agent.managedBy ? (
                    <Tag
                      label={`Managed by ${agent.managedBy}`}
                      type="info-dim"
                      size="x-small"
                    />
                  ) : (
                    <span>{agent.owner}</span>
                  )}
                </span>
                <span className={styles['agents-landing__row-channels']}>
                  {formatChannelList(agent.channels)}
                </span>
              </button>
            ))}
          </div>
        </Scrollbar>
      </div>
    </div>
  );
}

/** Agents product homepage — FTE when only Matty exists, directory otherwise. */
export default function AgentsLanding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { openNewAgent, customAgents } = useAgents();
  const forceFte = searchParams.get('fte') === '1';
  const showFte = forceFte || customAgents.length === 0;
  const directory = useMemo(
    () => buildWorkspaceDirectory(customAgents),
    [customAgents],
  );

  return (
    <div className={styles['agents-landing']}>
      <AgentsProductSidebar activeNav="all-agents" />

      <div
        className={[
          styles['agents-landing__center'],
          showFte
            ? styles['agents-landing__center--fte']
            : styles['agents-landing__center--directory'],
        ].join(' ')}
      >
        {showFte ? (
          <FirstTimeHome
            onChatMatty={() => navigate(`${AGENTS_BASE}/agents/matty`)}
            onCreate={openNewAgent}
          />
        ) : (
          <DirectoryHome
            agents={directory}
            onOpenAgent={(id) => navigate(`${AGENTS_BASE}/agents/${id}`)}
            onCreate={openNewAgent}
          />
        )}
      </div>
    </div>
  );
}
