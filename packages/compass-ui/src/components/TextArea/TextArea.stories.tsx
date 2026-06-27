import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import TextArea from './TextArea';
import type { TextAreaSize } from './TextArea';

const SIZES: TextAreaSize[] = ['Small', 'Medium', 'Large'];

const meta = {
  title: 'Components/Forms and Input/Text Area',
  component: TextArea,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: SIZES },
  },
} satisfies Meta<typeof TextArea>;

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
          width: 144,
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
    placeholder: 'Enter a description...',
    rows: 3,
    size: 'Medium',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Description',
    placeholder: 'Enter a description...',
    rows: 3,
  },
};

export const WithCounter: Story = {
  args: {
    label: 'Bio',
    placeholder: 'Write your bio...',
    maxLength: 200,
    showCharacterCount: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 20 }}>
      <Row label="Sizes">
        {SIZES.map((size) => (
          <TextArea key={size} size={size} placeholder={`${size}...`} />
        ))}
      </Row>
      <Row label="Label">
        <TextArea label="Description" placeholder="Enter a description..." />
        <TextArea
          label="With value"
          defaultValue="Some existing content here."
        />
      </Row>
      <Row label="Counter / invalid">
        <TextArea
          label="Bio"
          placeholder="Write your bio..."
          maxLength={200}
          showCharacterCount
        />
        <TextArea label="Error field" invalid placeholder="Required field" />
      </Row>
      <Row label="Disabled / read-only">
        <TextArea label="Disabled" disabled placeholder="Disabled" />
        <TextArea
          label="Read-only"
          readOnly
          defaultValue="Read only content."
        />
      </Row>
    </div>
  ),
};
