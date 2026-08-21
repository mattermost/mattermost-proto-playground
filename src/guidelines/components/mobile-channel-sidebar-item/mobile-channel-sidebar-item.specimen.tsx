import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import { MobileChannelSidebarItem } from '@mattermost/compass-proto';
import styles from '@/styles/library-demo/components.module.scss';

export default function MobileChannelSidebarItemLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Leading visuals
          </span>
          <div className={styles['components__sidebar-demo']}>
            <MobileChannelSidebarItem leadingVisual='Public' name='Design' />
            <MobileChannelSidebarItem
              leadingVisual='Private'
              name='Engineering'
            />
            <MobileChannelSidebarItem
              leadingVisual='Group Message'
              name='Design Team'
              memberCount={4}
            />
            <MobileChannelSidebarItem
              leadingVisual='Direct Message'
              name='Leonard Riley'
              avatarSrc={avatarLeonard}
              avatarAlt='Leonard Riley'
              showAvatarStatus
            />
            <MobileChannelSidebarItem leadingVisual='Threads' name='Threads' />
            <MobileChannelSidebarItem leadingVisual='Drafts' name='Drafts' />
            <MobileChannelSidebarItem leadingVisual='Insights' name='Insights' />
          </div>
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Status</span>
          <div className={styles['components__sidebar-demo']}>
            <MobileChannelSidebarItem
              leadingVisual='Public'
              name='Read channel'
              status='Read'
            />
            <MobileChannelSidebarItem
              leadingVisual='Public'
              name='Unread channel'
              status='Unread'
            />
            <MobileChannelSidebarItem
              leadingVisual='Public'
              name='Mention channel'
              status='Mention'
              mentionCount={3}
            />
          </div>
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Muted
          </span>
          <div className={styles['components__sidebar-demo']}>
            <MobileChannelSidebarItem
              leadingVisual='Public'
              name='Muted channel'
              muted
            />
            <MobileChannelSidebarItem
              leadingVisual='Direct Message'
              name='Danielle Okoro'
              avatarSrc={avatarDanielle}
              avatarAlt='Danielle Okoro'
              muted
            />
          </div>
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Shared / call / emoji
          </span>
          <div className={styles['components__sidebar-demo']}>
            <MobileChannelSidebarItem
              leadingVisual='Public'
              name='Shared channel'
              sharedChannel
            />
            <MobileChannelSidebarItem
              leadingVisual='Private'
              name='Call active'
              callActive
            />
            <MobileChannelSidebarItem
              leadingVisual='Direct Message'
              name='Marco Rinaldi'
              avatarSrc={avatarMarco}
              avatarAlt='Marco Rinaldi'
              customStatusEmoji='🏄'
              showAvatarStatus
            />
          </div>
        </div>
      </div>
    </>
  );
}
