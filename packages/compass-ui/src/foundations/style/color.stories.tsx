import type { Meta, StoryObj } from '@storybook/react';
import { ColorPalettesContent } from '@/guidelines/foundations/color/color.specimen';

const meta = {
  title: 'Foundations/Style/Color',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Palette tokens for brand, semantic, and neutral colors.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Palettes: Story = {
  render: () => <ColorPalettesContent />,
};
