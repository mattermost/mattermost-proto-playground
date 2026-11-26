// [AI DRAFT] "One way" / "Applies both ways" for the readback (cycle 1, UX-1).
//
// Proven, never guessed:
//   both ways  swapping User and Recipient gives the same rules
//   one way    some pair of people gets a different answer in each direction
//   (no tag)   neither can be shown
import { findAttribute } from './catalog';
import { simulate } from './evaluate';
import { PEOPLE, TRUSTED_SESSION, resourceById } from './fixtures';
import { permissionDef, type PermissionId } from './permissions';
import {
  allRules,
  partiesOf,
  prune,
  type AttrRef,
  type Group,
  type RoleId,
  type Rule,
  type RuleNode,
} from './rules';

function swapRef(ref: AttrRef): AttrRef | null {
  if (ref.party === 'user') return { party: 'recipient', attr: ref.attr };
  if (ref.party === 'recipient') {
    return findAttribute('user', ref.attr) ? { party: 'user', attr: ref.attr } : null;
  }
  if (ref.party === 'session') return null;
  return ref;
}

function swap(node: RuleNode): RuleNode | null {
  if (node.kind === 'rule') {
    const left = swapRef(node.left);
    if (!left) return null;
    if (node.right.kind === 'attr') {
      const right = swapRef(node.right.ref);
      if (!right) return null;
      return { ...node, left, right: { kind: 'attr', ref: right } };
    }
    return { ...node, left };
  }
  if (node.kind === 'when') {
    const w = swap(node.when);
    const t = swap(node.then);
    return w && t ? { ...node, when: w as Group, then: t as Group } : null;
  }
  const children = node.children.map(swap);
  return children.every(Boolean) ? { ...node, children: children as RuleNode[] } : null;
}

const FLIP: Partial<Record<Rule['op'], Rule['op']>> = { gte: 'lte', lte: 'gte', gt: 'lt', lt: 'gt' };

function canon(node: RuleNode): string {
  if (node.kind === 'rule') {
    const l = `${node.left.party}.${node.left.attr}`;
    if (node.right.kind === 'attr') {
      const r = `${node.right.ref.party}.${node.right.ref.attr}`;
      if (l <= r) return `${l} ${node.op} ${r}`;
      return `${r} ${FLIP[node.op] ?? node.op} ${l}`;
    }
    return `${l} ${node.op} [${[...node.right.values].sort().join('|')}]`;
  }
  if (node.kind === 'when') return `when(${canon(node.when)})then(${canon(node.then)})`;
  return `${node.join}(${node.children.map(canon).sort().join(',')})`;
}

export type Direction = 'one-way' | 'both-ways' | null;

export function directionOf(root: Group, permissions: PermissionId[], role?: RoleId): Direction {
  const tree = prune(root);
  const rules = allRules(tree);
  if (!rules.some((r) => partiesOf(r).includes('recipient'))) return null;
  // Recipient-only rules can still answer differently each way (QA2-7). The
  // wording "Swapping … can change the result" is true for them too.
  const swapped = swap(tree);
  if (swapped && canon(swapped) === canon(tree)) return 'both-ways';
  // Look for a pair that answers differently each way, on a DM permission.
  const permission = permissions.find((p) => permissionDef(p).supplies.includes('recipient'));
  if (!permission) return null;
  const resources = {
    dm: resourceById('dm'),
    file: resourceById('file-secret'),
  };
  // Only accounts the role covers act as the User (as in Simulate, QA1-4).
  const people = role
    ? PEOPLE.filter((p) => (role === 'Bot accounts' ? p.account !== 'Person' : p.account === 'Person'))
    : PEOPLE;
  const allowed = (a: number, b: number) =>
    simulate(tree, {
      permission,
      user: people[a],
      session: TRUSTED_SESSION,
      recipients: [people[b]],
      resources,
    }).allowed;
  for (let i = 0; i < people.length; i += 1) {
    for (let j = i + 1; j < people.length; j += 1) {
      if (allowed(i, j) !== allowed(j, i)) return 'one-way';
    }
  }
  return null;
}
