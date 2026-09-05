import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import { AGENTS_BASE } from './agentsScenes';
import AgentsSceneSwitcher from './components/AgentsSceneSwitcher';
import NewAgentModal from './components/NewAgentModal';
import ProductSidebar from './components/ProductSidebar';
import { useAgents, type AgentsProduct } from './context/AgentsContext';
import styles from './AgentsShell.module.scss';

function resolveProduct(pathname: string): AgentsProduct {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;
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
 * Modal is shell-mounted so Channels and Agents can both open it.
 */
export default function AgentsShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { setCenterSlot } = usePrototypeChrome();
  const { newAgentOpen, closeNewAgent, openNewAgent, addCreatedAgent } =
    useAgents();
  const activeProduct = resolveProduct(pathname);

  useEffect(() => {
    setCenterSlot(
      <AgentsSceneSwitcher
        newAgentOpen={newAgentOpen}
        openNewAgent={openNewAgent}
        closeNewAgent={closeNewAgent}
      />,
    );
    return () => setCenterSlot(null);
  }, [
    setCenterSlot,
    newAgentOpen,
    openNewAgent,
    closeNewAgent,
  ]);

  return (
    <div className={styles['agents-shell']}>
      <div className={styles['agents-shell__frame']}>
        <div className={styles['agents-shell__body']}>
          <ProductSidebar
            activeProduct={activeProduct}
            onSelectProduct={(product) => {
              closeNewAgent();
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
          const agent = addCreatedAgent(draft);
          closeNewAgent();
          // Route under /agents/:id switches activeProduct to 'agents'.
          navigate(`${AGENTS_BASE}/agents/${agent.id}`);
        }}
      />
    </div>
  );
}
