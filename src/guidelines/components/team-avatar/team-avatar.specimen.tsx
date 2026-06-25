import avatarStaffTeam from '@/assets/avatars/Staff Team.png';
import { TeamAvatar } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function TeamAvatarLibrary() {
  return (
    <>
      <div
        className={`${styles['components__button-block']} ${styles['components__button-block--sidebar-header-bg']}`}
      >
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Default — Image (hover to preview)
          </span>
          <TeamAvatar src={avatarStaffTeam} alt="Staff Team" size="24" />
          <TeamAvatar src={avatarStaffTeam} alt="Staff Team" size="32" />
          <TeamAvatar src={avatarStaffTeam} alt="Staff Team" size="40" />
          <TeamAvatar src={avatarStaffTeam} alt="Staff Team" size="48" />
          <TeamAvatar src={avatarStaffTeam} alt="Staff Team" size="56" />
          <TeamAvatar src={avatarStaffTeam} alt="Staff Team" size="64" />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Active — Image
          </span>
          <TeamAvatar
            src={avatarStaffTeam}
            alt="Staff Team"
            size="24"
            state="Active"
          />
          <TeamAvatar
            src={avatarStaffTeam}
            alt="Staff Team"
            size="32"
            state="Active"
          />
          <TeamAvatar
            src={avatarStaffTeam}
            alt="Staff Team"
            size="40"
            state="Active"
          />
          <TeamAvatar
            src={avatarStaffTeam}
            alt="Staff Team"
            size="48"
            state="Active"
          />
          <TeamAvatar
            src={avatarStaffTeam}
            alt="Staff Team"
            size="56"
            state="Active"
          />
          <TeamAvatar
            src={avatarStaffTeam}
            alt="Staff Team"
            size="64"
            state="Active"
          />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Default — Fallback (hover to preview)
          </span>
          <TeamAvatar initials="Ac" alt="Core Team" size="24" />
          <TeamAvatar initials="Ac" alt="Core Team" size="32" />
          <TeamAvatar initials="Ac" alt="Core Team" size="40" />
          <TeamAvatar initials="Ac" alt="Core Team" size="48" />
          <TeamAvatar initials="Ac" alt="Core Team" size="56" />
          <TeamAvatar initials="Ac" alt="Core Team" size="64" />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Active — Fallback
          </span>
          <TeamAvatar
            initials="Ac"
            alt="Design Team"
            size="24"
            state="Active"
          />
          <TeamAvatar
            initials="Ac"
            alt="Design Team"
            size="32"
            state="Active"
          />
          <TeamAvatar
            initials="Ac"
            alt="Design Team"
            size="40"
            state="Active"
          />
          <TeamAvatar
            initials="Ac"
            alt="Design Team"
            size="48"
            state="Active"
          />
          <TeamAvatar
            initials="Ac"
            alt="Design Team"
            size="56"
            state="Active"
          />
          <TeamAvatar
            initials="Ac"
            alt="Design Team"
            size="64"
            state="Active"
          />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Badge</span>
          <TeamAvatar
            src={avatarStaffTeam}
            alt="Staff Team"
            size="32"
            badge={1}
          />
          <TeamAvatar
            src={avatarStaffTeam}
            alt="Staff Team"
            size="40"
            badge={5}
          />
          <TeamAvatar
            src={avatarStaffTeam}
            alt="Staff Team"
            size="56"
            badge={99}
          />
        </div>
      </div>
    </>
  );
}
