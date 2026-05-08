import {
  ChannelsSidebarHeader,
  type ChannelsSidebarHeaderProps,
} from '@/components/ui/ChannelsSidebar/ChannelsSidebar';
import styles from '@/components/ui/ChannelsSidebar/ChannelsSidebar.module.scss';

/**
 * Sidebar chrome strip with only the team header row — for guideline previews.
 */
export function ChannelSidebarHeaderPreview({
  teamName = 'Contributors',
}: Partial<ChannelsSidebarHeaderProps>) {
  return (
    <div
      className={`${styles['channels-sidebar']} ${styles['channels-sidebar--header-preview']}`}
    >
      <ChannelsSidebarHeader teamName={teamName} />
    </div>
  );
}
