import StarOutlineIcon from '@mattermost/compass-icons/components/star-outline';
import BellOutlineIcon from '@mattermost/compass-icons/components/bell-outline';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import PinOutlineIcon from '@mattermost/compass-icons/components/pin-outline';
import FileTextOutlineIcon from '@mattermost/compass-icons/components/file-text-outline';
import { ActionButton, Divider, Icon, MenuItem } from '@mattermost/compass-ui';
import styles from './RightSidebarChannelInfo.module.scss';

export default function RightSidebarChannelInfo() {
  return (
    <>
      <div className={styles['right-sidebar-channel-info__actions']}>
        <ActionButton
          className={styles['right-sidebar-channel-info__action']}
          icon={<Icon size="20" glyph={<StarOutlineIcon />} />}
          label="Favorite"
        />
        <ActionButton
          className={styles['right-sidebar-channel-info__action']}
          icon={<Icon size="20" glyph={<BellOutlineIcon />} />}
          label="Mute"
        />
        <ActionButton
          className={styles['right-sidebar-channel-info__action']}
          icon={<Icon size="20" glyph={<AccountPlusOutlineIcon />} />}
          label="Add people"
        />
        <ActionButton
          className={styles['right-sidebar-channel-info__action']}
          icon={<Icon size="20" glyph={<LinkVariantIcon />} />}
          label="Copy Link"
        />
      </div>

      <div className={styles['right-sidebar-channel-info__about']}>
        <h3 className={styles['right-sidebar-channel-info__name']}>UX Design</h3>

        <div className={styles['right-sidebar-channel-info__group']}>
          <span className={styles['right-sidebar-channel-info__group-title']}>
            Channel Purpose
          </span>
          <p className={styles['right-sidebar-channel-info__body-text']}>
            Discussion of UX by core contributors and staff.
          </p>
        </div>

        <div className={styles['right-sidebar-channel-info__group']}>
          <span className={styles['right-sidebar-channel-info__group-title']}>
            Channel Header
          </span>
          <p className={styles['right-sidebar-channel-info__header-text']}>
            <a href="#" className={styles['right-sidebar-channel-info__link']}>
              Spec Template
            </a>
            {' | '}
            <a href="#" className={styles['right-sidebar-channel-info__link']}>
              UX Guidelines
            </a>
            {' | '}
            <a href="#" className={styles['right-sidebar-channel-info__link']}>
              UX Scratch
            </a>
            {' | '}
            <a href="#" className={styles['right-sidebar-channel-info__link']}>
              (Internal) UX Folder
            </a>
            {' | '}
            <a href="#" className={styles['right-sidebar-channel-info__link']}>
              Design Checklist
            </a>
            {' | '}
            <a href="#" className={styles['right-sidebar-channel-info__link']}>
              Design Checklist
            </a>
            {' | '}
            <a href="#" className={styles['right-sidebar-channel-info__link']}>
              Design Meeting Notes
            </a>
            {' | '}
            <a href="#" className={styles['right-sidebar-channel-info__link']}>
              OKRs…
            </a>{' '}
            <a
              href="#"
              className={[
                styles['right-sidebar-channel-info__link'],
                styles['right-sidebar-channel-info__link-more'],
              ].join(' ')}
            >
              More
            </a>
          </p>
        </div>

        <p className={styles['right-sidebar-channel-info__id']}>
          ID: ggq4jzr8o386bpqytigtswjfr
        </p>
      </div>

      <Divider />

      <nav className={styles['right-sidebar-channel-info__menu']}>
        <MenuItem
          label="Channel Settings"
          leadingVisual={<Icon size="16" glyph={<CogOutlineIcon />} />}
        />
        <MenuItem
          label="Notification Preferences"
          leadingVisual={<Icon size="16" glyph={<BellOutlineIcon />} />}
        />
        <MenuItem
          label="Members"
          leadingVisual={
            <Icon size="16" glyph={<AccountMultipleOutlineIcon />} />
          }
        />
        <MenuItem
          label="Pinned Messages"
          leadingVisual={<Icon size="16" glyph={<PinOutlineIcon />} />}
        />
        <MenuItem
          label="Files"
          leadingVisual={<Icon size="16" glyph={<FileTextOutlineIcon />} />}
        />
      </nav>
    </>
  );
}
