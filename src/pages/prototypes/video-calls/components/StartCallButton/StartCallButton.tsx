import type { ReactNode } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import { PopoverMenu } from '@mattermost/compass-ui/components/popover-menu';
import styles from './StartCallButton.module.scss';

export interface StartCallOption {
  id: string;
  label: string;
  /** Muted second line, e.g. "Camera off". */
  secondaryLabel?: string;
  icon: ReactNode;
}

export interface StartCallButtonProps {
  /** Button text. */
  label?: string;
  /** Glyph before the label. */
  icon: ReactNode;
  options: readonly StartCallOption[];
  /** Host-owned menu state. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (id: string) => void;
  /** Accessible name of the menu. */
  menuLabel?: string;
  className?: string;
}

/**
 * Channel-header "Start call" button that opens a menu of ways to start
 * (video, audio…). Pattern borrowed from the outbound-calls start-call menu,
 * rebuilt on Compass `PopoverMenu` + `MenuItem`. The host owns open state,
 * outside click and Escape; the menu is anchored under the button.
 */
export default function StartCallButton({
  label = 'Start call',
  icon,
  options,
  open,
  onOpenChange,
  onSelect,
  menuLabel = 'Start call options',
  className,
}: StartCallButtonProps) {
  return (
    <div
      className={[styles['start-call-button'], className]
        .filter(Boolean)
        .join(' ')}
    >
      <Button
        emphasis="quaternary"
        size="small"
        leadingIcon={icon}
        trailingIcon={<Icon glyph={<ChevronDownIcon />} />}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
      >
        {label}
      </Button>
      <div className={styles['start-call-button__menu']}>
        <PopoverMenu open={open} role="menu" aria-label={menuLabel}>
          {options.map((o) => (
            <MenuItem
              key={o.id}
              role="menuitem"
              label={o.label}
              secondaryLabel={o.secondaryLabel}
              leadingVisual={o.icon}
              onClick={() => onSelect(o.id)}
            />
          ))}
        </PopoverMenu>
      </div>
    </div>
  );
}
