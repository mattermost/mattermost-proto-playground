import { useMemo, useState } from 'react';
import Switch from '@/components/ui/Switch/Switch';
import {
  edgesOf,
  type GraphOption,
} from '@/pages/HierarchicalAttributeAuthoring/graphModel';
import type { GraphDiff } from '../importModel';
import styles from './DiffLineageTable.module.scss';

export interface DiffLineageTableProps {
  diff: GraphDiff;
  liveOptions: GraphOption[];
  nextOptions: GraphOption[];
}

type RowStatus = 'added' | 'removed' | 'unchanged';

interface DiffRow {
  key: string;
  status: RowStatus;
  parentLabel: string;
  childLabel: string;
}

const STATUS_WORD: Record<RowStatus, string> = {
  added: 'Added',
  removed: 'Removed',
  unchanged: 'Unchanged',
};

/**
 * The screen-reader-primary change record (02c §1 lineage table, tagged with
 * 02d §2 added/changed/removed). A plain semantic <table> — no tree keyboard
 * model, SR-native. It is the COMPLETE record: every added/removed edge, plus
 * (behind a toggle) every unchanged edge. Meaning is carried by a text tag in
 * its own column, never colour alone (AC-16(5) / 508). Defaults to the CHANGED
 * subset so a single re-parented edge is impossible to miss (F-5 mitigation).
 */
export default function DiffLineageTable({
  diff,
  liveOptions,
  nextOptions,
}: DiffLineageTableProps) {
  const [showAll, setShowAll] = useState(false);

  const rows = useMemo<DiffRow[]>(() => {
    const labelOf = (id: string) => {
      const inNext = nextOptions.find((o) => o.id === id);
      if (inNext) return inNext.label;
      const inLive = liveOptions.find((o) => o.id === id);
      return inLive?.label ?? id;
    };
    const nextEdges = edgesOf(nextOptions);
    const liveEdges = edgesOf(liveOptions);
    const liveSet = new Set(liveEdges.map((e) => `${e.parentId} ${e.childId}`));
    const nextSet = new Set(nextEdges.map((e) => `${e.parentId} ${e.childId}`));

    const added: DiffRow[] = [];
    const unchanged: DiffRow[] = [];
    for (const e of nextEdges) {
      const key = `${e.parentId} ${e.childId}`;
      const row: DiffRow = {
        key,
        status: liveSet.has(key) ? 'unchanged' : 'added',
        parentLabel: labelOf(e.parentId),
        childLabel: labelOf(e.childId),
      };
      (row.status === 'added' ? added : unchanged).push(row);
    }
    const removed: DiffRow[] = liveEdges
      .filter((e) => !nextSet.has(`${e.parentId} ${e.childId}`))
      .map((e) => ({
        key: `${e.parentId} ${e.childId}`,
        status: 'removed' as const,
        parentLabel: labelOf(e.parentId),
        childLabel: labelOf(e.childId),
      }));

    return [...added, ...removed, ...unchanged];
  }, [liveOptions, nextOptions]);

  const changedRows = rows.filter((r) => r.status !== 'unchanged');
  const visibleRows = showAll ? rows : changedRows;

  const reparented = diff.nodeDiffs.filter((n) => n.status === 'changed');

  return (
    <div className={styles['diff']}>
      <div className={styles['diff__head']}>
        <p className={styles['diff__summary']}>
          <span className={styles['diff__count']}>
            {diff.addedEdgeCount} added
          </span>
          {' · '}
          <span className={styles['diff__count']}>
            {diff.reparentedNodeCount} re-parented
          </span>
          {' · '}
          <span className={styles['diff__count']}>
            {diff.removedEdgeCount} removed
          </span>
          {' · '}
          <span className={styles['diff__muted']}>
            {diff.unchangedEdgeCount} unchanged
          </span>
        </p>
        <Switch
          size="Small"
          checked={showAll}
          onChange={(e) => setShowAll(e.target.checked)}
        >
          Show all edges (incl. unchanged)
        </Switch>
      </div>

      <table className={styles['table']} role="table">
        <caption className={styles['table__caption']}>
          Edge-level change record for this import — the complete, screen-reader
          record. Each row names one parent→child relationship and whether the
          import adds, removes, or leaves it unchanged.
        </caption>
        <thead>
          <tr>
            <th className={styles['th']} scope="col">
              Change
            </th>
            <th className={styles['th']} scope="col">
              Parent
            </th>
            <th className={styles['th']} scope="col">
              Child
            </th>
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((r) => (
            <tr
              key={`${r.status}-${r.key}`}
              className={styles['row']}
              data-status={r.status}
            >
              <td className={styles['cell']}>
                <span
                  className={[
                    styles['tag'],
                    styles[`tag--${r.status}`],
                  ].join(' ')}
                >
                  {STATUS_WORD[r.status]}
                </span>
              </td>
              <td className={styles['cell']}>{r.parentLabel}</td>
              <td className={styles['cell']}>{r.childLabel}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {reparented.length > 0 && (
        <div className={styles['reparent']}>
          <p className={styles['reparent__title']}>
            Re-parented values — reachability impact
          </p>
          <ul className={styles['reparent__list']}>
            {reparented.map((n) => (
              <li key={n.id} className={styles['reparent__item']}>
                <span className={styles['reparent__value']}>{n.label}</span>
                <span className={styles['reparent__detail']}>{n.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
