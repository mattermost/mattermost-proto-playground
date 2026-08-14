import type { Meta, StoryObj } from '@storybook/react';
import {
  AnimationDurationsContent,
  AnimationEasingsContent,
} from '@/guidelines/foundations/animation/animation.specimen';

const meta = {
  title: 'Foundations/Style/Animation',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Duration and easing tokens for motion.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Durations: Story = {
  render: () => <AnimationDurationsContent />,
};

export const Easings: Story = {
  render: () => <AnimationEasingsContent />,
};
