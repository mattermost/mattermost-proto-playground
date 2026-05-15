/**
 * DPC A3 — Curated Directory (channel-admin-curated).
 *
 * Mechanism: the channel object carries no Discoverable attribute. A
 * separate Channel Directory holds references to private channels.
 * Channel admins explicitly add channels to the directory via the
 * channel-header `⋮ → Add to Channel Directory` menu (§3.3.4 surface 2).
 * FR-3 atomicity is by construction (the directory entry can only be
 * created after the channel and its access rules already exist).
 *
 * The prototype's load-bearing requirement: the two-surface admin
 * operation must be visibly obvious so a side-by-side review against A1's
 * one-surface flow is honest. We pin the channel-header `⋮` menu OPEN in
 * the admin scenario and render Channel Settings above it on the same
 * canvas. Reviewers see at a glance that A3 splits Configure access
 * (Settings) from Publish discoverability (header menu).
 *
 * Per persona:
 *   - Channel admin → Settings + Header (menu open) on the left;
 *     PendingRequestsRail + DirectoryAdminSurface on the right.
 *   - End-user tenured / newer → ChannelDirectorySurface on the left;
 *     DmNotificationPreview on the right.
 *   - Guest → ChannelDirectorySurface (renders zero-eligible-rows per
 *     NFR-2) on the left; DmNotificationPreview on the right.
 *   - System admin → AuditPanel on the left; supporting context cards
 *     (legend, walkthrough script) on the right.
 *
 * The orphaned-entry demo (V-A3-2) toggle lives in the scenario header
 * trailingControl slot, so reviewers can flip it from any persona view.
 */
import { type ReactNode } from 'react';
import {
  CHANNELS,
  PrototypeShell,
  usePersona,
  useViewport,
} from '@/pages/dpc/shared';
import { A3ChannelProvider } from './A3.context';
import { useA3Store } from './useA3Store';
import ChannelDirectorySurface from './_states/ChannelDirectorySurface';
import ChannelSettings from './_states/ChannelSettings';
import ChannelHeader from './_states/ChannelHeader';
import {
  AddToDirectoryDialog,
  RemoveFromDirectoryDialog,
} from './_states/AddToDirectoryDialog';
import DirectoryAdminSurface from './_states/DirectoryAdminSurface';
import RequestToJoinModal from './_states/RequestToJoinModal';
import PendingRequestsRail from './_states/PendingRequestsRail';
import DmNotificationPreview from './_states/DmNotificationPreview';
import AuditPanel from './_states/AuditPanel';
import OrphanedEntryDemo from './_states/OrphanedEntryDemo';
import styles from './A3.module.scss';

/**
 * The "active" channel that's the subject of the admin scenario.
 * Default: ch-002 (`ops-planning-q3`) — in the seeded directory.
 */
const ADMIN_FOCUS_CHANNEL_ID = 'ch-002';

interface InnerLayoutProps {
  storeProp: ReturnType<typeof useA3Store>;
}

