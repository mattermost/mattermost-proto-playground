import ThreadListItem from '@/components/ui/ThreadListItem/ThreadListItem';
import styles from '@/pages/Components/Components.module.scss';

export default function ThreadListItemLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
                <div className={styles['components__button-row']}>
                  <span className={styles['components__instance-label']}>Default</span>
                  <ThreadListItem />
                </div>
                <div className={styles['components__button-row']}>
                  <span className={styles['components__instance-label']}>Active & unread</span>
                  <ThreadListItem active />
                  <ThreadListItem badge="Unread" authorName="Danielle Okoro" channelLabel="DESIGN TEAM" replyCount={7} timestamp="12 mins ago" />
                </div>
              </div>
    </>
  );
}
