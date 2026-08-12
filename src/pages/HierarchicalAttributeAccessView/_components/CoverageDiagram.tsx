import { useRef, useState, type KeyboardEvent } from 'react';
import Button from '@/components/ui/Button/Button';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import {
  childrenOf,
  familyColorVar,
  parentsOf,
  type GraphOption,
} from '../accessModel';
import { GEO, columnOrder, type AccessLayout } from '../accessLayout';
import styles from './CoverageDiagram.module.scss';

export interface CoverageDiagramProps {
  /** The graph to draw — already scoped to the viewer. */
  options: GraphOption[];
  /** Layout computed from the same scoped graph. */
  layout: AccessLayout;
  selectedId: string | null;
  /** Self + descendants of `selectedId`. Null when nothing is selected. */
  coveredIds: Set<string> | null;
  /** Values the viewer holds — rendered as the "you" anchor. */
  heldIds?: readonly string[];
  /** Admin-only: the value being compared against the selection. */
  compareId?: string | null;
  /** Phrasing switch for accessible names. */
  memberScoped?: boolean;
  onSelect: (id: string | null) => void;
}

/**
 * Accessible name for one node. The connector lines and arrowheads are
 * decorative (`aria-hidden`), so each node's name has to carry the direction
 * information the arrowheads carry visually: what is above it (grants it) and
 * what is below it (it grants). Coverage membership is appended while a query is
 * active, because opacity alone conveys it visually.
 */
function nodeAccessibleName({
  label,
  parents,
  children,
  held,
  selected,
  covered,
  querying,
  memberScoped,
}: {
  label: string;
  parents: GraphOption[];
  children: GraphOption[];
  held: boolean;
  selected: boolean;
  covered: boolean;
  querying: boolean;
  memberScoped: boolean;
}): string {
  const parts: string[] = [label];
  if (held) parts.push('You hold this value');
  if (parents.length > 0) {
    parts.push(
      memberScoped
        ? `Reached through ${parents.map((p) => p.label).join(', ')}`
        : `Reachable by anyone holding ${parents.map((p) => p.label).join(', ')}`,
    );
  } else {
    parts.push('Nothing above it');
  }
  if (children.length > 0) {
    parts.push(`Grants access to ${children.map((c) => c.label).join(', ')}`);
  } else {
    parts.push('Grants access to nothing further');
  }
  if (querying) {
    if (selected) parts.push('Selected value');
    else
      parts.push(
        covered ? 'Inside the coverage result' : 'Outside the coverage result',
      );
  }
  return `${parts.join('. ')}.`;
}

/**
 * 2D node-link coverage diagram — the interaction model of the standalone
 * Three.js reference (`specs/graph-attributes/graph-attributes-visualization.html`)
 * re-housed in the DOM.
 *
 * Ported verbatim from the reference:
 *  - selecting a value lights its covered set (itself plus every descendant),
 *    dims everything else, and darkens/thickens the edges wholly inside the set;
 *  - selecting empty space resets;
 *  - every edge carries an explicit arrowhead pointing child → parent.
 *
 * Deliberately NOT ported: the WebGL renderer. A canvas has no DOM, no focus
 * order and no screen-reader semantics, and the reference already occludes two
 * top-level badges at 24 nodes in its default camera — orbiting fixes that for a
 * mouse user and for nobody else. Here every node is a real focusable button,
 * arrow keys walk the edges, and the lineage table beside the diagram carries the
 * same information as a peer surface rather than a fallback.
 *
 * Divergence on the dim level: the reference dims to 0.08. Node labels are text,
 * and text at 8% opacity fails WCAG 1.4.3 for exactly the low-vision operator
 * this product serves, so out-of-set NODES dim to a still-legible level while the
 * decorative connector lines take the deeper fade. See the module SCSS.
 */
