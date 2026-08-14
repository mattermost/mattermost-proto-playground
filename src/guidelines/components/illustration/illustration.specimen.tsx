import AICopilotIllustration from '@/assets/illustrations/ai-copilot-intro.svg?react';
import { Illustration } from '@mattermost/compass-ui';
import SearchIllustration from '@/assets/illustrations/search.svg?react';
import styles from '@/styles/library-demo/components.module.scss';

export default function IllustrationLibrary() {
  return (
    <>
      <div className={styles['components__row']}>
        <div className={styles['components__instance']}>
          <span className={styles['components__instance-label']}>
            AI Copilot (default size)
          </span>
          <Illustration aria-label="AI Copilot intro">
            <AICopilotIllustration />
          </Illustration>
        </div>
        <div className={styles['components__instance']}>
          <span className={styles['components__instance-label']}>
            Search, 200px width
          </span>
          <Illustration aria-label="Search" width="200px" height="120px">
            <SearchIllustration />
          </Illustration>
        </div>
      </div>
    </>
  );
}
