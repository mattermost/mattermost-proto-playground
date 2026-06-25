import type { ImgHTMLAttributes } from 'react';
import StatusBadge from '@/components/StatusBadge/StatusBadge';
import type { StatusBadgeSize } from '@/components/StatusBadge/StatusBadge';
import { toKebab } from '@/utils/string';
import styles from './UserAvatar.module.scss';

/** Figma User Avatar sizes. */
export type UserAvatarSize =
  | '12'
  | '16'
  | '20'
  | '24'
  | '28'
  | '32'
  | '40'
  | '48'
  | '56'
  | '64'
  | '72'
  | '80'
  | '96'
  | '120';

/** Figma User Avatar Fallback colour variants. */
export type UserAvatarFallbackColor =
  | 'Red'
  | 'Purple'
  | 'Neutral'
  | 'Blue'
  | 'Cyan'
  | 'Yellow'
  | 'Green'
  | 'Orange';

export interface UserAvatarProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'alt' | 'width' | 'height'
> {
  /** Alt text for the avatar image. */
  alt: string;
  /** Optional CSS class name. */
  className?: string;
  /**
   * Image URL for the avatar. When omitted, the avatar renders as Fallback
   * (initials on a deterministic colour background).
   */
  src?: string;
  /**
   * Display name used to derive initials and the fallback colour. Defaults
   * to `alt` when not provided.
   */
  name?: string;
  /** Force a specific fallback colour. Hashed from `name`/`alt` if omitted. */
  fallbackColor?: UserAvatarFallbackColor;
  /** Size variant. Figma: Size. Default: 48. */
  size?: UserAvatarSize;
  /** When true, shows online status badge (green dot with check). Figma: Status = On. */
  status?: boolean;
}

const FALLBACK_COLORS: readonly UserAvatarFallbackColor[] = [
  'Red',
  'Purple',
  'Neutral',
  'Blue',
  'Cyan',
  'Yellow',
  'Green',
  'Orange',
];

/** Map UserAvatar size to StatusBadge size (Figma scale). */
const USER_AVATAR_TO_BADGE_SIZE: Record<UserAvatarSize, StatusBadgeSize> = {
  '12': 'XX-Small',
  '16': 'XX-Small',
  '20': 'X-Small',
  '24': 'X-Small',
  '28': 'X-Small',
  '32': 'Small',
  '40': 'Small',
  '48': 'Small',
  '56': 'Medium',
  '64': 'Medium',
  '72': 'Medium',
  '80': 'Medium',
  '96': 'Large',
  '120': 'Large',
};

function hashFallbackColor(s: string): UserAvatarFallbackColor {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return FALLBACK_COLORS[Math.abs(h) % FALLBACK_COLORS.length];
}

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '';
  const firstName = trimmed.split(/\s+/)[0]!;
  return firstName[0]!.toUpperCase() + (firstName[1]?.toLowerCase() ?? '');
}

/**
 * User avatar. Matches Figma User Avatar — Image and Fallback variants.
 * When `src` is provided, renders an `<img>`; otherwise renders initials on
 * one of eight deterministic colour backgrounds (hashed from `name`/`alt`,
 * or overridden via `fallbackColor`). System variant is not implemented.
 *
 * Uses StatusBadge for online indicator when status=true.
 *
 * @see Figma User Avatar (Type=Image, Type=Fallback)
 */
export default function UserAvatar({
  alt,
  className = '',
  src,
  name,
  fallbackColor,
  size = '48',
  status = false,
  ...imgProps
}: UserAvatarProps) {
  const sizeClass = styles[`user-avatar--size-${toKebab(size)}`];
  const rootClass = [styles['user-avatar'], sizeClass, className]
    .filter(Boolean)
    .join(' ');

  const isFallback = !src;
  const displayName = name ?? alt;
  const initials = isFallback ? getInitials(displayName) : '';
  const color = fallbackColor ?? hashFallbackColor(displayName);
  const fallbackColorClass = isFallback
    ? styles[`user-avatar__fallback--${toKebab(color)}`]
    : '';

  return (
    <div className={rootClass} data-size={size}>
      {isFallback ? (
        <span
          className={[styles['user-avatar__fallback'], fallbackColorClass]
            .filter(Boolean)
            .join(' ')}
          role="img"
          aria-label={alt}
        >
          {initials}
        </span>
      ) : (
        <img
          {...imgProps}
          alt={alt}
          className={styles['user-avatar__image']}
          src={src}
          width={Number(size)}
          height={Number(size)}
        />
      )}
      {status && (
        <span className={styles['user-avatar__status']}>
          <StatusBadge status="Online" size={USER_AVATAR_TO_BADGE_SIZE[size]} />
        </span>
      )}
    </div>
  );
}
