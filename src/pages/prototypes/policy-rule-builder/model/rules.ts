// [AI DRAFT] The rule grammar: one shape for every requested rule format.
//
//   Rule    := AttrRef  Operator  (Value | AttrRef)
//   Group   := All | Any of [Rule | Group | When]
//   When    := When (All of rules) → Then require (Group)     (direction B′)
//
// "Recipient is not Contractor", "Recipient's Program is the same as the
// User's", "Recipient's Clearance is at least the File's Classification",
// "User is Contractor" and "Conversation has at most 8 members" are the same
// Rule with different parties. A new rule format is a new party or operator,
// not a new kind of row.
import {
  PARTY_RANK,
  attributeDef,
  attributesFor,
  findAttribute,
  isResource,
  type AttrType,
  type AttributeDef,
  type PartyId,
} from './catalog';
import { permissionDef, type PermissionId } from './permissions';
import { celPath, type Vocabulary } from './vocabulary';

/* ------------------------------------------------------------------ */
/* Tree                                                                */
/* ------------------------------------------------------------------ */

export interface AttrRef {
  party: PartyId;
  attr: string;
}

export type Operand =
  | { kind: 'value'; values: string[] }
  | { kind: 'attr'; ref: AttrRef };

export type OperatorId =
  | 'eq'
  | 'neq'
  | 'in'
  | 'starts'
  | 'ends'
  | 'contains'
  | 'any_of'
  | 'all_of'
  | 'gte'
  | 'gt'
  | 'lte'
  | 'lt';

export interface Rule {
  kind: 'rule';
  id: string;
  left: AttrRef;
  op: OperatorId;
  right: Operand;
}

export type Join = 'all' | 'any';

export interface Group {
  kind: 'group';
  id: string;
  join: Join;
  children: RuleNode[];
}

/** B′ "When … then require": `!(when) || (then)`. */
export interface When {
  kind: 'when';
  id: string;
  /** Conditions, always joined with All. */
  when: Group;
  /** Requirements, with their own join. */
  then: Group;
}

export type RuleNode = Rule | Group | When;

export type RoleId = 'Members' | 'Guests' | 'Bot accounts';

export interface Policy {
  id: string;
  name: string;
  role: RoleId;
  permissions: PermissionId[];
  root: Group;
}

let seq = 0;
export function nextId(prefix = 'n'): string {
  seq += 1;
  return `${prefix}${seq}`;
}

export function rule(left: AttrRef, op: OperatorId, right: Operand): Rule {
  return { kind: 'rule', id: nextId('r'), left, op, right };
}

export function group(join: Join, children: RuleNode[]): Group {
  return { kind: 'group', id: nextId('g'), join, children };
}

export function when(conditions: Rule[], then: Group): When {
  return {
    kind: 'when',
    id: nextId('w'),
    when: group('all', conditions),
    then,
  };
}

export const value = (...values: string[]): Operand => ({
  kind: 'value',
  values,
});

export const attr = (party: PartyId, id: string): Operand => ({
  kind: 'attr',
  ref: { party, attr: id },
});

export function refDef(ref: AttrRef): AttributeDef {
  return attributeDef(ref.party, ref.attr);
}

/** Every rule in the tree, depth first. */
export function allRules(node: RuleNode): Rule[] {
  if (node.kind === 'rule') return [node];
  if (node.kind === 'when') return [...allRules(node.when), ...allRules(node.then)];
  return node.children.flatMap(allRules);
}

/** Parties a rule names, on either side. */
export function partiesOf(r: Rule): PartyId[] {
  const parties: PartyId[] = [r.left.party];
  if (r.right.kind === 'attr' && r.right.ref.party !== r.left.party) {
    parties.push(r.right.ref.party);
  }
  return parties;
}

export function partiesInUse(root: Group): PartyId[] {
  return Array.from(new Set(allRules(root).flatMap(partiesOf)));
}

/** Depth of nested groups below the root: 0 = flat. A When card is not a group. */
export function groupDepth(node: RuleNode): number {
  if (node.kind === 'rule') return 0;
  if (node.kind === 'when') return groupDepth(node.then);
  const nested = node.children.map((c) =>
    c.kind === 'group' ? 1 + groupDepth(c) : groupDepth(c),
  );
  return nested.length ? Math.max(...nested) : 0;
}

/** Deep copy with fresh ids, so a scenario can be built twice. */
export function cloneNode<T extends RuleNode>(node: T): T {
  if (node.kind === 'rule') return { ...node, id: nextId('r') };
  if (node.kind === 'when') {
    return {
      ...node,
      id: nextId('w'),
      when: cloneNode(node.when),
      then: cloneNode(node.then),
    };
  }
  return { ...node, id: nextId('g'), children: node.children.map(cloneNode) };
}

/* ------------------------------------------------------------------ */
/* Operators (shipped en.json labels)                                  */
/* ------------------------------------------------------------------ */

