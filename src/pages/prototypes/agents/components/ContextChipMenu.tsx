import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ForumOutlineIcon from '@mattermost/compass-icons/components/forum-outline';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import {
  PopoverMenu,
  PopoverMenuDivider,
  PopoverMenuGroup,
} from '@mattermost/compass-ui/components/popover-menu';
import { useExitAnimation } from '@/hooks/useExitAnimation';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import type { MattyContextChip } from './mattyContext';
import styles from './ContextChipMenu.module.scss';

const MENU_WIDTH = 280;
const MENU_EXIT_MS = 150;

type ContextChipMenuProps = {
  options: MattyContextChip[];
  selectedIds: string[];
  onAdd: (chip: MattyContextChip) => void;
};

export function contextChipIcon(kind: MattyContextChip['kind']) {
  return <Icon glyph={kind === 'thread' ? <ForumOutlineIcon /> : <GlobeIcon />} size="12" />;
}

/** "+" button in the Matty composer that lists channels and threads to attach as context. */
export default function ContextChipMenu({ options, selectedIds, onAdd }: ContextChipMenuProps) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
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

  const channels = options.filter((option) => option.kind === 'channel');
  const threads = options.filter((option) => option.kind === 'thread');

  const renderItems = (items: MattyContextChip[]) =>
    items.map((option) => (
      <MenuItem
        key={option.id}
        role="menuitem"
        label={option.label}
        disabled={selectedIds.includes(option.id)}
        leadingVisual={contextChipIcon(option.kind)}
        onClick={() => {
          setOpen(false);
          onAdd(option);
        }}
      />
    ));

  return (
    <>
      <span
        ref={triggerRef}
        className={styles['context-chip-menu__trigger']}
        onMouseDown={() => {
          if (open) skipOutsideCloseRef.current = true;
        }}
      >
        <button
          type="button"
          className={styles['context-chip-menu__plus']}
          aria-label="Add context"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => {
            setAnchor(triggerRef.current?.getBoundingClientRect() ?? null);
            setOpen((prev) => !prev);
          }}
        >
          <Icon glyph={<PlusIcon />} size="16" />
        </button>
      </span>
      {rendered && anchor
        ? createPortal(
            <div
              ref={menuRef}
              className={[
                styles['context-chip-menu__menu'],
                exiting ? styles['context-chip-menu__menu--exiting'] : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{
                bottom: window.innerHeight - anchor.top + 4,
                left: Math.max(8, anchor.left),
                width: MENU_WIDTH,
              }}
              role="menu"
              aria-label="Add context"
            >
              <PopoverMenu>
                {channels.length > 0 ? (
                  <PopoverMenuGroup>{renderItems(channels)}</PopoverMenuGroup>
                ) : null}
                {channels.length > 0 && threads.length > 0 ? <PopoverMenuDivider /> : null}
                {threads.length > 0 ? (
                  <PopoverMenuGroup>
                    <div className={styles['context-chip-menu__list']}>{renderItems(threads)}</div>
                  </PopoverMenuGroup>
                ) : null}
              </PopoverMenu>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
