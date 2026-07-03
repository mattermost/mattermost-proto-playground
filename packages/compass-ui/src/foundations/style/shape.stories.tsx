import type { Meta, StoryObj } from '@storybook/react';
import { ShapeRadiiContent } from '@/guidelines/foundations/shape/shape.specimen';

const meta = {
  title: 'Foundations/Style/Shape',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Corner radius tokens for controls and containers.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Radii: Story = {
  render: () => <ShapeRadiiContent />,
};
