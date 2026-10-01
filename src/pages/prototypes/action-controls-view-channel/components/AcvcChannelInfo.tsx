import type { ReactNode } from 'react';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import BellOutlineIcon from '@mattermost/compass-icons/components/bell-outline';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import FileTextOutlineIcon from '@mattermost/compass-icons/components/file-text-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import PinOutlineIcon from '@mattermost/compass-icons/components/pin-outline';
import StarOutlineIcon from '@mattermost/compass-icons/components/star-outline';
import { ActionButton } from '@mattermost/compass-ui/components/action-button';
import { Divider } from '@mattermost/compass-ui/components/divider';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import styles from './AcvcChannelInfo.module.scss';

export interface AcvcChannelInfoProps {
  channelName: string;
  purpose?: string;
  header?: ReactNode;
  onChannelSettings?: () => void;
}

/**
 * Channel Info body for a Write-to-Channels-denied session.
 *
 * Same layout as proto `RightSidebarChannelInfo`, which takes no props in the
 * published package (fixed "UX Design" content, no row handlers). This version
 * carries the active channel's name, purpose, and header, omits Add people
 * (a write action), and wires Channel Settings.
 */
export default function AcvcChannelInfo({
  channelName,
  purpose = '',
  header,
  onChannelSettings,
}: AcvcChannelInfoProps) {
  return (
    <>
      <div className={styles['acvc-channel-info__actions']}>
        <ActionButton
          className={styles['acvc-channel-info__action']}
          icon={<Icon size="20" glyph={<StarOutlineIcon />} />}
          label="Favorite"
        />
        <ActionButton
          className={styles['acvc-channel-info__action']}
          icon={<Icon size="20" glyph={<BellOutlineIcon />} />}
          label="Mute"
        />
        <ActionButton
          className={styles['acvc-channel-info__action']}
          icon={<Icon size="20" glyph={<LinkVariantIcon />} />}
          label="Copy Link"
        />
      </div>

      <div className={styles['acvc-channel-info__about']}>
        <h3 className={styles['acvc-channel-info__name']}>{channelName}</h3>

        <div className={styles['acvc-channel-info__group']}>
          <span className={styles['acvc-channel-info__group-title']}>
            Channel Purpose
          </span>
          <p className={styles['acvc-channel-info__body-text']}>{purpose}</p>
        </div>

        <div className={styles['acvc-channel-info__group']}>
          <span className={styles['acvc-channel-info__group-title']}>
            Channel Header
          </span>
          <p className={styles['acvc-channel-info__header-text']}>{header}</p>
        </div>

        <p className={styles['acvc-channel-info__id']}>
          ID: ggq4jzr8o386bpqytigtswjfr
        </p>
      </div>

      <Divider />

      <nav className={styles['acvc-channel-info__menu']}>
        <MenuItem
          label="Channel Settings"
          leadingVisual={<Icon size="16" glyph={<CogOutlineIcon />} />}
          onClick={onChannelSettings}
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
