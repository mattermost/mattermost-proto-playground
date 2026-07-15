import { Icon, MenuItem } from '@mattermost/compass-ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import CheckboxBlankOutlineIcon from '@mattermost/compass-icons/components/checkbox-blank-outline';
import CheckboxMarkedIcon from '@mattermost/compass-icons/components/checkbox-marked';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ClockOutlineIcon from '@mattermost/compass-icons/components/clock-outline';
import LightningBoltOutlineIcon from '@mattermost/compass-icons/components/lightning-bolt-outline';
import MessageTextOutlineIcon from '@mattermost/compass-icons/components/message-text-outline';
import ProductChannelsIcon from '@mattermost/compass-icons/components/product-channels';
import ProductPlaybooksIcon from '@mattermost/compass-icons/components/product-playbooks';
import {
  PopoverMenu,
  PopoverMenuGroup,
  PopoverMenuGroupTitle,
  PopoverMenuScroll,
} from '@mattermost/compass-ui';
import {
  TRIGGER_PICKER_GROUPS,
  TRIGGER_PICKER_OPTIONS,
  type TriggerPickerOption,
} from '../channelAutomationsData';
import styles from './TriggerPicker.module.scss';

const MENU_GAP_PX = 4;
const MENU_MAX_HEIGHT_PX = 240;
const VIEWPORT_PADDING_PX = 16;

const OPTION_ICONS: Record<
  TriggerPickerOption,
  typeof ClockOutlineIcon
> = {
  schedule: ClockOutlineIcon,
  message: MessageTextOutlineIcon,
  join: AccountPlusOutlineIcon,
  'channel-created': ProductChannelsIcon,
  'playbook-run-started': ProductPlaybooksIcon,
  'playbook-run-finished': ProductPlaybooksIcon,
  'playbook-task-checked': CheckboxMarkedIcon,
  'playbook-task-unchecked': CheckboxBlankOutlineIcon,
};

export interface TriggerPickerProps {
  value: TriggerPickerOption | null;
  /** Shown on the trigger when `value` is null (e.g. legacy @mention triggers). */
  fallbackLabel?: string;
  /** Empty-state prompt when no trigger is selected. */
  emptyLabel?: string;
  onChange: (value: TriggerPickerOption) => void;
  className?: string;
}

export default function TriggerPicker({
  value,
  fallbackLabel,
  emptyLabel = 'What starts the automation?',
  onChange,
  className = '',
}: TriggerPickerProps) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: MENU_MAX_HEIGHT_PX,
  });
  const anchorRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updateMenuPosition = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const spaceBelow =
      window.innerHeight - rect.bottom - MENU_GAP_PX - VIEWPORT_PADDING_PX;
    setMenuPosition({
      top: rect.bottom + MENU_GAP_PX,
      left: rect.left,
      width: rect.width,
      maxHeight: Math.max(120, Math.min(MENU_MAX_HEIGHT_PX, spaceBelow)),
    });
  }, []);

  useEffect(() => {
    if (!open) return;

    updateMenuPosition();

    const handleReposition = () => updateMenuPosition();
    window.addEventListener('resize', handleReposition);
    document.addEventListener('scroll', handleReposition, true);

    return () => {
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

  const selectedMeta = value != null ? TRIGGER_PICKER_OPTIONS.find((o) => o.id === value) : null;
  const displayLabel = selectedMeta?.label ?? fallbackLabel;
  const TriggerIcon =
    value != null ? OPTION_ICONS[value] : LightningBoltOutlineIcon;

  const close = () => setOpen(false);

  const menu = open ? (
    <div
      ref={menuRef}
      className={styles['trigger-picker__menu-portal']}
      style={{
        top: menuPosition.top,
        left: menuPosition.left,
        width: menuPosition.width,
      }}
    >
      <PopoverMenu
        className={styles['trigger-picker__menu']}
        role="listbox"
        aria-label="Choose a trigger"
      >
        <PopoverMenuScroll maxHeight={menuPosition.maxHeight}>
          {TRIGGER_PICKER_GROUPS.map((group) => {
            const options = TRIGGER_PICKER_OPTIONS.filter(
              (option) => option.group === group.id,
            );
            return (
              <PopoverMenuGroup key={group.id} aria-label={group.label}>
                <PopoverMenuGroupTitle>{group.label}</PopoverMenuGroupTitle>
                {options.map((option) => {
                  const OptionIcon = OPTION_ICONS[option.id];
                  return (
                    <MenuItem
                      key={option.id}
                      label={option.label}
                      active={value === option.id}
                      trailingElement={value === option.id}
                      leadingVisual={<Icon size="16" glyph={<OptionIcon />} />}
                      onClick={() => {
                        onChange(option.id);
                        close();
                      }}
                    />
                  );
                })}
              </PopoverMenuGroup>
            );
          })}
        </PopoverMenuScroll>
      </PopoverMenu>
    </div>
  ) : null;

  return (
    <div
      ref={anchorRef}
      className={[styles['trigger-picker'], className].filter(Boolean).join(' ')}
    >
      <button
        type="button"
        className={[
          styles['trigger-picker__trigger'],
          open ? styles['trigger-picker__trigger--open'] : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          setOpen((current) => {
            const next = !current;
            if (next) updateMenuPosition();
            return next;
          });
        }}
      >
        <span className={styles['trigger-picker__leading']} aria-hidden>
          <Icon size="16" glyph={<TriggerIcon />} />
        </span>
        <span className={styles['trigger-picker__label']}>
          {displayLabel != null ? (
            <span className={styles['trigger-picker__label-selected']}>
              {displayLabel}
            </span>
          ) : (
            <span className={styles['trigger-picker__label-emphasis']}>
              {emptyLabel}
            </span>
          )}
        </span>
        <span
          className={[
            styles['trigger-picker__chevron'],
            open ? styles['trigger-picker__chevron--open'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden
        >
          <Icon size="16" glyph={<ChevronDownIcon />} />
        </span>
      </button>

      {typeof document !== 'undefined' && menu
        ? createPortal(menu, document.body)
        : null}
    </div>
  );
}
