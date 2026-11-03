import { Fragment, type ReactNode } from 'react';
import { MenuGroupHeading } from '@mattermost/compass-ui/components/menu-group-heading';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import {
  PopoverMenu,
  PopoverMenuDivider,
} from '@mattermost/compass-ui/components/popover-menu';
import { CallHeaderButton } from '../CallHeaderButton';
import styles from './StartCallButton.module.scss';

export interface StartCallOption {
  id: string;
  label: string;
  /** Muted second line, e.g. "Camera off". */
  secondaryLabel?: string;
  icon: ReactNode;
  /** Heading shown above the first option of each group, e.g. "Phone call". */
  group?: string;
  /** Draws a divider above the row, e.g. before settings that are not a way to call. */
  dividerBefore?: boolean;
}

export interface StartCallButtonProps {
  /** Tooltip text and accessible name of the icon-only button. */
  label?: string;
  options: readonly StartCallOption[];
  /** Host-owned menu state. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (id: string) => void;
  /** Accessible name of the menu. */
  menuLabel?: string;
  /** Walkthrough anchor on the open menu surface. */
  menuFocusId?: string;
  className?: string;
}

/**
 * Channel-header "Start call" button (icon-only phone with a chevron and a
 * tooltip) that opens a menu of ways to start (video, audio, phone). Built on
 * Compass `PopoverMenu` + `MenuItem`. The host owns open state, outside click
 * and Escape; the menu is anchored under the button.
 */
export default function StartCallButton({
  label = 'Start call',
  options,
  open,
  onOpenChange,
  onSelect,
  menuLabel = 'Start call options',
  menuFocusId,
  className,
}: StartCallButtonProps) {
  return (
    <div
      className={[styles['start-call-button'], className]
        .filter(Boolean)
        .join(' ')}
    >
      <CallHeaderButton
        state="start"
        label={label}
        menu
        menuOpen={open}
        onClick={() => onOpenChange(!open)}
      />
      <div
        className={styles['start-call-button__menu']}
        {...(open && menuFocusId ? { 'data-wt-focus': menuFocusId } : {})}
      >
        <PopoverMenu open={open} role="menu" aria-label={menuLabel}>
          {options.map((o, i) => (
            <Fragment key={o.id}>
              {o.dividerBefore && <PopoverMenuDivider />}
              {o.group && o.group !== options[i - 1]?.group && (
                <MenuGroupHeading label={o.group} />
              )}
              <MenuItem
                role="menuitem"
                label={o.label}
                secondaryLabel={o.secondaryLabel}
                leadingVisual={o.icon}
                onClick={() => onSelect(o.id)}
              />
            </Fragment>
          ))}
        </PopoverMenu>
      </div>
    </div>
  );
}
