// [AI DRAFT] Advanced mode → Simple mode. Parses the subset of CEL that the
// visual editor can show, and says plainly when it can't.
//
// Three outcomes, matching the shipped editor's behaviour plus one guard:
//   error    the expression is not valid (the shipped /cel/check would reject it)
//   complex  valid, but Simple mode can't show it (negation, deeper nesting
//            than the grouping mode allows, unknown functions). The policy
//            stays in Advanced mode with a readback. It is NEVER shown as a
//            partial table: a dropped clause would widen the policy.
//   simple   round-trips to a rule tree
import {
  allAttributesFor as attributesFor,
  type AttributeDef,
  type PartyId,
} from './catalog';
import {
  group,
  groupDepth,
  nextId,
  operatorsFor,
  rule,
  rulesFirst,
  type Group,
  type OperatorId,
  type Operand,
  type Rule,
  type RuleNode,
} from './rules';
import type { Vocabulary } from './vocabulary';

/**
 * Grouping modes (feedback F5). `one-level` (checkboxes) is archived.
 *   flat        one join
 *   blocks      one level of groups, each the opposite join of its list
 *   connectors  as blocks, read as Where / and / or
 *   sets        Or between rule sets; each set is All (DNF)
 */
export type GroupingMode = 'flat' | 'blocks' | 'connectors' | 'sets' | 'one-level';

export type ParseResult =
  | { kind: 'simple'; root: Group }
  /** `root` is set when the tree is known but deeper than Simple mode shows. */
  | { kind: 'complex'; reason: string; root?: Group }
  | { kind: 'error'; message: string; at: number };

/* ------------------------------------------------------------------ */
/* Tokens                                                              */
/* ------------------------------------------------------------------ */

type Tok =
  | { t: 'path'; v: string; at: number }
  | { t: 'str'; v: string; at: number }
  | { t: 'num'; v: string; at: number }
  | { t: 'bool'; v: string; at: number }
  | { t: 'op'; v: string; at: number }
  | { t: 'kw'; v: 'in'; at: number }
  | { t: 'punc'; v: string; at: number };

class CelError extends Error {
  at: number;
  constructor(message: string, at: number) {
    super(message);
    this.at = at;
  }
}

function tokenize(src: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) {
      i += 1;
      continue;
    }
    const two = src.slice(i, i + 2);
    if (['&&', '||', '==', '!=', '>=', '<='].includes(two)) {
      toks.push({ t: 'op', v: two, at: i });
      i += 2;
      continue;
    }
    if ('<>!'.includes(c)) {
      toks.push({ t: 'op', v: c, at: i });
      i += 1;
      continue;
    }
    if ('()[],'.includes(c)) {
      toks.push({ t: 'punc', v: c, at: i });
      i += 1;
      continue;
    }
    if (c === '"' || c === "'") {
      const start = i;
      i += 1;
      let s = '';
      while (i < src.length && src[i] !== c) {
        s += src[i];
        i += 1;
      }
      if (i >= src.length) throw new CelError('Unclosed string', start);
      i += 1;
      toks.push({ t: 'str', v: s, at: start });
      continue;
    }
    if (/[0-9]/.test(c)) {
      const start = i;
      while (i < src.length && /[0-9]/.test(src[i])) i += 1;
      toks.push({ t: 'num', v: src.slice(start, i), at: start });
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      const start = i;
      while (i < src.length && /[A-Za-z0-9_.]/.test(src[i])) i += 1;
      const word = src.slice(start, i);
      if (word === 'in') toks.push({ t: 'kw', v: 'in', at: start });
      else if (word === 'true' || word === 'false')
        toks.push({ t: 'bool', v: word, at: start });
      else toks.push({ t: 'path', v: word, at: start });
      continue;
    }
    throw new CelError(`Unexpected character "${c}"`, i);
  }
  return toks;
}

/* ------------------------------------------------------------------ */
/* AST                                                                 */
/* ------------------------------------------------------------------ */

type Lit = { k: 'lit'; values: string[]; types: Tok['t'][]; list: boolean; at: number };
type PathNode = { k: 'path'; v: string; at: number };
type Ast =
  | { k: 'and'; items: Ast[] }
  | { k: 'or'; items: Ast[] }
  | { k: 'not'; item: Ast }
  | { k: 'cmp'; op: string; left: PathNode; right: PathNode | Lit; at: number }
  | { k: 'call'; fn: string; target: PathNode; arg: PathNode | Lit; at: number };

