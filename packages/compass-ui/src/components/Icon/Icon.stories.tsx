import type { Meta, StoryObj } from '@storybook/react';
import EmoticonHappyOutlineIcon from '@mattermost/compass-icons/components/emoticon-happy-outline';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import Icon from './Icon';
import type { IconSize } from './Icon';

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

const meta = {
  title: 'Components/Images and Icons/Icon',
  component: Icon,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: SIZES },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    glyph: <GlobeIcon />,
    size: '24',
  },
};

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

export const DefaultGlyph: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
      <Icon size="24" />
      <Icon glyph={<EmoticonHappyOutlineIcon />} size="32" />
    </div>
  ),
};
