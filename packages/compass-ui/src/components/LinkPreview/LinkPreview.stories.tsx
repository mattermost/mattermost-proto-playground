import type { Meta, StoryObj } from '@storybook/react';
import LinkPreview from './LinkPreview';

const meta = {
  title: 'Components/Cards and Previews/Link Preview',
  component: LinkPreview,
  tags: ['autodocs'],
} satisfies Meta<typeof LinkPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Custom: Story = {
  args: {
    siteName: 'GitHub',
    title:
      'mattermost/mattermost - Open source platform for developer collaboration',
    description:
      'Mattermost is written in Golang and React. Open source, self-hosted Slack-alternative.',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, maxWidth: 480 }}>
      <LinkPreview />
      <LinkPreview
        siteName="GitHub"
        title="mattermost/mattermost - Open source platform for developer collaboration"
        description="Mattermost is written in Golang and React. Open source, self-hosted Slack-alternative."
      />
    </div>
  ),
};
