import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import PermalinkPreview from './PermalinkPreview';

const meta = {
  title: 'Components/Cards and Previews/Permalink Preview',
  component: PermalinkPreview,
  tags: ['autodocs'],
} satisfies Meta<typeof PermalinkPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    avatarSrc: avatarLeonard,
    onDismiss: fn(),
  },
};
