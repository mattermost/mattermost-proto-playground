import type { Meta, StoryObj } from '@storybook/react';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
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
  },
};

export const Custom: Story = {
  args: {
    authorName: 'Danielle Okoro',
    avatarSrc: avatarDanielle,
    timestamp: 'Yesterday at 3:22 PM',
    messageText:
      "The new design looks great! Let's move forward with this approach for the next sprint.",
    originalChannel: '~ux-design',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, maxWidth: 480 }}>
      <PermalinkPreview avatarSrc={avatarLeonard} />
      <PermalinkPreview
        authorName="Danielle Okoro"
        avatarSrc={avatarDanielle}
        timestamp="Yesterday at 3:22 PM"
        messageText="The new design looks great! Let's move forward with this approach for the next sprint."
        originalChannel="~ux-design"
      />
    </div>
  ),
};