export default function CoverageDiagram({
  options,
  layout,
  selectedId,
  coveredIds,
  heldIds = [],
  compareId = null,
  memberScoped = false,
  onSelect,
}: CoverageDiagramProps) {
  const nodeRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());
  const [focusId, setFocusId] = useState<string | null>(
    () => layout.nodes[0]?.id ?? null,
  );

  const querying = coveredIds != null;
  const held = new Set(heldIds);

  const moveFocus = (id: string | null) => {
    if (!id) return;
    setFocusId(id);
    nodeRefs.current.get(id)?.focus();
  };

  const onNodeKeyDown = (e: KeyboardEvent<HTMLButtonElement>, id: string) => {
    const node = layout.byId.get(id);
    if (!node) return;
    switch (e.key) {
      case 'ArrowRight': {
        // Downstream along an edge — the values this one grants.
        const next = childrenOf(options, id)[0];
        if (next) {
          e.preventDefault();
          moveFocus(next.id);
        }
        break;
      }
      case 'ArrowLeft': {
        // Upstream along an edge — the values that grant this one.
        const next = parentsOf(options, id)[0];
        if (next) {
          e.preventDefault();
          moveFocus(next.id);
        }
        break;
      }
      case 'ArrowDown':
      case 'ArrowUp': {
        const column = columnOrder(layout, node.col);
        const i = column.findIndex((n) => n.id === id);
        const j = e.key === 'ArrowDown' ? i + 1 : i - 1;
        if (j >= 0 && j < column.length) {
          e.preventDefault();
          moveFocus(column[j].id);
        }
        break;
      }
      case 'Home':
        e.preventDefault();
        moveFocus(layout.nodes[0]?.id ?? null);
        break;
      case 'End':
        e.preventDefault();
        moveFocus(layout.nodes[layout.nodes.length - 1]?.id ?? null);
        break;
      case 'Escape':
        e.preventDefault();
        onSelect(null);
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles['diagram']}>
      <div className={styles['diagram__legend']}>
        <span className={styles['diagram__legend-item']}>
          <svg
            className={styles['diagram__legend-glyph']}
            viewBox="0 0 40 12"
            aria-hidden
          >
            <line
              x1="38"
              y1="6"
              x2="10"
              y2="6"
              className={styles['diagram__legend-line']}
            />
            <path
              d="M 9 6 L 17 2 L 17 10 Z"
              className={styles['diagram__legend-head']}
            />
          </svg>
          Arrow points to the value above — the one that grants it
        </span>
        <span className={styles['diagram__legend-item']}>
          <svg
            className={styles['diagram__legend-glyph']}
            viewBox="0 0 40 12"
            aria-hidden
          >
            <line
              x1="38"
              y1="6"
              x2="10"
              y2="6"
              className={[
                styles['diagram__legend-line'],
                styles['diagram__legend-line--cross'],
              ].join(' ')}
            />
            <path
              d="M 9 6 L 17 2 L 17 10 Z"
              className={[
                styles['diagram__legend-head'],
                styles['diagram__legend-head--cross'],
              ].join(' ')}
            />
          </svg>
          Dashed — a value with more than one value above it
        </span>
        {querying && (
          <Button
            className={styles['diagram__clear']}
            size="Small"
            emphasis="Tertiary"
            onClick={() => onSelect(null)}
          >
            Clear selection
          </Button>
        )}
      </div>

      <p className={styles['diagram__hint']}>
        Select a value to see what it grants. Arrow keys walk the diagram: left
        and right follow an edge, up and down move within a column. Enter
        selects, Escape clears.
      </p>

      <Scrollbars className={styles['diagram__scroll']}>
        {/* Clicking anywhere that is not a value resets the query, mirroring the
            reference implementation's "click empty space to reset". This is a
            pointer-only shortcut, not the only way out: Escape on any node and
            the "Clear selection" button above both do the same thing, so the
            behaviour is fully reachable from the keyboard without giving a
            decorative container a fake interactive role. */}
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          className={styles['diagram__canvas']}
          style={{ width: layout.width, height: layout.height }}
          onClick={(e) => {
            if (!(e.target as HTMLElement).closest('button')) onSelect(null);
          }}
        >
          <svg
            className={styles['diagram__svg']}
            width={layout.width}
            height={layout.height}
            aria-hidden
          >
            {layout.edges.map((edge) => {
              const inSet =
                coveredIds != null &&
                coveredIds.has(edge.parentId) &&
                coveredIds.has(edge.childId);
              const edgeClass = [
                styles['diagram__edge'],
                edge.crossBranch ? styles['diagram__edge--cross'] : '',
                querying
                  ? inSet
                    ? styles['diagram__edge--in']
                    : styles['diagram__edge--out']
                  : '',
              ]
                .filter(Boolean)
                .join(' ');
              const headClass = [
                styles['diagram__head'],
                edge.crossBranch ? styles['diagram__head--cross'] : '',
                querying
                  ? inSet
                    ? styles['diagram__head--in']
                    : styles['diagram__head--out']
                  : '',
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <g key={edge.key}>
                  <path d={edge.d} className={edgeClass} fill="none" />
                  {/* Flat arrowhead, aimed along the curve's tangent at its
                      midpoint. The 2D layout has no camera, so the angle is
                      computed once instead of every frame. */}
                  <path
                    d="M 8 0 L -5 5 L -5 -5 Z"
                    className={headClass}
                    transform={`translate(${edge.midX} ${edge.midY}) rotate(${edge.angle})`}
                  />
                </g>
              );
            })}
          </svg>

          <div
            className={styles['diagram__nodes']}
            role="group"
            aria-label={`${options.length} values, laid out with the values that grant access on the left`}
          >
            {layout.nodes.map((n) => {
              const option = options.find((o) => o.id === n.id);
              if (!option) return null;
              const isSelected = selectedId === n.id;
              const isCompared = compareId === n.id;
              const covered = coveredIds?.has(n.id) ?? false;
              const isHeld = held.has(n.id);
              const cls = [
                styles['diagram__node'],
                isSelected ? styles['diagram__node--selected'] : '',
                isCompared ? styles['diagram__node--compared'] : '',
                isHeld ? styles['diagram__node--held'] : '',
                querying
                  ? covered
                    ? styles['diagram__node--in']
                    : styles['diagram__node--out']
                  : '',
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <button
                  key={n.id}
                  ref={(el) => {
                    nodeRefs.current.set(n.id, el);
                  }}
                  type="button"
                  className={cls}
                  style={{
                    left: n.x,
                    top: n.y,
                    width: GEO.NODE_W,
                    height: GEO.NODE_H,
                    // Family accent is resolved from the SCOPED graph only. In
                    // the member variant the family root is usually out of
                    // scope, so the accent degrades to neutral — the viewer is
                    // not told which family a value belongs to, and the client
                    // is never handed the full graph "just for colours".
                    borderInlineStartColor: familyColorVar(options, n.id),
                  }}
                  tabIndex={focusId === n.id ? 0 : -1}
                  aria-pressed={isSelected}
                  aria-label={nodeAccessibleName({
                    label: n.label,
                    parents: parentsOf(options, n.id),
                    children: childrenOf(options, n.id),
                    held: isHeld,
                    selected: isSelected,
                    covered,
                    querying,
                    memberScoped,
                  })}
                  onFocus={() => setFocusId(n.id)}
                  onKeyDown={(e) => onNodeKeyDown(e, n.id)}
                  onClick={() => onSelect(isSelected ? null : n.id)}
                >
                  <span className={styles['diagram__node-label']}>
                    {n.label}
                  </span>
                  {isHeld && (
                    <span className={styles['diagram__node-badge']}>You</span>
                  )}
                  {isCompared && !isHeld && (
                    <span className={styles['diagram__node-badge']}>
                      Compared
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </Scrollbars>
    </div>
  );
}
