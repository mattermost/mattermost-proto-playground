import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import AgentsGlobalHeader from '../agents/components/AgentsGlobalHeader';
import MattyFab from '../agents/components/MattyFab';
import MattyPanel from '../agents/components/MattyPanel';
import NewAgentGroupChatModal from '../agents/components/NewAgentGroupChatModal';
import NewAgentModal from '../agents/components/NewAgentModal';
import ProductSidebar from '../agents/components/ProductSidebar';
import { useAgents, type AgentsProduct } from '../agents/context/AgentsContext';
import { STAFF_TEAM_LOGO } from './agentsDocsData';
import { AGENTS_DOCS_BASE, type AgentsDocsSceneId } from './agentsDocsScenes';
import AgentsDocsSceneDropdown from './components/AgentsDocsSceneDropdown';
import DocsChannelHome from './products/channels/DocsChannelHome';
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
  if (normalized.startsWith(`${AGENTS_DOCS_BASE}/dm/`)) return 'channels';
  if (normalized.startsWith(`${AGENTS_DOCS_BASE}/agents/`)) return 'matty-chat';
  if (normalized === `${AGENTS_DOCS_BASE}/agents`) {
    if (search.includes('fte=1')) return 'group-chat';
    return 'all-agents';
  }
  if (search.includes('scene=grounding')) return 'grounding';
  if (search.includes('scene=review')) return 'review';
  if (search.includes('scene=approval')) return 'approval';
  if (search.includes('scene=later-that-week')) return 'later-that-week';
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
    closeNewGroupChat,
    addGroupChat,
    customAgents,
    mattyPanelOpen,
    setMattyPanelOpen,
  } = useAgents();

  const activeScene = resolveDocsScene(pathname, search, newAgentOpen);
  const activeProduct = resolveProduct(pathname);
  const isChannelScene =
    activeScene === 'channels' ||
    activeScene === 'grounding' ||
    activeScene === 'review' ||
    activeScene === 'approval' ||
    activeScene === 'later-that-week';

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
    mattyPanelOpen,
    setMattyPanelOpen,
  ]);

  return (
    <div className={styles['agents-shell']}>
      <div className={styles['agents-shell__frame']}>
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
          <MattyPanel />
          <MattyFab />
          <div className={styles['agents-shell__product']}>
            <div
              className={[
                styles['agents-shell__channel-view'],
                isChannelScene ? styles['agents-shell__channel-view--active'] : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <DocsChannelHome activeScene={activeScene} />
            </div>
            {!isChannelScene && <Outlet />}
          </div>
        </div>
      </div>

      <NewAgentModal
        open={newAgentOpen}
        onClose={closeNewAgent}
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
