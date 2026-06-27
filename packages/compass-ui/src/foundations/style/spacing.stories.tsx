import type { Meta, StoryObj } from '@storybook/react';
import { SpacingScaleContent } from '@/guidelines/foundations/spacing/spacing.specimen';

const meta = {
  title: 'Foundations/Style/Spacing',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Spacing scale tokens for gaps, margins, and padding.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Scale: Story = {
  render: () => <SpacingScaleContent />,
};
