import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BASE = '/prototypes/automations';

export type AutomationsSceneId = 'home' | 'templates' | 'new' | 'runs';

export const AUTOMATIONS_SCENES: Array<{ id: AutomationsSceneId; label: string }> = [
  { id: 'home', label: 'Home' },
  { id: 'templates', label: 'Templates' },
  { id: 'new', label: 'New automation' },
  { id: 'runs', label: 'Run history' },
];

/** Prefer an automation that already has runs for demo navigation. */
const RUNS_DEMO_ID = 'auto-urgent';

export function resolveAutomationsScene(pathname: string): AutomationsSceneId | '' {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;

  if (normalized === BASE || normalized === `${BASE}/`) return 'home';
  if (normalized.startsWith(`${BASE}/templates`)) return 'templates';
  if (/\/runs(\/|$)/.test(normalized)) return 'runs';
  return '';
}

type AutomationsSceneSwitcherProps = {
  /** Creates a blank automation and returns its id. Passed from the shell. */
  createBlank: () => string;
};

/**
 * Prototype chrome scene switcher for key Automations screens.
 * Rendered in PrototypeTopNav (outside AutomationsProvider), so actions
 * that need context are injected as props from AutomationsShell.
 */
export default function AutomationsSceneSwitcher({
  createBlank,
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
      case 'templates':
        navigate(`${BASE}/templates`);
        return;
      case 'new': {
        const blankId = createBlank();
        navigate(`${BASE}/${blankId}/editor`);
        return;
      }
      case 'runs':
        navigate(`${BASE}/${RUNS_DEMO_ID}/runs`);
        return;
      default:
        return;
    }
  };

  return (
    <SceneSwitcher
      scenes={AUTOMATIONS_SCENES}
      activeId={activeId}
      onChange={onChange}
      ariaLabel="Automations prototype screens"
    />
  );
}
