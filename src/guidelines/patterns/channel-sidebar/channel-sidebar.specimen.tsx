import { ChannelsSidebar } from '@mattermost/compass-ui';
import { buildDefaultChannelsSidebarModel } from '@mattermost/compass-proto';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarArjunPatel from '@/assets/avatars/Arjun Patel.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarDariusCole from '@/assets/avatars/Darius Cole.png';
import avatarDavidLiang from '@/assets/avatars/David Liang.png';
import avatarEmmaNovak from '@/assets/avatars/Emma Novak.png';
import avatarEthanBrooks from '@/assets/avatars/Ethan Brooks.png';
import styles from '@/styles/library-demo/patterns.module.scss';

const avatarProps = {
  avatarAikoTan,
  avatarArjunPatel,
  avatarDanielOkoro: avatarDanielle,
  avatarDariusCole,
  avatarDavidLiang,
  avatarEmmaNovak,
  avatarEthanBrooks,
};

export default function ChannelsSidebarLibrary() {
  return (
    <div className={styles['patterns__sidebar-demo']}>
      <div>
        <p className={styles['patterns__variant-label']}>
          Unreads category Off
        </p>
        <ChannelsSidebar
          showFilter
          model={buildDefaultChannelsSidebarModel({
            showUnreadsCategory: false,
            ...avatarProps,
          })}
        />
      </div>
      <div>
        <p className={styles['patterns__variant-label']}>Unreads category On</p>
        <ChannelsSidebar
          model={buildDefaultChannelsSidebarModel({
            showUnreadsCategory: true,
            ...avatarProps,
          })}
        />
      </div>
    </div>
  );
}
