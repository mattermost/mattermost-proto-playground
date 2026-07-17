import { PopoverNotice, ShortcutTagGroup } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function PopoverNoticeLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Default</span>
          <PopoverNotice
            title="Keyboard shortcut"
            onClose={() => {}}
            actions={[
              { label: 'Got it', emphasis: 'primary' },
              { label: 'Dismiss', emphasis: 'tertiary' },
            ]}
          >
            Press <ShortcutTagGroup labels={['Ctrl', 'K']} /> to open the quick
            switcher and jump to any channel.
          </PopoverNotice>
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Info</span>
          <PopoverNotice
            title="Keyboard shortcut updated"
            variant="info"
            onClose={() => {}}
          >
            The quick switcher is now opened with{' '}
            <ShortcutTagGroup labels={['Ctrl', 'K']} />.
          </PopoverNotice>
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Success</span>
          <PopoverNotice
            title="Changes saved"
            variant="success"
            onClose={() => {}}
            actions={[{ label: 'Got it', emphasis: 'primary' }]}
          >
            Your notification preferences have been updated.
          </PopoverNotice>
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Warning</span>
          <PopoverNotice
            title="Session expiring soon"
            variant="warning"
            onClose={() => {}}
            actions={[
              { label: 'Stay signed in', emphasis: 'primary' },
              { label: 'Dismiss', emphasis: 'tertiary' },
            ]}
          >
            You will be signed out in 5 minutes due to inactivity.
          </PopoverNotice>
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>Danger</span>
          <PopoverNotice
            title="Permission required"
            variant="danger"
            onClose={() => {}}
            actions={[{ label: 'Review permissions', emphasis: 'primary' }]}
          >
            You don't have access to post in this channel.
          </PopoverNotice>
        </div>
        <div className={styles['components__button-row']}>
          <span className={styles['components__instance-label']}>
            With checkbox
          </span>
          <PopoverNotice
            title="New feature available"
            showCheckbox
            onClose={() => {}}
          >
            You can now forward messages directly to other channels.
          </PopoverNotice>
        </div>
      </div>
    </>
  );
}
