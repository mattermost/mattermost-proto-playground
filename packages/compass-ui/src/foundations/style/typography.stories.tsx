import type { Meta, StoryObj } from '@storybook/react';
import {
  TypographyBodyScaleContent,
  TypographyFontStackContent,
  TypographyHeadingScaleContent,
  TypographyMarginsContent,
  TypographyScaleContent,
  TypographyWeightsContent,
} from '@/guidelines/foundations/typography/typography.specimen';

const meta = {
  title: 'Foundations/Style/Typography',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Font families, type scale, weights, and default margins.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const FontStack: Story = {
  render: () => <TypographyFontStackContent />,
};

export const Scale: Story = {
  render: () => <TypographyScaleContent />,
};

export const HeadingScale: Story = {
  render: () => <TypographyHeadingScaleContent />,
};

export const BodyScale: Story = {
  render: () => <TypographyBodyScaleContent />,
};

export const Weights: Story = {
  render: () => <TypographyWeightsContent />,
};

export const Margins: Story = {
  render: () => <TypographyMarginsContent />,
};
