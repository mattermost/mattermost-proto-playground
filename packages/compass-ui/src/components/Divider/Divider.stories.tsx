import type { Meta, StoryObj } from '@storybook/react';
import Divider from './Divider';

const meta = {
  title: 'Components/Layout and Containers/Divider',
  component: Divider,
  tags: ['autodocs'],
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InContext: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 12,
        maxWidth: 360,
        color: 'var(--color-text-primary)',
      }}
    >
      <p style={{ margin: 0 }}>Content above</p>
      <Divider />
      <p style={{ margin: 0 }}>Content below</p>
    </div>
  ),
};
