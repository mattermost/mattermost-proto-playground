import { NewMessageBanner } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function NewMessageBannerLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Jump to unreads
          </span>
          <NewMessageBanner
            type="JumpToUnreads"
            countLabel="21 new messages since Saturday"
            onDismiss={() => {}}
          />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            New replies
          </span>
          <NewMessageBanner type="NewReplies" onDismiss={() => {}} />
        </div>
      </div>
    </>
  );
}
