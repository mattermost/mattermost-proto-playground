import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';
import type { ButtonAppearance, ButtonEmphasis, ButtonProps, ButtonSize } from './Button';
import type { IconSize } from '../Icon/Icon';
import {
  ICON_NONE,
  iconSelectArgType,
  resolveStoryIcon,
} from '../../storybook/icons';

const EMPHASES: ButtonEmphasis[] = [
  'Primary',
  'Secondary',
  'Tertiary',
  'Quaternary',
];

const SIZES: ButtonSize[] = ['X-Small', 'Small', 'Medium', 'Large'];

const BUTTON_SIZE_ICON_MAP: Record<ButtonSize, IconSize> = {
  'X-Small': '12',
  Small: '16',
  Medium: '16',
  Large: '20',
};

type ButtonStoryArgs = Omit<ButtonProps, 'leadingIcon' | 'trailingIcon'> & {
  leadingIcon?: string;
  trailingIcon?: string;
};

const meta = {
  title: 'Components/Actions/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    appearance: { control: 'select', options: ['Default', 'Inverted'] },
    emphasis: { control: 'select', options: EMPHASES },
    size: { control: 'select', options: SIZES },
    leadingIcon: iconSelectArgType({
      optional: true,
      includeDefault: true,
      description:
        'Leading icon. None hides it; Default uses the built-in Icon glyph.',
    }),
    trailingIcon: iconSelectArgType({
      optional: true,
      includeDefault: true,
      description:
        'Trailing icon. None hides it; Default uses the built-in Icon glyph.',
    }),
  },
  args: {
    leadingIcon: ICON_NONE,
    trailingIcon: ICON_NONE,
  },
  render: ({ leadingIcon, trailingIcon, size = 'Medium', ...rest }) => {
    const iconSize = BUTTON_SIZE_ICON_MAP[size];
    return (
      <Button
        {...rest}
        size={size}
        leadingIcon={
          resolveStoryIcon(leadingIcon, {
            wrapSize: iconSize,
            defaultMode: 'boolean',
          }) as ButtonProps['leadingIcon']
        }
        trailingIcon={
          resolveStoryIcon(trailingIcon, {
            wrapSize: iconSize,
            defaultMode: 'boolean',
          }) as ButtonProps['trailingIcon']
        }
      />
    );
  },
} satisfies Meta<ButtonStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Label',
    emphasis: 'Primary',
    size: 'Medium',
  },
};

export const WithLeadingIcon: Story = {
  args: {
    children: 'Label',
    leadingIcon: 'globe',
  },
};

function PermutationGrid({
  appearance,
  destructive,
  disabled,
  labelColor = 'var(--center-channel-color)',
}: {
  appearance: ButtonAppearance;
  destructive: boolean;
  disabled: boolean;
  labelColor?: string;
}) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {EMPHASES.map((emphasis) => (
        <div
          key={emphasis}
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
            {emphasis}
          </span>
          {SIZES.map((size) => (
            <Button
              key={size}
              appearance={appearance}
              emphasis={emphasis}
              destructive={destructive}
              disabled={disabled}
              size={size}
            >
              Label
            </Button>
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
          appearance="Default"
          destructive={false}
          disabled={false}
        />
      </section>
      <section>
        <h3 style={{ marginBottom: 12 }}>Destructive</h3>
        <PermutationGrid appearance="Default" destructive disabled={false} />
      </section>
      <section>
        <h3 style={{ marginBottom: 12 }}>Disabled</h3>
        <PermutationGrid appearance="Default" destructive={false} disabled />
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
          appearance="Inverted"
          destructive={false}
          disabled={false}
          labelColor="var(--sidebar-text)"
        />
      </section>
    </div>
  ),
};
