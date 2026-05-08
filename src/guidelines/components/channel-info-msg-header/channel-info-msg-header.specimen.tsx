import ChannelInfoMsgHeader from '@/components/ui/ChannelInfoMsgHeader/ChannelInfoMsgHeader';
import styles from '@/styles/library-demo/components.module.scss';

export default function ChannelInfoMsgHeaderLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Default</span>
          <ChannelInfoMsgHeader />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Multiple tabs
          </span>
          <ChannelInfoMsgHeader
            tabs={[
              { label: 'Spec Reviews', active: true },
              { label: 'Files' },
              { label: 'Pinned' },
            ]}
            teamName="Contributors"
          />
        </div>
      </div>
    </>
  );
}
