import MentionBadge from '../MentionBadge/MentionBadge';
import styles from './TeamAvatar.module.scss';

export type TeamAvatarSize =
  | '24'
  | '28'
  | '32'
  | '40'
  | '48'
  | '56'
  | '64'
  | '72'
  | '96'
  | '120';
export type TeamAvatarState = 'Default' | 'Active';

export interface TeamAvatarProps {
  alt?: string;
  badge?: number;
  className?: string;
  initials?: string;
  size?: TeamAvatarSize;
  src?: string;
  state?: TeamAvatarState;
}

export default function TeamAvatar({
  alt = '',
  badge,
  className = '',
  initials = 'Ac',
  size = '40',
  src,
  state = 'Default',
}: TeamAvatarProps) {
  const numSize = parseInt(size, 10);
  const isActive = state === 'Active';
  const showBadge = badge != null && badge > 0 && numSize <= 64 && !isActive;

  const rootClasses = [
    styles['team-avatar'],
    styles[`team-avatar--size-${size}`],
    isActive && styles['team-avatar--active'],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClasses}>
      <div className={styles['team-avatar__inner']}>
        {src ? (
          <img src={src} alt={alt} className={styles['team-avatar__image']} />
        ) : (
          <div
            className={styles['team-avatar__fallback']}
            aria-label={alt || initials}
          >
            {initials}
          </div>
        )}
      </div>
      {showBadge && (
        <MentionBadge
          count={badge!}
          size="Medium"
          className={styles['team-avatar__badge']}
        />
      )}
    </div>
  );
}
