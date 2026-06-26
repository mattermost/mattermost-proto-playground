import type { Meta, StoryObj } from '@storybook/react';
import Specimen from '@/guidelines/foundations/animation/animation.specimen';

const meta = {
  title: 'Foundations/Style/Animation',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Docs: Story = {
  render: () => <Specimen />,
};
