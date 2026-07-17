import { AdminConsoleHeader } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function AdminConsoleHeaderLibrary() {
  return (
    <div className={styles['components__button-block']}>
      <div>
        <p className={styles['components__instance-label']}>Default</p>
        <AdminConsoleHeader title="Page Header" />
      </div>
      <div>
        <p className={styles['components__instance-label']}>
          With enterprise tag
        </p>
        <AdminConsoleHeader title="Page Header" enterpriseBadge />
      </div>
      <div>
        <p className={styles['components__instance-label']}>With back</p>
        <AdminConsoleHeader
          title="Page Header"
          showBack
          enterpriseBadge
          onBackClick={() => undefined}
        />
      </div>
    </div>
  );
}
