/**
 * A2 — Approval / Denial DM preview (§3.2.9).
 *
 * Renders sample DM copy as the system bot would deliver. Same copy as A1
 * — the wizard does not alter requester-facing messaging.
 *
 * Shows four DM variants: approved, denied without reason, denied with
 * reason, auto-withdraw on Discoverable disable (FR-10).
 */
import { useMemo } from 'react';
import MattermostIcon from '@mattermost/compass-icons/components/mattermost';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import Icon from '@/components/ui/Icon/Icon';
import type { A2StoreApi } from '@/pages/dpc/a2/useA2Store';
import styles from './DmNotificationPreview.module.scss';

export interface DmNotificationPreviewProps {
  store: A2StoreApi;
}

interface DmVariant {
  id: string;
  label: string;
  body: string;
}

export default function DmNotificationPreview({
  store,
}: DmNotificationPreviewProps) {
  const channelName = store.targetChannel.displayName;

  const variants = useMemo<DmVariant[]>(
    () => [
      {
        id: 'approved',
        label: 'Approval',
        body: `Your request to join #${channelName} was approved by @ops.coord.`,
      },
      {
        id: 'denied',
        label: 'Denial (no reason)',
        body: `Your request to join #${channelName} was declined.`,
      },
      {
        id: 'denied-reason',
        label: 'Denial (with reason)',
        body: `Your request to join #${channelName} was declined. Reason: This channel is for the core IR rotation only; recommend joining #incident-readiness-broad instead.`,
      },
      {
        id: 'auto-withdraw',
        label: 'Auto-withdraw (FR-10)',
        body: `Your pending request to join #${channelName} was withdrawn — the channel is no longer discoverable.`,
      },
    ],
    [channelName],
  );

  return (
    <section className={styles['dm-preview']}>
      <header className={styles['dm-preview__header']}>
        <h3 className={styles['dm-preview__title']}>DM notification copy</h3>
        <p className={styles['dm-preview__caption']}>
          What the requester sees from the system bot
        </p>
      </header>
      <ul className={styles['dm-preview__list']}>
        {variants.map((v) => (
          <li key={v.id} className={styles['dm-preview__row']}>
            <span className={styles['dm-preview__label']}>{v.label}</span>
            <div className={styles['dm-preview__bubble']}>
              <div className={styles['dm-preview__author']}>
                <span className={styles['dm-preview__avatar']}>
                  <UserAvatar
                    alt="Mattermost system"
                    name="Mattermost"
                    fallbackColor="Blue"
                    size="24"
                  />
                  <span
                    className={styles['dm-preview__avatar-overlay']}
                    aria-hidden
                  >
                    <Icon glyph={<MattermostIcon />} size="10" />
                  </span>
                </span>
                <span className={styles['dm-preview__author-name']}>
                  Mattermost
                </span>
                <span className={styles['dm-preview__author-tag']}>BOT</span>
              </div>
              <p className={styles['dm-preview__body']}>{v.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
