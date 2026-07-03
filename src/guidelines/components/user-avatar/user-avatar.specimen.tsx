import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import { UserAvatar } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function UserAvatarLibrary() {
  return (
    <>
      <p
        className={styles['components__subheading']}
        style={{ marginBottom: 'var(--spacing-m)' }}
      >
        User Avatar (Image type only; Fallback and System variants not
        implemented).
      </p>
      <div className={styles['components__row']}>
        <div className={styles['components__instance']}>
          <span className={styles['components__instance-label']}>
            24, no status
          </span>
          <UserAvatar alt="Leonard Riley" src={avatarLeonard} size="24" />
        </div>
        <div className={styles['components__instance']}>
          <span className={styles['components__instance-label']}>32</span>
          <UserAvatar alt="Danielle Okoro" src={avatarDanielle} size="32" />
        </div>
        <div className={styles['components__instance']}>
          <span className={styles['components__instance-label']}>
            48 (default), status
          </span>
          <UserAvatar alt="Marco Rinaldi" src={avatarMarco} size="48" status />
        </div>
        <div className={styles['components__instance']}>
          <span className={styles['components__instance-label']}>64</span>
          <UserAvatar alt="Emma Novak" src={avatarEmma} size="64" />
        </div>
        <div className={styles['components__instance']}>
          <span className={styles['components__instance-label']}>
            96, status
          </span>
          <UserAvatar alt="Sofia Bauer" src={avatarSofia} size="96" status />
        </div>
      </div>
    </>
  );
}
