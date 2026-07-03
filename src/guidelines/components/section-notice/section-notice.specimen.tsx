import LightbulbOutlineIcon from '@mattermost/compass-icons/components/lightbulb-outline';
import { Icon } from '@mattermost/compass-ui';
import { SectionNotice } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function SectionNoticeLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <SectionNotice
          type="Info"
          title="Email notifications are enabled."
          description="You will receive notifications at your registered email address."
        />
        <SectionNotice
          type="Warning"
          title="Your session will expire soon."
          description="Save your work before the session ends."
          primaryButtonLabel="Extend session"
          onPrimaryAction={() => {}}
        />
        <SectionNotice
          type="Danger"
          title="This action cannot be undone."
          description="Deleting this workspace will permanently remove all data."
          primaryButtonLabel="Delete"
          onPrimaryAction={() => {}}
          secondaryButtonLabel="Cancel"
          onSecondaryAction={() => {}}
        />
        <SectionNotice
          type="Success"
          title="Configuration saved successfully."
          onDismiss={() => {}}
        />
        <SectionNotice
          type="Hint"
          title="Tip: You can drag and drop files to upload them."
          icon={<Icon size="20" glyph={<LightbulbOutlineIcon />} />}
          onDismiss={() => {}}
        />
      </div>
    </>
  );
}
