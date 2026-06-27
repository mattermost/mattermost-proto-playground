import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import BellOutlineIcon from '@mattermost/compass-icons/components/bell-outline';
import EmoticonHappyOutlineIcon from '@mattermost/compass-icons/components/emoticon-happy-outline';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import StarOutlineIcon from '@mattermost/compass-icons/components/star-outline';
import AppBarItem from './AppBarItem';
import type { AppBarItemState } from './AppBarItem';

const sidebarSurface = {
  padding: 16,
  borderRadius: 8,
  background: 'var(--sidebar-header-bg)',
} as const;

const labelStyle = {
  width: '100%',
  fontSize: 12,
  color: 'var(--sidebar-text)',
  marginBottom: 8,
} as const;

const STATES: AppBarItemState[] = ['Default', 'Selected'];

const meta = {
  title: 'Components/Navigation/App Bar Item',
  component: AppBarItem,
  tags: ['autodocs'],
  argTypes: {
    state: { control: 'select', options: STATES },
  },
} satisfies Meta<typeof AppBarItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: <EmoticonHappyOutlineIcon size={20} />,
    label: 'Emoji',
    state: 'Default',
    onClick: fn(),
  },
  decorators: [
    (Story) => (
      <div style={sidebarSurface}>
        <Story />
      </div>
    ),
  ],
};

export const Selected: Story = {
  args: {
    icon: <GlobeIcon size={20} />,
    label: 'Channels',
    state: 'Selected',
    onClick: fn(),
  },
  decorators: [
    (Story) => (
      <div style={sidebarSurface}>
        <Story />
      </div>
    ),
  ],
};

export const WithMentionBadge: Story = {
  args: {
    icon: <BellOutlineIcon size={20} />,
    label: 'Notifications',
    mentionBadge: 3,
    onClick: fn(),
  },
  decorators: [
    (Story) => (
      <div style={sidebarSurface}>
        <Story />
      </div>
    ),
  ],
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ ...sidebarSurface, display: 'grid', gap: 24 }}>
      <section>
        <span style={labelStyle}>States</span>
        <div style={{ display: 'flex', gap: 12 }}>
          <AppBarItem
            icon={<EmoticonHappyOutlineIcon size={20} />}
            label="Emoji"
            state="Default"
            onClick={fn()}
          />
          <AppBarItem
            icon={<GlobeIcon size={20} />}
            label="Channels"
            state="Selected"
            onClick={fn()}
          />
        </div>
      </section>
      <section>
        <span style={labelStyle}>Badges</span>
        <div style={{ display: 'flex', gap: 12 }}>
          <AppBarItem
            icon={<BellOutlineIcon size={20} />}
            label="Notifications"
            mentionBadge={3}
            onClick={fn()}
          />
          <AppBarItem
            icon={<StarOutlineIcon size={20} />}
            label="Favorites"
            unreadBadge
            onClick={fn()}
          />
        </div>
      </section>
    </div>
  ),
};
