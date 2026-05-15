/**
 * DPC A1 — Leave-and-Rejoin overlay surface (§3.1.6).
 *
 * Thin wrapper that renders BrowseChannels in `rejoinMode` so reviewers can
 * see the "Channels you can rejoin" filter as a dedicated, named surface.
 * Per PRD AC-3.1 there is NO row-level visual distinction for re-discoverable
 * channels and NO "Previously a member" caption in the Request-to-Join modal
 * (avoid prior-membership side-channel observable to either the requester
 * or other users). The FR-13 audit-event payload still records
 * `prior_membership: true` server-side.
 */
import BrowseChannels from './BrowseChannels';
import type { A1StoreApi } from '../useA1Store';
import styles from './RejoinableChannelsSurface.module.scss';

export interface RejoinableChannelsSurfaceProps {
  store: A1StoreApi;
}

export default function RejoinableChannelsSurface({
  store,
}: RejoinableChannelsSurfaceProps) {
  return (
    <div className={styles['rejoin-surface']}>
      <div className={styles['rejoin-surface__note']}>
        L&amp;R overlay (US-3): user-scoped count, no row-level badge for
        re-discoverable channels (side-channel avoidance per PRD AC-3.1).
      </div>
      <BrowseChannels store={store} rejoinMode />
    </div>
  );
}
