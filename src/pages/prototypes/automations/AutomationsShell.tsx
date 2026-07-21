import { GlobalHeader, Toast } from '@mattermost/compass-ui';
import { useState, type ReactNode } from 'react';
import avatar from '@/assets/avatars/Danielle Okoro.png';
import { useAutomations } from './context/AutomationsContext';
import ProductNav from './components/ProductNav';
import AiAssistantFab from './components/AiAssistant/AiAssistantFab';
import AiAssistantPanel from './components/AiAssistant/AiAssistantPanel';
import styles from './AutomationsShell.module.scss';

export interface AutomationsShellProps {
  children: ReactNode;
  showProductNav?: boolean;
}

export default function AutomationsShell({
  children,
  showProductNav = true,
}: AutomationsShellProps) {
  const { toast, dismissToast } = useAutomations();
  const [assistantOpen, setAssistantOpen] = useState(false);

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
          {children}
          {assistantOpen ? (
            <AiAssistantPanel onClose={() => setAssistantOpen(false)} />
          ) : null}
          <AiAssistantFab
            open={assistantOpen}
            onToggle={() => setAssistantOpen((v) => !v)}
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
