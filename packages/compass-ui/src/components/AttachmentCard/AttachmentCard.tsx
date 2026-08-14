import type { ComponentType } from 'react';
import CloseIcon from '@mattermost/compass-icons/components/close';
import DotsVerticalIcon from '@mattermost/compass-icons/components/dots-vertical';
import DownloadOutlineIcon from '@mattermost/compass-icons/components/download-outline';
import FileAudioOutlineLargeIcon from '@mattermost/compass-icons/components/file-audio-outline-large';
import FileCodeOutlineLargeIcon from '@mattermost/compass-icons/components/file-code-outline-large';
import FileExcelOutlineLargeIcon from '@mattermost/compass-icons/components/file-excel-outline-large';
import FileGenericOutlineLargeIcon from '@mattermost/compass-icons/components/file-generic-outline-large';
import FileImageOutlineLargeIcon from '@mattermost/compass-icons/components/file-image-outline-large';
import FilePatchOutlineLargeIcon from '@mattermost/compass-icons/components/file-patch-outline-large';
import FilePdfOutlineLargeIcon from '@mattermost/compass-icons/components/file-pdf-outline-large';
import FilePowerpointOutlineLargeIcon from '@mattermost/compass-icons/components/file-powerpoint-outline-large';
import FileTextOutlineLargeIcon from '@mattermost/compass-icons/components/file-text-outline-large';
import FileVideoOutlineLargeIcon from '@mattermost/compass-icons/components/file-video-outline-large';
import FileWordOutlineLargeIcon from '@mattermost/compass-icons/components/file-word-outline-large';
import FileZipOutlineLargeIcon from '@mattermost/compass-icons/components/file-zip-outline-large';
import Icon from '@/components/Icon/Icon';
import IconButton from '@/components/IconButton/IconButton';
import Tag from '@/components/Tag/Tag';
import styles from './AttachmentCard.module.scss';

export type AttachmentCardFileType =
  | 'text'
  | 'word'
  | 'excel'
  | 'powerpoint'
  | 'pdf'
  | 'image-icon'
  | 'image-thumbnail'
  | 'video'
  | 'audio'
  | 'generic'
  | 'patch'
  | 'zip'
  | 'code';

export type AttachmentCardState = 'default' | 'uploading' | 'uploaded';

export interface AttachmentCardProps {
  className?: string;
  /** File name to display. */
  fileName: string;
  /** File type + size string shown below the filename, e.g. "TXT 15KB". */
  fileMeta?: string;
  /** Controls the icon shown on the left. Default: "generic". */
  fileType?: AttachmentCardFileType;
  /** Card state. Default: "default" (browsing context). */
  state?: AttachmentCardState;
  /** Upload progress 0–100. Used when state="uploading". */
  progress?: number;
  /** Thumbnail image URL. Used when fileType="image-thumbnail". */
  thumbnailSrc?: string;
  /** Optional channel tag label shown below the filename, e.g. "UX Design". */
  channelTag?: string;
  /** Optional date/time stamp, e.g. "Sep 24 5:14 PM". */
  dateTimeStamp?: string;
  /** Called when the remove or cancel button is clicked. */
  onRemove?: () => void;
  /** Called when the download button is clicked (visible on hover in default state). */
  onDownload?: () => void;
  /** Called when the more-options button is clicked (visible on hover in default state). */
  onMore?: () => void;
}

type IconComponent = ComponentType<{ size: number; className?: string }>;

const FILE_TYPE_ICONS: Record<
  Exclude<AttachmentCardFileType, 'image-thumbnail'>,
  IconComponent
> = {
  audio: FileAudioOutlineLargeIcon,
  code: FileCodeOutlineLargeIcon,
  excel: FileExcelOutlineLargeIcon,
  generic: FileGenericOutlineLargeIcon,
  'image-icon': FileImageOutlineLargeIcon,
  patch: FilePatchOutlineLargeIcon,
  pdf: FilePdfOutlineLargeIcon,
  powerpoint: FilePowerpointOutlineLargeIcon,
  text: FileTextOutlineLargeIcon,
  video: FileVideoOutlineLargeIcon,
  word: FileWordOutlineLargeIcon,
  zip: FileZipOutlineLargeIcon,
};

