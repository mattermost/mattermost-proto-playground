import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import Icon from './Icon';
import type { IconProps, IconSize } from './Icon';
import {
  ICON_DEFAULT,
  iconSelectArgType,
  resolveStoryIcon,
} from '../../storybook/icons';

const SIZES: IconSize[] = [
  '10',
  '12',
  '16',
  '20',
  '24',
  '28',
  '32',
  '40',
  '52',
  '64',
  '104',
];

type IconStoryArgs = Omit<IconProps, 'glyph'> & {
  glyph?: string;
};

const meta = {
  title: 'Components/Images and Icons/Icon',
  component: Icon,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: SIZES },
    glyph: iconSelectArgType({
      includeDefault: true,
      description:
        'Glyph from @mattermost/compass-icons. Default uses emoticon-happy-outline.',
    }),
  },
  args: {
    glyph: 'globe',
    size: '24',
  },
  render: ({ glyph, ...rest }) => (
    <Icon
      {...rest}
      glyph={
        glyph === ICON_DEFAULT
          ? undefined
          : (resolveStoryIcon(glyph) as ReactNode)
      }
    />
  ),
} satisfies Meta<IconStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllSizes: Story = {
  render: () => (
    <div
      style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'end' }}
    >
      {SIZES.map((size) => (
        <div
          key={size}
          style={{
            display: 'grid',
            gap: 8,
            justifyItems: 'center',
            color: 'var(--center-channel-color)',
            fontSize: 12,
          }}
        >
          <Icon glyph={<GlobeIcon />} size={size} />
          <span>{size}</span>
        </div>
      ))}
    </div>
  ),
};
