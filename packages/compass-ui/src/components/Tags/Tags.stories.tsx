import type { Meta, StoryObj } from '@storybook/react';
import Tags from './Tags';
import type { TagCasing, TagSize, TagType } from './Tags';

const TYPES: TagType[] = [
  'General',
  'Info',
  'Danger',
  'Success',
  'Warning',
  'Info Dim',
];

const SIZES: TagSize[] = ['X-Small', 'Small'];

const meta = {
  title: 'Components/Status Indicators/Tags',
  component: Tags,
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'select', options: TYPES },
    size: { control: 'select', options: SIZES },
    casing: {
      control: 'select',
      options: ['Title Case', 'All Caps'] satisfies TagCasing[],
    },
  },
} satisfies Meta<typeof Tags>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'General',
    type: 'General',
  },
};

export const Types: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      {TYPES.map((type) => (
        <Tags key={type} type={type}>
          {type}
        </Tags>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      {SIZES.map((size) => (
        <Tags key={size} size={size} type="Info">
          {size}
        </Tags>
      ))}
    </div>
  ),
};

export const AllCaps: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      <Tags type="General" casing="All Caps">
        professional
      </Tags>
      <Tags type="Success" casing="All Caps">
        active
      </Tags>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {TYPES.map((type) => (
          <Tags key={type} type={type}>
            {type}
          </Tags>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Tags size="X-Small" type="Info">
          X-Small
        </Tags>
        <Tags size="Small" type="Info">
          Small
        </Tags>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Tags type="General" casing="All Caps">
          professional
        </Tags>
        <Tags type="Success" casing="All Caps">
          active
        </Tags>
      </div>
    </div>
  ),
};
