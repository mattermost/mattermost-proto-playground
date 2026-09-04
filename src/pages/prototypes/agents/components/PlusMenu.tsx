import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import FolderOutlineIcon from '@mattermost/compass-icons/components/folder-outline';
import AccountMultiplePlusOutlineIcon from '@mattermost/compass-icons/components/account-multiple-plus-outline';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import {
  PopoverMenu,
  PopoverMenuDivider,
  PopoverMenuGroup,
} from '@mattermost/compass-ui/components/popover-menu';
import { useExitAnimation } from '@/hooks/useExitAnimation';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import styles from './PlusMenu.module.scss';

const EXIT_MS = 150;

type PlusMenuProps = {
  open: boolean;
  anchorRect: DOMRect | null;
  onClose: () => void;
  onCreateAgent: () => void;
};

export default function PlusMenu({
  open,
  anchorRect,
  onClose,
  onCreateAgent,
}: PlusMenuProps) {
  const { rendered, exiting } = useExitAnimation(open, EXIT_MS);
  const menuRef = useRef<HTMLDivElement>(null);
  useOutsideClose(menuRef, open && !exiting, onClose);

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
            label="Create an Agent"
            leadingVisual={<Icon glyph={<CreationOutlineIcon />} size="16" />}
            onClick={() => {
              onClose();
              onCreateAgent();
            }}
          />
          <PopoverMenuDivider />
          <MenuItem
            role="menuitem"
            label="Browse channels"
            leadingVisual={<Icon glyph={<MagnifyIcon />} size="16" />}
            onClick={onClose}
          />
          <MenuItem
            role="menuitem"
            label="Create new channel"
            leadingVisual={<Icon glyph={<GlobeIcon />} size="16" />}
            onClick={onClose}
          />
          <MenuItem
            role="menuitem"
            label="Open a direct message"
            leadingVisual={<Icon glyph={<AccountOutlineIcon />} size="16" />}
            onClick={onClose}
          />
        </PopoverMenuGroup>
        <PopoverMenuDivider />
        <PopoverMenuGroup>
          <MenuItem
            role="menuitem"
            label="Create new category"
            leadingVisual={<Icon glyph={<FolderOutlineIcon />} size="16" />}
            onClick={onClose}
          />
        </PopoverMenuGroup>
        <PopoverMenuDivider />
        <PopoverMenuGroup>
          <MenuItem
            role="menuitem"
            label="Invite people"
            leadingVisual={
              <Icon glyph={<AccountMultiplePlusOutlineIcon />} size="16" />
            }
            onClick={onClose}
          />
        </PopoverMenuGroup>
      </PopoverMenu>
    </div>,
    document.body,
  );
}
