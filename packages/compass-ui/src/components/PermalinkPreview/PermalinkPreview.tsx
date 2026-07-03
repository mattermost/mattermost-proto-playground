import UserAvatar from '@/components/UserAvatar/UserAvatar';
import MessageHeader from '@/components/MessageHeader/MessageHeader';
import styles from './PermalinkPreview.module.scss';

export interface PermalinkPreviewProps {
  /** Sender's display name. */
  authorName?: string;
  /** Avatar image src. */
  avatarSrc: string;
  /** Timestamp label. */
  timestamp?: string;
  /** The quoted message body text. */
  messageText?: string;
  /** "Originally posted in ~Channel" footer text. */
  originalChannel?: string;
  /** Optional CSS class name. */
  className?: string;
}

/**
 * Inline preview of a linked message within a thread or channel. Shows sender
 * avatar, name, timestamp, and message content. Corresponds to Figma
 * Permalink Preview v1.0.0.
 */
export default function PermalinkPreview({
  authorName = 'Leonard Riley',
  avatarSrc,
  timestamp = '10:43 AM',
  messageText = 'At eu sed tristique gravida et fames vel pellentesque. Urna phasellus integer eu tempor mauris amet sagittis. Mollis risus mi felis magna.',
  originalChannel = '~Desktop App',
  className = '',
}: PermalinkPreviewProps) {
  const rootClass = [styles['permalink-preview'], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      <div className={styles['permalink-preview__card']}>
        <div className={styles['permalink-preview__message']}>
          <div className={styles['permalink-preview__header']}>
            <UserAvatar src={avatarSrc} alt={authorName} size="24" />
            <MessageHeader username={authorName} timestamp={timestamp} />
          </div>
          <div className={styles['permalink-preview__body']}>
            <p className={styles['permalink-preview__text']}>{messageText}</p>
          </div>
        </div>
        <p className={styles['permalink-preview__origin']}>
          Originally posted in {originalChannel}
        </p>
      </div>
    </div>
  );
}