const VALUE_OPERATORS: Record<AttrType, OperatorId[]> = {
  select: ['eq', 'neq', 'in'],
  text: ['eq', 'neq', 'in', 'starts', 'ends', 'contains'],
  multiselect: ['any_of', 'all_of'],
  ranked: ['eq', 'neq', 'gte', 'gt', 'lte', 'lt'],
  number: ['eq', 'neq', 'gte', 'gt', 'lte', 'lt'],
  account: ['eq', 'neq'],
};

const ATTR_OPERATORS: Record<AttrType, OperatorId[]> = {
  select: ['eq', 'neq'],
  text: ['eq', 'neq'],
  multiselect: ['any_of', 'all_of'],
  ranked: ['eq', 'neq', 'gte', 'gt', 'lte', 'lt'],
  number: ['eq', 'neq', 'gte', 'gt', 'lte', 'lt'],
  account: [],
};

export function operatorsFor(
  type: AttrType,
  operand: Operand['kind'],
): OperatorId[] {
  return operand === 'value' ? VALUE_OPERATORS[type] : ATTR_OPERATORS[type];
}

/**
 * Shipped labels (admin.access_control.operators.*, en.json 1798–1893).
 * Equality against another attribute reads "is same as" (draft, 04 §8).
 */
export function operatorLabel(
  op: OperatorId,
  type: AttrType,
  operand: Operand['kind'] = 'value',
): string {
  const ordered = type === 'ranked' || type === 'number';
  if (operand === 'attr' && !ordered) {
    if (op === 'eq') return 'is same as';
    if (op === 'neq') return 'is not same as';
  }
  switch (op) {
    case 'eq':
      return ordered ? 'is exactly' : 'is';
    case 'neq':
      return 'is not';
    case 'in':
      return 'in';
    case 'starts':
      return 'starts with';
    case 'ends':
      return 'ends with';
    case 'contains':
      return 'contains';
    case 'any_of':
      return 'has any of';
    case 'all_of':
      return 'has all of';
    case 'gte':
      return 'is at least';
    case 'gt':
      return 'is greater than';
    case 'lte':
      return 'is at most';
    case 'lt':
      return 'is less than';
    default: {
      const exhaustive: never = op;
      return exhaustive;
    }
  }
}

/** Operators that take more than one fixed value. */
export function isMultiValue(op: OperatorId): boolean {
  return op === 'in' || op === 'any_of' || op === 'all_of';
}

export interface CompareCandidate {
  ref: AttrRef;
  /** Set when the attribute exists but can't be compared ("Uses a different option list."). */
  disabledReason?: string;
}

/** The tree without one rule: what the other rules need (QA1-3). */
export function withoutRule(root: Group, id: string): Group {
  return {
    ...root,
    children: root.children.flatMap((c): RuleNode[] =>
      c.kind === 'rule' ? (c.id === id ? [] : [c]) : c.kind === 'group' ? [withoutRule(c, id)] : [c],
    ),
  };
}

/**
 * Attributes on OTHER parties that `left` could be compared with. Same type
 * and same option list (the shipped `linked_field_id` rule) are enabled;
 * same-named or same-type attributes with a different list stay visible,
 * disabled with the reason (04 §1.2 rule 3). Session attributes never compare.
 */
export function compareCandidates(
  left: AttrRef,
  parties: PartyId[],
  role?: RoleId,
): CompareCandidate[] {
  const def = refDef(left);
  if (left.party === 'session' || def.type === 'account' || def.native) {
    return [];
  }
  // Every other party, listed User → Recipient → resource. The rule is kept as
  // the admin writes it, in either order (designer, round 1.1).
  return parties
    .filter((p) => p !== 'session' && p !== left.party)
    .sort((a, b) => PARTY_RANK[a] - PARTY_RANK[b])
    .flatMap((p) =>
      // Role-aware: a person-only or bot-only attribute appears only for its role (QA2-6, UX-6).
      attributesFor(p, role)
        .filter((a) => !a.native && (a.type === def.type || a.label === def.label))
        .map((a) => ({
          ref: { party: p, attr: a.id },
          disabledReason:
            a.type === def.type && a.link === def.link ? undefined : 'Uses a different option list.',
        })),
    );
}

/**
 * Default operator and operand when a rule's left side is (re)chosen. The
 * value starts empty (F-07): v1 auto-filled the first option, which could
 * save a rule the admin never chose.
 */
export function defaultRuleFor(left: AttrRef): Pick<Rule, 'op' | 'right'> {
  const def = refDef(left);
  if (def.type === 'number') return { op: 'lte', right: value() };
  return { op: VALUE_OPERATORS[def.type][0], right: value() };
}

/** A rule with no value chosen yet. Excluded from CEL and the readback; blocks Save. */
export function isIncomplete(r: Rule): boolean {
  return r.right.kind === 'value' && r.right.values.filter(Boolean).length === 0;
}

/** The tree without incomplete rules, empty groups and empty When cards. */
/**
 * Rules before groups in a list. Order doesn't change what the policy means,
 * but a group's label ("Or, all of these") only reads in order when it comes
 * after the rules it joins (GUX3-6).
 */
