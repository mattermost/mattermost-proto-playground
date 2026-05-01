import ChannelsSidebar from '@/components/ui/ChannelsSidebar/ChannelsSidebar';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarArjunPatel from '@/assets/avatars/Arjun Patel.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarDariusCole from '@/assets/avatars/Darius Cole.png';
import avatarDavidLiang from '@/assets/avatars/David Liang.png';
import avatarEmmaNovak from '@/assets/avatars/Emma Novak.png';
import avatarEthanBrooks from '@/assets/avatars/Ethan Brooks.png';
import styles from '@/pages/Patterns/Patterns.module.scss';

export default function ChannelsSidebarLibrary() {
  return (
    <div className={styles['patterns__sidebar-demo']}>
      <div>
        <p className={styles['patterns__variant-label']}>Unreads category Off</p>
        <ChannelsSidebar
          showFilter
          avatarAikoTan={avatarAikoTan}
          avatarArjunPatel={avatarArjunPatel}
          avatarDanielOkoro={avatarDanielle}
          avatarDariusCole={avatarDariusCole}
          avatarDavidLiang={avatarDavidLiang}
          avatarEmmaNovak={avatarEmmaNovak}
          avatarEthanBrooks={avatarEthanBrooks}
        />
      </div>
      <div>
        <p className={styles['patterns__variant-label']}>Unreads category On</p>
        <ChannelsSidebar
          showUnreadsCategory
          avatarAikoTan={avatarAikoTan}
          avatarArjunPatel={avatarArjunPatel}
          avatarDanielOkoro={avatarDanielle}
          avatarDariusCole={avatarDariusCole}
          avatarDavidLiang={avatarDavidLiang}
          avatarEmmaNovak={avatarEmmaNovak}
          avatarEthanBrooks={avatarEthanBrooks}
        />
      </div>
    </div>
  );
}
