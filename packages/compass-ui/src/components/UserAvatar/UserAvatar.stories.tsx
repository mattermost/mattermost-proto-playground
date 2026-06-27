import type { Meta, StoryObj } from '@storybook/react';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import UserAvatar from './UserAvatar';
import type { UserAvatarFallbackColor, UserAvatarSize } from './UserAvatar';

const IMAGE_SIZES: UserAvatarSize[] = ['24', '32', '48', '64', '96'];
const FALLBACK_COLORS: UserAvatarFallbackColor[] = [
  'Red',
  'Purple',
  'Neutral',
  'Blue',
  'Cyan',
  'Yellow',
  'Green',
  'Orange',
];

const meta = {
  title: 'Components/Images and Icons/User Avatar',
  component: UserAvatar,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: IMAGE_SIZES },
    fallbackColor: { control: 'select', options: FALLBACK_COLORS },
  },
} satisfies Meta<typeof UserAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    alt: 'Marco Rinaldi',
    src: avatarMarco,
    size: '48',
  },
};

export const WithStatus: Story = {
  args: {
    alt: 'Sofia Bauer',
    src: avatarSofia,
    size: '48',
    status: true,
  },
};

export const ImageSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'end' }}>
      {IMAGE_SIZES.map((size) => (
        <div
          key={size}
          style={{
            display: 'grid',
            gap: 8,
            justifyItems: 'center',
            color: 'var(--center-channel-color)',
            fontSize: 12,
          }}
        >
          <UserAvatar alt="Leonard Riley" src={avatarLeonard} size={size} />
          <span>{size}</span>
        </div>
      ))}
    </div>
  ),
};

export const Fallback: Story = {
  args: {
    alt: 'Danielle Okoro',
    name: 'Danielle Okoro',
    size: '48',
  },
};

export const FallbackColors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
      {FALLBACK_COLORS.map((fallbackColor) => (
        <UserAvatar
          key={fallbackColor}
          alt="Sample User"
          name="Sample User"
          fallbackColor={fallbackColor}
          size="40"
        />
      ))}
    </div>
  ),
};

export const Gallery: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
      <UserAvatar alt="Leonard Riley" src={avatarLeonard} size="24" />
      <UserAvatar alt="Danielle Okoro" src={avatarDanielle} size="32" />
      <UserAvatar alt="Marco Rinaldi" src={avatarMarco} size="48" status />
      <UserAvatar alt="Emma Novak" src={avatarEmma} size="64" />
      <UserAvatar alt="Sofia Bauer" src={avatarSofia} size="96" status />
    </div>
  ),
};
