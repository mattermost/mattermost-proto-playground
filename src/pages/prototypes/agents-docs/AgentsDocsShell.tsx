import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import AgentsGlobalHeader from '../agents/components/AgentsGlobalHeader';
import MattyPanel from '../agents/components/MattyPanel';
import NewAgentGroupChatModal from '../agents/components/NewAgentGroupChatModal';
import NewAgentModal from '../agents/components/NewAgentModal';
import ProductSidebar from '../agents/components/ProductSidebar';
import { MATTY, resolveSingleAgentProfile } from '../agents/agentsData';
import { useAgents, type AgentsProduct } from '../agents/context/AgentsContext';
import { STAFF_TEAM_LOGO } from './agentsDocsData';
import { AGENTS_DOCS_BASE, type AgentsDocsSceneId } from './agentsDocsScenes';
import AgentsDocsSceneDropdown from './components/AgentsDocsSceneDropdown';
import DocsChannelHome from './products/channels/DocsChannelHome';
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
  if (search.includes('scene=grounding')) return 'grounding';
  if (search.includes('scene=review')) return 'review';
  if (search.includes('scene=approval')) return 'approval';
  if (search.includes('scene=later-that-week')) return 'later-that-week';
  if (search.includes('scene=docs-outage')) return 'docs-outage';
  return 'channels';
}

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
    mattyPanelOpen,
    setMattyPanelOpen,
  } = useAgents();

  const activeScene = resolveDocsScene(pathname, search, newAgentOpen);
  const activeProduct = resolveProduct(pathname);
  // Derive channel-view visibility from the URL only — opening the new-agent modal
  // should not hide the channel content that sits behind it.
  const baseScene = resolveDocsScene(pathname, search, false);
  const isChannelScene =
    baseScene === 'channels' ||
    baseScene === 'grounding' ||
    baseScene === 'review' ||
    baseScene === 'approval' ||
    baseScene === 'later-that-week';
  const isOutageScene = baseScene === 'docs-outage';

  const handleDropdownOpenChange = useCallback(
    (open: boolean) => setDropdownOpen(open),
    [],
  );

  useEffect(() => {
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
    dropdownOpen,
    handleDropdownOpenChange,
    newAgentOpen,
    openNewAgent,
    closeNewAgent,
    openNewGroupChat,
    mattyPanelOpen,
    setMattyPanelOpen,
  ]);

  const mattyProfile = resolveSingleAgentProfile(MATTY.id, customAgents);

  return (
    <div className={styles['agents-shell']}>
      <div className={styles['agents-shell__frame']}>
        <AgentsGlobalHeader
          className={styles['agents-shell__header']}
          teamName="Staff"
          teamLogoSrc={STAFF_TEAM_LOGO}
          mattyPanelOpen={mattyPanelOpen}
          onMattyToggle={() => setMattyPanelOpen(!mattyPanelOpen)}
          mattyProfile={mattyProfile}
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
          <MattyPanel basePath={AGENTS_DOCS_BASE} />
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
              <DocsIncidentChannel />
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
