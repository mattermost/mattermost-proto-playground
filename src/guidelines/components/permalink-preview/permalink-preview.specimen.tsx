import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import { PermalinkPreview } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function PermalinkPreviewLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Default</span>
          <PermalinkPreview avatarSrc={avatarLeonard} />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            With avatar
          </span>
          <PermalinkPreview
            authorName="Danielle Okoro"
            avatarSrc={avatarDanielle}
            timestamp="Yesterday at 3:22 PM"
            messageText="The new design looks great! Let's move forward with this approach for the next sprint."
            originalChannel="~ux-design"
          />
        </div>
      </div>
    </>
  );
}
