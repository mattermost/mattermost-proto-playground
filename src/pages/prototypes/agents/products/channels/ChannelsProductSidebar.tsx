import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import MessageTextOutlineIcon from '@mattermost/compass-icons/components/message-text-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import { ChannelSidebarItem } from '@mattermost/compass-ui/components/channel-sidebar-item';
import { ChannelsSidebarCategory } from '@mattermost/compass-ui/components/channels-sidebar';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { buildAgentsChannelsSidebarModel, buildYourAgentsSidebar, type SidebarAgent } from '../../agentsData';
import { AGENTS_BASE } from '../../agentsScenes';
import AgentAvatar from '../../components/AgentAvatar';
import LhsSidebarHeader from '../../components/LhsSidebarHeader';
import PlusMenu from '../../components/PlusMenu';
import { useAgents } from '../../context/AgentsContext';
import styles from './ChannelsProductSidebar.module.scss';

function resolveActiveName(pathname: string): string {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;
  const dmPrefix = `${AGENTS_BASE}/dm/`;
  if (normalized.startsWith(dmPrefix)) return normalized.slice(dmPrefix.length);
  const channelPrefix = `${AGENTS_BASE}/channel/`;
  if (normalized.startsWith(channelPrefix)) return normalized.slice(channelPrefix.length);
  return 'service-status';
}


/**
 * Channels LHS matching ChannelsSidebar chrome (product title + find), with a
 * host-owned plus menu (Create an Agent).
 */
