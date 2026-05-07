import Post from '@/components/ui/Post/Post';
import Divider from '@/components/ui/Divider/Divider';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import styles from '@/styles/library-demo/patterns.module.scss';

export default function PostLibrary() {
  return (
    <div className={styles['patterns__post-demo']}>
      <Post
        avatarSrc={avatarLeonard}
        avatarAlt="Leonard Riley"
        username="Leonard Riley"
        timestamp="Today at 9:41 AM"
      >
        <p className={styles['patterns__body-text']}>
          Hey team, the new components are looking great!
        </p>
      </Post>
      <Divider />
      <Post
        avatarSrc={avatarDanielle}
        avatarAlt="Danielle Okoro"
        username="Mattermost"
        timestamp="Today at 9:45 AM"
        isBot
      >
        <p className={styles['patterns__body-text']}>
          You have 3 unread messages in #general.
        </p>
      </Post>
    </div>
  );
}
