import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
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

const labelStyle = {
  width: '100%',
  fontSize: 12,
  color: 'var(--center-channel-color)',
  marginBottom: 8,
} as const;

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <span style={labelStyle}>{label}</span>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          alignItems: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
}

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

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <Row label="Image">
        {IMAGE_SIZES.map((size) => (
          <UserAvatar
            key={size}
            alt="Leonard Riley"
            src={avatarLeonard}
            size={size}
          />
        ))}
      </Row>
      <Row label="Image with status">
        {IMAGE_SIZES.map((size) => (
          <UserAvatar
            key={size}
            alt="Sofia Bauer"
            src={avatarSofia}
            size={size}
            status
          />
        ))}
      </Row>
      <Row label="Fallback">
        {IMAGE_SIZES.map((size) => (
          <UserAvatar
            key={size}
            alt="Danielle Okoro"
            name="Danielle Okoro"
            size={size}
          />
        ))}
      </Row>
      <Row label="Fallback colors">
        {FALLBACK_COLORS.map((fallbackColor) => (
          <UserAvatar
            key={fallbackColor}
            alt="Sample User"
            name="Sample User"
            fallbackColor={fallbackColor}
            size="40"
          />
        ))}
      </Row>
    </div>
  ),
};
