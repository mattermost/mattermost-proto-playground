import { forwardRef, useId, useState, useCallback } from 'react';
import type { InputHTMLAttributes } from 'react';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import CloseCircleIcon from '@mattermost/compass-icons/components/close-circle';
import Icon from '@/components/ui/Icon/Icon';
import styles from './ConsoleSearch.module.scss';

export interface ConsoleSearchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Optional CSS class name. */
  className?: string;
  /** Callback when the clear button is clicked. */
  onClear?: () => void;
}

/**
 * System Console sidebar search input — pill-shaped, translucent, sized to
 * sit on the dark sidebar background. Filters the admin sidebar nav.
 *
 * Distinct from SearchInput: ConsoleSearch is tuned for the sidebar's dark
 * surface and uses sidebar text tokens for foreground; SearchInput is the
 * general-purpose surface input.
 *
 * @see Figma: Compass System Console → Console Search
 */
const ConsoleSearch = forwardRef<HTMLInputElement, ConsoleSearchProps>(
  function ConsoleSearch(
    {
      className = '',
      placeholder = 'Find settings',
      onClear,
      id: idProp,
      value: valueProp,
      defaultValue,
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
    const handleClear = useCallback(() => {
      if (!isControlled) setUncontrolledValue('');
      onClear?.();
    }, [isControlled, onClear]);

    const rootClass = [
      styles['console-search'],
      isFocused ? styles['console-search--focused'] : '',
      hasValue ? styles['console-search--filled'] : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={rootClass}>
        <span className={styles['console-search__icon']} aria-hidden>
          <Icon size="16" glyph={<MagnifyIcon />} />
        </span>
        <input
          ref={ref}
          id={id}
          type="search"
          className={styles['console-search__input']}
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
            className={styles['console-search__clear']}
            onClick={handleClear}
            aria-label="Clear search"
            tabIndex={-1}
          >
            <Icon size="16" glyph={<CloseCircleIcon />} />
          </button>
        )}
      </div>
    );
  },
);

export default ConsoleSearch;
