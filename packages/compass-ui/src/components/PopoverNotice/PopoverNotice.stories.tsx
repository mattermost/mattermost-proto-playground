import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { ShortcutTagGroup } from '@/components/ShortcutTag/ShortcutTag';
import PopoverNotice from './PopoverNotice';
import type { PopoverNoticeVariant } from './PopoverNotice';

const VARIANTS: PopoverNoticeVariant[] = [
  'info',
  'success',
  'warning',
  'danger',
];

const meta = {
  title: 'Components/Feedback and Notices/Popover Notice',
  component: PopoverNotice,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: [undefined, ...VARIANTS] },
  },
} satisfies Meta<typeof PopoverNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Keyboard shortcut',
    onClose: fn(),
    actions: [
      { label: 'Got it', emphasis: 'primary' },
      { label: 'Dismiss', emphasis: 'tertiary' },
    ],
    children: (
      <>
        Press <ShortcutTagGroup labels={['Ctrl', 'K']} /> to open the quick
        switcher and jump to any channel.
      </>
    ),
  },
};

export const Info: Story = {
  args: {
    title: 'Keyboard shortcut updated',
    variant: 'info',
    onClose: fn(),
    children: (
      <>
        The quick switcher is now opened with{' '}
        <ShortcutTagGroup labels={['Ctrl', 'K']} />.
      </>
    ),
  },
};

export const Success: Story = {
  args: {
    title: 'Changes saved',
    variant: 'success',
    onClose: fn(),
    actions: [{ label: 'Got it', emphasis: 'primary' }],
    children: 'Your notification preferences have been updated.',
  },
};

export const Warning: Story = {
  args: {
    title: 'Session expiring soon',
    variant: 'warning',
    onClose: fn(),
    actions: [
      { label: 'Stay signed in', emphasis: 'primary' },
      { label: 'Dismiss', emphasis: 'tertiary' },
    ],
    children: 'You will be signed out in 5 minutes due to inactivity.',
  },
};

export const Danger: Story = {
  args: {
    title: 'Permission required',
    variant: 'danger',
    onClose: fn(),
    actions: [{ label: 'Review permissions', emphasis: 'primary' }],
    children: "You don't have access to post in this channel.",
  },
};

export const WithCheckbox: Story = {
  args: {
    title: 'New feature available',
    showCheckbox: true,
    onClose: fn(),
    children: 'You can now forward messages directly to other channels.',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, maxWidth: 360 }}>
      <PopoverNotice
        title="Keyboard shortcut"
        onClose={fn()}
        actions={[
          { label: 'Got it', emphasis: 'primary' },
          { label: 'Dismiss', emphasis: 'tertiary' },
        ]}
      >
        Press <ShortcutTagGroup labels={['Ctrl', 'K']} /> to open the quick
        switcher.
      </PopoverNotice>
      {VARIANTS.map((variant) => (
        <PopoverNotice
          key={variant}
          title={`${variant.charAt(0).toUpperCase()}${variant.slice(1)} variant`}
          variant={variant}
          onClose={fn()}
        >
          Example {variant} popover notice content.
        </PopoverNotice>
      ))}
    </div>
  ),
};
