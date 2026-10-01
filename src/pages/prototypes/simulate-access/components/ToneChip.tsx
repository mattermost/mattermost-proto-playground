import type { HTMLAttributes, KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { Chip } from '@mattermost/compass-ui/components/chip';
import { Icon } from '@mattermost/compass-ui/components/icon';
import styles from './ToneChip.module.scss';

/** Semantic state tone. Tints the chip background and colors the label/icon. */
export type ChipTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export interface ToneChipProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onClick'> {
  children: ReactNode;
  size?: 'small' | 'medium' | 'large';
  tone?: ChipTone;
  /** Leading glyph from @mattermost/compass-icons (Chip wraps it in Icon). */
  leadingIcon?: ReactNode;
  /** Trailing glyph (e.g. chevron) rendered after the label. */
  trailingIcon?: ReactNode;
  /** `'button'` makes the chip itself the click target. Default: `'div'`. */
  as?: 'div' | 'button';
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Compass `Chip` with the verdict tones and click-target mode the Simulate
 * Access mockups use.
 *
 * Published `Chip` has no `tone`, `trailingIcon`, or `as` props, so tone is a
 * className override, the trailing glyph rides in the label slot, and the
 * interactive mode adds button semantics to the real Chip root.
 */
export default function ToneChip({
  children,
  size = 'medium',
  tone = 'neutral',
  leadingIcon,
  trailingIcon,
  as = 'div',
  onClick,
  disabled = false,
  className = '',
  ...rest
}: ToneChipProps) {
  const interactive = as === 'button';
  const rootClass = [
    styles['tone-chip'],
    tone !== 'neutral' ? styles[`tone-chip--${tone}`] : '',
    interactive ? styles['tone-chip--interactive'] : '',
    disabled ? styles['tone-chip--disabled'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.currentTarget.click();
    }
  };

  return (
    <Chip
      size={size}
      leadingIcon={leadingIcon}
      className={rootClass}
      {...rest}
      {...(interactive
        ? {
            role: 'button',
            tabIndex: disabled ? -1 : 0,
            'aria-disabled': disabled || undefined,
            onClick: disabled ? undefined : onClick,
            onKeyDown: handleKeyDown,
          }
        : {})}
    >
      {children}
      {trailingIcon != null ? (
        <span className={styles['tone-chip__trailing']} aria-hidden>
          <Icon glyph={trailingIcon} size={size === 'large' ? '16' : size === 'small' ? '10' : '12'} />
        </span>
      ) : null}
    </Chip>
  );
}
