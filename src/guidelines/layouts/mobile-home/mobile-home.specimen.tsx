import {useState} from 'react';
import {
  MobileChannelsSidebar,
  MobileTabBar,
  MobileTeamSidebar,
  type MobileTabBarTab,
} from '@mattermost/compass-ui';
import DeviceFrame from '@/components/layout/DeviceFrame';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarArjunPatel from '@/assets/avatars/Arjun Patel.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarDariusCole from '@/assets/avatars/Darius Cole.png';
import avatarDavidLiang from '@/assets/avatars/David Liang.png';
import avatarEmmaNovak from '@/assets/avatars/Emma Novak.png';
import avatarEthanBrooks from '@/assets/avatars/Ethan Brooks.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarStaffTeam from '@/assets/avatars/Staff Team.png';
import styles from './mobile-home.specimen.module.scss';

export default function MobileHomeLibrary() {
  const [activeTeamId, setActiveTeamId] = useState('contributors');
  const [activeTab, setActiveTab] = useState<MobileTabBarTab>('home');

  return (
    <div className={styles['mobile-home-layout']}>
      <DeviceFrame insetContent={false} statusBarStyle='light'>
        <div className={styles['mobile-home-layout__shell']}>
          <div className={styles['mobile-home-layout__body']}>
            <MobileTeamSidebar
              activeTeamId={activeTeamId}
              onSelectTeam={setActiveTeamId}
              teams={[
                {
                  id: 'contributors',
                  name: 'Contributors',
                  src: avatarStaffTeam,
                },
                {
                  id: 'design',
                  name: 'Design',
                  initials: 'De',
                  unread: true,
                },
              ]}
            />
            <MobileChannelsSidebar
              teamName={
                activeTeamId === 'design' ? 'Design' : 'Contributors'
              }
              subtitle='Community'
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
          <MobileTabBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            profileSrc={avatarLeonard}
            profileAlt='Leonard Riley'
            mentionsBadge={2}
          />
        </div>
      </DeviceFrame>
    </div>
  );
}
