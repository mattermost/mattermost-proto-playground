import { ChannelsSidebar } from '@mattermost/compass-ui';
import AnatomyStage from '@/guidelines/_components/AnatomyStage';
import {
  defaultChannelsSidebarDemoModel,
} from '@/fixtures/channelsSidebarDemo';
import patternsStyles from '@/styles/library-demo/patterns.module.scss';

/**
 * Channel Sidebar pattern — anatomy preview on the shared AnatomyStage surface.
 */
export function ChannelSidebarAnatomyStage() {
  return (
    <AnatomyStage style={{ alignItems: 'stretch' }}>
      <div className={patternsStyles['patterns__team-sidebar-demo']}>
        <ChannelsSidebar
          showFilter
          model={defaultChannelsSidebarDemoModel}
        />
      </div>
    </AnatomyStage>
  );
}
