import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import styles from './UserAvatarGroup.module.scss';

export type UserAvatarGroupSize =
  | '20'
  | '24'
  | '28'
  | '32'
  | '40'
  | '48'
  | '56'
  | '64'
  | '72';

export interface UserAvatarGroupItem {
  /** Unique key for the list item. */
  key: string;
  /** Image URL for the avatar. */
  src: string;
  /** Alt text / display name for the avatar. */
  name: string;
}

export interface UserAvatarGroupProps {
  /** Array of avatar items to display. */
  avatars: UserAvatarGroupItem[];
  /** Maximum number of avatars to show before showing the overflow count. Default: 3. */
  max?: number;
  /** Avatar size in px. Matches Figma Avatar Group size options. Default: '20'. */
  size?: UserAvatarGroupSize;
  /** Optional CSS class name. */
  className?: string;
}

/**
 * Stacked, overlapping user avatars showing multiple participants.
 * Displays up to `max` avatars then shows an overflow "+N" chip.
 * Used in thread footers, call cards, and playbook run info.
 *
 * @see Figma Avatar Group (v1.0.1)
 */
export default function UserAvatarGroup({
  avatars,
  className = '',
  max = 3,
  size = '20',
}: UserAvatarGroupProps) {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - visible.length;

  const rootClass = [
    styles['user-avatar-group'],
    size !== '20' ? styles[`user-avatar-group--size-${size}`] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={rootClass}
      role="group"
      aria-label={`${avatars.length} participants`}
    >
      {visible.map((avatar) => (
        <span
          key={avatar.key}
          className={styles['user-avatar-group__item']}
          title={avatar.name}
        >
          <UserAvatar src={avatar.src} alt={avatar.name} size={size} />
        </span>
      ))}
      {overflow > 0 && (
        <span
          className={[
            styles['user-avatar-group__item'],
            styles['user-avatar-group__overflow'],
          ].join(' ')}
          aria-label={`${overflow} more participants`}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
