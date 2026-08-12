import type { ReactNode } from 'react';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import AccountPlusOutlineIcon from '@mattermost/compass-icons/components/account-plus-outline';
import BellOutlineIcon from '@mattermost/compass-icons/components/bell-outline';
import CogOutlineIcon from '@mattermost/compass-icons/components/cog-outline';
import FileTextOutlineIcon from '@mattermost/compass-icons/components/file-text-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import PinOutlineIcon from '@mattermost/compass-icons/components/pin-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import StarOutlineIcon from '@mattermost/compass-icons/components/star-outline';
import ActionButton from '@/components/ui/ActionButton/ActionButton';
import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import ChannelShell from '@/components/ui/ChannelShell/ChannelShell';
import Divider from '@/components/ui/Divider/Divider';
import Icon from '@/components/ui/Icon/Icon';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import RightSidebar from '@/components/ui/RightSidebar/RightSidebar';
import RightSidebarHeader from '@/components/ui/RightSidebar/RightSidebarHeader/RightSidebarHeader';
import { FIELD_NAME, HOST_CHANNEL } from '../valueMenuModel';
import styles from './ChannelInfoSurface.module.scss';

export interface ChannelInfoSurfaceProps {
  /** Live `Classification` row value — the coloured marking chip. */
  classificationField: ReactNode;
  /** Live `Program` row — the chip trigger plus its menu and notice. */
  programField: ReactNode;
  /** The banner marking under the channel header, mirroring Classification. */
  classificationBanner: ReactNode;
  banner?: ReactNode;
}

/**
 * Surface 3 — the Channel Info right-hand sidebar.
 *
 * 400px wide, so this is the real test. There is no room for a panel, and a
 * 284px flyout beside a 284px popover cannot fit — the earlier build had to flip
 * its submenus leftward over the centre channel to survive here, which is one of
 * the reasons the hierarchy now expands inline instead. The menu opens
 * right-aligned to its trigger and grows downward only. If the design survives
 * here it survives everywhere; the two wider hosts get the same component with no
 * narrow-case branch.
 */
export default function ChannelInfoSurface({
  classificationField,
  programField,
  classificationBanner,
  banner,
}: ChannelInfoSurfaceProps) {
  return (
    <div className={styles['channel-info']}>
      {banner}
      <div className={styles['channel-info__shell']}>
        <ChannelShell
          teamName="DR Team"
          channelHeader={
            <ChannelHeader
              name={HOST_CHANNEL.name}
              memberCount={HOST_CHANNEL.memberCount}
              pinnedCount={1}
              infoToggled
            />
          }
          trailing={
            <RightSidebar
              header={
                <RightSidebarHeader
                  title="Info"
                  secondaryTitle={HOST_CHANNEL.name}
                  onExpand={() => undefined}
                  onClose={() => undefined}
                />
              }
            >
              <div className={styles['channel-info__body']}>
                <div className={styles['channel-info__actions']}>
                  <ActionButton
                    icon={<Icon size="20" glyph={<StarOutlineIcon />} />}
                    label="Favorite"
                  />
                  <ActionButton
                    icon={<Icon size="20" glyph={<BellOutlineIcon />} />}
                    label="Mute"
                  />
                  <ActionButton
                    icon={<Icon size="20" glyph={<AccountPlusOutlineIcon />} />}
                    label="Add People"
                  />
                  <ActionButton
                    icon={<Icon size="20" glyph={<LinkVariantIcon />} />}
                    label="Copy Link"
                  />
                </div>

                <h3 className={styles['channel-info__name']}>
                  {HOST_CHANNEL.name}
                </h3>

                <div className={styles['channel-info__group']}>
                  <span className={styles['channel-info__group-title']}>
                    CHANNEL ATTRIBUTES
                  </span>

                  <div className={styles['channel-info__attr-row']}>
                    <span className={styles['channel-info__attr-label']}>
                      Classification
                      <span className={styles['channel-info__lock']}>
                        <Icon size="12" glyph={<LockOutlineIcon />} />
                      </span>
                    </span>
                    <div className={styles['channel-info__attr-value']}>
                      {classificationField}
                    </div>
                  </div>

                  <div className={styles['channel-info__attr-row']}>
                    <span className={styles['channel-info__attr-label']}>
                      {FIELD_NAME}
                      <span className={styles['channel-info__lock']}>
                        <Icon size="12" glyph={<LockOutlineIcon />} />
                      </span>
                    </span>
                    <div className={styles['channel-info__attr-value']}>
                      {programField}
                    </div>
                  </div>

                  <button type="button" className={styles['channel-info__add']}>
                    <Icon size="16" glyph={<PlusIcon />} />
                    <span>Add attribute</span>
                  </button>
                </div>

                <div className={styles['channel-info__group']}>
                  <span className={styles['channel-info__group-title']}>
                    CHANNEL PURPOSE
                  </span>
                  <p className={styles['channel-info__purpose']}>
                    {HOST_CHANNEL.purpose}
                  </p>
                </div>

                <Divider />

                <nav className={styles['channel-info__menu']}>
                  <MenuItem
                    label="Channel Settings"
                    leadingVisual={
                      <Icon size="16" glyph={<CogOutlineIcon />} />
                    }
                  />
                  <MenuItem
                    label="Notification Preferences"
                    leadingVisual={
                      <Icon size="16" glyph={<BellOutlineIcon />} />
                    }
                  />
                  <MenuItem
                    label="Members"
                    secondaryLabel={String(HOST_CHANNEL.memberCount)}
                    secondaryLabelPosition="Inline"
                    leadingVisual={
                      <Icon size="16" glyph={<AccountMultipleOutlineIcon />} />
                    }
                  />
                  <MenuItem
                    label="Pinned Messages"
                    secondaryLabel="1"
                    secondaryLabelPosition="Inline"
                    leadingVisual={
                      <Icon size="16" glyph={<PinOutlineIcon />} />
                    }
                  />
                  <MenuItem
                    label="Files"
                    secondaryLabel="12"
                    secondaryLabelPosition="Inline"
                    leadingVisual={
                      <Icon size="16" glyph={<FileTextOutlineIcon />} />
                    }
                  />
                </nav>
              </div>
            </RightSidebar>
          }
        >
          <div className={styles['channel-info__center']}>
            {classificationBanner}
            <p className={styles['channel-info__welcome']}>
              Welcome to the {HOST_CHANNEL.name} channel. This channel has
              limited access rules applied.
            </p>
          </div>
        </ChannelShell>
      </div>
    </div>
  );
}
