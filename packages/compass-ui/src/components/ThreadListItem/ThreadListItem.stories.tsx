import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import avatarAiko from '@/assets/avatars/Aiko Tan.png';
import ThreadListItem from './ThreadListItem';
import type { UserAvatarGroupItem } from '../UserAvatarGroup/UserAvatarGroup';

const PARTICIPANTS: UserAvatarGroupItem[] = [
  { key: 'leonard', src: avatarLeonard, name: 'Leonard Riley' },
  { key: 'aiko', src: avatarAiko, name: 'Aiko Tan' },
  { key: 'marco', src: avatarMarco, name: 'Marco Rinaldi' },
  { key: 'sofia', src: avatarSofia, name: 'Sofia Bauer' },
];

const meta = {
  title: 'Components/Messaging/Thread List Item',
  component: ThreadListItem,
  tags: ['autodocs'],
} satisfies Meta<typeof ThreadListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    participants: PARTICIPANTS,
    onClick: fn(),
  },
};

export const Active: Story = {
  args: {
    active: true,
    badge: 'Unread',
    participants: PARTICIPANTS,
    onClick: fn(),
  },
};

export const Unread: Story = {
  args: {
    badge: 'Unread',
    participants: PARTICIPANTS,
    onClick: fn(),
  },
};

export const Mention: Story = {
  args: {
    badge: 'Mention',
    mentionCount: 3,
    participants: PARTICIPANTS,
    onClick: fn(),
  },
};

export const WithTitleNoAvatars: Story = {
  args: {
    participants: [],
    threadTitle: 'Guidelines for responsive layout in system console',
    onClick: fn(),
  },
};

export const WithMenu: Story = {
  args: {
    authorName: 'Danielle Okoro',
    badge: 'Unread',
    channelLabel: 'DESIGN TEAM',
    replyCount: 7,
    timestamp: '12 mins ago',
    participants: [{ key: 'danielle', src: avatarDanielle, name: 'Danielle Okoro' }],
    onClick: fn(),
    onMenuClick: fn(),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 8, maxWidth: 480 }}>
      <ThreadListItem participants={PARTICIPANTS} onClick={fn()} />
      <ThreadListItem
        active
        badge="Unread"
        participants={PARTICIPANTS}
        onClick={fn()}
      />
      <ThreadListItem badge="Unread" participants={PARTICIPANTS} onClick={fn()} />
      <ThreadListItem
        badge="Mention"
        mentionCount={3}
        participants={PARTICIPANTS}
        onClick={fn()}
      />
      <ThreadListItem
        participants={[]}
        threadTitle="Guidelines for responsive layout in system console"
        onClick={fn()}
      />
      <ThreadListItem
        authorName="Danielle Okoro"
        badge="Unread"
        channelLabel="DESIGN TEAM"
        replyCount={7}
        timestamp="12 mins ago"
        participants={[
          { key: 'danielle', src: avatarDanielle, name: 'Danielle Okoro' },
        ]}
        onClick={fn()}
      />
    </div>
  ),
};
