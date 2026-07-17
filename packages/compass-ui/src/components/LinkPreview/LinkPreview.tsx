import Icon from '@/components/Icon/Icon';
import IconButton from '@/components/IconButton/IconButton';
import ImagePreview from '@/components/ImagePreview/ImagePreview';
import CloseIcon from '@mattermost/compass-icons/components/close';
import styles from './LinkPreview.module.scss';

export type LinkPreviewImageSize = 'none' | 'small' | 'large';

export interface LinkPreviewProps {
  /** The site/domain label shown above the title. */
  siteName?: string;
  /** The main link title. */
  title?: string;
  /** Description text. */
  description?: string;
  /** Preview image URL. Pair with `imageSize` to choose layout. */
  imageSrc?: string;
  /** Alt text for the preview image. */
  imageAlt?: string;
  /** Small: square thumbnail on the right. Large: ImagePreview below text. */
  imageSize?: LinkPreviewImageSize;
  /** Whether the large image preview is collapsed. Only applies when `imageSize` is `large`. */
  imageCollapsed?: boolean;
  /** Callback when the large image collapse toggle is clicked. */
  onToggleImageCollapse?: () => void;
  /** Callback when copy-link is clicked on the large image preview. */
  onCopyImageLink?: () => void;
  /** Callback when download is clicked on the large image preview. */
  onDownloadImage?: () => void;
  /** Called when the dismiss control is clicked. Shown on hover when provided. */
  onDismiss?: () => void;
  /** Optional CSS class name. */
  className?: string;
}

/**
 * Rich URL preview card shown in messages. Displays site name, title (linked),
 * and description. Corresponds to the Figma Link Preview component v2.0.0.
 */
export default function LinkPreview({
  siteName = 'Mattermost.com',
  title = 'Mattermost: Open-source, high-trust, developer-centric collaboration platform',
  description = 'Mattermost is a secure, open source platform for communication, collaboration, and workflow orchestration across tools and teams.',
  imageSrc,
  imageAlt = '',
  imageSize = 'none',
  imageCollapsed = false,
  onToggleImageCollapse,
  onCopyImageLink,
  onDownloadImage,
  onDismiss,
  className = '',
}: LinkPreviewProps) {
  const resolvedImageSize =
    imageSrc != null && imageSize === 'none' ? 'large' : imageSize;
  const hasSmallImage = resolvedImageSize === 'small' && imageSrc != null;
  const hasLargeImage = resolvedImageSize === 'large' && imageSrc != null;

  const rootClass = [styles['link-preview'], className]
    .filter(Boolean)
    .join(' ');

  const cardClass = [
    styles['link-preview__card'],
    hasSmallImage ? styles['link-preview__card--small-image'] : '',
    hasLargeImage && !imageCollapsed
      ? styles['link-preview__card--large-image']
      : '',
    hasLargeImage && imageCollapsed
      ? styles['link-preview__card--collapsed-image']
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      {onDismiss != null && (
        <>
          <div
            className={styles['link-preview__dismiss-bridge']}
            aria-hidden
          />
          <IconButton
            className={styles['link-preview__dismiss']}
            size="X-Small"
            padding="Compact"
            aria-label="Remove link preview"
            icon={<Icon size="12" glyph={<CloseIcon />} />}
            onClick={onDismiss}
          />
        </>
      )}

      <div className={cardClass}>
        <div className={styles['link-preview__text']}>
          <p className={styles['link-preview__site-name']}>{siteName}</p>
          <p className={styles['link-preview__title']}>{title}</p>
          <p className={styles['link-preview__description']}>{description}</p>
        </div>

        {hasSmallImage && (
          <div className={styles['link-preview__thumbnail']}>
            <img
              src={imageSrc}
              alt={imageAlt}
              className={styles['link-preview__thumbnail-img']}
            />
          </div>
        )}

        {hasLargeImage && (
          <ImagePreview
            className={styles['link-preview__image-preview']}
            src={imageSrc}
            alt={imageAlt}
            collapsed={imageCollapsed}
            onToggleCollapse={onToggleImageCollapse}
            onCopyLink={onCopyImageLink}
            onDownload={onDownloadImage}
          />
        )}
      </div>
    </div>
  );
}
