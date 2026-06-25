import type { InputHTMLAttributes, ReactNode } from 'react';
import { forwardRef, useId, useState, useCallback } from 'react';
import { toKebab } from '@/utils/string';
import Icon from '@/components/Icon/Icon';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import CloseCircleIcon from '@mattermost/compass-icons/components/close-circle';
import styles from './SearchInput.module.scss';

export type SearchInputSize = 'Small' | 'Medium' | 'Large';

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
  /** Optional clear/trailing icon to show when field has a value. */
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
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isControlled) setUncontrolledValue(e.target.value);
        onChange?.(e);
      },
      [isControlled, onChange],
    );

    const sizeClass = styles[`searchInput--size-${toKebab(size)}`];
    const labelFloatedClass =
      label != null && labelFloated ? styles['searchInput--label-floated'] : '';
    const filledClass = hasValue ? styles['searchInput--filled'] : '';

    const rootClass = [
      styles.searchInput,
      sizeClass,
      labelFloatedClass,
      filledClass,
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
            <span className={styles.searchInput__searchIcon} aria-hidden>
              <Icon size="16" glyph={<MagnifyIcon />} />
            </span>
            <input
              ref={ref}
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
            {hasValue && onClear != null && (
              <button
                type="button"
                className={styles.searchInput__clearButton}
                onClick={onClear}
                aria-label="Clear search"
                tabIndex={-1}
              >
                <Icon size="16" glyph={<CloseCircleIcon />} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  },
);

export default SearchInput;
