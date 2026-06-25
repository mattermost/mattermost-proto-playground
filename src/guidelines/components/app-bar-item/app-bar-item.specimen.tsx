import BellOutlineIcon from '@mattermost/compass-icons/components/bell-outline';
import EmoticonHappyOutlineIcon from '@mattermost/compass-icons/components/emoticon-happy-outline';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import StarOutlineIcon from '@mattermost/compass-icons/components/star-outline';
import { AppBarItem } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function AppBarItemLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>States</span>
          <AppBarItem
            icon={<EmoticonHappyOutlineIcon size={20} />}
            label="Emoji"
            state="Default"
          />
          <AppBarItem
            icon={<GlobeIcon size={20} />}
            label="Channels"
            state="Selected"
          />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Badges</span>
          <AppBarItem
            icon={<BellOutlineIcon size={20} />}
            label="Notifications"
            mentionBadge={3}
          />
          <AppBarItem
            icon={<StarOutlineIcon size={20} />}
            label="Favorites"
            unreadBadge
          />
        </div>
      </div>
    </>
  );
}
