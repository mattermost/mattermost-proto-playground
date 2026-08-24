import type {
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
} from 'react';
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
import Chip from '@/components/Chip/Chip';
import type { ChipSize } from '@/components/Chip/Chip';
import Icon from '@/components/Icon/Icon';
import MenuItem from '@/components/MenuItem/MenuItem';
import PopoverMenu, {
  PopoverMenuScroll,
} from '@/components/PopoverMenu/PopoverMenu';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import { useAnchoredPopupPortal } from '@/hooks/useAnchoredPopupPortal';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import { usePopoverTransition } from '@/hooks/usePopoverTransition';
import { toKebab } from '@/utils/string';
import styles from './Combobox.module.scss';

export type ComboboxSize = 'Small' | 'Medium' | 'Large';

export type ComboboxOption = {
  value: string;
  label: string;
  disabled?: boolean;
  /** Leading content for the list row (icon or avatar node). */
  leadingVisual?: ReactNode;
  /** Avatar for chips / list when a photo is preferred over `leadingVisual`. */
  leadingAvatar?: { src: string; alt: string };
  secondaryLabel?: string;
};

export interface ComboboxProps {
  options: ComboboxOption[];
  /** When true, selected values render as removable chips. Default: false. */
  multiple?: boolean;
  value?: string | string[] | null;
  defaultValue?: string | string[] | null;
  onChange?: (value: string | string[] | null) => void;
  inputValue?: string;
  defaultInputValue?: string;
  onInputChange?: (value: string) => void;
  label?: ReactNode;
  placeholder?: string;
  leadingIcon?: ReactNode;
  size?: ComboboxSize;
  invalid?: boolean;
  disabled?: boolean;
  /**
   * Client-side filter. `true` (default) matches labels case-insensitively.
   * `false` shows all options (caller filters via `inputValue` / `onInputChange`).
   */
  filter?: boolean | ((option: ComboboxOption, query: string) => boolean);
  emptyMessage?: string;
  className?: string;
  id?: string;
  'aria-label'?: string;
  /** Portal mount node for the menu; defaults to `document.body`. */
  portalContainer?: HTMLElement | null;
  /** Stacking order for the portaled menu. */
  zIndex?: number;
}

const POPUP_MAX_HEIGHT = 280;

const CHIP_SIZE_BY_COMBOBOX: Record<ComboboxSize, ChipSize> = {
  Small: 'Small',
  Medium: 'Medium',
  Large: 'Large',
};

function defaultFilter(option: ComboboxOption, query: string): boolean {
  if (!query) return true;
  return option.label.toLowerCase().includes(query.toLowerCase());
}

function toSingleValue(
  value: string | string[] | null | undefined,
): string | null {
  if (value == null) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value === '' ? null : value;
}

function toMultiValue(
  value: string | string[] | null | undefined,
): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  return value === '' ? [] : [value];
}

function optionLeadingVisual(option: ComboboxOption): ReactNode | undefined {
  if (option.leadingVisual != null) return option.leadingVisual;
  if (option.leadingAvatar != null) {
    return (
      <UserAvatar
        src={option.leadingAvatar.src}
        alt={option.leadingAvatar.alt}
        size="24"
      />
    );
  }
  return undefined;
}

/**
 * Autocomplete combobox with optional multi-selection chips.
 * Field chrome matches Select / Text Input; list uses PopoverMenu + MenuItem.
 */
