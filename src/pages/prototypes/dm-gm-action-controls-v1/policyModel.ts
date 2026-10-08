// [AI DRAFT] DM/GM policy model: permissions, starting rules, evaluation, and the
// plain-language summary used by Direction B's summary strip.
import { SIMULATE, SUMMARY } from './copy';
import {
  ATTRIBUTE_INVENTORIES,
  ISABELLA,
  isSessionAttribute,
  type InventoryAttribute,
  type AttributeKey,
  type Person,
  type SessionAttributeKey,
  type UserAttributeKey,
} from './dmgmData';

/* ------------------------------------------------------------------ */
/* Permissions                                                         */
/* ------------------------------------------------------------------ */

export type DmPermission = 'start' | 'post' | 'view';

export const DM_PERMISSION_ORDER: DmPermission[] = ['start', 'view', 'post'];

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
    label: 'Write Direct and Group Messages',
    description:
      'Allow users to post in direct and group messages and change their content. Requires Read Direct and Group Messages.',
  },
  view: {
    label: 'Read Direct and Group Messages',
    description:
      'Allow users to read direct and group messages and their content',
  },
};

/**
 * Permissions that are not DM/GM permissions, grouped as in the picker. File
 * labels are the shipped `admin.permission_policies.permission.*` strings.
 * Channel permissions are DRAFT (designer, 2026-10-08): Channel Read Access is
 * renamed, and Channel Write Access is split into Write Channel Messages (the
 * user's own messages) and Manage Channel (channel settings, members and
 * moderation). Files affect both channels and DMs/GMs.
 */
export const FILE_PERMISSIONS = [
  {
    label: 'Download Files',
    description: 'Allow users to download files to their device',
  },
  {
    label: 'Upload Files',
    description: 'Allow users to upload files while sending a message',
  },
];

