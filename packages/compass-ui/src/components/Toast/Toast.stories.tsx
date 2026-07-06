import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import Toast from './Toast';
import type { ToastType } from './Toast';

const TYPES: ToastType[] = [
  'General',
  'Info',
  'Success',
  'Warning',
  'Danger',
];

const meta = {
  title: 'Components/Feedback and Notices/Toast',
  component: Toast,
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'select', options: TYPES },
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const General: Story = {
  args: {
    message: 'Link copied to clipboard.',
    type: 'General',
    onDismiss: fn(),
  },
};

export const Success: Story = {
  args: {
    message: 'Message saved successfully.',
    type: 'Success',
    onDismiss: fn(),
  },
};

export const WithAction: Story = {
  args: {
    message: 'Failed to send message. Please try again.',
    type: 'Danger',
    actionLabel: 'Retry',
    onAction: fn(),
    onDismiss: fn(),
  },
};

export const Warning: Story = {
  args: {
    message: 'Your session will expire in 5 minutes.',
    type: 'Warning',
    onDismiss: fn(),
  },
};

export const Info: Story = {
  args: {
    message: 'New update available. Refresh to apply.',
    type: 'Info',
    actionLabel: 'Refresh',
    onAction: fn(),
    onDismiss: fn(),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 12,
      }}
    >
      <Toast
        message="Link copied to clipboard."
        type="General"
        onDismiss={fn()}
      />
      <Toast
        message="Message saved successfully."
        type="Success"
        onDismiss={fn()}
      />
      <Toast
        message="Failed to send message. Please try again."
        type="Danger"
        actionLabel="Retry"
        onAction={fn()}
        onDismiss={fn()}
      />
      <Toast
        message="Your session will expire in 5 minutes."
        type="Warning"
        onDismiss={fn()}
      />
      <Toast
        message="New update available. Refresh to apply."
        type="Info"
        actionLabel="Refresh"
        onAction={fn()}
        onDismiss={fn()}
      />
    </div>
  ),
};
