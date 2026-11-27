/*
 * Mock data for the Weave automation permissions prototype.
 * Step names follow the trigger and node catalog in the engineering spec, but
 * the list itself is a stand-in: replace it with the real catalog.
 */
import avatarAiko from '@/assets/avatars/Aiko Tan.png';
import avatarArjun from '@/assets/avatars/Arjun Patel.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarDarius from '@/assets/avatars/Darius Cole.png';
import avatarDavid from '@/assets/avatars/David Liang.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarEthan from '@/assets/avatars/Ethan Brooks.png';
import avatarIsabella from '@/assets/avatars/Isabella Cruz.png';
import avatarLeila from '@/assets/avatars/Leila Haddad.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarLukas from '@/assets/avatars/Lukas Meyer.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import { WEAVE_CATALOG } from './weaveCatalog';

/* ------------------------------------------------------------------ Steps */

export type Step = {
  id: string;
  type: string;
  label: string;
  /** Sub-heading the picker lists this step under, within its category. */
  group?: string;
};
export type StepCategory = { id: string; label: string; steps: Step[] };

const TRIGGER_GROUPS: Record<string, string[]> = {
  'Messages and channels': [
    'message_posted',
    'message_updated',
    'message_deleted',
    'channel_created',
    'user_joined_channel',
    'user_left_channel',
    'reaction_added',
    'reaction_removed',
    'message_action',
    'post_menu_action',
  ],
  'Users & teams': ['user_joined_team', 'user_left_team', 'user_created'],
  'Run by a person': ['slash_command', 'dialog_submitted', 'manual'],
  'Schedule & external': ['schedule', 'webhook', 'plugin_event'],
};

/** One-line explainers shown under a sub-heading in the step picker. */
export const STEP_GROUP_NOTES: Record<string, string> = {
  'Blocking hooks':
    'These run before the action completes and can stop it, such as holding a message until the automation approves it. Grant them with care.',
};

/** The plugin's real catalog (see weaveCatalog.ts). */
// The plugin has several one-step categories (Blocking, Interactive, Legacy).
// A category of one is odd to expand, so each is listed under a related one.
// Step ids don't change.
const MERGE_INTO: Record<string, string> = {
  blocking: 'flow', // Decision is flow control
  interactive: 'flow', // Open dialog pauses a flow for a person, like Decision
  legacy: 'integrations', // Mattermost action (legacy) is an API call
};

export const STEP_CATEGORIES: StepCategory[] = WEAVE_CATALOG.filter(
  (cat) => !(cat.id in MERGE_INTO),
).map((cat) => {
  const merged = WEAVE_CATALOG.filter(
    (c) => MERGE_INTO[c.id] === cat.id,
  ).flatMap((c) => c.steps);
  const steps = [...cat.steps, ...merged];
  if (cat.id === 'triggers') {
    return {
      ...cat,
      steps: steps.map((st) => ({
        ...st,
        group: triggerGroup(st.type),
        label: st.label.replace(' (blocking)', ''),
      })),
    };
  }
  return { ...cat, steps };
});

/** Sub-heading for a trigger. Blocking hooks are the `*_will_be_*` triggers. */
function triggerGroup(type: string): string | undefined {
  if (type.includes('_will_be_')) return 'Blocking hooks';
  return Object.keys(TRIGGER_GROUPS).find((g) =>
    TRIGGER_GROUPS[g].includes(type),
  );
}

/**
 * Steps added by a Weave upgrade since the policy was last saved. Stand-ins
 * for the plugin event bus actions: not in the real catalog yet.
 */
export const NEW_STEPS: { categoryId: string; step: Step }[] = [
  {
    categoryId: 'triggers',
    step: {
      id: 'trigger_plugin_event',
      type: 'plugin_event',
      label: 'Plugin event',
      group: 'Schedule & external',
    },
  },
  {
    categoryId: 'ai',
    step: {
      id: 'node_ai_translate',
      type: 'ai_translate',
      label: 'AI translate',
    },
  },
];

