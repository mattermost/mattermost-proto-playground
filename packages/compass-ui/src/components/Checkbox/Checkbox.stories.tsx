import type { Meta, StoryObj } from '@storybook/react';
import Checkbox from './Checkbox';
import type { CheckboxSize } from './Checkbox';

const SIZES: CheckboxSize[] = ['Small', 'Medium', 'Large'];

const meta = {
  title: 'Components/Forms and Input/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: SIZES },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {
  args: {
    children: 'Remember me',
    checked: false,
  },
};

export const Checked: Story = {
  args: {
    children: 'Remember me',
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Unavailable option',
    checked: false,
    disabled: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 20 }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
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
          States
        </span>
        <Checkbox size="Medium">Unchecked</Checkbox>
        <Checkbox size="Medium" defaultChecked>
          Checked
        </Checkbox>
        <Checkbox size="Medium" indeterminate>
          Indeterminate
        </Checkbox>
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
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
          Sizes
        </span>
        {SIZES.map((size) => (
          <Checkbox key={size} size={size} defaultChecked={size !== 'Small'}>
            {size}
          </Checkbox>
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
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
          Invalid
        </span>
        <Checkbox size="Medium" valid={false}>
          Unchecked invalid
        </Checkbox>
        <Checkbox size="Medium" defaultChecked valid={false}>
          Checked invalid
        </Checkbox>
        <Checkbox size="Medium" indeterminate valid={false}>
          Indeterminate invalid
        </Checkbox>
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
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
          Disabled
        </span>
        <Checkbox size="Medium" disabled>
          Disabled unchecked
        </Checkbox>
        <Checkbox size="Medium" defaultChecked disabled>
          Disabled checked
        </Checkbox>
        <Checkbox size="Medium" indeterminate disabled>
          Disabled indeterminate
        </Checkbox>
      </div>
    </div>
  ),
};
