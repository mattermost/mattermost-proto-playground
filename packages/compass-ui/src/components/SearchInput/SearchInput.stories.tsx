import type { ChangeEvent, ReactNode } from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SearchInput from './SearchInput';
import type { SearchInputSize } from './SearchInput';

const SIZES: SearchInputSize[] = ['Small', 'Medium', 'Large'];

const meta = {
  title: 'Components/Forms and Input/Search Input',
  component: SearchInput,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: SIZES },
  },
} satisfies Meta<typeof SearchInput>;

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

function ClearableSearchInput() {
  const [value, setValue] = useState('release notes');

  return (
    <SearchInput
      label="Search"
      value={value}
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
      }}
      onClear={() => {
        setValue('');
      }}
    />
  );
}

export const Default: Story = {
  args: {
    placeholder: 'Search...',
    size: 'Medium',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Search channels',
    placeholder: 'Find a channel...',
  },
};

export const Clearable: Story = {
  render: () => <ClearableSearchInput />,
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 20 }}>
      <Row label="Sizes">
        {SIZES.map((size) => (
          <SearchInput
            key={size}
            size={size}
            placeholder={`${size} search...`}
          />
        ))}
      </Row>
      <Row label="Label">
        <SearchInput label="Search channels" placeholder="Find a channel..." />
        <SearchInput
          label="With value"
          defaultValue="release notes"
          onClear={() => {}}
        />
      </Row>
      <Row label="States">
        <SearchInput
          label="Disabled"
          disabled
          placeholder="Disabled search..."
        />
        <ClearableSearchInput />
      </Row>
    </div>
  ),
};
