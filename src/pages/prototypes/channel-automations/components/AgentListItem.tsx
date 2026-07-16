import { Icon, IconButton, MenuItem, PopoverMenu, Tag, UserAvatar } from '@mattermost/compass-ui';
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
      <UserAvatar size="32" {...agentAvatarProps(agent)} />

      <div className={styles['agent-item__body']}>
        <div className={styles['agent-item__title']}>
          <p className={styles['agent-item__name']}>{agent.displayName}</p>
          <p className={styles['agent-item__username']}>
            @{agent.username}
          </p>
          {agent.isDefault ? (
            <Tag
              className={styles['agent-item__default-tag']}
              label="Default"
              type="Default"
              size="X-Small"
            />
          ) : null}
        </div>
        <p className={styles['agent-item__description']}>
          By {agent.owner}
          {agent.description ? ` · ${agent.description}` : ''}
        </p>
      </div>

      <div className={styles['agent-item__stats']}>
        <span className={styles['agent-item__stat']}>
          {agent.activeMcps} MCPs
        </span>
        <span className={styles['agent-item__stat-divider']} aria-hidden />
        <span className={styles['agent-item__stat']}>
          {agent.toolCount} tools
        </span>
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
