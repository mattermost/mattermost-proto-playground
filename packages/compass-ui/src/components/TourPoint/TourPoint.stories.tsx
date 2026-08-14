import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import TourPoint from './TourPoint';
import type { TourPointPointerPosition } from './TourPoint';

const POINTER_VARIANTS: TourPointPointerPosition[] = [
  'top-center',
  'top-left',
  'top-right',
  'bottom-center',
  'bottom-left',
  'bottom-right',
  'left-center',
  'right-center',
];

function labelFor(position: TourPointPointerPosition) {
  return position
    .split('-')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

const meta = {
  title: 'Patterns/Onboarding/Tour Point',
  component: TourPoint,
  tags: ['autodocs'],
  argTypes: {
    pointerPosition: {
      control: 'select',
      options: ['none', ...POINTER_VARIANTS],
    },
  },
} satisfies Meta<typeof TourPoint>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Tour point title',
    pointerPosition: 'top-center',
    onClose: fn(),
    progress: { pages: 3, activePage: 1 },
    primaryAction: { label: 'Next', onClick: fn() },
    children:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vel orci id urna facilisis luctus.',
  },
};

export const NoPointer: Story = {
  args: {
    title: 'Standalone tour copy',
    pointerPosition: 'none',
    onClose: fn(),
    primaryAction: { label: 'Got it', onClick: fn() },
    children:
      'Set pointerPosition to none when the card is shown without an on-canvas anchor.',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 32 }}>
      <section>
        <h3
          style={{
            marginBottom: 12,
            fontSize: 12,
            color: 'var(--center-channel-color)',
          }}
        >
          Pointer placement
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 48,
          }}
        >
          {POINTER_VARIANTS.map((pointerPosition) => (
            <div key={pointerPosition}>
              <p
                style={{
                  marginBottom: 8,
                  fontSize: 12,
                  color: 'var(--center-channel-color)',
                }}
              >
                {labelFor(pointerPosition)}
              </p>
              <TourPoint
                title="Tour point title"
                pointerPosition={pointerPosition}
                onClose={fn()}
                progress={{ pages: 3, activePage: 1 }}
                primaryAction={{ label: 'Next', onClick: fn() }}
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
                vel orci id urna facilisis luctus.
              </TourPoint>
            </div>
          ))}
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
          No pointer
        </h3>
        <TourPoint
          title="Standalone tour copy"
          pointerPosition="none"
          onClose={fn()}
          primaryAction={{ label: 'Got it', onClick: fn() }}
        >
          Set pointerPosition to none when the card is shown without an on-canvas
          anchor.
        </TourPoint>
      </section>
    </div>
  ),
};
