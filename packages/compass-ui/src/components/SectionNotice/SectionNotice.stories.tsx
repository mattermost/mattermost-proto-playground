import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { ShortcutTagGroup } from '@/components/ShortcutTag/ShortcutTag';
import SectionNotice from './SectionNotice';
import type { SectionNoticeType } from './SectionNotice';

const TYPES: SectionNoticeType[] = [
  'Info',
  'Success',
  'Warning',
  'Danger',
];

const meta = {
  title: 'Components/Feedback and Notices/Section Notice',
  component: SectionNotice,
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'select', options: TYPES },
  },
} satisfies Meta<typeof SectionNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Keyboard shortcut',
    description: (
      <>
        Press <ShortcutTagGroup labels={['Ctrl', 'K']} /> to open the quick
        switcher and jump to any channel.
      </>
    ),
    primaryButtonLabel: 'Got it',
    onPrimaryAction: fn(),
    secondaryButtonLabel: 'Dismiss',
    onSecondaryAction: fn(),
    onDismiss: fn(),
  },
};

export const Info: Story = {
  args: {
    title: 'Keyboard shortcut updated',
    type: 'Info',
    description: (
      <>
        The quick switcher is now opened with{' '}
        <ShortcutTagGroup labels={['Ctrl', 'K']} />.
      </>
    ),
    onDismiss: fn(),
  },
};

export const Success: Story = {
  args: {
    title: 'Changes saved',
    type: 'Success',
    description: 'Your notification preferences have been updated.',
    primaryButtonLabel: 'Got it',
    onPrimaryAction: fn(),
    onDismiss: fn(),
  },
};

export const Warning: Story = {
  args: {
    title: 'Session expiring soon',
    type: 'Warning',
    description: 'You will be signed out in 5 minutes due to inactivity.',
    primaryButtonLabel: 'Stay signed in',
    onPrimaryAction: fn(),
    secondaryButtonLabel: 'Dismiss',
    onSecondaryAction: fn(),
    onDismiss: fn(),
  },
};

export const Danger: Story = {
  args: {
    title: 'Permission required',
    type: 'Danger',
    description: "You don't have access to post in this channel.",
    primaryButtonLabel: 'Review permissions',
    onPrimaryAction: fn(),
    onDismiss: fn(),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, maxWidth: 640 }}>
      <SectionNotice
        title="Keyboard shortcut"
        description={
          <>
            Press <ShortcutTagGroup labels={['Ctrl', 'K']} /> to open the quick
            switcher.
          </>
        }
        primaryButtonLabel="Got it"
        onPrimaryAction={fn()}
        secondaryButtonLabel="Dismiss"
        onSecondaryAction={fn()}
        onDismiss={fn()}
      />
      {TYPES.map((type) => (
        <SectionNotice
          key={type}
          type={type}
          title={`${type} variant`}
          description={`Example ${type.toLowerCase()} section notice content.`}
          onDismiss={fn()}
        />
      ))}
    </div>
  ),
};
