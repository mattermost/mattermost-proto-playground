import { GlobalHeader } from '@mattermost/compass-ui';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import styles from '@/styles/library-demo/patterns.module.scss';

export default function GlobalHeaderLibrary() {
  return (
    <div className={styles['patterns__global-header-demo']}>
      <p className={styles['patterns__variant-label']}>Channels</p>
      <GlobalHeader
        product="Channels"
        userAvatarSrc={avatarLeonard}
        userAvatarAlt="Leonard Riley"
      />
      <p className={styles['patterns__variant-label']}>
        Channels — with Upgrade
      </p>
      <GlobalHeader
        product="Channels"
        showUpgradeButton
        userAvatarSrc={avatarLeonard}
        userAvatarAlt="Leonard Riley"
      />
      <p className={styles['patterns__variant-label']}>Playbooks</p>
      <GlobalHeader
        product="Playbooks"
        userAvatarSrc={avatarLeonard}
        userAvatarAlt="Leonard Riley"
      />
      <p className={styles['patterns__variant-label']}>Boards</p>
      <GlobalHeader
        product="Boards"
        userAvatarSrc={avatarLeonard}
        userAvatarAlt="Leonard Riley"
      />
    </div>
  );
}
