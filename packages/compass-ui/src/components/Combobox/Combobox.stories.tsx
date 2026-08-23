import type { Meta, StoryObj } from '@storybook/react';
import { useState, type ReactNode } from 'react';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarArjun from '@/assets/avatars/Arjun Patel.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import Combobox from './Combobox';
import type { ComboboxOption, ComboboxProps, ComboboxSize } from './Combobox';
import Icon from '../Icon/Icon';
import UserAvatar from '../UserAvatar/UserAvatar';
import {
  ICON_NONE,
  iconSelectArgType,
  resolveStoryIcon,
} from '../../storybook/icons';

const SIZES: ComboboxSize[] = ['Small', 'Medium', 'Large'];

const CHANNEL_OPTIONS: ComboboxOption[] = [
  { value: 'town-square', label: 'Town Square' },
  { value: 'off-topic', label: 'Off-Topic' },
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'releases', label: 'Releases' },
];

const PEOPLE_OPTIONS: ComboboxOption[] = [
  {
    value: 'emma',
    label: 'Emma Novak',
    secondaryLabel: '@emma',
    leadingAvatar: { src: avatarEmma, alt: 'Emma Novak' },
    leadingVisual: <UserAvatar src={avatarEmma} alt="Emma Novak" size="24" />,
  },
  {
    value: 'arjun',
    label: 'Arjun Patel',
    secondaryLabel: '@arjun',
    leadingAvatar: { src: avatarArjun, alt: 'Arjun Patel' },
    leadingVisual: <UserAvatar src={avatarArjun} alt="Arjun Patel" size="24" />,
  },
  {
    value: 'sofia',
    label: 'Sofia Bauer',
    secondaryLabel: '@sofia',
    leadingAvatar: { src: avatarSofia, alt: 'Sofia Bauer' },
    leadingVisual: <UserAvatar src={avatarSofia} alt="Sofia Bauer" size="24" />,
  },
];

type ComboboxStoryArgs = Omit<ComboboxProps, 'leadingIcon'> & {
  leadingIcon?: string;
};

const meta = {
  title: 'Components/Forms and Input/Combobox',
  component: Combobox,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: SIZES },
    leadingIcon: iconSelectArgType({ optional: true }),
  },
  args: {
    leadingIcon: ICON_NONE,
  },
  render: ({ leadingIcon, ...rest }) => (
    <Combobox
      {...rest}
      leadingIcon={
        resolveStoryIcon(leadingIcon, { wrapSize: '16' }) as ReactNode
      }
    />
  ),
} satisfies Meta<ComboboxStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Channel',
    placeholder: 'Search channels…',
    options: CHANNEL_OPTIONS,
    size: 'Medium',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Channel',
    defaultValue: 'design',
    options: CHANNEL_OPTIONS,
  },
};

export const WithLeadingIcon: Story = {
  args: {
    label: 'Channel',
    leadingIcon: 'globe',
    options: CHANNEL_OPTIONS,
  },
};

export const MultiSelect: Story = {
  render: function MultiSelectStory() {
    const [value, setValue] = useState<string[]>(['emma']);
    return (
      <div style={{ maxWidth: 360 }}>
        <Combobox
          label="Invite people"
          placeholder="Search people…"
          multiple
          options={PEOPLE_OPTIONS}
          value={value}
          onChange={(next) => setValue((next as string[]) ?? [])}
        />
      </div>
    );
  },
};

export const Invalid: Story = {
  args: {
    label: 'Channel',
    invalid: true,
    defaultValue: 'design',
    options: CHANNEL_OPTIONS,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Channel',
    disabled: true,
    defaultValue: 'design',
    options: CHANNEL_OPTIONS,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 20, maxWidth: 360 }}>
      {SIZES.map((size) => (
        <Combobox
          key={size}
          size={size}
          label={size}
          options={CHANNEL_OPTIONS}
        />
      ))}
      <Combobox
        label="Invalid"
        invalid
        defaultValue="design"
        options={CHANNEL_OPTIONS}
      />
      <Combobox
        label="Disabled"
        disabled
        defaultValue="design"
        options={CHANNEL_OPTIONS}
      />
      <Combobox
        label="With icon"
        leadingIcon={<Icon glyph={<GlobeIcon />} size="16" />}
        options={CHANNEL_OPTIONS}
      />
    </div>
  ),
};
