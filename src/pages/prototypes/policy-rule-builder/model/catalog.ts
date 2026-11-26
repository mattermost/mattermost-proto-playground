// [AI DRAFT] Attribute catalog for the rule grammar: which parties exist, and
// which attributes each one holds. Direction-agnostic: every direction's
// editor reads from here.
//
// A "party" is anything a rule can name on either side of an operator:
//   user       the acting user (who the policy applies to, set by the role)
//   session    the acting user's session (environmental attributes)
//   recipient  the other party: a person, bot or AI agent
//   channel / dm / file / post / team   resources the action touches.
//              Channels and direct or group messages are separate resources,
//              and only the one a policy's permissions use is offered
//              (round 2, M3; replaces the F1 relabel). Both are channels to
//              the engine (types O/P and D/G), so both are `resource.` in CEL
//              ([VERIFY WITH Eng] E-8).
//
// Attribute types follow the shipped table editor. Comparisons between two
// attributes need the same type and the same option list (`link`), as the
// shipped editor and server already require (`linked_field_id`).

export type ResourceKind = 'channel' | 'dm' | 'file' | 'post' | 'team';
export type PartyId = 'user' | 'session' | 'recipient' | ResourceKind;

export const RESOURCE_KINDS: ResourceKind[] = ['file', 'post', 'channel', 'dm', 'team'];

/**
 * Rule order (feedback F4): User → Recipient → resource. A comparison's
 * right side is always further along than its left, so each rule has one
 * spelling, as in the shipped editor (user attribute vs channel attribute).
 */
export const PARTY_RANK: Record<PartyId, number> = {
  user: 0,
  session: 0,
  recipient: 1,
  file: 2,
  post: 3,
  channel: 4,
  dm: 4,
  team: 5,
};

export function isResource(party: PartyId): party is ResourceKind {
  return (RESOURCE_KINDS as string[]).includes(party);
}

export type AttrType =
  | 'select'
  | 'multiselect'
  | 'ranked'
  | 'text'
  | 'number'
  | 'account';

export interface AttributeDef {
  /** CEL-safe identifier. */
  id: string;
  label: string;
  type: AttrType;
  /** Options. Ranked options run lowest to highest. Empty for number/text. */
  values: string[];
  /** Shared option list. Two attributes can be compared only when this matches. */
  link?: string;
  /** Built in, not defined in Attribute Management (written without `.attributes`). */
  native?: boolean;
  /** CEL literal for each option, when it differs from the label. */
  celValues?: Record<string, string>;
  /** Engineering or PM dependency, named in reviewer notes (never in product UI). */
  dependency?: string;
  /** Which accounts hold it. Unset = people and bots alike. */
  appliesTo?: ('person' | 'bot')[];
}

export const PROGRAMS = ['Ashgrove', 'Corvane'];
export const CLASSIFICATION_SCALE = [
  'Unclassified',
  'Confidential',
  'Secret',
  'Top Secret',
];

const program: AttributeDef = {
  id: 'program',
  label: 'Program',
  type: 'select',
  values: PROGRAMS,
  link: 'program',
};

const clearance: AttributeDef = {
  id: 'clearance',
  label: 'Clearance',
  type: 'ranked',
  values: CLASSIFICATION_SCALE,
  link: 'classification-scale',
};

const classification: AttributeDef = {
  id: 'classification',
  label: 'Classification',
  type: 'ranked',
  values: CLASSIFICATION_SCALE,
  link: 'classification-scale',
};

/** User attributes. People, bots and agents can all hold them. */
export const PERSON_ATTRIBUTES: AttributeDef[] = [
  program,
  {
    id: 'employment_type',
    label: 'Employment type',
    type: 'select',
    values: ['Government civilian', 'Military', 'Contractor'],
    link: 'employment-type',
  },
  {
    id: 'position',
    label: 'Position',
    type: 'select',
    values: ['Program lead', 'Engineer', 'Analyst', 'Logistics officer'],
    link: 'position',
  },
  {
    id: 'company',
    label: 'Company',
    type: 'select',
    values: ['Talvane Systems', 'Orrin Analytics'],
    link: 'company',
  },
  clearance,
];

/**
 * Built-in account type, from the native is-bot flag (`isbot`). Offered on
 * the Recipient side only: the role picker decides the User side (D5-4). AI agents run as bot accounts today; an "AI agent" value waits
 * on P-1.
 */
export const ACCOUNT_TYPE: AttributeDef = {
  id: 'isbot',
  label: 'Account type',
  type: 'account',
  values: ['Person', 'Bot'],
  native: true,
  celValues: { Person: 'false', Bot: 'true' },
  dependency: 'P-1: AI agents are bot accounts until an agent account type exists',
};

export const SESSION_ATTRIBUTES: AttributeDef[] = [
  {
    id: 'network',
    label: 'Network',
    type: 'select',
    values: ['Trusted', 'Public'],
  },
  {
    id: 'device',
    label: 'Device',
    type: 'select',
    values: ['Managed', 'Unmanaged'],
  },
];

export const RESOURCE_ATTRIBUTES: Record<ResourceKind, AttributeDef[]> = {
  file: [
    { ...classification, dependency: 'E-2: file attributes' },
    { ...program, dependency: 'E-2: file attributes' },
    {
      id: 'sensitivity',
      label: 'Sensitivity',
      type: 'ranked',
      values: ['Low', 'Moderate', 'High'],
      link: 'sensitivity',
      dependency: 'E-2: file attributes',
    },
  ],
  post: [{ ...classification, dependency: 'E-2: post attributes in policies' }],
  channel: [{ ...classification }, { ...program }],
  // Not offered in the attribute menu (designer, 2026-10-31): a direct or
  // group message has no attributes of its own. Member count remains for the
  // large-group example only; it is a native field, not a comparable attribute.
  dm: [
    {
      id: 'member_count',
      label: 'Member count',
      type: 'number',
      values: [],
      native: true,
      dependency: 'E-4: native channel fields (member count) in policies',
    },
  ],
  team: [{ ...program, dependency: 'E-2: team attributes in policies' }],
};

/** Every attribute a party can hold, for lookups and parsing. */
export function allAttributesFor(party: PartyId): AttributeDef[] {
  switch (party) {
    case 'user':
      // The role already fixes the user's account type (D5-4).
      return PERSON_ATTRIBUTES;
    case 'session':
      return SESSION_ATTRIBUTES;
    case 'recipient':
      return [ACCOUNT_TYPE, ...PERSON_ATTRIBUTES];
    default:
      return RESOURCE_ATTRIBUTES[party];
  }
}

/**
 * Attributes offered in menus. On the User side, bot-only attributes appear
 * only when the policy applies to Bot accounts (cycle 1, UX-6): "User: Bot
 * kind" on a Members policy would deny every person.
 */
export function attributesFor(party: PartyId, role?: string): AttributeDef[] {
  const all = allAttributesFor(party);
  if (party !== 'user' || !role) return all;
  const kind = role === 'Bot accounts' ? 'bot' : 'person';
  return all.filter((a) => !a.appliesTo || a.appliesTo.includes(kind));
}

export function attributeDef(party: PartyId, id: string): AttributeDef {
  const found = allAttributesFor(party).find((a) => a.id === id);
  if (!found) {
    throw new Error(`Unknown attribute ${party}.${id}`);
  }
  return found;
}

export function findAttribute(
  party: PartyId,
  id: string,
): AttributeDef | undefined {
  return allAttributesFor(party).find((a) => a.id === id);
}
