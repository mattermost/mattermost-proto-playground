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
import { AGENTS_DOCS_BASE, AGENTS_DOCS_SCENES, type AgentsDocsSceneId } from '../agentsDocsScenes';
import styles from './AgentsDocsSceneDropdown.module.scss';

function resolveScene(
  pathname: string,
  search: string,
  newAgentOpen: boolean,
): AgentsDocsSceneId {
  if (newAgentOpen) return 'new-agent';
  const normalized =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;
  if (normalized === `${AGENTS_DOCS_BASE}/dm/matty`) return 'matty-chat';
  if (normalized.startsWith(`${AGENTS_DOCS_BASE}/dm/`)) return 'channels';
  if (normalized.startsWith(`${AGENTS_DOCS_BASE}/agents/`)) return 'matty-chat';
  if (normalized === `${AGENTS_DOCS_BASE}/agents`) {
    if (search.includes('fte=1')) return 'group-chat';
    if (search.includes('view=all')) return 'all-agents-list';
    return 'all-agents';
  }
  if (search.includes('scene=grounding')) return 'grounding';
  if (search.includes('scene=review')) return 'review';
  if (search.includes('scene=approval')) return 'approval';
  if (search.includes('scene=later-that-week')) return 'later-that-week';
  if (search.includes('scene=docs-outage')) return 'docs-outage';
  if (normalized.startsWith(`${AGENTS_DOCS_BASE}/channel/INC-`)) return 'docs-outage';
  return 'channels';
}

type AgentsDocsSceneDropdownProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newAgentOpen: boolean;
  openNewAgent: () => void;
  closeNewAgent: () => void;
  openNewGroupChat: () => void;
  mattyPanelOpen: boolean;
  setMattyPanelOpen: (open: boolean) => void;
};

export default function AgentsDocsSceneDropdown({
  open,
  onOpenChange,
  newAgentOpen,
  openNewAgent,
  closeNewAgent,
  openNewGroupChat,
  setMattyPanelOpen,
}: AgentsDocsSceneDropdownProps) {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const activeId = resolveScene(pathname, search, newAgentOpen);
  const activeLabel = AGENTS_DOCS_SCENES.find((s) => s.id === activeId)?.label ?? 'Scene';

  const containerRef = useRef<HTMLDivElement>(null);
  const { rendered, exiting } = useExitAnimation(open, 100);

  useOutsideClose(containerRef, open, useCallback(() => onOpenChange(false), [onOpenChange]));

  const navigate_ = useCallback(
    (id: AgentsDocsSceneId) => {
      onOpenChange(false);
      switch (id) {
        case 'channels':
          closeNewAgent();
          navigate(AGENTS_DOCS_BASE);
          return;
        case 'grounding':
          closeNewAgent();
          navigate(`${AGENTS_DOCS_BASE}?scene=grounding`);
          return;
        case 'review':
          closeNewAgent();
          navigate(`${AGENTS_DOCS_BASE}?scene=review`);
          return;
        case 'approval':
          closeNewAgent();
          navigate(`${AGENTS_DOCS_BASE}?scene=approval`);
          return;
        case 'later-that-week':
          closeNewAgent();
          navigate(`${AGENTS_DOCS_BASE}?scene=later-that-week`);
          return;
        case 'docs-outage':
          closeNewAgent();
          navigate(`${AGENTS_DOCS_BASE}?scene=docs-outage`);
          return;
        case 'matty-chat':
          closeNewAgent();
          navigate(`${AGENTS_DOCS_BASE}/dm/matty`);
          return;
        case 'all-agents':
          closeNewAgent();
          navigate(`${AGENTS_DOCS_BASE}/agents`);
          return;
        case 'all-agents-list':
          closeNewAgent();
          navigate(`${AGENTS_DOCS_BASE}/agents?view=all`);
          return;
        case 'new-agent':
          openNewAgent();
          return;
        case 'group-chat':
          closeNewAgent();
          openNewGroupChat();
          return;
      }
    },
    [navigate, closeNewAgent, openNewAgent, openNewGroupChat, onOpenChange],
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
            {AGENTS_DOCS_SCENES.map((scene) => (
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
