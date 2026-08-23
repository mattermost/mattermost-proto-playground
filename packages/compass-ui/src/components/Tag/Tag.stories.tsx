import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import Tag from './Tag';
import type { TagCasing, TagProps, TagSize, TagType } from './Tag';
import {
  ICON_NONE,
  iconSelectArgType,
  resolveStoryIcon,
} from '../../storybook/icons';

const TYPES: TagType[] = [
  'Default',
  'Info',
  'Info Dim',
  'Danger',
  'Success',
  'Warning',
];
const SIZES: TagSize[] = ['X-Small', 'Small'];
const CASINGS: TagCasing[] = ['Title Case', 'All Caps'];

type TagStoryArgs = Omit<TagProps, 'leadingIcon'> & {
  leadingIcon?: string;
};

const meta = {
  title: 'Components/Status Indicators/Tag',
  component: Tag,
  tags: ['autodocs'],
  argTypes: {
    casing: { control: 'select', options: CASINGS },
    size: { control: 'select', options: SIZES },
    type: { control: 'select', options: TYPES },
    leadingIcon: iconSelectArgType({ optional: true }),
  },
  args: {
    leadingIcon: ICON_NONE,
  },
  render: ({ leadingIcon, size = 'X-Small', ...rest }) => (
    <Tag
      {...rest}
      size={size}
      leadingIcon={
        resolveStoryIcon(leadingIcon, {
          glyphSize: size === 'Small' ? 12 : 10,
        }) as ReactNode
      }
    />
  ),
} satisfies Meta<TagStoryArgs>;

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
    label: 'Default',
    type: 'Default',
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Professional',
    casing: 'All Caps',
    leadingIcon: 'globe',
    type: 'Default',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {SIZES.map((size) => (
        <Row key={size} label={`Types / ${size}`}>
          {TYPES.map((type) => (
            <Tag key={type} label={type} type={type} size={size} />
          ))}
        </Row>
      ))}
      <Row label="All caps">
        {TYPES.map((type) => (
          <Tag key={type} label="Tag" type={type} casing="All Caps" />
        ))}
      </Row>
      <Row label="With icon">
        <Tag
          label="Professional"
          casing="All Caps"
          leadingIcon={<GlobeIcon size={10} />}
          type="Default"
        />
        <Tag
          label="Info"
          leadingIcon={<GlobeIcon size={10} />}
          type="Info"
        />
        <Tag
          label="Success"
          leadingIcon={<GlobeIcon size={12} />}
          size="Small"
          type="Success"
        />
      </Row>
    </div>
  ),
};