export function rulesFirst<T extends RuleNode>(children: T[]): T[] {
  return [...children.filter((c) => c.kind !== 'group'), ...children.filter((c) => c.kind === 'group')];
}

export function prune(root: Group): Group {
  const keep = (n: RuleNode): RuleNode | null => {
    if (n.kind === 'rule') return isIncomplete(n) ? null : n;
    if (n.kind === 'when') {
      const w = prune(n.when);
      const t = prune(n.then);
      return w.children.length && t.children.length ? { ...n, when: w, then: t } : null;
    }
    const g = prune(n);
    return g.children.length ? g : null;
  };
  return { ...root, children: root.children.map(keep).filter((c): c is RuleNode => c !== null) };
}

/* ------------------------------------------------------------------ */
/* CEL                                                                 */
/* ------------------------------------------------------------------ */

function celLiteral(def: AttributeDef, v: string): string {
  if (def.type === 'number') return v;
  if (def.type === 'account') return def.celValues?.[v] ?? v;
  return JSON.stringify(def.celValues?.[v] ?? v);
}

function celList(def: AttributeDef, values: string[]): string {
  return `[${values.map((v) => celLiteral(def, v)).join(', ')}]`;
}

const SYMBOL: Partial<Record<OperatorId, string>> = {
  eq: '==',
  neq: '!=',
  gte: '>=',
  gt: '>',
  lte: '<=',
  lt: '<',
};

export function ruleToCel(r: Rule, vocab: Vocabulary): string {
  const def = refDef(r.left);
  const left = celPath(vocab, r.left.party, def);
  const right =
    r.right.kind === 'attr'
      ? celPath(vocab, r.right.ref.party, refDef(r.right.ref))
      : null;
  const values = r.right.kind === 'value' ? r.right.values : [];
  switch (r.op) {
    case 'eq':
    case 'neq':
    case 'gte':
    case 'gt':
    case 'lte':
    case 'lt':
      return `${left} ${SYMBOL[r.op]} ${right ?? celLiteral(def, values[0] ?? '')}`;
    case 'in':
      return `${left} in ${celList(def, values)}`;
    case 'starts':
      return `${left}.startsWith(${celLiteral(def, values[0] ?? '')})`;
    case 'ends':
      return `${left}.endsWith(${celLiteral(def, values[0] ?? '')})`;
    case 'contains':
      return `${left}.contains(${celLiteral(def, values[0] ?? '')})`;
    case 'any_of':
      return `${left}.hasAnyOf(${right ?? celList(def, values)})`;
    case 'all_of':
      return `${left}.hasAllOf(${right ?? celList(def, values)})`;
    default: {
      const exhaustive: never = r.op;
      return exhaustive;
    }
  }
}

function nodeToCel(node: RuleNode, vocab: Vocabulary, indent: string): string {
  if (node.kind === 'rule') return ruleToCel(node, vocab);
  if (node.kind === 'when') {
    const w = toCel(node.when, vocab, `${indent}  `);
    const t = toCel(node.then, vocab, `${indent}  `);
    return `!(${w})\n${indent}|| (${t})`;
  }
  return toCel(node, vocab, indent);
}

/**
 * One expression for the whole tree. With more than one clause, every clause
 * is wrapped in parentheses (04 §1.3): CEL evaluates && before ||, so an
 * unwrapped mix would change the meaning.
 */
export function toCel(root: Group, vocab: Vocabulary, indent = ''): string {
  if (indent === '') root = prune(root);
  if (root.children.length === 0) return '';
  if (root.children.length === 1) {
    return nodeToCel(root.children[0], vocab, indent);
  }
  const joiner = root.join === 'all' ? '&&' : '||';
  return root.children
    .map((c) => `(${nodeToCel(c, vocab, `${indent}  `)})`)
    .join(`\n${indent}${joiner} `);
}

/* ------------------------------------------------------------------ */
/* Readback: a plain-language sentence regenerated on every edit        */
/* ------------------------------------------------------------------ */

function listJoin(items: string[], conjunction: 'and' | 'or'): string {
  if (items.length <= 1) return items[0] ?? '';
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, ${conjunction} ${items[items.length - 1]}`;
}

function possessive(vocab: Vocabulary, party: PartyId): string {
  return `the ${vocab.noun[party]}'s`;
}

