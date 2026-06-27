import type { Meta, StoryObj } from '@storybook/react';
import { IconographyGridContent } from '@/guidelines/foundations/iconography/iconography.specimen';

const meta = {
  title: 'Foundations/Style/Iconography',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Compass Icons glyph reference.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const IconGrid: Story = {
  render: () => <IconographyGridContent />,
};
