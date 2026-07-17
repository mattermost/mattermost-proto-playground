import Icon from '@/components/Icon/Icon';
import IconButton from '@/components/IconButton/IconButton';
import { usePopoverTransition } from '@/hooks/usePopoverTransition';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import DownloadOutlineIcon from '@mattermost/compass-icons/components/download-outline';
import MenuDownIcon from '@mattermost/compass-icons/components/menu-down';
import MenuRightIcon from '@mattermost/compass-icons/components/menu-right';
import styles from './ImagePreview.module.scss';

export type ImagePreviewAspectRatio = '16:9' | '4:3' | '1:1';

export interface ImagePreviewProps {
  /** Image src URL. */
  src: string;
  /** Alt text. */
  alt?: string;
  /** Whether the preview is collapsed (shows toggle label only). */
  collapsed?: boolean;
  /** Callback when the collapse toggle is clicked. */
  onToggleCollapse?: () => void;
  /** Callback when the copy-link action is clicked. */
  onCopyLink?: () => void;
  /** Callback when the download action is clicked. */
  onDownload?: () => void;
  /** Aspect ratio of the image container. Default: 16:9 */
  aspectRatio?: ImagePreviewAspectRatio;
  /** Optional CSS class name. */
  className?: string;
}

/**
 * Image preview / lightbox for viewing attached images. Supports collapsed
 * state and hover action overlay (copy link, download). Corresponds to Figma
 * Image Preview v1.0.0.
 */
export default function ImagePreview({
  src,
  alt = '',
  collapsed = false,
  onToggleCollapse,
  onCopyLink,
  onDownload,
  aspectRatio = '16:9',
  className = '',
}: ImagePreviewProps) {
  const frameTransition = usePopoverTransition(!collapsed);
  const labelTransition = usePopoverTransition(collapsed);

  const rootClass = [
    styles['image-preview'],
    collapsed ? styles['image-preview--collapsed'] : '',
    aspectRatio === '4:3' ? styles['image-preview--ratio-4-3'] : '',
    aspectRatio === '1:1' ? styles['image-preview--ratio-1-1'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      <div className={styles['image-preview__stage']}>
        {labelTransition.mounted && (
          <button
            type="button"
            className={[
              styles['image-preview__collapsed-trigger'],
              labelTransition.visible
                ? styles['image-preview__collapsed-trigger--visible']
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={onToggleCollapse}
            aria-label="Show image preview"
          >
            <span className={styles['image-preview__show-label']}>
              <span
                className={styles['image-preview__show-icon']}
                aria-hidden="true"
              >
                <Icon size="12" glyph={<MenuRightIcon />} />
              </span>
              Show Image preview
            </span>
          </button>
        )}

        {frameTransition.mounted && (
          <div
            className={[
              styles['image-preview__frame'],
              frameTransition.visible
                ? styles['image-preview__frame--visible']
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div className={styles['image-preview__media']}>
              <img src={src} alt={alt} className={styles['image-preview__img']} />
            </div>

            <div className={styles['image-preview__actions']}>
              {onCopyLink != null && (
                <IconButton
                  size="Small"
                  padding="Compact"
                  aria-label="Copy link"
                  icon={<Icon size="16" glyph={<LinkVariantIcon />} />}
                  onClick={onCopyLink}
                />
              )}
              {onDownload != null && (
                <IconButton
                  size="Small"
                  padding="Compact"
                  aria-label="Download"
                  icon={<Icon size="16" glyph={<DownloadOutlineIcon />} />}
                  onClick={onDownload}
                />
              )}
            </div>

            {onToggleCollapse != null && (
              <button
                type="button"
                className={styles['image-preview__collapse-btn']}
                onClick={onToggleCollapse}
                aria-label="Collapse image preview"
              >
                <Icon size="16" glyph={<MenuDownIcon />} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
