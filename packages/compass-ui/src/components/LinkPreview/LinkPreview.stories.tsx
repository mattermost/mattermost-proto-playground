import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import sampleImage from '@/assets/images/sample-image.jpg';
import LinkPreview from './LinkPreview';
import type { LinkPreviewProps } from './LinkPreview';

function InteractiveLargeImagePreview({
  defaultCollapsed = false,
  onCopyImageLink = fn(),
  onDownloadImage = fn(),
  ...props
}: Omit<
  LinkPreviewProps,
  'imageCollapsed' | 'onToggleImageCollapse' | 'imageSize'
> & {
  defaultCollapsed?: boolean;
}) {
  const [imageCollapsed, setImageCollapsed] = useState(defaultCollapsed);

  return (
    <LinkPreview
      {...props}
      imageSize="large"
      imageSrc={sampleImage}
      imageAlt="Preview image"
      imageCollapsed={imageCollapsed}
      onToggleImageCollapse={() => setImageCollapsed((value) => !value)}
      onCopyImageLink={onCopyImageLink}
      onDownloadImage={onDownloadImage}
      onDismiss={props.onDismiss ?? fn()}
    />
  );
}

const meta = {
  title: 'Components/Cards and Previews/Link Preview',
  component: LinkPreview,
  tags: ['autodocs'],
} satisfies Meta<typeof LinkPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onDismiss: fn(),
  },
};

export const SmallImage: Story = {
  args: {
    imageSrc: sampleImage,
    imageAlt: 'Preview image',
    imageSize: 'small',
    onDismiss: fn(),
  },
};

export const LargeImage: Story = {
  render: (args) => <InteractiveLargeImagePreview {...args} />,
};

export const CollapsedLargeImage: Story = {
  render: (args) => (
    <InteractiveLargeImagePreview {...args} defaultCollapsed />
  ),
};

export const WithDismiss: Story = {
  args: {
    onDismiss: fn(),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 700 }}>
      <section>
        <h3
          style={{
            marginBottom: 12,
            fontSize: 12,
            color: 'var(--center-channel-color)',
          }}
        >
          Text only
        </h3>
        <LinkPreview onDismiss={fn()} />
      </section>
      <section>
        <h3
          style={{
            marginBottom: 12,
            fontSize: 12,
            color: 'var(--center-channel-color)',
          }}
        >
          Small image
        </h3>
        <LinkPreview
          imageSrc={sampleImage}
          imageAlt="Preview image"
          imageSize="small"
          onDismiss={fn()}
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
          Large image
        </h3>
        <InteractiveLargeImagePreview />
      </section>
      <section>
        <h3
          style={{
            marginBottom: 12,
            fontSize: 12,
            color: 'var(--center-channel-color)',
          }}
        >
          Collapsed large image
        </h3>
        <InteractiveLargeImagePreview defaultCollapsed />
      </section>
    </div>
  ),
};
