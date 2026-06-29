import type { Meta, StoryObj } from '@storybook/react';
import MessageInput from './MessageInput';
import type { MessageInputWidth } from './MessageInput';

const meta = {
  title: 'Patterns/Message Input',
  component: MessageInput,
  tags: ['autodocs'],
  argTypes: {
    width: {
      control: 'select',
      options: ['wide', 'narrow'] satisfies MessageInputWidth[],
    },
  },
} satisfies Meta<typeof MessageInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Message #ux-design…',
  },
};

export const Narrow: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <MessageInput placeholder="Message #ux-design…" width="narrow" />
    </div>
  ),
};

export const WithPriorityIndicator: Story = {
  args: {
    placeholder: 'Message #ux-design…',
    showPriorityIndicator: true,
  },
};

export const WithAttachments: Story = {
  args: {
    placeholder: 'Message #ux-design…',
    showAttachments: true,
  },
};

export const WithPriorityAndAttachments: Story = {
  args: {
    placeholder: 'Message #ux-design…',
    showPriorityIndicator: true,
    showAttachments: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24, maxWidth: 640 }}>
      <div>
        <p
          style={{
            margin: '0 0 8px',
            fontSize: 12,
            color: 'rgba(var(--center-channel-color-rgb), 0.56)',
          }}
        >
          Default
        </p>
        <MessageInput placeholder="Message #ux-design…" />
      </div>
      <div>
        <p
          style={{
            margin: '0 0 8px',
            fontSize: 12,
            color: 'rgba(var(--center-channel-color-rgb), 0.56)',
          }}
        >
          Narrow (right sidebar)
        </p>
        <div style={{ maxWidth: 320 }}>
          <MessageInput placeholder="Message #ux-design…" width="narrow" />
        </div>
      </div>
      <div>
        <p
          style={{
            margin: '0 0 8px',
            fontSize: 12,
            color: 'rgba(var(--center-channel-color-rgb), 0.56)',
          }}
        >
          With priority indicator
        </p>
        <MessageInput placeholder="Message #ux-design…" showPriorityIndicator />
      </div>
      <div>
        <p
          style={{
            margin: '0 0 8px',
            fontSize: 12,
            color: 'rgba(var(--center-channel-color-rgb), 0.56)',
          }}
        >
          With attachments
        </p>
        <MessageInput placeholder="Message #ux-design…" showAttachments />
      </div>
      <div>
        <p
          style={{
            margin: '0 0 8px',
            fontSize: 12,
            color: 'rgba(var(--center-channel-color-rgb), 0.56)',
          }}
        >
          With priority + attachments
        </p>
        <MessageInput
          placeholder="Message #ux-design…"
          showPriorityIndicator
          showAttachments
        />
      </div>
    </div>
  ),
};
