import { GlobalHeader, Toast } from '@mattermost/compass-ui';
import { Outlet, useLocation } from 'react-router-dom';
import avatar from '@/assets/avatars/Danielle Okoro.png';
import { useAutomations } from './context/AutomationsContext';
import ProductNav from './components/ProductNav';
import AiAssistantFab from './components/AiAssistant/AiAssistantFab';
import AiAssistantPanel from './components/AiAssistant/AiAssistantPanel';
import styles from './AutomationsShell.module.scss';

const BASE = '/prototypes/automations';

function shouldShowProductNav(pathname: string) {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;
  return (
    normalized === BASE ||
    normalized === `${BASE}/templates`
  );
}

/**
 * Persistent product chrome for Automations. Uses an Outlet so the AI FAB /
 * assistant stay mounted across route changes (e.g. Home → editor).
 */
export default function AutomationsShell() {
  const { pathname } = useLocation();
  const {
    toast,
    dismissToast,
    assistantOpen,
    setAssistantOpen,
  } = useAutomations();
  const showProductNav = shouldShowProductNav(pathname);

  return (
    <div className={styles['automations-shell']}>
      <div className={styles['automations-shell__global-header']}>
        <GlobalHeader
          product="Automations"
          userAvatarSrc={avatar}
          userAvatarAlt="Danielle Okoro"
        />
      </div>
      <div className={styles['automations-shell__body']}>
        {showProductNav ? (
          <aside className={styles['automations-shell__nav']}>
            <ProductNav />
          </aside>
        ) : null}
        <div className={styles['automations-shell__main']}>
          <Outlet />
          <AiAssistantPanel />
          <AiAssistantFab
            open={assistantOpen}
            onToggle={() => setAssistantOpen(!assistantOpen)}
          />
        </div>
      </div>
      {toast ? (
        <div className={styles['automations-shell__toast']}>
          <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />
        </div>
      ) : null}
    </div>
  );
}
