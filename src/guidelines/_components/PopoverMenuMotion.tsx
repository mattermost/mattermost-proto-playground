import { useState } from 'react';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import { Button } from '@mattermost/compass-ui';
import { Icon } from '@mattermost/compass-ui';
import { MenuItem } from '@mattermost/compass-ui';
import {
  PopoverMenuGroup,
  PopoverMenu} from '@mattermost/compass-ui';
import styles from './PopoverMenuMotion.module.scss';

export type PopoverMenuMotionDirection =
  | 'above'
  | 'below'
  | 'submenu-left'
  | 'submenu-right';

export interface PopoverMenuMotionProps {
  /** Which directional animation to visualize. */
  direction: PopoverMenuMotionDirection;
}

const HIGHLIGHTED_BG = 'rgba(var(--center-channel-color-rgb), 0.08)';

/**
 * Inline demo for the four popover menu open/close animations described in
 * the pattern guideline. Click the toggle to play the entrance/exit pair.
 *
 * Uses the real {@link PopoverMenu} and {@link MenuItem} components — the
 * animation lives on a wrapping div so the components themselves stay
 * unchanged.
 *
 * The 100ms close duration is hard-coded per the spec — it doesn't map to any
 * `--duration-*` token. The 150ms open uses `--duration-quick`.
 */
export default function PopoverMenuMotion({
  direction,
}: PopoverMenuMotionProps) {
  const [open, setOpen] = useState(false);

  const stageClass = [
    styles['pm-motion__stage'],
    styles[`pm-motion__stage--${direction}`],
  ].join(' ');

  const surfaceClass = [
    styles['pm-motion__surface'],
    styles[`pm-motion__surface--${direction}`],
    open ? styles['pm-motion__surface--open'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  const isSubmenu =
    direction === 'submenu-left' || direction === 'submenu-right';

  const childMenu = (
    <div className={surfaceClass} aria-hidden={!open}>
      <PopoverMenu variant={isSubmenu ? 'child' : 'parent'}>
        <PopoverMenuGroup>
          <MenuItem label="Option one" />
          <MenuItem label="Option two" />
          <MenuItem label="Option three" />
        </PopoverMenuGroup>
      </PopoverMenu>
    </div>
  );

  return (
    <div className={styles['pm-motion']}>
      <div className={stageClass}>
        {isSubmenu ? (
          <div className={styles['pm-motion__parent']}>
            <PopoverMenu>
              <PopoverMenuGroup>
                <MenuItem label="Item one" />
                <MenuItem
                  label="Item two"
                  trailingElement
                  trailingVisual={
                    <Icon glyph={<ChevronRightIcon />} size="16" />
                  }
                  style={{ backgroundColor: HIGHLIGHTED_BG }}
                />
                <MenuItem label="Item three" />
              </PopoverMenuGroup>
            </PopoverMenu>
          </div>
        ) : (
          <Button size="Small" emphasis="Secondary">
            Trigger
          </Button>
        )}
        {childMenu}
      </div>
      <Button
        size="Small"
        emphasis="Tertiary"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {open ? 'Close' : 'Open'}
      </Button>
    </div>
  );
}
