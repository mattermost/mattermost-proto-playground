import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import { Switch } from '@mattermost/compass-ui';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './AutomationsSceneSwitcher.module.scss';

const BASE = '/prototypes/automations';

type AutomationsSceneId =
  | 'home'
  | 'folders'
  | 'templates'
  | 'secrets'
  | 'new'
  | 'runs';

const AUTOMATIONS_SCENES: Array<{ id: AutomationsSceneId; label: string }> = [
  { id: 'home', label: 'Home' },
  { id: 'folders', label: 'Folders' },
  { id: 'templates', label: 'Templates' },
  { id: 'secrets', label: 'Variables & secrets' },
  { id: 'new', label: 'New automation' },
  { id: 'runs', label: 'Run history' },
];

function resolveAutomationsScene(pathname: string): AutomationsSceneId | '' {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;

  if (normalized === BASE || normalized === `${BASE}/`) return 'home';
  if (normalized.startsWith(`${BASE}/folders`)) return 'folders';
  if (normalized.startsWith(`${BASE}/templates`)) return 'templates';
  if (normalized.startsWith(`${BASE}/secrets`)) return 'secrets';
  if (normalized === `${BASE}/runs` || /\/runs(\/|$)/.test(normalized)) return 'runs';
  return '';
}

type AutomationsSceneSwitcherProps = {
  /** Creates a blank automation and returns its id. Passed from the shell. */
  createBlank: () => string;
  /** Prototype-only empty-state preview. */
  demoEmpty: boolean;
  setDemoEmpty: (empty: boolean) => void;
};

/**
 * Prototype chrome scene switcher for key Automations screens.
 * Rendered in PrototypeTopNav (outside AutomationsProvider), so actions
 * that need context are injected as props from AutomationsShell.
 */
export default function AutomationsSceneSwitcher({
  createBlank,
  demoEmpty,
  setDemoEmpty,
}: AutomationsSceneSwitcherProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const activeId = useMemo(
    () => resolveAutomationsScene(pathname),
    [pathname],
  );

  const onChange = (id: string) => {
    switch (id as AutomationsSceneId) {
      case 'home':
        navigate(BASE);
        return;
      case 'folders':
        navigate(`${BASE}/folders`);
        return;
      case 'templates':
        navigate(`${BASE}/templates`);
        return;
      case 'secrets':
        navigate(`${BASE}/secrets`);
        return;
      case 'new': {
        const blankId = createBlank();
        navigate(`${BASE}/${blankId}/editor`);
        return;
      }
      case 'runs':
        navigate(`${BASE}/runs`);
        return;
      default:
        return;
    }
  };

  return (
    <div className={styles['scene-chrome']}>
      <SceneSwitcher
        scenes={AUTOMATIONS_SCENES}
        activeId={activeId}
        onChange={onChange}
        ariaLabel="Automations prototype screens"
      />
      <Switch
        className={styles['scene-chrome__empty']}
        size="Small"
        checked={demoEmpty}
        onChange={(e) => setDemoEmpty(e.target.checked)}
        aria-label="Preview empty state"
      >
        Empty
      </Switch>
    </div>
  );
}
