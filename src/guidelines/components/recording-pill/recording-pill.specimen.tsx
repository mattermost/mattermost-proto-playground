import RecordingPill from '@/components/ui/RecordingPill/RecordingPill';
import styles from '@/styles/library-demo/components.module.scss';

export default function RecordingPillLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
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
