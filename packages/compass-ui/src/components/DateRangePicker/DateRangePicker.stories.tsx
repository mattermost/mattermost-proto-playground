import type { Meta, StoryObj } from '@storybook/react';
import DateRangePicker from './DateRangePicker';

const meta = {
  title: 'Components/Forms and Input/Date Range Picker',
  component: DateRangePicker,
  tags: ['autodocs'],
  argTypes: {
    mode: { control: 'select', options: ['date', 'range'] },
  },
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleDate: Story = {
  args: {
    mode: 'date',
  },
};

export const DateRange: Story = {
  args: {
    mode: 'range',
  },
};
