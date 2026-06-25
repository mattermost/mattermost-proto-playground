import type { InputHTMLAttributes } from 'react';
import { useRef, useEffect, useId } from 'react';
import { useControllable } from '@/hooks/useControllable';
import Icon from '@/components/Icon/Icon';
import type { IconSize } from '@/components/Icon/Icon';
import type { ElementType } from 'react';
import CheckIcon from '@mattermost/compass-icons/components/check';
import MinusIcon from '@mattermost/compass-icons/components/minus';
import { toKebab } from '@/utils/string';
import styles from './Checkbox.module.scss';

export type CheckboxSize = 'Small' | 'Medium' | 'Large';

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type'
> {
  /** Optional CSS class name. */
  className?: string;
  /** When true, shows indeterminate (minus) state. Syncs to native input.indeterminate. */
  indeterminate?: boolean;
  /** Size variant. Figma: Small (12px), Medium (16px), Large (20px). Default: Medium. */
  size?: CheckboxSize;
  /** When false, uses error/destructive styling (red fill when checked). Default: true. */
  valid?: boolean;
  /** Label content. Rendered next to the checkbox. */
  children?: React.ReactNode;
}

/** Icon size from design system scale for each checkbox size (fits inside box). */
const CHECKBOX_ICON_SIZE: Record<CheckboxSize, IconSize> = {
  Small: '10',
  Medium: '12',
  Large: '16',
};

/** Compass icon component per checked/indeterminate state. */
const ICON_COMPONENT: Record<'check' | 'minus', ElementType> = {
  check: CheckIcon,
  minus: MinusIcon,
};

/**
 * Checkbox component built on the native HTML checkbox.
 * Supports checked, unchecked, and indeterminate states; sizes and valid/invalid
 * styling match Figma Checkbox (Checkbox Selector) v2.0.2.
 *
 * Use with a label: pass children to render label text, or wrap in your own <label>.
 * Indeterminate must be set via the `indeterminate` prop (native attribute is not reflectable).
 *
 * @see https://compass.mattermost.com (Checkbox)
 */
export default function Checkbox({
  className = '',
  indeterminate = false,
  size = 'Medium',
  valid = true,
  children,
  id: idProp,
  checked,
  defaultChecked,
  disabled,
  onChange,
  ...rest
}: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const [resolvedChecked, handleChange] = useControllable(
    checked,
    defaultChecked,
    onChange,
  );

  const showingIcon = indeterminate
    ? 'minus'
    : resolvedChecked
      ? 'check'
      : null;

  useEffect(() => {
    const input = inputRef.current;
    if (input) input.indeterminate = indeterminate;
  }, [indeterminate]);

  const sizeClass = styles[`checkbox--size-${toKebab(size)}`];
  const invalidClass = valid ? '' : styles['checkbox--invalid'];
  const indeterminateClass = indeterminate
    ? styles['checkbox--indeterminate']
    : '';

  const rootClass = [
    styles.checkbox,
    sizeClass,
    invalidClass,
    indeterminateClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const iconSize = CHECKBOX_ICON_SIZE[size];

  return (
    <label className={rootClass} htmlFor={id}>
      <input
        ref={inputRef}
        id={id}
        type="checkbox"
        className={styles['checkbox__input']}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        aria-invalid={valid ? undefined : true}
        onChange={handleChange}
        {...rest}
      />
      <span className={styles['checkbox__box']}>
        {showingIcon !== null &&
          (() => {
            const IconComponent = ICON_COMPONENT[showingIcon];
            return (
              <span key={showingIcon} className={styles['checkbox__icon']}>
                <Icon glyph={<IconComponent />} size={iconSize} />
              </span>
            );
          })()}
      </span>
      {children != null && (
        <span className={styles['checkbox__label']}>{children}</span>
      )}
    </label>
  );
}
