import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import { useRegisterWalkthrough, useWalkthrough } from '@/walkthrough';
import AgentsGlobalHeader from '../agents/components/AgentsGlobalHeader';
import MattyFab from '../agents/components/MattyFab';
import MattyPanel from '../agents/components/MattyPanel';
import NewAgentGroupChatModal from '../agents/components/NewAgentGroupChatModal';
import NewAgentModal from '../agents/components/NewAgentModal';
import ProductSidebar from '../agents/components/ProductSidebar';
import { useAgents, type AgentsProduct } from '../agents/context/AgentsContext';
import { STAFF_TEAM_LOGO } from './agentsDocsData';
import { AGENTS_DOCS_BASE, type AgentsDocsSceneId } from './agentsDocsScenes';
import { agentsDocsWalkthrough } from './agentsDocsWalkthrough';
import {
  DOCS_CONTEXT_OPTIONS,
  DOCS_INCIDENT_CONTEXT,
  DOCS_SITE_CONTEXT,
  docsThreadContext,
} from './docsMattyContext';
import type { MattyContextChip } from '../agents/components/mattyContext';
import AgentsDocsSceneDropdown from './components/AgentsDocsSceneDropdown';
import DocsChannelHome, { type DocsWalkthroughState } from './products/channels/DocsChannelHome';
import DocsIncidentChannel from './products/channels/DocsIncidentChannel';
import styles from './AgentsDocsShell.module.scss';

function resolveDocsScene(
  pathname: string,
  search: string,
  newAgentOpen: boolean,
): AgentsDocsSceneId {
  if (newAgentOpen) return 'new-agent';
  const normalized =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;
  if (normalized.startsWith(`${AGENTS_DOCS_BASE}/dm/`)) return 'dm';
  if (normalized.startsWith(`${AGENTS_DOCS_BASE}/agents/`)) return 'matty-chat';
  if (normalized === `${AGENTS_DOCS_BASE}/agents`) {
    if (search.includes('fte=1')) return 'group-chat';
    if (search.includes('view=all')) return 'all-agents-list';
    return 'all-agents';
  }
  if (search.includes('scene=agent-profile')) return 'agent-profile';
  if (search.includes('scene=grounding')) return 'grounding';
  if (search.includes('scene=review')) return 'review';
  if (search.includes('scene=approval')) return 'approval';
  if (search.includes('scene=later-that-week')) return 'later-that-week';
  if (search.includes('scene=docs-outage')) return 'docs-outage';
  if (normalized.startsWith(`${AGENTS_DOCS_BASE}/channel/INC-`)) return 'docs-outage';
  return 'channels';
}

const WALKTHROUGH_SCENE_LOCATIONS: Partial<
  Record<AgentsDocsSceneId, { path: string; query?: string }>
> = {
  channels: { path: AGENTS_DOCS_BASE },
  grounding: { path: AGENTS_DOCS_BASE, query: 'scene=grounding' },
  review: { path: AGENTS_DOCS_BASE, query: 'scene=review' },
  approval: { path: AGENTS_DOCS_BASE, query: 'scene=approval' },
  'later-that-week': { path: AGENTS_DOCS_BASE, query: 'scene=later-that-week' },
  'docs-outage': { path: AGENTS_DOCS_BASE, query: 'scene=docs-outage' },
  'matty-chat': { path: `${AGENTS_DOCS_BASE}/dm/matty` },
  'all-agents': { path: `${AGENTS_DOCS_BASE}/agents` },
  'all-agents-list': { path: `${AGENTS_DOCS_BASE}/agents`, query: 'view=all' },
};

function resolveProduct(pathname: string): AgentsProduct {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;
  if (
    normalized === `${AGENTS_DOCS_BASE}/agents` ||
    normalized.startsWith(`${AGENTS_DOCS_BASE}/agents/`)
  ) {
    return 'agents';
  }
  return 'channels';
}

