import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import ProfilePopover from './ProfilePopover';
import type { ProfilePopoverUser } from './ProfilePopover';

const meta = {
  title: 'Patterns/Profile Popover',
  component: ProfilePopover,
  tags: ['autodocs'],
  argTypes: {
    user: {
      control: 'select',
      options: ['Others', 'You'] satisfies ProfilePopoverUser[],
    },
  },
} satisfies Meta<typeof ProfilePopover>;

export default meta;
type Story = StoryObj<typeof meta>;

const sharedLocalTime = {
  time: '10:42 PM',
  timezone: 'EST',
  hourDifference: '3 hrs behind',
};

export const OthersFull: Story = {
  args: {
    user: 'Others',
    avatarSrc: avatarLeonard,
    avatarAlt: 'Leonard Riley',
    name: 'Leonard Riley',
    username: '@leonard.riley',
    title: 'Lead Engineer, Enterprise',
    email: 'leonard.riley@acme.com',
    jobRole: 'System Admin',
    lastOnline: 'Last online 6 hrs ago',
    staff: true,
    localTime: sharedLocalTime,
    onClose: fn(),
    onPrimaryAction: fn(),
    onMention: fn(),
    onAddToChannel: fn(),
    onCall: fn(),
  },
};

export const OthersWithExtras: Story = {
  args: {
    user: 'Others',
    avatarSrc: avatarLeonard,
    avatarAlt: 'Leonard Riley',
    name: 'Leonard Riley',
    username: '@leonard.riley',
    title: 'Lead Engineer, Enterprise',
    email: 'leonard.riley@acme.com',
    jobRole: 'System Admin',
    lastOnline: 'Last online 6 hrs ago',
    sharedOrg: 'Acme Corp.',
    staff: true,
    coreCommitter: true,
    githubHandle: 'lennyriley',
    localTime: sharedLocalTime,
    customStatus: {
      emoji: '📅',
      text: 'In a meeting',
      expiresLabel: 'Until Tomorrow',
    },
    onClose: fn(),
    onPrimaryAction: fn(),
    onMention: fn(),
    onAddToChannel: fn(),
    onCall: fn(),
  },
};

export const You: Story = {
  args: {
    user: 'You',
    avatarSrc: avatarLeonard,
    avatarAlt: 'Leonard Riley',
    name: 'Leonard Riley',
    username: '@leonard.riley',
    title: 'Lead Engineer, Enterprise',
    email: 'leonard.riley@acme.com',
    jobRole: 'System Admin',
    lastOnline: 'Last online 6 hrs ago',
    staff: true,
    localTime: sharedLocalTime,
    onClose: fn(),
    onPrimaryAction: fn(),
    onSend: fn(),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 24,
        alignItems: 'start',
      }}
    >
      <ProfilePopover
        user="Others"
        avatarSrc={avatarLeonard}
        avatarAlt="Leonard Riley"
        name="Leonard Riley"
        username="@leonard.riley"
        title="Lead Engineer, Enterprise"
        email="leonard.riley@acme.com"
        jobRole="System Admin"
        lastOnline="Last online 6 hrs ago"
        staff
        localTime={sharedLocalTime}
        onClose={fn()}
        onPrimaryAction={fn()}
        onMention={fn()}
        onAddToChannel={fn()}
        onCall={fn()}
      />
      <ProfilePopover
        user="Others"
        avatarSrc={avatarLeonard}
        avatarAlt="Leonard Riley"
        name="Leonard Riley"
        username="@leonard.riley"
        title="Lead Engineer, Enterprise"
        email="leonard.riley@acme.com"
        jobRole="System Admin"
        lastOnline="Last online 6 hrs ago"
        sharedOrg="Acme Corp."
        staff
        coreCommitter
        githubHandle="lennyriley"
        localTime={sharedLocalTime}
        customStatus={{
          emoji: '📅',
          text: 'In a meeting',
          expiresLabel: 'Until Tomorrow',
        }}
        onClose={fn()}
        onPrimaryAction={fn()}
        onMention={fn()}
        onAddToChannel={fn()}
        onCall={fn()}
      />
      <ProfilePopover
        user="You"
        avatarSrc={avatarLeonard}
        avatarAlt="Leonard Riley"
        name="Leonard Riley"
        username="@leonard.riley"
        title="Lead Engineer, Enterprise"
        email="leonard.riley@acme.com"
        jobRole="System Admin"
        lastOnline="Last online 6 hrs ago"
        staff
        localTime={sharedLocalTime}
        onClose={fn()}
        onPrimaryAction={fn()}
        onSend={fn()}
      />
    </div>
  ),
};
