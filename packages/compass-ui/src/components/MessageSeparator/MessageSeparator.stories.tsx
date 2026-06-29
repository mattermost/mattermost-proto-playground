import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import MessageSeparator from './MessageSeparator';
import type { MessageSeparatorType } from './MessageSeparator';

const meta = {
  title: 'Components/Messaging/Message Separator',
  component: MessageSeparator,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['Date', 'New Messages', 'Reply Count'] satisfies MessageSeparatorType[],
    },
  },
} satisfies Meta<typeof MessageSeparator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Date: Story = {
  args: {
    type: 'Date',
    label: 'Today',
  },
};

export const NewMessages: Story = {
  args: {
    type: 'New Messages',
    showAiSummary: true,
    onSummarize: fn(),
  },
};

export const ReplyCount: Story = {
  args: {
    type: 'Reply Count',
    label: '6 replies',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 640 }}>
      <div>
        <p
          style={{
            margin: '0 0 8px',
            fontSize: 12,
            color: 'rgba(var(--center-channel-color-rgb), 0.56)',
          }}
        >
          Date
        </p>
        <MessageSeparator type="Date" label="Today" />
      </div>
      <div>
        <p
          style={{
            margin: '0 0 8px',
            fontSize: 12,
            color: 'rgba(var(--center-channel-color-rgb), 0.56)',
          }}
        >
          New Messages
        </p>
        <MessageSeparator type="New Messages" showAiSummary />
      </div>
      <div>
        <p
          style={{
            margin: '0 0 8px',
            fontSize: 12,
            color: 'rgba(var(--center-channel-color-rgb), 0.56)',
          }}
        >
          Reply Count
        </p>
        <MessageSeparator type="Reply Count" label="6 replies" />
      </div>
    </div>
  ),
};
