import {
  Button,
  Icon,
  PopoverMenu,
  PopoverMenuGroup,
  PopoverMenuTitle,
  SearchInput,
  UserAvatar,
  type ButtonEmphasis,
  type ButtonSize,
} from '@mattermost/compass-ui';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import LightningBoltOutlineIcon from '@mattermost/compass-icons/components/lightning-bolt-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import {
  AGENTS,
  agentAvatarProps,
  agentModelLabel,
  agentToolsSummary,
} from '../channelAutomationsData';
import styles from './NewAutomationAgentPicker.module.scss';

const MENU_GAP_PX = 4;
const VIEWPORT_PADDING_PX = 8;
const MENU_MIN_WIDTH_PX = 320;
const MENU_MAX_WIDTH_PX = 360;

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
  const [query, setQuery] = useState('');
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    minWidth: MENU_MIN_WIDTH_PX,
    maxWidth: MENU_MAX_WIDTH_PX,
    placement: 'below' as MenuPlacement,
  });
  const anchorRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredAgents = !normalizedQuery
    ? AGENTS
    : AGENTS.filter((agent) => {
        const name = agent.displayName.toLowerCase();
        const username = agent.username.toLowerCase();
        return name.includes(normalizedQuery) || username.includes(normalizedQuery);
      });

  const closeMenu = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  const updateMenuPosition = useCallback(() => {
    const anchor = anchorRef.current;
    const menu = menuRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    const menuHeight = menu?.offsetHeight ?? 320;
    const menuWidth = Math.min(
      MENU_MAX_WIDTH_PX,
      Math.max(rect.width, MENU_MIN_WIDTH_PX),
    );

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

    setMenuPosition({
      top,
      left,
      minWidth: menuWidth,
      maxWidth: MENU_MAX_WIDTH_PX,
      placement,
    });
  }, []);

  useEffect(() => {
    if (!open) return;

    updateMenuPosition();
    const raf = requestAnimationFrame(() => {
      updateMenuPosition();
      searchRef.current?.focus();
    });

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
      closeMenu();
    }

    document.addEventListener('mousedown', handleOutsideClose);
    return () => document.removeEventListener('mousedown', handleOutsideClose);
  }, [open, closeMenu]);

  const menu = open ? (
    <div
      ref={menuRef}
      className={styles['picker__menu-portal']}
      style={{
        top: menuPosition.top,
        left: menuPosition.left,
        minWidth: menuPosition.minWidth,
        maxWidth: menuPosition.maxWidth,
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
        <div className={styles['picker__search']}>
          <SearchInput
            ref={searchRef}
            size="Small"
            placeholder="Search agents"
            aria-label="Search agents"
            value={query}
            autoComplete="off"
            aria-controls="new-automation-agent-list"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setQuery(e.target.value)
            }
            onClear={() => setQuery('')}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Escape') {
                e.stopPropagation();
                closeMenu();
              }
            }}
          />
        </div>
        <PopoverMenuGroup
          id="new-automation-agent-list"
          className={styles['picker__options']}
        >
          {filteredAgents.length === 0 ? (
            <p className={styles['picker__empty']}>No agents match your search</p>
          ) : (
            filteredAgents.map((agent) => {
              const modelLabel = agentModelLabel(agent);
              const toolsLabel = agentToolsSummary(agent);

              return (
                <button
                  key={agent.id}
                  type="button"
                  role="option"
                  className={styles['picker__option']}
                  aria-label={`${agent.displayName}. ${agent.description} ${modelLabel}. ${toolsLabel}.`}
                  onClick={() => {
                    closeMenu();
                    onSelectAgent(agent.id);
                  }}
                >
                  <UserAvatar size="32" {...agentAvatarProps(agent)} />
                  <span className={styles['picker__option-body']}>
                    <span className={styles['picker__option-name']}>
                      {agent.displayName}
                    </span>
                    <span className={styles['picker__option-description']}>
                      {agent.description}
                    </span>
                    <span className={styles['picker__option-meta']}>
                      {modelLabel} · {toolsLabel}
                    </span>
                  </span>
                </button>
              );
            })
          )}
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
            } else {
              setQuery('');
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
