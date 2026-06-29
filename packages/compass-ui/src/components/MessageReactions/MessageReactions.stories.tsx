import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import MessageReactions from './MessageReactions';

const meta = {
  title: 'Components/Messaging/Message Reactions',
  component: MessageReactions,
  tags: ['autodocs'],
} satisfies Meta<typeof MessageReactions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAddButton: Story = {
  args: {
    reactions: [
      { emoji: '👍', count: 5, byCurrentUser: true },
      { emoji: '🎉', count: 2 },
    ],
    showAddReaction: true,
    onAddReaction: fn(),
    onReactionClick: fn(),
  },
};

export const AcknowledgeUnclicked: Story = {
  args: {
    reactions: [],
    acknowledged: true,
    acknowledgeCount: 0,
    currentUserAcknowledged: false,
    onAcknowledge: fn(),
  },
};

export const AcknowledgeClicked: Story = {
  args: {
    reactions: [],
    acknowledged: true,
    acknowledgeCount: 3,
    currentUserAcknowledged: true,
    onAcknowledge: fn(),
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
          Default
        </p>
        <MessageReactions />
      </div>
      <div>
        <p
          style={{
            margin: '0 0 8px',
            fontSize: 12,
            color: 'rgba(var(--center-channel-color-rgb), 0.56)',
          }}
        >
          With add button
        </p>
        <MessageReactions
          reactions={[
            { emoji: '👍', count: 5, byCurrentUser: true },
            { emoji: '🎉', count: 2 },
          ]}
          showAddReaction
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
          Acknowledge — unclicked
        </p>
        <MessageReactions
          reactions={[]}
          acknowledged
          acknowledgeCount={0}
          currentUserAcknowledged={false}
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
          Acknowledge — clicked
        </p>
        <MessageReactions
          reactions={[]}
          acknowledged
          acknowledgeCount={3}
          currentUserAcknowledged
        />
      </div>
    </div>
  ),
};
