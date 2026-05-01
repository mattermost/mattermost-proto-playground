import MoreUnreadsBanner from '@/components/ui/MoreUnreadsBanner/MoreUnreadsBanner';
import styles from '@/pages/Components/Components.module.scss';

export default function MoreUnreadsBannerLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Directions
          </span>
          <MoreUnreadsBanner direction="Up" />
          <MoreUnreadsBanner direction="Down" />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Sizes</span>
          <MoreUnreadsBanner size="Small" />
          <MoreUnreadsBanner size="Medium" />
          <MoreUnreadsBanner size="Large" />
        </div>
      </div>
    </>
  );
}
