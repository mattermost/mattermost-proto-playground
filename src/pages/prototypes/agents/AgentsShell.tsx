import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import { AGENTS_BASE } from './agentsScenes';
import AgentsSceneSwitcher from './components/AgentsSceneSwitcher';
import MattyFab from './components/MattyFab';
import MattyPanel from './components/MattyPanel';
import NewAgentGroupChatModal from './components/NewAgentGroupChatModal';
import NewAgentModal from './components/NewAgentModal';
import ProductSidebar from './components/ProductSidebar';
import { useAgents, type AgentsProduct } from './context/AgentsContext';
import ChannelsHome from './products/channels/ChannelsHome';
import IncidentChannel from './products/channels/IncidentChannel';
import styles from './AgentsShell.module.scss';

function resolveProduct(pathname: string): AgentsProduct {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;
  // Agent DMs and incident channels stay in the Channels product (Channels LHS).
  if (
    normalized.startsWith(`${AGENTS_BASE}/dm/`) ||
    normalized.startsWith(`${AGENTS_BASE}/channel/`)
  ) {
    return 'channels';
  }
  // /agents and /agents/matty (and future agent chats) stay in Agents product.
  if (
    normalized === `${AGENTS_BASE}/agents` ||
    normalized.startsWith(`${AGENTS_BASE}/agents/`)
  ) {
    return 'agents';
  }
  return 'channels';
}

/**
 * Shared chrome: Product Sidebar + product outlet.
 * Modals are shell-mounted so Channels and Agents can both open them.
 */
export default function AgentsShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { setCenterSlot } = usePrototypeChrome();
  const {
    newAgentOpen,
    closeNewAgent,
    openNewAgent,
    addCreatedAgent,
    ensureSentinel,
    newGroupChatOpen,
    closeNewGroupChat,
    addGroupChat,
    customAgents,
  } = useAgents();
  const activeProduct = resolveProduct(pathname);

  const normalized =
    pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  const isChannelsHome =
    normalized === AGENTS_BASE || normalized === `${AGENTS_BASE}/`;
  const isIncidentChannel = normalized.startsWith(`${AGENTS_BASE}/channel/`);
  const isChannelView = isChannelsHome || isIncidentChannel;

  useEffect(() => {
    setCenterSlot(
      <AgentsSceneSwitcher
        newAgentOpen={newAgentOpen}
        openNewAgent={openNewAgent}
        closeNewAgent={closeNewAgent}
        ensureSentinel={ensureSentinel}
      />,
    );
    return () => setCenterSlot(null);
  }, [
    setCenterSlot,
    newAgentOpen,
    openNewAgent,
    closeNewAgent,
    ensureSentinel,
  ]);

  return (
    <div className={styles['agents-shell']}>
      <div className={styles['agents-shell__frame']}>
        <div className={styles['agents-shell__body']}>
          <ProductSidebar
            activeProduct={activeProduct}
            onSelectProduct={(product) => {
              closeNewAgent();
              closeNewGroupChat();
              navigate(
                product === 'agents' ? `${AGENTS_BASE}/agents` : AGENTS_BASE,
              );
            }}
          />
          <MattyPanel />
          <MattyFab />
          <div className={styles['agents-shell__product']}>
            <div className={[
              styles['agents-shell__channel-view'],
              isChannelsHome ? styles['agents-shell__channel-view--active'] : '',
            ].filter(Boolean).join(' ')}>
              <ChannelsHome />
            </div>
            <div className={[
              styles['agents-shell__channel-view'],
              isIncidentChannel ? styles['agents-shell__channel-view--active'] : '',
            ].filter(Boolean).join(' ')}>
              <IncidentChannel />
            </div>
            {!isChannelView && <Outlet />}
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
            // Stay in Channels — open the new agent as a DM.
            navigate(`${AGENTS_BASE}/dm/${agent.id}`);
          } else {
            navigate(`${AGENTS_BASE}/agents/${agent.id}`);
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
          navigate(`${AGENTS_BASE}/agents/${chat.id}`);
        }}
      />
    </div>
  );
}
