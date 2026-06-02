import ChannelsSidebar from '@/components/ui/ChannelsSidebar/ChannelsSidebar';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarArjunPatel from '@/assets/avatars/Arjun Patel.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarDariusCole from '@/assets/avatars/Darius Cole.png';
import avatarDavidLiang from '@/assets/avatars/David Liang.png';
import avatarEmmaNovak from '@/assets/avatars/Emma Novak.png';
import avatarEthanBrooks from '@/assets/avatars/Ethan Brooks.png';
import AnatomyStage from '@/guidelines/_components/AnatomyStage';
import patternsStyles from '@/styles/library-demo/patterns.module.scss';

/**
 * Channel Sidebar pattern — anatomy preview on the shared AnatomyStage surface.
 */
export function ChannelSidebarAnatomyStage() {
  return (
    <AnatomyStage style={{ alignItems: 'stretch' }}>
      <div className={patternsStyles['patterns__team-sidebar-demo']}>
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
    </AnatomyStage>
  );
}
