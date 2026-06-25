import type { Meta, StoryObj } from '@storybook/react';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import IconButton from './IconButton';
import Icon from '../Icon/Icon';

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
  tags: ['autodocs'],
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    'aria-label': 'Open menu',
    icon: <Icon size="16" glyph={<GlobeIcon />} />,
    size: 'Medium',
    style: 'Default',
  },
};

export const Inverted: Story = {
  args: {
    'aria-label': 'Open menu',
    icon: <Icon size="16" glyph={<GlobeIcon />} />,
    size: 'Medium',
    style: 'Inverted',
  },
  decorators: [
    (Story) => (
      <div
        style={{
          padding: 16,
          borderRadius: 8,
          background: 'var(--color-sidebar-bg)',
        }}
      >
        <Story />
      </div>
    ),
  ],
};
