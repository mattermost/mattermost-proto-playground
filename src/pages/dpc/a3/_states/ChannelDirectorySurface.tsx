/**
 * ChannelDirectorySurface — the A3-specific discovery surface (§3.3.2).
 *
 * Distinct from Browse Channels (which continues to serve public channels in
 * this prototype). Reachable from the LHS "Channel Directory" entry point
 * the prototype renders inside its own visual envelope. NFR-1 enforced:
 * each row exposes only channel name + purpose. No member count, no admin
 * avatars, no activity preview.
 *
 * Filter chips: All / My Team / My Pending  (KD-3). Empty state copy
 * matches §3.3.2 verbatim. Guest persona renders the zero-eligible-rows
 * shape per NFR-2 (server-side filter — UI mirrors the response shape).
 *
 * For tenured / newer end-user personas: if the user has previously left a
 * channel that is still in the directory, it reappears here naturally — no
 * separate L&R surface needed (§3.3.6).
 */
import { useMemo, useState, type ReactNode } from 'react';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import EmoticonHappyOutlineIcon from '@mattermost/compass-icons/components/emoticon-happy-outline';
import FolderOutlineIcon from '@mattermost/compass-icons/components/folder-outline';
import AlertOutlineIcon from '@mattermost/compass-icons/components/alert-outline';
import Button from '@/components/ui/Button/Button';
import Chip from '@/components/ui/Chip/Chip';
import SearchInput from '@/components/ui/SearchInput/SearchInput';
import Icon from '@/components/ui/Icon/Icon';
import {
  usePersona,
  useViewport,
  type ChannelFixture,
} from '@/pages/dpc/shared';
import type { A3Store } from '../useA3Store';
import styles from './ChannelDirectorySurface.module.scss';

type FilterKey = 'all' | 'my-team' | 'my-pending';

interface ChannelDirectorySurfaceProps {
  store: A3Store;
}

interface DirectoryRowProps {
  channel: ChannelFixture;
  isPending: boolean;
  hasPriorMembership: boolean;
  isOrphan: boolean;
  onRequestToJoin: (channelId: string) => void;
  onWithdraw: (channelId: string) => void;
}

