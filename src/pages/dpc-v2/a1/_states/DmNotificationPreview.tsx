/**
 * DPC V2 A1 — DmNotificationPreview (Wave 1 stub).
 *
 * Carry-forward from V1. Wave 2 may add additional variants or copy tweaks.
 */
import type { A1V2StoreApi } from '../useA1V2Store';
import styles from './DmNotificationPreview.module.scss';

export interface DmNotificationPreviewProps {
  store: A1V2StoreApi;
}

export default function DmNotificationPreview({
  store,
}: DmNotificationPreviewProps) {
  return (
    <section className={styles['v2-dm-preview']}>
      <header className={styles['v2-dm-preview__header']}>
        DM notification preview (V2)
      </header>
      <div className={styles['v2-dm-preview__placeholder']}>
        Wave 2: carry-forward of V1 variants.{' '}
        {store.state.dmNotifications.length} dispatched.
      </div>
    </section>
  );
}