export function clause(r: Rule, vocab: Vocabulary): string {
  const def = refDef(r.left);
  const values = r.right.kind === 'value' ? r.right.values : [];

  if (def.type === 'account') {
    const who = `the ${vocab.noun[r.left.party]}`;
    const v = values[0] ?? '';
    const noun = v === 'Bot' ? 'a bot' : 'a person';
    return r.op === 'neq' ? `${who} is not ${noun}` : `${who} is ${noun}`;
  }

  if (def.id === 'member_count' && r.right.kind === 'value') {
    const n = values[0];
    const phrase: Record<string, string> = {
      eq: `exactly ${n}`,
      neq: `other than ${n}`,
      gte: `at least ${n}`,
      gt: `more than ${n}`,
      lte: `at most ${n}`,
      lt: `fewer than ${n}`,
    };
    return `the ${vocab.noun[r.left.party]} has ${phrase[r.op] ?? n} members`;
  }

  const lhs = `${possessive(vocab, r.left.party)} ${def.label}`;
  if (r.right.kind === 'attr') {
    const otherDef = refDef(r.right.ref);
    const other = `${possessive(vocab, r.right.ref.party)} ${otherDef.label}`;
    const otherShort =
      otherDef.label === def.label ? possessive(vocab, r.right.ref.party) : other;
    switch (r.op) {
      case 'eq':
        return `${lhs} matches ${otherShort}`;
      case 'neq':
        return `${lhs} differs from ${otherShort}`;
      case 'gte':
        return `${lhs} is at least ${other}`;
      case 'gt':
        return `${lhs} is higher than ${other}`;
      case 'lte':
        return `${lhs} is at most ${other}`;
      case 'lt':
        return `${lhs} is lower than ${other}`;
      case 'any_of':
        return `${lhs} shares a value with ${other}`;
      case 'all_of':
        return `${lhs} includes every value of ${other}`;
      default:
        return `${lhs} ${operatorLabel(r.op, def.type, 'attr')} ${other}`;
    }
  }

  switch (r.op) {
    case 'eq':
      return `${lhs} is ${values[0]}`;
    case 'neq':
      return `${lhs} is not ${values[0]}`;
    case 'in':
      return `${lhs} is ${listJoin(values, 'or')}`;
    case 'any_of':
      return `${lhs} includes ${listJoin(values, 'or')}`;
    case 'all_of':
      return `${lhs} includes ${listJoin(values, 'and')}`;
    case 'gte':
      return `${lhs} is at least ${values[0]}`;
    case 'gt':
      return `${lhs} is higher than ${values[0]}`;
    case 'lte':
      return `${lhs} is at most ${values[0]}`;
    case 'lt':
      return `${lhs} is lower than ${values[0]}`;
    default:
      return `${lhs} ${operatorLabel(r.op, def.type)} ${values[0]}`;
  }
}

/** The rule read as its opposite, for "Not allowed when …" (CUX1-2), in plain words (CON2-2). */
function negatedClause(r: Rule, vocab: Vocabulary): string {
  const flip: Partial<Record<OperatorId, OperatorId>> = {
    eq: 'neq', neq: 'eq', gte: 'lt', lt: 'gte', gt: 'lte', lte: 'gt',
  };
  const op = flip[r.op];
  if (op) return clause({ ...r, op }, vocab);
  const def = refDef(r.left);
  const lhs = `${possessive(vocab, r.left.party)} ${def.label}`;
  if (r.right.kind === 'attr') {
    const other = `${possessive(vocab, r.right.ref.party)} ${refDef(r.right.ref).label}`;
    return r.op === 'any_of'
      ? `${lhs} shares no value with ${other}`
      : `${lhs} doesn't include every value of ${other}`;
  }
  const values = r.right.values;
  // One value: "is not X"; two: "neither X nor Y"; more: "none of …" (CON3-4).
  const neither =
    values.length === 1
      ? `not ${values[0]}`
      : values.length === 2
        ? `neither ${values[0]} nor ${values[1]}`
        : `none of ${listJoin(values, 'or')}`;
  switch (r.op) {
    case 'in':
      return `${lhs} is ${neither}`;
    case 'any_of':
      // One value reads "doesn't include X", not "includes not X" (CON4-1).
      return values.length === 1 ? `${lhs} doesn't include ${values[0]}` : `${lhs} includes ${neither}`;
    case 'all_of':
      return `${lhs} doesn't include all of ${listJoin(values, 'and')}`;
    case 'starts':
      return `${lhs} doesn't start with ${values[0]}`;
    case 'ends':
      return `${lhs} doesn't end with ${values[0]}`;
    case 'contains':
      return `${lhs} doesn't contain ${values[0]}`;
    default:
      return `${lhs} isn't ${operatorLabel(r.op, def.type)} ${values[0]}`;
  }
}

/** Can this rule's attributes be missing? Account type and native ones always have a value. */
function canBeMissing(r: Rule): boolean {
  const sides = r.right.kind === 'attr' ? [r.left, r.right.ref] : [r.left];
  return sides.some((ref) => {
    const def = refDef(ref);
    return def.type !== 'account' && !def.native;
  });
}

/**
 * De Morgan: negate every rule and flip every join. A rule with a missing
 * value fails (fail-secure), so "fails" = "the opposite is true, or a value is
 * missing". Under an All list that factors out to one tail; under Any it
 * doesn't, so each rule says it inline (CUX2-1).
 */
