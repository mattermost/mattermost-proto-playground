import {
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  MobileChannelsSidebar,
  MobileHome,
  MobileTabBar,
  MobileTeamSidebar,
  type MobileTabBarTab,
} from '@mattermost/compass-ui';
import {avatars} from '../mobileHomeChannelData';
import styles from '../MobileHomeChannel.module.scss';
import MentionsScene from './MentionsScene';
import ProfileScene from './ProfileScene';
import SavedScene from './SavedScene';
import SearchScene from './SearchScene';

const TAB_ORDER: MobileTabBarTab[] = [
  'home',
  'search',
  'mentions',
  'saved',
  'profile',
];

/** Matches `--duration-moderate` (300ms). */
const TAB_TRANSITION_MS = 300;

type HomeSceneProps = {
  activeTab: MobileTabBarTab;
  onTabChange: (tab: MobileTabBarTab) => void;
  onChannelClick: (name: string) => void;
};

type TransitionDirection = 'forward' | 'back';

export default function HomeScene({
  activeTab,
  onTabChange,
  onChannelClick,
}: HomeSceneProps) {
  const [activeTeamId, setActiveTeamId] = useState('contributors');
  const [displayedTab, setDisplayedTab] = useState(activeTab);
  const [outgoingTab, setOutgoingTab] = useState<MobileTabBarTab | null>(null);
  const [direction, setDirection] = useState<TransitionDirection>('forward');
  const [entered, setEntered] = useState(true);
  const displayedTabRef = useRef(displayedTab);
  displayedTabRef.current = displayedTab;

  useEffect(() => {
    if (activeTab === displayedTabRef.current) return;

    const from = TAB_ORDER.indexOf(displayedTabRef.current);
    const to = TAB_ORDER.indexOf(activeTab);
    setDirection(to > from ? 'forward' : 'back');
    setOutgoingTab(displayedTabRef.current);
    setDisplayedTab(activeTab);
    setEntered(false);
  }, [activeTab]);

  useEffect(() => {
    if (entered || !outgoingTab) return;

    let innerId = 0;
    const outerId = requestAnimationFrame(() => {
      innerId = requestAnimationFrame(() => setEntered(true));
    });

    const timeoutId = window.setTimeout(() => {
      setOutgoingTab(null);
    }, TAB_TRANSITION_MS);

    return () => {
      cancelAnimationFrame(outerId);
      cancelAnimationFrame(innerId);
      window.clearTimeout(timeoutId);
    };
  }, [displayedTab, outgoingTab, entered]);

  const renderTab = (tab: MobileTabBarTab) => {
    switch (tab) {
      case 'home':
        return (
          <MobileHome
            teamSidebar={
              <MobileTeamSidebar
                activeTeamId={activeTeamId}
                onSelectTeam={setActiveTeamId}
                teams={[
                  {
                    id: 'contributors',
                    name: 'Contributors',
                    src: avatars.staffTeam,
                  },
                  {
                    id: 'design',
                    name: 'Design',
                    initials: 'De',
                    unread: true,
                  },
                ]}
              />
            }
            channelsSidebar={
              <MobileChannelsSidebar
                teamName={
                  activeTeamId === 'design' ? 'Design' : 'Contributors'
                }
                subtitle='Community'
                showUnreadsCategory
                onItemClick={onChannelClick}
                avatarAikoTan={avatars.aikoTan}
                avatarArjunPatel={avatars.arjunPatel}
                avatarDanielOkoro={avatars.danielle}
                avatarDariusCole={avatars.dariusCole}
                avatarDavidLiang={avatars.davidLiang}
                avatarEmmaNovak={avatars.emmaNovak}
                avatarEthanBrooks={avatars.ethanBrooks}
              />
            }
          />
        );
      case 'search':
        return <SearchScene />;
      case 'mentions':
        return <MentionsScene />;
      case 'saved':
        return <SavedScene />;
      case 'profile':
        return <ProfileScene />;
    }
  };

  const layerClass = (role: 'incoming' | 'outgoing', animating: boolean) => {
    const classes = [styles['mobile-home-channel__tab-layer']];
    if (!animating) {
      return classes.join(' ');
    }

    if (role === 'outgoing') {
      if (entered) {
        classes.push(
          direction === 'forward'
            ? styles['mobile-home-channel__tab-layer--exit-left']
            : styles['mobile-home-channel__tab-layer--exit-right'],
        );
      }
      return classes.join(' ');
    }

    if (!entered) {
      classes.push(
        direction === 'forward'
          ? styles['mobile-home-channel__tab-layer--from-right']
          : styles['mobile-home-channel__tab-layer--from-left'],
      );
    } else {
      classes.push(styles['mobile-home-channel__tab-layer--entered']);
    }
    return classes.join(' ');
  };

  const animating = outgoingTab != null;

  return (
    <div className={styles['mobile-home-channel__home-shell']}>
      <div className={styles['mobile-home-channel__tab-viewport']}>
        {outgoingTab && (
          <div className={layerClass('outgoing', true)} aria-hidden>
            {renderTab(outgoingTab)}
          </div>
        )}
        <div className={layerClass('incoming', animating)}>
          {renderTab(displayedTab)}
        </div>
      </div>
      <MobileTabBar
        activeTab={activeTab}
        onTabChange={onTabChange}
        profileSrc={avatars.leonard}
        profileAlt='Leonard Riley'
        mentionsBadge={2}
      />
    </div>
  );
}
