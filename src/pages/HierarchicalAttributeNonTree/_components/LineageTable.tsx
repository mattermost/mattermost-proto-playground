import { useRef, useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import CancelIcon from '@mattermost/compass-icons/components/cancel';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import CheckIcon from '@mattermost/compass-icons/components/check';
import Icon from '@/components/ui/Icon/Icon';
import Chip from '@/components/ui/Chip/Chip';
import IconButton from '@/components/ui/IconButton/IconButton';
import TextInput from '@/components/ui/TextInput/TextInput';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import {
  parentsOf,
  childrenOf,
  pathsTo,
  familyColorVar,
  type GraphOption,
} from '../nonTreeModel';
import type { RepProps } from './repProps';
import type { EdgeActions } from './repProps';
import AddParentMenu from './AddParentMenu';
import AddValueControl from './AddValueControl';
import styles from './LineageTable.module.scss';

/** Parents cell — chips + a chip-styled "Add parent" button that opens the picker. */
function ParentsCell({
  option,
  options,
  actions,
}: {
  option: GraphOption;
  options: GraphOption[];
  actions: EdgeActions;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const parents = parentsOf(options, option.id);

  return (
    <div className={styles['chips']}>
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
        </Chip>
      ))}
      <button
        ref={btnRef}
        type="button"
        className={styles['add-chip']}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon size="12" glyph={<PlusIcon />} />
        Add parent
      </button>
      {open && (
        <AddParentMenu
          option={option}
          allOptions={options}
          anchorRef={btnRef}
          onClose={() => setOpen(false)}
          onAddParent={(pid) => actions.addParent(option.id, pid)}
        />
      )}
    </div>
  );
}

/** Children cell — read/edit the reciprocal direction; removing detaches the edge. */
function ChildrenCell({
  option,
  options,
  actions,
}: {
  option: GraphOption;
  options: GraphOption[];
  actions: EdgeActions;
}) {
  const children = childrenOf(options, option.id);
  if (children.length === 0) {
    return <span className={styles['muted']}>—</span>;
  }
  return (
    <div className={styles['chips']}>
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
  );
}

function Row({
  option,
  options,
  actions,
}: {
  option: GraphOption;
  options: GraphOption[];
  actions: EdgeActions;
}) {
  const [expanded, setExpanded] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(option.label);

  const paths = pathsTo(options, option.id);
  const primary = paths[0] ?? [option.label];
  const extra = paths.length - 1;
  const deleteReason = actions.deleteBlock(option.id);

  const commitRename = () => {
    const t = draft.trim();
    if (t && t !== option.label) actions.renameValue(option.id, t);
    setRenaming(false);
  };

  return (
    <>
      <tr className={styles['row']} data-disabled={option.disabled || undefined}>
        <td className={styles['cell']}>
          <div className={styles['value']}>
            <span
              className={styles['dot']}
              style={{ background: familyColorVar(options, option.id) }}
              aria-hidden
            />
            {renaming ? (
              <TextInput
                size="Small"
                value={draft}
                aria-label={`Rename ${option.label}`}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename();
                  if (e.key === 'Escape') {
                    setDraft(option.label);
                    setRenaming(false);
                  }
                }}
              />
            ) : (
              <span className={styles['value__label']}>{option.label}</span>
            )}
            {option.disabled && <span className={styles['value__tag']}>Deactivated</span>}
          </div>
          <button
            type="button"
            className={styles['paths-toggle']}
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
          >
            <Icon size="12" glyph={expanded ? <ChevronDownIcon /> : <ChevronRightIcon />} />
            <span className={styles['paths-summary']}>
              {primary.join(' ▸ ')}
              {extra > 0 && !expanded && (
                <span className={styles['paths-more']}> · {extra} more</span>
              )}
            </span>
          </button>
        </td>
        <td className={styles['cell']}>
          <ParentsCell option={option} options={options} actions={actions} />
        </td>
        <td className={styles['cell']}>
          <ChildrenCell option={option} options={options} actions={actions} />
        </td>
        <td className={[styles['cell'], styles['cell--actions']].join(' ')}>
          <IconButton
            size="Small"
            aria-label={`Rename ${option.label}`}
            icon={<Icon size="16" glyph={<PencilOutlineIcon />} />}
            onClick={() => {
              setDraft(option.label);
              setRenaming(true);
            }}
          />
          <IconButton
            size="Small"
            aria-label={
              option.disabled ? `Reactivate ${option.label}` : `Deactivate ${option.label}`
            }
            toggled={option.disabled}
            icon={<Icon size="16" glyph={option.disabled ? <CheckIcon /> : <CancelIcon />} />}
            onClick={() => actions.toggleDeactivate(option.id)}
          />
          <span title={deleteReason ?? undefined}>
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
        </td>
      </tr>
      {expanded && (
        <tr className={styles['paths-row']}>
          <td className={styles['paths-cell']} colSpan={4}>
            <span className={styles['paths-cell__title']}>
              Full path{paths.length === 1 ? '' : 's'} to top level
            </span>
            <ul className={styles['paths-cell__list']}>
              {paths.map((p, i) => (
                <li key={i} className={styles['paths-cell__item']}>
                  {p.join(' ▸ ')}
                </li>
              ))}
            </ul>
          </td>
        </tr>
      )}
    </>
  );
}

/**
 * NT-1 — Lineage / two-column relationships table, with NT-2 (path list) folded
 * in as an expandable per-row reachability layer. One row per value; Parents and
 * Children each render adjacent values as removable chips. No indentation, no
 * tree keyboard model — a plain semantic table.
 */
export default function LineageTable({ options, actions }: RepProps) {
  if (options.length === 0) {
    return (
      <EmptyState
        title="No values yet"
        description="Add the first value to start building the relationships table. New values start at the top level; link them under a parent from the Parents column."
        action={{ children: 'Add value', onClick: () => actions.addValue('New program') }}
      />
    );
  }

  return (
    <div className={styles['lineage']}>
      <table className={styles['table']} role="table">
        <thead>
          <tr>
            <th className={styles['th']} scope="col">
              Value
            </th>
            <th className={styles['th']} scope="col">
              Parents
            </th>
            <th className={styles['th']} scope="col">
              Children
            </th>
            <th className={[styles['th'], styles['th--actions']].join(' ')} scope="col">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {options.map((o) => (
            <Row key={o.id} option={o} options={options} actions={actions} />
          ))}
        </tbody>
      </table>
      <div className={styles['footer']}>
        <AddValueControl onAdd={actions.addValue} />
      </div>
    </div>
  );
}
