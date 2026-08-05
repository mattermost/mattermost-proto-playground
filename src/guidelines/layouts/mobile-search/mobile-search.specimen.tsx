import {useState} from 'react';
import {
  EmptyState,
  MobileSearch,
  MobileTabBar,
  type MobileTabBarTab,
} from '@mattermost/compass-ui';
import DeviceFrame from '@/components/layout/DeviceFrame';
import MessageSearchEmptyIllustration from '@/assets/illustrations/message-search-empty.svg?react';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import styles from './mobile-search.specimen.module.scss';

export default function MobileSearchLibrary() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<MobileTabBarTab>('search');

  return (
    <div className={styles['mobile-search-layout']}>
      <DeviceFrame insetContent={false} statusBarStyle='light'>
        <div className={styles['mobile-search-layout__shell']}>
          <MobileSearch value={query} onChange={setQuery}>
            <EmptyState
              illustration={{
                'aria-label': 'Search',
                width: '120px',
                height: '80px',
                children: <MessageSearchEmptyIllustration />,
              }}
              title={query.trim() ? 'No results found' : 'Search messages'}
              description={
                query.trim()
                  ? 'Try adjusting your search or filters to find what you’re looking for.'
                  : 'Find messages, files, and people across your teams.'
              }
            />
          </MobileSearch>
          <MobileTabBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            profileSrc={avatarLeonard}
            profileAlt='Leonard Riley'
          />
        </div>
      </DeviceFrame>
    </div>
  );
}
