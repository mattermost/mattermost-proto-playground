import { GlobalHeader, Toast } from '@mattermost/compass-ui';
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import avatar from '@/assets/avatars/Danielle Okoro.png';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import { useAutomations } from './context/AutomationsContext';
import AutomationsSceneSwitcher from './components/AutomationsSceneSwitcher';
import ProductNav from './components/ProductNav';
import AiAssistantFab from './components/AiAssistant/AiAssistantFab';
import AiAssistantPanel from './components/AiAssistant/AiAssistantPanel';
import styles from './AutomationsShell.module.scss';

const BASE = '/prototypes/automations';

function shouldShowSideChrome(pathname: string) {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;
  // Keep the product nav on list and run-history routes; hide only on the editor.
  return !new RegExp(`^${BASE}/[^/]+/editor$`).test(normalized);
}

/**
 * Automations chrome with an outer/inner panel layout and Channels-style
 * product sidebar. Team sidebar is omitted — teams are represented as
 * folders on Home. Product nav hides on the editor for a focused canvas.
 */
export default function AutomationsShell() {
  const { pathname } = useLocation();
  const { setCenterSlot } = usePrototypeChrome();
  const {
    toast,
    dismissToast,
    assistantOpen,
    setAssistantOpen,
    createBlank,
    demoEmpty,
    setDemoEmpty,
  } = useAutomations();
  const showSideChrome = shouldShowSideChrome(pathname);

  useEffect(() => {
    setCenterSlot(
      <AutomationsSceneSwitcher
        createBlank={createBlank}
        demoEmpty={demoEmpty}
        setDemoEmpty={setDemoEmpty}
      />,
    );
    return () => setCenterSlot(null);
  }, [createBlank, demoEmpty, setDemoEmpty, setCenterSlot]);

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
        <div className={styles['automations-shell__outer-panel']}>
          {showSideChrome ? (
            <aside className={styles['automations-shell__nav']}>
              <ProductNav />
            </aside>
          ) : null}
          <div
            className={[
              styles['automations-shell__inner-panel'],
              !showSideChrome ? styles['automations-shell__inner-panel--flush'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div className={styles['automations-shell__main']}>
              <Outlet />
              <AiAssistantPanel />
              <AiAssistantFab
                open={assistantOpen}
                onToggle={() => setAssistantOpen(!assistantOpen)}
              />
            </div>
          </div>
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
