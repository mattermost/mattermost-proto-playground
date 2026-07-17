import { useState } from 'react';
import { LinkPreview } from '@mattermost/compass-ui';
import sampleImage from '@/assets/images/sample-image.jpg';
import styles from '@/styles/library-demo/components.module.scss';

function InteractiveLargeImagePreview({
  defaultCollapsed = false,
}: {
  defaultCollapsed?: boolean;
}) {
  const [imageCollapsed, setImageCollapsed] = useState(defaultCollapsed);

  return (
    <LinkPreview
      imageSrc={sampleImage}
      imageAlt="Preview image"
      imageSize="large"
      imageCollapsed={imageCollapsed}
      onToggleImageCollapse={() => setImageCollapsed((value) => !value)}
      onCopyImageLink={() => {}}
      onDownloadImage={() => {}}
      onDismiss={() => {}}
    />
  );
}

export default function LinkPreviewLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Default</span>
          <LinkPreview onDismiss={() => {}} />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Small image
          </span>
          <LinkPreview
            imageSrc={sampleImage}
            imageAlt="Preview image"
            imageSize="small"
            onDismiss={() => {}}
          />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Large image
          </span>
          <InteractiveLargeImagePreview />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Collapsed large image
          </span>
          <InteractiveLargeImagePreview defaultCollapsed />
        </div>
      </div>
    </>
  );
}