export function catalogWithNewSteps(): StepCategory[] {
  return STEP_CATEGORIES.map((cat) => ({
    ...cat,
    steps: [
      ...cat.steps,
      ...NEW_STEPS.filter((n) => n.categoryId === cat.id).map((n) => n.step),
    ],
  }));
}

function categorySteps(...ids: string[]): string[] {
  return STEP_CATEGORIES.filter((c) => ids.includes(c.id)).flatMap((c) =>
    c.steps.map((s) => s.id),
  );
}

const BLOCKING_TRIGGERS = STEP_CATEGORIES.find((c) => c.id === 'triggers')!
  .steps.filter((s) => s.group === 'Blocking hooks')
  .map((s) => s.id);

/**
 * Shared steps, after the spec's example "All team builders" rule: every
 * non-blocking trigger and the everyday groups. Blocking hooks, webhooks,
 * HTTP, AI, legacy and role changes are left for specific groups.
 */
export const INITIAL_SHARED_STEPS: string[] = [
  ...categorySteps('triggers').filter(
    (id) => !BLOCKING_TRIGGERS.includes(id) && id !== 'trigger_webhook',
  ),
  ...categorySteps(
    'flow',
    'channels',
    'users-teams',
    'posts',
    'stored-state',
    'playbooks',
  ).filter(
    // Role changes and Decision (which can hold or reject actions) are granted
    // to specific groups, not everyone.
    (id) => id !== 'node_update_user_roles' && id !== 'node_decision',
  ),
];

/* ------------------------------------------------------------ Attributes */

export type AttributeKey = 'weave_builder' | 'Department' | 'weave_access';

export const ATTRIBUTES: {
  key: AttributeKey;
  label: string;
  kind: 'select' | 'multiselect' | 'text';
  values: string[];
}[] = [
  {
    key: 'weave_builder',
    label: 'weave_builder',
    kind: 'select',
    values: ['Yes', 'No'],
  },
  {
    key: 'Department',
    label: 'Department',
    kind: 'text',
    values: ['engineering', 'Platform', 'IT', 'Sales', 'Support', 'Design'],
  },
  {
    key: 'weave_access',
    label: 'weave_access',
    kind: 'multiselect',
    values: ['moderation', 'integrations'],
  },
];

/* ----------------------------------------------------------------- People */

export type Person = {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  attributes: Record<AttributeKey, string | string[]>;
};

// People with avatars keep the names their pictures are filed under, so they
// match the automations and agents prototypes. The rest are generated.
const NAMED: [string, string][] = [
  ['Danielle Okoro', avatarDanielle],
  ['Ethan Brooks', avatarEthan],
  ['Sofia Bauer', avatarSofia],
  ['Darius Cole', avatarDarius],
  ['Aiko Tan', avatarAiko],
  ['Emma Novak', avatarEmma],
  ['Arjun Patel', avatarArjun],
  ['David Liang', avatarDavid],
  ['Isabella Cruz', avatarIsabella],
  ['Leila Haddad', avatarLeila],
  ['Leonard Riley', avatarLeonard],
  ['Lukas Meyer', avatarLukas],
  ['Marco Rinaldi', avatarMarco],
];
const FIRST = [
  'Nina',
  'Omar',
  'Priya',
  'Quinn',
  'Rosa',
  'Sam',
  'Tariq',
  'Uma',
  'Victor',
  'Wen',
  'Yara',
];
const LAST = [
  'Kim',
  'Farah',
  'Shah',
  'Lopez',
  'Moreau',
  'Ito',
  'Hassan',
  'Rao',
  'Alvarez',
  'Chen',
  'Novak',
  'Brandt',
];
const DEPARTMENTS = [
  'engineering',
  'Platform',
  'IT',
  'Sales',
  'Support',
  'engineering',
  'Security',
];

