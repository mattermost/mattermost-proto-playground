import { TeamSidebar } from '@mattermost/compass-ui';
import avatarStaffTeam from '@/assets/avatars/Staff Team.png';
import AnatomyStage from '@/guidelines/_components/AnatomyStage';
import patternsStyles from '@/styles/library-demo/patterns.module.scss';

/**
 * Team Sidebar pattern — anatomy preview on the shared AnatomyStage surface.
 */
export function TeamSidebarAnatomyStage() {
  return (
    <AnatomyStage>
      <div className={patternsStyles['patterns__team-sidebar-demo']}>
        <TeamSidebar
          activeTeamId="contributors"
          teams={[
            { id: 'contributors', name: 'Contributors', src: avatarStaffTeam },
            { id: 'design', name: 'Design', initials: 'De', unread: true },
            { id: 'acme', name: 'Acme', initials: 'Ac', mentions: 3 },
          ]}
        />
      </div>
    </AnatomyStage>
  );
}
