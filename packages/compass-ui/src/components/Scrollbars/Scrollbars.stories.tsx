import type { Meta, StoryObj } from '@storybook/react';
import Scrollbars from './Scrollbars';

const ITEMS = Array.from({ length: 24 }, (_, i) => i + 1);

const meta = {
  title: 'Components/Layout and Containers/Scrollbars',
  component: Scrollbars,
  tags: ['autodocs'],
} satisfies Meta<typeof Scrollbars>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div
      style={{
        width: 280,
        height: 200,
        border: '1px solid rgba(var(--center-channel-color-rgb), 0.16)',
        borderRadius: 'var(--radius-s)',
        background: 'var(--center-channel-bg)',
      }}
    >
      <Scrollbars>
        <ul
          style={{
            margin: 0,
            padding: 'var(--spacing-s) var(--spacing-m)',
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-xs)',
            color: 'var(--center-channel-color)',
            fontSize: 'var(--font-size-100)',
            lineHeight: 'var(--line-height-100)',
          }}
        >
          {ITEMS.map((n) => (
            <li key={n}>Item {n}</li>
          ))}
        </ul>
      </Scrollbars>
    </div>
  ),
};

export const SidebarSurface: Story = {
  render: () => (
    <div
      style={{
        width: 240,
        height: 180,
        borderRadius: 'var(--radius-s)',
        background: 'var(--sidebar-header-bg)',
      }}
    >
      <Scrollbars color="--sidebar-text-rgb">
        <ul
          style={{
            margin: 0,
            padding: 'var(--spacing-s) var(--spacing-m)',
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-xs)',
            color: 'var(--sidebar-text)',
            fontSize: 'var(--font-size-100)',
          }}
        >
          {ITEMS.map((n) => (
            <li key={n}>Channel item {n}</li>
          ))}
        </ul>
      </Scrollbars>
    </div>
  ),
};
