import { useEffect, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Scrollbar from './Scrollbar';

const ITEMS = Array.from({ length: 24 }, (_, i) => i + 1);

const listStyle = {
  margin: 0,
  padding: 'var(--spacing-s) var(--spacing-m)',
  listStyle: 'none',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 'var(--spacing-xs)',
  color: 'var(--center-channel-color)',
  fontSize: 'var(--font-size-100)',
  lineHeight: 'var(--line-height-100)',
};

const scrollShellStyle = {
  width: 280,
  height: 200,
  display: 'flex',
  flexDirection: 'column' as const,
  minHeight: 0,
  overflow: 'hidden',
  border: '1px solid rgba(var(--center-channel-color-rgb), 0.16)',
  borderRadius: 'var(--radius-s)',
  background: 'var(--center-channel-bg)',
};

function ScrollList({
  scrollPercent = 0,
  color,
}: {
  scrollPercent?: number;
  color?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    const maxScroll = node.scrollHeight - node.clientHeight;
    node.scrollTop = (scrollPercent / 100) * maxScroll;
  }, [scrollPercent]);

  return (
    <Scrollbar ref={ref} alwaysVisible color={color}>
      <ul style={listStyle}>
        {ITEMS.map((n) => (
          <li key={n}>Item {n}</li>
        ))}
      </ul>
    </Scrollbar>
  );
}

const meta = {
  title: 'Components/Layout and Containers/Scrollbar',
  component: Scrollbar,
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'text' },
    alwaysVisible: { control: 'boolean' },
  },
} satisfies Meta<typeof Scrollbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    alwaysVisible: true,
  },
  render: ({ alwaysVisible, color }) => (
    <div style={scrollShellStyle}>
      <Scrollbar alwaysVisible={alwaysVisible} color={color}>
        <ul style={listStyle}>
          {ITEMS.map((n) => (
            <li key={n}>Item {n}</li>
          ))}
        </ul>
      </Scrollbar>
    </div>
  ),
};

export const SidebarSurface: Story = {
  render: () => (
    <div
      style={{
        width: 240,
        height: 180,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
        borderRadius: 'var(--radius-s)',
        background: 'var(--sidebar-header-bg)',
      }}
    >
      <Scrollbar alwaysVisible color="--sidebar-text-rgb">
        <ul
          style={{
            ...listStyle,
            color: 'var(--sidebar-text)',
          }}
        >
          {ITEMS.map((n) => (
            <li key={n}>Channel item {n}</li>
          ))}
        </ul>
      </Scrollbar>
    </div>
  ),
};

export const ScrollPositions: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: 'var(--spacing-m)',
      }}
    >
      {[0, 50, 100].map((scrollPercent) => (
        <div key={scrollPercent} style={{ ...scrollShellStyle, height: 160 }}>
          <ScrollList scrollPercent={scrollPercent} />
        </div>
      ))}
    </div>
  ),
};

export const AutoHide: Story = {
  render: () => (
    <div style={scrollShellStyle}>
      <Scrollbar>
        <ul style={listStyle}>
          {ITEMS.map((n) => (
            <li key={n}>Item {n}</li>
          ))}
        </ul>
      </Scrollbar>
    </div>
  ),
};
