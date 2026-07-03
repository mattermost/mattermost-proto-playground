import { Spinner } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function SpinnerLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Sizes</span>
          <Spinner size={10} />
          <Spinner size={12} />
          <Spinner size={16} />
          <Spinner size={20} />
          <Spinner size={24} />
          <Spinner size={28} />
          <Spinner size={32} />
        </div>
        <div
          className={[
            styles['components__button-row'],
            styles['components__button-row--inverted-bg'],
          ].join(' ')}
        >
          <span className={styles['components__instance-label']}>Inverted</span>
          <Spinner size={16} inverted />
          <Spinner size={20} inverted />
          <Spinner size={24} inverted />
        </div>
      </div>
    </>
  );
}
