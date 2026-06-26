import type { Meta, StoryObj } from '@storybook/react';

import ErrorMessage from './ErrorMessage';

const meta = {
  title: 'Components/Feedback and Notices/Error Message',
  component: ErrorMessage,
  tags: ['autodocs'],
} satisfies Meta<typeof ErrorMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: 'This field is required.',
  },
};

export const Examples: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 8 }}>
      <ErrorMessage message="This field is required." />
      <ErrorMessage message="Invalid email address." />
      <ErrorMessage message="Password must be at least 8 characters." />
    </div>
  ),
};
