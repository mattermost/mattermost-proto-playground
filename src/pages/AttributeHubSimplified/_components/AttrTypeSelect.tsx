import { useRef, useState } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import Icon from '@/components/ui/Icon/Icon';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import PopoverMenu, {
  PopoverMenuScroll,
} from '@/components/ui/PopoverMenu/PopoverMenu';
import FixedPopoverMenu from '@/components/ui/FixedPopoverMenu/FixedPopoverMenu';
import {
  ATTR_TYPE_OPTIONS,
  attrTypeLabel,
  type AttrType,
} from '@/pages/AttributeManagementHub/hubData';
import { attributeTypeIcon } from '@/pages/AttributeManagementHub/attrTypeIcon';
import styles from './AttrTypeSelect.module.scss';

export interface AttrTypeSelectProps {
  value: AttrType;
  onChange: (next: AttrType) => void;
  disabled?: boolean;
  locked?: boolean;
  className?: string;
  'aria-label'?: string;
}

/**
 * Custom attribute-type picker with leading icons (replaces a native Select).
 */
export default function AttrTypeSelect({
  value,
  onChange,
  disabled = false,
  locked = false,
  className = '',
  'aria-label': ariaLabel = 'Attribute type',
}: AttrTypeSelectProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const inactive = disabled || locked;

  const close = () => setOpen(false);

  const pick = (next: AttrType) => {
    onChange(next);
    close();
  };

  return (
    <div className={[styles['type-select'], className].filter(Boolean).join(' ')}>
      <button
        ref={triggerRef}
        type="button"
        className={[
          styles['type-select__trigger'],
          open ? styles['type-select__trigger--open'] : '',
          locked ? styles['type-select__trigger--locked'] : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={inactive}
        onClick={() => {
          if (inactive) return;
          setOpen((current) => !current);
        }}
      >
        <span className={styles['type-select__value']} aria-hidden={!value}>
          <span className={styles['type-select__icon']}>
            {attributeTypeIcon(value)}
          </span>
          <span className={styles['type-select__label']}>
            {attrTypeLabel(value)}
          </span>
        </span>
        <span className={styles['type-select__chevron']} aria-hidden>
          <Icon size="16" glyph={<ChevronDownIcon />} />
        </span>
      </button>

      <FixedPopoverMenu
        open={open}
        onClose={close}
        anchorRef={triggerRef}
        align="start"
        minWidthFloor={220}
      >
        <PopoverMenu aria-label={ariaLabel} className={styles['type-select__menu']}>
          <PopoverMenuScroll maxHeight={320}>
            {ATTR_TYPE_OPTIONS.map((type) => {
              const selected = type === value;
              return (
                <MenuItem
                  key={type}
                  label={attrTypeLabel(type)}
                  leadingVisual={attributeTypeIcon(type)}
                  trailingElement={selected}
                  aria-selected={selected}
                  onClick={() => pick(type)}
                />
              );
            })}
          </PopoverMenuScroll>
        </PopoverMenu>
      </FixedPopoverMenu>
    </div>
  );
}
