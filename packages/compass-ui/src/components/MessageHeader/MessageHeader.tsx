import Tag from '@/components/Tag/Tag';
import styles from './MessageHeader.module.scss';

type MessageHeaderProps = {
  username: string;
  timestamp: string;
  isBot?: boolean;
  botLabel?: string;
  /** When set, the display name opens the profile (avatar uses the same handler). */
  onProfileClick?: () => void;
};

export default function MessageHeader({
  username,
  timestamp,
  isBot = false,
  botLabel = 'Bot',
  onProfileClick,
}: MessageHeaderProps) {
  return (
    <div className={styles['message-header']}>
      {onProfileClick ? (
        <button
          type="button"
          className={styles['message-header__username-btn']}
          onClick={onProfileClick}
        >
          {username}
        </button>
      ) : (
        <span className={styles['message-header__username']}>{username}</span>
      )}
      {isBot && <Tag label={botLabel} casing="All Caps" />}
      <span className={styles['message-header__timestamp']}>{timestamp}</span>
    </div>
  );
}
