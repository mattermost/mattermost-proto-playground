import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import MoreUnreadsBanner from './MoreUnreadsBanner';
import type {
  MoreUnreadsBannerDirection,
  MoreUnreadsBannerSize,
} from './MoreUnreadsBanner';

const DIRECTIONS: MoreUnreadsBannerDirection[] = ['Up', 'Down'];
const SIZES: MoreUnreadsBannerSize[] = ['Small', 'Medium', 'Large'];

const meta = {
  title: 'Components/Banners/More Unreads Banner',
  component: MoreUnreadsBanner,
  tags: ['autodocs'],
  argTypes: {
    direction: { control: 'select', options: DIRECTIONS },
    size: { control: 'select', options: SIZES },
  },
} satisfies Meta<typeof MoreUnreadsBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    direction: 'Up',
    size: 'Medium',
    onClick: fn(),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      <section>
        <h3
          style={{
            marginBottom: 12,
            fontSize: 12,
            color: 'var(--center-channel-color)',
          }}
        >
          Directions
        </h3>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <MoreUnreadsBanner direction="Up" onClick={fn()} />
          <MoreUnreadsBanner direction="Down" onClick={fn()} />
        </div>
      </section>
      <section>
        <h3
          style={{
            marginBottom: 12,
            fontSize: 12,
            color: 'var(--center-channel-color)',
          }}
        >
          Sizes
        </h3>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <MoreUnreadsBanner size="Small" onClick={fn()} />
          <MoreUnreadsBanner size="Medium" onClick={fn()} />
          <MoreUnreadsBanner size="Large" onClick={fn()} />
        </div>
      </section>
    </div>
  ),
};
