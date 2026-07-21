import type { HTMLAttributes } from 'react';
import BookmarkOutlineIcon from '@mattermost/compass-icons/components/bookmark-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import MarkAsUnreadIcon from '@mattermost/compass-icons/components/mark-as-unread';
import MessageMinusOutlineIcon from '@mattermost/compass-icons/components/message-minus-outline';
import OpenInNewIcon from '@mattermost/compass-icons/components/open-in-new';
import Icon from '@/components/Icon/Icon';
import MenuItem from '@/components/MenuItem/MenuItem';
import PopoverMenu, {
  PopoverMenuDivider,
  PopoverMenuGroup,
} from '@/components/PopoverMenu/PopoverMenu';
import ShortcutTag from '@/components/ShortcutTag/ShortcutTag';

export interface ThreadActionsMenuProps extends HTMLAttributes<HTMLDivElement> {}

function shortcutLabel(text: string) {
  return <ShortcutTag label={text} size="Small" />;
}

/**
 * Thread list / thread header actions menu.
 */
export default function ThreadActionsMenu({
  className = '',
  style,
  ...rest
}: ThreadActionsMenuProps) {
  return (
    <PopoverMenu
      className={className}
      style={{ width: '268px', ...style }}
      {...rest}
    >
      <PopoverMenuGroup>
        <MenuItem
          label="Unfollow thread"
          leadingVisual={<Icon glyph={<MessageMinusOutlineIcon />} size="16" />}
        />
        <MenuItem
          label="Open in channel"
          leadingVisual={<Icon glyph={<OpenInNewIcon />} size="16" />}
        />
        <MenuItem
          label="Mark as unread"
          leadingVisual={<Icon glyph={<MarkAsUnreadIcon />} size="16" />}
          trailingElement
          trailingVisual={shortcutLabel('U')}
        />
        <MenuItem
          label="Save"
          leadingVisual={<Icon glyph={<BookmarkOutlineIcon />} size="16" />}
          trailingElement
          trailingVisual={shortcutLabel('S')}
        />
      </PopoverMenuGroup>
      <PopoverMenuDivider />
      <PopoverMenuGroup>
        <MenuItem
          label="Copy link"
          leadingVisual={<Icon glyph={<LinkVariantIcon />} size="16" />}
          trailingElement
          trailingVisual={shortcutLabel('K')}
        />
      </PopoverMenuGroup>
    </PopoverMenu>
  );
}
