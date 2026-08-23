import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import BellOffOutlineIcon from '@mattermost/compass-icons/components/bell-off-outline';
import BellOutlineIcon from '@mattermost/compass-icons/components/bell-outline';
import EmoticonHappyOutlineIcon from '@mattermost/compass-icons/components/emoticon-happy-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import StarIcon from '@mattermost/compass-icons/components/star';
import StarOutlineIcon from '@mattermost/compass-icons/components/star-outline';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import ActionButton from './ActionButton';
import type { ActionButtonProps } from './ActionButton';
import { iconSelectArgType, resolveStoryIcon } from '../../storybook/icons';

type ActionButtonStoryArgs = Omit<ActionButtonProps, 'icon'> & {
  icon: string;
};

const meta = {
  title: 'Components/Actions/Action Button',
  component: ActionButton,
  tags: ['autodocs'],
  argTypes: {
    icon: iconSelectArgType({
      description: 'Action icon glyph from @mattermost/compass-icons.',
    }),
  },
  args: {
    icon: 'emoticon-happy-outline',
  },
  render: ({ icon, ...rest }) => (
    <ActionButton
      {...rest}
      icon={resolveStoryIcon(icon, { glyphSize: 20 }) as ReactNode}
    />
  ),
} satisfies Meta<ActionButtonStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

function Row({ label, children }: { label: string; children: ReactNode }) {
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
    label: 'Action',
    'aria-label': 'Action',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 20 }}>
      <Row label="Default">
        <ActionButton
          icon={<EmoticonHappyOutlineIcon size={20} />}
          label="Action"
          aria-label="Action"
        />
        <ActionButton
          icon={<StarOutlineIcon size={20} />}
          label="Favorite"
          aria-label="Favorite"
        />
        <ActionButton
          icon={<BellOutlineIcon size={20} />}
          label="Mute"
          aria-label="Mute"
        />
        <ActionButton
          icon={<LinkVariantIcon size={20} />}
          label="Copy Link"
          aria-label="Copy link"
        />
      </Row>
      <Row label="Active">
        <ActionButton
          icon={<EmoticonHappyOutlineIcon size={20} />}
          label="Action"
          aria-label="Action"
          active
        />
        <ActionButton
          icon={<StarIcon size={20} />}
          label="Favorited"
          aria-label="Favorited"
          active
        />
        <ActionButton
          icon={<BellOffOutlineIcon size={20} />}
          label="Muted"
          aria-label="Muted"
          active
        />
      </Row>
      <Row label="Destructive">
        <ActionButton
          icon={<TrashCanOutlineIcon size={20} />}
          label="Delete"
          aria-label="Delete"
          destructive
        />
      </Row>
      <Row label="Disabled">
        <ActionButton
          icon={<EmoticonHappyOutlineIcon size={20} />}
          label="Action"
          aria-label="Action"
          disabled
        />
      </Row>
    </div>
  ),
};
