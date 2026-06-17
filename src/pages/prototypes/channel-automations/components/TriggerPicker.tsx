import { useRef, useState } from 'react';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ClockOutlineIcon from '@mattermost/compass-icons/components/clock-outline';
import LightningBoltOutlineIcon from '@mattermost/compass-icons/components/lightning-bolt-outline';
import MessageTextOutlineIcon from '@mattermost/compass-icons/components/message-text-outline';
import ProductChannelsIcon from '@mattermost/compass-icons/components/product-channels';
import Icon from '@/components/ui/Icon/Icon';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import {
  TRIGGER_PICKER_OPTIONS,
  type TriggerPickerOption,
} from '../channelAutomationsData';
import styles from './TriggerPicker.module.scss';

const OPTION_ICONS: Record<
  TriggerPickerOption,
  typeof ClockOutlineIcon
> = {
  schedule: ClockOutlineIcon,
  message: MessageTextOutlineIcon,
  join: AccountPlusOutlineIcon,
  'channel-created': ProductChannelsIcon,
};

export interface TriggerPickerProps {
  value: TriggerPickerOption | null;
  /** Shown on the trigger when `value` is null (e.g. legacy @mention triggers). */
  fallbackLabel?: string;
  onChange: (value: TriggerPickerOption) => void;
  className?: string;
}

export default function TriggerPicker({
  value,
  fallbackLabel,
  onChange,
  className = '',
}: TriggerPickerProps) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  useOutsideClose(anchorRef, open, () => setOpen(false));

  const selectedMeta = value != null ? TRIGGER_PICKER_OPTIONS.find((o) => o.id === value) : null;
  const displayLabel = selectedMeta?.label ?? fallbackLabel;
  const TriggerIcon =
    value != null ? OPTION_ICONS[value] : LightningBoltOutlineIcon;

  const close = () => setOpen(false);

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
        onClick={() => setOpen((current) => !current)}
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
              What starts the automation?
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

      {open && (
        <PopoverMenu
          className={styles['trigger-picker__menu']}
          role="listbox"
          aria-label="Choose a trigger"
        >
          {TRIGGER_PICKER_OPTIONS.map((option) => {
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
        </PopoverMenu>
      )}
    </div>
  );
}
