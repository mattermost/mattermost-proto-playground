import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Button from '@/components/Button/Button';
import { toKebab } from '@/utils/string';
import Icon from '@/components/Icon/Icon';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import styles from './Dropdown.module.scss';

export type DropdownSize = 'X-Small' | 'Small' | 'Medium' | 'Large' | 'X-Large';
export type DropdownAppearance = 'Default' | 'Inverted';
export type DropdownPadding = 'Tight' | 'Compact';

export interface DropdownProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'size'
> {
  /** Optional CSS class name. */
  className?: string;
  /** Label text shown in the trigger. */
  children: ReactNode;
  /** Optional leading icon. */
  leadingIcon?: ReactNode;
  /** Trigger inset. Tight is default; Compact adds more padding (Figma). Default: Tight. */
  padding?: DropdownPadding;
  /** Size variant. Default: Medium. */
  size?: DropdownSize;
  /** Light or dark background context. Default: Default. */
  appearance?: DropdownAppearance;
  /** When true, the dropdown is in an open/active state. */
  isOpen?: boolean;
}

/**
 * Dropdown trigger component — inline select/dropdown button composed with a chevron.
 * Multiple sizes. Light and dark background variants. Composed with Menu Items.
 * Matches Figma Dropdown v2.1.3.
 *
 * @see https://compass.mattermost.com/29be2c109/p/78f994-dropdowns
 */
export default function Dropdown({
  className = '',
  children,
  leadingIcon,
  padding = 'Tight',
  size = 'Medium',
  appearance = 'Default',
  isOpen = false,
  disabled,
  type = 'button',
  ...rest
}: DropdownProps) {
  const sizeClass = styles[`dropdown--size-${toKebab(size)}`];
  const paddingClass =
    padding === 'Compact' ? styles['dropdown--padding-compact'] : '';
  const appearanceClass =
    appearance === 'Inverted' ? styles['dropdown--appearance-inverted'] : '';
  const openClass = isOpen ? styles['dropdown--open'] : '';

  const rootClass = [
    styles.dropdown,
    sizeClass,
    paddingClass,
    appearanceClass,
    openClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Button
      className={rootClass}
      emphasis="Quaternary"
      size="Medium"
      type={type}
      disabled={disabled}
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      {...rest}
    >
      <span className={styles.dropdown__trigger}>
        <span className={styles.dropdown__content}>
          {leadingIcon != null && (
            <span className={styles.dropdown__leadingIcon} aria-hidden>
              {leadingIcon}
            </span>
          )}
          <span className={styles.dropdown__label}>{children}</span>
        </span>
        <span className={styles.dropdown__chevron} aria-hidden>
          <Icon size="12" glyph={<ChevronDownIcon />} />
        </span>
      </span>
    </Button>
  );
}
