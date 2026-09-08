import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import { AGENTS_BASE } from './agentsScenes';
import AgentsSceneSwitcher from './components/AgentsSceneSwitcher';
import NewAgentGroupChatModal from './components/NewAgentGroupChatModal';
import NewAgentModal from './components/NewAgentModal';
import ProductSidebar from './components/ProductSidebar';
import { useAgents, type AgentsProduct } from './context/AgentsContext';
import styles from './AgentsShell.module.scss';

function resolveProduct(pathname: string): AgentsProduct {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;
  // Agent DMs under /dm/* stay in the Channels product (Channels LHS).
  if (normalized.startsWith(`${AGENTS_BASE}/dm/`)) {
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
          <div className={styles['agents-shell__product']}>
            <Outlet />
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
          // Route under /agents/:id switches activeProduct to 'agents'.
          navigate(`${AGENTS_BASE}/agents/${agent.id}`);
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
