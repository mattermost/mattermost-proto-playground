import { ThreadListItem } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function ThreadListItemLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Default</span>
          <ThreadListItem onClick={() => undefined} />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Active (badge hidden)
          </span>
          <ThreadListItem
            active
            badge="Unread"
            onClick={() => undefined}
          />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Unread</span>
          <ThreadListItem
            badge="Unread"
            onClick={() => undefined}
          />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Mention</span>
          <ThreadListItem
            badge="Mention"
            mentionCount={3}
            onClick={() => undefined}
          />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            With title, no avatars
          </span>
          <ThreadListItem
            participants={[]}
            threadTitle="Guidelines for responsive layout in system console"
            onClick={() => undefined}
          />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Hover/focus for ⋯ menu
          </span>
          <ThreadListItem
            authorName="Danielle Okoro"
            badge="Unread"
            channelLabel="DESIGN TEAM"
            replyCount={7}
            timestamp="12 mins ago"
            onClick={() => undefined}
          />
        </div>
      </div>
    </>
  );
}
