import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import CallParticipantAvatar from './CallParticipantAvatar';
import type {
  CallParticipantAvatarSize,
  CallParticipantKind,
  CallParticipantMuteState,
} from './CallParticipantAvatar';

const callsSurface = {
  padding: 16,
  borderRadius: 8,
  background: 'var(--calls-bg)',
} as const;

const labelStyle = {
  width: '100%',
  fontSize: 12,
  color: 'var(--center-channel-color)',
  marginBottom: 8,
} as const;

const SIZES: CallParticipantAvatarSize[] = [
  'X-Small',
  'Small',
  'Medium',
  'Large',
];
const KINDS: CallParticipantKind[] = ['user', 'external-link', 'dial-in'];
const MUTE_STATES: CallParticipantMuteState[] = ['muted', 'unmuted'];

const meta = {
  title: 'Proto/Calls/Call Participant Avatar',
  component: CallParticipantAvatar,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: SIZES },
    kind: { control: 'select', options: KINDS },
    muteState: { control: 'select', options: [undefined, ...MUTE_STATES] },
  },
  decorators: [
    (Story) => (
      <div style={callsSurface}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CallParticipantAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: avatarLeonard,
    alt: 'Leonard Riley',
    size: 'Small',
    name: 'Leonard R.',
  },
};

export const Muted: Story = {
  args: {
    src: avatarLeonard,
    alt: 'Leonard Riley',
    size: 'Small',
    muteState: 'muted',
    name: 'Muted',
  },
};

export const Host: Story = {
  args: {
    src: avatarMarco,
    alt: 'Marco Rinaldi',
    size: 'Small',
    host: true,
    name: 'Host',
  },
};

export const WithReaction: Story = {
  args: {
    src: avatarEmma,
    alt: 'Emma Novak',
    size: 'Small',
    reaction: '🎉',
    name: 'Reaction',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ ...callsSurface, display: 'grid', gap: 24 }}>
      <section>
        <span style={labelStyle}>Sizes</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          <CallParticipantAvatar
            src={avatarLeonard}
            alt="Leonard Riley"
            size="X-Small"
            name="Leonard R."
          />
          <CallParticipantAvatar
            src={avatarDanielle}
            alt="Danielle Okoro"
            size="Small"
            name="Danielle O."
          />
          <CallParticipantAvatar
            src={avatarMarco}
            alt="Marco Rinaldi"
            size="Medium"
            name="Marco R."
          />
          <CallParticipantAvatar
            src={avatarEmma}
            alt="Emma Novak"
            size="Large"
            name="Emma N."
          />
        </div>
      </section>
      <section>
        <span style={labelStyle}>States</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          <CallParticipantAvatar
            src={avatarLeonard}
            alt="Leonard Riley"
            size="Small"
            muteState="muted"
            name="Muted"
          />
          <CallParticipantAvatar
            src={avatarDanielle}
            alt="Danielle Okoro"
            size="Small"
            muteState="unmuted"
            talking
            name="Unmuted"
          />
          <CallParticipantAvatar
            src={avatarMarco}
            alt="Marco Rinaldi"
            size="Small"
            host
            name="Host"
          />
          <CallParticipantAvatar
            src={avatarEmma}
            alt="Emma Novak"
            size="Small"
            reaction="🎉"
            name="Reaction"
          />
        </div>
      </section>
    </div>
  ),
};
