// [AI DRAFT] Turns a plain-text prompt into rules the table can show.
// The prototype has no model call: it maps the attributes this policy can
// use, and answers a question from the reading it already builds.
import type { PartyId } from './catalog';
import { AI } from '../copy';
import {
  allRules,
  attr,
  clause,
  group,
  isIncomplete,
  prune,
  readback,
  rule,
  toCel,
  value,
  type Group,
  type Join,
  type OperatorId,
  type Policy,
  type RuleNode,
} from './rules';
import type { Vocabulary } from './vocabulary';

export type AiKind = 'created' | 'updated' | 'removed' | 'unchanged' | 'question' | 'unmatched';

export interface AiResult {
  /** Null when the rules stay as they are. */
  root: Group | null;
  kind: AiKind;
  /** One line per rule after the change. */
  rules: string[];
  body: string;
  expression?: string;
}

const LEVELS: { needle: string; label: string }[] = [
  { needle: 'top secret', label: 'Top Secret' },
  { needle: 'secret', label: 'Secret' },
  { needle: 'confidential', label: 'Confidential' },
  { needle: 'unclassified', label: 'Unclassified' },
];

const POSITIONS = ['Program lead', 'Engineer', 'Analyst', 'Logistics officer'];

function levelIn(text: string): string | null {
  const found = LEVELS.find((l) => text.includes(l.needle));
  return found ? found.label : null;
}

function levelOp(text: string): OperatorId {
  if (/\b(at least|or above|or higher|minimum|no less than)\b/.test(text)) return 'gte';
  if (/\b(above|higher than|more than|greater than)\b/.test(text)) return 'gt';
  if (/\b(at most|or below|or lower|no more than)\b/.test(text)) return 'lte';
  if (/\b(below|lower than|less than|under)\b/.test(text)) return 'lt';
  return 'eq';
}

function subject(text: string): 'user' | 'recipient' {
  const recipient = /\brecipients?\b/.test(text);
  const user = /\b(users?|people|members?)\b/.test(text);
  if (recipient && !user) return 'recipient';
  return 'user';
}

