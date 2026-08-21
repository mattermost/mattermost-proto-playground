import { useState} from 'react';
import { Scrollbar } from '@mattermost/compass-ui';
import { MobileSearch } from '@mattermost/compass-proto';
import { type MobileTabBarTab } from '@mattermost/compass-proto';
import { MobileSearchSuggestions, MobileTabBar } from '@mattermost/compass-proto';
import DeviceFrame from '@/components/layout/DeviceFrame';
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
            <Scrollbar>
              <MobileSearchSuggestions />
            </Scrollbar>
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
