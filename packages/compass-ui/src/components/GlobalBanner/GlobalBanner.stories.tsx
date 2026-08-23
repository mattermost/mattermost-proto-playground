import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { fn } from '@storybook/test';
import GlobalBanner from './GlobalBanner';
import type { GlobalBannerProps, GlobalBannerType } from './GlobalBanner';
import {
  ICON_NONE,
  iconSelectArgType,
  resolveStoryIcon,
} from '../../storybook/icons';

const TYPES: GlobalBannerType[] = [
  'General',
  'Warning',
  'Danger',
  'Info',
  'Success',
];

type GlobalBannerStoryArgs = Omit<GlobalBannerProps, 'leadingIcon'> & {
  leadingIcon?: string;
};

const meta = {
  title: 'Components/Banners/Global Banner',
  component: GlobalBanner,
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'select', options: TYPES },
    leadingIcon: iconSelectArgType({ optional: true }),
  },
  args: {
    leadingIcon: ICON_NONE,
  },
  render: ({ leadingIcon, ...rest }) => (
    <GlobalBanner
      {...rest}
      leadingIcon={
        resolveStoryIcon(leadingIcon, { wrapSize: '16' }) as ReactNode
      }
    />
  ),
} satisfies Meta<GlobalBannerStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const General: Story = {
  args: {
    message: 'Your license expires in 14 days.',
    type: 'General',
    actionLabel: 'Renew',
    onAction: fn(),
    onDismiss: fn(),
  },
};

export const Warning: Story = {
  args: {
    message: 'Scheduled maintenance window tonight from 2–4 AM UTC.',
    type: 'Warning',
    onDismiss: fn(),
  },
};

export const Danger: Story = {
  args: {
    message: 'Critical security update required. Please update immediately.',
    type: 'Danger',
    actionLabel: 'Update now',
    onAction: fn(),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 0 }}>
      <GlobalBanner
        message="Your license expires in 14 days."
        type="General"
        actionLabel="Renew"
        onAction={fn()}
        onDismiss={fn()}
      />
      <GlobalBanner
        message="Scheduled maintenance window tonight from 2–4 AM UTC."
        type="Warning"
        onDismiss={fn()}
      />
      <GlobalBanner
        message="Critical security update required. Please update immediately."
        type="Danger"
        actionLabel="Update now"
        onAction={fn()}
      />
      <GlobalBanner
        message="New version of Mattermost is available."
        type="Info"
        actionLabel="Learn more"
        onAction={fn()}
        onDismiss={fn()}
      />
      <GlobalBanner
        message="Your data export is ready to download."
        type="Success"
        actionLabel="Download"
        onAction={fn()}
        onDismiss={fn()}
      />
    </div>
  ),
};