function negatedPhrase(g: Group, vocab: Vocabulary, nested: boolean, inline: boolean): string {
  const parts = g.children
    .filter((c) => c.kind !== 'when')
    .map((c) => {
      if (c.kind !== 'rule') return negatedPhrase(c as Group, vocab, true, inline);
      return inline ? withMissing(c, vocab) : negatedClause(c, vocab);
    });
  const join = g.join === 'all' ? 'or' : 'and';
  const joined = listJoin(parts, join);
  if (!nested || parts.length < 2) return joined;
  return join === 'or' ? `either ${joined}` : `both ${joined}`;
}

/**
 * The negated rule plus its missing-value case. A comparison can be missing on
 * either side, so it says so (QA3-3).
 */
function withMissing(r: Rule, vocab: Vocabulary): string {
  const text = negatedClause(r, vocab);
  if (!canBeMissing(r)) return text;
  return `${text} (${r.right.kind === 'attr' ? 'or either has no value' : 'or has no value'})`;
}


function groupPhrase(g: Group, vocab: Vocabulary, nested: boolean): string {
  const parts = g.children
    .filter((c) => c.kind !== 'when')
    .map((c) =>
      c.kind === 'rule'
        ? clause(c, vocab)
        : groupPhrase(c as Group, vocab, true),
    );
  const joined = listJoin(parts, g.join === 'all' ? 'and' : 'or');
  if (!nested || parts.length < 2) return joined;
  return g.join === 'any' ? `either ${joined}` : `both ${joined}`;
}

/** "start and write in direct and group messages, and upload files" */
export function permissionPhrase(permissions: PermissionId[]): string {
  const dms = permissions
    .map(permissionDef)
    .filter((p) => p.group === 'dms')
    .map((p) => p.verb);
  const others = permissions
    .map(permissionDef)
    .filter((p) => p.group !== 'dms')
    .map((p) => p.verb);
  return listJoin(
    [
      ...(dms.length ? [`${listJoin(dms, 'and')} direct and group messages`] : []),
      ...others,
    ],
    'and',
  );
}

export interface Readback {
  sentence: string;
  /** "Not allowed when …" body, for barrier policies on messages (CUX1-2). */
  denied?: string;
  /** The same, as a list, for groups or three or more rules (CUX2-7). */
  deniedList?: string[];
  /** The list denies when ANY item holds (an All policy), not when all do. */
  deniedAny?: boolean;
}

/** Regenerated from the tree on every edit, never from a template name. */
export function readback(input: Policy, vocab: Vocabulary): Readback {
  const policy = { ...input, root: prune(input.root) };
  const rules = allRules(policy.root);
  // The shipped role label, as in the picker (CUX4-5).
  const who = policy.role === 'Guests' ? 'Guest users' : policy.role;
  // A policy with no rules can't be saved (designer, round 1.1), so there is
  // no "everyone is allowed" reading: with permissions only, say what it will
  // control, never "can" without a condition (designer mock, 2026-10-31).
  if (rules.length === 0) {
    return {
      sentence: policy.permissions.length
        ? `This policy controls whether ${who} can ${permissionPhrase(policy.permissions)}. Add a rule to say when they can.`
        : 'Add a rule and a permission to see what this policy does.',
    };
  }
  const plain = policy.root.children.filter((c) => c.kind !== 'when');
  const cards = policy.root.children.filter((c): c is When => c.kind === 'when');
  if (policy.permissions.length === 0) {
    // Rules first: read the rules back before there's a permission. It saves
    // without one, as in v1 (round 1.3), so say what that means.
    const parts: string[] = [];
    if (plain.length > 0) {
      parts.push(`This policy applies only when ${groupPhrase({ ...policy.root, children: plain }, vocab, false)}.`);
    }
    for (const card of cards) {
      parts.push(
        `When ${groupPhrase(card.when, vocab, false)}, this policy applies only when ${groupPhrase(card.then, vocab, false)}.`,
      );
    }
    return { sentence: parts.join(' ') };
  }
  const perms = permissionPhrase(policy.permissions);
  const usesRecipient = rules.some((r) => partiesOf(r).includes('recipient'));

  const sentences: string[] = [];
  if (plain.length > 0) {
    const body = groupPhrase({ ...policy.root, children: plain }, vocab, false);
    sentences.push(`${who} can ${perms} only when ${body}.`);
  } else {
    sentences.push(`${who} can ${perms}.`);
  }
  for (const card of cards) {
    const w = groupPhrase(card.when, vocab, false);
    const t = groupPhrase(card.then, vocab, false);
    sentences.push(`When ${w}, they can do this only when ${t}.`);
  }
  const onMessages = usesRecipient && policy.permissions.some((p) => permissionDef(p).group === 'dms');
  if (onMessages) {
    sentences.push(`In a group message, each ${vocab.noun.recipient} is checked.`);
  }
  // A Recipient rule on message permissions is usually a barrier. Read it the
  // way the requirement is written, as who is kept apart (CUX1-2). A missing
  // value also denies (fail-secure).
  let denied: string | undefined;
  let deniedList: string[] | undefined;
  let deniedAny = false;
  if (onMessages && plain.length > 0 && cards.length === 0) {
    const tree = { ...policy.root, children: plain };
    const hasGroup = plain.some((c) => c.kind === 'group');
    // One wording everywhere: every rule carries its own missing-value note,
    // never a closing ", or a value is missing" (CON3-4, CON3-6).
    if (plain.length >= 2 && (hasGroup || plain.length >= 3)) {
      // A group, or three or more rules, read as a list (CUX2-7, CVIS3-3).
      // Under All, any one item denies; under Any, every item must hold.
      deniedList = plain.map((c) =>
        c.kind === 'rule' ? withMissing(c, vocab) : negatedPhrase(c as Group, vocab, false, true),
      );
      deniedAny = tree.join === 'all';
    } else {
      denied = negatedPhrase(tree, vocab, false, true);
    }
  }
  return { sentence: sentences.join(' '), denied, deniedList, deniedAny };
}

