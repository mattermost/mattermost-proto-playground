import type { ReactNode } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import CodeBracketsIcon from '@mattermost/compass-icons/components/code-brackets';
import LightningBoltOutlineIcon from '@mattermost/compass-icons/components/lightning-bolt-outline';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import { Button } from '@mattermost/compass-ui/components/button';
import { ChannelSidebarItem } from '@mattermost/compass-ui/components/channel-sidebar-item';
import { ChannelsSidebarCategory } from '@mattermost/compass-ui/components/channels-sidebar';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { MATTY } from '../../agentsData';
import AgentAvatar from '../../components/AgentAvatar';
import { useAgents } from '../../context/AgentsContext';
import styles from './AgentsLanding.module.scss';

function NavRow({
  name,
  glyph,
  active,
}: {
  name: string;
  glyph: ReactNode;
  active?: boolean;
}) {
  return (
    <div className={styles['agents-landing__nav-row']}>
      <span className={styles['agents-landing__nav-icon']} aria-hidden>
        <Icon size="16" glyph={glyph} />
      </span>
      <ChannelSidebarItem
        name={name}
        leadingVisual="insights"
        active={active}
      />
    </div>
  );
}

/** Agents product first-time experience — Meet your first agent. */
export default function AgentsLanding() {
  const { openNewAgent } = useAgents();

  return (
    <div className={styles['agents-landing']}>
      <aside className={styles['agents-landing__nav']}>
        <div className={styles['agents-landing__nav-header']}>
          <div
            className={styles['agents-landing__find']}
            role="search"
            aria-label="Find agents"
          >
            <span className={styles['agents-landing__find-icon']} aria-hidden>
              <MagnifyIcon size={16} />
            </span>
            <span className={styles['agents-landing__find-label']}>
              Find agents
            </span>
          </div>
          <IconButton
            size="small"
            style="inverted"
            icon={<Icon glyph={<PlusIcon />} size="16" />}
            aria-label="Create agent"
            onClick={openNewAgent}
          />
        </div>

        <Scrollbar
          className={styles['agents-landing__scroll']}
          color="--sidebar-text-rgb"
        >
          <div className={styles['agents-landing__nav-top']}>
            <NavRow
              name="All agents"
              glyph={<CreationOutlineIcon />}
              active
            />
            <NavRow name="Custom Prompts" glyph={<CodeBracketsIcon />} />
            <NavRow name="Automations" glyph={<LightningBoltOutlineIcon />} />
          </div>

          <div className={styles['agents-landing__nav-group']}>
            <ChannelsSidebarCategory label="Your agents" showChevron />
            <div className={styles['agents-landing__agent-row']}>
              <span
                className={styles['agents-landing__agent-avatar']}
                aria-hidden
              >
                <AgentAvatar
                  shape={MATTY.shape}
                  color={MATTY.color}
                  size="xs"
                  eyes
                />
              </span>
              <ChannelSidebarItem
                name={MATTY.name}
                leadingVisual="direct-message"
              />
            </div>
          </div>
        </Scrollbar>
      </aside>

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
            />
            <h2 className={styles['agents-landing__card-title']}>
              {MATTY.name}
            </h2>
            <p className={styles['agents-landing__card-body']}>
              {MATTY.description}
            </p>
            <Button emphasis="secondary">Chat with Matty</Button>
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
            <h2 className={styles['agents-landing__card-title']}>
              Create your own
            </h2>
            <p className={styles['agents-landing__card-body']}>
              Create a custom agent you can share or keep for your private use.
            </p>
            <Button emphasis="primary" onClick={openNewAgent}>
              Get started
            </Button>
          </article>
        </div>
      </div>
    </div>
  );
}
