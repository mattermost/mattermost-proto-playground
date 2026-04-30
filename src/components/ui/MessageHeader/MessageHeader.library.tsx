import MessageHeader from '@/components/ui/MessageHeader/MessageHeader';
import styles from '@/pages/Components/Components.module.scss';

export default function MessageHeaderLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
                <div className={styles['components__button-row']}>
                  <span className={styles['components__instance-label']}>Normal</span>
                  <MessageHeader
                    username="Leonard Riley"
                    timestamp="Today at 9:41 AM"
                  />
                </div>
                <div className={styles['components__button-row']}>
                  <span className={styles['components__instance-label']}>Bot</span>
                  <MessageHeader
                    username="Mattermost"
                    timestamp="Today at 9:41 AM"
                    isBot
                  />
                </div>
                <div className={styles['components__button-row']}>
                  <span className={styles['components__instance-label']}>
                    Bot (custom label)
                  </span>
                  <MessageHeader
                    username="PagerDuty"
                    timestamp="Yesterday at 2:15 PM"
                    isBot
                    botLabel="APP"
                  />
                </div>
              </div>
    </>
  );
}
