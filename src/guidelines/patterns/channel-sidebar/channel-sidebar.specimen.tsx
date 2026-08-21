import { ChannelsSidebar } from '@mattermost/compass-ui';
import {
  defaultChannelsSidebarDemoModel,
  unreadsChannelsSidebarDemoModel,
} from '@/fixtures/channelsSidebarDemo';
import styles from '@/styles/library-demo/patterns.module.scss';

export default function ChannelsSidebarLibrary() {
  return (
    <div className={styles['patterns__sidebar-demo']}>
      <div>
        <p className={styles['patterns__variant-label']}>
          Unreads category Off
        </p>
        <ChannelsSidebar showFilter model={defaultChannelsSidebarDemoModel} />
      </div>
      <div>
        <p className={styles['patterns__variant-label']}>Unreads category On</p>
        <ChannelsSidebar model={unreadsChannelsSidebarDemoModel} />
      </div>
    </div>
  );
}
