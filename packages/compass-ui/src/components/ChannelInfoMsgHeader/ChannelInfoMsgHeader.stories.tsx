import type { Meta, StoryObj } from '@storybook/react';
import ChannelInfoMsgHeader from './ChannelInfoMsgHeader';

const meta = {
  title: 'Components/Messaging/Channel Info Msg Header',
  component: ChannelInfoMsgHeader,
  tags: ['autodocs'],
} satisfies Meta<typeof ChannelInfoMsgHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MultipleTabs: Story = {
  args: {
    tabs: [
      { label: 'Spec Reviews', active: true },
      { label: 'Files' },
      { label: 'Pinned' },
    ],
    teamName: 'Contributors',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 560 }}>
      <div>
        <p
          style={{
            margin: '0 0 8px',
            fontSize: 12,
            color: 'rgba(var(--center-channel-color-rgb), 0.56)',
          }}
        >
          Default
        </p>
        <ChannelInfoMsgHeader />
      </div>
      <div>
        <p
          style={{
            margin: '0 0 8px',
            fontSize: 12,
            color: 'rgba(var(--center-channel-color-rgb), 0.56)',
          }}
        >
          Multiple tabs
        </p>
        <ChannelInfoMsgHeader
          tabs={[
            { label: 'Spec Reviews', active: true },
            { label: 'Files' },
            { label: 'Pinned' },
          ]}
          teamName="Contributors"
        />
      </div>
    </div>
  ),
};
