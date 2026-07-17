import type { InputHTMLAttributes } from 'react';
import { useId } from 'react';
import { useControllable } from '@/hooks/useControllable';
import { toKebab } from '@/utils/string';
import styles from './Switch.module.scss';

export type SwitchSize = 'Small' | 'Medium' | 'Large';

export interface SwitchProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'type'
> {
  /** Optional CSS class name. */
  className?: string;
  /** Size variant. Figma: Small (16px), Medium (20px), Large (24px). Default: Medium. */
  size?: SwitchSize;
  /** Primary label content. Rendered to the left of the switch. */
  children?: React.ReactNode;
  /** Optional secondary label (e.g. description) below the primary label. */
  secondaryLabel?: React.ReactNode;
  /** When true, primary label uses semi-bold (600) weight. Default: false. */
  semiBold?: boolean;
}

/**
 * Switch component built on the native HTML checkbox.
 * Uses role="switch" so assistive tech announces "switch" and on/off state.
 * Renders as a track + sliding knob; checked = on (right), unchecked = off (left).
 *
 * Supports label, optional secondary label, sizes (Small/Medium/Large), and
 * states: default, hover, focus, active, disabled. Matches Figma Switch v2.0.0.
 *
 * Use with a label: pass children for the primary label, or wrap in your own <label>.
 *
 * @see https://compass.mattermost.com (Switch)
 */
export default function Switch({
  className = '',
  size = 'Medium',
  children,
  secondaryLabel,
  semiBold = false,
  id: idProp,
  checked,
  defaultChecked,
  disabled,
  onChange,
  ...rest
}: SwitchProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const [resolvedChecked, handleChange] = useControllable(
    checked,
    defaultChecked,
    onChange,
  );

  const sizeClass = styles[`switch--size-${toKebab(size)}`];
  const semiBoldClass = semiBold ? styles['switch--semi-bold'] : '';
  const secondaryClass =
    secondaryLabel != null ? styles['switch--with-secondary'] : '';

  const rootClass = [
    styles.switch,
    sizeClass,
    semiBoldClass,
    secondaryClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <label className={rootClass} htmlFor={id}>
      {(children != null || secondaryLabel != null) && (
        <span className={styles['switch__labels']}>
          {children != null && (
            <span className={styles['switch__label']}>{children}</span>
          )}
          {secondaryLabel != null && (
            <span className={styles['switch__secondary-label']}>
              {secondaryLabel}
            </span>
          )}
        </span>
      )}
      <span className={styles['switch__track']} aria-hidden>
        {/* Native checkbox (visually hidden via CSS); provides semantics, keyboard, and form support */}
        <input
          id={id}
          type="checkbox"
          role="switch"
          className={styles['switch__input']}
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          aria-checked={resolvedChecked}
          onChange={handleChange}
          {...rest}
        />
        <span className={styles['switch__knob']} />
      </span>
    </label>
  );
}
