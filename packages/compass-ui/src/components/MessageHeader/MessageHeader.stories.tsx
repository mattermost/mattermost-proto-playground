import type { Meta, StoryObj } from '@storybook/react';
import MessageHeader from './MessageHeader';

const meta = {
  title: 'Components/Messaging/Message Header',
  component: MessageHeader,
  tags: ['autodocs'],
} satisfies Meta<typeof MessageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    username: 'Leonard Riley',
    timestamp: 'Today at 9:41 AM',
  },
};

export const Bot: Story = {
  args: {
    username: 'Mattermost',
    timestamp: 'Today at 9:41 AM',
    isBot: true,
  },
};

export const BotCustomLabel: Story = {
  args: {
    username: 'PagerDuty',
    timestamp: 'Yesterday at 2:15 PM',
    isBot: true,
    botLabel: 'APP',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <p
          style={{
            margin: '0 0 8px',
            fontSize: 12,
            color: 'rgba(var(--center-channel-color-rgb), 0.56)',
          }}
        >
          Normal
        </p>
        <MessageHeader
          username="Leonard Riley"
          timestamp="Today at 9:41 AM"
        />
      </div>
      <div>
        <p
          style={{
            margin: '0 0 8px',
            fontSize: 12,
            color: 'rgba(var(--center-channel-color-rgb), 0.56)',
          }}
        >
          Bot
        </p>
        <MessageHeader
          username="Mattermost"
          timestamp="Today at 9:41 AM"
          isBot
        />
      </div>
      <div>
        <p
          style={{
            margin: '0 0 8px',
            fontSize: 12,
            color: 'rgba(var(--center-channel-color-rgb), 0.56)',
          }}
        >
          Bot (custom label)
        </p>
        <MessageHeader
          username="PagerDuty"
          timestamp="Yesterday at 2:15 PM"
          isBot
          botLabel="APP"
        />
      </div>
    </div>
  ),
};
