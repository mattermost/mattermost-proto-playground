import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import Icon from '@/components/Icon/Icon';
import type { IconSize } from '@/components/Icon/Icon';
import { toKebab } from '@/utils/string';
import { mattermostButtonClasses } from './buttonClasses';
import styles from './Button.module.scss';

export type ButtonEmphasis =
  | 'Primary'
  | 'Secondary'
  | 'Tertiary'
  | 'Quaternary';

export type ButtonSize = 'X-Small' | 'Small' | 'Medium' | 'Large';

export type ButtonAppearance = 'Default' | 'Inverted';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Default | Inverted (for use on dark backgrounds). Maps to Figma "Style". */
  appearance?: ButtonAppearance;
  /** Optional CSS class name. */
  className?: string;
  /** Button label. */
  children: React.ReactNode;
  /** When true, uses destructive (danger) styling. */
  destructive?: boolean;
  /** Visual emphasis. Default: Primary. */
  emphasis?: ButtonEmphasis;
  /** Leading icon (e.g. <Icon glyph={<SomeIcon />} size="16" />). Icon size should match button size. */
  leadingIcon?: ReactNode;
  /** Size variant. Default: Medium. */
  size?: ButtonSize;
  /** Trailing icon. */
  trailingIcon?: ReactNode;
}

const SIZE_ICON_MAP: Record<ButtonSize, IconSize> = {
  'X-Small': '12',
  Small: '16',
  Medium: '16',
  Large: '20',
};

/**
 * Button matching Figma/Compass variants.
 * Colors come from host semantic theme vars (`--button-bg`, `--error-text`, …).
 *
 * @see https://compass.mattermost.com/29be2c109/p/40e456-buttons
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    appearance = 'Default',
    className = '',
    destructive = false,
    emphasis = 'Primary',
    children,
    leadingIcon,
    size = 'Medium',
    trailingIcon,
    disabled,
    type = 'button',
    ...rest
  },
  ref,
) {
  const iconSize = SIZE_ICON_MAP[size];
  const emphasisClass = styles[`button--emphasis-${toKebab(emphasis)}`];
  const sizeClass = styles[`button--size-${toKebab(size)}`];
  const appearanceClass =
    appearance === 'Inverted' ? styles['button--appearance-inverted'] : '';
  const destructiveClass = destructive ? styles['button--destructive'] : '';

  const rootClass = [
    mattermostButtonClasses({ appearance, destructive, emphasis, size }),
    styles.button,
    emphasisClass,
    sizeClass,
    appearanceClass,
    destructiveClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      {...rest}
      ref={ref}
      className={rootClass}
      type={type}
      disabled={disabled}
    >
      {leadingIcon != null ? (
        <span className={styles['button__icon-slot']} aria-hidden>
          {typeof leadingIcon === 'boolean' ? (
            <Icon size={iconSize} />
          ) : (
            leadingIcon
          )}
        </span>
      ) : null}
      <span className={styles['button__label']}>{children}</span>
      {trailingIcon != null ? (
        <span className={styles['button__icon-slot']} aria-hidden>
          {typeof trailingIcon === 'boolean' ? (
            <Icon size={iconSize} />
          ) : (
            trailingIcon
          )}
        </span>
      ) : null}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
