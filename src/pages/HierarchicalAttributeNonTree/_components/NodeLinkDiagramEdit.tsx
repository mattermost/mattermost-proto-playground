import { useEffect, useReducer, useRef, useState } from 'react';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import { optionMeta } from '@/pages/AttributeHubSimplified/_components/simplifiedModel';
import {
  parentsOf,
  childrenOf,
  layeredLayout,
  familyColorVar,
  type GraphOption,
} from '../nonTreeModel';
import type { RepProps, EdgeActions } from './repProps';
import AddValueControl from './AddValueControl';
import DiagramNodePopover from './DiagramNodePopover';
import styles from './NodeLinkDiagramEdit.module.scss';

// Layout constants REPLICATED from NodeLinkList (that file stays untouched); the
// diagram reads identically — solid = primary/anchor parent, dotted = additional.
const COL_W = 210;
const ROW_H = 64;
const NODE_W = 156;
const NODE_H = 40;
const PAD = 16;

interface NodePos {
  x: number;
  y: number;
}

/** Accessible name summarizing the node's structure — the a11y carrier now that
 * the authoritative list is gone. */
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
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const parents = parentsOf(options, node.id);
  const children = childrenOf(options, node.id);
  const accent = optionMeta(node.id).color ?? familyColorVar(options, node.id);

  return (
    <>
      <button
        ref={ref}
        type="button"
        className={[styles['node'], node.disabled ? styles['node--disabled'] : '']
          .filter(Boolean)
          .join(' ')}
        style={{
          left: pos.x,
          top: pos.y,
          width: NODE_W,
          height: NODE_H,
          borderLeftColor: accent,
        }}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={nodeAriaLabel(node.label, parents, children)}
        onClick={onOpen}
      >
        <span className={styles['node__label']}>{node.label}</span>
        {node.disabled && <span className={styles['node__tag']}>Off</span>}
      </button>
      {isOpen && (
        <DiagramNodePopover
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
 * NT-4b — the INTERACTIVE node-link diagram. Same layered layout as NT-4's
 * read-only diagram, but every node is a focusable `<button>` that opens a
 * per-node popover (DiagramNodePopover) for rename / color / parent edges /
 * child edges / delete. The authoritative "Values (editable)" side list from
 * NT-4 is REMOVED — the diagram + popovers are the whole surface. "Add value"
 * stays on the surface and adds a new top-level node.
 *
 * a11y posture: with the list gone, the NODES carry accessibility. Each is a
 * real button whose accessible name summarizes its structure (parents/children);
 * the popover is keyboard-operable and focus-managed by FixedPopoverMenu.
 * Connector lines are aria-hidden decoration. This is the exploratory arm — the
 * honest read is that the spatial structure itself is still not conveyed to a
 * screen reader, only each node's local edges via its label. See 06e notes.
 */
export default function NodeLinkDiagramEdit({ options, actions }: RepProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [, forceTick] = useReducer((x: number) => x + 1, 0);
  // Create-and-link is a two-step against the shared action bundle (addValue then
  // addParent). addValue does not return the new id, so we snapshot ids before
  // creating and, when a new id appears, link it — keeping the host's action
  // bundle and the other variations untouched.
  const pendingRef = useRef<{
    knownIds: Set<string>;
    link: 'parent' | 'child';
    nodeId: string;
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
  }, [options, actions]);

  const onCreateLinked = (label: string, as: 'parent' | 'child') => {
    if (openId == null) return;
    pendingRef.current = {
      knownIds: new Set(options.map((o) => o.id)),
      link: as,
      nodeId: openId,
    };
    actions.addValue(label);
  };

  if (options.length === 0) {
    return (
      <EmptyState
        title="No values yet"
        description="Add the first value to start the diagram. New values start at the top level; open a node to link parents or children from its popover."
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
        Select a node to edit its name, color, parents and children. There is no
        side list — the diagram is the whole surface.
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
              />
            );
          })}
        </div>
      </Scrollbars>
    </div>
  );
}
