import LinkPreview from '@/components/ui/LinkPreview/LinkPreview';
import styles from '@/pages/Components/Components.module.scss';

export default function LinkPreviewLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
                <div className={styles['components__button-row']}>
                  <span className={styles['components__instance-label']}>Default</span>
                  <LinkPreview />
                </div>
                <div className={styles['components__button-row']}>
                  <span className={styles['components__instance-label']}>Custom</span>
                  <LinkPreview
                    siteName="GitHub"
                    title="mattermost/mattermost - Open source platform for developer collaboration"
                    description="Mattermost is written in Golang and React. Open source, self-hosted Slack-alternative."
                  />
                </div>
              </div>
    </>
  );
}
