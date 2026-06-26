import type { Meta, StoryObj } from '@storybook/react';
import Specimen from '@/guidelines/foundations/color/color.specimen';

const meta = {
  title: 'Foundations/Style/Color',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Docs: Story = {
  render: () => <Specimen />,
};
