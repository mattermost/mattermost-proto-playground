import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import AttachmentCard from './AttachmentCard';
import type { AttachmentCardFileType, AttachmentCardState } from './AttachmentCard';

const FILE_TYPES: AttachmentCardFileType[] = [
  'text',
  'word',
  'excel',
  'powerpoint',
  'pdf',
  'image-icon',
  'image-thumbnail',
  'video',
  'audio',
  'generic',
  'patch',
  'zip',
  'code',
];

const meta = {
  title: 'Components/Cards and Previews/Attachment Card',
  component: AttachmentCard,
  tags: ['autodocs'],
  argTypes: {
    fileType: { control: 'select', options: FILE_TYPES },
    state: {
      control: 'select',
      options: ['default', 'uploading', 'uploaded'] satisfies AttachmentCardState[],
    },
  },
} satisfies Meta<typeof AttachmentCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    fileName: 'Filename_goes_here.txt',
    fileMeta: 'TXT 15KB',
    fileType: 'text',
    onDownload: fn(),
    onMore: fn(),
  },
};

export const WithChannelTag: Story = {
  args: {
    fileName: 'Filename_goes_here.docx',
    fileMeta: 'DOCX 2.4MB',
    fileType: 'word',
    channelTag: 'UX Design',
    dateTimeStamp: 'Sep 24 5:14 PM',
    onDownload: fn(),
    onMore: fn(),
  },
};

export const Uploading: Story = {
  args: {
    fileName: 'uploading_file.psd',
    fileType: 'generic',
    state: 'uploading',
    progress: 56,
    onRemove: fn(),
  },
};

export const Uploaded: Story = {
  args: {
    fileName: 'uploaded_file.psd',
    fileMeta: 'PSD 48MB',
    fileType: 'generic',
    state: 'uploaded',
    onRemove: fn(),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 720 }}>
      <div style={{ display: 'grid', gap: 8 }}>
        <AttachmentCard
          fileName="Filename_goes_here.txt"
          fileMeta="TXT 15KB"
          fileType="text"
          onDownload={fn()}
          onMore={fn()}
        />
        <AttachmentCard
          fileName="Filename_goes_here.docx"
          fileMeta="DOCX 2.4MB"
          fileType="word"
          channelTag="UX Design"
          dateTimeStamp="Sep 24 5:14 PM"
          onDownload={fn()}
          onMore={fn()}
        />
        <AttachmentCard
          fileName="Spreadsheet_Q3_results.xlsx"
          fileMeta="XLSX 842KB"
          fileType="excel"
          onDownload={fn()}
          onMore={fn()}
        />
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        <AttachmentCard
          fileName="Presentation.pptx"
          fileMeta="PPTX 12MB"
          fileType="powerpoint"
          onDownload={fn()}
          onMore={fn()}
        />
        <AttachmentCard
          fileName="Design_spec.pdf"
          fileMeta="PDF 3.1MB"
          fileType="pdf"
          onDownload={fn()}
          onMore={fn()}
        />
        <AttachmentCard
          fileName="photo.jpg"
          fileMeta="JPG 2.2MB"
          fileType="image-icon"
          onDownload={fn()}
          onMore={fn()}
        />
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        <AttachmentCard
          fileName="thumbnail.jpg"
          fileMeta="JPG 2.2MB"
          fileType="image-thumbnail"
          thumbnailSrc="https://picsum.photos/seed/mm/80/80"
          onDownload={fn()}
          onMore={fn()}
        />
        <AttachmentCard
          fileName="screencast.mp4"
          fileMeta="MP4 48MB"
          fileType="video"
          onDownload={fn()}
          onMore={fn()}
        />
        <AttachmentCard
          fileName="podcast_ep12.mp3"
          fileMeta="MP3 28MB"
          fileType="audio"
          onDownload={fn()}
          onMore={fn()}
        />
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        <AttachmentCard
          fileName="patch-0001.diff"
          fileMeta="DIFF 14KB"
          fileType="patch"
          onDownload={fn()}
          onMore={fn()}
        />
        <AttachmentCard
          fileName="archive.zip"
          fileMeta="ZIP 156MB"
          fileType="zip"
          onDownload={fn()}
          onMore={fn()}
        />
        <AttachmentCard
          fileName="index.ts"
          fileMeta="TS 4KB"
          fileType="code"
          onDownload={fn()}
          onMore={fn()}
        />
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        <AttachmentCard
          fileName="uploading_file.psd"
          fileType="generic"
          state="uploading"
          progress={56}
          onRemove={fn()}
        />
        <AttachmentCard
          fileName="uploaded_file.psd"
          fileMeta="PSD 48MB"
          fileType="generic"
          state="uploaded"
          onRemove={fn()}
        />
      </div>
    </div>
  ),
};
