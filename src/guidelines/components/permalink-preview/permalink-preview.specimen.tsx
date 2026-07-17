import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import { PermalinkPreview } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function PermalinkPreviewLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Default</span>
          <PermalinkPreview
            avatarSrc={avatarLeonard}
            onDismiss={() => {}}
          />
        </div>
      </div>
    </>
  );
}
