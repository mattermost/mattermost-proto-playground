import Tooltip from '@/components/Tooltip/Tooltip';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
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
  /** Image URL for the avatar. Omit to render the Fallback (initials) variant. */
  src?: string;
  /** Alt text / display name for the avatar. Drives initials and fallback colour. */
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

function overflowNamesLabel(hidden: UserAvatarGroupItem[]): string {
  if (hidden.length === 0) return '';
  if (hidden.length === 1) return hidden[0].name;
  if (hidden.length <= 3) return hidden.map((a) => a.name).join(', ');
  return `${hidden
    .slice(0, 2)
    .map((a) => a.name)
    .join(', ')}, +${hidden.length - 2} more`;
}

/**
 * Stacked, overlapping user avatars showing multiple participants.
 * Displays up to `max` avatars then shows an overflow "+N" chip.
 * Hover shows a `Tooltip` with each participant’s display name.
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
  const hidden = avatars.slice(max);
  const overflow = hidden.length;

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
        >
          <span className={styles['user-avatar-group__trigger']}>
            <UserAvatar
              src={avatar.src}
              alt={avatar.name}
              name={avatar.name}
              size={size}
            />
          </span>
          <div
            className={styles['user-avatar-group__tooltip-layer']}
            role="presentation"
          >
            <Tooltip
              arrow="Bottom"
              className={styles['user-avatar-group__tooltip']}
              label={avatar.name}
            />
          </div>
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
          <span className={styles['user-avatar-group__trigger']}>
            +{overflow}
          </span>
          <div
            className={styles['user-avatar-group__tooltip-layer']}
            role="presentation"
          >
            <Tooltip
              arrow="Bottom"
              className={styles['user-avatar-group__tooltip']}
              label={overflowNamesLabel(hidden)}
            />
          </div>
        </span>
      )}
    </div>
  );
}