const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(function Combobox(
  {
    options,
    multiple = false,
    value: valueProp,
    defaultValue,
    onChange,
    inputValue: inputValueProp,
    defaultInputValue = '',
    onInputChange,
    label,
    placeholder,
    leadingIcon,
    size = 'Medium',
    invalid = false,
    disabled = false,
    filter = true,
    emptyMessage = 'No results',
    className = '',
    id: idProp,
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
  const inputRef = useRef<HTMLInputElement | null>(null);

  const setInputRef = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const isValueControlled = valueProp !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<
    string | string[] | null
  >(() => {
    if (defaultValue !== undefined) return defaultValue;
    return multiple ? [] : null;
  });

  const rawValue = isValueControlled ? valueProp! : uncontrolledValue;
  const singleValue = multiple ? null : toSingleValue(rawValue);
  const multiValue = multiple ? toMultiValue(rawValue) : [];

  const isInputControlled = inputValueProp !== undefined;
  const [uncontrolledInput, setUncontrolledInput] = useState(defaultInputValue);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [queryOverride, setQueryOverride] = useState<string | null>(null);

  const selectedOption = useMemo(
    () =>
      singleValue == null
        ? undefined
        : options.find((o) => o.value === singleValue),
    [options, singleValue],
  );

  // Single-select: show the selected label until the user starts typing a filter.
  // `queryOverride !== null` means the field is in filter-edit mode.
  const displayInput = (() => {
    if (isInputControlled) return inputValueProp!;
    if (multiple) return uncontrolledInput;
    if (queryOverride !== null) return queryOverride;
    return selectedOption?.label ?? uncontrolledInput;
  })();

  const filterQuery = (() => {
    if (isInputControlled) return inputValueProp!;
    if (multiple) return uncontrolledInput;
    if (queryOverride !== null) return queryOverride;
    return '';
  })();

  const setInputDisplay = useCallback(
    (next: string) => {
      if (!isInputControlled) {
        setUncontrolledInput(next);
        if (!multiple) setQueryOverride(next);
      }
      onInputChange?.(next);
    },
    [isInputControlled, multiple, onInputChange],
  );

  const commitValue = useCallback(
    (next: string | string[] | null) => {
      if (!isValueControlled) setUncontrolledValue(next);
      onChange?.(next);
    },
    [isValueControlled, onChange],
  );

  const filteredOptions = useMemo(() => {
    if (filter === false) return options;
    const fn = typeof filter === 'function' ? filter : defaultFilter;
    return options.filter((o) => fn(o, filterQuery));
  }, [options, filter, filterQuery]);

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
    if (!multiple && !isInputControlled) {
      setQueryOverride(null);
      setUncontrolledInput('');
    }
  }, [multiple, isInputControlled]);

  const open = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
  }, [disabled]);

  useOutsideClose(rootRef, isOpen, close, portalRef);

  useEffect(() => {
    if (!isOpen) return;
    setActiveIndex((prev) => {
      if (filteredOptions.length === 0) return -1;
      if (prev >= 0 && prev < filteredOptions.length) return prev;
      const selectedIdx = multiple
        ? filteredOptions.findIndex((o) => multiValue.includes(o.value))
        : filteredOptions.findIndex((o) => o.value === singleValue);
      return selectedIdx >= 0 ? selectedIdx : 0;
    });
  }, [isOpen, filteredOptions, multiple, multiValue, singleValue]);

  const isSelected = useCallback(
    (optionValue: string) =>
      multiple
        ? multiValue.includes(optionValue)
        : singleValue === optionValue,
    [multiple, multiValue, singleValue],
  );

  const selectOption = useCallback(
    (option: ComboboxOption) => {
      if (option.disabled) return;

      if (multiple) {
        const next = multiValue.includes(option.value)
          ? multiValue.filter((v) => v !== option.value)
          : [...multiValue, option.value];
        commitValue(next);
        setInputDisplay('');
        close();
        inputRef.current?.focus();
        return;
      }

      commitValue(option.value);
      if (!isInputControlled) {
        setUncontrolledInput('');
        setQueryOverride(null);
      } else {
        onInputChange?.(option.label);
      }
      close();
    },
    [
      multiple,
      multiValue,
      commitValue,
      setInputDisplay,
      isInputControlled,
      onInputChange,
      close,
    ],
  );

  const removeValue = useCallback(
    (optionValue: string) => {
      if (!multiple) return;
      commitValue(multiValue.filter((v) => v !== optionValue));
      inputRef.current?.focus();
    },
    [multiple, multiValue, commitValue],
  );

  const moveActive = useCallback(
    (delta: number) => {
      const enabled = filteredOptions
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
    [filteredOptions],
  );

  useEffect(() => {
    if (!isOpen || activeIndex < 0) return;
    const option = filteredOptions[activeIndex];
    if (!option) return;
    const el = document.getElementById(
      `${listboxId}-option-${option.value}`,
    );
    el?.scrollIntoView({ block: 'nearest' });
  }, [isOpen, activeIndex, filteredOptions, listboxId]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setInputDisplay(next);
    if (!isOpen) open();
    setActiveIndex(0);
  };

  const handleFocus = () => {
    setIsFocused(true);
    open();
    // Select-all so the next keystroke replaces the selected label (filter mode).
    if (!multiple && !isInputControlled && selectedOption) {
      requestAnimationFrame(() => {
        inputRef.current?.select();
      });
    }
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    // Delay so option mousedown can run first
    const related = e.relatedTarget as Node | null;
    if (related && rootRef.current?.contains(related)) return;
    setIsFocused(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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
        if (isOpen && filteredOptions.length > 0) {
          e.preventDefault();
          setActiveIndex(
            filteredOptions.findIndex((o) => !o.disabled) >= 0
              ? filteredOptions.findIndex((o) => !o.disabled)
              : 0,
          );
        }
        break;
      case 'End':
        if (isOpen && filteredOptions.length > 0) {
          e.preventDefault();
          for (let i = filteredOptions.length - 1; i >= 0; i--) {
            if (!filteredOptions[i]?.disabled) {
              setActiveIndex(i);
              break;
            }
          }
        }
        break;
      case 'Enter':
        if (isOpen && activeIndex >= 0 && filteredOptions[activeIndex]) {
          e.preventDefault();
          selectOption(filteredOptions[activeIndex]);
        }
        break;
      case 'Escape':
        if (isOpen) {
          e.preventDefault();
          close();
        }
        break;
      case 'Backspace':
        if (
          multiple &&
          displayInput === '' &&
          multiValue.length > 0
        ) {
          e.preventDefault();
          removeValue(multiValue[multiValue.length - 1]);
        }
        break;
      case 'Tab':
        close();
        break;
      default:
        break;
    }
  };

  const handleWrapperMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    // Don't steal focus from chip remove buttons
    if ((e.target as HTMLElement).closest('button')) return;
    if (e.target !== inputRef.current) {
      e.preventDefault();
      inputRef.current?.focus();
    }
    if (!isOpen) open();
  };

  const hasSelection = multiple
    ? multiValue.length > 0
    : singleValue != null && singleValue !== '';
  const hasInputText = displayInput.length > 0;
  const labelFloated = isFocused || isOpen || hasSelection || hasInputText;

  const activeOption =
    activeIndex >= 0 ? filteredOptions[activeIndex] : undefined;
  const activeDescendant =
    activeOption != null ? `${listboxId}-option-${activeOption.value}` : undefined;

  const selectedOptions = useMemo(
    () => options.filter((o) => multiValue.includes(o.value)),
    [options, multiValue],
  );

  const sizeClass = styles[`combobox--size-${toKebab(size)}`];
  const hasChips = multiple && selectedOptions.length > 0;
  const rootClass = [
    styles.combobox,
    sizeClass,
    invalid ? styles['combobox--invalid'] : '',
    label != null && labelFloated ? styles['combobox--label-floated'] : '',
    leadingIcon != null ? styles['combobox--has-leading-icon'] : '',
    hasChips ? styles['combobox--has-chips'] : '',
    isOpen ? styles['combobox--open'] : '',
    disabled ? styles['combobox--disabled'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass} ref={rootRef}>
      <div
        className={styles.combobox__wrapper}
        ref={anchorRef}
      >
        {label != null && (
          <label className={styles.combobox__label} htmlFor={id}>
            {label}
          </label>
        )}
        <div
          className={styles.combobox__inner}
          onMouseDown={handleWrapperMouseDown}
        >
          {leadingIcon != null && (
            <span className={styles.combobox__leadingIcon} aria-hidden>
              {leadingIcon}
            </span>
          )}
          <div className={styles.combobox__value}>
            {multiple &&
              selectedOptions.map((option) => (
                <Chip
                  key={option.value}
                  size={CHIP_SIZE_BY_COMBOBOX[size]}
                  leadingAvatar={option.leadingAvatar}
                  leadingIcon={
                    option.leadingAvatar == null
                      ? option.leadingVisual
                      : undefined
                  }
                  onRemove={
                    disabled
                      ? undefined
                      : (ev) => {
                          ev.stopPropagation();
                          removeValue(option.value);
                        }
                  }
                  removeLabel={`Remove ${option.label}`}
                >
                  {option.label}
                </Chip>
              ))}
            <input
              ref={setInputRef}
              id={id}
              className={styles.combobox__control}
              type="text"
              role="combobox"
              autoComplete="off"
              spellCheck={false}
              disabled={disabled}
              placeholder={
                multiple && selectedOptions.length > 0
                  ? undefined
                  : placeholder
              }
              value={displayInput}
              aria-label={ariaLabel}
              aria-invalid={invalid ? true : undefined}
              aria-expanded={isOpen}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={activeDescendant}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
            />
          </div>
          <span className={styles.combobox__trailingIcon} aria-hidden>
            <Icon size="12" glyph={<ChevronDownIcon />} />
          </span>
        </div>
      </div>

      {popupMounted &&
        renderPortal(
          <div
            ref={portalRef}
            className={[
              styles.combobox__popup,
              placement === 'above' ? styles['combobox__popup--above'] : '',
              popupVisible ? styles['combobox__popup--visible'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={popupStyle}
          >
            <PopoverMenu className={styles.combobox__menu}>
              <PopoverMenuScroll maxHeight={maxHeight}>
                {filteredOptions.length === 0 ? (
                  <p className={styles.combobox__empty}>{emptyMessage}</p>
                ) : (
                  <ul
                    id={listboxId}
                    className={styles.combobox__list}
                    role="listbox"
                    aria-multiselectable={multiple || undefined}
                    aria-label={
                      typeof label === 'string'
                        ? label
                        : (ariaLabel ?? 'Options')
                    }
                  >
                    {filteredOptions.map((option, index) => {
                      const selected = isSelected(option.value);
                      const active = index === activeIndex;
                      const leading = optionLeadingVisual(option);
                      return (
                        <li
                          key={option.value}
                          className={styles.combobox__option}
                          role="presentation"
                        >
                          <MenuItem
                            id={`${listboxId}-option-${option.value}`}
                            role="option"
                            label={option.label}
                            secondaryLabel={option.secondaryLabel}
                            leadingElement={leading != null}
                            leadingVisual={leading}
                            trailingElement={selected}
                            active={active}
                            disabled={option.disabled}
                            aria-selected={selected}
                            onMouseDown={(ev) => {
                              // Prevent input blur before click handler
                              ev.preventDefault();
                            }}
                            onMouseEnter={() => setActiveIndex(index)}
                            onClick={() => selectOption(option)}
                          />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </PopoverMenuScroll>
            </PopoverMenu>
          </div>,
        )}
    </div>
  );
});

export default Combobox;
