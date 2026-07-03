import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import SearchIllustration from '@/assets/illustrations/search.svg?react';
import EmptyState from './EmptyState';

const meta = {
  title: 'Components/Layout and Containers/Empty State',
  component: EmptyState,
  tags: ['autodocs'],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithIllustration: Story = {
  args: {
    illustration: {
      'aria-label': 'Search',
      width: '120px',
      height: '80px',
      children: <SearchIllustration />,
    },
    title: 'No results found',
    description:
      'Try adjusting your search or filters to find what you\'re looking for.',
    action: { children: 'Clear filters', onClick: fn() },
  },
};

export const TextOnly: Story = {
  args: {
    title: 'No messages yet',
    description: 'Be the first to start the conversation.',
  },
};

export const WithAction: Story = {
  args: {
    title: 'No saved messages',
    description: 'Messages you save will appear here.',
    action: { children: 'Browse channels', onClick: fn() },
  },
};
