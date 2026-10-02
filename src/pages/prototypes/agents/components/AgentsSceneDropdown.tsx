import RobotHappyIcon from '@mattermost/compass-icons/components/robot-happy';
import { Divider } from '@mattermost/compass-ui/components/divider';
import { Dropdown } from '@mattermost/compass-ui/components/dropdown';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import { PopoverMenu } from '@mattermost/compass-ui/components/popover-menu';
import { useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useExitAnimation } from '@/hooks/useExitAnimation';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import { AGENTS_BASE, AGENTS_SCENES, type AgentsSceneId } from '../agentsScenes';
import styles from './AgentsSceneDropdown.module.scss';

function resolveScene(
  pathname: string,
  search: string,
  newAgentOpen: boolean,
): AgentsSceneId {
  if (newAgentOpen) return 'new-agent';
  if (search.includes('artifact=1')) return 'artifact';
  if (search.includes('tab=tasks')) return 'scheduled-work';
  if (search.includes('settings=true')) return 'agent-settings';
  const normalized =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;
  if (normalized.startsWith(`${AGENTS_BASE}/dm/`)) return 'channels';
  if (normalized === `${AGENTS_BASE}/channel/service-status-alert`) return 'service-status-alert';
  if (normalized.startsWith(`${AGENTS_BASE}/channel/`)) return 'incident-channel';
  if (normalized.startsWith(`${AGENTS_BASE}/agents/`)) return 'matty-chat';
  if (normalized === `${AGENTS_BASE}/agents`) {
    if (search.includes('fte=1')) return 'meet-first-agent';
    return 'all-agents';
  }
  return 'channels';
}

type AgentsSceneDropdownProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newAgentOpen: boolean;
  openNewAgent: () => void;
  closeNewAgent: () => void;
  ensureSentinel: () => void;
  mattyPanelOpen: boolean;
  setMattyPanelOpen: (open: boolean) => void;
};

export default function AgentsSceneDropdown({
  open,
  onOpenChange,
  newAgentOpen,
  openNewAgent,
  closeNewAgent,
  ensureSentinel,
  setMattyPanelOpen,
}: AgentsSceneDropdownProps) {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const activeId = resolveScene(pathname, search, newAgentOpen);
  const activeLabel = AGENTS_SCENES.find((s) => s.id === activeId)?.label ?? 'Scene';

  const containerRef = useRef<HTMLDivElement>(null);
  const { rendered, exiting } = useExitAnimation(open, 100);

  useOutsideClose(containerRef, open, useCallback(() => onOpenChange(false), [onOpenChange]));

  const navigate_ = useCallback(
    (id: AgentsSceneId) => {
      onOpenChange(false);
      switch (id) {
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
        case 'artifact':
          closeNewAgent();
          ensureSentinel();
          navigate(`${AGENTS_BASE}/agents/sentinel?artifact=1`);
          return;
        case 'service-status-alert':
          closeNewAgent();
          ensureSentinel();
          navigate(`${AGENTS_BASE}/channel/service-status-alert`);
          return;
        case 'incident-channel':
          closeNewAgent();
          ensureSentinel();
          navigate(`${AGENTS_BASE}/channel/INC-4471`);
          return;
      }
    },
    [navigate, closeNewAgent, openNewAgent, ensureSentinel, onOpenChange],
  );

  return (
    <div ref={containerRef} className={styles['agents-scene-dropdown']}>
      <Dropdown
        isOpen={open}
        size="medium"
        padding="tight"
        onClick={() => onOpenChange(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {activeLabel}
      </Dropdown>

      {rendered && (
        <div
          className={[
            styles['agents-scene-dropdown__menu'],
            exiting ? styles['agents-scene-dropdown__menu--exiting'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <PopoverMenu>
            {AGENTS_SCENES.map((scene) => (
              <MenuItem
                key={scene.id}
                label={scene.label}
                leadingElement={false}
                active={scene.id === activeId}
                onClick={() => navigate_(scene.id)}
              />
            ))}
            <Divider />
            <MenuItem
              label="Open Matty panel"
              leadingElement
              leadingVisual={<Icon glyph={<RobotHappyIcon />} size="16" />}
              onClick={() => {
                onOpenChange(false);
                setMattyPanelOpen(true);
              }}
            />
          </PopoverMenu>
        </div>
      )}
    </div>
  );
}
