import type {CSSProperties, ReactNode} from 'react';
import AtIcon from '@mattermost/compass-icons/components/at';
import BookmarkOutlineIcon from '@mattermost/compass-icons/components/bookmark-outline';
import HomeVariantOutlineIcon from '@mattermost/compass-icons/components/home-variant-outline';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import { MentionBadge } from '@mattermost/compass-ui';
import { UserAvatar } from '@mattermost/compass-ui';
import styles from './MobileTabBar.module.scss';

export type MobileTabBarTab =
  | 'home'
  | 'search'
  | 'mentions'
  | 'saved'
  | 'profile';

export interface MobileTabBarProps {
  className?: string;
  activeTab?: MobileTabBarTab;
  onTabChange?: (tab: MobileTabBarTab) => void;
  profileSrc?: string;
  profileAlt?: string;
  mentionsBadge?: number;
}

const TAB_ORDER: MobileTabBarTab[] = [
  'home',
  'search',
  'mentions',
  'saved',
  'profile',
];

const ICON_TABS: {
  id: Exclude<MobileTabBarTab, 'profile'>;
  label: string;
  icon: ReactNode;
}[] = [
  {
    id: 'home',
    label: 'Home',
    icon: <HomeVariantOutlineIcon size={24} />,
  },
  {
    id: 'search',
    label: 'Search',
    icon: <MagnifyIcon size={24} />,
  },
  {
    id: 'mentions',
    label: 'Mentions',
    icon: <AtIcon size={24} />,
  },
  {
    id: 'saved',
    label: 'Saved',
    icon: <BookmarkOutlineIcon size={24} />,
  },
];

/**
 * iOS bottom tab bar for Mobile Home.
 */
export default function MobileTabBar({
  className = '',
  activeTab = 'home',
  onTabChange,
  profileSrc,
  profileAlt = 'Profile',
  mentionsBadge,
}: MobileTabBarProps) {
  const rootClass = [styles['mobile-tab-bar'], className]
    .filter(Boolean)
    .join(' ');

  const activeIndex = Math.max(0, TAB_ORDER.indexOf(activeTab));
  const rowStyle = {
    '--tab-count': TAB_ORDER.length,
    '--active-index': activeIndex,
  } as CSSProperties;

  return (
    <nav className={rootClass} aria-label='Primary'>
      <div className={styles['mobile-tab-bar__row']} style={rowStyle}>
        <span className={styles['mobile-tab-bar__indicator']} aria-hidden>
          <span className={styles['mobile-tab-bar__indicator-bar']} />
        </span>
        {ICON_TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type='button'
              className={[
                styles['mobile-tab-bar__tab'],
                active ? styles['mobile-tab-bar__tab--active'] : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-current={active ? 'page' : undefined}
              onClick={() => onTabChange?.(tab.id)}
            >
              <span className={styles['mobile-tab-bar__icon']}>
                {tab.icon}
                {tab.id === 'mentions' &&
                  !active &&
                  mentionsBadge != null &&
                  mentionsBadge > 0 && (
                    <span className={styles['mobile-tab-bar__badge']}>
                      <MentionBadge
                        className={styles['mobile-tab-bar__badge-pill']}
                        count={mentionsBadge}
                        size='Large'
                        location='Channel'
                      />
                    </span>
                  )}
              </span>
              <span className={styles['mobile-tab-bar__label']}>{tab.label}</span>
            </button>
          );
        })}
        <button
          type='button'
          className={[
            styles['mobile-tab-bar__tab'],
            activeTab === 'profile'
              ? styles['mobile-tab-bar__tab--active']
              : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-current={activeTab === 'profile' ? 'page' : undefined}
          onClick={() => onTabChange?.('profile')}
        >
          <span className={styles['mobile-tab-bar__profile']}>
            <UserAvatar
              src={profileSrc}
              alt=''
              size='24'
              status
            />
          </span>
          <span className={styles['mobile-tab-bar__label']}>Profile</span>
        </button>
      </div>
    </nav>
  );
}
