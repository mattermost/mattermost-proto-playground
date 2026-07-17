import { AttachmentCard } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function AttachmentCardLibrary() {
  return (
    <>
      <div className={styles['components__row']}>
        <AttachmentCard
          fileName="Filename_goes_here.txt"
          fileMeta="TXT 15KB"
          fileType="text"
        />
        <AttachmentCard
          fileName="Filename_goes_here.docx"
          fileMeta="DOCX 2.4MB"
          fileType="word"
          channelTag="UX Design"
          dateTimeStamp="Sep 24 5:14 PM"
        />
        <AttachmentCard
          fileName="Spreadsheet_Q3_results.xlsx"
          fileMeta="XLSX 842KB"
          fileType="excel"
        />
      </div>
      <div className={styles['components__row']}>
        <AttachmentCard
          fileName="Presentation.pptx"
          fileMeta="PPTX 12MB"
          fileType="powerpoint"
        />
        <AttachmentCard
          fileName="Design_spec.pdf"
          fileMeta="PDF 3.1MB"
          fileType="pdf"
        />
        <AttachmentCard
          fileName="photo.jpg"
          fileMeta="JPG 2.2MB"
          fileType="image-icon"
        />
      </div>
      <div className={styles['components__row']}>
        <AttachmentCard
          fileName="thumbnail.jpg"
          fileMeta="JPG 2.2MB"
          fileType="image-thumbnail"
          thumbnailSrc="https://picsum.photos/seed/mm/80/80"
        />
        <AttachmentCard
          fileName="screencast.mp4"
          fileMeta="MP4 48MB"
          fileType="video"
        />
        <AttachmentCard
          fileName="podcast_ep12.mp3"
          fileMeta="MP3 28MB"
          fileType="audio"
        />
      </div>
      <div className={styles['components__row']}>
        <AttachmentCard
          fileName="patch-0001.diff"
          fileMeta="DIFF 14KB"
          fileType="patch"
        />
        <AttachmentCard
          fileName="archive.zip"
          fileMeta="ZIP 156MB"
          fileType="zip"
        />
        <AttachmentCard fileName="index.ts" fileMeta="TS 4KB" fileType="code" />
      </div>
      <div className={styles['components__row']}>
        <AttachmentCard
          fileName="uploading_file.psd"
          fileType="generic"
          state="uploading"
          progress={56}
        />
        <AttachmentCard
          fileName="uploaded_file.psd"
          fileMeta="PSD 48MB"
          fileType="generic"
          state="uploaded"
        />
      </div>
    </>
  );
}
