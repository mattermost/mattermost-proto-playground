import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import Select from './Select';
import type { SelectOption, SelectProps, SelectSize } from './Select';
import Icon from '../Icon/Icon';
import {
  ICON_NONE,
  iconSelectArgType,
  resolveStoryIcon,
} from '../../storybook/icons';

const SIZES: SelectSize[] = ['Small', 'Medium', 'Large'];

const DEFAULT_OPTIONS: SelectOption[] = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C' },
];

const LONG_LABEL_OPTIONS: SelectOption[] = [
  {
    value: 'a',
    label: 'A very long option label that should truncate within the menu width',
  },
  { value: 'b', label: 'Option B' },
];

type SelectStoryArgs = Omit<SelectProps, 'leadingIcon'> & {
  leadingIcon?: string;
};

const meta = {
  title: 'Components/Forms and Input/Select',
  component: Select,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: SIZES },
    leadingIcon: iconSelectArgType({ optional: true }),
  },
  args: {
    leadingIcon: ICON_NONE,
  },
  render: ({ leadingIcon, ...rest }) => (
    <Select
      {...rest}
      leadingIcon={
        resolveStoryIcon(leadingIcon, { wrapSize: '16' }) as ReactNode
      }
    />
  ),
} satisfies Meta<SelectStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
        alignItems: 'flex-start',
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
    label: 'Select option',
    size: 'Medium',
    options: DEFAULT_OPTIONS,
    defaultValue: '',
    placeholder: 'Select...',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Selected option',
    defaultValue: 'b',
    options: DEFAULT_OPTIONS,
    placeholder: 'Select...',
  },
};

export const WithLeadingIcon: Story = {
  args: {
    label: 'Workspace',
    leadingIcon: 'globe',
    options: DEFAULT_OPTIONS,
    placeholder: 'Select...',
  },
};

export const NarrowField: Story = {
  render: () => (
    <div style={{ width: 200 }}>
      <Select
        label="Team"
        options={LONG_LABEL_OPTIONS}
        defaultValue="a"
        placeholder="Select…"
      />
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 20 }}>
      <Row label="Sizes">
        {SIZES.map((size) => (
          <Select
            key={size}
            size={size}
            label={size}
            options={DEFAULT_OPTIONS}
            placeholder="Select..."
          />
        ))}
      </Row>
      <Row label="States">
        <Select
          label="With value"
          defaultValue="b"
          options={DEFAULT_OPTIONS}
          placeholder="Select..."
        />
        <Select
          label="Invalid"
          invalid
          defaultValue=""
          options={DEFAULT_OPTIONS}
          placeholder="Select..."
        />
        <Select
          label="Disabled"
          disabled
          defaultValue=""
          options={DEFAULT_OPTIONS}
          placeholder="Select..."
        />
      </Row>
      <Row label="Leading icon">
        <Select
          label="Workspace"
          leadingIcon={<Icon glyph={<GlobeIcon />} size="16" />}
          options={DEFAULT_OPTIONS}
          placeholder="Select..."
        />
        <Select
          label="Selected workspace"
          defaultValue="a"
          leadingIcon={<Icon glyph={<GlobeIcon />} size="16" />}
          options={DEFAULT_OPTIONS}
          placeholder="Select..."
        />
      </Row>
    </div>
  ),
};
