import {
  ChannelsSidebarHeader,
  ChannelsSidebarNavigator,
  channelsSidebarStyles as sidebarStyles,
} from '@mattermost/compass-ui/components/channels-sidebar';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import styles from './AcvcNoAccessSidebar.module.scss';

/** Sidebar chrome with explanatory copy when every channel is withheld. */
export default function AcvcNoAccessSidebar() {
  return (
    <div className={sidebarStyles['channels-sidebar']}>
      <ChannelsSidebarHeader teamName="Contributors" />
      <ChannelsSidebarNavigator />

      <div className={sidebarStyles['channels-sidebar__scroll-view']}>
        <Scrollbar
          color="--sidebar-text-rgb"
          className={styles['acvc-no-access-sidebar__scroll']}
        >
          <div className={styles['acvc-no-access-sidebar__empty']}>
            <p className={styles['acvc-no-access-sidebar__title']}>No channels to show</p>
            <p className={styles['acvc-no-access-sidebar__text']}>
              Channels and direct messages are not available in this session.
            </p>
          </div>
        </Scrollbar>
      </div>
    </div>
  );
}
