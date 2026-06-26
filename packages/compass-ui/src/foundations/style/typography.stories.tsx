import type { Meta, StoryObj } from '@storybook/react';
import Specimen from '@/guidelines/foundations/typography/typography.specimen';

const meta = {
  title: 'Foundations/Style/Typography',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Docs: Story = {
  render: () => <Specimen />,
};
