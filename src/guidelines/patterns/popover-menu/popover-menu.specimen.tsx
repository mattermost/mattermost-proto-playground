import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import AppsIcon from '@mattermost/compass-icons/components/apps';
import ArchiveOutlineIcon from '@mattermost/compass-icons/components/archive-outline';
import ArrowRightBoldOutlineIcon from '@mattermost/compass-icons/components/arrow-right-bold-outline';
import BellOffOutlineIcon from '@mattermost/compass-icons/components/bell-off-outline';
import BellOutlineIcon from '@mattermost/compass-icons/components/bell-outline';
import BookmarkOutlineIcon from '@mattermost/compass-icons/components/bookmark-outline';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import ClockOutlineIcon from '@mattermost/compass-icons/components/clock-outline';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import ContentCopyIcon from '@mattermost/compass-icons/components/content-copy';
import ExitToAppIcon from '@mattermost/compass-icons/components/exit-to-app';
import FileTextOutlineIcon from '@mattermost/compass-icons/components/file-text-outline';
import FlagOutlineIcon from '@mattermost/compass-icons/components/flag-outline';
import FolderMoveOutlineIcon from '@mattermost/compass-icons/components/folder-move-outline';
import FolderPlusOutlineIcon from '@mattermost/compass-icons/components/folder-plus-outline';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import HelpCircleOutlineIcon from '@mattermost/compass-icons/components/help-circle-outline';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import KeyboardOutlineIcon from '@mattermost/compass-icons/components/keyboard-outline';
import LightbulbOutlineIcon from '@mattermost/compass-icons/components/lightbulb-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import MarkAsUnreadIcon from '@mattermost/compass-icons/components/mark-as-unread';
import MessageCheckOutlineIcon from '@mattermost/compass-icons/components/message-check-outline';
import MessageMinusOutlineIcon from '@mattermost/compass-icons/components/message-minus-outline';
import OpenInNewIcon from '@mattermost/compass-icons/components/open-in-new';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import PinOutlineIcon from '@mattermost/compass-icons/components/pin-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import ReplyOutlineIcon from '@mattermost/compass-icons/components/reply-outline';
import SortAlphabeticalAscendingIcon from '@mattermost/compass-icons/components/sort-alphabetical-ascending';
import StarOutlineIcon from '@mattermost/compass-icons/components/star-outline';
import TranslateIcon from '@mattermost/compass-icons/components/translate';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import { Icon } from '@mattermost/compass-ui';
import { MenuItem } from '@mattermost/compass-ui';
import {
  PopoverMenuDivider,
  PopoverMenuGroup,
  PopoverMenu} from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/patterns.module.scss';

