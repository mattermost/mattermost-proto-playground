import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { fn } from '@storybook/test';
import Tabs from './Tabs';
import type { TabItem } from './Tabs';

const TABS: TabItem[] = [
  { key: 'messages', label: 'Messages' },
  { key: 'files', label: 'Files', countBadge: 12 },
  { key: 'pinned', label: 'Pinned', unreadBadge: true },
  { key: 'members', label: 'Members' },
];

const meta = {
  title: 'Components/Layout and Containers/Tabs',
  component: Tabs,
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function Render() {
    const [activeKey, setActiveKey] = useState('messages');
    return (
      <Tabs tabs={TABS} activeKey={activeKey} onChange={setActiveKey} />
    );
  },
};

export const Static: Story = {
  args: {
    tabs: TABS,
    activeKey: 'messages',
    onChange: fn(),
  },
};

export const WithControls: Story = {
  render: function Render() {
    const [activeKey, setActiveKey] = useState('files');
    return (
      <Tabs
        tabs={TABS}
        activeKey={activeKey}
        onChange={setActiveKey}
        controls={
          <button
            type="button"
            style={{
              fontSize: 'var(--font-size-75)',
              color: 'var(--center-channel-color)',
            }}
          >
            Filter
          </button>
        }
      />
    );
  },
};
