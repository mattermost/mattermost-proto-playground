import type { Meta, StoryObj } from '@storybook/react';
import Emoji from './Emoji';
import type { EmojiSize } from './Emoji';

const SIZES: EmojiSize[] = [
  '10',
  '12',
  '16',
  '20',
  '24',
  '28',
  '32',
  '40',
  '52',
  '64',
  '104',
];

const meta = {
  title: 'Components/Images and Icons/Emoji',
  component: Emoji,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: SIZES },
  },
} satisfies Meta<typeof Emoji>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    emoji: '🎉',
    size: '24',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div
      style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'end' }}
    >
      {SIZES.map((size, index) => (
        <div
          key={size}
          style={{
            display: 'grid',
            gap: 8,
            justifyItems: 'center',
            color: 'var(--center-channel-color)',
            fontSize: 12,
          }}
        >
          <Emoji emoji={['👍', '🎉', '🚀', '✨'][index % 4]} size={size} />
          <span>{size}</span>
        </div>
      ))}
    </div>
  ),
};
