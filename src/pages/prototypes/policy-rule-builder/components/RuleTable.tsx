// [AI DRAFT] A′ "Extend in place": the shipped requirements table, generalized.
//
// Row:   [party chip ▾]  [operator ▾]  [value ▾ | attribute chip ▾]  [⋯] [delete]
// The value menu has "Values" and "Compare with another attribute", following
// the shipped "Channel attributes" section. Comparisons offer every other
// party, listed User → Recipient → resource, and the rule is kept exactly as
// the admin writes it (feedback F4, revised in round 1.1).
//
// Grouping (feedback F5: the checkbox model is archived in ../archive/):
//   flat        one All/Any join in the header
//   blocks      "+ Add group" inserts an empty indented block. A group always
//               takes the opposite join of its list, so it needs no control
//   connectors  "Where / and / or" in reading order instead of a header join;
//               groups as in blocks
//   sets        handled by SetsEditor (Editors.tsx): this table is one set
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import AlertCircleOutlineIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import FilterVariantIcon from '@mattermost/compass-icons/components/filter-variant';
import InformationOutlineIcon from '@mattermost/compass-icons/components/information-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { Tooltip } from '@mattermost/compass-ui/components/tooltip';
import type { PartyId } from '../model/catalog';
import { availableParties } from '../model/permissions';
import type { GroupingMode } from '../model/celParse';
import { operandText, refLabel } from '../model/format';
import type { PermissionId, ResourceMode } from '../model/permissions';
import {
  compareCandidates,
  defaultRuleFor,
  group as makeGroup,
  isMultiValue,
  operatorLabel,
  partiesInUse,
  operatorsFor,
  refDef,
  rule as makeRule,
  type Group,
  type Join,
  type OperatorId,
  type RoleId,
  type Rule,
  type RuleNode,
  allRules,
  prune,
  rulesFirst,
  wideningReasons,
  withoutRule,
} from '../model/rules';
import { newlyAllowedPairs } from '../model/behaviourDiff';
import { provenLooser } from './pageHelpers';
import type { Vocabulary } from '../model/vocabulary';
import { EDITOR, GROUPS, JOIN, WHEN } from '../copy';
import MenuCell, { AttributeChip, type MenuGroup } from './MenuCell';
import { attributeMenu, parseRefKey, refKey } from './attributeMenu';
import editor from './RuleEditor.module.scss';
import styles from './RuleTable.module.scss';

export interface RuleContext {
  vocab: Vocabulary;
  role: RoleId;
  permissions: PermissionId[];
  resourceMode: ResourceMode;
  grouping: GroupingMode;
  /** Parties rules may use right now. */
  parties: PartyId[];
  /** Parties the whole policy's rules use (rules first, feedback F3). */
  partiesInUse: PartyId[];
  /** The whole policy, so a row can judge what the OTHER rules need (QA1-3). */
  root?: Group;
}

const NUMBER_PRESETS = ['2', '4', '6', '8', '12', '20'];

const opposite = (j: Join): Join => (j === 'all' ? 'any' : 'all');

/** Flip every nested group so it stays the opposite of its list. */
function withJoin(root: Group, join: Join): Group {
  return {
    ...root,
    join,
    children: root.children.map((c) =>
      c.kind === 'group' ? { ...c, join: opposite(join) } : c,
    ),
  };
}

type GroupChange = 'ungroup' | 'remove' | 'move-in' | 'move-out';

interface UndoState {
  kind: GroupChange;
  /** The rules before the change. */
  before: Group;
  /** The rules right after it. Once they differ, Undo is gone. */
  afterKey: string;
  /** Where focus goes when Undo runs. */
  focusBack: string;
}

const treeKey = (g: Group) => JSON.stringify(g);

/** No complete rule left. */
const empty = (g: Group) => allRules(prune(g)).length === 0;

/**
 * Would `after` let more people act than `before`? The same two checks as the
 * warnings bar, structure and sample pairs, so the two never disagree (GUX3-1).
 */
function evidence(before: Group, after: Group, ctx: RuleContext) {
  // A row with no value yet isn't part of the policy (GUX4-3).
  const policy = (root: Group) => ({ id: '', name: '', role: ctx.role, permissions: ctx.permissions, root: prune(root) });
  const reasons = wideningReasons(policy(before), policy(after));
  return {
    // Only proven loosening counts, as on the page bar: "changed, direction
    // unknown" is not "less strict" (QA3-1, CON3-1).
    proven: provenLooser(reasons) || newlyAllowedPairs(policy(before), policy(after)).count > 0,
    unknown: reasons.length > 0,
  };
}

