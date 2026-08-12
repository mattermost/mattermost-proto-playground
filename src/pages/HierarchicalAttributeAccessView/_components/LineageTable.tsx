import { useState } from 'react';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import Switch from '@/components/ui/Switch/Switch';
import type { LineageRow } from '../accessModel';
import styles from './LineageTable.module.scss';

export interface LineageTableProps {
  rows: LineageRow[];
  selectedId: string | null;
  /** Self + descendants of the selection. Null when nothing is selected. */
  coveredIds: Set<string> | null;
  variant: 'admin' | 'member';
  /** Per-row reachability explanation. Supplied by the member variant. */
  explain?: (id: string) => string;
  caption: string;
  onSelect: (id: string | null) => void;
}

/** "Air Operations ▸ Falcon Wing ▸ Raptor Flight" */
function PathCell({ paths }: { paths: string[][] }) {
  if (paths.length === 0) {
    return <span className={styles['lineage__muted']}>—</span>;
  }
  return (
    <ul className={styles['lineage__paths']}>
      {paths.map((path) => (
        <li key={path.join('>')} className={styles['lineage__path']}>
          {path.map((label, i) => (
            <span
              key={`${label}-${i}`}
              className={styles['lineage__path-step']}
            >
              {i > 0 && (
                <span className={styles['lineage__path-sep']} aria-hidden>
                  ▸
                </span>
              )}
              {label}
            </span>
          ))}
        </li>
      ))}
    </ul>
  );
}

function ListCell({ labels }: { labels: string[] }) {
  if (labels.length === 0) {
    return <span className={styles['lineage__muted']}>None</span>;
  }
  return <span className={styles['lineage__list']}>{labels.join(', ')}</span>;
}

/**
 * The text equivalent — a peer surface, not a fallback.
 *
 * One row per value carrying exactly what the diagram carries: every path down
 * to the value, what holding it grants, and what grants it. A plain semantic
 * `<table>`: real `<th scope>` headers, a `<caption>` that states what the table
 * is, and a value cell that is a button so selecting a value from here drives
 * the same coverage query the diagram does. The idiom matches the import
 * preview's change record elsewhere in this project.
 *
 * This table must be usable as the ONLY view — that is the Section 508 answer
 * for a graph. Coverage membership is carried by a text tag in its own column,
 * never by opacity or colour alone.
 */
export default function LineageTable({
  rows,
  selectedId,
  coveredIds,
  variant,
  explain,
  caption,
  onSelect,
}: LineageTableProps) {
  const [coveredOnly, setCoveredOnly] = useState(false);
  const querying = coveredIds != null;
  const visible =
    querying && coveredOnly ? rows.filter((r) => coveredIds.has(r.id)) : rows;

  return (
    <div className={styles['lineage']}>
      {querying && (
        <div className={styles['lineage__toolbar']}>
          <Switch
            size="Small"
            checked={coveredOnly}
            onChange={(e) => setCoveredOnly(e.target.checked)}
          >
            Show only values in the coverage result
          </Switch>
        </div>
      )}

      <Scrollbars className={styles['lineage__scroll']}>
        <table className={styles['lineage__table']}>
          <caption className={styles['lineage__caption']}>{caption}</caption>
          <thead>
            <tr>
              {querying && (
                <th className={styles['lineage__th']} scope="col">
                  Coverage
                </th>
              )}
              <th className={styles['lineage__th']} scope="col">
                Value
              </th>
              <th className={styles['lineage__th']} scope="col">
                {variant === 'member'
                  ? 'Path from what you hold'
                  : 'Path from the top'}
              </th>
              <th className={styles['lineage__th']} scope="col">
                {variant === 'member'
                  ? 'Gives you access to'
                  : 'Grants access to'}
              </th>
              {variant === 'admin' ? (
                <>
                  <th className={styles['lineage__th']} scope="col">
                    Reachable by anyone holding
                  </th>
                  <th className={styles['lineage__th']} scope="col">
                    In use
                  </th>
                  <th className={styles['lineage__th']} scope="col">
                    Policies
                  </th>
                </>
              ) : (
                <th className={styles['lineage__th']} scope="col">
                  Why you can reach it
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => {
              const covered = coveredIds?.has(row.id) ?? false;
              const isSelected = selectedId === row.id;
              const rowClass = [
                styles['lineage__row'],
                isSelected ? styles['lineage__row--selected'] : '',
                querying && !covered ? styles['lineage__row--out'] : '',
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <tr key={row.id} className={rowClass}>
                  {querying && (
                    <td className={styles['lineage__td']}>
                      <span
                        className={[
                          styles['lineage__tag'],
                          covered
                            ? styles['lineage__tag--in']
                            : styles['lineage__tag--out'],
                        ].join(' ')}
                      >
                        {isSelected
                          ? 'Selected'
                          : covered
                            ? 'In coverage'
                            : 'Outside'}
                      </span>
                    </td>
                  )}
                  <th className={styles['lineage__row-head']} scope="row">
                    <button
                      type="button"
                      className={styles['lineage__value']}
                      aria-pressed={isSelected}
                      onClick={() => onSelect(isSelected ? null : row.id)}
                    >
                      {row.label}
                    </button>
                    {row.held && (
                      <span className={styles['lineage__held']}>
                        You hold this
                      </span>
                    )}
                  </th>
                  <td className={styles['lineage__td']}>
                    <PathCell paths={row.paths} />
                  </td>
                  <td className={styles['lineage__td']}>
                    <ListCell labels={row.grants} />
                  </td>
                  {variant === 'admin' ? (
                    <>
                      <td className={styles['lineage__td']}>
                        <ListCell labels={row.reachableBy} />
                      </td>
                      <td className={styles['lineage__td']}>
                        <span className={styles['lineage__num']}>
                          {row.inUseCount ?? 0}
                        </span>
                      </td>
                      <td className={styles['lineage__td']}>
                        <span className={styles['lineage__num']}>
                          {row.policyRefCount ?? 0}
                        </span>
                      </td>
                    </>
                  ) : (
                    <td className={styles['lineage__td']}>
                      <span className={styles['lineage__list']}>
                        {explain?.(row.id) ?? ''}
                      </span>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </Scrollbars>
    </div>
  );
}
