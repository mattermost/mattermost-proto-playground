import type { ReactNode } from 'react';
import { useId, useRef, useState } from 'react';
import { toKebab } from '@/utils/string';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import Icon from '@/components/ui/Icon/Icon';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import selectStyles from '@/components/ui/Select/Select.module.scss';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import styles from './SelectMenu.module.scss';

export type SelectMenuSize = 'Small' | 'Medium' | 'Large';

export interface SelectMenuOption {
  value: string;
  label: string;
}

export interface SelectMenuProps {
  className?: string;
  disabled?: boolean;
  id?: string;
  invalid?: boolean;
  label?: ReactNode;
  options: SelectMenuOption[];
  size?: SelectMenuSize;
  value: string;
  onChange: (value: string) => void;
}

export default function SelectMenu({
  className = '',
  disabled = false,
  id: idProp,
  invalid = false,
  label,
  options,
  size = 'Medium',
  value,
  onChange,
}: SelectMenuProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useOutsideClose(rootRef, open, () => setOpen(false));

  const selected =
    options.find((option) => option.value === value) ?? options[0] ?? null;
  const hasValue = value != null && value !== '';

  const sizeClass = selectStyles[`select--size-${toKebab(size)}`];
  const invalidClass = invalid ? selectStyles['select--invalid'] : '';
  const labelFloatedClass =
    label != null && hasValue ? selectStyles['select--label-floated'] : '';

  const rootClass = [
    selectStyles.select,
    styles['select-menu'],
    sizeClass,
    invalidClass,
    labelFloatedClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <div className={rootClass}>
      <div ref={rootRef} className={styles['select-menu__anchor']}>
        <div
          className={[
            selectStyles.select__wrapper,
            open ? styles['select-menu__wrapper--open'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {label != null && (
            <label className={selectStyles.select__label} htmlFor={id}>
              {label}
            </label>
          )}
          <div className={selectStyles.select__inner}>
            <button
              id={id}
              type="button"
              className={styles['select-menu__trigger']}
              disabled={disabled}
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-invalid={invalid ? true : undefined}
              onClick={() => setOpen((current) => !current)}
            >
              {selected?.label ?? ''}
            </button>
            <span className={selectStyles.select__trailingIcon} aria-hidden>
              <Icon size="12" glyph={<ChevronDownIcon />} />
            </span>
          </div>
        </div>

        {open && (
          <PopoverMenu
            className={styles['select-menu__menu']}
            role="listbox"
            aria-labelledby={id}
          >
            {options.map((option) => (
              <MenuItem
                key={option.value}
                label={option.label}
                leadingElement={false}
                trailingElement={option.value === value}
                role="option"
                aria-selected={option.value === value}
                onClick={() => handleSelect(option.value)}
              />
            ))}
          </PopoverMenu>
        )}
      </div>
    </div>
  );
}
