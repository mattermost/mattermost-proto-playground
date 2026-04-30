import EmoticonHappyOutlineIcon from '@mattermost/compass-icons/components/emoticon-happy-outline';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import Icon from '@/components/ui/Icon/Icon';
import styles from '@/pages/Components/Components.module.scss';

export default function IconLibrary() {
  return (
    <>
      <div className={styles['components__row']}>
                <div className={styles['components__instance']}>
                  <span className={styles['components__instance-label']}>
                    16, Globe
                  </span>
                  <Icon glyph={<GlobeIcon />} size="16" />
                </div>
                <div className={styles['components__instance']}>
                  <span className={styles['components__instance-label']}>
                    24, default glyph
                  </span>
                  <Icon size="24" />
                </div>
                <div className={styles['components__instance']}>
                  <span className={styles['components__instance-label']}>
                    32, Emoticon
                  </span>
                  <Icon glyph={<EmoticonHappyOutlineIcon />} size="32" />
                </div>
                <div className={styles['components__instance']}>
                  <span className={styles['components__instance-label']}>
                    40, Globe
                  </span>
                  <Icon glyph={<GlobeIcon />} size="40" />
                </div>
              </div>
    </>
  );
}
