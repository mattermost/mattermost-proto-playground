import type { Meta, StoryObj } from '@storybook/react';
import { ElevationScaleContent } from '@/guidelines/foundations/elevation/elevation.specimen';

const meta = {
  title: 'Foundations/Style/Elevation',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Shadow tokens for layered surfaces.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Scale: Story = {
  render: () => <ElevationScaleContent />,
};