const METHODS = ['startsWith', 'endsWith', 'contains', 'hasAnyOf', 'hasAllOf'];

function parse(toks: Tok[]): Ast {
  let p = 0;
  const peek = () => toks[p];
  const end = toks.length ? toks[toks.length - 1].at + 1 : 0;
  const expect = (v: string) => {
    const tok = toks[p];
    if (!tok || tok.v !== v) {
      throw new CelError(`Expected "${v}"`, tok?.at ?? end);
    }
    p += 1;
  };

  function literalOrPath(): PathNode | Lit {
    const tok = toks[p];
    if (!tok) throw new CelError('Expected a value', end);
    if (tok.t === 'str' || tok.t === 'num' || tok.t === 'bool') {
      p += 1;
      return { k: 'lit', values: [tok.v], types: [tok.t], list: false, at: tok.at };
    }
    if (tok.t === 'path') {
      p += 1;
      return { k: 'path', v: tok.v, at: tok.at };
    }
    if (tok.t === 'punc' && tok.v === '[') {
      p += 1;
      const values: string[] = [];
      const types: Tok['t'][] = [];
      while (peek() && peek().v !== ']') {
        const item = toks[p];
        if (item.t !== 'str' && item.t !== 'num' && item.t !== 'bool') {
          throw new CelError('Lists can only hold values', item.at);
        }
        values.push(item.v);
        types.push(item.t);
        p += 1;
        if (peek()?.v === ',') p += 1;
      }
      expect(']');
      return { k: 'lit', values, types, list: true, at: tok.at };
    }
    throw new CelError('Expected a value or an attribute', tok.at);
  }

  function primary(): Ast {
    const tok = toks[p];
    if (!tok) throw new CelError('Expression ends too early', end);
    if (tok.t === 'op' && tok.v === '!') {
      p += 1;
      return { k: 'not', item: primary() };
    }
    if (tok.t === 'punc' && tok.v === '(') {
      p += 1;
      const inner = or();
      expect(')');
      return inner;
    }
    if (tok.t !== 'path') {
      throw new CelError('Expected an attribute', tok.at);
    }
    if (tok.v === 'has' && toks[p + 1]?.v === '(') {
      throw new CelError(
        // D5-5's string (CON7).
        "Rules can't allow people with no value.",
        tok.at,
      );
    }
    p += 1;
    // Method call: recipient.attributes.program.startsWith("A")
    const parts = tok.v.split('.');
    const last = parts[parts.length - 1];
    if (METHODS.includes(last) && peek()?.v === '(') {
      p += 1;
      const arg = literalOrPath();
      expect(')');
      return {
        k: 'call',
        fn: last,
        target: { k: 'path', v: parts.slice(0, -1).join('.'), at: tok.at },
        arg,
        at: tok.at,
      };
    }
    const left: PathNode = { k: 'path', v: tok.v, at: tok.at };
    const op = peek();
    if (op?.t === 'kw') {
      p += 1;
      const right = literalOrPath();
      return { k: 'cmp', op: 'in', left, right, at: tok.at };
    }
    if (op?.t === 'op' && ['==', '!=', '>=', '<=', '>', '<'].includes(op.v)) {
      p += 1;
      const right = literalOrPath();
      return { k: 'cmp', op: op.v, left, right, at: tok.at };
    }
    throw new CelError('Expected an operator after the attribute', op?.at ?? end);
  }

  function and(): Ast {
    const items = [primary()];
    while (peek()?.v === '&&') {
      p += 1;
      items.push(primary());
    }
    return items.length === 1 ? items[0] : { k: 'and', items };
  }

  function or(): Ast {
    const items = [and()];
    while (peek()?.v === '||') {
      p += 1;
      items.push(and());
    }
    return items.length === 1 ? items[0] : { k: 'or', items };
  }

  const ast = or();
  if (p < toks.length) {
    throw new CelError(`Unexpected "${toks[p].v}"`, toks[p].at);
  }
  return ast;
}

/* ------------------------------------------------------------------ */
/* AST → rule tree                                                     */
/* ------------------------------------------------------------------ */

class Complex extends Error {}

const PARTIES: PartyId[] = [
  'session',
  'user',
  'recipient',
  'channel',
  'dm',
  'file',
  'post',
  'team',
];

