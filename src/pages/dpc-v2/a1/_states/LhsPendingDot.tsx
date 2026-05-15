/**
 * DPC V2 A1 — LhsPendingDot (NEW in V2; Wave 2D implementation).
 *
 * Mocks a portion of the LHS sidebar showing two channel items per §3.12:
 * a subtle 6px filled blue dot indicates that the viewing admin has
 * pending join requests on that channel. Binary signal — count lives in
 * the right-rail badge (§3.10), not here.
 *
 * Two options surfaced side-by-side:
 *
 *   Option A — Channel item WITH pending dot (3 pending)
 *   Option B — Channel item WITHOUT pending dot (0 pending)
 *
 * Per §3.12.7 the aria-label includes the pending state in the channel
 * item's accessible name (not exposed as a separate live region). Per
 * KD-26 the dot is small + muted (subdued), not destructive red.
 */
import LockIcon from '@mattermost/compass-icons/components/lock-outline';
import PoundIcon from '@mattermost/compass-icons/components/pound';
import type { A1V2StoreApi } from '../useA1V2Store';
import styles from './LhsPendingDot.module.scss';

export interface LhsPendingDotProps {
  store: A1V2StoreApi;
}

interface ChannelItem {
  name: string;
  unread?: boolean;
  type: 'public' | 'private';
  pendingCount: number;
  active?: boolean;
}

export default function LhsPendingDot({ store }: LhsPendingDotProps) {
  const seedPendingCount = store.state.pendingRequests.length;

  const itemsWithDot: ChannelItem[] = [
    { name: 'town-square', type: 'public', pendingCount: 0 },
    {
      name: store.focusChannel.displayName,
      type: 'private',
      pendingCount: Math.max(seedPendingCount, 3),
      active: true,
    },
    { name: 'incident-response', type: 'private', pendingCount: 0 },
    { name: 'release-cadence', type: 'public', pendingCount: 0, unread: true },
  ];

  const itemsWithoutDot: ChannelItem[] = [
    { name: 'town-square', type: 'public', pendingCount: 0 },
    {
      name: store.focusChannel.displayName,
      type: 'private',
      pendingCount: 0,
      active: true,
    },
    { name: 'incident-response', type: 'private', pendingCount: 0 },
    { name: 'release-cadence', type: 'public', pendingCount: 0, unread: true },
  ];

  return (
    <section
      className={styles['v2-lhs-pending-dot']}
      aria-label="LHS sidebar pending-requests dot preview"
    >
      <header className={styles['v2-lhs-pending-dot__header']}>
        <h3 className={styles['v2-lhs-pending-dot__title']}>
          LHS sidebar pending-requests dot
        </h3>
        <p className={styles['v2-lhs-pending-dot__subtitle']}>
          §3.12 binary signal — count lives in the right-rail badge. KD-26
          subtle = small + muted (NOT destructive red); always-on (NOT
          hover-revealed). The dot is action-required semantics for
          approvers; it does not overlap with DPC state iconography (LHS
          carries no DPC icon for members per §3.21).
        </p>
      </header>

      <div className={styles['v2-lhs-pending-dot__split']}>
        <SidebarPreview
          label="Option A — with pending dot (3 pending)"
          items={itemsWithDot}
        />
        <SidebarPreview
          label="Option B — without pending dot (0 pending)"
          items={itemsWithoutDot}
        />
      </div>
    </section>
  );
}

interface SidebarPreviewProps {
  label: string;
  items: ChannelItem[];
}

function SidebarPreview({ label, items }: SidebarPreviewProps) {
  return (
    <div className={styles['v2-lhs-pending-dot__preview']}>
      <h4 className={styles['v2-lhs-pending-dot__preview-label']}>{label}</h4>
      <ul
        className={styles['v2-lhs-pending-dot__sidebar']}
        aria-label="Channels"
      >
        {items.map((item) => (
          <li
            key={item.name}
            className={[
              styles['v2-lhs-pending-dot__row'],
              item.active ? styles['v2-lhs-pending-dot__row--active'] : '',
              item.unread ? styles['v2-lhs-pending-dot__row--unread'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-label={
              item.pendingCount > 0
                ? `${item.name} channel, pending join requests for you to review (${item.pendingCount})`
                : `${item.name} channel`
            }
            aria-current={item.active ? 'page' : undefined}
          >
            <span className={styles['v2-lhs-pending-dot__row-icon']}>
              {item.type === 'private' ? (
                <LockIcon size={14} />
              ) : (
                <PoundIcon size={14} />
              )}
            </span>
            <span className={styles['v2-lhs-pending-dot__row-name']}>
              {item.name}
            </span>
            {item.pendingCount > 0 ? (
              <span
                className={styles['v2-lhs-pending-dot__dot']}
                aria-hidden
                title={`${item.pendingCount} pending join requests`}
              />
            ) : null}
            {item.unread ? (
              <span
                className={styles['v2-lhs-pending-dot__mention']}
                aria-hidden
              >
                3
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
