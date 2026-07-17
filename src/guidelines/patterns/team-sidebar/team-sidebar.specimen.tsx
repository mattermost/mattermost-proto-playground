import { TeamSidebar } from '@mattermost/compass-ui';
import avatarStaffTeam from '@/assets/avatars/Staff Team.png';
import styles from '@/styles/library-demo/patterns.module.scss';

export default function TeamSidebarLibrary() {
  return (
    <div className={styles['patterns__team-sidebar-demo']}>
      <TeamSidebar
        activeTeamId="contributors"
        teams={[
          { id: 'contributors', name: 'Contributors', src: avatarStaffTeam },
          { id: 'design', name: 'Design', initials: 'De', unread: true },
          { id: 'acme', name: 'Acme', initials: 'Ac', mentions: 3 },
        ]}
      />
    </div>
  );
}
