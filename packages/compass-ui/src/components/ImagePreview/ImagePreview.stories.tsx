import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import sampleImage from '@/assets/images/sample-image.jpg';
import ImagePreview from './ImagePreview';
import type { ImagePreviewAspectRatio } from './ImagePreview';

const RATIOS: ImagePreviewAspectRatio[] = ['16:9', '4:3', '1:1'];

const meta = {
  title: 'Components/Cards and Previews/Image Preview',
  component: ImagePreview,
  tags: ['autodocs'],
  argTypes: {
    aspectRatio: { control: 'select', options: RATIOS },
  },
} satisfies Meta<typeof ImagePreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: sampleImage,
    alt: 'Sample image',
    onCopyLink: fn(),
    onDownload: fn(),
    onToggleCollapse: fn(),
  },
};

export const Square: Story = {
  args: {
    src: sampleImage,
    alt: 'Square image',
    aspectRatio: '1:1',
    onCopyLink: fn(),
    onDownload: fn(),
  },
};

export const Collapsed: Story = {
  args: {
    src: sampleImage,
    alt: 'Collapsed image',
    collapsed: true,
    onToggleCollapse: fn(),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 560 }}>
      <section>
        <h3
          style={{
            marginBottom: 12,
            fontSize: 12,
            color: 'var(--center-channel-color)',
          }}
        >
          16:9
        </h3>
        <ImagePreview
          src={sampleImage}
          alt="Sample image"
          onCopyLink={fn()}
          onDownload={fn()}
          onToggleCollapse={fn()}
        />
      </section>
      <section>
        <h3
          style={{
            marginBottom: 12,
            fontSize: 12,
            color: 'var(--center-channel-color)',
          }}
        >
          1:1
        </h3>
        <ImagePreview
          src={sampleImage}
          alt="Square image"
          aspectRatio="1:1"
          onCopyLink={fn()}
          onDownload={fn()}
        />
      </section>
      <section>
        <h3
          style={{
            marginBottom: 12,
            fontSize: 12,
            color: 'var(--center-channel-color)',
          }}
        >
          Collapsed
        </h3>
        <ImagePreview
          src={sampleImage}
          alt="Collapsed image"
          collapsed
          onToggleCollapse={fn()}
        />
      </section>
    </div>
  ),
};
