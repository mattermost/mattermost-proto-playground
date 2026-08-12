import type { CSSProperties } from 'react';
import CheckIcon from '@mattermost/compass-icons/components/check';
import Icon from '@/components/ui/Icon/Icon';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import {
  matrixOrder,
  wouldCreateCycle,
  familyColorVar,
  type GraphOption,
} from '../nonTreeModel';
import type { RepProps } from './repProps';
import AddValueControl from './AddValueControl';
import styles from './AdjacencyMatrix.module.scss';

/**
 * NT-3 — Adjacency matrix. Rows = potential parents, columns = potential
 * children. A filled cell (row R, col C) means "R is a parent of C"; toggling a
 * cell adds/removes exactly that one edge — the most direct edge editor of any
 * paradigm. The diagonal is disabled (no self-parent) and any cell that would
 * close a loop (C is an ancestor of R) is disabled with a reason. Cycle safety
 * is enforced fail-closed through `actions.addParent`.
 *
 * IMPLEMENTATION NOTE: this renders the full N×N grid, fine at the ~14-node
 * seed (~196 cells). Past ~50 nodes the grid is quadratic/sparse and needs a
 * seriation (matrix-reordering) algorithm plus virtualization to stay legible —
 * `matrixOrder` here is a family-clustering placeholder, not a real seriation.
 */
export default function AdjacencyMatrix({ options, actions }: RepProps) {
  if (options.length === 0) {
    return (
      <EmptyState
        title="No values yet"
        description="Add values to populate the matrix axes. Each value becomes both a row (as a potential parent) and a column (as a potential child); toggle a cell to link them."
        action={{ children: 'Add value', onClick: () => actions.addValue('New program') }}
      />
    );
  }

  const ordered = matrixOrder(options);
  const gridStyle: CSSProperties = {
    gridTemplateColumns: `var(--matrix-head) repeat(${ordered.length}, var(--matrix-cell))`,
  };

  const cellState = (parent: GraphOption, child: GraphOption) => {
    const linked = child.parentIds.includes(parent.id);
    if (linked) return { linked: true, disabled: false, reason: '' as string };
    if (parent.id === child.id)
      return { linked: false, disabled: true, reason: 'same value — an option can’t be its own parent' };
    if (wouldCreateCycle(options, child.id, parent.id))
      return {
        linked: false,
        disabled: true,
        reason: 'would create a loop — this column value is already above this row value',
      };
    return { linked: false, disabled: false, reason: '' };
  };

  return (
    <div className={styles['matrix']}>
      <div className={styles['legend']}>
        <span className={styles['legend__item']}>
          <span className={[styles['legend__swatch'], styles['legend__swatch--on']].join(' ')}>
            <Icon size="12" glyph={<CheckIcon />} />
          </span>
          Linked (row is a parent of column)
        </span>
        <span className={styles['legend__item']}>
          <span className={[styles['legend__swatch'], styles['legend__swatch--off']].join(' ')} />
          Not linked
        </span>
        <span className={styles['legend__item']}>
          <span className={[styles['legend__swatch'], styles['legend__swatch--blocked']].join(' ')} />
          Unavailable (self / would loop)
        </span>
      </div>

      <div className={styles['grid']} role="grid" aria-label="Parent-by-child link matrix" style={gridStyle}>
        {/* Header row */}
        <div className={styles['row']} role="row">
          <div className={[styles['corner']].join(' ')} role="columnheader">
            <span className={styles['corner__parent']}>Parent ↓</span>
            <span className={styles['corner__child']}>Child →</span>
          </div>
          {ordered.map((child) => (
            <div key={child.id} className={styles['colhead']} role="columnheader" title={child.label}>
              <span className={styles['colhead__text']}>{child.label}</span>
            </div>
          ))}
        </div>

        {/* Body rows */}
        {ordered.map((parent) => (
          <div key={parent.id} className={styles['row']} role="row">
            <div className={styles['rowhead']} role="rowheader" title={parent.label}>
              <span
                className={styles['dot']}
                style={{ background: familyColorVar(options, parent.id) }}
                aria-hidden
              />
              <span className={styles['rowhead__text']}>{parent.label}</span>
            </div>
            {ordered.map((child) => {
              const { linked, disabled, reason } = cellState(parent, child);
              const label = disabled
                ? `${parent.label}, parent of ${child.label}: unavailable — ${reason}`
                : linked
                  ? `${parent.label}, parent of ${child.label}: linked — activate to unlink`
                  : `${parent.label}, parent of ${child.label}: not linked — activate to link`;
              return (
                <button
                  key={child.id}
                  type="button"
                  role="gridcell"
                  className={[
                    styles['cell'],
                    linked ? styles['cell--on'] : '',
                    disabled ? styles['cell--blocked'] : '',
                    parent.id === child.id ? styles['cell--diagonal'] : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-label={label}
                  disabled={disabled}
                  title={disabled ? reason : undefined}
                  onClick={() => {
                    if (linked) actions.removeEdge(child.id, parent.id);
                    else actions.addParent(child.id, parent.id);
                  }}
                >
                  {linked && <Icon size="12" glyph={<CheckIcon />} />}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className={styles['footer']}>
        <AddValueControl onAdd={actions.addValue} />
        <p className={styles['footer__note']}>
          Rows and columns are grouped by program family for readability. At larger
          scale the grid needs matrix seriation and virtualization.
        </p>
      </div>
    </div>
  );
}
