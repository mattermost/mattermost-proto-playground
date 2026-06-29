import type { Meta, StoryObj } from '@storybook/react';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import Divider from '../Divider/Divider';
import Message from './Message';
import messageStyles from './Message.module.scss';

const bodyTextClass = messageStyles['message__body-text'];

const meta = {
  title: 'Patterns/Message',
  component: Message,
  tags: ['autodocs'],
} satisfies Meta<typeof Message>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UserMessage: Story = {
  args: {
    avatarSrc: avatarLeonard,
    avatarAlt: 'Leonard Riley',
    username: 'Leonard Riley',
    timestamp: 'Today at 9:41 AM',
    children: (
      <p className={bodyTextClass}>
        Hey team, the new components are looking great!
      </p>
    ),
  },
};

export const BotMessage: Story = {
  args: {
    avatarSrc: avatarDanielle,
    avatarAlt: 'Danielle Okoro',
    username: 'Mattermost',
    timestamp: 'Today at 9:45 AM',
    isBot: true,
    children: (
      <p className={bodyTextClass}>
        You have 3 unread messages in #general.
      </p>
    ),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, maxWidth: 640 }}>
      <Message
        avatarSrc={avatarLeonard}
        avatarAlt="Leonard Riley"
        username="Leonard Riley"
        timestamp="Today at 9:41 AM"
      >
        <p className={bodyTextClass}>
          Hey team, the new components are looking great!
        </p>
      </Message>
      <Divider />
      <Message
        avatarSrc={avatarDanielle}
        avatarAlt="Danielle Okoro"
        username="Mattermost"
        timestamp="Today at 9:45 AM"
        isBot
      >
        <p className={bodyTextClass}>
          You have 3 unread messages in #general.
        </p>
      </Message>
    </div>
  ),
};
