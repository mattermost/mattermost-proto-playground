import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import ChannelSidebarItem from './ChannelSidebarItem';
import type {
  ChannelSidebarItemLeadingVisual,
  ChannelSidebarItemStatus,
} from './ChannelSidebarItem';

const sidebarSurface = {
  padding: 16,
  borderRadius: 8,
  background: 'var(--sidebar-header-bg)',
  width: 280,
} as const;

const labelStyle = {
  width: '100%',
  fontSize: 12,
  color: 'var(--sidebar-text)',
  marginBottom: 8,
} as const;

const meta = {
  title: 'Components/Navigation/Channel Sidebar Item',
  component: ChannelSidebarItem,
  tags: ['autodocs'],
  argTypes: {
    leadingVisual: {
      control: 'select',
      options: [
        'Public',
        'Private',
        'Group Message',
        'Direct Message',
        'Drafts',
        'Insights',
        'Threads',
        'Dial Pad',
      ] satisfies ChannelSidebarItemLeadingVisual[],
    },
    status: {
      control: 'select',
      options: ['Read', 'Unread', 'Mention'] satisfies ChannelSidebarItemStatus[],
    },
  },
  decorators: [
    (Story) => (
      <div style={sidebarSurface}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChannelSidebarItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PublicChannel: Story = {
  args: {
    leadingVisual: 'Public',
    name: 'Design',
    onClick: fn(),
  },
};

export const Unread: Story = {
  args: {
    leadingVisual: 'Public',
    name: 'Unread channel',
    status: 'Unread',
    onClick: fn(),
  },
};

export const DirectMessage: Story = {
  args: {
    leadingVisual: 'Direct Message',
    name: 'Leonard Riley',
    avatarSrc: avatarLeonard,
    avatarAlt: 'Leonard Riley',
    showAvatarStatus: true,
    onClick: fn(),
  },
};

export const Active: Story = {
  args: {
    leadingVisual: 'Public',
    name: 'Active channel',
    active: true,
    onClick: fn(),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <section>
        <span style={labelStyle}>Leading visuals</span>
        <div style={{ display: 'grid', gap: 2 }}>
          <ChannelSidebarItem leadingVisual="Public" name="Design" onClick={fn()} />
          <ChannelSidebarItem
            leadingVisual="Private"
            name="Engineering"
            onClick={fn()}
          />
          <ChannelSidebarItem
            leadingVisual="Group Message"
            name="Design Team"
            memberCount={4}
            onClick={fn()}
          />
          <ChannelSidebarItem
            leadingVisual="Direct Message"
            name="Leonard Riley"
            avatarSrc={avatarLeonard}
            avatarAlt="Leonard Riley"
            showAvatarStatus
            onClick={fn()}
          />
          <ChannelSidebarItem leadingVisual="Threads" name="Threads" onClick={fn()} />
          <ChannelSidebarItem leadingVisual="Drafts" name="Drafts" onClick={fn()} />
          <ChannelSidebarItem
            leadingVisual="Insights"
            name="Insights"
            onClick={fn()}
          />
        </div>
      </section>
      <section>
        <span style={labelStyle}>Status</span>
        <div style={{ display: 'grid', gap: 2 }}>
          <ChannelSidebarItem
            leadingVisual="Public"
            name="Read channel"
            status="Read"
            onClick={fn()}
          />
          <ChannelSidebarItem
            leadingVisual="Public"
            name="Unread channel"
            status="Unread"
            onClick={fn()}
          />
          <ChannelSidebarItem
            leadingVisual="Public"
            name="Mention channel"
            status="Mention"
            mentionCount={3}
            onClick={fn()}
          />
        </div>
      </section>
      <section>
        <span style={labelStyle}>Active and muted</span>
        <div style={{ display: 'grid', gap: 2 }}>
          <ChannelSidebarItem
            leadingVisual="Public"
            name="Active channel"
            active
            onClick={fn()}
          />
          <ChannelSidebarItem
            leadingVisual="Public"
            name="Muted channel"
            muted
            onClick={fn()}
          />
          <ChannelSidebarItem
            leadingVisual="Direct Message"
            name="Danielle Okoro"
            avatarSrc={avatarDanielle}
            avatarAlt="Danielle Okoro"
            muted
            onClick={fn()}
          />
        </div>
      </section>
      <section>
        <span style={labelStyle}>Shared, call, emoji</span>
        <div style={{ display: 'grid', gap: 2 }}>
          <ChannelSidebarItem
            leadingVisual="Public"
            name="Shared channel"
            sharedChannel
            onClick={fn()}
          />
          <ChannelSidebarItem
            leadingVisual="Private"
            name="Call active"
            callActive
            onClick={fn()}
          />
          <ChannelSidebarItem
            leadingVisual="Direct Message"
            name="Marco Rinaldi"
            avatarSrc={avatarMarco}
            avatarAlt="Marco Rinaldi"
            customStatusEmoji="🏄"
            onClick={fn()}
          />
        </div>
      </section>
    </div>
  ),
};
