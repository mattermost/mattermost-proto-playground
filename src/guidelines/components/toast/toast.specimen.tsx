import { Toast } from '@mattermost/compass-ui';
import styles from '@/styles/library-demo/components.module.scss';

export default function ToastLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <Toast
          message="Link copied to clipboard."
          type="General"
          onDismiss={() => {}}
        />
        <Toast
          message="Message saved successfully."
          type="Success"
          onDismiss={() => {}}
        />
        <Toast
          message="Failed to send message. Please try again."
          type="Danger"
          actionLabel="Retry"
          onAction={() => {}}
          onDismiss={() => {}}
        />
        <Toast
          message="Your session will expire in 5 minutes."
          type="Warning"
          onDismiss={() => {}}
        />
        <Toast
          message="New update available. Refresh to apply."
          type="Info"
          actionLabel="Refresh"
          onAction={() => {}}
          onDismiss={() => {}}
        />
      </div>
    </>
  );
}
