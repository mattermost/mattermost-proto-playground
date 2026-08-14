import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import {
  ChannelCategoryMenu,
  ChannelHeaderMenu,
  ChannelMenu,
  HelpMenu,
  Icon,
  MenuItem,
  MessageMoreOptionsMenu,
  PlusMenu,
  PopoverMenu,
  ProductSwitcherMenu,
  TeamMenu,
  ThreadActionsMenu,
} from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/patterns.module.scss';

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
          <ChannelHeaderMenu />
        </div>
      </section>

      <section className={styles['patterns__section']}>
        <h2 className={styles['patterns__section-title']}>Product switcher menu</h2>
        <p className={styles['patterns__variant-label']}>
          Built-in products plus Agents via additionalProducts; trailing check
          on the active product
        </p>
        <div className={styles['patterns__popover-menu-demo']}>
          <ProductSwitcherMenu
            selectedProduct="agents"
            additionalProducts={[
              {
                id: 'agents',
                label: 'Agents',
                icon: <CreationOutlineIcon />,
              },
            ]}
          />
        </div>
      </section>

      <section className={styles['patterns__section']}>
        <h2 className={styles['patterns__section-title']}>Channel menu</h2>
        <p className={styles['patterns__variant-label']}>
          Narrow width (174px): read/favorite/mute, move submenu, link and
          members, destructive leave
        </p>
        <div className={styles['patterns__popover-menu-demo']}>
          <ChannelMenu />
        </div>
      </section>

      <section className={styles['patterns__section']}>
        <h2 className={styles['patterns__section-title']}>Help menu</h2>
        <p className={styles['patterns__variant-label']}>
          Compact width, single group, Menu Item rows with leading icons
        </p>
        <div className={styles['patterns__popover-menu-demo']}>
          <HelpMenu />
        </div>
      </section>

      <section className={styles['patterns__section']}>
        <h2 className={styles['patterns__section-title']}>Team menu</h2>
        <p className={styles['patterns__variant-label']}>
          Default: secondary label on Invite, join team permission, link-style
          footer row
        </p>
        <div className={styles['patterns__popover-menu-demo']}>
          <TeamMenu />
        </div>
        <p
          className={styles['patterns__variant-label']}
          style={{ marginTop: 'var(--spacing-l)' }}
        >
          With admin and create team (Manage members, Manage groups, Create a
          team)
        </p>
        <div className={styles['patterns__popover-menu-demo']}>
          <TeamMenu adminOptions createTeamPermission joinTeamPermission />
        </div>
      </section>

      <section className={styles['patterns__section']}>
        <h2 className={styles['patterns__section-title']}>Plus menu</h2>
        <p className={styles['patterns__variant-label']}>
          Channel actions, category creation, invite row with secondary label
        </p>
        <div className={styles['patterns__popover-menu-demo']}>
          <PlusMenu />
        </div>
      </section>

      <section className={styles['patterns__section']}>
        <h2 className={styles['patterns__section-title']}>Channel category menu</h2>
        <p className={styles['patterns__variant-label']}>
          Category actions, sort row with trailing detail and chevron, browse /
          create channels, create new category
        </p>
        <div className={styles['patterns__popover-menu-demo']}>
          <ChannelCategoryMenu />
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
          <MessageMoreOptionsMenu />
        </div>
        <p
          className={styles['patterns__variant-label']}
          style={{ marginTop: 'var(--spacing-l)' }}
        >
          Without edit or flag (view-only permissions)
        </p>
        <div className={styles['patterns__popover-menu-demo']}>
          <MessageMoreOptionsMenu
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
          <ThreadActionsMenu />
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
