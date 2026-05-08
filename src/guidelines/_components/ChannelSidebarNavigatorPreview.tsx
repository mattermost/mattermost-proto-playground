import {
  ChannelsSidebarNavigator,
  type ChannelsSidebarNavigatorProps,
} from '@/components/ui/ChannelsSidebar/ChannelsSidebar';
import styles from '@/components/ui/ChannelsSidebar/ChannelsSidebar.module.scss';

/**
 * Sidebar chrome strip with only the navigator row — for guideline previews.
 */
export function ChannelSidebarNavigatorPreview({
  showFilter = false,
}: Partial<ChannelsSidebarNavigatorProps>) {
  return (
    <div
      className={`${styles['channels-sidebar']} ${styles['channels-sidebar--navigator-preview']}`}
    >
      <ChannelsSidebarNavigator showFilter={showFilter} />
    </div>
  );
}
