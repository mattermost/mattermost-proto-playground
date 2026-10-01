import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import AppsIcon from '@mattermost/compass-icons/components/apps';
import ArrowRightBoldOutlineIcon from '@mattermost/compass-icons/components/arrow-right-bold-outline';
import BellOffOutlineIcon from '@mattermost/compass-icons/components/bell-off-outline';
import BellOutlineIcon from '@mattermost/compass-icons/components/bell-outline';
import BookmarkOutlineIcon from '@mattermost/compass-icons/components/bookmark-outline';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import ClockOutlineIcon from '@mattermost/compass-icons/components/clock-outline';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import ContentCopyIcon from '@mattermost/compass-icons/components/content-copy';
import ExitToAppIcon from '@mattermost/compass-icons/components/exit-to-app';
import FlagOutlineIcon from '@mattermost/compass-icons/components/flag-outline';
import FolderMoveOutlineIcon from '@mattermost/compass-icons/components/folder-move-outline';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import MarkAsUnreadIcon from '@mattermost/compass-icons/components/mark-as-unread';
import MessageCheckOutlineIcon from '@mattermost/compass-icons/components/message-check-outline';
import OpenInNewIcon from '@mattermost/compass-icons/components/open-in-new';
import PinOutlineIcon from '@mattermost/compass-icons/components/pin-outline';
import TranslateIcon from '@mattermost/compass-icons/components/translate';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import {
  PopoverMenu,
  PopoverMenuDivider,
  PopoverMenuGroup,
} from '@mattermost/compass-ui/components/popover-menu';
import { ShortcutTag } from '@mattermost/compass-ui/components/shortcut-tag';

/*
 * Write-to-Channels-denied variants of the two Compass overflow menus.
 *
 * Published `ChannelHeaderMenu` and `MessageMoreOptionsMenu` take no
 * write-access prop and no row handlers, so these compose the same rows from
 * `PopoverMenu` + `MenuItem` with the write rows removed.
 */

function shortcut(text: string) {
  return <ShortcutTag label={text} size="small" />;
}

export interface AcvcChannelHeaderMenuProps {
  onViewInfo?: () => void;
  onChannelSettings?: () => void;
}

/** Channel header menu without Archive channel. Leave and preferences stay. */
export function AcvcChannelHeaderMenu({
  onViewInfo,
  onChannelSettings,
}: AcvcChannelHeaderMenuProps) {
  return (
    <PopoverMenu>
      <PopoverMenuGroup>
        <MenuItem
          label="Open in new window"
          leadingVisual={<Icon glyph={<OpenInNewIcon />} size="16" />}
        />
        <MenuItem
          label="View info"
          leadingVisual={<Icon glyph={<InformationOutlineIcon />} size="16" />}
          onClick={onViewInfo}
        />
        <MenuItem
          label="Mute channel"
          leadingVisual={<Icon glyph={<BellOffOutlineIcon />} size="16" />}
        />
        <MenuItem
          label="Notification preferences"
          leadingVisual={<Icon glyph={<BellOutlineIcon />} size="16" />}
        />
        <MenuItem
          label="Channel settings"
          leadingVisual={<Icon glyph={<CogOutlineIcon />} size="16" />}
          trailingElement
          trailingVisual={<Icon glyph={<ChevronRightIcon />} size="16" />}
          onClick={onChannelSettings}
        />
        <MenuItem
          label="Bookmarks bar"
          leadingVisual={<Icon glyph={<BookmarkOutlineIcon />} size="16" />}
          trailingElement
          trailingVisual={<Icon glyph={<ChevronRightIcon />} size="16" />}
        />
      </PopoverMenuGroup>
      <PopoverMenuDivider />
      <PopoverMenuGroup>
        <MenuItem
          label="Members"
          leadingVisual={<Icon glyph={<AccountOutlineIcon />} size="16" />}
        />
      </PopoverMenuGroup>
      <PopoverMenuDivider />
      <PopoverMenuGroup>
        <MenuItem
          label="Move to"
          leadingVisual={<Icon glyph={<FolderMoveOutlineIcon />} size="16" />}
          trailingElement
          trailingVisual={<Icon glyph={<ChevronRightIcon />} size="16" />}
        />
        <MenuItem
          label="More actions"
          leadingVisual={<Icon glyph={<AppsIcon />} size="16" />}
          trailingElement
          trailingVisual={<Icon glyph={<ChevronRightIcon />} size="16" />}
        />
      </PopoverMenuGroup>
      <PopoverMenuDivider />
      <PopoverMenuGroup>
        <MenuItem
          label="Leave channel"
          destructive
          leadingVisual={<Icon glyph={<ExitToAppIcon />} size="16" />}
        />
      </PopoverMenuGroup>
    </PopoverMenu>
  );
}

/** Message more-options menu without Reply, Edit, or Delete. */
export function AcvcMessageMoreOptionsMenu() {
  return (
    <PopoverMenu>
      <PopoverMenuGroup>
        <MenuItem
          label="Forward"
          leadingVisual={
            <Icon glyph={<ArrowRightBoldOutlineIcon />} size="16" />
          }
          trailingElement
          trailingVisual={shortcut('Shift + F')}
        />
        <MenuItem
          label="Follow thread"
          leadingVisual={<Icon glyph={<MessageCheckOutlineIcon />} size="16" />}
          trailingElement
          trailingVisual={shortcut('F')}
        />
        <MenuItem
          label="Mark as unread"
          leadingVisual={<Icon glyph={<MarkAsUnreadIcon />} size="16" />}
          trailingElement
          trailingVisual={shortcut('U')}
        />
        <MenuItem
          label="Save"
          leadingVisual={<Icon glyph={<BookmarkOutlineIcon />} size="16" />}
          trailingElement
          trailingVisual={shortcut('S')}
        />
        <MenuItem
          label="Remind"
          leadingVisual={<Icon glyph={<ClockOutlineIcon />} size="16" />}
          trailingElement
          trailingVisual={<Icon glyph={<ChevronRightIcon />} size="16" />}
        />
        <MenuItem
          label="Pin to channel"
          leadingVisual={<Icon glyph={<PinOutlineIcon />} size="16" />}
          trailingElement
          trailingVisual={shortcut('P')}
        />
      </PopoverMenuGroup>
      <PopoverMenuDivider />
      <PopoverMenuGroup>
        <MenuItem
          label="Copy text"
          leadingVisual={<Icon glyph={<ContentCopyIcon />} size="16" />}
          trailingElement
          trailingVisual={shortcut('C')}
        />
        <MenuItem
          label="Show translation"
          leadingVisual={<Icon glyph={<TranslateIcon />} size="16" />}
        />
        <MenuItem
          label="Copy link"
          leadingVisual={<Icon glyph={<LinkVariantIcon />} size="16" />}
          trailingElement
          trailingVisual={shortcut('K')}
        />
      </PopoverMenuGroup>
      <PopoverMenuDivider />
      <PopoverMenuGroup>
        <MenuItem
          label="Flag message"
          destructive
          leadingVisual={<Icon glyph={<FlagOutlineIcon />} size="16" />}
        />
      </PopoverMenuGroup>
    </PopoverMenu>
  );
}
