import { useEffect, useRef, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import {
  PopoverMenu,
  PopoverMenuGroup,
} from '@mattermost/compass-ui/components/popover-menu';
import { useExitAnimation } from '@/hooks/useExitAnimation';
import { MATTY } from '../agentsData';
import AgentAvatar from './AgentAvatar';
import styles from './PlusMenu.module.scss';

const EXIT_MS = 150;

type AgentsPlusMenuProps = {
  open: boolean;
  anchorRect: DOMRect | null;
  /** Plus trigger — excluded from outside-close so the button can toggle. */
  excludeRef?: RefObject<HTMLElement | null>;
  onClose: () => void;
  onCreateAgent: () => void;
  onNewGroupChat: () => void;
};

export default function AgentsPlusMenu({
  open,
  anchorRect,
  excludeRef,
  onClose,
  onCreateAgent,
  onNewGroupChat,
}: AgentsPlusMenuProps) {
  const { rendered, exiting } = useExitAnimation(open, EXIT_MS);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || exiting) return;
    const handle = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (excludeRef?.current?.contains(target)) return;
      onClose();
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open, exiting, excludeRef, onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!rendered || !anchorRect) return null;

  const top = anchorRect.bottom + 4;
  const left = anchorRect.left;

  return createPortal(
    <div
      ref={menuRef}
      className={[
        styles['plus-menu'],
        exiting ? styles['plus-menu--exiting'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ top, left }}
      role="menu"
      aria-label="Create"
    >
      <PopoverMenu>
        <PopoverMenuGroup>
          <MenuItem
            role="menuitem"
            label="Create new agent"
            leadingVisual={
              <AgentAvatar
                shape={MATTY.shape}
                color="blue"
                size="xs"
                eyes
              />
            }
            onClick={() => {
              onClose();
              onCreateAgent();
            }}
          />
          <MenuItem
            role="menuitem"
            label="New agent group chat"
            leadingVisual={
              <Icon glyph={<AccountMultipleOutlineIcon />} size="16" />
            }
            onClick={() => {
              onClose();
              onNewGroupChat();
            }}
          />
        </PopoverMenuGroup>
      </PopoverMenu>
    </div>,
    document.body,
  );
}
