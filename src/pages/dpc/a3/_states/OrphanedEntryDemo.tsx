/**
 * OrphanedEntryDemo — toggle that demonstrates V-A3-2 (§3.3.12) and the
 * deletion-cascade contract (§3.3.10 "Error — orphaned entry").
 *
 * When toggled on, the prototype injects an extra directory row whose
 * referenced channel "no longer exists" — exercising:
 *   - The stale-cache fallback row (disabled state, "This channel no
 *     longer exists" copy, Request-to-Join suppressed).
 *   - The Directory_entry_orphaned audit event (emitted on toggle).
 *
 * The read-side sanity check is what normally prevents this row from
 * surfacing; the toggle is a deliberate "show the worst-case fallback"
 * affordance for reviewer inspection.
 */
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import Switch from '@/components/ui/Switch/Switch';
import Icon from '@/components/ui/Icon/Icon';
import type { A3Store } from '../useA3Store';
import styles from './OrphanedEntryDemo.module.scss';

interface OrphanedEntryDemoProps {
  store: A3Store;
  /** When true, render as a compact pill (e.g. for the scenario header). */
  compact?: boolean;
}

export default function OrphanedEntryDemo({
  store,
  compact = false,
}: OrphanedEntryDemoProps) {
  if (compact) {
    return (
      <div className={styles['dpc-orphan__compact']}>
        <Switch
          size="Small"
          checked={store.state.orphanedEntryDemo}
          onChange={() => store.dispatch({ type: 'TOGGLE_ORPHANED_DEMO' })}
        >
          V-A3-2 orphaned-entry demo
        </Switch>
      </div>
    );
  }

  return (
    <section className={styles['dpc-orphan']} aria-label="Orphaned-entry demo">
      <header className={styles['dpc-orphan__header']}>
        <Icon size="16" glyph={<AlertCircleOutlineIcon />} />
        <h4 className={styles['dpc-orphan__title']}>
          V-A3-2 · orphaned-entry demonstration
        </h4>
      </header>
      <p className={styles['dpc-orphan__body']}>
        Toggle on to simulate the deletion-vs-pruning race. The directory
        list will display an extra row whose underlying channel no longer
        exists; the Request-to-Join action is suppressed and the row reads
        "This channel no longer exists." A{' '}
        <code>Directory_entry_orphaned</code> audit event is emitted
        synchronously. Per §3.3.10 the read-side query joins to channels
        and filters null-channel rows, so this fallback is the worst-case
        stale-cache view — not the normal user experience.
      </p>
      <Switch
        size="Medium"
        checked={store.state.orphanedEntryDemo}
        onChange={() => store.dispatch({ type: 'TOGGLE_ORPHANED_DEMO' })}
        semiBold
        secondaryLabel="Re-toggle to clear the orphan from the visible directory list."
      >
        Simulate channel deletion with stale directory entry
      </Switch>
    </section>
  );
}