function loosens(before: Group, after: Group, ctx: RuleContext): boolean {
  return evidence(before, after, ctx).proven;
}

type Verdict = 'looser' | 'stricter' | 'changed' | 'same';

/** Looser, stricter, changed in a way we can't rank, or no change (GUX3-2, QA3-1). */
function verdictOf(before: Group, after: Group, ctx: RuleContext): Verdict {
  const fwd = evidence(before, after, ctx);
  if (fwd.proven) return 'looser';
  const back = evidence(after, before, ctx);
  // "Stricter" only when nothing points the other way: the sample alone can't
  // rule out that a change of unknown direction also lets someone in (QA4-3).
  if (back.proven && !fwd.unknown) return 'stricter';
  return fwd.unknown || back.unknown ? 'changed' : 'same';
}

/* ------------------------------------------------------------------ */
/* Join control (header, flat and blocks)                              */
/* ------------------------------------------------------------------ */

export function JoinControl({
  value,
  onChange,
  nested = false,
  lockedReason,
}: {
  value: Join;
  onChange: (j: Join) => void;
  nested?: boolean;
  lockedReason?: string;
}) {
  const labels = nested ? JOIN.nested : JOIN.root;
  const tipId = useId();
  const [tipOpen, setTipOpen] = useState(false);
  // Hover covers the button and the tooltip, so the pointer can move onto the
  // text without it closing (WCAG 1.4.13, GUX3-5).
  const tipRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = tipRef.current;
    if (!el) return undefined;
    const show = () => setTipOpen(true);
    const hide = () => setTipOpen(false);
    // Escape closes it wherever focus is (GUX4-4).
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide();
    };
    el.addEventListener('mouseenter', show);
    el.addEventListener('mouseleave', hide);
    document.addEventListener('keydown', onKey);
    return () => {
      el.removeEventListener('mouseenter', show);
      el.removeEventListener('mouseleave', hide);
      document.removeEventListener('keydown', onKey);
    };
  }, [lockedReason]);
  if (lockedReason) {
    // An info glyph, not the lock, which reads as Mattermost's private-channel
    // marker (GVIS2-5). The tip opens below, right-aligned to the button, so it
    // never covers the label it explains; its arrow sits under the icon
    // (GVIS3-2, GVIS4-1).
    return (
      <span className={[editor['policy-editor__anchor'], styles['rule-table__join--locked']].join(' ')}>
        <span className={editor['policy-editor__head-control']}>
          <Icon glyph={<FilterVariantIcon />} size="16" />
          {labels[value]}
        </span>
        <span ref={tipRef} className={styles['rule-table__tip-anchor']}>
          <IconButton
            size="x-small"
            icon={<Icon glyph={<InformationOutlineIcon />} size="12" />}
            aria-label={GROUPS.joinLockedAria}
            aria-describedby={tipId}
            onFocus={() => setTipOpen(true)}
            onBlur={() => setTipOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setTipOpen(false);
            }}
          />
          <span
            id={tipId}
            role="tooltip"
            className={[styles['rule-table__tip'], tipOpen ? styles['rule-table__tip--open'] : ''].join(' ')}
          >
            <Tooltip label={lockedReason} arrow="top" />
          </span>
        </span>
      </span>
    );
  }
  return (
    <MenuCell
      ariaLabel={`${labels[value]}. Change how rules combine`}
      groups={[{ options: (['all', 'any'] as Join[]).map((j) => ({ value: j, label: labels[j] })) }]}
      selected={[value]}
      onSelect={(j) => onChange(j as Join)}
      menuClassName={styles['rule-table__join-menu']}
      renderTrigger={({ open, toggle }) => (
        <button
          type="button"
          className={editor['policy-editor__head-control']}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={toggle}
        >
          <Icon glyph={<FilterVariantIcon />} size="16" />
          {labels[value]}
          <Icon glyph={<ChevronDownIcon />} size="16" />
        </button>
      )}
    >
      {null}
    </MenuCell>
  );
}

