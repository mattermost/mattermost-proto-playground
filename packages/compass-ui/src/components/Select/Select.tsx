import type { KeyboardEvent, ReactNode } from 'react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import CheckIcon from '@mattermost/compass-icons/components/check';
import Icon from '@/components/Icon/Icon';
import PopoverMenu, {
  PopoverMenuScroll,
} from '@/components/PopoverMenu/PopoverMenu';
import menuItemStyles from '@/components/MenuItem/MenuItem.module.scss';
import { useAnchoredPopupPortal } from '@/hooks/useAnchoredPopupPortal';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import { usePopoverTransition } from '@/hooks/usePopoverTransition';
import { toKebab } from '@/utils/string';
import styles from './Select.module.scss';

export type SelectSize = 'Small' | 'Medium' | 'Large';

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
  leadingVisual?: ReactNode;
  secondaryLabel?: string;
};

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Shown on the trigger when no value is selected. Empty-value options are not listed in the menu. */
  placeholder?: string;
  label?: ReactNode;
  leadingIcon?: ReactNode;
  size?: SelectSize;
  invalid?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
  'aria-label'?: string;
  /** Portal mount node for the menu; defaults to `document.body`. */
  portalContainer?: HTMLElement | null;
  /** Stacking order for the portaled menu. */
  zIndex?: number;
}

const POPUP_MAX_HEIGHT = 280;

