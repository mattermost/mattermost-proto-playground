/**
 * DPC V2 A1 — DmNotificationPreview (full implementation, v2.3).
 *
 * Renders every DM dispatched by the store as a stacked message card. Copy
 * per §6.6 SG6 — seven variants total:
 *
 *   approved                       — admin-attributed approval DM
 *   approved-auto-cascade          — T6 cascade, system-attributed (V-005)
 *   denied-with-reason             — admin-attributed decline DM with reason
 *   denied-no-reason               — admin-attributed decline DM, no reason
 *   auto-withdraw-disabled         — T4 cascade (Discoverable turned off)
 *   auto-withdraw-policy-filter    — T5 cascade (Membership Policy changed)
 *   auto-withdraw-channel-deleted  — channel deleted cascade
 */
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import { PERSONAS } from '@/pages/dpc/shared';
import type { A1V2StoreApi, DmNotification } from '../useA1V2Store';
import styles from './DmNotificationPreview.module.scss';

export interface DmNotificationPreviewProps {
  store: A1V2StoreApi;
}

export default function DmNotificationPreview({
  store,
}: DmNotificationPreviewProps) {
  const dms = store.state.dmNotifications;

  return (
    <section className={styles['v2-dm-preview']}>
      <header className={styles['v2-dm-preview__header']}>
        Direct message preview
        <span className={styles['v2-dm-preview__count']}>
          {dms.length} {dms.length === 1 ? 'message' : 'messages'}
        </span>
      </header>
      <div className={styles['v2-dm-preview__list-wrap']}>
        <Scrollbars>
          {dms.length === 0 ? (
            <EmptyState
              title="No direct messages yet."
              description="Approve, decline, or commit a cascade-triggering toggle to dispatch a DM."
            />
          ) : (
            <ul className={styles['v2-dm-preview__list']}>
              {dms.map((dm) => (
                <DmCard key={dm.id} dm={dm} />
              ))}
            </ul>
          )}
        </Scrollbars>
      </div>
    </section>
  );
}

function DmCard({ dm }: { dm: DmNotification }) {
  const systemAttributed =
    dm.variant === 'approved-auto-cascade' ||
    dm.variant === 'auto-withdraw-disabled' ||
    dm.variant === 'auto-withdraw-policy-filter' ||
    dm.variant === 'auto-withdraw-channel-deleted';

  const senderName = systemAttributed ? 'Mattermost' : `@${dm.adminUsername}`;
  const adminAvatar =
    PERSONAS['channel-admin'].avatarUrl ?? avatarLeonard;

  return (
    <li className={styles['v2-dm-preview__card']}>
      <div className={styles['v2-dm-preview__card-avatar']}>
        <UserAvatar
          src={systemAttributed ? avatarLeonard : adminAvatar}
          alt={senderName}
          name={senderName}
          size="32"
        />
      </div>
      <div className={styles['v2-dm-preview__card-body']}>
        <header className={styles['v2-dm-preview__card-header']}>
          <span className={styles['v2-dm-preview__card-sender']}>
            {senderName}
          </span>
          {systemAttributed && (
            <span className={styles['v2-dm-preview__card-bot-tag']}>BOT</span>
          )}
          <span className={styles['v2-dm-preview__card-timestamp']}>
            {formatTs(dm.createdAt)}
          </span>
        </header>
        <p className={styles['v2-dm-preview__card-text']}>
          {renderBody(dm)}
        </p>
      </div>
    </li>
  );
}

function renderBody(dm: DmNotification): React.ReactNode {
  const ch = `#${dm.channelName}`;
  const admin = `@${dm.adminUsername}`;
  switch (dm.variant) {
    case 'approved':
      return (
        <>
          Your request to join {ch} was approved by {admin}.
        </>
      );
    case 'approved-auto-cascade':
      return (
        <>
          You&apos;ve been added to {ch}. This channel now adds matching users
          automatically.
        </>
      );
    case 'denied-with-reason':
      return (
        <>
          Your request to join {ch} was declined by {admin}.
          <span className={styles['v2-dm-preview__card-reason']}>
            Reason: {dm.reasonText}
          </span>
        </>
      );
    case 'denied-no-reason':
      return <>Your request to join {ch} was declined.</>;
    case 'auto-withdraw-disabled':
      return (
        <>
          Your request to join {ch} was withdrawn because the channel is no
          longer Discoverable.
        </>
      );
    case 'auto-withdraw-policy-filter':
      return (
        <>
          Your request to join {ch} was withdrawn because the Membership Policy
          changed and you no longer match.
        </>
      );
    case 'auto-withdraw-channel-deleted':
      return (
        <>
          Your request to join {ch} was withdrawn because the channel no longer
          exists.
        </>
      );
    default:
      return null;
  }
}

function formatTs(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toISOString().slice(11, 16);
  } catch {
    return iso;
  }
}
