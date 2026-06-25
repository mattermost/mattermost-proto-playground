import BellOffOutlineIcon from '@mattermost/compass-icons/components/bell-off-outline';
import BellOutlineIcon from '@mattermost/compass-icons/components/bell-outline';
import EmoticonHappyOutlineIcon from '@mattermost/compass-icons/components/emoticon-happy-outline';
import LinkVariantIcon from '@mattermost/compass-icons/components/link-variant';
import StarIcon from '@mattermost/compass-icons/components/star';
import StarOutlineIcon from '@mattermost/compass-icons/components/star-outline';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import { ActionButton } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function ActionButtonLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Default</span>
          <ActionButton
            icon={<EmoticonHappyOutlineIcon size={20} />}
            label="Action"
            aria-label="Action"
          />
          <ActionButton
            icon={<StarOutlineIcon size={20} />}
            label="Favorite"
            aria-label="Favorite"
          />
          <ActionButton
            icon={<BellOutlineIcon size={20} />}
            label="Mute"
            aria-label="Mute"
          />
          <ActionButton
            icon={<LinkVariantIcon size={20} />}
            label="Copy Link"
            aria-label="Copy link"
          />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Active</span>
          <ActionButton
            icon={<EmoticonHappyOutlineIcon size={20} />}
            label="Action"
            aria-label="Action"
            active
          />
          <ActionButton
            icon={<StarIcon size={20} />}
            label="Favorited"
            aria-label="Favorited"
            active
          />
          <ActionButton
            icon={<BellOffOutlineIcon size={20} />}
            label="Muted"
            aria-label="Muted"
            active
          />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Destructive
          </span>
          <ActionButton
            icon={<TrashCanOutlineIcon size={20} />}
            label="Delete"
            aria-label="Delete"
            destructive
          />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Disabled</span>
          <ActionButton
            icon={<EmoticonHappyOutlineIcon size={20} />}
            label="Action"
            aria-label="Action"
            disabled
          />
        </div>
      </div>
    </>
  );
}
