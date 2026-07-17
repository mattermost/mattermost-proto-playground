import type { InputHTMLAttributes } from 'react';
import { useId } from 'react';
import { useControllable } from '@/hooks/useControllable';
import { toKebab } from '@/utils/string';
import styles from './Radio.module.scss';

export type RadioSize = 'Small' | 'Medium' | 'Large';

export interface RadioProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type'
> {
  /** Optional CSS class name. */
  className?: string;
  /** Size variant. Figma: Small (12px), Medium (16px), Large (20px). Default: Medium. */
  size?: RadioSize;
  /** When false, uses error/destructive styling (red when checked). Default: true. */
  valid?: boolean;
  /** Label content. Rendered next to the radio. */
  children?: React.ReactNode;
}

/**
 * Radio component built on the native HTML radio input.
 * Supports checked/unchecked; sizes and valid/invalid styling match Figma Radio v2.0.0.
 *
 * Use with a shared `name` when grouping options so only one is selected.
 * Use with a label: pass children to render label text, or wrap in your own <label>.
 *
 * @see https://compass.mattermost.com (Radio)
 */
export default function Radio({
  className = '',
  size = 'Medium',
  valid = true,
  children,
  id: idProp,
  checked,
  defaultChecked,
  disabled,
  onChange,
  name,
  value,
  ...rest
}: RadioProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const [, handleChange] = useControllable(checked, defaultChecked, onChange);

  const sizeClass = styles[`radio--size-${toKebab(size)}`];
  const invalidClass = valid ? '' : styles['radio--invalid'];

  const rootClass = [styles.radio, sizeClass, invalidClass, className]
    .filter(Boolean)
    .join(' ');

  return (
    <label className={rootClass} htmlFor={id}>
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        className={styles['radio__input']}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        aria-invalid={valid ? undefined : true}
        onChange={handleChange}
        {...rest}
      />
      <span className={styles['radio__circle']}>
        <span className={styles['radio__dot']} aria-hidden />
      </span>
      {children != null && (
        <span className={styles['radio__label']}>{children}</span>
      )}
    </label>
  );
}
