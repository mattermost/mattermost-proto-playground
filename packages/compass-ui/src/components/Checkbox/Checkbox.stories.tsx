import type { Meta, StoryObj } from '@storybook/react';
import Checkbox from './Checkbox';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
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
