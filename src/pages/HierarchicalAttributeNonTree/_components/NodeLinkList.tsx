import { useRef, useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import Icon from '@/components/ui/Icon/Icon';
import Chip from '@/components/ui/Chip/Chip';
import IconButton from '@/components/ui/IconButton/IconButton';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import {
  parentsOf,
  childrenOf,
  layeredLayout,
  familyColorVar,
  anchorParentIdOf,
  type GraphOption,
} from '../nonTreeModel';
import type { RepProps, EdgeActions } from './repProps';
import AddParentMenu from './AddParentMenu';
import AddValueControl from './AddValueControl';
import styles from './NodeLinkList.module.scss';

const COL_W = 210;
const ROW_H = 64;
const NODE_W = 156;
const NODE_H = 40;
const PAD = 16;

/** Read-only diagram — aria-hidden decorative reference. The list is authoritative. */
function Diagram({ options }: { options: GraphOption[] }) {
  const layout = layeredLayout(options);
  const pos = new Map<string, { x: number; y: number }>();
  for (const n of layout.nodes) {
    pos.set(n.id, { x: n.depth * COL_W + PAD, y: n.row * ROW_H + PAD });
  }
  const width = (layout.columns - 1) * COL_W + NODE_W + PAD * 2;
  const height = layout.rows * ROW_H + PAD * 2;

  return (
    <Scrollbars className={styles['diagram-scroll']}>
      <div
        className={styles['diagram']}
        style={{ width, height }}
        aria-hidden
      >
        <svg className={styles['diagram__svg']} width={width} height={height}>
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
                  styles['diagram__edge'],
                  e.kind === 'additional' ? styles['diagram__edge--additional'] : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                fill="none"
              />
            );
          })}
        </svg>
        {layout.nodes.map((n) => (
          <div
            key={n.id}
            className={[styles['node'], n.disabled ? styles['node--disabled'] : '']
              .filter(Boolean)
              .join(' ')}
            style={{
              left: pos.get(n.id)!.x,
              top: pos.get(n.id)!.y,
              width: NODE_W,
              height: NODE_H,
              borderLeftColor: familyColorVar(options, n.id),
            }}
          >
            <span className={styles['node__label']}>{n.label}</span>
          </div>
        ))}
      </div>
    </Scrollbars>
  );
}

function NodeListItem({
  option,
  options,
  actions,
}: {
  option: GraphOption;
  options: GraphOption[];
  actions: EdgeActions;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const addRef = useRef<HTMLButtonElement>(null);
  const parents = parentsOf(options, option.id);
  const children = childrenOf(options, option.id);
  const anchorId = anchorParentIdOf(option);
  const deleteReason = actions.deleteBlock(option.id);

  return (
    <li className={styles['item']}>
      <div className={styles['item__head']}>
        <span
          className={styles['dot']}
          style={{ background: familyColorVar(options, option.id) }}
          aria-hidden
        />
        <span className={styles['item__label']}>{option.label}</span>
        {option.disabled && <span className={styles['item__tag']}>Deactivated</span>}
        <span title={deleteReason ?? undefined} className={styles['item__delete']}>
          <IconButton
            size="Small"
            destructive
            disabled={deleteReason != null}
            aria-label={
              deleteReason
                ? `Delete ${option.label} (blocked): ${deleteReason}`
                : `Delete ${option.label}`
            }
            icon={<Icon size="16" glyph={<TrashCanOutlineIcon />} />}
            onClick={() => actions.deleteValue(option.id)}
          />
        </span>
      </div>

      <div className={styles['edges']}>
        <div className={styles['edges__group']}>
          <span className={styles['edges__label']}>Parents</span>
          <div className={styles['chips']}>
            {parents.length === 0 && <span className={styles['muted']}>Top level</span>}
            {parents.map((p) => (
              <Chip
                key={p.id}
                size="Small"
                leadingIcon={
                  <span
                    className={styles['dot']}
                    style={{ background: familyColorVar(options, p.id) }}
                    aria-hidden
                  />
                }
                onRemove={() => actions.removeEdge(option.id, p.id)}
                removeLabel={`Remove ${p.label} as a parent of ${option.label}`}
              >
                {p.label}
                {p.id === anchorId && parents.length > 1 && (
                  <span className={styles['chip-tag']}> · primary</span>
                )}
              </Chip>
            ))}
            <button
              ref={addRef}
              type="button"
              className={styles['add-chip']}
              onClick={() => setPickerOpen((v) => !v)}
            >
              <Icon size="12" glyph={<PlusIcon />} />
              Add parent
            </button>
            {pickerOpen && (
              <AddParentMenu
                option={option}
                allOptions={options}
                anchorRef={addRef}
                onClose={() => setPickerOpen(false)}
                onAddParent={(pid) => actions.addParent(option.id, pid)}
              />
            )}
          </div>
        </div>

        <div className={styles['edges__group']}>
          <span className={styles['edges__label']}>Children</span>
          <div className={styles['chips']}>
            {children.length === 0 && <span className={styles['muted']}>None</span>}
            {children.map((c) => (
              <Chip
                key={c.id}
                size="Small"
                leadingIcon={
                  <span
                    className={styles['dot']}
                    style={{ background: familyColorVar(options, c.id) }}
                    aria-hidden
                  />
                }
                onRemove={() => actions.removeEdge(c.id, option.id)}
                removeLabel={`Detach ${c.label} from under ${option.label}`}
              >
                {c.label}
              </Chip>
            ))}
          </div>
        </div>
      </div>
    </li>
  );
}

/**
 * NT-4 — Node-link diagram PAIRED with an authoritative node/edge list. The
 * diagram is a read-only, curated, depth-layered reference: solid connector =
 * primary (anchor) parent, dotted connector = additional parent — the org-chart
 * idiom for multi-parent. It is `aria-hidden` decorative. ALL editing happens in
 * the keyboard/screen-reader list beside it (add/remove parent, remove child,
 * delete, add value). This is the exploratory / bold arm: honest a11y is that
 * the diagram conveys no structure to a screen reader — the list is the source
 * of truth.
 */
export default function NodeLinkList({ options, actions }: RepProps) {
  if (options.length === 0) {
    return (
      <EmptyState
        title="No values yet"
        description="Add the first value to start the diagram. New values start at the top level; link them under a parent from the list on the right."
        action={{ children: 'Add value', onClick: () => actions.addValue('New program') }}
      />
    );
  }

  return (
    <div className={styles['nodelink']}>
      <section className={styles['pane']} aria-label="Diagram (visual reference)">
        <div className={styles['pane__head']}>
          <span className={styles['pane__title']}>Diagram</span>
          <span className={styles['pane__legend']}>
            <span className={styles['legend-line']} />
            primary parent
            <span className={[styles['legend-line'], styles['legend-line--dotted']].join(' ')} />
            additional parent
          </span>
        </div>
        <p className={styles['pane__note']}>
          Visual reference only. Screen readers use the editable list; this diagram
          is hidden from assistive tech.
        </p>
        <Diagram options={options} />
      </section>

      <section className={styles['pane']} aria-label="Values, parents and children (editable)">
        <div className={styles['pane__head']}>
          <span className={styles['pane__title']}>Values (editable)</span>
        </div>
        <Scrollbars className={styles['list-scroll']}>
          <ul className={styles['list']}>
            {options.map((o) => (
              <NodeListItem key={o.id} option={o} options={options} actions={actions} />
            ))}
          </ul>
        </Scrollbars>
        <div className={styles['footer']}>
          <AddValueControl onAdd={actions.addValue} />
        </div>
      </section>
    </div>
  );
}
