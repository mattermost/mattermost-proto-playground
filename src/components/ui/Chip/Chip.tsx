import type { HTMLAttributes, ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react';
import CloseCircleIcon from '@mattermost/compass-icons/components/close-circle';
import Icon from '@/components/ui/Icon/Icon';
import type { IconSize } from '@/components/ui/Icon/Icon';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import type { UserAvatarSize } from '@/components/ui/UserAvatar/UserAvatar';
import { toKebab } from '@/utils/string';
import styles from './Chip.module.scss';

export type ChipSize = 'Small' | 'Medium' | 'Medium Compact' | 'Large';

/**
 * Semantic state tone. Tints the chip background and colors the label/icon.
 * Use for status-bearing chips (verdicts, validations, session-state pills).
 * Default 'neutral' matches the standard chip surface.
 */
export type ChipTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

export interface ChipProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'onClick'
> {
  /** Chip label. */
  children: ReactNode;
  /** Visual size. Default: Medium. */
  size?: ChipSize;
  /** Semantic tone — drives tinted background + label/icon color. Default: 'neutral'. */
  tone?: ChipTone;
  /** Leading icon from @mattermost/compass-icons. */
  leadingIcon?: ReactNode;
  /** Leading avatar. Overrides leadingIcon when both are provided. */
  leadingAvatar?: { src: string; alt: string };
  /**
   * Trailing icon (e.g. chevron) rendered after the label.
   * When `onRemove` is also provided, the remove button takes precedence.
   */
  trailingIcon?: ReactNode;
  /** When provided, shows the remove (×) button and calls this on click. */
  onRemove?: (e: MouseEvent<HTMLButtonElement>) => void;
  /** Accessible label for the remove button. Default: "Remove". */
  removeLabel?: string;
  /** Shows an error border. */
  error?: boolean;
  /** Adds a colored background overlay. */
  colored?: boolean;
  /**
   * Render as a `<button>` instead of a `<div>`. Use when the chip itself is the
   * clickable target (e.g. opens a popover). Default: 'div'.
   */
  as?: 'div' | 'button';
  /** Click handler. Only meaningful when `as='button'`. */
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  /** Forwarded to the underlying button — only used when `as='button'`. */
  disabled?: boolean;
  /** Forwarded to the underlying button — only used when `as='button'`. */
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  className?: string;
}

const ICON_SIZE_MAP: Record<ChipSize, IconSize> = {
  Small: '10',
  Medium: '12',
  'Medium Compact': '12',
  Large: '16',
};

const AVATAR_SIZE_MAP: Record<ChipSize, UserAvatarSize> = {
  Small: '12',
  Medium: '16',
  'Medium Compact': '16',
  Large: '20',
};

export default function Chip({
  children,
  size = 'Medium',
  tone = 'neutral',
  leadingIcon,
  leadingAvatar,
  trailingIcon,
  onRemove,
  removeLabel = 'Remove',
  error = false,
  colored = false,
  as = 'div',
  onClick,
  disabled,
  type = 'button',
  className = '',
  ...rest
}: ChipProps) {
  const iconSize = ICON_SIZE_MAP[size];
  const avatarSize = AVATAR_SIZE_MAP[size];

  const rootClass = [
    styles.chip,
    styles[`chip--size-${toKebab(size)}`],
    tone !== 'neutral' && styles[`chip--tone-${tone}`],
    as === 'button' && styles['chip--interactive'],
    error && styles['chip--error'],
    colored && styles['chip--colored'],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {leadingAvatar != null ? (
        <span className={styles['chip__avatar-slot']}>
          <UserAvatar
            src={leadingAvatar.src}
            alt={leadingAvatar.alt}
            size={avatarSize}
          />
        </span>
      ) : leadingIcon != null ? (
        <span className={styles['chip__icon-slot']} aria-hidden>
          <Icon glyph={leadingIcon} size={iconSize} />
        </span>
      ) : null}
      <span className={styles['chip__label']}>{children}</span>
      {onRemove != null ? (
        <button
          type="button"
          className={styles['chip__remove']}
          onClick={onRemove}
          aria-label={removeLabel}
        >
          <CloseCircleIcon size={Number(iconSize)} aria-hidden />
        </button>
      ) : trailingIcon != null ? (
        <span className={styles['chip__trailing-slot']} aria-hidden>
          <Icon glyph={trailingIcon} size={iconSize} />
        </span>
      ) : null}
    </>
  );

  if (as === 'button') {
    return (
      <button
        type={type}
        className={rootClass}
        onClick={onClick}
        disabled={disabled}
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={rootClass} {...rest}>
      {content}
    </div>
  );
}
