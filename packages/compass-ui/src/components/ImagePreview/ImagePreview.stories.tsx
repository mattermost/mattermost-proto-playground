import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import sampleImage from '@/assets/images/sample-image.jpg';
import ImagePreview from './ImagePreview';
import type { ImagePreviewAspectRatio, ImagePreviewProps } from './ImagePreview';

const RATIOS: ImagePreviewAspectRatio[] = ['16:9', '4:3', '1:1'];

function InteractiveImagePreview({
  defaultCollapsed = false,
  onCopyLink = fn(),
  onDownload = fn(),
  ...props
}: Omit<ImagePreviewProps, 'collapsed' | 'onToggleCollapse'> & {
  defaultCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <ImagePreview
      {...props}
      collapsed={collapsed}
      onCopyLink={onCopyLink}
      onDownload={onDownload}
      onToggleCollapse={() => setCollapsed((value) => !value)}
    />
  );
}

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
  render: (args) => <InteractiveImagePreview {...args} />,
  args: {
    src: sampleImage,
    alt: 'Sample image',
  },
};

export const Square: Story = {
  render: (args) => <InteractiveImagePreview {...args} />,
  args: {
    src: sampleImage,
    alt: 'Square image',
    aspectRatio: '1:1',
  },
};

export const Collapsed: Story = {
  render: (args) => (
    <InteractiveImagePreview {...args} defaultCollapsed />
  ),
  args: {
    src: sampleImage,
    alt: 'Collapsed image',
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
        <InteractiveImagePreview
          src={sampleImage}
          alt="Sample image"
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
        <InteractiveImagePreview
          src={sampleImage}
          alt="Square image"
          aspectRatio="1:1"
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
        <InteractiveImagePreview
          src={sampleImage}
          alt="Collapsed image"
          defaultCollapsed
        />
      </section>
    </div>
  ),
};
