import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import PaginationDots from './PaginationDots';
import type {
  PaginationDotsOrientation,
  PaginationDotsStyle,
} from './PaginationDots';

const ORIENTATIONS: PaginationDotsOrientation[] = ['Horizontal', 'Vertical'];
const DOT_STYLES: PaginationDotsStyle[] = ['Default', 'Inverted', 'OnPrimary'];

const meta = {
  title: 'Components/Progress Indicators/Pagination Dots',
  component: PaginationDots,
  tags: ['autodocs'],
  argTypes: {
    dotStyle: { control: 'select', options: DOT_STYLES },
    orientation: { control: 'select', options: ORIENTATIONS },
  },
} satisfies Meta<typeof PaginationDots>;

export default meta;
type Story = StoryObj<typeof meta>;

function Row({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
        alignItems: 'center',
      }}
    >
      <span
        style={{
          width: 112,
          fontSize: 12,
          color: 'var(--center-channel-color)',
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function InteractiveDots() {
  const [activePage, setActivePage] = useState(2);

  return (
    <PaginationDots
      activePage={activePage}
      onPageChange={setActivePage}
      pages={5}
    />
  );
}

export const Default: Story = {
  args: {
    activePage: 2,
    pages: 5,
  },
};

export const Interactive: Story = {
  render: () => <InteractiveDots />,
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <Row label="Horizontal">
        <PaginationDots activePage={2} pages={5} orientation="Horizontal" />
      </Row>
      <Row label="Vertical">
        <PaginationDots activePage={1} pages={4} orientation="Vertical" />
      </Row>
      <Row label="Inverted">
        <span
          style={{
            display: 'inline-flex',
            padding: 12,
            borderRadius: 8,
            background: 'var(--sidebar-header-bg)',
          }}
        >
          <PaginationDots activePage={3} dotStyle="Inverted" pages={5} />
        </span>
      </Row>
      <Row label="On primary">
        <span
          style={{
            display: 'inline-flex',
            padding: 12,
            borderRadius: 8,
            background: 'var(--button-bg)',
          }}
        >
          <PaginationDots activePage={2} dotStyle="OnPrimary" pages={5} />
        </span>
      </Row>
    </div>
  ),
};
