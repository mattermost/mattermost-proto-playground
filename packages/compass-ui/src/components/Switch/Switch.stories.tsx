import type { Meta, StoryObj } from '@storybook/react';
import Switch from './Switch';
import type { SwitchSize } from './Switch';

const SIZES: SwitchSize[] = ['Small', 'Medium', 'Large'];

const meta = {
  title: 'Components/Forms and Input/Switch',
  component: Switch,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: SIZES },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Enable notifications',
    size: 'Medium',
  },
};

export const Checked: Story = {
  args: {
    children: 'Enable notifications',
    defaultChecked: true,
    size: 'Medium',
  },
};

export const WithSecondaryLabel: Story = {
  args: {
    children: 'Thread replies',
    secondaryLabel: 'Notify me about replies to threads I follow',
    size: 'Medium',
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
            width: 128,
            fontSize: 12,
            color: 'var(--center-channel-color)',
          }}
        >
          States
        </span>
        <Switch size="Medium">Unchecked</Switch>
        <Switch size="Medium" defaultChecked>
          Checked
        </Switch>
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
            width: 128,
            fontSize: 12,
            color: 'var(--center-channel-color)',
          }}
        >
          Sizes
        </span>
        {SIZES.map((size) => (
          <Switch key={size} size={size} defaultChecked={size !== 'Small'}>
            {size}
          </Switch>
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
            width: 128,
            fontSize: 12,
            color: 'var(--center-channel-color)',
          }}
        >
          Secondary label
        </span>
        <Switch size="Medium" secondaryLabel="Optional description text">
          Label
        </Switch>
        <Switch
          size="Medium"
          defaultChecked
          secondaryLabel="Optional description"
        >
          Label
        </Switch>
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
            width: 128,
            fontSize: 12,
            color: 'var(--center-channel-color)',
          }}
        >
          Semi-bold & disabled
        </span>
        <Switch size="Medium" semiBold>
          Semi-bold label
        </Switch>
        <Switch size="Medium" disabled>
          Disabled unchecked
        </Switch>
        <Switch size="Medium" defaultChecked disabled>
          Disabled checked
        </Switch>
      </div>
    </div>
  ),
};
