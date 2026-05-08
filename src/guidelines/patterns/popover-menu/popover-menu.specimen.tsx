import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import AppsIcon from '@mattermost/compass-icons/components/apps';
import ArchiveOutlineIcon from '@mattermost/compass-icons/components/archive-outline';
import BellOffOutlineIcon from '@mattermost/compass-icons/components/bell-off-outline';
import BellOutlineIcon from '@mattermost/compass-icons/components/bell-outline';
import BookmarkOutlineIcon from '@mattermost/compass-icons/components/bookmark-outline';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import ExitToAppIcon from '@mattermost/compass-icons/components/exit-to-app';
import FolderMoveOutlineIcon from '@mattermost/compass-icons/components/folder-move-outline';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import Icon from '@/components/ui/Icon/Icon';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import PopoverMenu, {
  PopoverMenuDivider,
  PopoverMenuGroup,
} from '@/components/ui/PopoverMenu';
import styles from '@/styles/library-demo/patterns.module.scss';

function ChannelHeaderMenuExample() {
  return (
    <PopoverMenu>
      <PopoverMenuGroup>
        <MenuItem
          label="View info"
          leadingVisual={<Icon glyph={<InformationOutlineIcon />} size="16" />}
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
        <MenuItem
          label="Archive channel"
          destructive
          leadingVisual={<Icon glyph={<ArchiveOutlineIcon />} size="16" />}
        />
      </PopoverMenuGroup>
    </PopoverMenu>
  );
}

export default function PopoverMenuLibrary() {
  return (
    <div className={styles['patterns']}>
      <header className={styles['patterns__header']}>
        <h1 className={styles['patterns__heading']}>Popover Menu</h1>
        <p className={styles['patterns__subheading']}>
          Container, grouping, and elevation composed with Menu Item rows.
        </p>
      </header>

      <section className={styles['patterns__section']}>
        <h2 className={styles['patterns__section-title']}>Channel menu</h2>
        <p className={styles['patterns__variant-label']}>
          Parent elevation, dividers, submenu chevrons, destructive actions
        </p>
        <div className={styles['patterns__popover-menu-demo']}>
          <ChannelHeaderMenuExample />
        </div>
      </section>

      <section className={styles['patterns__section']}>
        <h2 className={styles['patterns__section-title']}>Child menu</h2>
        <p className={styles['patterns__variant-label']}>Elevation 5</p>
        <div className={styles['patterns__popover-menu-demo']}>
          <div className={styles['patterns__popover-nested-demo']}>
            <PopoverMenu>
              <MenuItem
                label="Channel settings"
                trailingElement
                trailingVisual={<Icon glyph={<ChevronRightIcon />} size="16" />}
              />
            </PopoverMenu>
            <PopoverMenu variant="child">
              <MenuItem label="Rename channel" />
              <MenuItem label="Convert to private" />
            </PopoverMenu>
          </div>
        </div>
      </section>
    </div>
  );
}
