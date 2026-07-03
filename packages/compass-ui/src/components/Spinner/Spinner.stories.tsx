import type { Meta, StoryObj } from '@storybook/react';
import Spinner from './Spinner';
import type { SpinnerSize } from './Spinner';

const SIZES: SpinnerSize[] = [10, 12, 16, 20, 24, 28, 32];

const meta = {
  title: 'Components/Progress Indicators/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: SIZES },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 16,
  },
};

export const Inverted: Story = {
  args: {
    inverted: true,
    size: 20,
  },
  decorators: [
    (Story) => (
      <div
        style={{
          display: 'inline-flex',
          padding: 16,
          borderRadius: 8,
          background: 'var(--sidebar-header-bg)',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export const AllSizes: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 20,
        alignItems: 'center',
      }}
    >
      {SIZES.map((size) => (
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
          <Spinner size={size} />
          <span>{size}</span>
        </div>
      ))}
    </div>
  ),
};
