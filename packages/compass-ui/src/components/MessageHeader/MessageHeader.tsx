import Tag from '@/components/Tag/Tag';
import styles from './MessageHeader.module.scss';

type MessageHeaderProps = {
  username: string;
  timestamp: string;
  isBot?: boolean;
  botLabel?: string;
};

export default function MessageHeader({
  username,
  timestamp,
  isBot = false,
  botLabel = 'Bot',
}: MessageHeaderProps) {
  return (
    <div className={styles['message-header']}>
      <span className={styles['message-header__username']}>{username}</span>
      {isBot && <Tag label={botLabel} />}
      <span className={styles['message-header__timestamp']}>{timestamp}</span>
    </div>
  );
}
