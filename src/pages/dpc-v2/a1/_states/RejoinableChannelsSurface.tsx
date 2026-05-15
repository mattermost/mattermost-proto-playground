/**
 * DPC V2 A1 — RejoinableChannelsSurface (Wave 1 stub).
 *
 * Carry-forward. The "side-channel observable" notice already removed in V1;
 * Wave 2 will keep that as-is (no row-level rejoin badge).
 */
import type { A1V2StoreApi } from '../useA1V2Store';
import styles from './RejoinableChannelsSurface.module.scss';

export interface RejoinableChannelsSurfaceProps {
  store: A1V2StoreApi;
}

export default function RejoinableChannelsSurface(
  _props: RejoinableChannelsSurfaceProps,
) {
  return (
    <section className={styles['v2-rejoin-surface']}>
      <header className={styles['v2-rejoin-surface__header']}>
        Rejoinable channels (V2)
      </header>
      <div className={styles['v2-rejoin-surface__placeholder']}>
        Wave 2: carry-forward; user-scoped count, no row-level badge.
      </div>
    </section>
  );
}
