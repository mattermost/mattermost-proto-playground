import { useEffect, useRef, useState } from 'react';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import { WithTooltip } from '@mattermost/compass-proto';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import {
  PopoverMenu,
  PopoverMenuGroup,
  PopoverMenuGroupTitle,
} from '@mattermost/compass-ui/components/popover-menu';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import { Switch } from '@mattermost/compass-ui/components/switch';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import styles from './PrototypeSettings.module.scss';

interface PrototypeSettingsProps {
  /** Whether a Weave upgrade has added steps nobody has been given yet. */
  newStepsAvailable: boolean;
  onNewStepsAvailableChange: (on: boolean) => void;
}

/**
 * Prototype chrome (not product UI): settings for the prototype itself, in a
 * popover opened from a cog in the header. The host owns open state, outside
 * click, Escape and focus return, as for any popover.
 */
export default function PrototypeSettings({
  newStepsAvailable,
  onNewStepsAvailableChange,
}: PrototypeSettingsProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClose(ref, open, () => setOpen(false));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      ref.current?.querySelector<HTMLElement>('button')?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div ref={ref} className={styles['prototype-settings']}>
      <WithTooltip placement="bottom" label="Prototype settings">
        <IconButton
          size="small"
          padding="compact"
          aria-label="Prototype settings"
          aria-haspopup="menu"
          aria-expanded={open}
          active={open}
          icon={<Icon size="16" glyph={<CogOutlineIcon />} />}
          onClick={() => setOpen((o) => !o)}
        />
      </WithTooltip>
      <div className={styles['prototype-settings__popover']}>
        <PopoverMenu
          open={open}
          role="menu"
          aria-label="Prototype settings"
          className={styles['prototype-settings__menu']}
        >
          <PopoverMenuGroup>
            <PopoverMenuGroupTitle>Prototype</PopoverMenuGroupTitle>
            <MenuItem
              role="menuitemcheckbox"
              aria-checked={newStepsAvailable}
              label="New steps available"
              secondaryLabel="Shows the banner and New tags for Plugin event and AI translate."
              secondaryLabelPosition="below"
              leadingElement={false}
              trailingElement
              // The row is the control; the switch only shows its state.
              trailingVisual={
                <Switch
                  className={styles['prototype-settings__switch']}
                  size="small"
                  checked={newStepsAvailable}
                  readOnly
                  tabIndex={-1}
                  aria-hidden="true"
                />
              }
              onClick={() => onNewStepsAvailableChange(!newStepsAvailable)}
            />
          </PopoverMenuGroup>
        </PopoverMenu>
      </div>
    </div>
  );
}
