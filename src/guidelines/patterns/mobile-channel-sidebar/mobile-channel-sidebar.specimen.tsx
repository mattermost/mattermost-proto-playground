import { MobileChannelsSidebar } from '@mattermost/compass-proto';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarArjunPatel from '@/assets/avatars/Arjun Patel.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarDariusCole from '@/assets/avatars/Darius Cole.png';
import avatarDavidLiang from '@/assets/avatars/David Liang.png';
import avatarEmmaNovak from '@/assets/avatars/Emma Novak.png';
import avatarEthanBrooks from '@/assets/avatars/Ethan Brooks.png';
import styles from './mobile-channel-sidebar.specimen.module.scss';

export default function MobileChannelsSidebarLibrary() {
  return (
    <div className={styles['mcs-specimen']}>
      <div className={styles['mcs-specimen__frame']}>
        <MobileChannelsSidebar
          teamName='Contributors'
          subtitle='Community'
          showUnreadsCategory
          avatarAikoTan={avatarAikoTan}
          avatarArjunPatel={avatarArjunPatel}
          avatarDanielleOkoro={avatarDanielle}
          avatarDariusCole={avatarDariusCole}
          avatarDavidLiang={avatarDavidLiang}
          avatarEmmaNovak={avatarEmmaNovak}
          avatarEthanBrooks={avatarEthanBrooks}
        />
      </div>
    </div>
  );
}