export default function ChannelsProductSidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const {
    openNewAgent,
    customAgents,
    groupChats,
    openedAgentIds,
    sessionsByAgentId,
    activeSessionByAgentId,
    selectSession,
    startNewChat,
  } = useAgents();
  const yourAgents = buildYourAgentsSidebar(customAgents, openedAgentIds, groupChats);
  const [plusOpen, setPlusOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [collapsedByAgentId, setCollapsedByAgentId] = useState<Record<string, boolean>>({});
  const plusRef = useRef<HTMLDivElement>(null);
  const activeName = resolveActiveName(pathname);
  const model = buildAgentsChannelsSidebarModel(activeName);

  const togglePlus = () => {
    const next = !plusOpen;
    setPlusOpen(next);
    if (next && plusRef.current) {
      setAnchorRect(plusRef.current.getBoundingClientRect());
    }
  };

  const onItemClick = (name: string) => {
    if (name === 'service-status') {
      navigate(AGENTS_BASE);
    } else if (name.startsWith('INC-')) {
      navigate(`${AGENTS_BASE}/channel/${name}`);
    }
  };

  const renderAgentBlock = (agent: SidebarAgent, groupKey: string) => {
    const isGroup = Boolean(agent.members?.length);
    const sessions = sessionsByAgentId[agent.id] ?? [];
    const agentActiveSessionId = activeSessionByAgentId[agent.id] ?? '';
    const isActive = activeName === agent.id;
    const hasNestedChats = sessions.length > 0;
    const collapsed = Boolean(collapsedByAgentId[agent.id]);

    const toggleCollapsed = () =>
      setCollapsedByAgentId((prev) => ({
        ...prev,
        [agent.id]: !prev[agent.id],
      }));

    return (
      <div
        key={`${groupKey}-${agent.id}`}
        className={styles['channels-nav__agent-block']}
      >
        <div
          className={[
            styles['channels-nav__agent-row'],
            !isGroup ? styles['channels-nav__agent-row--dm'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {hasNestedChats ? (
            <button
              type="button"
              className={[
                styles['channels-nav__agent-chevron'],
                collapsed ? styles['channels-nav__agent-chevron--collapsed'] : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label={
                collapsed
                  ? `Expand ${agent.name} chats`
                  : `Collapse ${agent.name} chats`
              }
              aria-expanded={!collapsed}
              onClick={(e) => {
                e.stopPropagation();
                toggleCollapsed();
              }}
            >
              <Icon glyph={<ChevronDownIcon />} size="12" />
            </button>
          ) : null}
          {!isGroup ? (
            <span className={styles['channels-nav__agent-avatar']} aria-hidden>
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
            leadingVisual={isGroup ? 'group-message' : 'direct-message'}
            memberCount={isGroup ? agent.members!.length : undefined}
            avatarSrc={isGroup ? undefined : ''}
            avatarAlt={isGroup ? undefined : agent.name}
            showAvatarStatus={isGroup ? undefined : false}
            active={isActive && (sessions.length === 0 || collapsed)}
            onClick={() => {
              if (sessions.length > 0) {
                if (!isActive) {
                  // Coming from elsewhere: open last used session and expand.
                  const targetId = agentActiveSessionId || sessions[0].id;
                  selectSession(agent.id, targetId);
                  setCollapsedByAgentId((prev) => ({ ...prev, [agent.id]: false }));
                  navigate(`${AGENTS_BASE}/dm/${agent.id}`);
                } else {
                  toggleCollapsed();
                }
              } else {
                navigate(`${AGENTS_BASE}/dm/${agent.id}`);
              }
            }}
          />
          <span className={styles['channels-nav__agent-new']}>
            <IconButton
              size="x-small"
              style="inverted"
              icon={<PlusIcon size={12} />}
              aria-label={`New chat with ${agent.name}`}
              onClick={(e) => {
                e.stopPropagation();
                startNewChat(agent.id);
                navigate(`${AGENTS_BASE}/dm/${agent.id}`);
              }}
            />
          </span>
        </div>
        {sessions.length > 0 ? (
          <div
            className={[
              styles['channels-nav__sessions-collapse'],
              !collapsed ? styles['channels-nav__sessions-collapse--expanded'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-hidden={collapsed}
          >
            <ul
              className={styles['channels-nav__sessions']}
              aria-label={`${agent.name} chats`}
            >
              {sessions.map((session) => {
                const active = isActive && session.id === agentActiveSessionId;
                return (
                  <li key={session.id}>
                    <button
                      type="button"
                      className={[
                        styles['channels-nav__session'],
                        active ? styles['channels-nav__session--active'] : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      tabIndex={collapsed ? -1 : 0}
                      onClick={() => {
                        selectSession(agent.id, session.id);
                        navigate(`${AGENTS_BASE}/dm/${agent.id}`);
                      }}
                    >
                      <span
                        className={styles['channels-nav__session-icon']}
                        aria-hidden
                      >
                        <Icon glyph={<MessageTextOutlineIcon />} size="16" />
                      </span>
                      <span className={styles['channels-nav__session-label']}>
                        {session.preview}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <aside className={styles['channels-nav']}>
      <LhsSidebarHeader
        productName="Channels"
        findLabel="Find channels"
        plusAriaLabel="Create"
        plusExpanded={plusOpen}
        plusHasPopup="menu"
        onPlusClick={togglePlus}
        plusAnchorRef={plusRef}
      />

      <Scrollbar
        className={styles['channels-nav__scroll']}
        color="--sidebar-text-rgb"
      >
        <div className={styles['channels-nav__top']}>
          {model.topGroupItems.map((item) => (
            <ChannelSidebarItem key={item.name} {...item} />
          ))}
        </div>

        {model.groups.map((group) => (
          <div key={group.key} className={styles['channels-nav__group']}>
            <ChannelsSidebarCategory
              label={group.category.label}
              showChevron={group.category.showChevron}
              showPlusButton={group.category.showPlusButton}
            />
            {group.key === 'agents'
              ? yourAgents.map((agent) => renderAgentBlock(agent, group.key))
              : group.items.map((item) => (
                  <ChannelSidebarItem
                    key={`${group.key}-${item.name}`}
                    {...item}
                    onClick={
                      item.name === 'service-status' || item.name.startsWith('INC-')
                        ? () => onItemClick(item.name)
                        : undefined
                    }
                  />
                ))}
          </div>
        ))}
      </Scrollbar>

      <PlusMenu
        open={plusOpen}
        anchorRect={anchorRect}
        onClose={() => setPlusOpen(false)}
        onCreateAgent={openNewAgent}
      />
    </aside>
  );
}
