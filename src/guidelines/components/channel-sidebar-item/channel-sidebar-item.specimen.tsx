import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import { ChannelSidebarItem } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function ChannelSidebarItemLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Leading visuals
          </span>
          <div className={styles['components__sidebar-demo']}>
            <ChannelSidebarItem leadingVisual="Public" name="Design" />
            <ChannelSidebarItem leadingVisual="Private" name="Engineering" />
            <ChannelSidebarItem
              leadingVisual="Group Message"
              name="Design Team"
              memberCount={4}
            />
            <ChannelSidebarItem
              leadingVisual="Direct Message"
              name="Leonard Riley"
              avatarSrc={avatarLeonard}
              avatarAlt="Leonard Riley"
              showAvatarStatus
            />
            <ChannelSidebarItem leadingVisual="Threads" name="Threads" />
            <ChannelSidebarItem leadingVisual="Drafts" name="Drafts" />
            <ChannelSidebarItem leadingVisual="Insights" name="Insights" />
          </div>
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Status</span>
          <div className={styles['components__sidebar-demo']}>
            <ChannelSidebarItem
              leadingVisual="Public"
              name="Read channel"
              status="Read"
            />
            <ChannelSidebarItem
              leadingVisual="Public"
              name="Unread channel"
              status="Unread"
            />
            <ChannelSidebarItem
              leadingVisual="Public"
              name="Mention channel"
              status="Mention"
              mentionCount={3}
            />
          </div>
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Active & muted
          </span>
          <div className={styles['components__sidebar-demo']}>
            <ChannelSidebarItem
              leadingVisual="Public"
              name="Active channel"
              active
            />
            <ChannelSidebarItem
              leadingVisual="Public"
              name="Muted channel"
              muted
            />
            <ChannelSidebarItem
              leadingVisual="Direct Message"
              name="Danielle Okoro"
              avatarSrc={avatarDanielle}
              avatarAlt="Danielle Okoro"
              muted
            />
          </div>
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Shared / call / emoji
          </span>
          <div className={styles['components__sidebar-demo']}>
            <ChannelSidebarItem
              leadingVisual="Public"
              name="Shared channel"
              sharedChannel
            />
            <ChannelSidebarItem
              leadingVisual="Private"
              name="Call active"
              callActive
            />
            <ChannelSidebarItem
              leadingVisual="Direct Message"
              name="Marco Rinaldi"
              avatarSrc={avatarMarco}
              avatarAlt="Marco Rinaldi"
              customStatusEmoji="🏄"
            />
          </div>
        </div>
      </div>
    </>
  );
}
