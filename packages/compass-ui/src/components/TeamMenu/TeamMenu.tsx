import type { HTMLAttributes } from 'react';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import ExitToAppIcon from '@mattermost/compass-icons/components/exit-to-app';
import LightbulbOutlineIcon from '@mattermost/compass-icons/components/lightbulb-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import Icon from '@/components/Icon/Icon';
import MenuItem from '@/components/MenuItem/MenuItem';
import PopoverMenu, {
  PopoverMenuDivider,
  PopoverMenuGroup,
} from '@/components/PopoverMenu/PopoverMenu';
import styles from './TeamMenu.module.scss';

export interface TeamMenuProps extends HTMLAttributes<HTMLDivElement> {
  /** Shows Manage members and Manage groups (team admin). */
  adminOptions?: boolean;
  /** Shows Create a team. */
  createTeamPermission?: boolean;
  /** Shows Join another team. Default: true. */
  joinTeamPermission?: boolean;
}

/**
 * Team menu from the team switcher / team header — invite, settings, and
 * optional admin / create-team rows.
 */
export default function TeamMenu({
  adminOptions = false,
  createTeamPermission = false,
  joinTeamPermission = true,
  className = '',
  style,
  ...rest
}: TeamMenuProps) {
  const rootClass = [styles['team-menu'], className].filter(Boolean).join(' ');

  return (
    <PopoverMenu
      className={rootClass}
      style={{ width: '260px', ...style }}
      {...rest}
    >
      <PopoverMenuGroup>
        <MenuItem
          label="Invite people"
          secondaryLabel="Add or invite people to team"
          leadingVisual={<Icon glyph={<AccountPlusOutlineIcon />} size="16" />}
        />
        <MenuItem
          label="Team settings"
          leadingVisual={<Icon glyph={<CogOutlineIcon />} size="16" />}
        />
        <MenuItem
          label="View members"
          leadingVisual={
            <Icon glyph={<AccountMultipleOutlineIcon />} size="16" />
          }
        />
        {adminOptions && (
          <MenuItem
            label="Manage members"
            leadingVisual={
              <Icon glyph={<AccountMultipleOutlineIcon />} size="16" />
            }
          />
        )}
        {adminOptions && (
          <MenuItem
            label="Manage groups"
            leadingVisual={
              <Icon glyph={<AccountMultipleOutlineIcon />} size="16" />
            }
          />
        )}
        <MenuItem
          label="Leave team"
          destructive
          leadingVisual={<Icon glyph={<ExitToAppIcon />} size="16" />}
        />
      </PopoverMenuGroup>
      <PopoverMenuDivider />
      <PopoverMenuGroup>
        {joinTeamPermission && (
          <MenuItem
            label="Join another team"
            leadingVisual={<Icon glyph={<PlusIcon />} size="16" />}
          />
        )}
        {createTeamPermission && (
          <MenuItem
            label="Create a team"
            leadingVisual={<Icon glyph={<PlusIcon />} size="16" />}
          />
        )}
      </PopoverMenuGroup>
      <PopoverMenuDivider />
      <PopoverMenuGroup>
        <MenuItem
          className={styles['team-menu__learn-item']}
          label="Learn about teams"
          leadingVisual={<Icon glyph={<LightbulbOutlineIcon />} size="16" />}
        />
      </PopoverMenuGroup>
    </PopoverMenu>
  );
}
