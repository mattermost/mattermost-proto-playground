import { AdminPanelFooter } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function AdminPanelFooterLibrary() {
  return (
    <div className={styles['components__button-block']}>
      <div>
        <p className={styles['components__instance-label']}>Default</p>
        <AdminPanelFooter
          saveDisabled
          onSave={() => undefined}
          onCancel={() => undefined}
        />
      </div>
      <div>
        <p className={styles['components__instance-label']}>With warning</p>
        <AdminPanelFooter
          saveDisabled={false}
          status="warning"
          statusMessage="There are X issues in the form above."
          onSave={() => undefined}
          onCancel={() => undefined}
        />
      </div>
      <div>
        <p className={styles['components__instance-label']}>With error</p>
        <AdminPanelFooter
          saveDisabled
          status="error"
          statusMessage="There are X errors in the form above."
          onSave={() => undefined}
          onCancel={() => undefined}
        />
      </div>
    </div>
  );
}
