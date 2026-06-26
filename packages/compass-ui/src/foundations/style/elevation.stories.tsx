import type { Meta, StoryObj } from '@storybook/react';
import Specimen from '@/guidelines/foundations/elevation/elevation.specimen';

const meta = {
  title: 'Foundations/Style/Elevation',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Docs: Story = {
  render: () => <Specimen />,
};
