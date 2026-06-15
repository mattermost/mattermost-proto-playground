import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import BellOutlineIcon from '@mattermost/compass-icons/components/bell-outline';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import ExitToAppIcon from '@mattermost/compass-icons/components/exit-to-app';
import Icon from '@/components/ui/Icon/Icon';
import PopoverMenu, {
  PopoverMenuDivider,
  PopoverMenuGroup,
} from '@/components/ui/PopoverMenu/PopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import styles from './ChannelNameMenu.module.scss';

export interface ChannelNameMenuProps {
  automationCount: number;
  onViewAutomations: () => void;
}

/**
 * Alternate entry point: the channel-name dropdown gains a "Channel
 * automations" item alongside the usual channel-level actions.
 */
export default function ChannelNameMenu({
  automationCount,
  onViewAutomations,
}: ChannelNameMenuProps) {
  return (
    <PopoverMenu className={styles['channel-name-menu']}>
      <PopoverMenuGroup aria-label="Channel">
        <MenuItem
          label="View Info"
          leadingVisual={<Icon size="16" glyph={<InformationOutlineIcon />} />}
        />
        <MenuItem
          label="Notification Preferences"
          leadingVisual={<Icon size="16" glyph={<BellOutlineIcon />} />}
        />
        <MenuItem
          label="Add Members"
          leadingVisual={<Icon size="16" glyph={<AccountPlusOutlineIcon />} />}
        />
      </PopoverMenuGroup>

      <PopoverMenuDivider />

      <PopoverMenuGroup aria-label="Automations">
        <MenuItem
          label="Channel automations"
          tag
          leadingVisual={<Icon size="16" glyph={<CreationOutlineIcon />} />}
          secondaryLabel={String(automationCount)}
          secondaryLabelPosition="Inline"
          onClick={onViewAutomations}
        />
      </PopoverMenuGroup>

      <PopoverMenuDivider />

      <PopoverMenuGroup aria-label="Membership">
        <MenuItem
          label="Leave Channel"
          destructive
          leadingVisual={<Icon size="16" glyph={<ExitToAppIcon />} />}
        />
      </PopoverMenuGroup>
    </PopoverMenu>
  );
}
