import { Tabs } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function TabsLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Default</span>
          <Tabs
            tabs={[
              { key: 'messages', label: 'Messages' },
              { key: 'files', label: 'Files', countBadge: 12 },
              { key: 'pinned', label: 'Pinned', unreadBadge: true },
              { key: 'members', label: 'Members' },
            ]}
            activeKey="messages"
            onChange={() => {}}
          />
        </div>
      </div>
    </>
  );
}
