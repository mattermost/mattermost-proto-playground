import { useEffect, useReducer, useRef, useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import Icon from '@/components/ui/Icon/Icon';
import { optionMeta } from '@/pages/AttributeHubSimplified/_components/simplifiedModel';
import AddValueControl from '@/pages/HierarchicalAttributeNonTree/_components/AddValueControl';
import {
  parentsOf,
  childrenOf,
  layeredLayout,
  familyColorVar,
  type GraphOption,
} from '@/pages/HierarchicalAttributeNonTree/nonTreeModel';
import type { EdgeActions, RepProps } from './edgeActions';
import NodePopover from './NodePopover';
import styles from './DiagramCanvas.module.scss';

// Layout constants forked from NodeLinkDiagramEdit; PAD is widened to give the
// on-node ghost affordances room to sit outside the node without clipping at the
// canvas edges.
const COL_W = 220;
const ROW_H = 72;
const NODE_W = 156;
const NODE_H = 40;
const PAD = 44;

interface NodePos {
  x: number;
  y: number;
}

const DEFAULT_NEW_LABEL = 'New value';

/** Accessible name summarizing the node's local structure. */
function nodeAriaLabel(
  label: string,
  parents: GraphOption[],
  children: GraphOption[],
): string {
  const pWord = parents.length === 1 ? 'parent' : 'parents';
  const cWord = children.length === 1 ? 'child' : 'children';
  const pNames = parents.length
    ? `: ${parents.map((p) => p.label).join(', ')}`
    : '';
  const cNames = children.length
    ? `: ${children.map((c) => c.label).join(', ')}`
    : '';
  return `${label} — ${parents.length} ${pWord}${pNames}; ${children.length} ${cWord}${cNames}. Activate to edit.`;
}

function DiagramNode({
  node,
  options,
  actions,
  pos,
  isOpen,
  onOpen,
  onClose,
  onColorChange,
  onCreateLinked,
  onGhostAdd,
}: {
  node: GraphOption;
  options: GraphOption[];
  actions: EdgeActions;
  pos: NodePos;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onColorChange: () => void;
  onCreateLinked: (label: string, as: 'parent' | 'child') => void;
  onGhostAdd: (nodeId: string, as: 'parent' | 'child') => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const parents = parentsOf(options, node.id);
  const children = childrenOf(options, node.id);
  const accent = optionMeta(node.id).color ?? familyColorVar(options, node.id);

  return (
    <>
      <div
        className={styles['node-group']}
        style={{ left: pos.x, top: pos.y, width: NODE_W, height: NODE_H }}
      >
        {/* Ghost PARENT — upstream, to the left. Real focusable button. */}
        <button
          type="button"
          className={[styles['ghost'], styles['ghost--parent']].join(' ')}
          aria-label={`Add parent of ${node.label}`}
          title={`Add parent of ${node.label}`}
          tabIndex={node.disabled ? -1 : 0}
          onClick={() => onGhostAdd(node.id, 'parent')}
        >
          <Icon size="16" glyph={<PlusIcon />} />
        </button>

        <button
          ref={ref}
          type="button"
          className={[styles['node'], node.disabled ? styles['node--disabled'] : '']
            .filter(Boolean)
            .join(' ')}
          style={{ width: NODE_W, height: NODE_H, borderLeftColor: accent }}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-label={nodeAriaLabel(node.label, parents, children)}
          onClick={onOpen}
        >
          <span className={styles['node__label']}>{node.label}</span>
          {node.disabled && <span className={styles['node__tag']}>Off</span>}
        </button>

        {/* Ghost CHILD — downstream, to the right. Real focusable button. */}
        <button
          type="button"
          className={[styles['ghost'], styles['ghost--child']].join(' ')}
          aria-label={`Add child of ${node.label}`}
          title={`Add child of ${node.label}`}
          tabIndex={node.disabled ? -1 : 0}
          onClick={() => onGhostAdd(node.id, 'child')}
        >
          <Icon size="16" glyph={<PlusIcon />} />
        </button>
      </div>

      {isOpen && (
        <NodePopover
          option={node}
          allOptions={options}
          anchorRef={ref}
          actions={actions}
          onClose={onClose}
          onColorChange={onColorChange}
          onCreateLinked={onCreateLinked}
        />
      )}
    </>
  );
}

/**
 * Interactive node-link diagram (NT-4b) with two authoring improvements over the
 * non-tree original:
 *
 *  1. On-node ghost add: hovering (or keyboard-focusing) a node reveals two ghost
 *     "+" buttons — a ghost parent (upstream / left) and a ghost child (downstream
 *     / right). Clicking one CREATES a new value AND auto-connects it in that
 *     direction in a single gesture, then opens the new node's popover for a
 *     rename. Cycle-safe by construction (a fresh node has no other edges) and it
 *     still routes through the fail-closed addParent gate.
 *  2. Independent add: the "Add value" control drops a new, unconnected top-level
 *     node that the admin then wires up via its popover — both paths coexist.
 *
 * The ghost buttons are the sighted fast path; the popover's creatable combobox
 * ("Add or create a parent/child") is the keyboard/AT-accessible equivalent. The
 * ghosts are nonetheless real focusable buttons with explicit labels ("Add child
 * of X" / "Add parent of X"), reachable in the tab order.
 *
 * a11y posture (honest): with no side list, the NODES carry accessibility — each
 * is a button whose name summarizes its local edges. Connector lines are
 * aria-hidden decoration; the spatial layout itself is still not conveyed to a
 * screen reader beyond each node's own parents/children. See 06g notes.
 */
export default function DiagramCanvas({ options, actions }: RepProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [, forceTick] = useReducer((x: number) => x + 1, 0);
  // Create-and-link is a two-step against the shared action bundle (addValue then
  // addParent). addValue doesn't return the new id, so we snapshot ids before
  // creating and link the one that appears — keeping the shared model untouched.
  const pendingRef = useRef<{
    knownIds: Set<string>;
    link: 'parent' | 'child';
    nodeId: string;
    openAfter: boolean;
  } | null>(null);

  useEffect(() => {
    const pending = pendingRef.current;
    if (!pending) return;
    const created = options.find((o) => !pending.knownIds.has(o.id));
    if (!created) return;
    pendingRef.current = null;
    if (pending.link === 'parent') {
      actions.addParent(pending.nodeId, created.id);
    } else {
      actions.addParent(created.id, pending.nodeId);
    }
    if (pending.openAfter) setOpenId(created.id);
  }, [options, actions]);

  const createLinked = (
    nodeId: string,
    as: 'parent' | 'child',
    label: string,
    openAfter: boolean,
  ) => {
    pendingRef.current = {
      knownIds: new Set(options.map((o) => o.id)),
      link: as,
      nodeId,
      openAfter,
    };
    actions.addValue(label);
  };

  // Popover "Create '…'" — link to the currently-open node, keep that popover open.
  const onCreateLinked = (label: string, as: 'parent' | 'child') => {
    if (openId == null) return;
    createLinked(openId, as, label, false);
  };

  // Ghost "+" — create a default-named node, link it, then open it for rename.
  const onGhostAdd = (nodeId: string, as: 'parent' | 'child') => {
    createLinked(nodeId, as, DEFAULT_NEW_LABEL, true);
  };

  if (options.length === 0) {
    return (
      <EmptyState
        title="No values yet"
        description="Add the first value to start the diagram. New values start at the top level; hover a node to add a parent or child, or open a node to link values from its popover."
        action={{
          children: 'Add value',
          onClick: () => actions.addValue('New program'),
        }}
      />
    );
  }

  const layout = layeredLayout(options);
  const pos = new Map<string, NodePos>();
  for (const n of layout.nodes) {
    pos.set(n.id, { x: n.depth * COL_W + PAD, y: n.row * ROW_H + PAD });
  }
  const width = (layout.columns - 1) * COL_W + NODE_W + PAD * 2;
  const height = layout.rows * ROW_H + PAD * 2;
  const nodeById = new Map(options.map((o) => [o.id, o]));

  return (
    <div className={styles['surface']}>
      <div className={styles['toolbar']}>
        <span className={styles['legend']}>
          <span className={styles['legend__line']} />
          primary parent
          <span
            className={[styles['legend__line'], styles['legend__line--dotted']].join(
              ' ',
            )}
          />
          additional parent
        </span>
        <AddValueControl onAdd={actions.addValue} emphasis="Secondary" />
      </div>
      <p className={styles['note']}>
        Hover a node for its “+” add-parent / add-child buttons — each creates a new
        value and connects it in one step. Or select a node to rename it, recolor
        it, and link existing values. “Add value” drops a new top-level node.
      </p>

      <Scrollbars className={styles['canvas-scroll']}>
        <div className={styles['canvas']} style={{ width, height }}>
          <svg
            className={styles['canvas__svg']}
            width={width}
            height={height}
            aria-hidden
          >
            {layout.edges.map((e, i) => {
              const p = pos.get(e.parentId);
              const c = pos.get(e.childId);
              if (!p || !c) return null;
              const x1 = p.x + NODE_W;
              const y1 = p.y + NODE_H / 2;
              const x2 = c.x;
              const y2 = c.y + NODE_H / 2;
              const mx = (x1 + x2) / 2;
              return (
                <path
                  key={i}
                  d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                  className={[
                    styles['canvas__edge'],
                    e.kind === 'additional'
                      ? styles['canvas__edge--additional']
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  fill="none"
                />
              );
            })}
          </svg>
          {layout.nodes.map((n) => {
            const node = nodeById.get(n.id);
            if (!node) return null;
            return (
              <DiagramNode
                key={n.id}
                node={node}
                options={options}
                actions={actions}
                pos={pos.get(n.id)!}
                isOpen={openId === n.id}
                onOpen={() => setOpenId((cur) => (cur === n.id ? null : n.id))}
                onClose={() => setOpenId(null)}
                onColorChange={forceTick}
                onCreateLinked={onCreateLinked}
                onGhostAdd={onGhostAdd}
              />
            );
          })}
        </div>
      </Scrollbars>
    </div>
  );
}
