import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import AdminPanelFooter from './AdminPanelFooter';

const footerSurface = {
  maxWidth: 920,
  width: '100%',
  border: '1px solid rgba(var(--center-channel-color-rgb), 0.12)',
  borderRadius: 'var(--radius-m)',
  overflow: 'hidden',
} as const;

const meta = {
  title: 'Components/Admin Console/Admin Panel Footer',
  component: AdminPanelFooter,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['none', 'warning', 'error'],
    },
  },
  decorators: [
    (Story) => (
      <div style={footerSurface}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AdminPanelFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    saveDisabled: true,
    onSave: fn(),
    onCancel: fn(),
  },
};

export const SaveEnabled: Story = {
  args: {
    saveDisabled: false,
    onSave: fn(),
    onCancel: fn(),
  },
};

export const WithWarning: Story = {
  args: {
    saveDisabled: false,
    status: 'warning',
    statusMessage: 'There are X issues in the form above.',
    onSave: fn(),
    onCancel: fn(),
  },
};

export const WithError: Story = {
  args: {
    saveDisabled: true,
    status: 'error',
    statusMessage: 'There are X errors in the form above.',
    onSave: fn(),
    onCancel: fn(),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 920 }}>
      <div style={footerSurface}>
        <AdminPanelFooter
          saveDisabled
          onSave={fn()}
          onCancel={fn()}
        />
      </div>
      <div style={footerSurface}>
        <AdminPanelFooter
          saveDisabled={false}
          status="warning"
          statusMessage="There are X issues in the form above."
          onSave={fn()}
          onCancel={fn()}
        />
      </div>
      <div style={footerSurface}>
        <AdminPanelFooter
          saveDisabled
          status="error"
          statusMessage="There are X errors in the form above."
          onSave={fn()}
          onCancel={fn()}
        />
      </div>
    </div>
  ),
};
