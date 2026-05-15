/**
 * DPC A1 — DM Notification Preview pane (§3.1.9).
 *
 * Renders the five FR-7 / FR-10 / FR-11 / FR-17 DM copy variants as actual
 * preview messages. Surface populates as the admin approves/denies in the
 * rail; the three baseline variants (approved, denied no reason, denied
 * with reason) plus the two auto-withdraw variants are all reachable from
 * the persona switcher + admin actions.
 *
 * To make the spec coverage visible for reviewers, the preview also renders
 * a static "Reference samples" block showing the canonical copy strings
 * even when no live DM has been dispatched yet.
 */
import MessageTextOutlineIcon from '@mattermost/compass-icons/components/message-text-outline';
import Icon from '@/components/ui/Icon/Icon';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import type { A1StoreApi } from '../useA1Store';
import type { DmNotification } from '../useA1Store';
import styles from './DmNotificationPreview.module.scss';

export interface DmNotificationPreviewProps {
  store: A1StoreApi;
}

interface DmCopySample {
  variant: DmNotification['variant'];
  label: string;
  body: string;
}

const REFERENCE_SAMPLES: DmCopySample[] = [
  {
    variant: 'approved',
    label: 'Request approved (FR-7)',
    body: 'Your request to join #ops-planning-q3 was approved by @ops.coord.',
  },
  {
    variant: 'denied-no-reason',
    label: 'Request denied — no reason',
    body: 'Your request to join #ops-planning-q3 was declined.',
  },
  {
    variant: 'denied-with-reason',
    label: 'Request denied — with reason (FR-17, verbatim, 500-char cap)',
    body: 'Your request to join #ops-planning-q3 was declined. Reason: This channel is restricted to the alpha program rotation.',
  },
  {
    variant: 'auto-withdraw-disabled',
    label: 'Auto-withdraw on Discoverable disable (FR-10)',
    body: 'Your pending request to join #ops-planning-q3 was withdrawn — the channel is no longer discoverable.',
  },
  {
    variant: 'auto-withdraw-channel-deleted',
    label: 'Auto-withdraw on channel delete (FR-11)',
    body: 'Your pending request to join #ops-planning-q3 was withdrawn — the channel no longer exists.',
  },
];

function renderLiveBody(dm: DmNotification): string {
  switch (dm.variant) {
    case 'approved':
      return `Your request to join #${dm.channelName} was approved by @${dm.adminUsername}.`;
    case 'denied-no-reason':
      return `Your request to join #${dm.channelName} was declined.`;
    case 'denied-with-reason':
      return `Your request to join #${dm.channelName} was declined. Reason: ${dm.reasonText}`;
    case 'auto-withdraw-disabled':
      return `Your pending request to join #${dm.channelName} was withdrawn — the channel is no longer discoverable.`;
    case 'auto-withdraw-channel-deleted':
      return `Your pending request to join #${dm.channelName} was withdrawn — the channel no longer exists.`;
  }
}

export default function DmNotificationPreview({
  store,
}: DmNotificationPreviewProps) {
  const { state } = store;
  const liveDms = [...state.dmNotifications].reverse().slice(0, 6);

  return (
    <aside
      className={styles['dm-preview']}
      aria-label="DM notification preview"
    >
      <header className={styles['dm-preview__header']}>
        <Icon size="20" glyph={<MessageTextOutlineIcon />} />
        <div>
          <h3 className={styles['dm-preview__title']}>System bot DMs</h3>
          <p className={styles['dm-preview__subtitle']}>
            Outcome DMs sent to the requester (§3.1.9)
          </p>
        </div>
      </header>

      {liveDms.length > 0 && (
        <section className={styles['dm-preview__section']}>
          <p className={styles['dm-preview__section-title']}>Live (dispatched)</p>
          <ul className={styles['dm-preview__list']}>
            {liveDms.map((dm) => (
              <li key={dm.id} className={styles['dm-preview__message']}>
                <UserAvatar
                  alt="System bot"
                  name="System Bot"
                  fallbackColor="Blue"
                  size="32"
                />
                <div className={styles['dm-preview__message-body']}>
                  <p className={styles['dm-preview__message-meta']}>
                    @system · {new Date(dm.createdAt).toLocaleTimeString()}
                  </p>
                  <p className={styles['dm-preview__message-text']}>
                    {renderLiveBody(dm)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={styles['dm-preview__section']}>
        <p className={styles['dm-preview__section-title']}>Reference samples</p>
        <ul className={styles['dm-preview__list']}>
          {REFERENCE_SAMPLES.map((sample) => (
            <li
              key={sample.variant}
              className={styles['dm-preview__message']}
            >
              <UserAvatar
                alt="System bot"
                name="System Bot"
                fallbackColor="Neutral"
                size="32"
              />
              <div className={styles['dm-preview__message-body']}>
                <p className={styles['dm-preview__message-meta']}>
                  {sample.label}
                </p>
                <p className={styles['dm-preview__message-text']}>
                  {sample.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