/** "Where / and / or" in the first column (connectors mode). */
function ConnectorCell({
  index,
  join,
  onChange,
  fixed,
}: {
  index: number;
  join: Join;
  onChange?: (j: Join) => void;
  /** Inside a group the connector is implied by the list around it. */
  fixed?: boolean;
}) {
  if (index === 0) {
    return <span className={styles['rule-table__connector']}>{GROUPS.where}</span>;
  }
  const word = join === 'all' ? GROUPS.and : GROUPS.or;
  if (fixed || !onChange) {
    return <span className={styles['rule-table__connector']}>{word}</span>;
  }
  return (
    <MenuCell
      ariaLabel={GROUPS.connectorAria(word)}
      groups={[
        {
          options: (['all', 'any'] as Join[]).map((j) => ({
            value: j,
            label: j === 'all' ? GROUPS.and : GROUPS.or,
            description: j === 'all' ? GROUPS.andHelp : GROUPS.orHelp,
          })),
        },
      ]}
      selected={[join]}
      onSelect={(j) => onChange(j as Join)}
      chevron
    >
      <span className={styles['rule-table__connector']}>{word}</span>
    </MenuCell>
  );
}

/* ------------------------------------------------------------------ */
/* Row                                                                 */
/* ------------------------------------------------------------------ */

function valueGroups(r: Rule, ctx: RuleContext, parties: PartyId[]): MenuGroup[] {
  const def = refDef(r.left);
  const values = def.type === 'number' ? NUMBER_PRESETS : def.values;
  const groups: MenuGroup[] = [
    {
      heading: EDITOR.valuesSection,
      options: values.map((v) => ({ value: `v:${v}`, label: v })),
    },
  ];
  if (operatorsFor(def.type, 'attr').length > 0) {
    const candidates = compareCandidates(r.left, parties, ctx.role);
    if (candidates.length > 0) {
      groups.push({
        heading: EDITOR.compareSection,
        options: candidates.map((c) => ({
          value: `a:${refKey(c.ref.party, c.ref.attr)}`,
          label: refLabel(c.ref, ctx.vocab),
          disabledReason: c.disabledReason,
        })),
      });
    }
  }
  return groups;
}

export interface RowAction {
  value: string;
  label: string;
  description?: string;
  /** Says up front, on its own line, when the action loosens the policy. */
  warning?: string;
  run: () => void;
}

