import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import IconButton, {
  ICON_BUTTON_ICON_SIZES,
  type IconButtonPadding,
  type IconButtonProps,
  type IconButtonSize,
  type IconButtonStyle,
} from './IconButton';
import Icon from '../Icon/Icon';
import { iconSelectArgType, resolveStoryIcon } from '../../storybook/icons';

const SIZES: IconButtonSize[] = ['X-Small', 'Small', 'Medium', 'Large'];

const MATRIX_ROWS: {
  label: string;
  padding: IconButtonPadding;
  rounded: boolean;
}[] = [
  { label: 'Default', padding: 'Default', rounded: false },
  { label: 'Compact', padding: 'Compact', rounded: false },
  { label: 'Rounded', padding: 'Default', rounded: true },
];

type IconButtonStoryArgs = Omit<IconButtonProps, 'icon'> & {
  icon: string;
};

const meta = {
  title: 'Components/Actions/Icon Button',
  component: IconButton,
  tags: ['autodocs'],
  argTypes: {
    style: { control: 'select', options: ['Default', 'Inverted'] },
    size: { control: 'select', options: SIZES },
    padding: { control: 'select', options: ['Default', 'Compact'] },
    icon: iconSelectArgType({
      description: 'Icon glyph shown inside the button.',
    }),
  },
  args: {
    icon: 'globe',
  },
  render: ({ icon, size = 'Medium', ...rest }) => (
    <IconButton
      {...rest}
      size={size}
      icon={
        resolveStoryIcon(icon, {
          wrapSize: ICON_BUTTON_ICON_SIZES[size],
        }) as ReactNode
      }
    />
  ),
} satisfies Meta<IconButtonStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    'aria-label': 'Open menu',
    size: 'Medium',
    style: 'Default',
  },
};

export const Inverted: Story = {
  args: {
    'aria-label': 'Open menu',
    size: 'Medium',
    style: 'Inverted',
  },
  decorators: [
    (Story) => (
      <div
        style={{
          padding: 16,
          borderRadius: 8,
          background: 'var(--sidebar-header-bg)',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

function Row({
  label,
  children,
  labelColor = 'var(--center-channel-color)',
}: {
  label: string;
  children: ReactNode;
  labelColor?: string;
}) {
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
          width: 96,
          fontSize: 12,
          color: labelColor,
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function PermutationGrid({
  style,
  destructive,
  disabled,
  labelColor = 'var(--center-channel-color)',
}: {
  style: IconButtonStyle;
  destructive: boolean;
  disabled: boolean;
  labelColor?: string;
}) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          paddingLeft: 96,
        }}
      >
        {SIZES.map((size) => (
          <span
            key={size}
            style={{
              width: 40,
              fontSize: 11,
              textAlign: 'center',
              color: labelColor,
            }}
          >
            {size}
          </span>
        ))}
      </div>
      {MATRIX_ROWS.map((row) => (
        <div
          key={row.label}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            alignItems: 'center',
          }}
        >
          <span
            style={{
              width: 96,
              fontSize: 12,
              color: labelColor,
            }}
          >
            {row.label}
          </span>
          {SIZES.map((size) => (
            <IconButton
              key={size}
              aria-label={`${row.label}, ${size}`}
              style={style}
              destructive={destructive}
              disabled={disabled}
              size={size}
              padding={row.padding}
              rounded={row.rounded}
              icon={
                <Icon
                  glyph={<GlobeIcon />}
                  size={ICON_BUTTON_ICON_SIZES[size]}
                />
              }
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 32 }}>
      <section>
        <h3 style={{ marginBottom: 12 }}>Default</h3>
        <PermutationGrid
          style="Default"
          destructive={false}
          disabled={false}
        />
      </section>
      <section>
        <h3 style={{ marginBottom: 12 }}>Destructive</h3>
        <PermutationGrid style="Default" destructive disabled={false} />
      </section>
      <section>
        <h3 style={{ marginBottom: 12 }}>Disabled</h3>
        <PermutationGrid style="Default" destructive={false} disabled />
      </section>
      <section
        style={{
          padding: 16,
          borderRadius: 8,
          background: 'var(--sidebar-header-bg)',
        }}
      >
        <h3 style={{ marginBottom: 12, color: 'var(--sidebar-text)' }}>
          Inverted
        </h3>
        <PermutationGrid
          style="Inverted"
          destructive={false}
          disabled={false}
          labelColor="var(--sidebar-text)"
        />
      </section>
      <section>
        <h3 style={{ marginBottom: 12 }}>Toggled & Active</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          <Row label="Toggled">
            {SIZES.map((size) => (
              <IconButton
                key={size}
                aria-label={`Toggled, ${size}`}
                size={size}
                toggled
                icon={
                  <Icon
                    glyph={<GlobeIcon />}
                    size={ICON_BUTTON_ICON_SIZES[size]}
                  />
                }
              />
            ))}
          </Row>
          <Row label="Active">
            {SIZES.map((size) => (
              <IconButton
                key={size}
                aria-label={`Active, ${size}`}
                size={size}
                active
                icon={
                  <Icon
                    glyph={<GlobeIcon />}
                    size={ICON_BUTTON_ICON_SIZES[size]}
                  />
                }
              />
            ))}
          </Row>
        </div>
      </section>
      <section>
        <h3 style={{ marginBottom: 12 }}>Count & Unread badge</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          <Row label="Count">
            <IconButton
              aria-label="12 notifications"
              count={12}
              size="X-Small"
              icon={<Icon glyph={<GlobeIcon />} size="12" />}
            />
            <IconButton
              aria-label="48 notifications"
              count={48}
              size="Small"
              icon={<Icon glyph={<GlobeIcon />} size="16" />}
            />
            <IconButton
              aria-label="425 notifications"
              count={425}
              icon={<Icon glyph={<GlobeIcon />} size="20" />}
            />
            <IconButton
              aria-label="9 notifications"
              count={9}
              size="Large"
              icon={<Icon glyph={<GlobeIcon />} size="24" />}
            />
          </Row>
          <Row label="Unread">
            {SIZES.map((size) => (
              <IconButton
                key={size}
                aria-label={`Unread, ${size}`}
                size={size}
                unreadBadge
                icon={
                  <Icon
                    glyph={<GlobeIcon />}
                    size={ICON_BUTTON_ICON_SIZES[size]}
                  />
                }
              />
            ))}
            <IconButton
              aria-label="Unread with count"
              count={3}
              unreadBadge
              icon={<Icon glyph={<GlobeIcon />} size="20" />}
            />
          </Row>
        </div>
      </section>
    </div>
  ),
};
