import { RecordingPill } from '@mattermost/compass-proto';
import styles from '@/styles/library-demo/components.module.scss';

export default function RecordingPillLibrary() {
  return (
    <>
      <div
        className={`${styles['components__button-block']} ${styles['components__button-block--calls-bg']}`}
      >
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>States</span>
          <RecordingPill state="Initializing" />
          <RecordingPill state="Recording" />
          <RecordingPill state="Hover" onStop={() => {}} />
        </div>
      </div>
    </>
  );
}
