import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import SearchTipBanner from './SearchTipBanner';

const meta = {
  title: 'Components/Banners/Search Tip Banner',
  component: SearchTipBanner,
  tags: ['autodocs'],
} satisfies Meta<typeof SearchTipBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onDismiss: fn(),
  },
};

export const CustomKeys: Story = {
  args: {
    prefix: 'Tip: Use',
    suffix: 'to open quick switcher',
    shortcutKeys: [{ label: '⌘' }, { label: 'K' }],
    onDismiss: fn(),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 12,
      }}
    >
      <SearchTipBanner onDismiss={fn()} />
      <SearchTipBanner
        prefix="Tip: Use"
        suffix="to open quick switcher"
        shortcutKeys={[{ label: '⌘' }, { label: 'K' }]}
        onDismiss={fn()}
      />
    </div>
  ),
};
