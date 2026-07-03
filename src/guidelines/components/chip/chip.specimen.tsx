import EmoticonHappyOutlineIcon from '@mattermost/compass-icons/components/emoticon-happy-outline';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import { Chip } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function ChipLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Sizes</span>
          <Chip size="Small" onRemove={() => {}}>
            Label
          </Chip>
          <Chip size="Medium" onRemove={() => {}}>
            Label
          </Chip>
          <Chip size="Medium Compact" onRemove={() => {}}>
            Label
          </Chip>
          <Chip size="Large" onRemove={() => {}}>
            Label
          </Chip>
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Leading</span>
          <Chip size="Medium" onRemove={() => {}}>
            No leading
          </Chip>
          <Chip
            size="Medium"
            leadingIcon={<EmoticonHappyOutlineIcon size={12} />}
            onRemove={() => {}}
          >
            With icon
          </Chip>
          <Chip
            size="Medium"
            leadingAvatar={{ src: avatarLeonard, alt: 'Leonard Riley' }}
            onRemove={() => {}}
          >
            Leonard Riley
          </Chip>
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>States</span>
          <Chip size="Medium" onRemove={() => {}}>
            Default
          </Chip>
          <Chip size="Medium" error onRemove={() => {}}>
            Error
          </Chip>
          <Chip size="Medium" colored onRemove={() => {}}>
            Colored
          </Chip>
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            No remove
          </span>
          <Chip size="Small">Small</Chip>
          <Chip size="Medium">Medium</Chip>
          <Chip size="Large">Large</Chip>
        </div>
      </div>
    </>
  );
}
