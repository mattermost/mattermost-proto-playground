import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import { ThreadFooter } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function ThreadFooterLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Default</span>
          <ThreadFooter
            replyCount={4}
            avatars={[
              { src: avatarLeonard, alt: 'Leonard Riley' },
              { src: avatarDanielle, alt: 'Danielle Okoro' },
              { src: avatarMarco, alt: 'Marco Rinaldi' },
            ]}
          />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Following
          </span>
          <ThreadFooter
            replyCount={2}
            avatars={[
              { src: avatarEmma, alt: 'Emma Novak' },
              { src: avatarSofia, alt: 'Sofia Bauer' },
            ]}
            following
            lastReplyTime="2 mins ago"
          />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Badges</span>
          <ThreadFooter
            replyCount={3}
            badge="Unread"
            avatars={[{ src: avatarLeonard, alt: 'Leonard' }]}
          />
          <ThreadFooter
            replyCount={1}
            badge="Mention"
            avatars={[{ src: avatarDanielle, alt: 'Danielle' }]}
          />
        </div>
      </div>
    </>
  );
}
