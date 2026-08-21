import { MobileTeamSidebar } from '@mattermost/compass-proto';
import avatarStaffTeam from '@/assets/avatars/Staff Team.png';
import styles from './mobile-team-sidebar.specimen.module.scss';

export default function MobileTeamSidebarLibrary() {
  return (
    <div className={styles['mts-specimen']}>
      <div className={styles['mts-specimen__frame']}>
        <MobileTeamSidebar
          activeTeamId='contributors'
          teams={[
            {id: 'contributors', name: 'Contributors', src: avatarStaffTeam},
            {id: 'design', name: 'Design', initials: 'De', unread: true},
            {id: 'acme', name: 'Acme', initials: 'Ac', mentions: 3},
          ]}
        />
      </div>
    </div>
  );
}
