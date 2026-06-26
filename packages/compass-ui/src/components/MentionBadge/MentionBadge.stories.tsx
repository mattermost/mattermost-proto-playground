import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import MentionBadge from './MentionBadge';
import type { MentionBadgeLocation, MentionBadgeSize } from './MentionBadge';

const LOCATIONS: MentionBadgeLocation[] = [
  'Sidebar',
  'Menu Item',
  'Icon Button',
  'Channel',
];
const SIZES: MentionBadgeSize[] = ['Small', 'Medium', 'Large'];
const COUNTS = [1, 22, 100];

const meta = {
  title: 'Components/Status Indicators/Mention Badge',
  component: MentionBadge,
  tags: ['autodocs'],
  argTypes: {
    location: { control: 'select', options: LOCATIONS },
    size: { control: 'select', options: SIZES },
  },
} satisfies Meta<typeof MentionBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

function Row({
  children,
  inverted = false,
  label,
}: {
  children: ReactNode;
  inverted?: boolean;
  label: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        alignItems: 'center',
        padding: inverted ? 12 : 0,
        borderRadius: inverted ? 8 : 0,
        background: inverted ? 'var(--sidebar-header-bg)' : 'transparent',
      }}
    >
      <span
        style={{
          width: 136,
          fontSize: 12,
          color: inverted
            ? 'var(--sidebar-text)'
            : 'var(--center-channel-color)',
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

export const Default: Story = {
  args: {
    count: 22,
    location: 'Sidebar',
    size: 'Small',
  },
  decorators: [
    (Story) => (
      <div
        style={{
          display: 'inline-flex',
          padding: 12,
          borderRadius: 8,
          background: 'var(--sidebar-header-bg)',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export const Overflow: Story = {
  args: {
    count: 100,
    location: 'Channel',
    size: 'Medium',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {SIZES.map((size) => (
        <Row key={size} label={`Sidebar ${size}`} inverted>
          {COUNTS.map((count) => (
            <MentionBadge
              key={count}
              count={count}
              location="Sidebar"
              size={size}
            />
          ))}
        </Row>
      ))}
      {LOCATIONS.filter((location) => location !== 'Sidebar').map(
        (location) => (
          <Row key={location} label={location}>
            {SIZES.map((size) => (
              <MentionBadge
                key={size}
                count={size === 'Small' ? 1 : size === 'Medium' ? 22 : 100}
                location={location}
                size={size}
              />
            ))}
          </Row>
        ),
      )}
    </div>
  ),
};
