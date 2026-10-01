// [AI DRAFT] DM/GM policy model: permissions, starting rules, evaluation, and the
// plain-language summary used by Direction B's summary strip.
import { SIMULATE, SUMMARY } from './copy';
import {
  ISABELLA,
  isSessionAttribute,
  type AttributeKey,
  type Person,
  type SessionAttributeKey,
  type UserAttributeKey,
} from './dmgmData';

/* ------------------------------------------------------------------ */
/* Permissions                                                         */
/* ------------------------------------------------------------------ */

export type DmPermission = 'start' | 'post' | 'view';

export const DM_PERMISSION_ORDER: DmPermission[] = ['start', 'post', 'view'];

/** Picker labels and descriptions. Draft copy, written in the shipped Title Case style. */
export const DM_PERMISSIONS: Record<
  DmPermission,
  { label: string; description: string }
> = {
  start: {
    label: 'Start Direct and Group Messages',
    description: 'Allow users to start new direct and group messages',
  },
  post: {
    label: 'Post in Direct and Group Messages',
    description:
      'Allow users to post in direct and group messages. Requires View Direct and Group Messages.',
  },
  view: {
    label: 'View Direct and Group Messages',
    description:
      'Allow users to see direct and group messages and their content',
  },
};

/**
 * Permissions that are not DM/GM permissions. Labels and descriptions are the
 * shipped `admin.permission_policies.permission.*` strings.
 */
export const OTHER_PERMISSIONS = [
  {
    label: 'Download Files',
    description: 'Allow users to download files to their device',
  },
  {
    label: 'Upload Files',
    description: 'Allow users to upload files while sending a message',
  },
  {
    label: 'Channel Read Access',
    description: 'Allow users to read the channel and its content',
  },
  {
    label: 'Channel Write Access',
    description: 'Allow users to post in the channel and change its content',
  },
];

/* ------------------------------------------------------------------ */
/* Conditions and policies                                             */
/* ------------------------------------------------------------------ */

export type Operator = 'is' | 'is not';
export type MatchMode = 'all' | 'any';

export interface ActingCondition {
  id: string;
  attribute: AttributeKey;
  operator: Operator;
  value: string;
}

export type OtherValue = { kind: 'fixed'; value: string } | { kind: 'same' };

export interface OtherCondition {
  id: string;
  attribute: UserAttributeKey;
  operator: Operator;
  value: OtherValue;
}

export interface DmPolicy {
  name: string;
  role: string;
  permissions: DmPermission[];
  acting: ActingCondition[];
  other: OtherCondition[];
  match: MatchMode;
}

let conditionSeq = 0;
export function nextConditionId(): string {
  conditionSeq += 1;
  return `c${conditionSeq}`;
}

export function blankPolicy(): DmPolicy {
  return {
    name: '',
    role: 'Members',
    permissions: [],
    acting: [],
    other: [],
    match: 'all',
  };
}

/* ------------------------------------------------------------------ */
/* Starting rules (Direction B catalogue)                              */
/* ------------------------------------------------------------------ */

export interface Placeholder {
  id: string;
  /** What the starting rule calls this attribute or value. */
  label: string;
  /** One line explaining what to map it to. */
  hint: string;
  kind: 'user-attribute' | 'session-attribute' | 'value';
  /** For values: the attribute placeholder whose values are offered. */
  of?: string;
}

export type Mapping = Record<string, string>;

export interface StartingRule {
  id: string;
  name: string;
  description: string;
  tags: string[];
  placeholders: Placeholder[];
  /** The mapping a deployment like this one would choose. Used for the end-user scenes. */
  canonical: Mapping;
  build: (m: Mapping) => DmPolicy;
}

function attr<T extends AttributeKey>(m: Mapping, key: string): T {
  return m[key] as T;
}

