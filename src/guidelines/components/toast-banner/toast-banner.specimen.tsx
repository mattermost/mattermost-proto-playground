import ToastBanner from '@/components/ui/ToastBanner/ToastBanner';
import styles from '@/styles/library-demo/components.module.scss';

export default function ToastBannerLibrary() {
  return (
    <>
      <div className={styles['components__button-block']}>
        <ToastBanner
          message="Link copied to clipboard."
          type="General"
          onDismiss={() => {}}
        />
        <ToastBanner
          message="Message saved successfully."
          type="Success"
          onDismiss={() => {}}
        />
        <ToastBanner
          message="Failed to send message. Please try again."
          type="Danger"
          actionLabel="Retry"
          onAction={() => {}}
          onDismiss={() => {}}
        />
        <ToastBanner
          message="Your session will expire in 5 minutes."
          type="Warning"
          onDismiss={() => {}}
        />
        <ToastBanner
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
