import { useCallback, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import CodeBracketsIcon from '@mattermost/compass-icons/components/code-brackets';
import MessageTextOutlineIcon from '@mattermost/compass-icons/components/message-text-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import { ChannelSidebarItem } from '@mattermost/compass-ui/components/channel-sidebar-item';
import { ChannelsSidebarCategory } from '@mattermost/compass-ui/components/channels-sidebar';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
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
    sessionsByAgentId,
    activeSessionByAgentId,
    selectSession,
    startNewChat,
  } = useAgents();
  const yourAgents = buildYourAgentsSidebar(
    customAgents,
    openedAgentIds,
    groupChats,
  );
  const [plusOpen, setPlusOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [collapsedByAgentId, setCollapsedByAgentId] = useState<
    Record<string, boolean>
  >({});
  const plusRef = useRef<HTMLDivElement>(null);

  const closePlus = useCallback(() => setPlusOpen(false), []);

  const togglePlus = () => {
    const next = !plusOpen;
    setPlusOpen(next);
    if (next && plusRef.current) {
      setAnchorRect(plusRef.current.getBoundingClientRect());
    }
  };

  const toggleAgentCollapsed = (agentId: string) => {
    setCollapsedByAgentId((prev) => ({
      ...prev,
      [agentId]: !prev[agentId],
    }));
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
          <ChannelsSidebarCategory label="Your agents" showChevron={false} />
          {yourAgents.map((agent) => {
            const isGroup = Boolean(agent.members?.length);
            const sessions = sessionsByAgentId[agent.id] ?? [];
            const activeSessionId = activeSessionByAgentId[agent.id];
            const hasNestedChats = sessions.length > 1;
            const sessionsCollapsed = Boolean(collapsedByAgentId[agent.id]);
            const showSessions = sessions.length > 0 && !sessionsCollapsed;
            return (
              <div
                key={agent.id}
                className={styles['agents-product-sidebar__agent-block']}
              >
                <div
                  className={[
                    styles['agents-product-sidebar__agent-row'],
                    isGroup
                      ? ''
                      : styles['agents-product-sidebar__agent-row--dm'],
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {hasNestedChats ? (
                    <button
                      type="button"
                      className={[
                        styles['agents-product-sidebar__agent-chevron'],
                        sessionsCollapsed
                          ? styles[
                              'agents-product-sidebar__agent-chevron--collapsed'
                            ]
                          : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      aria-label={
                        sessionsCollapsed
                          ? `Expand ${agent.name} chats`
                          : `Collapse ${agent.name} chats`
                      }
                      aria-expanded={!sessionsCollapsed}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleAgentCollapsed(agent.id);
                      }}
                    >
                      <Icon glyph={<ChevronDownIcon />} size="12" />
                    </button>
                  ) : null}
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
                    active={activeNav === agent.id && sessions.length === 0}
                    onClick={() =>
                      navigate(`${AGENTS_BASE}/agents/${agent.id}`)
                    }
                  />
                  <span
                    className={styles['agents-product-sidebar__agent-new']}
                  >
                    <IconButton
                      size="x-small"
                      style="inverted"
                      icon={<PlusIcon size={12} />}
                      aria-label={`New chat with ${agent.name}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        startNewChat(agent.id);
                        navigate(`${AGENTS_BASE}/agents/${agent.id}`);
                      }}
                    />
                  </span>
                </div>
                {showSessions ? (
                  <ul
                    className={styles['agents-product-sidebar__sessions']}
                    aria-label={`${agent.name} chats`}
                  >
                    {sessions.map((session) => {
                      const active =
                        activeNav === agent.id &&
                        session.id === activeSessionId;
                      return (
                        <li key={session.id}>
                          <button
                            type="button"
                            className={[
                              styles['agents-product-sidebar__session'],
                              active
                                ? styles[
                                    'agents-product-sidebar__session--active'
                                  ]
                                : '',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            onClick={() => {
                              selectSession(agent.id, session.id);
                              navigate(`${AGENTS_BASE}/agents/${agent.id}`);
                            }}
                          >
                            <span
                              className={
                                styles['agents-product-sidebar__session-icon']
                              }
                              aria-hidden
                            >
                              <Icon
                                glyph={<MessageTextOutlineIcon />}
                                size="16"
                              />
                            </span>
                            <span
                              className={
                                styles['agents-product-sidebar__session-label']
                              }
                            >
                              {session.preview}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
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
