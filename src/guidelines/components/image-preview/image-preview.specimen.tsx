import ImagePreview from '@/components/ui/ImagePreview/ImagePreview';
import styles from '@/styles/library-demo/components.module.scss';

export default function ImagePreviewLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>16:9</span>
          <ImagePreview
            src="https://picsum.photos/seed/mm1/480/270"
            alt="Sample image"
            onCopyLink={() => {}}
            onDownload={() => {}}
            onToggleCollapse={() => {}}
          />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>1:1</span>
          <ImagePreview
            src="https://picsum.photos/seed/mm2/200/200"
            alt="Square image"
            aspectRatio="1:1"
            onCopyLink={() => {}}
            onDownload={() => {}}
          />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Collapsed
          </span>
          <ImagePreview
            src="https://picsum.photos/seed/mm3/480/270"
            alt="Collapsed image"
            collapsed
            onToggleCollapse={() => {}}
          />
        </div>
      </div>
    </>
  );
}