export interface ParseOptions {
  /** B′: read `!(…) || (…)` as a When card instead of "too complex". */
  allowWhen?: boolean;
  /** Parties in this policy, in preference order. Channel and Direct or group message share `resource.` (M3). */
  prefer?: PartyId[];
}

function resolvePath(
  vocab: Vocabulary,
  path: PathNode,
  prefer: PartyId[],
): { party: PartyId; def: AttributeDef } {
  const order = [
    ...prefer,
    ...PARTIES.filter((p) => !prefer.includes(p)),
  ];
  // Longest root first, so `user.session.x` resolves before `user.x` and
  // `resource.file.x` before `resource.x`; ties keep the preference order.
  const roots = order
    .map((party, i) => ({ party, root: vocab.cel[party], i }))
    .sort((a, b) => b.root.length - a.root.length || a.i - b.i);
  let unknown = false;
  for (const { party, root } of roots) {
    if (!path.v.startsWith(`${root}.`)) continue;
    const rest = path.v.slice(root.length + 1);
    const isAttr = rest.startsWith('attributes.');
    const id = party === 'session' ? rest : isAttr ? rest.slice('attributes.'.length) : rest;
    if (id.includes('.')) continue;
    const def = attributesFor(party).find(
      (a) => a.id === id && (party === 'session' || Boolean(a.native) === !isAttr),
    );
    if (def) return { party, def };
    unknown = true;
  }
  throw new CelError(
    unknown ? `Unknown attribute "${path.v}"` : `Unknown name "${path.v}"`,
    path.at,
  );
}

function literalValues(def: AttributeDef, lit: Lit): string[] {
  const back = def.celValues
    ? Object.fromEntries(Object.entries(def.celValues).map(([k, v]) => [v, k]))
    : {};
  return lit.values.map((v) => back[v] ?? v);
}

const CMP: Record<string, OperatorId> = {
  '==': 'eq',
  '!=': 'neq',
  '>=': 'gte',
  '>': 'gt',
  '<=': 'lte',
  '<': 'lt',
  in: 'in',
};

const CALL: Record<string, OperatorId> = {
  startsWith: 'starts',
  endsWith: 'ends',
  contains: 'contains',
  hasAnyOf: 'any_of',
  hasAllOf: 'all_of',
};

