import { ProgressBar } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function ProgressBarLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Values</span>
          <ProgressBar value={0} aria-label="0%" />
          <ProgressBar value={35} aria-label="35%" />
          <ProgressBar value={70} aria-label="70%" />
          <ProgressBar value={100} aria-label="100%" />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Sizes</span>
          <ProgressBar value={60} size="Small" aria-label="Small 60%" />
          <ProgressBar value={60} size="Large" aria-label="Large 60%" />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Semantic colors
          </span>
          <ProgressBar value={30} semanticColors aria-label="30% success" />
          <ProgressBar value={75} semanticColors aria-label="75% warning" />
          <ProgressBar value={95} semanticColors aria-label="95% danger" />
        </div>
      </div>
    </>
  );
}
