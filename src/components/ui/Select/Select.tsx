import type { SelectHTMLAttributes, ReactNode } from 'react';
import { forwardRef, useId, useState, useCallback } from 'react';
import { toKebab } from '@/utils/string';
import Icon from '@/components/ui/Icon/Icon';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import styles from './Select.module.scss';

export type SelectSize = 'Small' | 'Medium' | 'Large';

export interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'size'
> {
  /** Optional CSS class name. */
  className?: string;
  /** When true, shows invalid/error styling. */
  invalid?: boolean;
  /** Floating label. When provided, floats above the border when a value is selected. */
  label?: ReactNode;
  /** Leading icon element. */
  leadingIcon?: ReactNode;
  /** Size variant. Default: Medium. */
  size?: SelectSize;
  /** Select option items. */
  children?: ReactNode;
}

/**
 * Select component with floating label, leading icon, and size variants.
 * Matches Figma Select v2.0.1. Use for form-based selection (more detailed than Dropdown).
 *
 * @see https://compass.mattermost.com (Select)
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    className = '',
    size = 'Medium',
    label,
    leadingIcon,
    invalid = false,
    id: idProp,
    value: valueProp,
    defaultValue,
    onChange,
    disabled,
    children,
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

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (!isControlled) setUncontrolledValue(e.target.value);
      onChange?.(e);
    },
    [isControlled, onChange],
  );

  const sizeClass = styles[`select--size-${toKebab(size)}`];
  const invalidClass = invalid ? styles['select--invalid'] : '';
  const labelFloatedClass =
    label != null && hasValue ? styles['select--label-floated'] : '';
  const hasLeadingClass =
    leadingIcon != null ? styles['select--has-leading-icon'] : '';

  const rootClass = [
    styles.select,
    sizeClass,
    invalidClass,
    labelFloatedClass,
    hasLeadingClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      <div className={styles.select__wrapper}>
        {label != null && (
          <label className={styles.select__label} htmlFor={id}>
            {label}
          </label>
        )}
        <div className={styles.select__inner}>
          {leadingIcon != null && (
            <span className={styles.select__leadingIcon} aria-hidden>
              {leadingIcon}
            </span>
          )}
          <select
            ref={ref}
            id={id}
            className={styles.select__control}
            value={isControlled ? valueProp : undefined}
            defaultValue={isControlled ? undefined : defaultValue}
            disabled={disabled}
            aria-invalid={invalid ? true : undefined}
            onChange={handleChange}
            {...rest}
          >
            {children}
          </select>
          <span className={styles.select__trailingIcon} aria-hidden>
            <Icon size="12" glyph={<ChevronDownIcon />} />
          </span>
        </div>
      </div>
    </div>
  );
});

export default Select;
