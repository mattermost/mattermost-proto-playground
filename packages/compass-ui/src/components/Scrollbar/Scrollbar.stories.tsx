import type { Meta, StoryObj } from '@storybook/react';
import Scrollbar from './Scrollbar';
import type { ScrollbarOrientation, ScrollbarThumbSize } from './Scrollbar';

const THUMB_SIZES: ScrollbarThumbSize[] = ['25%', '33%', '50%', '75%'];

const meta = {
  title: 'Components/Layout and Containers/Scrollbar',
  component: Scrollbar,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['Vertical', 'Horizontal'] satisfies ScrollbarOrientation[],
    },
    thumbSize: { control: 'select', options: THUMB_SIZES },
    scrollPosition: { control: { type: 'range', min: 0, max: 100, step: 1 } },
  },
} satisfies Meta<typeof Scrollbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
  args: {
    orientation: 'Vertical',
    thumbSize: '25%',
    scrollPosition: 0,
  },
};

export const Horizontal: Story = {
  args: {
    orientation: 'Horizontal',
    thumbSize: '50%',
    scrollPosition: 50,
  },
};

export const VerticalPositions: Story = {
  render: () => (
    <div
      style={{
        height: 160,
        display: 'flex',
        alignItems: 'stretch',
        gap: 16,
      }}
    >
      <Scrollbar orientation="Vertical" thumbSize="25%" scrollPosition={0} />
      <Scrollbar orientation="Vertical" thumbSize="33%" scrollPosition={50} />
      <Scrollbar orientation="Vertical" thumbSize="50%" scrollPosition={100} />
    </div>
  ),
};

export const HorizontalPositions: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, maxWidth: 320 }}>
      <Scrollbar orientation="Horizontal" thumbSize="25%" scrollPosition={0} />
      <Scrollbar orientation="Horizontal" thumbSize="50%" scrollPosition={50} />
    </div>
  ),
};

export const ThumbSizes: Story = {
  render: () => (
    <div
      style={{
        height: 160,
        display: 'flex',
        alignItems: 'stretch',
        gap: 16,
      }}
    >
      {THUMB_SIZES.map((thumbSize) => (
        <Scrollbar
          key={thumbSize}
          orientation="Vertical"
          thumbSize={thumbSize}
          scrollPosition={25}
        />
      ))}
    </div>
  ),
};