function messageMenuShortcutLabel(text: string, danger?: boolean) {
  return (
    <span
      style={{
        fontSize: 'var(--font-size-75)',
        lineHeight: 'var(--line-height-75)',
        color: danger ? 'var(--color-danger)' : 'var(--center-channel-color)',
        opacity: 0.75,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </span>
  );
}

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

function ChannelMenuExample() {
  return (
    <PopoverMenu style={{ width: '174px' }}>
      <PopoverMenuGroup>
        <MenuItem
          label="Mark as read"
          leadingVisual={<Icon glyph={<MarkAsUnreadIcon />} size="16" />}
        />
        <MenuItem
          label="Favorite"
          leadingVisual={<Icon glyph={<StarOutlineIcon />} size="16" />}
        />
        <MenuItem
          label="Mute channel"
          leadingVisual={<Icon glyph={<BellOffOutlineIcon />} size="16" />}
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
      </PopoverMenuGroup>
      <PopoverMenuDivider />
      <PopoverMenuGroup>
        <MenuItem
          label="Copy link"
          leadingVisual={<Icon glyph={<LinkVariantIcon />} size="16" />}
        />
        <MenuItem
          label="Add members"
          leadingVisual={<Icon glyph={<AccountPlusOutlineIcon />} size="16" />}
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

interface TeamMenuExampleProps {
  /** Shows Manage members and Manage groups (team admin). */
  adminOptions?: boolean;
  /** Shows Create a team. */
  createTeamPermission?: boolean;
  /** Shows Join another team. */
  joinTeamPermission?: boolean;
}

function TeamMenuExample({
  adminOptions = false,
  createTeamPermission = false,
  joinTeamPermission = true,
}: TeamMenuExampleProps) {
  return (
    <PopoverMenu style={{ width: '260px' }}>
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
          leadingVisual={<Icon glyph={<AccountMultipleOutlineIcon />} size="16" />}
        />
        {adminOptions && (
          <MenuItem
            label="Manage members"
            leadingVisual={<Icon glyph={<AccountMultipleOutlineIcon />} size="16" />}
          />
        )}
        {adminOptions && (
          <MenuItem
            label="Manage groups"
            leadingVisual={<Icon glyph={<AccountMultipleOutlineIcon />} size="16" />}
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
          label="Learn about teams"
          leadingVisual={
            <span style={{ color: 'var(--link-color)' }}>
              <Icon glyph={<LightbulbOutlineIcon />} size="16" />
            </span>
          }
          style={{ color: 'var(--link-color)' }}
        />
      </PopoverMenuGroup>
    </PopoverMenu>
  );
}

function PlusMenuExample() {
  return (
    <PopoverMenu style={{ width: '260px' }}>
      <PopoverMenuGroup>
        <MenuItem
          label="Browse channels"
          leadingVisual={<Icon glyph={<GlobeIcon />} size="16" />}
        />
        <MenuItem
          label="Create new channel"
          leadingVisual={<Icon glyph={<PlusIcon />} size="16" />}
        />
        <MenuItem
          label="Open a direct message"
          leadingVisual={<Icon glyph={<AccountOutlineIcon />} size="16" />}
        />
      </PopoverMenuGroup>
      <PopoverMenuDivider />
      <PopoverMenuGroup>
        <MenuItem
          label="Create new category"
          leadingVisual={<Icon glyph={<FolderPlusOutlineIcon />} size="16" />}
        />
      </PopoverMenuGroup>
      <PopoverMenuDivider />
      <PopoverMenuGroup>
        <MenuItem
          label="Invite people"
          secondaryLabel="Add or invite people to team"
          leadingVisual={<Icon glyph={<AccountPlusOutlineIcon />} size="16" />}
        />
      </PopoverMenuGroup>
    </PopoverMenu>
  );
}

function ChannelCategoryMenuExample() {
  return (
    <PopoverMenu style={{ width: '247px' }}>
      <PopoverMenuGroup>
        <MenuItem
          label="Mute category"
          leadingVisual={<Icon glyph={<BellOffOutlineIcon />} size="16" />}
        />
        <MenuItem
          label="Rename category"
          leadingVisual={<Icon glyph={<PencilOutlineIcon />} size="16" />}
        />
        <MenuItem
          label="Delete category"
          destructive
          leadingVisual={<Icon glyph={<TrashCanOutlineIcon />} size="16" />}
        />
      </PopoverMenuGroup>
      <PopoverMenuDivider />
      <PopoverMenuGroup>
        <MenuItem
          label="Sort"
          leadingVisual={<Icon glyph={<SortAlphabeticalAscendingIcon />} size="16" />}
          trailingElement
          trailingVisual={
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--spacing-xxs)',
              }}
            >
              <span
                style={{
                  fontSize: 'var(--font-size-75)',
                  lineHeight: 'var(--line-height-75)',
                  color: 'var(--center-channel-color)',
                  opacity: 0.75,
                  whiteSpace: 'nowrap',
                }}
              >
                Alphabetically
              </span>
              <Icon glyph={<ChevronRightIcon />} size="16" />
            </span>
          }
        />
      </PopoverMenuGroup>
      <PopoverMenuDivider />
      <PopoverMenuGroup>
        <MenuItem
          label="Browse channels"
          leadingVisual={<Icon glyph={<GlobeIcon />} size="16" />}
        />
        <MenuItem
          label="Create new channel"
          leadingVisual={<Icon glyph={<PlusIcon />} size="16" />}
        />
      </PopoverMenuGroup>
      <PopoverMenuDivider />
      <PopoverMenuGroup>
        <MenuItem
          label="Create new category"
          leadingVisual={<Icon glyph={<FolderMoveOutlineIcon />} size="16" />}
        />
      </PopoverMenuGroup>
    </PopoverMenu>
  );
}

interface MessageMoreOptionsMenuExampleProps {
  permissionToEdit?: boolean;
  showFlagOption?: boolean;
}

function MessageMoreOptionsMenuExample({
  permissionToEdit = true,
  showFlagOption = true,
}: MessageMoreOptionsMenuExampleProps) {
  return (
    <PopoverMenu style={{ width: '236px' }}>
      <PopoverMenuGroup>
        <MenuItem
          label="Reply"
          leadingVisual={<Icon glyph={<ReplyOutlineIcon />} size="16" />}
          trailingElement
          trailingVisual={messageMenuShortcutLabel('R')}
        />
        <MenuItem
          label="Forward"
          leadingVisual={<Icon glyph={<ArrowRightBoldOutlineIcon />} size="16" />}
          trailingElement
          trailingVisual={messageMenuShortcutLabel('Shift + F')}
        />
        <MenuItem
          label="Follow thread"
          leadingVisual={<Icon glyph={<MessageCheckOutlineIcon />} size="16" />}
          trailingElement
          trailingVisual={messageMenuShortcutLabel('F')}
        />
        <MenuItem
          label="Mark as unread"
          leadingVisual={<Icon glyph={<MarkAsUnreadIcon />} size="16" />}
          trailingElement
          trailingVisual={messageMenuShortcutLabel('U')}
        />
        <MenuItem
          label="Save"
          leadingVisual={<Icon glyph={<BookmarkOutlineIcon />} size="16" />}
          trailingElement
          trailingVisual={messageMenuShortcutLabel('S')}
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
          trailingVisual={messageMenuShortcutLabel('P')}
        />
      </PopoverMenuGroup>
      <PopoverMenuDivider />
      <PopoverMenuGroup>
        <MenuItem
          label="Copy text"
          leadingVisual={<Icon glyph={<ContentCopyIcon />} size="16" />}
          trailingElement
          trailingVisual={messageMenuShortcutLabel('C')}
        />
        <MenuItem
          label="Show translation"
          leadingVisual={<Icon glyph={<TranslateIcon />} size="16" />}
        />
        <MenuItem
          label="Copy link"
          leadingVisual={<Icon glyph={<LinkVariantIcon />} size="16" />}
          trailingElement
          trailingVisual={messageMenuShortcutLabel('K')}
        />
      </PopoverMenuGroup>
      {permissionToEdit && (
        <>
          <PopoverMenuDivider />
          <PopoverMenuGroup>
            <MenuItem
              label="Edit"
              leadingVisual={<Icon glyph={<PencilOutlineIcon />} size="16" />}
              trailingElement
              trailingVisual={messageMenuShortcutLabel('E')}
            />
            <MenuItem
              label="Delete"
              destructive
              leadingVisual={<Icon glyph={<TrashCanOutlineIcon />} size="16" />}
              trailingElement
              trailingVisual={messageMenuShortcutLabel('delete', true)}
            />
          </PopoverMenuGroup>
        </>
      )}
      {showFlagOption && (
        <>
          {!permissionToEdit && <PopoverMenuDivider />}
          <PopoverMenuGroup>
            <MenuItem
              label="Flag message"
              destructive
              leadingVisual={<Icon glyph={<FlagOutlineIcon />} size="16" />}
            />
          </PopoverMenuGroup>
        </>
      )}
    </PopoverMenu>
  );
}

function ThreadActionsMenuExample() {
  return (
    <PopoverMenu style={{ width: '268px' }}>
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
          trailingVisual={messageMenuShortcutLabel('U')}
        />
        <MenuItem
          label="Save"
          leadingVisual={<Icon glyph={<BookmarkOutlineIcon />} size="16" />}
          trailingElement
          trailingVisual={messageMenuShortcutLabel('S')}
        />
      </PopoverMenuGroup>
      <PopoverMenuDivider />
      <PopoverMenuGroup>
        <MenuItem
          label="Copy link"
          leadingVisual={<Icon glyph={<LinkVariantIcon />} size="16" />}
          trailingElement
          trailingVisual={messageMenuShortcutLabel('K')}
        />
      </PopoverMenuGroup>
    </PopoverMenu>
  );
}

function HelpMenuExample() {
  return (
    <PopoverMenu style={{ width: '232px' }}>
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
        <h2 className={styles['patterns__section-title']}>Channel header menu</h2>
        <p className={styles['patterns__variant-label']}>
          Header overflow pattern: settings, members, more actions, archive
        </p>
        <div className={styles['patterns__popover-menu-demo']}>
          <ChannelHeaderMenuExample />
        </div>
      </section>

      <section className={styles['patterns__section']}>
        <h2 className={styles['patterns__section-title']}>Channel menu</h2>
        <p className={styles['patterns__variant-label']}>
          Narrow width (174px): read/favorite/mute, move submenu, link and
          members, destructive leave
        </p>
        <div className={styles['patterns__popover-menu-demo']}>
          <ChannelMenuExample />
        </div>
      </section>

      <section className={styles['patterns__section']}>
        <h2 className={styles['patterns__section-title']}>Help menu</h2>
        <p className={styles['patterns__variant-label']}>
          Compact width, single group, Menu Item rows with leading icons
        </p>
        <div className={styles['patterns__popover-menu-demo']}>
          <HelpMenuExample />
        </div>
      </section>

      <section className={styles['patterns__section']}>
        <h2 className={styles['patterns__section-title']}>Team menu</h2>
        <p className={styles['patterns__variant-label']}>
          Default: secondary label on Invite, join team permission, link-style
          footer row
        </p>
        <div className={styles['patterns__popover-menu-demo']}>
          <TeamMenuExample />
        </div>
        <p
          className={styles['patterns__variant-label']}
          style={{ marginTop: 'var(--spacing-l)' }}
        >
          With admin and create team (Manage members, Manage groups, Create a
          team)
        </p>
        <div className={styles['patterns__popover-menu-demo']}>
          <TeamMenuExample
            adminOptions
            createTeamPermission
            joinTeamPermission
          />
        </div>
      </section>

      <section className={styles['patterns__section']}>
        <h2 className={styles['patterns__section-title']}>Plus menu</h2>
        <p className={styles['patterns__variant-label']}>
          Channel actions, category creation, invite row with secondary label
        </p>
        <div className={styles['patterns__popover-menu-demo']}>
          <PlusMenuExample />
        </div>
      </section>

      <section className={styles['patterns__section']}>
        <h2 className={styles['patterns__section-title']}>Channel category menu</h2>
        <p className={styles['patterns__variant-label']}>
          Category actions, sort row with trailing detail and chevron, browse /
          create channels, create new category
        </p>
        <div className={styles['patterns__popover-menu-demo']}>
          <ChannelCategoryMenuExample />
        </div>
      </section>

      <section className={styles['patterns__section']}>
        <h2 className={styles['patterns__section-title']}>
          Message more options menu
        </h2>
        <p className={styles['patterns__variant-label']}>
          Keyboard hints, remind submenu chevron, copy actions, optional edit and
          flag rows
        </p>
        <div className={styles['patterns__popover-menu-demo']}>
          <MessageMoreOptionsMenuExample />
        </div>
        <p
          className={styles['patterns__variant-label']}
          style={{ marginTop: 'var(--spacing-l)' }}
        >
          Without edit or flag (view-only permissions)
        </p>
        <div className={styles['patterns__popover-menu-demo']}>
          <MessageMoreOptionsMenuExample
            permissionToEdit={false}
            showFlagOption={false}
          />
        </div>
      </section>

      <section className={styles['patterns__section']}>
        <h2 className={styles['patterns__section-title']}>Thread actions menu</h2>
        <p className={styles['patterns__variant-label']}>
          Thread follow and open actions, shortcuts on unread/save, copy link
          group
        </p>
        <div className={styles['patterns__popover-menu-demo']}>
          <ThreadActionsMenuExample />
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
