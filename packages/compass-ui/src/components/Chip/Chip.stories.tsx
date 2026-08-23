import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { fn } from '@storybook/test';
import EmoticonHappyOutlineIcon from '@mattermost/compass-icons/components/emoticon-happy-outline';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import Chip from './Chip';
import type { ChipProps, ChipSize } from './Chip';
import {
  ICON_NONE,
  iconSelectArgType,
  resolveStoryIcon,
} from '../../storybook/icons';

const SIZES: ChipSize[] = ['Small', 'Medium', 'Medium Compact', 'Large'];

type ChipStoryArgs = Omit<ChipProps, 'leadingIcon'> & {
  leadingIcon?: string;
};

const meta = {
  title: 'Components/Forms and Input/Chip',
  component: Chip,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: SIZES },
    leadingIcon: iconSelectArgType({
      optional: true,
      description:
        'Leading icon glyph. Chip wraps it in Icon at the size for the chip.',
    }),
  },
  args: {
    leadingIcon: ICON_NONE,
  },
  render: ({ leadingIcon, ...rest }) => (
    <Chip
      {...rest}
      leadingIcon={resolveStoryIcon(leadingIcon) as ReactNode}
    />
  ),
} satisfies Meta<ChipStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Label',
    size: 'Medium',
    onRemove: fn(),
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      {SIZES.map((size) => (
        <Chip key={size} size={size} onRemove={fn()}>
          Label
        </Chip>
      ))}
    </div>
  ),
};

export const WithLeadingIcon: Story = {
  args: {
    children: 'With icon',
    size: 'Medium',
    leadingIcon: 'emoticon-happy-outline',
    onRemove: fn(),
  },
};

export const WithLeadingAvatar: Story = {
  args: {
    children: 'Leonard Riley',
    size: 'Medium',
    leadingAvatar: { src: avatarLeonard, alt: 'Leonard Riley' },
    onRemove: fn(),
  },
};

export const Error: Story = {
  args: {
    children: 'Error',
    size: 'Medium',
    error: true,
    onRemove: fn(),
  },
};

export const Colored: Story = {
  args: {
    children: 'Colored',
    size: 'Medium',
    colored: true,
    onRemove: fn(),
  },
};

export const WithoutRemove: Story = {
  args: {
    children: 'Read only',
    size: 'Medium',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Chip size="Medium" onRemove={fn()}>
          Default
        </Chip>
        <Chip
          size="Medium"
          leadingIcon={<EmoticonHappyOutlineIcon size={12} />}
          onRemove={fn()}
        >
          With icon
        </Chip>
        <Chip
          size="Medium"
          leadingAvatar={{ src: avatarLeonard, alt: 'Leonard Riley' }}
          onRemove={fn()}
        >
          Leonard Riley
        </Chip>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Chip size="Medium" error onRemove={fn()}>
          Error
        </Chip>
        <Chip size="Medium" colored onRemove={fn()}>
          Colored
        </Chip>
        <Chip size="Medium">No remove</Chip>
      </div>
    </div>
  ),
};
