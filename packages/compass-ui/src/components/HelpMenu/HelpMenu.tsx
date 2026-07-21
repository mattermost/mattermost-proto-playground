import type { HTMLAttributes } from 'react';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import FileTextOutlineIcon from '@mattermost/compass-icons/components/file-text-outline';
import HelpCircleOutlineIcon from '@mattermost/compass-icons/components/help-circle-outline';
import KeyboardOutlineIcon from '@mattermost/compass-icons/components/keyboard-outline';
import LightbulbOutlineIcon from '@mattermost/compass-icons/components/lightbulb-outline';
import Icon from '@/components/Icon/Icon';
import MenuItem from '@/components/MenuItem/MenuItem';
import PopoverMenu, {
  PopoverMenuGroup,
} from '@/components/PopoverMenu/PopoverMenu';

export interface HelpMenuProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * Global header help menu — docs, community, and shortcuts.
 */
export default function HelpMenu({
  className = '',
  style,
  ...rest
}: HelpMenuProps) {
  return (
    <PopoverMenu
      className={className}
      style={{ width: '232px', ...style }}
      {...rest}
    >
      <PopoverMenuGroup>
        <MenuItem
          label="Mattermost user guide"
          leadingVisual={<Icon glyph={<FileTextOutlineIcon />} size="16" />}
        />
        <MenuItem
          label="Training resources"
          leadingVisual={<Icon glyph={<LightbulbOutlineIcon />} size="16" />}
        />
        <MenuItem
          label="Ask the community"
          leadingVisual={<Icon glyph={<HelpCircleOutlineIcon />} size="16" />}
        />
        <MenuItem
          label="Report a problem"
          leadingVisual={<Icon glyph={<AlertOutlineIcon />} size="16" />}
        />
        <MenuItem
          label="Keyboard shortcuts"
          leadingVisual={<Icon glyph={<KeyboardOutlineIcon />} size="16" />}
        />
      </PopoverMenuGroup>
    </PopoverMenu>
  );
}
