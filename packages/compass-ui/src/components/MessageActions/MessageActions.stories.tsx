import type { Meta, StoryObj } from '@storybook/react';
import MessageActions from './MessageActions';
import type { MessageActionsType } from './MessageActions';

const TYPES: MessageActionsType[] = ['Center Channel', 'RHS', 'Search Results'];

const meta = {
  title: 'Components/Messaging/Message Actions',
  component: MessageActions,
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'select', options: TYPES },
  },
} satisfies Meta<typeof MessageActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CenterChannel: Story = {
  args: {
    type: 'Center Channel',
  },
};

export const RHS: Story = {
  args: {
    type: 'RHS',
  },
};

export const SearchResults: Story = {
  args: {
    type: 'Search Results',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      {TYPES.map((type) => (
        <div key={type}>
          <p
            style={{
              margin: '0 0 8px',
              fontSize: 12,
              color: 'rgba(var(--center-channel-color-rgb), 0.56)',
            }}
          >
            {type}
          </p>
          <MessageActions type={type} />
        </div>
      ))}
    </div>
  ),
};
