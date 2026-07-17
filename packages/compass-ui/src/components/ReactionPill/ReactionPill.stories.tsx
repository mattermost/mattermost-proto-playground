import type { Meta, StoryObj } from '@storybook/react';
import ReactionPill from './ReactionPill';
import type { ReactionPillSize, ReactionPillType } from './ReactionPill';

const SIZES: ReactionPillSize[] = ['Small', 'Medium', 'Large'];
const TYPES: ReactionPillType[] = ['Reaction', 'Hand Raise', 'Other'];

const meta = {
  title: 'Components/Calls/Reaction Pill',
  component: ReactionPill,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: SIZES },
    type: { control: 'select', options: TYPES },
  },
} satisfies Meta<typeof ReactionPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Reaction: Story = {
  args: {
    type: 'Reaction',
    emoji: '🎉',
    label: 'Leonard R.',
  },
};

export const HandRaise: Story = {
  args: {
    type: 'Hand Raise',
    label: 'Danielle O.',
  },
};

export const Other: Story = {
  args: {
    type: 'Other',
    message: 'You have been muted by the host',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      {SIZES.map((size) => (
        <ReactionPill
          key={size}
          type="Reaction"
          emoji="👍"
          label="Marco R."
          size={size}
        />
      ))}
    </div>
  ),
};

export const AllTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      <ReactionPill type="Reaction" emoji="🎉" label="Leonard R." />
      <ReactionPill type="Hand Raise" label="Danielle O." />
      <ReactionPill type="Other" message="You have been muted by the host" />
    </div>
  ),
};
