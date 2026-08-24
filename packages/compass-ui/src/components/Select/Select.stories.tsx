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
    size: 'Medium',
    options: DEFAULT_OPTIONS,
    defaultValue: '',
    placeholder: 'Select...',
  },
};

export const WithLabel: Story = {
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
            options={DEFAULT_OPTIONS}
            placeholder={size}
          />
        ))}
      </Row>
      <Row label="Label">
        <Select
          label="Label"
          options={DEFAULT_OPTIONS}
          placeholder="Placeholder"
        />
        <Select options={DEFAULT_OPTIONS} placeholder="No label" />
        <Select
          label="With value"
          defaultValue="b"
          options={DEFAULT_OPTIONS}
          placeholder="Select..."
        />
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

const MANY_OPTIONS: SelectOption[] = Array.from({ length: 20 }, (_, i) => ({
  value: `opt-${i}`,
  label: `Option ${i + 1}`,
}));

export const PlacementNearBottom: Story = {
  render: () => (
    <div
      style={{
        minHeight: '120vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: 320 }}>
        <Select
          label="Near bottom of viewport"
          options={MANY_OPTIONS}
          placeholder="Opens above…"
        />
      </div>
    </div>
  ),
};

export const InsideOverflowClip: Story = {
  render: () => (
    <div
      style={{
        height: 180,
        overflow: 'hidden',
        border: '1px solid rgba(var(--center-channel-color-rgb), 0.16)',
        borderRadius: 8,
        padding: 16,
        maxWidth: 360,
      }}
    >
      <p
        style={{
          margin: '0 0 12px',
          fontSize: 12,
          color: 'var(--center-channel-color)',
        }}
      >
        Overflow hidden — menu portals out and stays visible.
      </p>
      <Select
        label="Clipped container"
        options={MANY_OPTIONS}
        placeholder="Select…"
      />
    </div>
  ),
};
