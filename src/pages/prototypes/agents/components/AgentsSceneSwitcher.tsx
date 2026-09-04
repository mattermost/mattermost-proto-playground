import SceneSwitcher from '@/components/navigation/SceneSwitcher/SceneSwitcher';
import { useLocation, useNavigate } from 'react-router-dom';
import { AGENTS_BASE, AGENTS_SCENES, type AgentsSceneId } from '../agentsScenes';

function resolveScene(
  pathname: string,
  newAgentOpen: boolean,
): AgentsSceneId {
  if (newAgentOpen) return 'new-agent';
  const normalized =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;
  if (normalized === `${AGENTS_BASE}/agents`) return 'meet-first-agent';
  return 'channels';
}

type AgentsSceneSwitcherProps = {
  newAgentOpen: boolean;
  openNewAgent: () => void;
  closeNewAgent: () => void;
};

/**
 * Prototype chrome — rendered in PrototypeTopNav (outside AgentsProvider),
 * so modal actions are injected as props from AgentsShell.
 */
export default function AgentsSceneSwitcher({
  newAgentOpen,
  openNewAgent,
  closeNewAgent,
}: AgentsSceneSwitcherProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activeId = resolveScene(pathname, newAgentOpen);

  const onChange = (id: string) => {
    switch (id as AgentsSceneId) {
      case 'channels':
        closeNewAgent();
        navigate(AGENTS_BASE);
        return;
      case 'meet-first-agent':
        closeNewAgent();
        navigate(`${AGENTS_BASE}/agents`);
        return;
      case 'new-agent':
        openNewAgent();
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
