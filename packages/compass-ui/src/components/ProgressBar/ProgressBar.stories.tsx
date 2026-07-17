import type { Meta, StoryObj } from '@storybook/react';
import ProgressBar from './ProgressBar';

const meta = {
  title: 'Components/Progress Indicators/Progress Bar',
  component: ProgressBar,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['Small', 'Large'] },
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
  },
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 60,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 20, width: 360 }}>
      <div style={{ display: 'grid', gap: 8 }}>
        <span
          style={{
            fontSize: 12,
            color: 'var(--center-channel-color)',
          }}
        >
          Values
        </span>
        {[0, 35, 70, 100].map((value) => (
          <ProgressBar key={value} value={value} aria-label={`${value}%`} />
        ))}
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        <span
          style={{
            fontSize: 12,
            color: 'var(--center-channel-color)',
          }}
        >
          Sizes
        </span>
        <ProgressBar value={60} size="Small" aria-label="Small 60%" />
        <ProgressBar value={60} size="Large" aria-label="Large 60%" />
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        <span
          style={{
            fontSize: 12,
            color: 'var(--center-channel-color)',
          }}
        >
          Semantic colors
        </span>
        <ProgressBar value={30} semanticColors aria-label="30% success" />
        <ProgressBar value={75} semanticColors aria-label="75% warning" />
        <ProgressBar value={95} semanticColors aria-label="95% danger" />
      </div>
    </div>
  ),
};
