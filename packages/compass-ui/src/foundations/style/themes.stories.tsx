import type { Meta, StoryObj } from '@storybook/react';
import { ThemeTokensContent } from '@/guidelines/foundations/themes/themes.specimen';

const meta = {
  title: 'Foundations/Style/Themes',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Role-based theme tokens across every built-in Compass theme.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const ThemeTokens: Story = {
  render: () => <ThemeTokensContent />,
};