export const STARTING_RULES: StartingRule[] = [
  {
    id: 'same-program',
    name: 'Same program only',
    description:
      'People can start and post in direct messages only with people in their own program.',
    tags: ['Start', 'Post', SUMMARY.tagBothWays],
    placeholders: [
      {
        id: 'program',
        label: 'Program',
        hint: 'The user attribute that records which program someone belongs to.',
        kind: 'user-attribute',
      },
    ],
    canonical: { program: 'Program' },
    build: (m) => ({
      name: 'Same program only',
      role: 'Members',
      permissions: ['start', 'post'],
      acting: [],
      other: [
        {
          id: nextConditionId(),
          attribute: attr<UserAttributeKey>(m, 'program'),
          operator: 'is',
          value: { kind: 'same' },
        },
      ],
      match: 'all',
    }),
  },
  {
    id: 'contractors-no-start',
    name: "Contractors can't start DMs",
    description:
      'Contractors can reply in existing conversations but cannot start new ones.',
    tags: ['Start', SUMMARY.tagActingOnly],
    placeholders: [
      {
        id: 'employment',
        label: 'Employment type',
        hint: 'The user attribute that records whether someone is a contractor.',
        kind: 'user-attribute',
      },
      {
        id: 'contractor',
        label: 'Contractor',
        hint: 'The value of that attribute that means "contractor".',
        kind: 'value',
        of: 'employment',
      },
    ],
    canonical: { employment: 'Employment type', contractor: 'Contractor' },
    build: (m) => ({
      name: "Contractors can't start DMs",
      role: 'Members',
      permissions: ['start'],
      acting: [
        {
          id: nextConditionId(),
          attribute: attr<UserAttributeKey>(m, 'employment'),
          operator: 'is not',
          value: m.contractor,
        },
      ],
      other: [],
      match: 'all',
    }),
  },
  {
    id: 'contractors-no-leads',
    name: "Contractors can't start DMs with program leads",
    description:
      'Contractors cannot start a conversation with a program lead. Program leads can still start one with them.',
    tags: ['Start', SUMMARY.tagOneWay],
    placeholders: [
      {
        id: 'employment',
        label: 'Employment type',
        hint: 'The user attribute that records whether someone is a contractor.',
        kind: 'user-attribute',
      },
      {
        id: 'contractor',
        label: 'Contractor',
        hint: 'The value of that attribute that means "contractor".',
        kind: 'value',
        of: 'employment',
      },
      {
        id: 'position',
        label: 'Position',
        hint: 'The user attribute that records whether someone is a program lead.',
        kind: 'user-attribute',
      },
      {
        id: 'lead',
        label: 'Program lead',
        hint: 'The value of that attribute that means "program lead".',
        kind: 'value',
        of: 'position',
      },
    ],
    canonical: {
      employment: 'Employment type',
      contractor: 'Contractor',
      position: 'Position',
      lead: 'Program lead',
    },
    build: (m) => ({
      name: "Contractors can't start DMs with program leads",
      role: 'Members',
      permissions: ['start'],
      acting: [
        {
          id: nextConditionId(),
          attribute: attr<UserAttributeKey>(m, 'employment'),
          operator: 'is not',
          value: m.contractor,
        },
      ],
      other: [
        {
          id: nextConditionId(),
          attribute: attr<UserAttributeKey>(m, 'position'),
          operator: 'is not',
          value: { kind: 'fixed', value: m.lead },
        },
      ],
      match: 'any',
    }),
  },
  {
    id: 'untrusted-no-post',
    name: 'No posting from untrusted networks',
    description:
      "On an untrusted network, people can read direct messages but can't post.",
    tags: ['Post', 'Session rule'],
    placeholders: [
      {
        id: 'network',
        label: 'Network',
        hint: 'The session attribute that records which network a session is on.',
        kind: 'session-attribute',
      },
      {
        id: 'trusted',
        label: 'Trusted',
        hint: 'The value of that attribute that means "trusted network".',
        kind: 'value',
        of: 'network',
      },
    ],
    canonical: { network: 'Network', trusted: 'Trusted' },
    build: (m) => ({
      name: 'No posting from untrusted networks',
      role: 'Members',
      permissions: ['post'],
      acting: [
        {
          id: nextConditionId(),
          attribute: attr<SessionAttributeKey>(m, 'network'),
          operator: 'is',
          value: m.trusted,
        },
      ],
      other: [],
      match: 'all',
    }),
  },
  {
    id: 'untrusted-no-view',
    name: "Unmanaged devices can't see DMs",
    description:
      'Direct and group messages are hidden on unmanaged devices.',
    tags: ['View', 'Session rule'],
    placeholders: [
      {
        id: 'device',
        label: 'Device',
        hint: 'The session attribute that records whether a device is managed.',
        kind: 'session-attribute',
      },
      {
        id: 'managed',
        label: 'Managed',
        hint: 'The value of that attribute that means "managed device".',
        kind: 'value',
        of: 'device',
      },
    ],
    canonical: { device: 'Device', managed: 'Managed' },
    build: (m) => ({
      name: "Unmanaged devices can't see DMs",
      role: 'Members',
      permissions: ['view'],
      acting: [
        {
          id: nextConditionId(),
          attribute: attr<SessionAttributeKey>(m, 'device'),
          operator: 'is',
          value: m.managed,
        },
      ],
      other: [],
      match: 'all',
    }),
  },
];

