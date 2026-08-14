import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import Select from './Select';
import type { SelectSize } from './Select';
import Icon from '../Icon/Icon';

const SIZES: SelectSize[] = ['Small', 'Medium', 'Large'];

const meta = {
  title: 'Components/Forms and Input/Select',
  component: Select,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: SIZES },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

function renderOptions() {
  return (
    <>
      <option value="">Select...</option>
      <option value="a">Option A</option>
      <option value="b">Option B</option>
      <option value="c">Option C</option>
    </>
  );
}

const defaultOptions = (
  <>
    <option value="">Select...</option>
    <option value="a">Option A</option>
    <option value="b">Option B</option>
    <option value="c">Option C</option>
  </>
);

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
    children: defaultOptions,
  },
};

export const WithValue: Story = {
  args: {
    label: 'Selected option',
    defaultValue: 'b',
    children: defaultOptions,
  },
};

export const WithLeadingIcon: Story = {
  args: {
    label: 'Workspace',
    leadingIcon: <Icon glyph={<GlobeIcon />} size="16" />,
    children: defaultOptions,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 20 }}>
      <Row label="Sizes">
        {SIZES.map((size) => (
          <Select key={size} size={size} label={size}>
            {renderOptions()}
          </Select>
        ))}
      </Row>
      <Row label="States">
        <Select label="With value" defaultValue="b">
          {renderOptions()}
        </Select>
        <Select label="Invalid" invalid defaultValue="">
          {renderOptions()}
        </Select>
        <Select label="Disabled" disabled defaultValue="">
          {renderOptions()}
        </Select>
      </Row>
      <Row label="Leading icon">
        <Select
          label="Workspace"
          leadingIcon={<Icon glyph={<GlobeIcon />} size="16" />}
        >
          {renderOptions()}
        </Select>
        <Select
          label="Selected workspace"
          defaultValue="a"
          leadingIcon={<Icon glyph={<GlobeIcon />} size="16" />}
        >
          {renderOptions()}
        </Select>
      </Row>
    </div>
  ),
};
