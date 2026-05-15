/**
 * ChannelHeader — channel-view header with the `⋮` dropdown that hosts the
 * A3-specific "Add to Channel Directory" affordance (§3.3.4 surface 2 of 2).
 *
 * In the channel-admin scenario the dropdown is rendered OPEN by default —
 * the load-bearing "honesty surface" requirement: a reviewer must see at a
 * glance that A3 splits the admin operation across two surfaces (Channel
 * Settings here above; this menu down here). No need to hunt for it.
 *
 * On mobile the "Add to Channel Directory" item is replaced with a
 * "Web-only at launch (KD-8)" notice — admin flows are web-only in v1
 * per §3.3.11.
 */
import { useState } from 'react';
import DotsVerticalIcon from '@mattermost/compass-icons/components/dots-vertical';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import FolderPlusOutlineIcon from '@mattermost/compass-icons/components/folder-plus-outline';
import MinusCircleOutlineIcon from '@mattermost/compass-icons/components/minus-circle-outline';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import BellOutlineIcon from '@mattermost/compass-icons/components/bell-outline';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import ArchiveOutlineIcon from '@mattermost/compass-icons/components/archive-outline';
import IconButton from '@/components/ui/IconButton/IconButton';
import Icon from '@/components/ui/Icon/Icon';
import PopoverMenu, {
  PopoverMenuDivider,
} from '@/components/ui/PopoverMenu/PopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import { useViewport, type Persona } from '@/pages/dpc/shared';
import { useA3Channel } from '../A3.context';
import type { A3Store } from '../useA3Store';
import styles from './ChannelHeader.module.scss';

interface ChannelHeaderProps {
  store: A3Store;
  persona: Persona;
  /** When true (admin scenario), the `⋮` menu starts open so the reviewer immediately sees the Add-to-Directory affordance. */
  forceMenuOpen?: boolean;
}

export default function ChannelHeader({
  store,
  persona,
  forceMenuOpen = false,
}: ChannelHeaderProps) {
  const { channel } = useA3Channel();
  const { viewport } = useViewport();
  const [menuOpen, setMenuOpen] = useState(forceMenuOpen);

  const isAdmin = persona === 'channel-admin';
  const isMobile = viewport === 'mobile';
  const inDirectory = store.isChannelInDirectory(channel.id);

  return (
    <section className={styles['dpc-cheader']} aria-label="Channel header">
      <div className={styles['dpc-cheader__row']}>
        <div className={styles['dpc-cheader__lhs']}>
          <span
            className={styles['dpc-cheader__icon']}
            aria-hidden
          >
            <Icon size="16" glyph={<LockOutlineIcon />} />
          </span>
          <div className={styles['dpc-cheader__title-group']}>
            <h3 className={styles['dpc-cheader__name']}>
              {channel.displayName}
            </h3>
            <p className={styles['dpc-cheader__purpose']}>{channel.purpose}</p>
          </div>
        </div>
        <div className={styles['dpc-cheader__actions']}>
          <span className={styles['dpc-cheader__eyebrow']}>
            A3 · Surface 2 of 2 (publish to directory here)
          </span>
          <IconButton
            aria-label={
              menuOpen ? 'Close channel actions' : 'Open channel actions'
            }
            icon={<Icon size="20" glyph={<DotsVerticalIcon />} />}
            toggled={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          />
        </div>
      </div>

      {menuOpen && (
        <div className={styles['dpc-cheader__menu-anchor']}>
          <PopoverMenu className={styles['dpc-cheader__menu']}>
            <MenuItem
              label="View Info"
              leadingVisual={
                <Icon size="16" glyph={<InformationOutlineIcon />} />
              }
              onClick={() => setMenuOpen(false)}
            />
            <MenuItem
              label="Manage Members"
              leadingVisual={
                <Icon size="16" glyph={<AccountMultipleOutlineIcon />} />
              }
              onClick={() => setMenuOpen(false)}
            />
            <MenuItem
              label="Notification Preferences"
              leadingVisual={<Icon size="16" glyph={<BellOutlineIcon />} />}
              onClick={() => setMenuOpen(false)}
            />
            <PopoverMenuDivider />
            {isAdmin && !isMobile && (
              inDirectory ? (
                <MenuItem
                  label="Remove from Channel Directory"
                  secondaryLabel="A3 · publishes off the directory; pending requests auto-withdraw."
                  leadingVisual={
                    <Icon size="16" glyph={<MinusCircleOutlineIcon />} />
                  }
                  destructive
                  onClick={() => {
                    setMenuOpen(false);
                    store.dispatch({
                      type: 'OPEN_REMOVE_DIALOG',
                      channelId: channel.id,
                    });
                  }}
                />
              ) : (
                <MenuItem
                  label="Add to Channel Directory"
                  secondaryLabel="A3-specific · the only surface that controls discoverability."
                  leadingVisual={
                    <Icon size="16" glyph={<FolderPlusOutlineIcon />} />
                  }
                  tag
                  onClick={() => {
                    setMenuOpen(false);
                    store.dispatch({
                      type: 'OPEN_ADD_DIALOG',
                      channelId: channel.id,
                    });
                  }}
                />
              )
            )}
            {isAdmin && isMobile && (
              <MenuItem
                label="Add to Channel Directory"
                secondaryLabel="Web-only at launch (KD-8) — use the desktop client."
                leadingVisual={
                  <Icon size="16" glyph={<FolderPlusOutlineIcon />} />
                }
                disabled
              />
            )}
            <PopoverMenuDivider />
            <MenuItem
              label="Archive Channel"
              leadingVisual={
                <Icon size="16" glyph={<ArchiveOutlineIcon />} />
              }
              destructive
              onClick={() => setMenuOpen(false)}
            />
          </PopoverMenu>
        </div>
      )}

      {forceMenuOpen && isAdmin && !isMobile && (
        <p className={styles['dpc-cheader__caption']}>
          Reviewer note · the dropdown is pinned open for the admin scenario
          so the two-surface admin operation is visible without navigation.
          In production the menu opens on click and closes after selection.
        </p>
      )}
    </section>
  );
}
