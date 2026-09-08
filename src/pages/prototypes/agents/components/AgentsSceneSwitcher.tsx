import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import { useLocation, useNavigate } from 'react-router-dom';
import { AGENTS_BASE, AGENTS_SCENES, type AgentsSceneId } from '../agentsScenes';

function resolveScene(
  pathname: string,
  search: string,
  newAgentOpen: boolean,
): AgentsSceneId {
  if (newAgentOpen) return 'new-agent';
  if (search.includes('tab=tasks')) return 'scheduled-work';
  if (search.includes('settings=true')) return 'agent-settings';
  const normalized =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;
  if (normalized.startsWith(`${AGENTS_BASE}/dm/`)) return 'channels';
  if (normalized.startsWith(`${AGENTS_BASE}/agents/`)) return 'matty-chat';
  if (normalized === `${AGENTS_BASE}/agents`) {
    if (search.includes('fte=1')) return 'meet-first-agent';
    return 'all-agents';
  }
  return 'channels';
}

type AgentsSceneSwitcherProps = {
  newAgentOpen: boolean;
  openNewAgent: () => void;
  closeNewAgent: () => void;
  ensureSentinel: () => void;
};

/**
 * Prototype chrome — rendered in PrototypeTopNav (outside AgentsProvider),
 * so modal actions are injected as props from AgentsShell.
 */
export default function AgentsSceneSwitcher({
  newAgentOpen,
  openNewAgent,
  closeNewAgent,
  ensureSentinel,
}: AgentsSceneSwitcherProps) {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const activeId = resolveScene(pathname, search, newAgentOpen);

  const onChange = (id: string) => {
    switch (id as AgentsSceneId) {
      case 'channels':
        closeNewAgent();
        navigate(AGENTS_BASE);
        return;
      case 'meet-first-agent':
        closeNewAgent();
        navigate(`${AGENTS_BASE}/agents?fte=1`);
        return;
      case 'all-agents':
        closeNewAgent();
        ensureSentinel();
        navigate(`${AGENTS_BASE}/agents`);
        return;
      case 'matty-chat':
        closeNewAgent();
        navigate(`${AGENTS_BASE}/agents/matty`);
        return;
      case 'new-agent':
        openNewAgent();
        return;
      case 'agent-settings':
        closeNewAgent();
        navigate(`${AGENTS_BASE}/agents/matty?settings=true`);
        return;
      case 'scheduled-work':
        closeNewAgent();
        ensureSentinel();
        navigate(`${AGENTS_BASE}/agents/sentinel?settings=true&tab=tasks`);
        return;
      default:
        return;
    }
  };

  return (
    <SceneSwitcher
      scenes={AGENTS_SCENES}
      activeId={activeId}
      onChange={onChange}
      ariaLabel="Agents vision prototype screens"
    />
  );
}
