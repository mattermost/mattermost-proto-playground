import {
  Button,
  Icon,
  MenuItem,
  PopoverMenu,
  PopoverMenuGroup,
  PopoverMenuTitle,
  UserAvatar,
  type ButtonEmphasis,
  type ButtonSize,
} from '@mattermost/compass-ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import LightningBoltOutlineIcon from '@mattermost/compass-icons/components/lightning-bolt-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import { AGENTS, agentAvatarProps } from '../channelAutomationsData';
import styles from './NewAutomationAgentPicker.module.scss';

const MENU_GAP_PX = 4;
const VIEWPORT_PADDING_PX = 8;
const MENU_MIN_WIDTH_PX = 220;

type MenuPlacement = 'above' | 'below';

export interface NewAutomationAgentPickerProps {
  onSelectAgent: (agentId: string) => void;
  className?: string;
  emphasis?: ButtonEmphasis;
  size?: ButtonSize;
  icon?: 'lightning' | 'plus' | 'none';
  label?: string;
}

export default function NewAutomationAgentPicker({
  onSelectAgent,
  className = '',
  emphasis = 'Primary',
  size = 'Medium',
  icon = 'lightning',
  label = 'New automation',
}: NewAutomationAgentPickerProps) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    minWidth: MENU_MIN_WIDTH_PX,
    placement: 'below' as MenuPlacement,
  });
  const anchorRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updateMenuPosition = useCallback(() => {
    const anchor = anchorRef.current;
    const menu = menuRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    const menuHeight = menu?.offsetHeight ?? 228;
    const menuWidth = Math.max(rect.width, MENU_MIN_WIDTH_PX);

    const spaceBelow =
      window.innerHeight - rect.bottom - MENU_GAP_PX - VIEWPORT_PADDING_PX;
    const spaceAbove = rect.top - MENU_GAP_PX - VIEWPORT_PADDING_PX;

    const placement: MenuPlacement =
      spaceBelow < menuHeight && spaceAbove > spaceBelow ? 'above' : 'below';

    const top =
      placement === 'above'
        ? rect.top - MENU_GAP_PX
        : rect.bottom + MENU_GAP_PX;

    const left = Math.min(
      Math.max(VIEWPORT_PADDING_PX, rect.right - menuWidth),
      window.innerWidth - menuWidth - VIEWPORT_PADDING_PX,
    );

    setMenuPosition({ top, left, minWidth: menuWidth, placement });
  }, []);

  useEffect(() => {
    if (!open) return;

    updateMenuPosition();
    const raf = requestAnimationFrame(updateMenuPosition);

    const handleReposition = () => updateMenuPosition();
    window.addEventListener('resize', handleReposition);
    document.addEventListener('scroll', handleReposition, true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleReposition);
      document.removeEventListener('scroll', handleReposition, true);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;

    function handleOutsideClose(event: MouseEvent) {
      const target = event.target as Node;
      if (
        anchorRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    document.addEventListener('mousedown', handleOutsideClose);
    return () => document.removeEventListener('mousedown', handleOutsideClose);
  }, [open]);

  const menu = open ? (
    <div
      ref={menuRef}
      className={styles['picker__menu-portal']}
      style={{
        top: menuPosition.top,
        left: menuPosition.left,
        minWidth: menuPosition.minWidth,
        transform:
          menuPosition.placement === 'above' ? 'translateY(-100%)' : undefined,
      }}
    >
      <PopoverMenu
        className={styles['picker__menu']}
        role="listbox"
        aria-label="Choose an agent to run the automation"
      >
        <PopoverMenuTitle>
          Choose an agent to run the automation
        </PopoverMenuTitle>
        <PopoverMenuGroup>
          {AGENTS.map((agent) => (
            <MenuItem
              key={agent.id}
              label={agent.displayName}
              leadingVisual={
                <UserAvatar size="16" {...agentAvatarProps(agent)} />
              }
              onClick={() => {
                setOpen(false);
                onSelectAgent(agent.id);
              }}
            />
          ))}
        </PopoverMenuGroup>
      </PopoverMenu>
    </div>
  ) : null;

  return (
    <div
      ref={anchorRef}
      className={[styles['picker'], className].filter(Boolean).join(' ')}
    >
      <Button
        size={size}
        emphasis={emphasis}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        leadingIcon={
          icon === 'none' ? undefined : (
            <Icon
              size="16"
              glyph={
                icon === 'plus' ? <PlusIcon /> : <LightningBoltOutlineIcon />
              }
            />
          )
        }
        trailingIcon={<Icon size="16" glyph={<ChevronDownIcon />} />}
        onClick={() => {
          setOpen((current) => {
            const next = !current;
            if (next) {
              requestAnimationFrame(updateMenuPosition);
            }
            return next;
          });
        }}
      >
        {label}
      </Button>
      {typeof document !== 'undefined' && menu
        ? createPortal(menu, document.body)
        : null}
    </div>
  );
}
