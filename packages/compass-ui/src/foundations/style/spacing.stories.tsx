import type { Meta, StoryObj } from '@storybook/react';
import Specimen from '@/guidelines/foundations/spacing/spacing.specimen';

const meta = {
  title: 'Foundations/Style/Spacing',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Docs: Story = {
  render: () => <Specimen />,
};
