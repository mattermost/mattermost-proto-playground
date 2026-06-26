import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import UnreadBadge from './UnreadBadge';
import type { UnreadBadgeContext, UnreadBadgeSize } from './UnreadBadge';

const SIZES: UnreadBadgeSize[] = ['6', '8'];
const CONTEXTS: UnreadBadgeContext[] = ['Team Icon', 'Icon Button'];

const meta = {
  title: 'Components/Status Indicators/Unread Badge',
  component: UnreadBadge,
  tags: ['autodocs'],
  argTypes: {
    context: { control: 'select', options: CONTEXTS },
    size: { control: 'select', options: SIZES },
  },
} satisfies Meta<typeof UnreadBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

function Row({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
        alignItems: 'center',
      }}
    >
      <span
        style={{
          width: 96,
          fontSize: 12,
          color: 'var(--center-channel-color)',
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
    context: 'Team Icon',
    size: '8',
  },
};

export const IconButtonContext: Story = {
  args: {
    context: 'Icon Button',
    size: '8',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <Row label="Sizes">
        {SIZES.map((size) => (
          <UnreadBadge key={size} size={size} context="Team Icon" />
        ))}
      </Row>
      <Row label="Contexts">
        {CONTEXTS.map((context) => (
          <UnreadBadge key={context} size="8" context={context} />
        ))}
      </Row>
    </div>
  ),
};
