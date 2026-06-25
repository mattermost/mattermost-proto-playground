import type { TextareaHTMLAttributes, ReactNode, ChangeEvent } from 'react';
import { forwardRef, useId, useState, useCallback } from 'react';
import { toKebab } from '@/utils/string';
import styles from './TextArea.module.scss';

export type TextAreaSize = 'Small' | 'Medium' | 'Large';

export interface TextAreaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'size'
> {
  /** Optional CSS class name. */
  className?: string;
  /** When true, shows invalid/error styling. */
  invalid?: boolean;
  /** Floating label content. When provided, label floats on focus or when value is non-empty. */
  label?: ReactNode;
  /** Max length for the textarea; used with showCharacterCount for counter. */
  maxLength?: number;
  /** When true with maxLength, shows "current / max" character count below textarea. */
  showCharacterCount?: boolean;
  /** Size variant. Default: Medium. */
  size?: TextAreaSize;
}

/**
 * Text Area component with optional floating label and character counter.
 * Multi-line text input for long-form content. Matches Figma Text Area v2.0.0.
 * Used in message compose, post editing, admin settings.
 *
 * @see https://compass.mattermost.com (Text Area)
 */
const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea(
    {
      className = '',
      size = 'Medium',
      label,
      invalid = false,
      maxLength,
      showCharacterCount = false,
      id: idProp,
      value: valueProp,
      defaultValue,
      placeholder,
      onFocus,
      onBlur,
      onChange,
      disabled,
      readOnly,
      rows = 3,
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
      (e: React.FocusEvent<HTMLTextAreaElement>) => {
        setIsFocused(true);
        onFocus?.(e);
      },
      [onFocus],
    );
    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLTextAreaElement>) => {
        setIsFocused(false);
        onBlur?.(e);
      },
      [onBlur],
    );
    const handleChange = useCallback(
      (e: ChangeEvent<HTMLTextAreaElement>) => {
        if (!isControlled) setUncontrolledValue(e.target.value);
        onChange?.(e);
      },
      [isControlled, onChange],
    );

    const sizeClass = styles[`textArea--size-${toKebab(size)}`];
    const invalidClass = invalid ? styles['textArea--invalid'] : '';
    const labelFloatedClass =
      label != null && labelFloated ? styles['textArea--label-floated'] : '';

    const rootClass = [
      styles.textArea,
      sizeClass,
      invalidClass,
      labelFloatedClass,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const currentLength = typeof value === 'string' ? value.length : 0;
    const counterId =
      showCharacterCount && maxLength != null ? `${id}-counter` : undefined;

    return (
      <div className={rootClass}>
        <div className={styles.textArea__wrapper}>
          {label != null && (
            <label className={styles.textArea__label} htmlFor={id}>
              {label}
            </label>
          )}
          <textarea
            ref={ref}
            id={id}
            className={styles.textArea__input}
            value={isControlled ? valueProp : undefined}
            defaultValue={isControlled ? undefined : defaultValue}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={disabled}
            readOnly={readOnly}
            rows={rows}
            aria-invalid={invalid ? true : undefined}
            aria-describedby={counterId}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...rest}
          />
        </div>
        {showCharacterCount && maxLength != null && (
          <div
            id={counterId}
            className={styles.textArea__counter}
            aria-live="polite"
          >
            {currentLength} / {maxLength}
          </div>
        )}
      </div>
    );
  },
);

export default TextArea;
