import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import { UserAvatarGroup } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function UserAvatarGroupLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        {(['24', '32', '40'] as const).map((size) => (
          <div key={size} className={styles['components__button-row']}>
            <span className={styles['components__instance-label']}>{size}</span>
            <UserAvatarGroup
              size={size}
              avatars={[
                { key: 'leonard', src: avatarLeonard, name: 'Leonard Riley' },
                {
                  key: 'danielle',
                  src: avatarDanielle,
                  name: 'Danielle Okoro',
                },
                { key: 'marco', src: avatarMarco, name: 'Marco Rinaldi' },
                { key: 'emma', src: avatarEmma, name: 'Emma Novak' },
                { key: 'sofia', src: avatarSofia, name: 'Sofia Bauer' },
              ]}
              max={3}
            />
          </div>
        ))}
      </div>
    </>
  );
}
