import { AdminConsoleSidebar } from '@mattermost/compass-ui';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import styles from '@/styles/library-demo/patterns.module.scss';

export default function AdminConsoleSidebarLibrary() {
  return (
    <div className={styles['patterns__sidebar-demo']}>
      <div>
        <p className={styles['patterns__variant-label']}>Default</p>
        <AdminConsoleSidebar
          avatarSrc={avatarLeonard}
          avatarAlt="Leonard Riley"
        />
      </div>
    </div>
  );
}