/** One clause of a prompt, as rules. Empty when nothing in the catalog matches. */
function matchClause(text: string): RuleNode[] {
  const who = subject(text);

  const count = text.match(/\b(\d+)\b/);
  if (/\b(members|people in the group|group size|large group)\b/.test(text) && (count || /large group/.test(text))) {
    const n = count?.[1] ?? '8';
    const op: OperatorId = /\b(fewer|less) than\b/.test(text) ? 'lt' : /\bmore than\b/.test(text) ? 'gt' : 'lte';
    return [rule({ party: 'dm', attr: 'member_count' }, op, value(n))];
  }

  if (/\bmanaged devices?\b|\bdevice is managed\b/.test(text)) {
    return [rule({ party: 'session', attr: 'device' }, 'eq', value('Managed'))];
  }
  if (/\btrusted networks?\b|\bnetwork is trusted\b/.test(text)) {
    return [rule({ party: 'session', attr: 'network' }, 'eq', value('Trusted'))];
  }
  if (/\bunmanaged\b/.test(text)) {
    return [rule({ party: 'session', attr: 'device' }, 'eq', value('Unmanaged'))];
  }

  if (/\bbots?\b/.test(text) && /\b(only|just|must be|is a)\b/.test(text)) {
    return [rule({ party: 'recipient', attr: 'isbot' }, 'eq', value('Bot'))];
  }
  if (/\bnot a bot\b|\bpeople only\b|\bno bots\b/.test(text)) {
    return [rule({ party: 'recipient', attr: 'isbot' }, 'eq', value('Person'))];
  }

  if (/\b(clearance|classification)\b/.test(text) && /\bfiles?\b/.test(text)) {
    const op: OperatorId = /\bmatch/.test(text) ? 'eq' : 'gte';
    return [rule({ party: who === 'recipient' ? 'recipient' : 'user', attr: 'clearance' }, op, attr('file', 'classification'))];
  }

  const level = levelIn(text);
  if (level && /\b(clearance|classified)\b/.test(text)) {
    return [rule({ party: who, attr: 'clearance' }, levelOp(text), value(level))];
  }

  if (/\bcontractors?\b/.test(text) && /\b(compan(y|ies)|each other)\b/.test(text)) {
    return [
      rule({ party: 'user', attr: 'employment_type' }, 'neq', value('Contractor')),
      rule({ party: 'recipient', attr: 'employment_type' }, 'neq', value('Contractor')),
      rule({ party: 'user', attr: 'company' }, 'eq', attr('recipient', 'company')),
    ];
  }

  if (/\b(employment|contractors?|military|civilian)\b/.test(text)) {
    const negated = /\b(not|isn't|is not|except|other than)\b/.test(text);
    const employment = text.includes('military')
      ? 'Military'
      : text.includes('civilian')
        ? 'Government civilian'
        : 'Contractor';
    return [rule({ party: who, attr: 'employment_type' }, negated ? 'neq' : 'eq', value(employment))];
  }

  const compared = (
    [
      ['program', 'program'],
      ['company', 'company'],
      ['position', 'position'],
    ] as const
  ).find(([word]) => text.includes(word) && /\b(same|match|equal|differ|different)\b/.test(text));
  if (compared) {
    const op: OperatorId = /\b(differ|different|not the same|doesn't match|does not match)\b/.test(text) ? 'neq' : 'eq';
    return [rule({ party: 'user', attr: compared[1] }, op, attr(otherParty(text), compared[1]))];
  }

  const position = POSITIONS.find((p) => text.includes(p.toLowerCase()));
  if (position) {
    const negated = /\b(not|isn't|is not)\b/.test(text);
    return [rule({ party: who, attr: 'position' }, negated ? 'neq' : 'eq', value(position))];
  }

  return [];
}

/** The other side of a comparison. Channel, file, post and team are named; otherwise the recipient. */
function otherParty(text: string): PartyId {
  if (/\bchannels?\b/.test(text)) return 'channel';
  if (/\bfiles?\b/.test(text)) return 'file';
  if (/\bposts?\b/.test(text)) return 'post';
  if (/\bteams?\b/.test(text)) return 'team';
  return 'recipient';
}

/**
 * "I said channel, not recipient": point an existing comparison at the party
 * they named, keeping the attribute.
 */
function retarget(text: string, existing: RuleNode[]): RuleNode[] | null {
  if (!/\b(i said|not the recipient|not recipient|instead)\b/.test(text)) return null;
  const party = otherParty(text);
  if (party === 'recipient') return null;
  let changed = false;
  const next = existing.map((node) => {
    if (node.kind !== 'rule' || node.right.kind !== 'attr' || node.right.ref.party === party) return node;
    changed = true;
    return rule(node.left, node.op, attr(party, node.left.attr));
  });
  return changed ? next : null;
}

function splitClauses(text: string): { clauses: string[]; join: Join } {
  const clauses = text
    .split(/\s+or\s+|\s+and\s+|;|\n/i)
    .map((part) => part.trim())
    .filter(Boolean);
  const join: Join = /\s+or\s+/i.test(text) ? 'any' : 'all';
  return { clauses, join };
}

function isQuestion(text: string): boolean {
  const asks = /^(what|why|who|how|does|do|can|is|are|explain|show|tell)\b/.test(text) || text.endsWith('?');
  if (!asks) return false;
  if (/\b(require|add|also|remove|delete|drop|instead|replace)\b/.test(text)) return false;
  return splitClauses(text).clauses.every((part) => matchClause(part).length === 0);
}

function signature(node: RuleNode): string {
  if (node.kind === 'rule') {
    const right = node.right.kind === 'value' ? node.right.values.join(',') : `${node.right.ref.party}.${node.right.ref.attr}`;
    return `rule:${node.left.party}.${node.left.attr}.${node.op}.${right}`;
  }
  if (node.kind === 'when') {
    return `when:${node.when.children.map(signature).join('&')}>${node.then.children.map(signature).join('&')}`;
  }
  return `group:${node.join}:${node.children.map(signature).join('|')}`;
}

function finished(root: Group): RuleNode[] {
  return root.children.filter((child) => child.kind !== 'rule' || !isIncomplete(child));
}

function result(policy: Policy, vocab: Vocabulary, root: Group | null, kind: AiKind, body: string, withExpression: boolean): AiResult {
  const tree = root ?? policy.root;
  const rules = allRules(prune(tree)).map((r) => clause(r, vocab));
  const expression = withExpression ? toCel(prune(tree), vocab) : undefined;
  return {
    root,
    kind,
    rules: kind === 'question' || kind === 'unmatched' ? [] : rules,
    body,
    expression: expression || undefined,
  };
}

/** A prompt against the policy as it stands. `root` is null when nothing should change. */
export function draftFromPrompt(prompt: string, policy: Policy, vocab: Vocabulary): AiResult {
  const text = prompt.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!text) {
    return { root: null, kind: 'unmatched', rules: [], body: AI.unmatched };
  }

  if (isQuestion(text)) {
    const reading = readback(policy, vocab);
    const body = reading.denied ? `${reading.sentence} Not allowed when ${reading.denied}.` : reading.sentence;
    const wantsExpression = /\b(expression|cel|code|advanced)\b/.test(text);
    return result(policy, vocab, null, 'question', body, wantsExpression);
  }

  const existing = finished(policy.root);

  if (/\b(remove|delete|drop)\b/.test(text)) {
    const kept = /\blast\b/.test(text)
      ? existing.slice(0, -1)
      : existing.filter((child) => {
          if (child.kind !== 'rule') return true;
          const label = clause(child, vocab).toLowerCase();
          return !text.split(/\s+/).some((word) => word.length > 3 && label.includes(word));
        });
    if (kept.length === existing.length) {
      return { root: null, kind: 'unmatched', rules: [], body: AI.removeWhich };
    }
    return result(policy, vocab, group(policy.root.join, kept), 'removed', readback({ ...policy, root: group(policy.root.join, kept) }, vocab).sentence, true);
  }

  const { clauses, join } = splitClauses(text);
  const matched = clauses.flatMap(matchClause);
  if (matched.length === 0) {
    const corrected = retarget(text, existing);
    if (corrected) {
      const root = group(policy.root.join, corrected);
      return result(policy, vocab, root, 'updated', readback({ ...policy, root }, vocab).sentence, true);
    }
    const joinOnly = /^(any|all)\b|switch to (any|all)|make (it|them) (any|all)|any of these|all of these/.test(text);
    if (joinOnly && existing.length > 0) {
      const nextJoin: Join = /\bany\b/.test(text) ? 'any' : 'all';
      const root = group(nextJoin, existing);
      return result(policy, vocab, root, 'updated', readback({ ...policy, root }, vocab).sentence, true);
    }
    return { root: null, kind: 'unmatched', rules: [], body: AI.unmatched };
  }

  const replace = /^(only|instead|replace|start over|reset)\b/.test(text) || /\b(instead|replace|start over|reset)\b/.test(text);
  const base = !replace && existing.length > 0 ? existing : [];
  const seen = new Set(base.map(signature));
  const added = matched.filter((node) => {
    const key = signature(node);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (added.length === 0) {
    return result(policy, vocab, null, 'unchanged', '', false);
  }

  const root = group(base.length > 0 ? policy.root.join : join, [...base, ...added]);
  // A contractor/company prompt is one Any group, not three rules that must all pass.
  const contractorSet = matched.length === 3 && /\bcontractors?\b/.test(text) && /\bcompan/.test(text);
  const next = contractorSet && base.length === 0 ? group('any', matched) : root;
  const kind: AiKind = base.length === 0 ? 'created' : 'updated';
  return result(policy, vocab, next, kind, readback({ ...policy, root: next }, vocab).sentence, true);
}
