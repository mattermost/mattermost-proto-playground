import MentionBadge from '@/components/ui/MentionBadge/MentionBadge';
import styles from '@/pages/Components/Components.module.scss';

export default function MentionBadgeLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div
          className={`${styles['components__button-row']} ${styles['components__button-row--inverted-bg']}`}
        >
          <span className={styles['components__instance-label']}>Sidebar</span>
          <MentionBadge count={1} location="Sidebar" size="Small" />
          <MentionBadge count={22} location="Sidebar" size="Small" />
          <MentionBadge count={100} location="Sidebar" size="Small" />
        </div>
        <div
          className={`${styles['components__button-row']} ${styles['components__button-row--inverted-bg']}`}
        >
          <span className={styles['components__instance-label']}>
            Sidebar Medium
          </span>
          <MentionBadge count={1} location="Sidebar" size="Medium" />
          <MentionBadge count={22} location="Sidebar" size="Medium" />
          <MentionBadge count={100} location="Sidebar" size="Medium" />
        </div>
        <div
          className={`${styles['components__button-row']} ${styles['components__button-row--inverted-bg']}`}
        >
          <span className={styles['components__instance-label']}>
            Sidebar Large
          </span>
          <MentionBadge count={1} location="Sidebar" size="Large" />
          <MentionBadge count={22} location="Sidebar" size="Large" />
          <MentionBadge count={100} location="Sidebar" size="Large" />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Menu Item
          </span>
          <MentionBadge count={1} location="Menu Item" size="Small" />
          <MentionBadge count={22} location="Menu Item" size="Medium" />
          <MentionBadge count={100} location="Menu Item" size="Large" />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Icon Button
          </span>
          <MentionBadge count={1} location="Icon Button" size="Small" />
          <MentionBadge count={22} location="Icon Button" size="Small" />
          <MentionBadge count={100} location="Icon Button" size="Small" />
        </div>
      </div>
    </>
  );
}