export function isMappingComplete(
  rule: StartingRule,
  mapping: Mapping,
): boolean {
  return rule.placeholders.every((p) => Boolean(mapping[p.id]));
}

export function ruleById(id: string): StartingRule {
  const rule = STARTING_RULES.find((r) => r.id === id);
  if (!rule) {
    throw new Error(`Unknown starting rule: ${id}`);
  }
  return rule;
}

/** The rule the authoring and Simulate scenes are built around. */
export const FEATURED_RULE_ID = 'contractors-no-leads';

/**
 * Policies in force for every end-user scene. "Contractors can't start DMs" is
 * left out on purpose: it would block the signed-in contractor from starting any
 * conversation and mask the other rules.
 */
export const ACTIVE_POLICIES: DmPolicy[] = [
  'same-program',
  'contractors-no-leads',
  'untrusted-no-post',
  'untrusted-no-view',
].map((id) => {
  const rule = ruleById(id);
  return rule.build(rule.canonical);
});

/* ------------------------------------------------------------------ */
/* Evaluation                                                          */
/* ------------------------------------------------------------------ */

export interface SessionContext {
  Network: string;
  Device: string;
}

export const TRUSTED_SESSION: SessionContext = {
  Network: 'Trusted',
  Device: 'Managed',
};

type ConditionResult = 'pass' | 'fail' | 'missing';

function compare(
  actual: string | undefined,
  operator: Operator,
  expected: string,
): ConditionResult {
  if (actual === undefined) {
    return 'missing';
  }
  const equal = actual === expected;
  return (operator === 'is' ? equal : !equal) ? 'pass' : 'fail';
}

function actingResult(
  c: ActingCondition,
  acting: Person,
  ctx: SessionContext,
): ConditionResult {
  const actual = isSessionAttribute(c.attribute)
    ? ctx[c.attribute]
    : acting.attributes[c.attribute];
  return compare(actual, c.operator, c.value);
}

function otherResult(
  c: OtherCondition,
  acting: Person,
  other: Person,
): ConditionResult {
  const actual = other.attributes[c.attribute];
  if (c.value.kind === 'same') {
    const mine = acting.attributes[c.attribute];
    if (mine === undefined || actual === undefined) {
      return 'missing';
    }
    return compare(actual, c.operator, mine);
  }
  return compare(actual, c.operator, c.value.value);
}

export interface PolicyOutcome {
  allowed: boolean;
  /** True when the denial came from the other person lacking an attribute. */
  missingTarget: boolean;
}

/** One policy, one permission, acting user against one other member. */
export function evaluatePolicy(
  policy: DmPolicy,
  acting: Person,
  ctx: SessionContext,
  other: Person | null,
): PolicyOutcome {
  const actingResults = policy.acting.map((c) => actingResult(c, acting, ctx));
  const otherResults = other
    ? policy.other.map((c) => otherResult(c, acting, other))
    : [];
  const all = [...actingResults, ...otherResults];
  if (all.length === 0) {
    return { allowed: true, missingTarget: false };
  }
  const allowed =
    policy.match === 'all'
      ? all.every((r) => r === 'pass')
      : all.some((r) => r === 'pass');
  const missingTarget = !allowed && otherResults.includes('missing');
  return { allowed, missingTarget };
}

