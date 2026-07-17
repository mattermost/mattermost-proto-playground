import { DateRangePicker } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function DateRangePickerLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Single date
          </span>
          <DateRangePicker mode="date" />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Date range
          </span>
          <DateRangePicker mode="range" />
        </div>
      </div>
    </>
  );
}