/** 46 deterministic fake people, so counts and previews are consistent. */
export const PEOPLE: Person[] = Array.from({ length: 46 }, (_, i) => {
  const named = NAMED[i];
  const name = named
    ? named[0]
    : `${FIRST[i % FIRST.length]} ${LAST[(i * 5 + 1) % LAST.length]}`;
  return {
    id: `u${i}`,
    name,
    username: name.toLowerCase().replace(' ', '.'),
    avatar: named?.[1],
    attributes: {
      weave_builder: i < 31 ? 'Yes' : 'No',
      Department: DEPARTMENTS[i % DEPARTMENTS.length],
      weave_access: i % 8 === 0 ? ['moderation'] : [],
    },
  };
});

export type UserGroup = { id: string; name: string; memberIds: string[] };

export const USER_GROUPS: UserGroup[] = [
  {
    id: 'g-platform-leads',
    name: 'Platform Leads',
    memberIds: ['u1', 'u8', 'u15', 'u22', 'u29', 'u36', 'u43'],
  },
  {
    id: 'g-it-admins',
    name: 'IT Admins',
    memberIds: ['u2', 'u9', 'u16', 'u23'],
  },
  {
    id: 'g-support-oncall',
    name: 'Support On-call',
    memberIds: ['u4', 'u11', 'u18'],
  },
];

/* ----------------------------------------------------------------- Groups */

export type Operator = 'is' | 'is-not' | 'in';

export type Condition = {
  id: string;
  attribute: AttributeKey;
  operator: Operator;
  values: string[];
};

export type WhoMode = 'members' | 'attributes';

/** How conditions combine: every one (AND) or any one (OR). */
export type MatchMode = 'all' | 'any';

export type PermissionGroup = {
  id: string;
  name: string;
  mode: WhoMode;
  conditions: Condition[];
  match: MatchMode;
  /** User ids and user group ids, for `mode: 'members'`. */
  members: string[];
  extraSteps: string[];
};

export const INITIAL_GROUPS: PermissionGroup[] = [
  {
    id: 'pilot-users',
    name: 'Pilot users',
    mode: 'attributes',
    conditions: [
      { id: 'c1', attribute: 'weave_builder', operator: 'is', values: ['Yes'] },
    ],
    match: 'all',
    members: [],
    extraSteps: [],
  },
  {
    id: 'platform-team',
    name: 'Platform team',
    mode: 'members',
    conditions: [],
    match: 'all',
    members: ['g-platform-leads', 'u3', 'u40'],
    extraSteps: [
      'trigger_webhook',
      // The original Integrations and AI categories, before they were merged.
      ...WEAVE_CATALOG.filter((c) => ['integrations', 'ai'].includes(c.id))
        .flatMap((c) => c.steps)
        .map((st) => st.id),
    ],
  },
  {
    id: 'moderators',
    name: 'Moderators',
    mode: 'attributes',
    conditions: [
      { id: 'c2', attribute: 'weave_builder', operator: 'is', values: ['Yes'] },
      {
        id: 'c3',
        attribute: 'weave_access',
        operator: 'in',
        values: ['moderation'],
      },
    ],
    match: 'all',
    members: [],
    extraSteps: [
      'trigger_message_will_be_posted',
      'trigger_file_will_be_uploaded',
      'node_decision',
    ],
  },
  {
    id: 'engineering-ai',
    name: 'Engineering AI',
    mode: 'attributes',
    conditions: [
      { id: 'c4', attribute: 'weave_builder', operator: 'is', values: ['Yes'] },
      {
        id: 'c5',
        attribute: 'Department',
        operator: 'is',
        values: ['engineering'],
      },
    ],
    match: 'all',
    members: [],
    extraSteps: categorySteps('ai'),
  },
];

/* ---------------------------------------------------------------- Helpers */

