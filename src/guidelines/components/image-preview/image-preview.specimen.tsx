import { useState } from 'react';
import sampleImage from '@/assets/images/sample-image.jpg';
import { ImagePreview } from '@mattermost/compass-ui';
import type { ImagePreviewProps } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

function InteractiveImagePreview({
  defaultCollapsed = false,
  ...props
}: Omit<ImagePreviewProps, 'collapsed' | 'onToggleCollapse'> & {
  defaultCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <ImagePreview
      {...props}
      collapsed={collapsed}
      onCopyLink={() => {}}
      onDownload={() => {}}
      onToggleCollapse={() => setCollapsed((value) => !value)}
    />
  );
}

export default function ImagePreviewLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>16:9</span>
          <InteractiveImagePreview
            src={sampleImage}
            alt="Sample image"
          />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>1:1</span>
          <InteractiveImagePreview
            src={sampleImage}
            alt="Square image"
            aspectRatio="1:1"
          />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Collapsed
          </span>
          <InteractiveImagePreview
            src={sampleImage}
            alt="Collapsed image"
            defaultCollapsed
          />
        </div>
      </div>
    </>
  );
}
