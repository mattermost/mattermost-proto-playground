import { useCallback, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import CodeBracketsIcon from '@mattermost/compass-icons/components/code-brackets';
import { ChannelSidebarItem } from '@mattermost/compass-ui/components/channel-sidebar-item';
import { ChannelsSidebarCategory } from '@mattermost/compass-ui/components/channels-sidebar';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { AGENTS_BASE } from '../../agentsScenes';
import { buildYourAgentsSidebar } from '../../agentsData';
import AgentAvatar from '../../components/AgentAvatar';
import AgentsPlusMenu from '../../components/AgentsPlusMenu';
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
  const {
    openNewAgent,
    openNewGroupChat,
    customAgents,
    groupChats,
    openedAgentIds,
  } = useAgents();
  const yourAgents = buildYourAgentsSidebar(
    customAgents,
    openedAgentIds,
    groupChats,
  );
  const [plusOpen, setPlusOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const plusRef = useRef<HTMLDivElement>(null);

  const closePlus = useCallback(() => setPlusOpen(false), []);

  const togglePlus = () => {
    const next = !plusOpen;
    setPlusOpen(next);
    if (next && plusRef.current) {
      setAnchorRect(plusRef.current.getBoundingClientRect());
    }
  };

  return (
    <aside className={styles['agents-product-sidebar']} aria-label="Agents">
      <LhsSidebarHeader
        productName="Agents"
        findLabel="Find agents"
        plusAriaLabel="Create"
        plusExpanded={plusOpen}
        plusHasPopup="menu"
        onPlusClick={togglePlus}
        plusAnchorRef={plusRef}
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
        </div>

        <div className={styles['agents-product-sidebar__nav-group']}>
          <ChannelsSidebarCategory label="Your agents" showChevron />
          {yourAgents.map((agent) => {
            const isGroup = Boolean(agent.members?.length);
            return (
              <div
                key={agent.id}
                className={[
                  styles['agents-product-sidebar__agent-row'],
                  isGroup
                    ? ''
                    : styles['agents-product-sidebar__agent-row--dm'],
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {!isGroup ? (
                  <span
                    className={styles['agents-product-sidebar__agent-avatar']}
                    aria-hidden
                  >
                    <AgentAvatar
                      shape={agent.shape}
                      color={agent.color}
                      size="xs"
                      eyes
                      imageSrc={agent.customImageSrc}
                    />
                  </span>
                ) : null}
                <ChannelSidebarItem
                  name={agent.name}
                  leadingVisual={
                    isGroup ? 'group-message' : 'direct-message'
                  }
                  memberCount={
                    isGroup ? agent.members!.length : undefined
                  }
                  active={activeNav === agent.id}
                  onClick={() =>
                    navigate(`${AGENTS_BASE}/agents/${agent.id}`)
                  }
                />
              </div>
            );
          })}
        </div>
      </Scrollbar>

      <AgentsPlusMenu
        open={plusOpen}
        anchorRect={anchorRect}
        excludeRef={plusRef}
        onClose={closePlus}
        onCreateAgent={openNewAgent}
        onNewGroupChat={openNewGroupChat}
      />
    </aside>
  );
}
