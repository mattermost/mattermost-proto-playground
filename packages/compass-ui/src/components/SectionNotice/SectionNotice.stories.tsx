import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import LightbulbOutlineIcon from '@mattermost/compass-icons/components/lightbulb-outline';
import Icon from '../Icon/Icon';
import SectionNotice from './SectionNotice';
import type { SectionNoticeType } from './SectionNotice';

const TYPES: SectionNoticeType[] = [
  'Info',
  'Warning',
  'Danger',
  'Success',
  'Hint',
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

export const Info: Story = {
  args: {
    type: 'Info',
    title: 'Email notifications are enabled.',
    description: 'You will receive notifications at your registered email address.',
  },
};

export const Warning: Story = {
  args: {
    type: 'Warning',
    title: 'Your session will expire soon.',
    description: 'Save your work before the session ends.',
    primaryButtonLabel: 'Extend session',
    onPrimaryAction: fn(),
  },
};

export const Danger: Story = {
  args: {
    type: 'Danger',
    title: 'This action cannot be undone.',
    description: 'Deleting this workspace will permanently remove all data.',
    primaryButtonLabel: 'Delete',
    onPrimaryAction: fn(),
    secondaryButtonLabel: 'Cancel',
    onSecondaryAction: fn(),
  },
};

export const Success: Story = {
  args: {
    type: 'Success',
    title: 'Configuration saved successfully.',
    onDismiss: fn(),
  },
};

export const Hint: Story = {
  args: {
    type: 'Hint',
    title: 'Tip: You can drag and drop files to upload them.',
    icon: <Icon size="20" glyph={<LightbulbOutlineIcon />} />,
    onDismiss: fn(),
  },
};

export const AllTypes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, maxWidth: 640 }}>
      <SectionNotice
        type="Info"
        title="Email notifications are enabled."
        description="You will receive notifications at your registered email address."
      />
      <SectionNotice
        type="Warning"
        title="Your session will expire soon."
        description="Save your work before the session ends."
        primaryButtonLabel="Extend session"
        onPrimaryAction={fn()}
      />
      <SectionNotice
        type="Danger"
        title="This action cannot be undone."
        description="Deleting this workspace will permanently remove all data."
        primaryButtonLabel="Delete"
        onPrimaryAction={fn()}
        secondaryButtonLabel="Cancel"
        onSecondaryAction={fn()}
      />
      <SectionNotice
        type="Success"
        title="Configuration saved successfully."
        onDismiss={fn()}
      />
      <SectionNotice
        type="Hint"
        title="Tip: You can drag and drop files to upload them."
        icon={<Icon size="20" glyph={<LightbulbOutlineIcon />} />}
        onDismiss={fn()}
      />
    </div>
  ),
};