function matchesCondition(person: Person, c: Condition): boolean {
  const raw = person.attributes[c.attribute];
  const have = Array.isArray(raw) ? raw : [raw];
  const hit = c.values.some((v) => have.includes(v));
  return c.operator === 'is-not' ? !hit : hit;
}

export function peopleInGroup(group: PermissionGroup): Person[] {
  if (group.mode === 'attributes') {
    const active = group.conditions.filter((c) => c.values.length > 0);
    if (active.length === 0) return [];
    return PEOPLE.filter((p) =>
      group.match === 'any'
        ? active.some((c) => matchesCondition(p, c))
        : active.every((c) => matchesCondition(p, c)),
    );
  }
  const ids = new Set<string>();
  for (const m of group.members) {
    const ug = USER_GROUPS.find((g) => g.id === m);
    if (ug) ug.memberIds.forEach((id) => ids.add(id));
    else ids.add(m);
  }
  return PEOPLE.filter((p) => ids.has(p.id));
}

export function peopleInAnyGroup(groups: PermissionGroup[]): Person[] {
  const ids = new Set(groups.flatMap((g) => peopleInGroup(g).map((p) => p.id)));
  return PEOPLE.filter((p) => ids.has(p.id));
}

const OPERATOR_TEXT: Record<Operator, string> = {
  is: 'is',
  'is-not': 'is not',
  in: 'includes',
};

export function describeWho(group: PermissionGroup): string {
  if (group.mode === 'attributes') {
    if (group.conditions.length === 0) return 'No conditions yet';
    return group.conditions
      .map(
        (c) =>
          `${c.attribute} ${OPERATOR_TEXT[c.operator]} ${c.values.join(' or ') || '…'}`,
      )
      .join(group.match === 'any' ? ' or ' : ' and ');
  }
  if (group.members.length === 0) return 'No one yet';
  return group.members
    .map((m) => {
      const ug = USER_GROUPS.find((g) => g.id === m);
      if (ug) return `${ug.name} (user group)`;
      const p = PEOPLE.find((x) => x.id === m);
      return p ? `@${p.username}` : m;
    })
    .join(', ');
}

export function toExpression(
  conditions: Condition[],
  match: MatchMode = 'all',
): string {
  if (conditions.length === 0) return 'false';
  return conditions
    .map((c) => {
      const attr = `user.attributes.${c.attribute}`;
      if (c.operator === 'in')
        return `${JSON.stringify(c.values[0] ?? '')} in ${attr}`;
      if (c.values.length > 1) {
        const list = `[${c.values.map((v) => JSON.stringify(v)).join(', ')}]`;
        return c.operator === 'is-not'
          ? `!(${attr} in ${list})`
          : `${attr} in ${list}`;
      }
      return `${attr} ${c.operator === 'is-not' ? '!=' : '=='} ${JSON.stringify(c.values[0] ?? '')}`;
    })
    .join(match === 'any' ? ' || ' : ' && ');
}

/**
 * Plain-language summary of a set of steps against the catalog. Short lists
 * name the steps; longer ones name whole groups and the groups that are only
 * partly granted.
 */
export function describeSteps(
  stepIds: string[],
  catalog: StepCategory[],
  mode: 'all' | 'extra',
): string {
  const set = new Set(stepIds);
  if (set.size === 0) return mode === 'extra' ? 'None' : 'No steps';

  const full: string[] = [];
  const partial: string[] = [];
  const names: string[] = [];
  for (const cat of catalog) {
    const have = cat.steps.filter((s) => set.has(s.id));
    names.push(...have.map((s) => s.label));
    if (have.length === cat.steps.length) full.push(cat.label);
    else if (have.length > 0) partial.push(cat.label);
  }
  if (names.length <= 4) return joinList(names);
  if (partial.length === 0) return joinList(full);
  const some = `some ${joinList(partial)} steps`;
  return full.length ? `${joinList(full)}, plus ${some}` : `Only ${some}`;
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}