export const CHANNEL_PERMISSIONS = [
  {
    label: 'Read Channel Messages',
    description: 'Allow users to see the channel and read its messages',
  },
  {
    label: 'Write Channel Messages',
    description:
      'Allow users to post, reply, react, and edit or delete their own messages. Requires Read Channel Messages.',
  },
  {
    label: 'Manage Channel',
    description:
      "Allow users to change the channel's settings, bookmarks, and members, and moderate others' messages. Requires Read Channel Messages.",
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
  /** Fixed value. Ignored when `compareTo` is set. */
  value: string;
  /**
   * User-subject comparison: compare this user attribute with the recipient's
   * `compareTo` attribute (user.attributes.x == target.attributes.y). Never set
   * on session attributes: a recipient has no evaluable session.
   */
  compareTo?: UserAttributeKey;
}

/**
 * `same`: compare with the user's attribute — `attribute` when set, otherwise
 * the same-named one (target.attributes.x == user.attributes.y).
 */
export type OtherValue =
  | { kind: 'fixed'; value: string }
  | { kind: 'same'; attribute?: UserAttributeKey };

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

/**
 * True when any condition refers to the recipient: a Recipient row, or a User
 * row that compares with a recipient attribute (user.x == target.y).
 */
export function hasRecipientConditions(policy: DmPolicy): boolean {
  return policy.other.length > 0 || policy.acting.some((c) => c.compareTo);
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
/* Starting rules (Direction B): generated from this server's attributes */
/* ------------------------------------------------------------------ */

/** One attribute (and value, where relevant) a generated rule relies on. */
export interface RuleUse {
  attribute: string;
  value?: string;
}

export interface StartingRule {
  id: string;
  name: string;
  description: string;
  tags: string[];
  /** Shown on the card as "Uses: …" so the admin can check the match in place. */
  uses: RuleUse[];
  build: () => DmPolicy;
}

/**
 * How templates recognise attributes. A deliberately small, explicit table for
 * the prototype; engineering must define the real matching. A rule appears
 * only when every attribute and value it needs is found. Rules that can't be
 * fully matched are hidden: no hint, no disabled row, no mapping step.
 */
export const TEMPLATE_MATCHING = {
  /** A user attribute value meaning "contractor". */
  contractorValue: /^contractor$/i,
  /** A user attribute value meaning "lead". */
  leadValue: /\blead$/i,
  /** Session attribute and value meaning a trusted network. */
  trustedNetwork: { attribute: 'Network', value: 'Trusted' },
  /** Session attribute and value meaning a managed device. */
  managedDevice: { attribute: 'Device', value: 'Managed' },
};

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function plural(value: string): string {
  return value.endsWith('s') ? value : `${value}s`;
}

function findUserValue(
  attributes: InventoryAttribute[],
  pattern: RegExp,
  exclude?: string,
): RuleUse | null {
  for (const a of attributes) {
    if (a.source !== 'user' || a.type === 'text' || a.name === exclude)
      continue;
    const value = a.values.find((v) => pattern.test(v));
    if (value) return { attribute: a.name, value };
  }
  return null;
}

function findSessionValue(
  attributes: InventoryAttribute[],
  match: { attribute: string; value: string },
): RuleUse | null {
  const a = attributes.find(
    (x) => x.source === 'session' && x.name === match.attribute,
  );
  return a && a.values.includes(match.value)
    ? { attribute: a.name, value: match.value }
    : null;
}

const MEMBERS = 'Members';

/** Every starting rule this server's attributes can fully support, in display order. */
export function generateStartingRules(
  attributes: InventoryAttribute[],
): StartingRule[] {
  const rules: StartingRule[] = [];

  // "Same <Attribute> only" for each select / multiselect attribute that groups people.
  for (const a of attributes) {
    if (a.source !== 'user' || !a.groupsPeople || a.type === 'text') continue;
    const attribute = a.name as UserAttributeKey;
    const name = `Same ${a.name} only`;
    rules.push({
      id: `same-${slug(a.name)}`,
      name,
      description: `People can start and post in direct messages only with people who have the same ${a.name}.`,
      tags: ['Start', 'Write', SUMMARY.tagBothWays],
      uses: [{ attribute: a.name }],
      build: () => ({
        name,
        role: MEMBERS,
        permissions: ['start', 'post'],
        acting: [],
        other: [
          {
            id: nextConditionId(),
            attribute,
            operator: 'is',
            value: { kind: 'same' },
          },
        ],
        match: 'all',
      }),
    });
  }

  const contractor = findUserValue(
    attributes,
    TEMPLATE_MATCHING.contractorValue,
  );
  if (contractor?.value) {
    const who = plural(contractor.value);
    const name = `${who} can't start DMs`;
    rules.push({
      id: 'contractors-no-start',
      name,
      description: `${who} can reply in existing conversations but can't start new ones.`,
      tags: ['Start', SUMMARY.tagActingOnly],
      uses: [contractor],
      build: () => ({
        name,
        role: MEMBERS,
        permissions: ['start'],
        acting: [
          {
            id: nextConditionId(),
            attribute: contractor.attribute as UserAttributeKey,
            operator: 'is not',
            value: contractor.value as string,
          },
        ],
        other: [],
        match: 'all',
      }),
    });

    const lead = findUserValue(
      attributes,
      TEMPLATE_MATCHING.leadValue,
      contractor.attribute,
    );
    if (lead?.value) {
      // Attribute values are proper nouns only at the start of a sentence.
      const leads = plural(lead.value).toLowerCase();
      const Leads = leads.charAt(0).toUpperCase() + leads.slice(1);
      const leadName = `${who} can't start DMs with ${leads}`;
      rules.push({
        id: 'contractors-no-leads',
        name: leadName,
        description: `${who} can't start a conversation with ${leads}. ${Leads} can still start one with them.`,
        tags: ['Start', SUMMARY.tagOneWay],
        uses: [contractor, lead],
        build: () => ({
          name: leadName,
          role: MEMBERS,
          permissions: ['start'],
          acting: [
            {
              id: nextConditionId(),
              attribute: contractor.attribute as UserAttributeKey,
              operator: 'is not',
              value: contractor.value as string,
            },
          ],
          other: [
            {
              id: nextConditionId(),
              attribute: lead.attribute as UserAttributeKey,
              operator: 'is not',
              value: { kind: 'fixed', value: lead.value as string },
            },
          ],
          // One join for the table: allowed when either side passes.
          match: 'any',
        }),
      });
    }
  }

  const network = findSessionValue(
    attributes,
    TEMPLATE_MATCHING.trustedNetwork,
  );
  if (network) {
    const name = 'No posting from untrusted networks';
    rules.push({
      id: 'untrusted-no-post',
      name,
      description:
        "On an untrusted network, people can read direct messages but can't post.",
      tags: ['Write', 'Session rule'],
      uses: [network],
      build: () => ({
        name,
        role: MEMBERS,
        permissions: ['post'],
        acting: [
          {
            id: nextConditionId(),
            attribute: network.attribute as SessionAttributeKey,
            operator: 'is',
            value: network.value as string,
          },
        ],
        other: [],
        match: 'all',
      }),
    });
  }

  const device = findSessionValue(attributes, TEMPLATE_MATCHING.managedDevice);
  if (device) {
    const name = "Unmanaged devices can't see DMs";
    rules.push({
      id: 'untrusted-no-view',
      name,
      description: 'Direct and group messages are hidden on unmanaged devices.',
      tags: ['Read', 'Session rule'],
      uses: [device],
      build: () => ({
        name,
        role: MEMBERS,
        permissions: ['view'],
        acting: [
          {
            id: nextConditionId(),
            attribute: device.attribute as SessionAttributeKey,
            operator: 'is',
            value: device.value as string,
          },
        ],
        other: [],
        match: 'all',
      }),
    });
  }

  return rules;
}

/** Rules for the fully set-up demo server: the end-user scenes and Simulate use these. */
export const FULL_SERVER_RULES = generateStartingRules(
  ATTRIBUTE_INVENTORIES.full.attributes,
);

export function ruleById(id: string): StartingRule {
  const rule = FULL_SERVER_RULES.find((r) => r.id === id);
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
].map((id) => ruleById(id).build());

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
  other: Person | null,
): ConditionResult {
  if (c.compareTo) {
    const mine = acting.attributes[c.attribute as UserAttributeKey];
    const theirs = other?.attributes[c.compareTo];
    if (mine === undefined || theirs === undefined) {
      return 'missing';
    }
    return compare(mine, c.operator, theirs);
  }
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
    const mine = acting.attributes[c.value.attribute ?? c.attribute];
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
  // A user row compared with the recipient is a recipient condition too.
  const actingRows = other
    ? policy.acting
    : policy.acting.filter((c) => !c.compareTo);
  const actingResults = actingRows.map((c) =>
    actingResult(c, acting, ctx, other),
  );
  const otherResults = other
    ? policy.other.map((c) => otherResult(c, acting, other))
    : [];
  const targetResults = [
    ...otherResults,
    ...actingRows
      .filter((c) => c.compareTo)
      .map((c) => actingResult(c, acting, ctx, other)),
  ];
  const all = [...actingResults, ...otherResults];
  if (all.length === 0) {
    return { allowed: true, missingTarget: false };
  }
  const allowed =
    policy.match === 'all'
      ? all.every((r) => r === 'pass')
      : all.some((r) => r === 'pass');
  const missingTarget = !allowed && targetResults.includes('missing');
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
      return `Write requires Read · ${layer.name}`;
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

/** Equality is symmetric: either row direction reads the same. */
function comparisonClause(
  userAttr: string,
  targetAttr: string,
  operator: Operator,
): string {
  if (userAttr === targetAttr) {
    return operator === 'is'
      ? SUMMARY.targetMatches(targetAttr)
      : SUMMARY.targetDiffers(targetAttr);
  }
  return operator === 'is'
    ? SUMMARY.crossMatches(userAttr, targetAttr)
    : SUMMARY.crossDiffers(userAttr, targetAttr);
}

function actingClause(c: ActingCondition): string {
  if (c.compareTo) {
    return comparisonClause(c.attribute, c.compareTo, c.operator);
  }
  return SUMMARY.actingIs(c.attribute, c.operator, c.value);
}

function otherClause(c: OtherCondition): string {
  if (c.value.kind === 'same') {
    return comparisonClause(
      c.value.attribute ?? c.attribute,
      c.attribute,
      c.operator,
    );
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

  // Same-named "is same as" comparisons, from either side, read as "matches theirs".
  const sameNamedMatch = [
    ...policy.other.map((c) =>
      c.value.kind === 'same' &&
      c.operator === 'is' &&
      (c.value.attribute ?? c.attribute) === c.attribute
        ? c.attribute
        : null,
    ),
    ...policy.acting.map((c) =>
      c.compareTo && c.operator === 'is' && c.compareTo === c.attribute
        ? c.attribute
        : null,
    ),
  ];
  const onlySameMatch =
    sameNamedMatch.length > 0 && sameNamedMatch.every(Boolean);

  if (onlySameMatch && policy.match === 'all') {
    const attrs = Array.from(new Set(sameNamedMatch)).join(' and ');
    return {
      sentence: SUMMARY.onlyWithMatching(who, perm, attrs),
      direction: 'both',
    };
  }

  const allNegatedFixed =
    policy.match === 'any' &&
    policy.acting.length > 0 &&
    policy.other.length > 0 &&
    policy.acting.every((c) => c.operator === 'is not' && !c.compareTo) &&
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
  const hasTarget = hasRecipientConditions(policy);
  if (!hasTarget) {
    return {
      sentence: `${SUMMARY.onlyWhen(who, perm, clauses)}${sessionNote}`,
      direction: 'acting',
    };
  }
  const oneWay =
    policy.other.some(
      (c) =>
        c.value.kind === 'fixed' ||
        (c.value.attribute ?? c.attribute) !== c.attribute,
    ) ||
    policy.acting.some(
      (c) =>
        (!isSessionAttribute(c.attribute) && !c.compareTo) ||
        (c.compareTo && c.compareTo !== c.attribute),
    );
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
  if (c.compareTo) {
    return `user.attributes.${celName(c.attribute)} ${c.operator === 'is' ? '==' : '!='} target.attributes.${celName(c.compareTo)}`;
  }
  const ref = isSessionAttribute(c.attribute)
    ? `user.session.${celName(c.attribute)}`
    : `user.attributes.${celName(c.attribute)}`;
  return `${ref} ${c.operator === 'is' ? '==' : '!='} "${c.value}"`;
}

function otherCel(c: OtherCondition): string {
  const op = c.operator === 'is' ? '==' : '!=';
  const target = `target.attributes.${celName(c.attribute)}`;
  return c.value.kind === 'same'
    ? `${target} ${op} user.attributes.${celName(c.value.attribute ?? c.attribute)}`
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
 * Shipped Simple mode joins every row with AND
 * (admin.access_control.table_editor.help_text). This prototype adds one
 * All / Any join for the whole table (draft).
 */
export function isSimpleExpressible(policy: DmPolicy): boolean {
  // Simple mode now offers one All / Any join for the whole table (draft), so
  // every policy this model can hold is expressible. Mixed AND/OR grouping is
  // out of scope; such an expression would get the shipped "Complex expression
  // detected" treatment in InlineConditions.
  return policy.match === 'all' || policy.match === 'any';
}
