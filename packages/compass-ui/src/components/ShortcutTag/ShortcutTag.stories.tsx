import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ShortcutTag, { ShortcutTagGroup } from './ShortcutTag';
import type { ShortcutTagLocation, ShortcutTagSize } from './ShortcutTag';

const SIZES: ShortcutTagSize[] = ['Small', 'Medium', 'Large'];
const LOCATIONS: ShortcutTagLocation[] = ['Default', 'Tooltips'];

const meta = {
  title: 'Components/Status Indicators/Shortcut Tag',
  component: ShortcutTag,
  tags: ['autodocs'],
  argTypes: {
    location: { control: 'select', options: LOCATIONS },
    size: { control: 'select', options: SIZES },
  },
} satisfies Meta<typeof ShortcutTag>;

export default meta;
type Story = StoryObj<typeof meta>;

function Row({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        alignItems: 'center',
      }}
    >
      <span
        style={{
          width: 112,
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
    label: '⌘',
    location: 'Default',
    size: 'Small',
  },
};

export const ShortcutSequence: Story = {
  render: () => <ShortcutTagGroup labels={['⌘', 'K']} />,
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {LOCATIONS.map((location) => (
        <div
          key={location}
          style={{
            display: 'grid',
            gap: 12,
            padding: location === 'Tooltips' ? 16 : 0,
            borderRadius: location === 'Tooltips' ? 8 : undefined,
            backgroundColor:
              location === 'Tooltips'
                ? 'var(--color-neutral-1100, #1b1d22)'
                : undefined,
          }}
        >
          {SIZES.map((size) => (
            <Row key={size} label={`${location} / ${size}`}>
              <ShortcutTag label="⌘" location={location} size={size} />
              <ShortcutTag label="Shift" location={location} size={size} />
              <ShortcutTag label="K" location={location} size={size} />
            </Row>
          ))}
        </div>
      ))}
    </div>
  ),
};