export type DecidingLayer =
  | { kind: 'allowed' }
  | { kind: 'policy'; name: string }
  | { kind: 'missing-target'; name: string }
  | { kind: 'requires-view'; name: string };

export interface Verdict {
  allowed: boolean;
  layer: DecidingLayer;
}

/**
 * Every applicable policy, one permission, acting user against every other
 * member. Any failing pair denies (every recipient is checked). The legacy DM
 * setting and the role permission allow in every fixture here, so they never
 * decide; Simulate still names them when they would.
 */
export function evaluate(
  policies: DmPolicy[],
  permission: DmPermission,
  acting: Person,
  ctx: SessionContext,
  others: Person[],
): Verdict {
  const selfOnly = others.length === 0;

  if (permission === 'post') {
    const view = evaluate(policies, 'view', acting, ctx, others);
    if (!view.allowed) {
      const name = view.layer.kind === 'allowed' ? '' : view.layer.name;
      return { allowed: false, layer: { kind: 'requires-view', name } };
    }
  }

  for (const policy of policies) {
    if (!policy.permissions.includes(permission)) {
      continue;
    }
    // Self-DMs skip start and other-person conditions; session view rules still apply.
    if (selfOnly) {
      if (permission !== 'view') {
        continue;
      }
      const outcome = evaluatePolicy(
        { ...policy, other: [] },
        acting,
        ctx,
        null,
      );
      if (!outcome.allowed) {
        return { allowed: false, layer: { kind: 'policy', name: policy.name } };
      }
      continue;
    }
    for (const other of others) {
      const outcome = evaluatePolicy(policy, acting, ctx, other);
      if (!outcome.allowed) {
        return {
          allowed: false,
          layer: outcome.missingTarget
            ? { kind: 'missing-target', name: policy.name }
            : { kind: 'policy', name: policy.name },
        };
      }
    }
  }
  return { allowed: true, layer: { kind: 'allowed' } };
}

export function layerLabel(layer: DecidingLayer): string {
  switch (layer.kind) {
    case 'allowed':
      return 'All layers allow';
    case 'policy':
      return `Policy: ${layer.name}`;
    case 'missing-target':
      return SIMULATE.layerMissingTarget(layer.name);
    case 'requires-view':
      return `Post requires View · ${layer.name}`;
    default: {
      const exhaustive: never = layer;
      return exhaustive;
    }
  }
}

/* ------------------------------------------------------------------ */
/* Plain-language summary (Direction B)                                */
/* ------------------------------------------------------------------ */

