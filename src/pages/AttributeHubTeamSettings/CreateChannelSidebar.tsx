import { useRef } from 'react';
import {
  ChannelsSidebarNavigator,
  ChannelsSidebarCategory,
} from '@/components/ui/ChannelsSidebar/ChannelsSidebar';
import ChannelSidebarItem from '@/components/ui/ChannelSidebarItem/ChannelSidebarItem';
import IconButton from '@/components/ui/IconButton/IconButton';
import Icon from '@/components/ui/Icon/Icon';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import FixedPopoverMenu from '@/components/ui/FixedPopoverMenu/FixedPopoverMenu';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarArjunPatel from '@/assets/avatars/Arjun Patel.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarDariusCole from '@/assets/avatars/Darius Cole.png';
import avatarEmmaNovak from '@/assets/avatars/Emma Novak.png';
import avatarEthanBrooks from '@/assets/avatars/Ethan Brooks.png';
import CreateChannelSidebarMenu from './CreateChannelSidebarMenu';
import sidebarStyles from '@/components/ui/ChannelsSidebar/ChannelsSidebar.module.scss';
import styles from './CreateChannelSidebar.module.scss';

export type SidebarChannelItem = {
  id: string;
  name: string;
  privacy: 'public' | 'private';
  status?: 'Read' | 'Unread' | 'Mention';
};

export interface CreateChannelSidebarProps {
  menuOpen: boolean;
  onMenuOpen: () => void;
  onMenuClose: () => void;
  onCreateChannel: () => void;
  channels: SidebarChannelItem[];
  activeChannelId: string;
  onSelectChannel: (channelId: string) => void;
}

export default function CreateChannelSidebar({
  menuOpen,
  onMenuOpen,
  onMenuClose,
  onCreateChannel,
  channels,
  activeChannelId,
  onSelectChannel,
}: CreateChannelSidebarProps) {
  const addButtonRef = useRef<HTMLButtonElement>(null);

  const handleCreateChannel = () => {
    onMenuClose();
    onCreateChannel();
  };

  return (
    <div
      className={`${sidebarStyles['channels-sidebar']} ${styles['create-channel-sidebar']}`}
    >
      <div className={sidebarStyles['channels-sidebar__header']}>
        <div className={sidebarStyles['channels-sidebar__team-dropdown']}>
          <span className={sidebarStyles['channels-sidebar__team-name']}>
            Program ALPHA
          </span>
        </div>
        <span ref={addButtonRef} className={styles['create-channel-sidebar__add-wrap']}>
          <IconButton
            aria-label="Add channels"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            size="Small"
            style="Inverted"
            padding="Compact"
            rounded
            icon={<Icon size="16" glyph={<PlusIcon />} />}
            className={sidebarStyles['channels-sidebar__sidebar-icon-button']}
            onClick={onMenuOpen}
          />
        </span>
      </div>

      <ChannelsSidebarNavigator showFilter />

      <div className={sidebarStyles['channels-sidebar__top-group']}>
        <ChannelSidebarItem name="Threads" leadingVisual="Threads" />
        <ChannelSidebarItem
          name="Drafts"
          leadingVisual="Drafts"
          status="Mention"
          mentionCount={1}
        />
      </div>

      <div className={sidebarStyles['channels-sidebar__scroll-view']}>
        <Scrollbars color="--sidebar-text-rgb">
          <div className={sidebarStyles['channels-sidebar__channel-groups']}>
            <div className={sidebarStyles['channels-sidebar__channel-group']}>
              <ChannelsSidebarCategory label="CHANNELS" />
              {channels.map((channel) => (
                <ChannelSidebarItem
                  key={channel.id}
                  name={channel.name}
                  leadingVisual={channel.privacy === 'private' ? 'Private' : 'Public'}
                  status={channel.status}
                  active={channel.id === activeChannelId}
                  onClick={() => onSelectChannel(channel.id)}
                />
              ))}
            </div>

            <div className={sidebarStyles['channels-sidebar__channel-group']}>
              <ChannelsSidebarCategory label="DIRECT MESSAGES" showPlusButton />
              <ChannelSidebarItem
                name="Aiko Tan"
                leadingVisual="Direct Message"
                avatarSrc={avatarAikoTan}
                avatarAlt="Aiko Tan"
                showAvatarStatus
              />
              <ChannelSidebarItem
                name="Arjun Patel"
                leadingVisual="Direct Message"
                avatarSrc={avatarArjunPatel}
                avatarAlt="Arjun Patel"
                showAvatarStatus
              />
              <ChannelSidebarItem
                name="Daniel Okoro"
                leadingVisual="Direct Message"
                avatarSrc={avatarDanielle}
                avatarAlt="Daniel Okoro"
                showAvatarStatus
              />
              <ChannelSidebarItem
                name="Darius Cole"
                leadingVisual="Direct Message"
                avatarSrc={avatarDariusCole}
                avatarAlt="Darius Cole"
                showAvatarStatus
              />
              <ChannelSidebarItem
                name="Emma Novak"
                leadingVisual="Direct Message"
                avatarSrc={avatarEmmaNovak}
                avatarAlt="Emma Novak"
                showAvatarStatus
              />
              <ChannelSidebarItem
                name="Ethan Brooks"
                leadingVisual="Direct Message"
                avatarSrc={avatarEthanBrooks}
                avatarAlt="Ethan Brooks"
                showAvatarStatus
              />
            </div>
          </div>
        </Scrollbars>
      </div>

      <FixedPopoverMenu
        open={menuOpen}
        onClose={onMenuClose}
        anchorRef={addButtonRef}
        align="end"
        minWidthFloor={220}
        className={styles['create-channel-sidebar__menu']}
      >
        <CreateChannelSidebarMenu onCreateChannel={handleCreateChannel} />
      </FixedPopoverMenu>
    </div>
  );
}
