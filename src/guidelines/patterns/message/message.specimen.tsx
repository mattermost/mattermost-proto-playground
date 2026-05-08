import Message from '@/components/ui/Message/Message';
import Divider from '@/components/ui/Divider/Divider';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import styles from '@/styles/library-demo/patterns.module.scss';

export default function MessageLibrary() {
  return (
    <div className={styles['patterns__message-demo']}>
      <Message
        avatarSrc={avatarLeonard}
        avatarAlt="Leonard Riley"
        username="Leonard Riley"
        timestamp="Today at 9:41 AM"
      >
        <p className={styles['patterns__body-text']}>
          Hey team, the new components are looking great!
        </p>
      </Message>
      <Divider />
      <Message
        avatarSrc={avatarDanielle}
        avatarAlt="Danielle Okoro"
        username="Mattermost"
        timestamp="Today at 9:45 AM"
        isBot
      >
        <p className={styles['patterns__body-text']}>
          You have 3 unread messages in #general.
        </p>
      </Message>
    </div>
  );
}