/* ------------------------------------------------------------------ */
/* Pre-save checks                                                     */
/* ------------------------------------------------------------------ */

/** Defined (not native) attributes the policy references, deduplicated. */
export function referencedAttributes(root: Group): AttrRef[] {
  const refs = allRules(root).flatMap((r) =>
    r.right.kind === 'attr' ? [r.left, r.right.ref] : [r.left],
  );
  const seen = new Set<string>();
  return refs.filter((ref) => {
    const key = `${ref.party}.${ref.attr}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return !findAttribute(ref.party, ref.attr)?.native;
  });
}

export function referencesResource(root: Group): boolean {
  return allRules(root).some((r) => partiesOf(r).some(isResource));
}

type Where = 'plain' | 'cond' | 'then';

interface Loc {
  rule: Rule;
  /** Join of the list the rule sits in. */
  join: Join;
  where: Where;
  siblings: number;
  card?: string;
  /** Enclosing nested group, if any, and the join of the list that group sits in. */
  group?: string;
  groupParentJoin?: Join;
  /** Signatures of the other rules in the same list, so identity follows context (QA4-4). */
  sibs: string[];
}

interface GroupLoc {
  id: string;
  join: Join;
  parentJoin: Join;
  ruleIds: string[];
}

interface CardLoc {
  id: string;
  thenJoin: Join;
  ruleIds: string[];
}

/** The same comparison read from the other side. */
const SIDE_FLIP: Partial<Record<OperatorId, OperatorId>> = { gte: 'lte', lte: 'gte', gt: 'lt', lt: 'gt' };

/**
 * Content identity, so a tree re-parsed from Advanced mode still matches. A
 * comparison is the same rule whichever side each attribute is written on
 * (rules are kept as written, round 1.1).
 */
function signature(r: Rule): string {
  if (r.right.kind === 'attr') {
    const a = `${r.left.party}.${r.left.attr}`;
    const b = `${r.right.ref.party}.${r.right.ref.attr}`;
    return a <= b ? `${a} ${r.op} @${b}` : `${b} ${SIDE_FLIP[r.op] ?? r.op} @${a}`;
  }
  return `${r.left.party}.${r.left.attr} ${r.op} ${[...r.right.values].sort().join('|')}`;
}

function index(root: Group) {
  const rules = new Map<string, Loc>();
  const groups: GroupLoc[] = [];
  const cards: CardLoc[] = [];
  const walk = (
    g: Group,
    where: Where,
    card?: string,
    nest?: { id: string; parentJoin: Join },
  ) => {
    for (const c of g.children) {
      if (c.kind === 'rule') {
        rules.set(c.id, {
          rule: c,
          join: g.join,
          where,
          siblings: g.children.length,
          card,
          group: nest?.id,
          groupParentJoin: nest?.parentJoin,
          sibs: g.children.filter((x): x is Rule => x.kind === 'rule' && x.id !== c.id).map(signature),
        });
      } else if (c.kind === 'group') {
        groups.push({ id: c.id, join: c.join, parentJoin: g.join, ruleIds: allRules(c).map((r) => r.id) });
        walk(c, where, card, { id: c.id, parentJoin: g.join });
      } else {
        cards.push({ id: c.id, thenJoin: c.then.join, ruleIds: allRules(c).map((r) => r.id) });
        walk(c.when, 'cond', c.id);
        walk(c.then, 'then', c.id);
      }
    }
  };
  walk(root, 'plain');
  return { rules, groups, cards };
}

/**
 * Is `b` a stricter (+1), looser (−1) or unknown (0) version of rule `a`?
 * Only the cases we can prove: ordered thresholds and value lists.
 */
function compareStrictness(a: Rule, b: Rule): -1 | 0 | 1 {
  if (a.left.party !== b.left.party || a.left.attr !== b.left.attr) return 0;
  if (a.right.kind !== 'value' || b.right.kind !== 'value') return 0;
  const def = refDef(a.left);
  const rank = (v: string) => (def.type === 'number' ? Number(v) : def.values.indexOf(v));
  const av = a.right.values;
  const bv = b.right.values;
  if (a.op === b.op && (a.op === 'gte' || a.op === 'gt')) {
    return rank(bv[0]) > rank(av[0]) ? 1 : rank(bv[0]) < rank(av[0]) ? -1 : 1;
  }
  if (a.op === b.op && (a.op === 'lte' || a.op === 'lt')) {
    return rank(bv[0]) < rank(av[0]) ? 1 : rank(bv[0]) > rank(av[0]) ? -1 : 1;
  }
  if (a.op === b.op && (a.op === 'in' || a.op === 'any_of')) {
    const added = bv.some((v) => !av.includes(v));
    const removed = av.some((v) => !bv.includes(v));
    return added && !removed ? -1 : removed && !added ? 1 : 0;
  }
  return 0;
}

/**
 * Ways the draft is less strict than the saved policy (D5-1: diff the saved
 * and draft trees, not a list of edit events). Rules match by id, and fall
 * back to content for a tree re-parsed from Advanced mode. Context decides
 * direction: in a When condition a stricter rule makes the card apply less,
 * so it loosens the policy.
 */
export function wideningReasons(savedIn: Policy, draftIn: Policy): string[] {
  // Rows with no value yet aren't part of either policy (QA1-7).
  const saved = { ...savedIn, root: prune(savedIn.root) };
  const draft = { ...draftIn, root: prune(draftIn.root) };
  const reasons = new Set<string>();
  if (saved.role !== draft.role) reasons.add('role');
  if (saved.permissions.some((p) => !draft.permissions.includes(p))) reasons.add('permission');
  // Nothing saved yet: any rule is stricter than none, so only the role and
  // the permissions can loosen it (QA1-2).
  if (allRules(prune(saved.root)).length === 0) return Array.from(reasons);
  if (saved.root.join === 'all' && draft.root.join === 'any' && draft.root.children.length > 1) {
    reasons.add('join');
  }
  const before = index(saved.root);
  const after = index(draft.root);

  // Map draft rule ids onto saved ids: same id first, then same content.
  const toSaved = new Map<string, string>();
  const used = new Set<string>();
  for (const id of after.rules.keys()) {
    if (before.rules.has(id)) {
      toSaved.set(id, id);
      used.add(id);
    }
  }
  // Same place: same kind of list (top level or a group) with the same join.
  // Ids are fresh after an Advanced re-parse, so this stands in for "same parent" (QA4-4).
  const samePlace = (a: Loc, b: Loc) => (a.group === undefined) === (b.group === undefined) && a.join === b.join;
  const claim = (id: string, pick: (l: Loc) => boolean) => {
    if (toSaved.has(id)) return;
    const loc = after.rules.get(id)!;
    const pool = [...before.rules].filter(([sid, l]) => !used.has(sid) && pick(l));
    const match = pool.find(([, l]) => samePlace(l, loc)) ?? pool[0];
    if (match) {
      toSaved.set(id, match[0]);
      used.add(match[0]);
    }
  };
  // Second pass: same content, preferring the same place, so a new group holding
  // a copy of a saved rule doesn't take over that rule's identity (QA4-4).
  // Identical rules hand over identity only when they share a neighbour (or
  // either stands alone): a copy in a new group mustn't take the saved rule's
  // place and hide an edit to the original (QA4-4).
  const related = (a: Loc, b: Loc) =>
    a.sibs.length === 0 || b.sibs.length === 0 || a.sibs.some((x) => b.sibs.includes(x));
  for (const [id, loc] of after.rules) {
    claim(id, (l) => signature(l.rule) === signature(loc.rule) && related(l, loc));
  }
  // Third pass: same attribute and position, value edited. First with the same
  // operator, then any operator, so a changed operator reads as "changed", not
  // "removed", after an Advanced re-parse (QA4-4).
  for (const [id, loc] of after.rules) {
    claim(
      id,
      (l) =>
        l.where === loc.where &&
        l.rule.left.party === loc.rule.left.party &&
        l.rule.left.attr === loc.rule.left.attr &&
        l.rule.op === loc.rule.op,
    );
  }
  for (const [id, loc] of after.rules) {
    claim(
      id,
      (l) => l.where === loc.where && l.rule.left.party === loc.rule.left.party && l.rule.left.attr === loc.rule.left.attr,
    );
  }
  const draftOf = new Map([...toSaved].map(([d, sv]) => [sv, d]));

  for (const [sid, loc] of before.rules) {
    const did = draftOf.get(sid);
    const now = did ? after.rules.get(did) : undefined;
    if (!now) {
      if (loc.where === 'cond') continue; // fewer When conditions: the rule applies more often
      const groupGone =
        loc.group !== undefined &&
        !before.groups
          .find((g) => g.id === loc.group)
          ?.ruleIds.some((id) => draftOf.has(id));
      if (groupGone) {
        // The whole group went: loosens only if the group itself was required (QA4-2).
        if (loc.groupParentJoin === 'all') reasons.add('removed');
        continue;
      }
      // Removing a required rule loosens; removing an alternative tightens.
      if (loc.join === 'all' || loc.siblings === 1) reasons.add('removed');
      continue;
    }
    if (loc.where === 'plain' && now.where !== 'plain') reasons.add('moved');
    if (loc.where === 'then' && now.where === 'cond') reasons.add('moved');
    // A required rule that now sits in an Any list is no longer required. A
    // rule alone in its group was never required alongside others (GUX3-3).
    if (loc.join === 'all' && loc.siblings > 1 && now.join === 'any' && now.siblings > 1 && loc.where === now.where) {
      reasons.add('regrouped');
    }
    if (signature(loc.rule) === signature(now.rule)) continue;
    const strict = compareStrictness(loc.rule, now.rule);
    const effective = now.where === 'cond' ? -strict : strict;
    if (effective < 0) reasons.add('looser');
    // Unknown direction: flag it wherever it sits, Any lists included (QA2-1).
    else if (effective === 0) reasons.add('changed');
  }
  for (const [id, loc] of after.rules) {
    if (toSaved.has(id)) continue;
    // A condition added to a card that already existed makes it apply less often.
    const cardExisted =
      loc.card !== undefined &&
      (before.cards.some((c) => c.id === loc.card) ||
        Boolean(after.cards.find((x) => x.id === loc.card)?.ruleIds.some((r) => toSaved.has(r))));
    if (loc.where === 'cond' && cardExisted) reasons.add('condition');
    else if (
      loc.where !== 'cond' &&
      loc.join === 'any' &&
      loc.siblings > 1 &&
      // A brand-new Any group in an All list is a new requirement, not
      // another way to pass (QA4-1).
      !(
        loc.groupParentJoin === 'all' &&
        !before.groups.some((g) => g.id === loc.group) &&
        (after.groups.find((g) => g.id === loc.group)?.ruleIds.every((r) => !toSaved.has(r)) ?? false)
      )
    ) {
      reasons.add('added-any');
    }
    // A new group added as another alternative in an Any list is another way
    // to pass, even though its own rules are joined with All.
    else if (
      loc.where !== 'cond' &&
      loc.group !== undefined &&
      loc.groupParentJoin === 'any' &&
      !before.groups.some((g) => g.id === loc.group) &&
      (after.groups.find((g) => g.id === loc.group)?.ruleIds.every((r) => !toSaved.has(r)) ?? false) &&
      draft.root.children.length > 1
    ) {
      reasons.add('added-any');
    }
  }

  // Groups and cards: same id, else the one holding most of the same rules.
  const mapIds = (ids: string[]) => ids.map((i) => draftOf.get(i)).filter(Boolean) as string[];
  for (const g of before.groups) {
    const target = mapIds(g.ruleIds);
    const match =
      after.groups.find((d) => d.id === g.id) ??
      after.groups.find((d) => target.filter((t) => d.ruleIds.includes(t)).length * 2 >= g.ruleIds.length && target.length > 0);
    if (!match) {
      // Dissolving an All group inside an Any list loosens it, if two or more
      // of its rules survive (QA4-2). One rule on its own means the same (GUX3-3).
      if (g.join === 'all' && g.parentJoin === 'any' && target.length > 1) reasons.add('ungrouped');
    } else if (g.join === 'all' && match.join === 'any') {
      reasons.add('join');
    }
  }
  for (const c of before.cards) {
    const target = mapIds(c.ruleIds);
    const match =
      after.cards.find((d) => d.id === c.id) ??
      after.cards.find((d) => target.some((t) => d.ruleIds.includes(t)));
    if (match && c.thenJoin === 'all' && match.thenJoin === 'any') reasons.add('join');
  }
  // Nothing saved survives: the rules were replaced outright, direction
  // unknown. Say so rather than stay silent (QA4-2).
  if (draftOf.size === 0 && after.rules.size > 0) reasons.add('changed');
  // A join flip, or a dissolved group, already explains rules that now sit in
  // an Any list (CON3-1, QA1-8): one edit, one reason.
  if (reasons.has('join') || reasons.has('ungrouped')) reasons.delete('regrouped');
  // No rules left: everyone with the role gets through (GUX3-1). Say that,
  // not "a rule was removed" (GUX4-2).
  if (allRules(prune(saved.root)).length > 0 && allRules(prune(draft.root)).length === 0) {
    reasons.delete('removed');
    reasons.delete('ungrouped');
    reasons.add('emptied');
  }
  return Array.from(reasons);
}

/** One card's sentence: "When …, they can do this only when …". */
export function whenReadback(card: When, vocab: Vocabulary): string {
  if (card.when.children.length === 0 || card.then.children.length === 0) return '';
  const w = groupPhrase(prune(card.when), vocab, false);
  const t = groupPhrase(prune(card.then), vocab, false);
  return w && t ? `When ${w}, they can do this only when ${t}.` : '';
}