function toNode(ast: Ast, vocab: Vocabulary, opts: Required<ParseOptions>): RuleNode {
  if (ast.k === 'not') {
    throw new Complex('it uses "!" to reverse a rule');
  }
  if (ast.k === 'or' && opts.allowWhen && ast.items.length === 2 && ast.items[0].k === 'not') {
    const cond = toNode(ast.items[0].item, vocab, opts);
    const conditions: RuleNode[] =
      cond.kind === 'group' && cond.join === 'all' ? cond.children : [cond];
    if (!conditions.every((c) => c.kind === 'rule')) {
      throw new Complex('its "When" part is not a plain list of rules');
    }
    const req = toNode(ast.items[1], vocab, opts);
    const then = req.kind === 'group' ? req : group('all', [req]);
    if (then.children.some((c) => c.kind === 'when')) {
      throw new Complex('it puts a When rule inside another');
    }
    return { kind: 'when', id: nextId('w'), when: group('all', conditions as Rule[]), then };
  }
  if (ast.k === 'and' || ast.k === 'or') {
    const join = ast.k === 'and' ? 'all' : 'any';
    const children = ast.items.map((i) => toNode(i, vocab, opts));
    // Flatten runs of the same join: (a && (b && c)) is one list.
    const flat = children.flatMap((c) =>
      c.kind === 'group' && c.join === join ? c.children : [c],
    );
    if (join === 'any' && flat.some((c) => c.kind === 'when')) {
      throw new Complex('it joins a When rule with "or"');
    }
    return group(join, flat);
  }
  const target = ast.k === 'cmp' ? ast.left : ast.target;
  const operand = ast.k === 'cmp' ? ast.right : ast.arg;
  const op = ast.k === 'cmp' ? CMP[ast.op] : CALL[ast.fn];
  const left = resolvePath(vocab, target, opts.prefer);
  let right: Operand;
  if (operand.k === 'path') {
    const other = resolvePath(vocab, operand, opts.prefer);
    if (other.def.type !== left.def.type || other.def.link !== left.def.link) {
      throw new CelError(
        `${left.def.label} and ${other.def.label} use different option lists, so they can't be compared. Compare ${left.def.label} with another ${left.def.label} attribute.`,
        operand.at,
      );
    }
    if (left.party === 'session' || other.party === 'session') {
      throw new CelError('Session attributes can only be compared with a value', operand.at);
    }
    // Simple mode compares with another party's attribute; an attribute with
    // itself is always true or always false (QA1-10).
    if (other.party === left.party && other.def.id === left.def.id) {
      throw new CelError(`Compare ${left.def.label} with another party's ${left.def.label}`, operand.at);
    }
    right = { kind: 'attr', ref: { party: other.party, attr: other.def.id } };
  } else {
    // The literal's kind must fit the attribute: true/false for account type,
    // a number for counts, a quoted string otherwise (QA2-9).
    const want = left.def.type === 'account' ? 'bool' : left.def.type === 'number' ? 'num' : 'str';
    if (operand.types.some((t) => t !== want)) {
      const example = want === 'bool' ? 'true or false' : want === 'num' ? 'a number' : 'a quoted value';
      throw new CelError(`${left.def.label} takes ${example}`, operand.at);
    }
    const values = literalValues(left.def, operand);
    // An empty list matches nothing: Simple mode would drop it as unfinished (QA1-10).
    if (values.length === 0) {
      throw new CelError('Add at least one value', operand.at);
    }
    // Type-check literals so a round trip can't change the CEL (cycle 1, QA-16).
    for (const v of values) {
      if (left.def.type === 'number' ? !/^\d+$/.test(v) : left.def.values.length > 0 && !left.def.values.includes(v)) {
        throw new CelError(`"${v}" isn't an option for ${left.def.label}`, operand.at);
      }
    }
    right = { kind: 'value', values };
  }
  const allowed = operatorsFor(left.def.type, right.kind);
  if (!allowed.includes(op)) {
    throw new Complex(
      `it uses "${ast.k === 'cmp' ? ast.op : ast.fn}" with ${left.def.label}, which Simple mode doesn't offer`,
    );
  }
  // Kept as written, in either order: no silent reordering (designer, round 1.1).
  return rule({ party: left.party, attr: left.def.id }, op, right);
}

export function parseCel(
  src: string,
  vocab: Vocabulary,
  grouping: GroupingMode,
  options: ParseOptions = {},
): ParseResult {
  if (!src.trim()) {
    return { kind: 'simple', root: group('all', []) };
  }
  const opts: Required<ParseOptions> = {
    allowWhen: options.allowWhen ?? false,
    prefer: options.prefer ?? [],
  };
  try {
    const node = toNode(parse(tokenize(src)), vocab, opts);
    const parsed = node.kind === 'group' ? node : group('all', [node]);
    const root = { ...parsed, children: rulesFirst(parsed.children) };
    const depth = groupDepth(root);
    const limit = grouping === 'flat' ? 0 : 1;
    if (depth > limit) {
      return {
        kind: 'complex',
        root,
        reason:
          grouping === 'flat'
            ? 'it mixes All and Any'
            : 'it puts a group inside another group',
      };
    }
    // Rule sets show only "any of (all of …)" (DNF).
    if (grouping === 'sets') {
      const dnf =
        root.join === 'all'
          ? root.children.every((c) => c.kind === 'rule')
          : root.children.every(
              (c) => c.kind === 'rule' || (c.kind === 'group' && c.join === 'all'),
            );
      if (!dnf) {
        return { kind: 'complex', root, reason: 'it needs "or" inside a rule set' };
      }
    }
    return { kind: 'simple', root };
  } catch (e) {
    if (e instanceof Complex) return { kind: 'complex', reason: e.message };
    if (e instanceof CelError) {
      return { kind: 'error', message: e.message, at: e.at };
    }
    throw e;
  }
}

/** Autocomplete entries for Advanced mode, grouped by party. */
export function celCompletions(
  vocab: Vocabulary,
  parties: PartyId[],
): { party: PartyId; heading: string; items: { path: string; label: string }[] }[] {
  return parties.map((party) => ({
    party,
    heading: vocab.party[party],
    items: attributesFor(party).map((a) => ({
      path:
        party === 'session' || a.native
          ? `${vocab.cel[party]}.${a.id}`
          : `${vocab.cel[party]}.attributes.${a.id}`,
      label: a.label,
    })),
  }));
}