export default function AgentsDocsShell() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const { setStartSlot } = usePrototypeChrome();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const {
    newAgentOpen,
    closeNewAgent,
    openNewAgent,
    addCreatedAgent,
    newGroupChatOpen,
    openNewGroupChat,
    closeNewGroupChat,
    addGroupChat,
    customAgents,
    createdChannels,
    mattyPanelOpen,
    setMattyPanelOpen,
  } = useAgents();

  const { active: walkthroughActive } = useWalkthrough();

  const navigateRef = useRef(navigate);
  const searchRef = useRef(search);
  const closeModalsRef = useRef(() => {});
  navigateRef.current = navigate;
  searchRef.current = search;
  closeModalsRef.current = () => {
    closeNewAgent();
    closeNewGroupChat();
  };

  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [docsWalkthroughState, setDocsWalkthroughState] = useState<DocsWalkthroughState>({});

  const onWalkthroughScene = useCallback((next: string, sceneState?: Record<string, unknown>) => {
    setMattyPanelOpen(sceneState?.mattyPanel === true);
    setDocsWalkthroughState({
      settleThread: sceneState?.settleThread === true,
      expandDelegation: sceneState?.expandDelegation === true,
      openMonitorThread: sceneState?.openMonitorThread === true,
      profileAgent: typeof sceneState?.profileAgent === 'string' ? sceneState.profileAgent : undefined,
    });
    const target = WALKTHROUGH_SCENE_LOCATIONS[next as AgentsDocsSceneId];
    if (!target) return;
    closeModalsRef.current();
    const params = new URLSearchParams(target.query);
    const current = new URLSearchParams(searchRef.current);
    ['walkthrough', 'step'].forEach((key) => {
      const value = current.get(key);
      if (value) params.set(key, value);
    });
    navigateRef.current(
      { pathname: target.path, search: `?${params.toString()}` },
      { replace: true },
    );
  }, [setMattyPanelOpen]);

  useRegisterWalkthrough(agentsDocsWalkthrough, { onScene: onWalkthroughScene });

  const activeProduct = resolveProduct(pathname);
  // Derive channel-view visibility from the URL only — opening the new-agent modal
  // should not hide the channel content that sits behind it.
  const baseScene = resolveDocsScene(pathname, search, false);
  const isCreatedChannel = createdChannels.some(
    (channel) => pathname.replace(/\/$/, '') === `${AGENTS_DOCS_BASE}/channel/${channel.id}`,
  );
  const isChannelScene =
    !isCreatedChannel && (
    baseScene === 'channels' ||
    baseScene === 'grounding' ||
    baseScene === 'agent-profile' ||
    baseScene === 'review' ||
    baseScene === 'approval' ||
    baseScene === 'later-that-week');
  const isOutageScene = baseScene === 'docs-outage' && !isCreatedChannel;

  const createdChannelId = createdChannels.find(
    (channel) => pathname.replace(/\/$/, '') === `${AGENTS_DOCS_BASE}/channel/${channel.id}`,
  )?.id;

  // The channel or thread the user is looking at, offered to Matty as context.
  let mattyDefaultContext: MattyContextChip | null = null;
  if (createdChannelId) {
    mattyDefaultContext = { id: `channel:${createdChannelId}`, kind: 'channel', label: createdChannelId };
  } else if (isOutageScene) {
    mattyDefaultContext = DOCS_INCIDENT_CONTEXT;
  } else if (isChannelScene) {
    mattyDefaultContext =
      (activeThreadId && docsThreadContext(activeThreadId)) || DOCS_SITE_CONTEXT;
  }

  const mattyContextOptions = useMemo(() => {
    const created = createdChannels.map<MattyContextChip>((channel) => ({
      id: `channel:${channel.id}`,
      kind: 'channel',
      label: channel.name,
    }));
    const channelOptions = DOCS_CONTEXT_OPTIONS.filter((option) => option.kind === 'channel');
    const threadOptions = DOCS_CONTEXT_OPTIONS.filter((option) => option.kind === 'thread');
    return [...channelOptions, ...created, ...threadOptions];
  }, [createdChannels]);

  const handleDropdownOpenChange = useCallback(
    (open: boolean) => setDropdownOpen(open),
    [],
  );

  useEffect(() => {
    if (walkthroughActive) {
      setStartSlot(null);
      return () => setStartSlot(null);
    }
    setStartSlot(
      <AgentsDocsSceneDropdown
        open={dropdownOpen}
        onOpenChange={handleDropdownOpenChange}
        newAgentOpen={newAgentOpen}
        openNewAgent={openNewAgent}
        closeNewAgent={closeNewAgent}
        openNewGroupChat={openNewGroupChat}
        mattyPanelOpen={mattyPanelOpen}
        setMattyPanelOpen={setMattyPanelOpen}
      />,
    );
    return () => setStartSlot(null);
  }, [
    setStartSlot,
    walkthroughActive,
    dropdownOpen,
    handleDropdownOpenChange,
    newAgentOpen,
    openNewAgent,
    closeNewAgent,
    openNewGroupChat,
    mattyPanelOpen,
    setMattyPanelOpen,
  ]);

  return (
    <div className={styles['agents-shell']}>
      <div className={styles['agents-shell__frame']} data-wt-shell>
        <AgentsGlobalHeader
          className={styles['agents-shell__header']}
          teamName="Staff"
          teamLogoSrc={STAFF_TEAM_LOGO}
        />
        <div className={styles['agents-shell__body']}>
          <ProductSidebar
            activeProduct={activeProduct}
            onSelectProduct={(product) => {
              closeNewAgent();
              closeNewGroupChat();
              navigate(
                product === 'agents'
                  ? `${AGENTS_DOCS_BASE}/agents`
                  : AGENTS_DOCS_BASE,
              );
            }}
          />
          <MattyPanel
            basePath={AGENTS_DOCS_BASE}
            focusId="docs-matty-panel"
            defaultContext={mattyDefaultContext}
            contextOptions={mattyContextOptions}
          />
          <MattyFab focusId="docs-matty-fab" />
          <div className={styles['agents-shell__product']}>
            <div
              className={[
                styles['agents-shell__channel-view'],
                isChannelScene ? styles['agents-shell__channel-view--active'] : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <DocsChannelHome
                activeScene={baseScene}
                onPlaybookApprove={() => navigate(`${AGENTS_DOCS_BASE}?scene=docs-outage`)}
                walkthroughState={walkthroughActive ? docsWalkthroughState : undefined}
                onActiveThreadChange={setActiveThreadId}
              />
            </div>
            <div
              className={[
                styles['agents-shell__channel-view'],
                isOutageScene ? styles['agents-shell__channel-view--active'] : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <DocsIncidentChannel active={isOutageScene} />
            </div>
            {!isChannelScene && !isOutageScene && <Outlet />}
          </div>
        </div>
      </div>

      <NewAgentModal
        open={newAgentOpen}
        onClose={closeNewAgent}
        defaultName=""
        defaultPurpose=""
        onSave={(draft) => {
          const agent = addCreatedAgent({
            ...draft,
            description: draft.description ?? draft.purpose,
          });
          closeNewAgent();
          if (activeProduct === 'channels') {
            navigate(`${AGENTS_DOCS_BASE}/dm/${agent.id}`);
          } else {
            navigate(`${AGENTS_DOCS_BASE}/agents/${agent.id}`);
          }
        }}
      />

      <NewAgentGroupChatModal
        open={newGroupChatOpen}
        customAgents={customAgents}
        onClose={closeNewGroupChat}
        onStart={(memberIds) => {
          const chat = addGroupChat(memberIds);
          closeNewGroupChat();
          navigate(`${AGENTS_DOCS_BASE}/agents/${chat.id}`);
        }}
      />
    </div>
  );
}
