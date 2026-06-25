import { MessageActions } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function MessageActionsLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Center Channel
          </span>
          <MessageActions type="Center Channel" />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>RHS</span>
          <MessageActions type="RHS" />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Search Results
          </span>
          <MessageActions type="Search Results" />
        </div>
      </div>
    </>
  );
}
