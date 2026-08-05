import { ChannelInfoMsgHeader } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function ChannelInfoMsgHeaderLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Channel + team (Mentions / Saved)
          </span>
          <ChannelInfoMsgHeader
            channelName='Spec Reviews'
            teamName='Contributors'
          />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Channel only
          </span>
          <ChannelInfoMsgHeader channelName='UX Design' />
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            Multiple tabs (channel info panel)
          </span>
          <ChannelInfoMsgHeader
            tabs={[
              { label: 'Spec Reviews', active: true },
              { label: 'Files' },
              { label: 'Pinned' },
            ]}
            teamName='Contributors'
          />
        </div>
      </div>
    </>
  );
}
