import type { Meta, StoryObj } from '@storybook/react';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import UserAvatarGroup from './UserAvatarGroup';
import type { UserAvatarGroupSize } from './UserAvatarGroup';

const AVATARS = [
  { key: 'leonard', src: avatarLeonard, name: 'Leonard Riley' },
  { key: 'danielle', src: avatarDanielle, name: 'Danielle Okoro' },
  { key: 'marco', src: avatarMarco, name: 'Marco Rinaldi' },
  { key: 'emma', src: avatarEmma, name: 'Emma Novak' },
  { key: 'sofia', src: avatarSofia, name: 'Sofia Bauer' },
];

const SIZES: UserAvatarGroupSize[] = ['24', '32', '40'];

const meta = {
  title: 'Components/Images and Icons/User Avatar Group',
  component: UserAvatarGroup,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: SIZES },
    max: { control: 'number' },
  },
} satisfies Meta<typeof UserAvatarGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    avatars: AVATARS,
    max: 3,
    size: '24',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {SIZES.map((size) => (
        <div
          key={size}
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'center',
            color: 'var(--center-channel-color)',
            fontSize: 12,
          }}
        >
          <span style={{ width: 32 }}>{size}</span>
          <UserAvatarGroup avatars={AVATARS} max={3} size={size} />
        </div>
      ))}
    </div>
  ),
};

export const WithFallback: Story = {
  args: {
    avatars: [
      { key: 'leonard', src: avatarLeonard, name: 'Leonard Riley' },
      { key: 'guest', name: 'Guest User' },
      { key: 'marco', src: avatarMarco, name: 'Marco Rinaldi' },
      { key: 'emma', name: 'Emma Novak' },
    ],
    max: 3,
    size: '32',
  },
};
