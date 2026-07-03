import { ErrorMessage } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function ErrorMessageLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Examples</span>
          <ErrorMessage message="This field is required." />
          <ErrorMessage message="Invalid email address." />
          <ErrorMessage message="Password must be at least 8 characters." />
        </div>
      </div>
    </>
  );
}
