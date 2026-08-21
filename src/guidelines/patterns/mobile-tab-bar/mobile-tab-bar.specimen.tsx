import { useState} from 'react';
import { MobileTabBar } from '@mattermost/compass-proto';
import { type MobileTabBarTab } from '@mattermost/compass-proto';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import styles from './mobile-tab-bar.specimen.module.scss';

export default function MobileTabBarLibrary() {
  const [activeTab, setActiveTab] = useState<MobileTabBarTab>('home');

  return (
    <div className={styles['mtb-specimen']}>
      <div className={styles['mtb-specimen__stage']}>
        <p className={styles['mtb-specimen__label']}>Interactive</p>
        <div className={styles['mtb-specimen__frame']}>
          <MobileTabBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            profileSrc={avatarLeonard}
            profileAlt='Leonard Riley'
            mentionsBadge={3}
          />
        </div>
      </div>
      <div className={styles['mtb-specimen__stage']}>
        <p className={styles['mtb-specimen__label']}>Search active</p>
        <div className={styles['mtb-specimen__frame']}>
          <MobileTabBar
            activeTab='search'
            profileSrc={avatarLeonard}
            profileAlt='Leonard Riley'
          />
        </div>
      </div>
      <div className={styles['mtb-specimen__stage']}>
        <p className={styles['mtb-specimen__label']}>Profile active</p>
        <div className={styles['mtb-specimen__frame']}>
          <MobileTabBar
            activeTab='profile'
            profileSrc={avatarLeonard}
            profileAlt='Leonard Riley'
          />
        </div>
      </div>
    </div>
  );
}
