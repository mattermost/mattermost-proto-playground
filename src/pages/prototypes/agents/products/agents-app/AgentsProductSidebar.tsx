import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import CodeBracketsIcon from '@mattermost/compass-icons/components/code-brackets';
import LightningBoltOutlineIcon from '@mattermost/compass-icons/components/lightning-bolt-outline';
import { ChannelSidebarItem } from '@mattermost/compass-ui/components/channel-sidebar-item';
import { ChannelsSidebarCategory } from '@mattermost/compass-ui/components/channels-sidebar';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { AGENTS_BASE } from '../../agentsScenes';
import { MATTY } from '../../agentsData';
import AgentAvatar from '../../components/AgentAvatar';
import LhsSidebarHeader from '../../components/LhsSidebarHeader';
import { useAgents } from '../../context/AgentsContext';
import styles from './AgentsProductSidebar.module.scss';

/** `all-agents` landing, or a chat agent id (`matty`, `sentinel`, …). */
export type AgentsNavId = 'all-agents' | string;

type AgentsProductSidebarProps = {
  activeNav: AgentsNavId;
};

function NavRow({
  name,
  glyph,
  active,
  onClick,
}: {
  name: string;
  glyph: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <div className={styles['agents-product-sidebar__nav-row']}>
      <span className={styles['agents-product-sidebar__nav-icon']} aria-hidden>
        <Icon size="16" glyph={glyph} />
      </span>
      <ChannelSidebarItem
        name={name}
        leadingVisual="insights"
        active={active}
        onClick={onClick}
      />
    </div>
  );
}

/** Agents product LHS — All agents, tools, and Your agents list. */
export default function AgentsProductSidebar({
  activeNav,
}: AgentsProductSidebarProps) {
  const navigate = useNavigate();
  const { openNewAgent, customAgents } = useAgents();

  return (
    <aside className={styles['agents-product-sidebar']} aria-label="Agents">
      <LhsSidebarHeader
        productName="Agents"
        findLabel="Find agents"
        plusAriaLabel="Create agent"
        onPlusClick={openNewAgent}
      />

      <Scrollbar
        className={styles['agents-product-sidebar__scroll']}
        color="--sidebar-text-rgb"
      >
        <div className={styles['agents-product-sidebar__nav-top']}>
          <NavRow
            name="All agents"
            glyph={<CreationOutlineIcon />}
            active={activeNav === 'all-agents'}
            onClick={() => navigate(`${AGENTS_BASE}/agents`)}
          />
          <NavRow name="Custom Prompts" glyph={<CodeBracketsIcon />} />
          <NavRow name="Automations" glyph={<LightningBoltOutlineIcon />} />
        </div>

        <div className={styles['agents-product-sidebar__nav-group']}>
          <ChannelsSidebarCategory label="Your agents" showChevron />
          <div className={styles['agents-product-sidebar__agent-row']}>
            <span
              className={styles['agents-product-sidebar__agent-avatar']}
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
              active={activeNav === MATTY.id}
              onClick={() => navigate(`${AGENTS_BASE}/agents/${MATTY.id}`)}
            />
          </div>
          {customAgents.map((agent) => (
            <div
              key={agent.id}
              className={styles['agents-product-sidebar__agent-row']}
            >
              <span
                className={styles['agents-product-sidebar__agent-avatar']}
                aria-hidden
              >
                <AgentAvatar
                  shape={agent.shape}
                  color={agent.color}
                  size="xs"
                  eyes
                />
              </span>
              <ChannelSidebarItem
                name={agent.name}
                leadingVisual="direct-message"
                active={activeNav === agent.id}
                onClick={() =>
                  navigate(`${AGENTS_BASE}/agents/${agent.id}`)
                }
              />
            </div>
          ))}
        </div>
      </Scrollbar>
    </aside>
  );
}
