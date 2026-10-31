import type { ReactNode } from 'react';
import ChevronUpIcon from '@mattermost/compass-icons/components/chevron-up';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import styles from './SegmentedIconButton.module.scss';

export type SegmentedIconButtonSize = 'small' | 'medium';
export type SegmentedIconButtonStyle = 'default' | 'inverted';

export interface SegmentedIconButtonProps {
  /** Glyph of the main segment, e.g. `<Icon glyph={<MicrophoneIcon />} />`. */
  icon: ReactNode;
  /** Accessible name (and tooltip) of the main segment. */
  label: string;
  /** Accessible name (and tooltip) of the chevron segment. */
  chevronLabel: string;
  /** On/off state of the main action (maps to `aria-pressed`). Omit when not a toggle. */
  toggled?: boolean;
  /** A menu is open: BOTH segments use the Compass `active` visual (not `toggled`). */
  menuOpen?: boolean;
  disabled?: boolean;
  size?: SegmentedIconButtonSize;
  /** `inverted` for dark surfaces, `default` for light ones. */
  style?: SegmentedIconButtonStyle;
  onClick?: () => void;
  onChevronClick?: () => void;
  /** Extra class on the root group. */
  className?: string;
  /** Extra class on the main segment (e.g. an on/off tint). */
  mainClassName?: string;
}

const cx = (...names: (string | false | undefined)[]) =>
  names.filter(Boolean).join(' ');

/**
 * One visual unit made of a main icon button and a joined chevron segment (opens a
 * device menu). Shared outer corners, no divider. Presentational: toggle and
 * menu state are owned by the host.
 */
export function SegmentedIconButton({
  icon,
  label,
  chevronLabel,
  toggled,
  menuOpen = false,
  disabled = false,
  size = 'medium',
  style = 'default',
  onClick,
  onChevronClick,
  className,
  mainClassName,
}: SegmentedIconButtonProps) {
  return (
    <div
      role="group"
      className={cx(
        styles['segmented-icon-button'],
        styles[`segmented-icon-button--size-${size}`],
        styles[`segmented-icon-button--style-${style}`],
        menuOpen && styles['segmented-icon-button--open'],
        className,
      )}
    >
      <IconButton
        size={size}
        style={style}
        toggled={toggled}
        active={menuOpen}
        disabled={disabled}
        className={cx(styles['segmented-icon-button__main'], mainClassName)}
        aria-label={label}
        title={label}
        icon={icon}
        onClick={onClick}
      />
      <IconButton
        size={size}
        style={style}
        active={menuOpen}
        disabled={disabled}
        className={styles['segmented-icon-button__chevron']}
        aria-label={chevronLabel}
        title={chevronLabel}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        icon={
          <Icon
            size={size === 'small' ? '12' : '16'}
            glyph={<ChevronUpIcon />}
            className={styles['segmented-icon-button__chevron-icon']}
          />
        }
        onClick={onChevronClick}
      />
    </div>
  );
}
