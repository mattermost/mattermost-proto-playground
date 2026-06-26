import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import LabelTag from './LabelTag';
import type { LabelTagCasing, LabelTagSize, LabelTagType } from './LabelTag';

const TYPES: LabelTagType[] = [
  'Default',
  'Info',
  'Info Dim',
  'Danger',
  'Success',
  'Warning',
];
const SIZES: LabelTagSize[] = ['X-Small', 'Small'];
const CASINGS: LabelTagCasing[] = ['Title Case', 'All Caps'];

const meta = {
  title: 'Components/LabelTag',
  component: LabelTag,
  tags: ['autodocs'],
  argTypes: {
    casing: { control: 'select', options: CASINGS },
    size: { control: 'select', options: SIZES },
    type: { control: 'select', options: TYPES },
  },
} satisfies Meta<typeof LabelTag>;

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
    leadingIcon: <GlobeIcon size={10} />,
    type: 'Default',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      {SIZES.map((size) => (
        <Row key={size} label={`Types / ${size}`}>
          {TYPES.map((type) => (
            <LabelTag key={type} label={type} type={type} size={size} />
          ))}
        </Row>
      ))}
      <Row label="All caps">
        {TYPES.map((type) => (
          <LabelTag key={type} label="Tag" type={type} casing="All Caps" />
        ))}
      </Row>
      <Row label="With icon">
        <LabelTag
          label="Professional"
          casing="All Caps"
          leadingIcon={<GlobeIcon size={10} />}
          type="Default"
        />
        <LabelTag
          label="Info"
          leadingIcon={<GlobeIcon size={10} />}
          type="Info"
        />
        <LabelTag
          label="Success"
          leadingIcon={<GlobeIcon size={12} />}
          size="Small"
          type="Success"
        />
      </Row>
    </div>
  ),
};
