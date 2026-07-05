import type { ChangeEvent, InputHTMLAttributes, ReactNode } from 'react';
import {
  forwardRef,
  useId,
  useState,
  useCallback,
  useRef,
} from 'react';
import { toKebab } from '@/utils/string';
import type { IconSize } from '@/components/Icon/Icon';
import Icon from '@/components/Icon/Icon';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import CloseCircleIcon from '@mattermost/compass-icons/components/close-circle';
import styles from './SearchInput.module.scss';

export type SearchInputSize = 'Small' | 'Medium' | 'Large';

const ICON_SIZE_MAP: Record<SearchInputSize, IconSize> = {
  Small: '12',
  Medium: '16',
  Large: '20',
};

export interface SearchInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type'
> {
  /** Optional CSS class name. */
  className?: string;
  /** Floating label (placeholder-style). Floats above border when filled. */
  label?: ReactNode;
  /** Size variant. Default: Medium. */
  size?: SearchInputSize;
  /** Called when the clear button is pressed. Omit to use built-in clearing. */
  onClear?: () => void;
}

/**
 * Search Input component — text input with leading magnifier icon.
 * Used in global search bar, channel search, user search, and filter inputs.
 * Matches Figma Search Input (State: Default/Focus/Filled × Size S/M/L).
 */
const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    {
      className = '',
      size = 'Medium',
      label,
      onClear,
      id: idProp,
      value: valueProp,
      defaultValue,
      placeholder,
      onFocus,
      onBlur,
      onChange,
      disabled,
      ...rest
    },
    ref,
  ) {
    const generatedId = useId();
    const id = idProp ?? generatedId;
    const inputRef = useRef<HTMLInputElement>(null);

    const isControlled = valueProp !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState(
      defaultValue ?? '',
    );
    const value = isControlled ? (valueProp as string) : uncontrolledValue;
    const hasValue = value != null && value !== '';

    const [isFocused, setIsFocused] = useState(false);
    const labelFloated = isFocused || hasValue;

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        onFocus?.(e);
      },
      [onFocus],
    );
    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        onBlur?.(e);
      },
      [onBlur],
    );
    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        if (!isControlled) setUncontrolledValue(e.target.value);
        onChange?.(e);
      },
      [isControlled, onChange],
    );

    const setInputRef = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    const handleClear = useCallback(() => {
      if (disabled) return;

      if (onClear) {
        onClear();
        inputRef.current?.focus();
        return;
      }

      const input = inputRef.current;
      if (input == null) return;

      input.value = '';
      if (!isControlled) setUncontrolledValue('');

      onChange?.({
        target: input,
        currentTarget: input,
      } as ChangeEvent<HTMLInputElement>);

      input.focus();
    }, [disabled, isControlled, onChange, onClear]);

    const showClearButton = hasValue && !disabled;

    const sizeClass = styles[`searchInput--size-${toKebab(size)}`];
    const labelFloatedClass =
      label != null && labelFloated ? styles['searchInput--label-floated'] : '';
    const hasLeadingClass = styles['searchInput--has-leading-icon'];
    const hasTrailingClass = showClearButton
      ? styles['searchInput--has-trailing-icon']
      : '';
    const iconSize = ICON_SIZE_MAP[size];

    const rootClass = [
      styles.searchInput,
      sizeClass,
      labelFloatedClass,
      hasLeadingClass,
      hasTrailingClass,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={rootClass}>
        <div className={styles.searchInput__wrapper}>
          {label != null && (
            <label className={styles.searchInput__label} htmlFor={id}>
              {label}
            </label>
          )}
          <div className={styles.searchInput__inner}>
            <span className={styles.searchInput__leadingIcon} aria-hidden>
              <Icon size={iconSize} glyph={<MagnifyIcon />} />
            </span>
            <input
              ref={setInputRef}
              id={id}
              type="search"
              className={styles.searchInput__input}
              value={isControlled ? valueProp : undefined}
              defaultValue={isControlled ? undefined : defaultValue}
              placeholder={placeholder}
              disabled={disabled}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={handleChange}
              {...rest}
            />
            {showClearButton && (
              <span className={styles.searchInput__trailingIcon}>
                <button
                  type="button"
                  className={styles.searchInput__clearButton}
                  onClick={handleClear}
                  aria-label="Clear search"
                  tabIndex={-1}
                >
                  <Icon size={iconSize} glyph={<CloseCircleIcon />} />
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    );
  },
);

export default SearchInput;