function DirectoryRow({
  channel,
  isPending,
  hasPriorMembership,
  isOrphan,
  onRequestToJoin,
  onWithdraw,
}: DirectoryRowProps) {
  return (
    <li
      className={[
        styles['dpc-directory__row'],
        isOrphan ? styles['dpc-directory__row--orphan'] : '',
        isPending ? styles['dpc-directory__row--pending'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span
        className={styles['dpc-directory__row-icon']}
        aria-hidden
      >
        <Icon size="20" glyph={<LockOutlineIcon />} />
      </span>
      <div className={styles['dpc-directory__row-body']}>
        <span className={styles['dpc-directory__row-name']}>
          {channel.displayName}
        </span>
        <span className={styles['dpc-directory__row-purpose']}>
          {isOrphan
            ? 'This channel no longer exists.'
            : channel.purpose}
        </span>
        {/*
         * PRD AC-3.1 / §3.3.6: prior-membership is NEVER displayed visually
         * on the directory row — it would leak a side-channel signal.
         * The flag is kept in the audit-event payload only. We still surface
         * it inside a screenreader-only span so the prototype can prove the
         * data-flow path without leaking it visually.
         */}
        {hasPriorMembership && !isOrphan && (
          <span className={styles['dpc-directory__row-srhint']}>
            Audit-only flag: prior_membership=true (not displayed visually
            per PRD AC-3.1).
          </span>
        )}
      </div>
      <div className={styles['dpc-directory__row-action']}>
        {isOrphan ? (
          <Button emphasis="Tertiary" size="Small" disabled>
            Unavailable
          </Button>
        ) : isPending ? (
          <Button
            emphasis="Tertiary"
            size="Small"
            onClick={() => onWithdraw(channel.id)}
          >
            Pending — Withdraw
          </Button>
        ) : (
          <Button
            emphasis="Primary"
            size="Small"
            onClick={() => onRequestToJoin(channel.id)}
          >
            Request to Join
          </Button>
        )}
      </div>
    </li>
  );
}

export default function ChannelDirectorySurface({
  store,
}: ChannelDirectorySurfaceProps) {
  const { persona, personaInfo } = usePersona();
  const { viewport } = useViewport();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');

  const isGuest = persona === 'guest';

  // Compose the actually-shown channels from the directory entries.
  const rows = useMemo(() => {
    const entries = store.state.directoryEntries;
    const channels = entries
      .map((e) => store.channelById(e.channelId))
      .filter((c): c is ChannelFixture => c != null);

    // Inject the orphaned-entry demo when the toggle is on — simulates the
    // stale-cache fallback row that the read-side sanity check should
    // normally have filtered out.
    if (store.state.orphanedEntryDemo) {
      channels.push(store.orphanedChannelFixture);
    }
    return channels;
  }, [
    store.state.directoryEntries,
    store.state.orphanedEntryDemo,
    store.orphanedChannelFixture,
    store.channelById,
  ]);

  const filtered = useMemo(() => {
    if (isGuest) return [] as ChannelFixture[];
    const q = search.trim().toLowerCase();
    return rows.filter((c) => {
      const isOrphan = c.id === store.orphanedChannelFixture.id;
      const isPending = store.state.myPendingRequests.includes(c.id);

      if (filter === 'my-pending' && !isPending) return false;
      if (filter === 'my-team' && c.policyKey === 'slow') {
        // "My Team" filter is a coarse demo proxy — exclude channels gated
        // by org-wide policies; this is good enough for the prototype.
        return false;
      }
      if (q && !c.displayName.toLowerCase().includes(q) &&
        !c.purpose.toLowerCase().includes(q) && !isOrphan) {
        return false;
      }
      return true;
    });
  }, [
    rows,
    isGuest,
    filter,
    search,
    store.state.myPendingRequests,
    store.orphanedChannelFixture.id,
  ]);

  // Channel-admin "Pending across my channels" indicator — only visible to
  // channel admins on desktop, per §3.3.5. The admin uses the dedicated
  // DirectoryAdminSurface to drill into this aggregate; here we surface the
  // count as a navigational nudge.
  const adminAggregateCount =
    persona === 'channel-admin'
      ? store.pendingForAdmin(personaInfo.username).length
      : 0;

  const showAdminAggregate =
    persona === 'channel-admin' && viewport === 'desktop';

  const renderBody = (): ReactNode => {
    if (isGuest) {
      return (
        <div className={styles['dpc-directory__empty']}>
          <Icon size="40" glyph={<FolderOutlineIcon />} />
          <p className={styles['dpc-directory__empty-title']}>
            No channels available
          </p>
          <p className={styles['dpc-directory__empty-body']}>
            Guests do not see entries in the Channel Directory. Server-side
            guest filter applied (NFR-2 / FR-12). Audit event
            <code>Guest_filter_applied</code> emitted on every directory
            query attempt.
          </p>
        </div>
      );
    }

    if (rows.length === 0) {
      return (
        <div className={styles['dpc-directory__empty']}>
          <Icon size="40" glyph={<FolderOutlineIcon />} />
          <p className={styles['dpc-directory__empty-title']}>
            No channels published to the directory yet.
          </p>
          <p className={styles['dpc-directory__empty-body']}>
            Channel admins can publish a channel they manage from the
            channel’s header menu — <strong>Add to Channel Directory</strong>.
          </p>
        </div>
      );
    }

    if (filtered.length === 0) {
      return (
        <div className={styles['dpc-directory__empty']}>
          <Icon size="40" glyph={<EmoticonHappyOutlineIcon />} />
          <p className={styles['dpc-directory__empty-title']}>
            No matches for the current filter.
          </p>
          <p className={styles['dpc-directory__empty-body']}>
            Clear the filter or try a different search query.
          </p>
        </div>
      );
    }

    return (
      <ul className={styles['dpc-directory__list']}>
        {filtered.map((c) => (
          <DirectoryRow
            key={c.id}
            channel={c}
            isPending={store.state.myPendingRequests.includes(c.id)}
            hasPriorMembership={store.state.rejoinableViaDirectory.includes(
              c.id,
            )}
            isOrphan={c.id === store.orphanedChannelFixture.id}
            onRequestToJoin={(channelId) =>
              store.dispatch({ type: 'OPEN_REQUEST_MODAL', channelId })
            }
            onWithdraw={(channelId) =>
              store.dispatch({
                type: 'WITHDRAW_REQUEST',
                channelId,
                requesterUsername: personaInfo.username,
              })
            }
          />
        ))}
      </ul>
    );
  };

  return (
    <section
      className={[
        styles['dpc-directory'],
        viewport === 'mobile' ? styles['dpc-directory--mobile'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Channel Directory"
    >
      <header className={styles['dpc-directory__header']}>
        <div className={styles['dpc-directory__title-row']}>
          <h2 className={styles['dpc-directory__title']}>
            Channel Directory
          </h2>
          <span className={styles['dpc-directory__subtitle']}>
            Discovery surface for private channels (A3-specific IA).
          </span>
        </div>

        {showAdminAggregate && (
          <div className={styles['dpc-directory__admin-aggregate']}>
            <Icon size="16" glyph={<AlertOutlineIcon />} />
            <span>
              Pending across my channels:{' '}
              <strong>{adminAggregateCount}</strong>
            </span>
            <span className={styles['dpc-directory__admin-aggregate-hint']}>
              See the admin rail →
            </span>
          </div>
        )}

        <div className={styles['dpc-directory__search']}>
          <SearchInput
            label="Search directory"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
          />
        </div>

        <div
          className={styles['dpc-directory__chip-row']}
          role="tablist"
          aria-label="Directory filters"
        >
          <Chip
            as="button"
            size="Medium Compact"
            tone={filter === 'all' ? 'info' : 'neutral'}
            colored={filter === 'all'}
            onClick={() => setFilter('all')}
            aria-pressed={filter === 'all'}
            role="tab"
          >
            All
          </Chip>
          <Chip
            as="button"
            size="Medium Compact"
            tone={filter === 'my-team' ? 'info' : 'neutral'}
            colored={filter === 'my-team'}
            onClick={() => setFilter('my-team')}
            aria-pressed={filter === 'my-team'}
            role="tab"
          >
            My Team
          </Chip>
          <Chip
            as="button"
            size="Medium Compact"
            tone={filter === 'my-pending' ? 'info' : 'neutral'}
            colored={filter === 'my-pending'}
            onClick={() => setFilter('my-pending')}
            aria-pressed={filter === 'my-pending'}
            role="tab"
          >
            My Pending
          </Chip>
        </div>
      </header>

      <div className={styles['dpc-directory__body']}>{renderBody()}</div>

      <footer className={styles['dpc-directory__footer']}>
        <span className={styles['dpc-directory__footer-hint']}>
          Showing {filtered.length} of {rows.length} entries · NFR-5 p95 ≤
          300ms · NFR-7 rate-limit 10/min · 50/24h
        </span>
      </footer>
    </section>
  );
}
