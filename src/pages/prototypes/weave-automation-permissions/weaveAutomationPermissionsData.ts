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

/* ------------------------------------------------------------------ Steps */

export type Step = { id: string; label: string };
export type StepCategory = { id: string; label: string; steps: Step[] };

function steps(prefix: string, labels: string[]): Step[] {
  return labels.map((label) => ({
    id: `${prefix}_${label.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
    label,
  }));
}

export const STEP_CATEGORIES: StepCategory[] = [
  {
    id: 'triggers',
    label: 'Triggers',
    steps: steps('trigger', [
      'Message posted',
      'Message edited',
      'Message deleted',
      'Reaction added',
      'Reaction removed',
      'Thread reply posted',
      'File uploaded',
      'User joined channel',
      'User left channel',
      'User joined team',
      'User left team',
      'Channel created',
      'Channel archived',
      'Channel header changed',
      'Schedule',
      'Slash command',
      'Manual run',
      'Message action',
      'Post menu action',
      'Dialog submitted',
      'Webhook received',
      'Playbook run started',
      'Playbook run finished',
      'Checklist item completed',
      'Status update posted',
      'Keyword mentioned',
    ]),
  },
  {
    id: 'flow',
    label: 'Flow',
    steps: steps('node', [
      'Condition',
      'Switch',
      'Transform',
      'Wait',
      'Loop',
      'Stop',
      'Run automation',
    ]),
  },
  {
    id: 'channels',
    label: 'Channels',
    steps: steps('node', [
      'Get channel',
      'Create channel',
      'Rename channel',
      'Archive channel',
      'Add channel member',
      'Remove channel member',
      'Set channel header',
      'Set channel purpose',
    ]),
  },
  {
    id: 'users-teams',
    label: 'Users & teams',
    steps: steps('node', [
      'Get user',
      'Find users',
      'Get user attributes',
      'Add team member',
      'Remove team member',
      'Set user status',
      'Get team',
      'Update user roles',
    ]),
  },
  {
    id: 'posts',
    label: 'Posts',
    steps: steps('node', [
      'Post message',
      'Reply in thread',
      'Update post',
      'Delete post',
      'Get posts',
      'Add reaction',
      'Pin post',
      'Send direct message',
      'Send ephemeral message',
      'Mention user',
    ]),
  },
  {
    id: 'blocking',
    label: 'Blocking',
    steps: steps('trigger', ['Message will be posted']),
  },
  {
    id: 'interactive',
    label: 'Interactive',
    steps: steps('node', ['Open dialog']),
  },
  {
    id: 'stored-state',
    label: 'Stored state',
    steps: steps('node', [
      'Get value',
      'Set value',
      'Delete value',
      'Increment counter',
      'Get list',
      'Append to list',
    ]),
  },
  {
    id: 'integrations',
    label: 'Integrations',
    steps: steps('node', ['HTTP request', 'Call plugin']),
  },
  {
    id: 'ai',
    label: 'AI',
    steps: steps('node', ['AI completion', 'AI summarize', 'AI classify']),
  },
  {
    id: 'playbooks',
    label: 'Playbooks',
    steps: steps('node', [
      'Start playbook run',
      'Finish playbook run',
      'Update run status',
      'Check off item',
      'Assign item',
      'Add timeline event',
    ]),
  },
  {
    id: 'legacy',
    label: 'Legacy',
    steps: steps('node', ['Legacy webhook']),
  },
];

/** Steps added by a Weave upgrade since the policy was last saved. */
export const NEW_STEPS: { categoryId: string; step: Step }[] = [
  { categoryId: 'posts', step: { id: 'node_send_email', label: 'Send email' } },
  {
    categoryId: 'ai',
    step: { id: 'node_translate_text', label: 'Translate text' },
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

export const ALL_STEP_IDS = catalogWithNewSteps().flatMap((c) =>
  c.steps.map((s) => s.id),
);

function categorySteps(...ids: string[]): string[] {
  return STEP_CATEGORIES.filter((c) => ids.includes(c.id)).flatMap((c) =>
    c.steps.map((s) => s.id),
  );
}

/** Shared steps: everything except Integrations, Blocking, AI and Legacy. */
export const INITIAL_SHARED_STEPS: string[] = categorySteps(
  'triggers',
  'flow',
  'channels',
  'users-teams',
  'posts',
  'interactive',
  'stored-state',
  'playbooks',
);

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

const FIRST = [
  'Aiko',
  'Arjun',
  'Danielle',
  'Darius',
  'David',
  'Emma',
  'Ethan',
  'Isabella',
  'Leila',
  'Leonard',
  'Lukas',
  'Marco',
  'Sofia',
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
];
const LAST = [
  'Tan',
  'Patel',
  'Okoro',
  'Cole',
  'Liang',
  'Novak',
  'Brooks',
  'Cruz',
  'Haddad',
  'Riley',
  'Meyer',
  'Rinaldi',
  'Bauer',
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
];
const AVATARS = [
  avatarAiko,
  avatarArjun,
  avatarDanielle,
  avatarDarius,
  avatarDavid,
  avatarEmma,
  avatarEthan,
  avatarIsabella,
  avatarLeila,
  avatarLeonard,
  avatarLukas,
  avatarMarco,
  avatarSofia,
];
const DEPARTMENTS = [
  'engineering',
  'Platform',
  'IT',
  'Sales',
  'Support',
  'engineering',
  'Design',
];

/** 46 deterministic fake people, so counts and previews are consistent. */
export const PEOPLE: Person[] = Array.from({ length: 46 }, (_, i) => {
  const first = FIRST[i % FIRST.length];
  const last = LAST[(i * 7 + 3) % LAST.length];
  return {
    id: `u${i}`,
    name: `${first} ${last}`,
    username: `${first}.${last}`.toLowerCase(),
    avatar: i < AVATARS.length ? AVATARS[i] : undefined,
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

export type PermissionGroup = {
  id: string;
  name: string;
  mode: WhoMode;
  conditions: Condition[];
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
    members: [],
    extraSteps: [],
  },
  {
    id: 'platform-team',
    name: 'Platform team',
    mode: 'members',
    conditions: [],
    members: ['g-platform-leads', 'u3', 'u40'],
    extraSteps: [...categorySteps('integrations'), ...categorySteps('ai')],
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
    members: [],
    extraSteps: categorySteps('blocking'),
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
    if (group.conditions.length === 0) return [];
    return PEOPLE.filter((p) =>
      group.conditions.every(
        (c) => c.values.length === 0 || matchesCondition(p, c),
      ),
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
      .join(' and ');
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

export function toExpression(conditions: Condition[]): string {
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
    .join(' && ');
}

/**
 * Plain-language summary of a set of steps against the catalog: name whole
 * categories, and fall back to step names when a category is partly granted.
 */
export function describeSteps(
  stepIds: string[],
  catalog: StepCategory[],
  mode: 'all' | 'extra',
): string {
  const set = new Set(stepIds);
  const granted: string[] = [];
  const missing: string[] = [];
  for (const cat of catalog) {
    const have = cat.steps.filter((s) => set.has(s.id));
    if (have.length === cat.steps.length) granted.push(cat.label);
    else if (have.length === 0) missing.push(cat.label);
    else {
      granted.push(...have.map((s) => s.label));
      missing.push(
        ...cat.steps.filter((s) => !set.has(s.id)).map((s) => s.label),
      );
    }
  }
  if (set.size === 0) return mode === 'extra' ? 'None' : 'No steps';
  if (missing.length === 0) return 'All steps';
  if (mode === 'all' && missing.length <= 6) {
    return `All steps except ${joinList(missing)}`;
  }
  return joinList(granted);
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}