export function RuleRow({
  r,
  ctx,
  onChange,
  onRemove,
  leading,
  actions = [],
  valueMenuOpen = false,
  actionsOpen = false,
}: {
  /** Scene support: open the row menu on load. */
  actionsOpen?: boolean;
  r: Rule;
  ctx: RuleContext;
  onChange: (next: Rule) => void;
  onRemove: () => void;
  /** Leading cell (connector words). */
  leading?: ReactNode;
  /** Row menu: move into or out of a group. */
  actions?: RowAction[];
  valueMenuOpen?: boolean;
}) {
  const def = refDef(r.left);
  const leftLabel = refLabel(r.left, ctx.vocab);
  const ops = operatorsFor(def.type, r.right.kind);
  // Judge this row against the other rules, not itself (QA1-3): its attribute
  // can change to anything they allow, and it can compare with any party
  // they allow alongside its own.
  const others = ctx.root ? partiesInUse(withoutRule(ctx.root, r.id)) : ctx.partiesInUse;
  const valueParties = ctx.root
    ? availableParties(Array.from(new Set([...others, r.left.party])), ctx.permissions)
    : ctx.parties;
  const multi = r.right.kind === 'value' && isMultiValue(r.op);
  const selectedValues =
    r.right.kind === 'value'
      ? r.right.values.map((v) => `v:${v}`)
      : [`a:${refKey(r.right.ref.party, r.right.ref.attr)}`];

  const pickValue = (key: string) => {
    if (key.startsWith('a:')) {
      const ref = parseRefKey(key.slice(2));
      const attrOps = operatorsFor(def.type, 'attr');
      const op = attrOps.includes(r.op) ? r.op : attrOps[0];
      // Written as the admin picks it, in either order (designer, round 1.1).
      onChange({ ...r, op, right: { kind: 'attr', ref } });
      return;
    }
    const v = key.slice(2);
    const valueOps = operatorsFor(def.type, 'value');
    const op: OperatorId = valueOps.includes(r.op) ? r.op : valueOps[0];
    if (r.right.kind === 'value' && isMultiValue(op)) {
      const has = r.right.values.includes(v);
      const next = has ? r.right.values.filter((x) => x !== v) : [...r.right.values, v];
      onChange({ ...r, op, right: { kind: 'value', values: next.length ? next : [v] } });
      return;
    }
    onChange({ ...r, op, right: { kind: 'value', values: [v] } });
  };

  return (
    // RuleTable moves focus here after a group change (GUX1-4).
    <tr data-focus-key={`rule:${r.id}`}>
      {leading !== undefined ? <td className={styles['rule-table__lead']}>{leading}</td> : null}
      <td className={editor['policy-editor__cell--trigger']}>
        <MenuCell
          ariaLabel={EDITOR.rowAria(leftLabel, 'attribute', leftLabel)}
          groups={attributeMenu(ctx.vocab, others, ctx.role, ctx.permissions)}
          searchable
          selected={[refKey(r.left.party, r.left.attr)]}
          onSelect={(key) => {
            const left = parseRefKey(key);
            onChange({ ...r, left, ...defaultRuleFor(left) });
          }}
        >
          <AttributeChip label={leftLabel} />
        </MenuCell>
      </td>
      <td className={editor['policy-editor__cell--trigger']}>
        <MenuCell
          ariaLabel={EDITOR.rowAria(leftLabel, 'operator', operatorLabel(r.op, def.type, r.right.kind))}
          groups={[{ options: ops.map((o) => ({ value: o, label: operatorLabel(o, def.type, r.right.kind) })) }]}
          selected={[r.op]}
          onSelect={(op) => {
            const nextOp = op as OperatorId;
            if (r.right.kind === 'value' && !isMultiValue(nextOp)) {
              onChange({ ...r, op: nextOp, right: { kind: 'value', values: r.right.values.slice(0, 1) } });
              return;
            }
            onChange({ ...r, op: nextOp });
          }}
        >
          {operatorLabel(r.op, def.type, r.right.kind)}
        </MenuCell>
      </td>
      <td className={editor['policy-editor__cell--trigger']} data-focus-key={`value:${r.id}`}>
        <MenuCell
          ariaLabel={EDITOR.rowAria(
            leftLabel,
            'value',
            r.right.kind === 'attr'
              ? refLabel(r.right.ref, ctx.vocab)
              : operandText(r, ctx.vocab) || WHEN.placeholder,
          )}
          groups={valueGroups(r, ctx, valueParties)}
          selected={selectedValues}
          multi={multi}
          onSelect={pickValue}
          defaultOpen={valueMenuOpen}
          chevron
        >
          {r.right.kind === 'attr' ? (
            <AttributeChip label={refLabel(r.right.ref, ctx.vocab)} />
          ) : operandText(r, ctx.vocab) ? (
            operandText(r, ctx.vocab)
          ) : (
            <span className={styles['rule-table__placeholder']}>{WHEN.placeholder}</span>
          )}
        </MenuCell>
      </td>
      <td className={editor['policy-editor__table-right']}>
        <span className={styles['rule-table__row-actions']}>
          {actions.length ? (
            <MenuCell
              ariaLabel={GROUPS.rowMenu(leftLabel)}
              groups={[
                {
                  options: actions.map((a) => ({
                    value: a.value,
                    label: a.label,
                    description: a.description,
                    warning: a.warning,
                  })),
                },
              ]}
              selected={[]}
              defaultOpen={actionsOpen}
              onSelect={(v) => actions.find((a) => a.value === v)?.run()}
              menuClassName={styles['rule-table__row-menu']}
              renderTrigger={({ open, toggle }) => (
                <IconButton
                  size="small"
                  icon={<Icon glyph={<DotsHorizontalIcon />} size="16" />}
                  aria-label={GROUPS.rowMenu(leftLabel)}
                  aria-haspopup="menu"
                  aria-expanded={open}
                  onClick={toggle}
                />
              )}
            >
              {null}
            </MenuCell>
          ) : null}
          <IconButton
            size="small"
            destructive
            icon={<Icon glyph={<TrashCanOutlineIcon />} size="16" />}
            aria-label={EDITOR.removeRow(leftLabel)}
            onClick={onRemove}
          />
        </span>
      </td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/* Add attribute                                                       */
/* ------------------------------------------------------------------ */

export function AddAttributeButton({
  ctx,
  onAdd,
  label = EDITOR.addAttribute,
  defaultOpen = false,
  defaultQuery,
  size = 'small',
}: {
  ctx: RuleContext;
  onAdd: (r: Rule) => void;
  label?: string;
  defaultOpen?: boolean;
  defaultQuery?: string;
  size?: 'small' | 'x-small';
}) {
  return (
    <MenuCell
      ariaLabel={label.replace('+ ', '')}
      groups={attributeMenu(ctx.vocab, ctx.partiesInUse, ctx.role, ctx.permissions)}
      searchable
      selected={[]}
      onSelect={(key) => {
        const left = parseRefKey(key);
        const d = defaultRuleFor(left);
        onAdd(makeRule(left, d.op, d.right));
      }}
      defaultOpen={defaultOpen}
      defaultQuery={defaultQuery}
      renderTrigger={({ open, toggle }) => (
        <Button
          emphasis="tertiary"
          size={size}
          leadingIcon={<Icon glyph={<PlusIcon />} />}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={toggle}
        >
          {label}
        </Button>
      )}
    >
      {null}
    </MenuCell>
  );
}

/* ------------------------------------------------------------------ */
/* Table                                                               */
/* ------------------------------------------------------------------ */

export interface RuleTableProps {
  group: Group;
  onChange: (next: Group) => void;
  ctx: RuleContext;
  /** Inside a group block: no header join, no further groups. */
  nested?: boolean;
  /** The list this nested table sits in (its join decides the implied connector). */
  parentJoin?: Join;
  /** Fixed join, with the reason. */
  joinLocked?: string;
  hideJoin?: boolean;
  /** Rules here can't be grouped (one rule set; B′ When conditions). */
  noGroups?: boolean;
  addLabel?: string;
  emptyText?: string;
  footerExtra?: ReactNode;
  addMenuOpen?: boolean;
  /** Scene support: start the add menu with this search (M6). */
  addMenuQuery?: string;
  valueMenuOpen?: boolean;
  /** Scene support: open the first rule's row menu on load. */
  rowMenuOpen?: boolean;
  /** Scene support: show the "Ungrouped · Undo" line, restoring this tree. */
  initialUndo?: Group;
  ariaLabel?: string;
}

export default function RuleTable({
  group,
  onChange,
  ctx,
  nested = false,
  joinLocked,
  hideJoin = false,
  noGroups = false,
  addLabel,
  emptyText = EDITOR.empty,
  footerExtra,
  addMenuOpen = false,
  addMenuQuery,
  valueMenuOpen = false,
  rowMenuOpen = false,
  initialUndo,
  ariaLabel,
}: RuleTableProps) {
  const mode = ctx.grouping;
  const wrapRef = useRef<HTMLDivElement>(null);
  // After a group change, focus goes to a known target (GUX1-4): the rule
  // that moved, the restored group, or Undo.
  const focusRef = useRef<string | null>(null);
  useEffect(() => {
    const key = focusRef.current;
    if (!key) return;
    focusRef.current = null;
    const el = wrapRef.current?.querySelector<HTMLElement>(`[data-focus-key="${key}"]`);
    (el?.matches('button') ? el : el?.querySelector<HTMLElement>('button'))?.focus();
  });
  // One Undo for every group change (GUX1-2, GUX2-4). It covers that change
  // only: any later edit clears it, so Undo can't revert later work (GUX2-1).
  const [undo, setUndo] = useState<UndoState | null>(() =>
    initialUndo
      ? {
          kind: 'ungroup',
          before: initialUndo,
          afterKey: treeKey(group),
          focusBack: `group:${initialUndo.children.find((c) => c.kind === 'group' && !group.children.some((x) => x.id === c.id))?.id ?? ''}`,
        }
      : null,
  );
  // Edits from outside this table (Advanced mode) also end the Undo.
  const live = undo && undo.afterKey === treeKey(group) ? undo : null;

  const canGroup = (mode === 'blocks' || mode === 'connectors') && !nested && !noGroups;
  const connectors = mode === 'connectors';
  // Rules before groups, so each group's label reads in order (GUX3-6).
  const listed = group.children.filter((c) => c.kind !== 'when');
  const visible = canGroup ? rulesFirst(listed) : listed;
  const hidden = group.children.filter((c) => c.kind === 'when');
  const groups = visible.filter((c): c is Group => c.kind === 'group');

  const tree = (children: RuleNode[]): Group => ({
    ...group,
    children: [...(canGroup ? rulesFirst(children) : children), ...hidden],
  });
  /** Every edit goes through here and ends the Undo (GUX2-1). */
  const commit = (next: Group) => {
    setUndo(null);
    onChange(next);
  };
  const setVisible = (children: RuleNode[]) => commit(tree(children));
  const replace = (id: string, next: RuleNode | null) =>
    setVisible(visible.flatMap((c) => (c.id === id ? (next ? [next] : []) : [c])));
  const setJoin = (join: Join) => commit(canGroup ? withJoin(group, join) : { ...group, join });

  /** A group change: apply it, offer Undo, move focus. */
  const change = (kind: GroupChange, children: RuleNode[], focusTo: string, focusBack: string) => {
    const next = tree(children);
    setUndo({ kind, before: group, afterKey: treeKey(next), focusBack });
    focusRef.current = focusTo;
    onChange(next);
  };
  /** Says up front, in the menu, when a group change loosens the policy. */
  const warnIf = (children: RuleNode[]) => {
    const next = tree(children);
    if (!loosens(group, next, ctx)) return undefined;
    return empty(next) ? GROUPS.emptiedMenu() : GROUPS.loosens;
  };
  /** Where focus goes when a rule is deleted (GUX3-4): the next item, else the one before, else the add button. */
  const afterRemove = (items: RuleNode[], id: string, fallback: string) => {
    const at = items.findIndex((c) => c.id === id);
    const next = items[at + 1] ?? items[at - 1];
    if (!next) return fallback;
    return next.kind === 'group' ? `group:${next.id}` : `rule:${next.id}`;
  };

  const addGroup = () => {
    const g = makeGroup(opposite(group.join), []);
    focusRef.current = `add:${g.id}`;
    setVisible([...visible, g]);
  };
  // Once a group holds a rule, changing the list's join would invert it too
  // (A or (B and C) → A and (B or C)), so the join locks with the reason
  // (GUX1-1). An empty group doesn't lock it (GUX2-3).
  const filledGroups = groups.filter((g) => g.children.length > 0).length;
  const lockForGroups = canGroup && filledGroups > 0 ? GROUPS.joinLocked(filledGroups) : undefined;

  /** Row menu: move a root rule into a group. */
  const rootActions = (r: Rule): RowAction[] =>
    canGroup
      ? groups.map((g, gi) => {
          const children = visible
            .filter((c) => c.id !== r.id)
            .map((c) => (c.id === g.id ? { ...g, children: [...g.children, r] } : c));
          return {
            value: `into:${g.id}`,
            label: groups.length > 1 ? GROUPS.moveIntoNumbered(gi + 1) : GROUPS.moveInto,
            warning: warnIf(children),
            run: () => change('move-in', children, `rule:${r.id}`, `rule:${r.id}`),
          };
        })
      : [];

  const cols = connectors ? 5 : 4;
  let rowIndex = 0;
  const verdict = live ? verdictOf(live.before, group, ctx) : 'same';

  return (
    <div
      ref={wrapRef}
      className={[editor['policy-editor__table-wrap'], nested ? styles['rule-table--nested'] : ''].join(' ')}
      role="group"
      aria-label={ariaLabel ?? (nested ? JOIN.nested[group.join] : JOIN.root[group.join])}
    >
      <table className={[editor['policy-editor__table'], styles['rule-table__table']].join(' ')}>
        {/* One column grid for every rule table, so stacked tables line up. */}
        <colgroup>
          {connectors ? <col className={styles['rule-table__col--lead']} /> : null}
          <col className={styles['rule-table__col--attribute']} />
          <col className={styles['rule-table__col--operator']} />
          <col />
          <col className={styles['rule-table__col--actions']} />
        </colgroup>
        {nested ? null : (
          <thead>
            <tr>
              {connectors ? <th aria-hidden /> : null}
              <th>{EDITOR.columns.attribute}</th>
              <th>{EDITOR.columns.operator}</th>
              {/* Spans the actions column so the join control sits at the table's right edge. */}
              <th colSpan={2}>
                <div className={styles['rule-table__values-head']}>
                  <span>{EDITOR.columns.values}</span>
                  {hideJoin || connectors ? null : (
                    <JoinControl
                      value={group.join}
                      lockedReason={joinLocked ?? lockForGroups}
                      onChange={setJoin}
                    />
                  )}
                </div>
              </th>
            </tr>
          </thead>
        )}
        <tbody>
          {visible.length === 0 ? (
            <tr>
              <td colSpan={cols} className={editor['policy-editor__empty-other']}>
                {emptyText}
              </td>
            </tr>
          ) : null}
          {visible.map((child) => {
            const i = rowIndex;
            rowIndex += 1;
            const lead = connectors ? (
              <ConnectorCell
                index={i}
                join={group.join}
                fixed={nested}
                onChange={nested ? undefined : setJoin}
              />
            ) : undefined;
            if (child.kind === 'rule') {
              return (
                <RuleRow
                  key={child.id}
                  r={child}
                  ctx={ctx}
                  leading={lead}
                  actions={nested ? [] : rootActions(child)}
                  actionsOpen={rowMenuOpen && i === 0}
                  valueMenuOpen={valueMenuOpen && i === 0}
                  onChange={(next) => replace(child.id, next)}
                  onRemove={() => {
                    focusRef.current = afterRemove(visible, child.id, 'add-root');
                    replace(child.id, null);
                  }}
                />
              );
            }
            if (child.kind !== 'group') return null;
            const gi = groups.indexOf(child);
            // The label says how the group joins the list, so the policy reads
            // top to bottom: "Or, all of these" (GUX1-5). Numbered once there
            // are two, to match "Move into group 2" (GUX2-5).
            const label = GROUPS.blockLabel(child.join, {
              joined: !connectors && i > 0,
              n: groups.length > 1 ? gi + 1 : undefined,
            });
            const ungrouped = visible.flatMap((c) => (c.id === child.id ? child.children : [c]));
            const removed = visible.filter((c) => c.id !== child.id);
            return (
              <tr key={child.id} className={styles['rule-table__group-row']}>
                {connectors ? <td className={styles['rule-table__lead']}>{lead}</td> : null}
                <td colSpan={4}>
                  <div
                    className={styles['rule-table__group']}
                    role="group"
                    aria-label={`${label}. ${GROUPS.blockHelp(child.join)}`}
                  >
                    {/* The label carries the connector and the join, so the
                        separate help line went (it said the same thing). */}
                    <div className={styles['rule-table__group-head']}>
                      <span className={styles['rule-table__group-label']}>{label}</span>
                      {/* Group ⋯ sits in the row ⋯ column; the spacer stands in
                          for the row's delete button (GVIS2-1). */}
                      <span
                        className={[styles['rule-table__row-actions'], styles['rule-table__group-actions']].join(' ')}
                        data-focus-key={`group:${child.id}`}
                      >
                        <MenuCell
                          ariaLabel={GROUPS.groupMenu(label)}
                          groups={[
                            {
                              options: [
                                {
                                  value: 'ungroup',
                                  label: GROUPS.ungroup,
                                  description: GROUPS.ungroupHelp,
                                  warning: warnIf(ungrouped),
                                },
                                {
                                  value: 'remove',
                                  label: GROUPS.removeGroup,
                                  description: GROUPS.removeGroupHelp,
                                  warning: warnIf(removed),
                                },
                              ],
                            },
                          ]}
                          selected={[]}
                          menuClassName={styles['rule-table__row-menu']}
                          onSelect={(v) => {
                            if (v === 'ungroup') {
                              const first = child.children[0];
                              change('ungroup', ungrouped, first ? `rule:${first.id}` : 'undo', `group:${child.id}`);
                            } else {
                              change('remove', removed, 'undo', `group:${child.id}`);
                            }
                          }}
                          renderTrigger={({ open, toggle }) => (
                            <IconButton
                              size="small"
                              icon={<Icon glyph={<DotsHorizontalIcon />} size="16" />}
                              aria-label={GROUPS.groupMenu(label)}
                              aria-haspopup="menu"
                              aria-expanded={open}
                              onClick={toggle}
                            />
                          )}
                        >
                          {null}
                        </MenuCell>
                        <span className={styles['rule-table__action-spacer']} aria-hidden />
                      </span>
                    </div>
                    <GroupBody
                      g={child}
                      ctx={ctx}
                      connectors={connectors}
                      onChange={(next) => replace(child.id, next)}
                      onFocusTarget={(key) => {
                        focusRef.current = key;
                      }}
                      moveOut={(r) => {
                        const children = visible.flatMap((c) =>
                          c.id === child.id
                            ? [{ ...child, children: child.children.filter((x) => x.id !== r.id) }, r]
                            : [c],
                        );
                        return {
                          value: 'out',
                          label: GROUPS.moveOut,
                          warning: warnIf(children),
                          run: () => change('move-out', children, `rule:${r.id}`, `rule:${r.id}`),
                        };
                      }}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Always mounted so screen readers announce what changed (GUX1-4). */}
      <div
        role="status"
        className={[
          styles['rule-table__undo'],
          live ? styles['rule-table__undo--open'] : '',
          verdict === 'looser' ? styles['rule-table__undo--loosens'] : '',
        ].join(' ')}
      >
        {live ? (
          <>
            {/* The warning icon only when it loosens; never a check mark,
                which reads as "safe" (GUX3-2). */}
            <Icon glyph={verdict === 'looser' ? <AlertCircleOutlineIcon /> : <InformationOutlineIcon />} size="16" />
            <span>
              <span className={styles['rule-table__undo-lead']}>{GROUPS.done[live.kind]}</span>{' '}
              {verdict === 'looser'
                ? empty(group)
                  ? GROUPS.emptied()
                  : GROUPS.lessStrict
                : verdict === 'stricter'
                  ? GROUPS.moreStrict
                  : verdict === 'changed'
                    ? GROUPS.changedUnknown
                    : GROUPS.doneHelp[live.kind]}
            </span>
            <span data-focus-key="undo">
              <Button
                emphasis="tertiary"
                size="x-small"
                onClick={() => {
                  focusRef.current = live.focusBack;
                  commit(live.before);
                }}
              >
                {GROUPS.undo}
              </Button>
            </span>
          </>
        ) : null}
      </div>
      <div
        className={[editor['policy-editor__table-footer'], styles['rule-table__footer']].join(' ')}
        data-focus-key="add-root"
      >
        <AddAttributeButton
          ctx={ctx}
          label={addLabel}
          defaultOpen={addMenuOpen}
          defaultQuery={addMenuQuery}
          onAdd={(r) => {
            // Next step is the value, wherever the row lands (GUX4-1).
            focusRef.current = `value:${r.id}`;
            setVisible([...visible, r]);
          }}
        />
        {canGroup ? (
          <Button emphasis="tertiary" size="small" leadingIcon={<Icon glyph={<PlusIcon />} />} onClick={addGroup}>
            {GROUPS.add(opposite(group.join))}
          </Button>
        ) : null}
        {footerExtra}
      </div>
    </div>
  );
}

/** The rows inside one group block, with its own "+ Add to group". */
function GroupBody({
  g,
  ctx,
  connectors,
  onChange,
  onFocusTarget,
  moveOut,
}: {
  g: Group;
  ctx: RuleContext;
  connectors: boolean;
  onChange: (next: Group) => void;
  /** Where focus goes after this change. */
  onFocusTarget: (key: string) => void;
  moveOut: (r: Rule) => RowAction;
}) {
  const rules = g.children.filter((c): c is Rule => c.kind === 'rule');
  return (
    <div className={styles['rule-table__group-body']}>
      {rules.length === 0 ? (
        <p className={styles['rule-table__group-empty']}>{GROUPS.empty(g.join)}</p>
      ) : (
        <table className={[editor['policy-editor__table'], styles['rule-table__table'], styles['rule-table__inner']].join(' ')}>
          {/* The outer grid, less the block's indent (GVIS1-1). */}
          <colgroup>
            {connectors ? <col className={styles['rule-table__col--lead']} /> : null}
            <col className={styles['rule-table__col--attribute-inner']} />
            <col className={styles['rule-table__col--operator']} />
            <col />
            <col className={styles['rule-table__col--actions']} />
          </colgroup>
          {/* Headers for screen readers; the outer table shows them visually (QA1-11). */}
          <thead className={styles['rule-table__visually-hidden']}>
            <tr>
              {connectors ? <th aria-hidden /> : null}
              <th scope="col">{EDITOR.columns.attribute}</th>
              <th scope="col">{EDITOR.columns.operator}</th>
              <th scope="col">{EDITOR.columns.values}</th>
              <th scope="col">{EDITOR.columns.actions}</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r, i) => (
              <RuleRow
                key={r.id}
                r={r}
                ctx={ctx}
                leading={connectors ? <ConnectorCell index={i} join={g.join} fixed /> : undefined}
                actions={[moveOut(r)]}
                onChange={(next) =>
                  onChange({ ...g, children: g.children.map((c) => (c.id === r.id ? next : c)) })
                }
                onRemove={() => {
                  const at = rules.findIndex((x) => x.id === r.id);
                  const next = rules[at + 1] ?? rules[at - 1];
                  onFocusTarget(next ? `rule:${next.id}` : `add:${g.id}`);
                  onChange({ ...g, children: g.children.filter((c) => c.id !== r.id) });
                }}
              />
            ))}
          </tbody>
        </table>
      )}
      <div className={styles['rule-table__group-footer']} data-focus-key={`add:${g.id}`}>
        <AddAttributeButton
          ctx={ctx}
          label={GROUPS.addInside}
          size="x-small"
          onAdd={(r) => {
            onFocusTarget(`value:${r.id}`);
            onChange({ ...g, children: [...g.children, r] });
          }}
        />
      </div>
    </div>
  );
}
