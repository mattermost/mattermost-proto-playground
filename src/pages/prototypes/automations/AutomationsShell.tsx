import { GlobalHeader, TeamSidebar, Toast } from '@mattermost/compass-ui';
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import avatar from '@/assets/avatars/Danielle Okoro.png';
import avatarStaffTeam from '@/assets/avatars/Staff Team.png';
import { usePrototypeChrome } from '@/contexts/PrototypeChromeContext';
import { useAutomations } from './context/AutomationsContext';
import AutomationsSceneSwitcher from './components/AutomationsSceneSwitcher';
import ProductNav from './components/ProductNav';
import AiAssistantFab from './components/AiAssistant/AiAssistantFab';
import AiAssistantPanel from './components/AiAssistant/AiAssistantPanel';
import styles from './AutomationsShell.module.scss';

const BASE = '/prototypes/automations';

const TEAM_NAME = 'Contributors';
const ACTIVE_TEAM_ID = 'contributors';
const TEAMS = [
  { id: 'contributors', name: TEAM_NAME, src: avatarStaffTeam },
  { id: 'design', name: 'Design', initials: 'De', unread: true },
  { id: 'acme', name: 'Acme', initials: 'Ac', mentions: 3 },
];

function shouldShowProductNav(pathname: string) {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;
  return normalized === BASE || normalized === `${BASE}/templates`;
}

/**
 * Automations chrome following ChannelShell panel nesting (team sidebar +
 * outer/inner rounded containers) with a Channels-style product sidebar.
 */
export default function AutomationsShell() {
  const { pathname } = useLocation();
  const { setCenterSlot } = usePrototypeChrome();
  const { toast, dismissToast, assistantOpen, setAssistantOpen, createBlank } =
    useAutomations();
  const showProductNav = shouldShowProductNav(pathname);

  useEffect(() => {
    setCenterSlot(<AutomationsSceneSwitcher createBlank={createBlank} />);
    return () => setCenterSlot(null);
  }, [createBlank, setCenterSlot]);

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
        <div className={styles['automations-shell__team-sidebar']}>
          <TeamSidebar activeTeamId={ACTIVE_TEAM_ID} teams={TEAMS} />
        </div>
        <div className={styles['automations-shell__outer-panel']}>
          {showProductNav ? (
            <aside className={styles['automations-shell__nav']}>
              <ProductNav teamName={TEAM_NAME} />
            </aside>
          ) : null}
          <div
            className={[
              styles['automations-shell__inner-panel'],
              !showProductNav ? styles['automations-shell__inner-panel--flush'] : '',
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
