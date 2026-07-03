import { Icon, IconButton, MenuItem, PopoverMenu, UserAvatar } from '@mattermost/compass-ui';
import { useRef, useState } from 'react';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import type { Agent } from '../channelAutomationsData';
import { agentAvatarProps } from '../channelAutomationsData';
import styles from './AgentListItem.module.scss';

export interface AgentListItemProps {
  agent: Agent;
  onEdit: (id: string) => void;
  onRequestDelete?: (id: string) => void;
}

export default function AgentListItem({
  agent,
  onEdit,
  onRequestDelete,
}: AgentListItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useOutsideClose(menuRef, menuOpen, () => setMenuOpen(false));

  const close = () => setMenuOpen(false);

  return (
    <div
      className={styles['agent-item']}
      onClick={() => onEdit(agent.id)}
    >
      <div className={styles['agent-item__main']}>
        <div className={styles['agent-item__identity']}>
          <UserAvatar size="24" {...agentAvatarProps(agent)} />
          <p className={styles['agent-item__name']}>{agent.displayName}</p>
          <p className={styles['agent-item__username']}>
            (@{agent.username})
          </p>
        </div>

        <div className={styles['agent-item__stats']}>
          <span className={styles['agent-item__stat']}>
            <span className={styles['agent-item__stat-dot']} aria-hidden />
            {agent.activeMcps} MCPs Active
          </span>
          <span className={styles['agent-item__stat-divider']} aria-hidden />
          <span className={styles['agent-item__stat']}>
            {agent.toolCount} tools
          </span>
        </div>
      </div>

      <div
        className={styles['agent-item__actions']}
        onClick={(e) => e.stopPropagation()}
      >
        <div ref={menuRef} className={styles['agent-item__menu-anchor']}>
          <IconButton
            size="Small"
            aria-label="Agent options"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            active={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            icon={<Icon size="16" glyph={<DotsHorizontalIcon />} />}
          />
          {menuOpen && (
            <PopoverMenu className={styles['agent-item__menu']}>
              <MenuItem
                label="Edit"
                leadingVisual={<Icon size="16" glyph={<PencilOutlineIcon />} />}
                onClick={() => {
                  close();
                  onEdit(agent.id);
                }}
              />
              {onRequestDelete ? (
                <MenuItem
                  label="Delete"
                  destructive
                  leadingVisual={
                    <Icon size="16" glyph={<TrashCanOutlineIcon />} />
                  }
                  onClick={() => {
                    close();
                    onRequestDelete(agent.id);
                  }}
                />
              ) : null}
            </PopoverMenu>
          )}
        </div>
      </div>
    </div>
  );
}
