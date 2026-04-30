import Emoji from '@/components/ui/Emoji/Emoji';
import styles from '@/pages/Components/Components.module.scss';

export default function EmojiLibrary() {
  return (
    <>
      <div className={styles['components__row']}>
                <div className={styles['components__instance']}>
                  <span className={styles['components__instance-label']}>
                    size 16
                  </span>
                  <Emoji emoji="👍" size="16" />
                </div>
                <div className={styles['components__instance']}>
                  <span className={styles['components__instance-label']}>
                    size 24 (default)
                  </span>
                  <Emoji emoji="🎉" size="24" />
                </div>
                <div className={styles['components__instance']}>
                  <span className={styles['components__instance-label']}>
                    size 32
                  </span>
                  <Emoji emoji="🚀" size="32" />
                </div>
                <div className={styles['components__instance']}>
                  <span className={styles['components__instance-label']}>
                    size 40
                  </span>
                  <Emoji emoji="✨" size="40" />
                </div>
              </div>
    </>
  );
}
