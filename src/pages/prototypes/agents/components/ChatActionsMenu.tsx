import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import MessagePlusOutlineIcon from '@mattermost/compass-icons/components/message-plus-outline';
import MessageTextOutlineIcon from '@mattermost/compass-icons/components/message-text-outline';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import {
  PopoverMenu,
  PopoverMenuDivider,
  PopoverMenuGroup,
} from '@mattermost/compass-ui/components/popover-menu';
import { useExitAnimation } from '@/hooks/useExitAnimation';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import styles from './ChatActionsMenu.module.scss';

const MENU_WIDTH = 280;
const MENU_EXIT_MS = 150;

export type ChatActionsMenuChat = {
  id: string;
  label: string;
  active: boolean;
};

type ChatActionsMenuProps = {
  chats?: ChatActionsMenuChat[];
  onSelectChat?: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: () => void;
  onViewAllAgents: () => void;
  deleteDisabled?: boolean;
};

/** ••• button for a chat header: new chat, delete chat, view all agents. */
export default function ChatActionsMenu({
  chats = [],
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onViewAllAgents,
  deleteDisabled = false,
}: ChatActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const buttonWrapRef = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const skipOutsideCloseRef = useRef(false);
  const { rendered, exiting } = useExitAnimation(open, MENU_EXIT_MS);

  useOutsideClose(menuRef, open && !exiting, () => {
    if (skipOutsideCloseRef.current) {
      skipOutsideCloseRef.current = false;
      return;
    }
    setOpen(false);
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const run = (action: () => void) => () => {
    setOpen(false);
    action();
  };

  return (
    <>
      <span
        ref={buttonWrapRef}
        className={styles['chat-actions__trigger']}
        onMouseDown={() => {
          if (open) skipOutsideCloseRef.current = true;
        }}
      >
        <IconButton
          size="small"
          padding="compact"
          icon={<Icon glyph={<DotsHorizontalIcon />} size="16" />}
          aria-label="Chat options"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => {
            setAnchor(buttonWrapRef.current?.getBoundingClientRect() ?? null);
            setOpen((prev) => !prev);
          }}
        />
      </span>
      {rendered && anchor
        ? createPortal(
            <div
              ref={menuRef}
              className={[
                styles['chat-actions__menu'],
                exiting ? styles['chat-actions__menu--exiting'] : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{
                top: anchor.bottom + 4,
                left: Math.max(8, anchor.right - MENU_WIDTH),
                width: MENU_WIDTH,
              }}
              role="menu"
              aria-label="Chat options"
            >
              <PopoverMenu>
                <PopoverMenuGroup>
                  <MenuItem
                    role="menuitem"
                    label="Start a new chat"
                    leadingVisual={<Icon glyph={<MessagePlusOutlineIcon />} size="16" />}
                    onClick={run(onNewChat)}
                  />
                  <MenuItem
                    role="menuitem"
                    label="View all agents"
                    leadingVisual={<Icon glyph={<AccountMultipleOutlineIcon />} size="16" />}
                    onClick={run(onViewAllAgents)}
                  />
                </PopoverMenuGroup>
                {chats.length > 0 ? (
                  <>
                    <PopoverMenuDivider />
                    <PopoverMenuGroup>
                      <div className={styles['chat-actions__chats']}>
                        {chats.map((chat) => (
                          <MenuItem
                            key={chat.id}
                            role="menuitem"
                            label={chat.label || 'New chat'}
                            active={chat.active}
                            trailingElement={chat.active}
                            leadingVisual={<Icon glyph={<MessageTextOutlineIcon />} size="16" />}
                            onClick={run(() => {
                              if (!chat.active) onSelectChat?.(chat.id);
                            })}
                          />
                        ))}
                      </div>
                    </PopoverMenuGroup>
                  </>
                ) : null}
                <PopoverMenuDivider />
                <PopoverMenuGroup>
                  <MenuItem
                    role="menuitem"
                    label="Delete chat"
                    destructive
                    disabled={deleteDisabled}
                    leadingVisual={<Icon glyph={<TrashCanOutlineIcon />} size="16" />}
                    onClick={run(onDeleteChat)}
                  />
                </PopoverMenuGroup>
              </PopoverMenu>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
