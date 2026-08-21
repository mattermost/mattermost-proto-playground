import { ChannelHeader } from '@mattermost/compass-ui';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import styles from '@/styles/library-demo/patterns.module.scss';

export default function ChannelHeaderLibrary() {
  return (
    <div className={styles['patterns__channel-header-demo']}>
      <p className={styles['patterns__variant-label']}>Channel</p>
      <ChannelHeader
        type="Channel"
        name="UX Design"
        memberCount={48}
        pinnedCount={1}
      />
      <p className={styles['patterns__variant-label']}>
        Channel — favorited, muted
      </p>
      <ChannelHeader
        type="Channel"
        name="UX Design"
        memberCount={48}
        pinnedCount={1}
        favorited
        muted
      />
      <p className={styles['patterns__variant-label']}>Bot</p>
      <ChannelHeader
        type="Bot"
        name="Todo"
        avatarSrc={avatarLeonard}
        description="Created by the Todo Plugin"
        pinnedCount={1}
      />
      <p className={styles['patterns__variant-label']}>DM</p>
      <ChannelHeader
        type="DM"
        name="Aiko Tan"
        avatarSrc={avatarAikoTan}
        avatarStatus
        pinnedCount={1}
      />
      <p className={styles['patterns__variant-label']}>GM</p>
      <ChannelHeader
        type="GM"
        name="Aiko Tan, Arjun Patel, Danielle Okoro"
        memberCount={4}
        pinnedCount={1}
      />
      <p className={styles['patterns__variant-label']}>Threads</p>
      <ChannelHeader
        type="Threads"
        name="Followed Threads"
        description="Threads you're participating in will automatically show here"
      />
      <p className={styles['patterns__variant-label']}>Drafts</p>
      <ChannelHeader
        type="Drafts"
        name="Drafts"
        description="Any messages you've started will show here"
      />
    </div>
  );
}