function SelectOptionRow({
  option,
  listboxId,
  selected,
  active,
  onSelect,
  onHover,
}: {
  option: SelectOption;
  listboxId: string;
  selected: boolean;
  active: boolean;
  onSelect: (option: SelectOption) => void;
  onHover: () => void;
}) {
  const rowClass = [
    menuItemStyles['menu-item'],
    active ? menuItemStyles['menu-item--active'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <li
      id={`${listboxId}-option-${option.value}`}
      role="option"
      className={[styles.select__option, rowClass].filter(Boolean).join(' ')}
      aria-selected={selected}
      aria-disabled={option.disabled || undefined}
      onMouseDown={(ev) => ev.preventDefault()}
      onMouseEnter={onHover}
      onPointerUp={() => {
        if (!option.disabled) onSelect(option);
      }}
    >
      <div
        className={[
          menuItemStyles['menu-item__content'],
          option.disabled ? styles['select__option-content--disabled'] : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {option.leadingVisual != null && (
          <div className={menuItemStyles['menu-item__left']}>
            <span className={menuItemStyles['menu-item__leading-visual']}>
              {option.leadingVisual}
            </span>
          </div>
        )}
        <div className={menuItemStyles['menu-item__middle']}>
          <div className={menuItemStyles['menu-item__top-row']}>
            <span className={menuItemStyles['menu-item__label']}>
              {option.label}
            </span>
          </div>
          {option.secondaryLabel != null && (
            <div className={menuItemStyles['menu-item__bottom-row']}>
              <span className={menuItemStyles['menu-item__secondary-label-below']}>
                {option.secondaryLabel}
              </span>
            </div>
          )}
        </div>
        {selected && (
          <div className={menuItemStyles['menu-item__right']}>
            <span
              className={[
                menuItemStyles['menu-item__trailing-visual'],
                menuItemStyles['menu-item__trailing-visual--check'],
              ].join(' ')}
            >
              <Icon glyph={<CheckIcon />} size="16" />
            </span>
          </div>
        )}
      </div>
    </li>
  );
}

/**
 * Select with floating label and PopoverMenu list.
 * Field chrome matches Combobox / Text Input; list uses PopoverMenu + MenuItem.
 *
 * @see https://compass.mattermost.com (Select)
 */
const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
  {
    options,
    value: valueProp,
    defaultValue = '',
    onChange,
    placeholder,
    label,
    leadingIcon,
    size = 'Medium',
    invalid = false,
    disabled = false,
    id: idProp,
    name,
    className = '',
    'aria-label': ariaLabel,
    portalContainer = null,
    zIndex,
  },
  ref,
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const listboxId = `${id}-listbox`;

  const rootRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const setButtonRef = useCallback(
    (node: HTMLButtonElement | null) => {
      buttonRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const isControlled = valueProp !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const value = isControlled ? valueProp! : uncontrolledValue;

  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const selectedOption = useMemo(
    () => options.find((o) => o.value === value),
    [options, value],
  );

  const listOptions = useMemo(
    () => options.filter((o) => o.value !== ''),
    [options],
  );

  const hasValue = value !== '';

  const { mounted: popupMounted, visible: popupVisible } =
    usePopoverTransition(isOpen);

  const {
    placement,
    maxHeight,
    style: popupStyle,
    portalRef,
    renderPortal,
  } = useAnchoredPopupPortal(anchorRef, popupMounted, {
    preferredHeight: POPUP_MAX_HEIGHT,
    maxHeightCap: POPUP_MAX_HEIGHT,
    portalContainer,
    zIndex,
  });

  const close = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

  const open = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
  }, [disabled]);

  useOutsideClose(rootRef, isOpen, close, portalRef);

  useEffect(() => {
    if (!isOpen) return;
    setActiveIndex((prev) => {
      if (listOptions.length === 0) return -1;
      if (prev >= 0 && prev < listOptions.length) return prev;
      const selectedIdx = listOptions.findIndex((o) => o.value === value);
      if (selectedIdx >= 0) return selectedIdx;
      const firstEnabled = listOptions.findIndex((o) => !o.disabled);
      return firstEnabled >= 0 ? firstEnabled : 0;
    });
  }, [isOpen, listOptions, value]);

  const commitValue = useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolledValue(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const selectOption = useCallback(
    (option: SelectOption) => {
      if (option.disabled) return;
      commitValue(option.value);
      close();
      buttonRef.current?.focus();
    },
    [commitValue, close],
  );

  const moveActive = useCallback(
    (delta: number) => {
      const enabled = listOptions
        .map((o, i) => ({ o, i }))
        .filter(({ o }) => !o.disabled);
      if (enabled.length === 0) {
        setActiveIndex(-1);
        return;
      }
      setActiveIndex((prev) => {
        const currentPos = enabled.findIndex(({ i }) => i === prev);
        const nextPos =
          currentPos < 0
            ? delta > 0
              ? 0
              : enabled.length - 1
            : (currentPos + delta + enabled.length) % enabled.length;
        return enabled[nextPos].i;
      });
    },
    [listOptions],
  );

  useEffect(() => {
    if (!isOpen || activeIndex < 0) return;
    const option = listOptions[activeIndex];
    if (!option) return;
    const el = document.getElementById(`${listboxId}-option-${option.value}`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [isOpen, activeIndex, listOptions, listboxId]);

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) open();
        else moveActive(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) open();
        else moveActive(-1);
        break;
      case 'Home':
        if (isOpen && listOptions.length > 0) {
          e.preventDefault();
          const idx = listOptions.findIndex((o) => !o.disabled);
          setActiveIndex(idx >= 0 ? idx : 0);
        }
        break;
      case 'End':
        if (isOpen && listOptions.length > 0) {
          e.preventDefault();
          for (let i = listOptions.length - 1; i >= 0; i--) {
            if (!listOptions[i]?.disabled) {
              setActiveIndex(i);
              break;
            }
          }
        }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen && activeIndex >= 0 && listOptions[activeIndex]) {
          selectOption(listOptions[activeIndex]);
        } else if (!isOpen) {
          open();
        }
        break;
      case 'Escape':
        if (isOpen) {
          e.preventDefault();
          close();
        }
        break;
      case 'Tab':
        close();
        break;
      default:
        break;
    }
  };

  const labelFloated = isFocused || isOpen || hasValue;
  const displayLabel = selectedOption?.label ?? placeholder ?? '';
  const showPlaceholderStyle = !hasValue && displayLabel !== '';

  const activeOption =
    activeIndex >= 0 ? listOptions[activeIndex] : undefined;
  const activeDescendant =
    isOpen && activeOption != null
      ? `${listboxId}-option-${activeOption.value}`
      : undefined;

  const sizeClass = styles[`select--size-${toKebab(size)}`];
  const rootClass = [
    styles.select,
    sizeClass,
    invalid ? styles['select--invalid'] : '',
    label != null && labelFloated ? styles['select--label-floated'] : '',
    leadingIcon != null ? styles['select--has-leading-icon'] : '',
    isOpen ? styles['select--open'] : '',
    disabled ? styles['select--disabled'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const controlClass = [
    styles.select__control,
    showPlaceholderStyle ? styles['select__control--placeholder'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass} ref={rootRef}>
      <div className={styles.select__wrapper} ref={anchorRef}>
        {label != null && (
          <label className={styles.select__label} htmlFor={id}>
            {label}
          </label>
        )}
        <button
          ref={setButtonRef}
          id={id}
          type="button"
          role="combobox"
          className={controlClass}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={activeDescendant}
          aria-invalid={invalid ? true : undefined}
          aria-label={
            ariaLabel ??
            (typeof label === 'string' ? label : undefined)
          }
          onClick={() => (isOpen ? close() : open())}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
        >
          {leadingIcon != null && (
            <span className={styles.select__leadingIcon} aria-hidden>
              {leadingIcon}
            </span>
          )}
          <span className={styles.select__value}>{displayLabel}</span>
          <span className={styles.select__trailingIcon} aria-hidden>
            <Icon size="12" glyph={<ChevronDownIcon />} />
          </span>
        </button>
      </div>

      {name != null && !disabled && (
        <input type="hidden" name={name} value={value} />
      )}

      {popupMounted &&
        renderPortal(
          <div
            ref={portalRef}
            className={[
              styles.select__popup,
              placement === 'above' ? styles['select__popup--above'] : '',
              popupVisible ? styles['select__popup--visible'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={popupStyle}
          >
            <PopoverMenu className={styles.select__menu}>
              <PopoverMenuScroll maxHeight={maxHeight}>
                <ul
                  id={listboxId}
                  className={styles.select__list}
                  role="listbox"
                  aria-label={
                    typeof label === 'string' ? label : (ariaLabel ?? 'Options')
                  }
                >
                  {listOptions.map((option, index) => (
                    <SelectOptionRow
                      key={option.value}
                      option={option}
                      listboxId={listboxId}
                      selected={option.value === value}
                      active={index === activeIndex}
                      onSelect={selectOption}
                      onHover={() => setActiveIndex(index)}
                    />
                  ))}
                </ul>
              </PopoverMenuScroll>
            </PopoverMenu>
          </div>,
        )}
    </div>
  );
});

export default Select;
