import { AdminConsoleSidebar } from '@mattermost/compass-ui';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import AnatomyStage from '@/guidelines/_components/AnatomyStage';
import patternsStyles from '@/styles/library-demo/patterns.module.scss';

/**
 * Admin Console Sidebar pattern — anatomy preview on the shared AnatomyStage surface.
 */
export function AdminConsoleSidebarAnatomyStage() {
  return (
    <AnatomyStage style={{ alignItems: 'stretch' }}>
      <div className={patternsStyles['patterns__team-sidebar-demo']}>
        <AdminConsoleSidebar
          avatarSrc={avatarLeonard}
          avatarAlt="Leonard Riley"
        />
      </div>
    </AnatomyStage>
  );
}