function A3Inner({ storeProp }: InnerLayoutProps) {
  const { persona } = usePersona();
  const { viewport } = useViewport();

  const focusChannel =
    CHANNELS.find((c) => c.id === ADMIN_FOCUS_CHANNEL_ID) ?? CHANNELS[0]!;

  let left: ReactNode = null;
  let right: ReactNode = null;

  if (persona === 'channel-admin') {
    left = (
      <div className={styles['dpc-a3__admin-stack']}>
        <ChannelSettings />
        <div className={styles['dpc-a3__surface-bridge']}>
          <span aria-hidden>↓ A3 two-surface admin operation ↓</span>
          <p>
            The channel admin configures access rules above (Channel
            Settings). To publish discoverability, the admin opens the
            channel below and uses the header menu — a second surface.
            Side-by-side with A1's one-surface flow, the mental-model cost
            is visible.
          </p>
        </div>
        <ChannelHeader
          store={storeProp}
          persona={persona}
          forceMenuOpen={viewport === 'desktop'}
        />
      </div>
    );
    right = (
      <div className={styles['dpc-a3__rail-stack']}>
        <DirectoryAdminSurface store={storeProp} />
        <PendingRequestsRail store={storeProp} />
        <OrphanedEntryDemo store={storeProp} />
      </div>
    );
  } else if (persona === 'system-admin') {
    left = <AuditPanel store={storeProp} />;
    right = (
      <div className={styles['dpc-a3__rail-stack']}>
        <div className={styles['dpc-a3__sysadmin-legend']}>
          <h3>A3 audit-event additions</h3>
          <ul>
            <li>
              <code>Directory_entry_added</code> — admin confirms Add to
              Directory.
            </li>
            <li>
              <code>Directory_entry_removed</code> — admin removes; carries{' '}
              <code>pending_requests_auto_withdrawn</code> count.
            </li>
            <li>
              <code>Directory_entry_orphaned</code> — background sweep
              prunes a stale entry pointing at a deleted channel.
            </li>
          </ul>
          <p className={styles['dpc-a3__sysadmin-legend-note']}>
            Per §3.3.7 the standard Request_* and ABAC_* events are
            unchanged and continue to reference <code>channel_id</code>, not{' '}
            <code>directory_entry_id</code> — the join lifecycle is
            reconstructable from channel-scoped events alone.
          </p>
        </div>
        <OrphanedEntryDemo store={storeProp} />
      </div>
    );
  } else {
    // end-user-tenured / end-user-newer / guest
    left = <ChannelDirectorySurface store={storeProp} />;
    right = (
      <div className={styles['dpc-a3__rail-stack']}>
        <DmNotificationPreview store={storeProp} />
        <OrphanedEntryDemo store={storeProp} />
      </div>
    );
  }

  return (
    <A3ChannelProvider channel={focusChannel}>
      <div
        className={[
          styles['dpc-a3'],
          viewport === 'mobile' ? styles['dpc-a3--mobile'] : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <aside className={styles['dpc-a3__lhs-nav']}>
          <p className={styles['dpc-a3__lhs-nav-eyebrow']}>LHS — A3 IA</p>
          <ul>
            <li>Channels (standard)</li>
            <li>Direct Messages</li>
            <li>Browse Channels (public)</li>
            <li className={styles['dpc-a3__lhs-nav-active']}>
              Channel Directory ← A3-specific entry point
            </li>
          </ul>
        </aside>

        <div className={styles['dpc-a3__columns']}>
          <div className={styles['dpc-a3__col-left']}>{left}</div>
          <div className={styles['dpc-a3__col-right']}>{right}</div>
        </div>

        <AddToDirectoryDialog store={storeProp} />
        <RemoveFromDirectoryDialog store={storeProp} />
        <RequestToJoinModal store={storeProp} />
      </div>
    </A3ChannelProvider>
  );
}

function A3Shell() {
  const { persona } = usePersona();
  const store = useA3Store({ persona });

  return (
    <>
      <A3Inner storeProp={store} />
    </>
  );
}

function A3TrailingControl() {
  // Renders the orphaned-entry toggle inline in the scenario header so it
  // is reachable from every persona — and so the V-A3-2 walkthrough is
  // never more than one click away.
  // Note: the store is owned by A3Inner, so the header-level toggle is
  // intentionally NOT wired here (avoids dual instances). The persona
  // panels each include the OrphanedEntryDemo card.
  return (
    <span className={styles['dpc-a3__trailing-note']}>
      Orphan-entry toggle lives in each persona panel ↓
    </span>
  );
}

export default function A3() {
  return (
    <PrototypeShell
      label="DPC — A3: Curated Directory"
      trailingControl={<A3TrailingControl />}
    >
      <A3Shell />
    </PrototypeShell>
  );
}
