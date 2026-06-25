import {
  ChannelsSidebarHeader,
  type ChannelsSidebarHeaderProps,
  channelsSidebarStyles as styles,
} from '@mattermost/compass-ui';

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
