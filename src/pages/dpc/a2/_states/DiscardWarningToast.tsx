/**
 * A2 — V-A2-1 mitigation toast (§3.2.10 + §3.2.12).
 *
 * Triggered when the admin clicks Back in Step 2B with partial rules dirty.
 * Auto-dismisses after 3s. Acknowledge button confirms the discard and
 * routes back to Step 1 (clearing the partial rules per §3.2.10).
 *
 * Renders into a fixed overlay so it floats over the Channel Settings.
 * Uses role="status" + aria-live="polite" per WCAG 4.1.3 (the ToastBanner
 * component carries the aria roles internally).
 */
import { useEffect } from 'react';
import ToastBanner from '@/components/ui/ToastBanner/ToastBanner';
import type { A2StoreApi } from '@/pages/dpc/a2/useA2Store';
import styles from './DiscardWarningToast.module.scss';

export interface DiscardWarningToastProps {
  store: A2StoreApi;
}

const AUTO_DISMISS_MS = 3000;

export default function DiscardWarningToast({
  store,
}: DiscardWarningToastProps) {
  useEffect(() => {
    if (!store.showBackButtonWarning) return;
    const timer = window.setTimeout(() => {
      store.confirmBackDiscard();
    }, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [store]);

  if (!store.showBackButtonWarning) return null;

  return (
    <div className={styles['discard-warning-toast']} role="presentation">
      <ToastBanner
        type="Warning"
        message="Your partial access rules were discarded. Choose a new scope or continue with restrict."
        actionLabel="Acknowledge"
        onAction={() => store.confirmBackDiscard()}
        onDismiss={() => store.dismissBackWarning()}
      />
    </div>
  );
}
