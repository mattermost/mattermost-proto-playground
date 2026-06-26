import type { Meta, StoryObj } from '@storybook/react';
import Specimen from '@/guidelines/foundations/iconography/iconography.specimen';

const meta = {
  title: 'Foundations/Style/Iconography',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Docs: Story = {
  render: () => <Specimen />,
};
