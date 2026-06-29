import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import ThreadFooter from './ThreadFooter';

const meta = {
  title: 'Components/Messaging/Thread Footer',
  component: ThreadFooter,
  tags: ['autodocs'],
} satisfies Meta<typeof ThreadFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    replyCount: 4,
    avatars: [
      { src: avatarLeonard, alt: 'Leonard Riley' },
      { src: avatarDanielle, alt: 'Danielle Okoro' },
      { src: avatarMarco, alt: 'Marco Rinaldi' },
    ],
    onReply: fn(),
    onFollowToggle: fn(),
  },
};

export const Following: Story = {
  args: {
    replyCount: 2,
    avatars: [
      { src: avatarEmma, alt: 'Emma Novak' },
      { src: avatarSofia, alt: 'Sofia Bauer' },
    ],
    following: true,
    lastReplyTime: '2 mins ago',
    onReply: fn(),
    onFollowToggle: fn(),
  },
};

export const UnreadBadge: Story = {
  args: {
    replyCount: 3,
    badge: 'Unread',
    avatars: [{ src: avatarLeonard, alt: 'Leonard Riley' }],
    onReply: fn(),
    onFollowToggle: fn(),
  },
};

export const MentionBadge: Story = {
  args: {
    replyCount: 1,
    badge: 'Mention',
    avatars: [{ src: avatarDanielle, alt: 'Danielle Okoro' }],
    onReply: fn(),
    onFollowToggle: fn(),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
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
        <ThreadFooter
          replyCount={4}
          avatars={[
            { src: avatarLeonard, alt: 'Leonard Riley' },
            { src: avatarDanielle, alt: 'Danielle Okoro' },
            { src: avatarMarco, alt: 'Marco Rinaldi' },
          ]}
        />
      </div>
      <div>
        <p
          style={{
            margin: '0 0 8px',
            fontSize: 12,
            color: 'rgba(var(--center-channel-color-rgb), 0.56)',
          }}
        >
          Following
        </p>
        <ThreadFooter
          replyCount={2}
          avatars={[
            { src: avatarEmma, alt: 'Emma Novak' },
            { src: avatarSofia, alt: 'Sofia Bauer' },
          ]}
          following
          lastReplyTime="2 mins ago"
        />
      </div>
      <div>
        <p
          style={{
            margin: '0 0 8px',
            fontSize: 12,
            color: 'rgba(var(--center-channel-color-rgb), 0.56)',
          }}
        >
          Badges
        </p>
        <div style={{ display: 'grid', gap: 12 }}>
          <ThreadFooter
            replyCount={3}
            badge="Unread"
            avatars={[{ src: avatarLeonard, alt: 'Leonard Riley' }]}
          />
          <ThreadFooter
            replyCount={1}
            badge="Mention"
            avatars={[{ src: avatarDanielle, alt: 'Danielle Okoro' }]}
          />
        </div>
      </div>
    </div>
  ),
};
