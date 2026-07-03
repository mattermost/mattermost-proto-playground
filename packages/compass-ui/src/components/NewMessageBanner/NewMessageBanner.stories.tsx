import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import NewMessageBanner from './NewMessageBanner';
import type { NewMessageBannerType } from './NewMessageBanner';

const meta = {
  title: 'Components/Banners/New Message Banner',
  component: NewMessageBanner,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['JumpToUnreads', 'NewReplies'] satisfies NewMessageBannerType[],
    },
  },
} satisfies Meta<typeof NewMessageBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const JumpToUnreads: Story = {
  args: {
    type: 'JumpToUnreads',
    countLabel: '21 new messages since Saturday',
    onDismiss: fn(),
    onClick: fn(),
  },
};

export const NewReplies: Story = {
  args: {
    type: 'NewReplies',
    onDismiss: fn(),
    onClick: fn(),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, maxWidth: 560 }}>
      <NewMessageBanner
        type="JumpToUnreads"
        countLabel="21 new messages since Saturday"
        onDismiss={fn()}
        onClick={fn()}
      />
      <NewMessageBanner type="NewReplies" onDismiss={fn()} onClick={fn()} />
    </div>
  ),
};
