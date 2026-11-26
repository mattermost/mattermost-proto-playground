// [AI DRAFT] Evaluation with a per-rule trace, for "Simulate rules".
//
// Locked behaviour carried from the parent spec and ideation 04 §1.2:
//   - a rule with no value on either side fails, whatever its operator
//     (fail-secure; engine parity is E-5)
//   - in a group message every recipient is checked separately; one failing
//     recipient blocks the action
//   - a When card whose conditions aren't met "doesn't apply"; a When
//     condition with no value means the requirement IS checked (E-5)
// Simulate and enforcement must share this one evaluator (FR-4).
import { attributeDef, isResource, type PartyId } from './catalog';
import type { Person, ResourceFixture, SessionContext } from './fixtures';
import { supplies, type PermissionId } from './permissions';
import type { Group, Rule, RuleNode, When } from './rules';

export type Outcome = 'pass' | 'fail' | 'missing' | 'n/a';

export interface RuleTrace {
  kind: 'rule';
  rule: Rule;
  outcome: Outcome;
  leftValue?: string;
  rightValue?: string;
}

export interface GroupTrace {
  kind: 'group';
  group: Group;
  outcome: Outcome;
  children: Trace[];
}

export interface WhenTrace {
  kind: 'when';
  node: When;
  outcome: Outcome;
  /** Did the When conditions hold (or have no value)? */
  applies: boolean;
  when: GroupTrace;
  then: GroupTrace | null;
}

export type Trace = RuleTrace | GroupTrace | WhenTrace;

export interface SimContext {
  permission: PermissionId;
  user: Person;
  session: SessionContext;
  /** Every other member. Empty when the action has no recipient. */
  recipients: Person[];
  /** Resources this action touches, by kind. */
  resources: Partial<Record<PartyId, ResourceFixture>>;
}

export interface RecipientVerdict {
  recipient: Person | null;
  outcome: Outcome;
  trace: Trace;
}

export interface Verdict {
  allowed: boolean;
  perRecipient: RecipientVerdict[];
}

function valueOf(
  ctx: SimContext,
  party: PartyId,
  id: string,
  recipient: Person | null,
): string | undefined {
  const person = party === 'user' ? ctx.user : party === 'recipient' ? recipient : null;
  if (party === 'user' || party === 'recipient') {
    if (!person) return undefined;
    if (id === 'isbot') return person.account === 'Person' ? 'Person' : 'Bot';
    return person.attributes[id];
  }
  if (party === 'session') {
    return ctx.session[id as keyof SessionContext];
  }
  if (isResource(party)) {
    return ctx.resources[party]?.attributes[id];
  }
  return undefined;
}

function compare(
  party: PartyId,
  id: string,
  op: Rule['op'],
  left: string,
  right: string[],
): boolean {
  const def = attributeDef(party, id);
  const rank = (v: string) =>
    def.type === 'number' ? Number(v) : def.values.indexOf(v);
  switch (op) {
    case 'eq':
      return left === right[0];
    case 'neq':
      return left !== right[0];
    case 'in':
      return right.includes(left);
    case 'starts':
      return left.startsWith(right[0]);
    case 'ends':
      return left.endsWith(right[0]);
    case 'contains':
      return left.includes(right[0]);
    case 'any_of':
      return right.some((v) => left.split(',').includes(v));
    case 'all_of':
      return right.every((v) => left.split(',').includes(v));
    case 'gte':
      return rank(left) >= rank(right[0]);
    case 'gt':
      return rank(left) > rank(right[0]);
    case 'lte':
      return rank(left) <= rank(right[0]);
    case 'lt':
      return rank(left) < rank(right[0]);
    default: {
      const exhaustive: never = op;
      return exhaustive;
    }
  }
}

function evalRule(r: Rule, ctx: SimContext, recipient: Person | null): RuleTrace {
  const left = valueOf(ctx, r.left.party, r.left.attr, recipient);
  const rightValues =
    r.right.kind === 'value'
      ? r.right.values
      : (() => {
          const v = valueOf(ctx, r.right.ref.party, r.right.ref.attr, recipient);
          return v === undefined ? undefined : [v];
        })();
  const rightValue = rightValues?.join(', ');
  if (left === undefined || rightValues === undefined) {
    return { kind: 'rule', rule: r, outcome: 'missing', leftValue: left, rightValue };
  }
  const ok = compare(r.left.party, r.left.attr, r.op, left, rightValues);
  return { kind: 'rule', rule: r, outcome: ok ? 'pass' : 'fail', leftValue: left, rightValue };
}

function evalGroup(g: Group, ctx: SimContext, recipient: Person | null): GroupTrace {
  const children = g.children.map((c) => evalNode(c, ctx, recipient));
  const applicable = children.filter((c) => c.outcome !== 'n/a');
  let outcome: Outcome;
  if (applicable.length === 0) {
    outcome = 'n/a';
  } else if (g.join === 'all') {
    if (applicable.every((c) => c.outcome === 'pass')) outcome = 'pass';
    else if (applicable.some((c) => c.outcome === 'fail')) outcome = 'fail';
    else outcome = 'missing';
  } else if (applicable.some((c) => c.outcome === 'pass')) {
    outcome = 'pass';
  } else if (applicable.some((c) => c.outcome === 'missing')) {
    outcome = 'missing';
  } else {
    outcome = 'fail';
  }
  return { kind: 'group', group: g, outcome, children };
}

function evalWhen(w: When, ctx: SimContext, recipient: Person | null): WhenTrace {
  const cond = evalGroup(w.when, ctx, recipient);
  // A missing When value means the requirement is checked (E-5, fail-secure).
  const applies = cond.outcome === 'pass' || cond.outcome === 'missing';
  if (!applies) {
    return { kind: 'when', node: w, outcome: 'n/a', applies, when: cond, then: null };
  }
  const then = evalGroup(w.then, ctx, recipient);
  return { kind: 'when', node: w, outcome: then.outcome, applies, when: cond, then };
}

function evalNode(node: RuleNode, ctx: SimContext, recipient: Person | null): Trace {
  if (node.kind === 'rule') return evalRule(node, ctx, recipient);
  if (node.kind === 'when') return evalWhen(node, ctx, recipient);
  return evalGroup(node, ctx, recipient);
}

/** One policy, one action. Allowed only when it passes for every recipient. */
export function simulate(root: Group, ctx: SimContext): Verdict {
  const recipients = supplies(ctx.permission, 'recipient') ? ctx.recipients : [];
  const runs: (Person | null)[] = recipients.length > 0 ? recipients : [null];
  const perRecipient = runs.map((recipient) => {
    const trace = evalGroup(root, ctx, recipient);
    return { recipient, outcome: trace.outcome, trace };
  });
  const allowed = perRecipient.every((r) => r.outcome === 'pass' || r.outcome === 'n/a');
  return { allowed, perRecipient };
}