const FILE_TYPE_COLORS: Record<
  Exclude<AttachmentCardFileType, 'image-thumbnail'>,
  string | undefined
> = {
  audio: 'var(--attachment-blue)',
  code: undefined,
  excel: 'var(--attachment-green)',
  generic: undefined,
  'image-icon': 'var(--attachment-blue)',
  patch: undefined,
  pdf: 'var(--attachment-red)',
  powerpoint: 'var(--attachment-orange)',
  text: undefined,
  video: 'var(--attachment-blue)',
  word: 'var(--attachment-blue)',
  zip: undefined,
};

export default function AttachmentCard({
  className = '',
  fileName,
  fileMeta,
  fileType = 'generic',
  state = 'default',
  progress = 0,
  thumbnailSrc,
  channelTag,
  dateTimeStamp,
  onRemove,
  onDownload,
  onMore,
}: AttachmentCardProps) {
  const isUploading = state === 'uploading';
  const isUploaded = state === 'uploaded';
  const isDefault = state === 'default';

  const stateClass = !isDefault ? styles[`attachment-card--${state}`] : '';
  const rootClass = [styles['attachment-card'], stateClass, className]
    .filter(Boolean)
    .join(' ');

  const FileIcon =
    fileType !== 'image-thumbnail'
      ? FILE_TYPE_ICONS[fileType]
      : FileGenericOutlineLargeIcon;

  const iconColor =
    fileType !== 'image-thumbnail' ? FILE_TYPE_COLORS[fileType] : undefined;

  return (
    <div className={rootClass}>
      <div className={styles['attachment-card__container']}>
        <div className={styles['attachment-card__inner']}>
          <div className={styles['attachment-card__left']}>
            {fileType === 'image-thumbnail' && thumbnailSrc ? (
              <img
                src={thumbnailSrc}
                alt=""
                className={styles['attachment-card__thumbnail']}
              />
            ) : (
              <div
                className={styles['attachment-card__icon']}
                style={iconColor ? { color: iconColor } : undefined}
              >
                <Icon glyph={<FileIcon size={40} />} size="40" />
              </div>
            )}

            <div className={styles['attachment-card__text']}>
              <p className={styles['attachment-card__filename']}>{fileName}</p>
              <div className={styles['attachment-card__secondary-details']}>
                {isUploading ? (
                  <span className={styles['attachment-card__uploading-text']}>
                    {`Uploading… (${progress}%)`}
                  </span>
                ) : (
                  <>
                    {channelTag && <Tag label={channelTag} />}
                    {fileMeta && (
                      <div className={styles['attachment-card__details']}>
                        <span>{fileMeta}</span>
                        {dateTimeStamp && (
                          <span className={styles['attachment-card__datetime']}>
                            <span>{'•'}</span>
                            <span>{dateTimeStamp}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className={styles['attachment-card__right']}>
            <div className={styles['attachment-card__actions']}>
              {(isUploaded || isUploading) && (
                <IconButton
                  size="Small"
                  icon={<Icon glyph={<CloseIcon />} size="16" />}
                  aria-label={
                    isUploading ? 'Cancel upload' : 'Remove attachment'
                  }
                  onClick={onRemove}
                />
              )}
              {isDefault && (
                <>
                  <IconButton
                    size="Small"
                    icon={<Icon glyph={<DotsVerticalIcon />} size="16" />}
                    aria-label="More options"
                    onClick={onMore}
                  />
                  <IconButton
                    size="Small"
                    icon={<Icon glyph={<DownloadOutlineIcon />} size="16" />}
                    aria-label="Download"
                    onClick={onDownload}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {isUploading && (
        <div className={styles['attachment-card__progress-bar']}>
          <div
            className={styles['attachment-card__progress-fill']}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
}
