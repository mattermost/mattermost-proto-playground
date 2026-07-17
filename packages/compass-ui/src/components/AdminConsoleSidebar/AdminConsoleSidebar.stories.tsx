import type { Meta, StoryObj } from '@storybook/react';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import AdminConsoleSidebar from './AdminConsoleSidebar';

const meta = {
  title: 'Patterns/Admin Console/Admin Console Sidebar',
  component: AdminConsoleSidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof AdminConsoleSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    avatarSrc: avatarLeonard,
    avatarAlt: 'Leonard Riley',
    userDisplayName: 'Leonard Riley',
    userHandle: '@leonard.riley',
  },
};

export const WithoutAvatar: Story = {
  args: {
    userDisplayName: 'Leonard Riley',
    userHandle: '@leonard.riley',
  },
};

export const CustomTitle: Story = {
  args: {
    consoleTitle: 'System Console',
    avatarSrc: avatarLeonard,
    avatarAlt: 'Leonard Riley',
    userDisplayName: 'Leonard Riley',
    userHandle: '@leonard.riley',
  },
};