function permissionPhrase(perms: DmPermission[]): string {
  const ordered = DM_PERMISSION_ORDER.filter((p) => perms.includes(p));
  const verbs: Record<DmPermission, string> = {
    start: 'start',
    post: 'post in',
    view: 'see',
  };
  const parts = ordered.map((p) => verbs[p]);
  if (parts.length === 0) {
    return '';
  }
  const joined =
    parts.length === 1
      ? parts[0]
      : `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
  return `${joined} direct and group messages`;
}

function actingClause(c: ActingCondition): string {
  return SUMMARY.actingIs(c.attribute, c.operator, c.value);
}

function otherClause(c: OtherCondition): string {
  if (c.value.kind === 'same') {
    return c.operator === 'is'
      ? SUMMARY.targetMatches(c.attribute)
      : SUMMARY.targetDiffers(c.attribute);
  }
  return SUMMARY.targetIs(c.attribute, c.operator, c.value.value);
}

function roleNoun(role: string): string {
  return role === 'System administrators' ? 'System administrators' : role;
}

export type SummaryDirection = 'both' | 'one-way' | 'acting' | 'none';

export interface PolicySummary {
  sentence: string;
  direction: SummaryDirection;
}

/**
 * Regenerated from the current conditions on every edit — never from the
 * starting rule's name, so an edited rule cannot keep a stale description.
 */
export function summarize(policy: DmPolicy): PolicySummary {
  const perm = permissionPhrase(policy.permissions);
  const who = roleNoun(policy.role);
  if (!perm) {
    return {
      sentence: SUMMARY.noPermission,
      direction: 'none',
    };
  }
  const conditions = policy.acting.length + policy.other.length;
  if (conditions === 0) {
    return {
      sentence: SUMMARY.noConditions(who.toLowerCase()),
      direction: 'none',
    };
  }

  const onlySameMatch =
    policy.acting.length === 0 &&
    policy.other.length > 0 &&
    policy.other.every((c) => c.value.kind === 'same' && c.operator === 'is');

  if (onlySameMatch && policy.match === 'all') {
    const attrs = policy.other.map((c) => c.attribute).join(' and ');
    return {
      sentence: SUMMARY.onlyWithMatching(who, perm, attrs),
      direction: 'both',
    };
  }

  const allNegatedFixed =
    policy.match === 'any' &&
    policy.acting.length > 0 &&
    policy.other.length > 0 &&
    policy.acting.every((c) => c.operator === 'is not') &&
    policy.other.every(
      (c) => c.operator === 'is not' && c.value.kind === 'fixed',
    );

  if (allNegatedFixed) {
    const subject = policy.acting
      .map((c) => `${c.attribute} is ${c.value}`)
      .join(' and ');
    const target = policy.other
      .map(
        (c) =>
          `${c.attribute} is ${c.value.kind === 'fixed' ? c.value.value : ''}`,
      )
      .join(' and ');
    return {
      sentence: `${SUMMARY.cantWith(who, subject, perm, target)} ${SUMMARY.tailOneWayTheyCan}`,
      direction: 'one-way',
    };
  }

  const joiner = policy.match === 'all' ? ' and ' : ', or ';
  const clauses = [
    ...policy.acting.map(actingClause),
    ...policy.other.map(otherClause),
  ].join(joiner);
  const session = policy.acting.some((c) => isSessionAttribute(c.attribute));
  const sessionNote = session ? ` ${SUMMARY.tailSession}` : '';
  if (policy.other.length === 0) {
    return {
      sentence: `${SUMMARY.onlyWhen(who, perm, clauses)}${sessionNote}`,
      direction: 'acting',
    };
  }
  const oneWay =
    policy.other.some((c) => c.value.kind === 'fixed') ||
    policy.acting.some((c) => !isSessionAttribute(c.attribute));
  return {
    sentence: oneWay
      ? `${SUMMARY.onlyWhen(who, perm, clauses)} ${SUMMARY.tailOneWay}${sessionNote}`
      : `${SUMMARY.onlyWhen(who, perm, clauses)}${sessionNote}`,
    direction: oneWay ? 'one-way' : 'both',
  };
}

/** Sample used by Simulate's suggested pair: a contractor and a program lead. */
export const SUGGESTED_TARGET = ISABELLA;

/* ------------------------------------------------------------------ */
/* Advanced mode (CEL)                                                 */
/* ------------------------------------------------------------------ */

/** CEL does not allow spaces in names, so attributes are written in snake case. */
function celName(attribute: AttributeKey): string {
  return attribute.toLowerCase().replace(/\s+/g, '_');
}

function actingCel(c: ActingCondition): string {
  const ref = isSessionAttribute(c.attribute)
    ? `user.session.${celName(c.attribute)}`
    : `user.attributes.${celName(c.attribute)}`;
  return `${ref} ${c.operator === 'is' ? '==' : '!='} "${c.value}"`;
}

function otherCel(c: OtherCondition): string {
  const op = c.operator === 'is' ? '==' : '!=';
  const target = `target.attributes.${celName(c.attribute)}`;
  return c.value.kind === 'same'
    ? `${target} ${op} user.attributes.${celName(c.attribute)}`
    : `${target} ${op} "${c.value.value}"`;
}

/** The single expression Advanced mode shows, using `user.` and `target.`. */
export function toCel(policy: DmPolicy): string {
  const parts = [
    ...policy.acting.map(actingCel),
    ...policy.other.map(otherCel),
  ];
  if (parts.length === 0) {
    return '';
  }
  return parts.join(policy.match === 'all' ? '\n&& ' : '\n|| ');
}

/**
 * Simple mode joins every row with AND (shipped
 * admin.access_control.table_editor.help_text). Anything else is Advanced only.
 */
export function isSimpleExpressible(policy: DmPolicy): boolean {
  return (
    policy.match === 'all' || policy.acting.length + policy.other.length <= 1
  );
}
