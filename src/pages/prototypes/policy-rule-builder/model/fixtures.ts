// [AI DRAFT] Demo cast, resources and the five intake scenarios.
//
// Names, programs and companies are invented. The cast reuses the DM/GM v1
// people so reviewers recognise them; no one is shared with the Access
// Channel prototype. Bots and the AI agent hold attributes the same way users
// do (Bot accounts, designer 2026-10-28; bot-attributes prototype).
import avatarRyan from '@/assets/avatars/Danielle Okoro.png';
import avatarDarius from '@/assets/avatars/Darius Cole.png';
import avatarDavid from '@/assets/avatars/David Liang.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarEthan from '@/assets/avatars/Ethan Brooks.png';
import avatarIsabella from '@/assets/avatars/Isabella Cruz.png';
import avatarLeila from '@/assets/avatars/Leila Haddad.png';
import avatarLukas from '@/assets/avatars/Lukas Meyer.png';
import type { ResourceKind } from './catalog';
import {
  attr,
  group,
  rule,
  value,
  when,
  type Policy,
  type RuleNode,
} from './rules';

export type AccountType = 'Person' | 'Bot' | 'AI agent';

export interface Person {
  id: string;
  name: string;
  username: string;
  avatarSrc?: string;
  account: AccountType;
  title: string;
  /** Attribute values by attribute id. Missing = no value (fail-secure). */
  attributes: Record<string, string>;
  remoteServer?: string;
}

export interface SessionContext {
  network: string;
  device: string;
}

export const TRUSTED_SESSION: SessionContext = {
  network: 'Trusted',
  device: 'Managed',
};

export interface ResourceFixture {
  id: string;
  /** Channels and direct or group messages are separate kinds (round 2, M3). */
  kind: ResourceKind;
  name: string;
  attributes: Record<string, string>;
}

export const ADMIN = {
  name: 'Lukas Meyer',
  username: 'lukas.meyer',
  avatarSrc: avatarLukas,
};

export const DARIUS: Person = {
  id: 'darius',
  name: 'Darius Cole',
  username: 'darius.cole',
  avatarSrc: avatarDarius,
  account: 'Person',
  title: 'Systems engineer · Talvane Systems',
  attributes: {
    program: 'Ashgrove',
    employment_type: 'Contractor',
    position: 'Engineer',
    company: 'Talvane Systems',
    clearance: 'Secret',
  },
};

export const ETHAN: Person = {
  id: 'ethan',
  name: 'Ethan Brooks',
  username: 'ethan.brooks',
  avatarSrc: avatarEthan,
  account: 'Person',
  title: 'Logistics officer · Orrin Analytics',
  attributes: {
    program: 'Ashgrove',
    employment_type: 'Contractor',
    position: 'Logistics officer',
    company: 'Orrin Analytics',
    clearance: 'Confidential',
  },
};

export const ISABELLA: Person = {
  id: 'isabella',
  name: 'Isabella Cruz',
  username: 'isabella.cruz',
  avatarSrc: avatarIsabella,
  account: 'Person',
  title: 'Program lead, Ashgrove',
  attributes: {
    program: 'Ashgrove',
    employment_type: 'Government civilian',
    position: 'Program lead',
    clearance: 'Top Secret',
  },
};

export const DAVID: Person = {
  id: 'david',
  name: 'David Liang',
  username: 'david.liang',
  avatarSrc: avatarDavid,
  account: 'Person',
  title: 'Flight test analyst',
  attributes: {
    program: 'Ashgrove',
    employment_type: 'Military',
    position: 'Analyst',
    clearance: 'Secret',
  },
};

export const EMMA: Person = {
  id: 'emma',
  name: 'Emma Novak',
  username: 'emma.novak',
  avatarSrc: avatarEmma,
  account: 'Person',
  title: 'Requirements analyst, Corvane',
  attributes: {
    program: 'Corvane',
    employment_type: 'Government civilian',
    position: 'Analyst',
    clearance: 'Confidential',
  },
};

export const RYAN: Person = {
  id: 'ryan',
  name: 'Ryan Park',
  username: 'ryan.park',
  avatarSrc: avatarRyan,
  account: 'Person',
  title: 'Program lead, Corvane',
  attributes: {
    program: 'Corvane',
    employment_type: 'Military',
    position: 'Program lead',
    clearance: 'Top Secret',
  },
};

/** A user from a connected server. No attributes are held locally. */
export const LEILA: Person = {
  id: 'leila',
  name: 'Leila Haddad',
  username: 'leila.haddad',
  avatarSrc: avatarLeila,
  account: 'Person',
  title: 'Depot liaison · connected server',
  attributes: {},
  remoteServer: 'Sustainment Depot',
};

export const READINESS_BOT: Person = {
  id: 'readiness-bot',
  name: 'Readiness Alerts',
  username: 'readiness-alerts',
  account: 'Bot',
  title: 'Integration bot',
  attributes: {},
};

export const SCRAPER_BOT: Person = {
  id: 'feed-bot',
  name: 'Feed Relay',
  username: 'feed-relay',
  account: 'Bot',
  title: 'Integration bot',
  attributes: {},
};

export const MISSION_AGENT: Person = {
  id: 'mission-agent',
  name: 'Mission Assistant',
  username: 'mission-assistant',
  account: 'AI agent',
  title: 'AI agent',
  attributes: { program: 'Ashgrove', clearance: 'Secret' },
};

export const PEOPLE: Person[] = [
  DARIUS,
  ETHAN,
  ISABELLA,
  DAVID,
  EMMA,
  RYAN,
  LEILA,
  READINESS_BOT,
  SCRAPER_BOT,
  MISSION_AGENT,
];

export function personById(id: string): Person {
  const found = PEOPLE.find((p) => p.id === id);
  if (!found) throw new Error(`Unknown person ${id}`);
  return found;
}

/* ------------------------------------------------------------------ */
/* Resources                                                           */
/* ------------------------------------------------------------------ */

export const RESOURCES: ResourceFixture[] = [
  {
    id: 'dm',
    kind: 'dm',
    name: 'Direct message',
    attributes: { member_count: '2' },
  },
  {
    id: 'gm-small',
    kind: 'dm',
    name: 'Group message · 3 members',
    attributes: { member_count: '3' },
  },
  {
    // The group-with-bots scene: the user plus three recipients (UX3-5).
    id: 'gm-four',
    kind: 'dm',
    name: 'Group message · 4 members',
    attributes: { member_count: '4' },
  },
  {
    id: 'gm-large',
    kind: 'dm',
    name: 'Group message · 11 members',
    attributes: { member_count: '11' },
  },
  {
    id: 'file-secret',
    kind: 'file',
    name: 'Flight test plan rev C.pdf',
    attributes: { classification: 'Secret', program: 'Ashgrove' },
  },
  {
    id: 'file-ts',
    kind: 'file',
    name: 'Range threat assessment.pdf',
    attributes: { classification: 'Top Secret', program: 'Ashgrove' },
  },
  {
    id: 'file-unmarked',
    kind: 'file',
    name: 'Lunch roster.xlsx',
    attributes: {},
  },
  {
    id: 'post-secret',
    kind: 'post',
    name: 'Message marked Secret',
    attributes: { classification: 'Secret' },
  },
  {
    id: 'team-ashgrove',
    kind: 'team',
    name: 'Ashgrove program team',
    attributes: { program: 'Ashgrove' },
  },
  {
    id: 'channel-ashgrove',
    kind: 'channel',
    name: 'ashgrove-flight-test',
    attributes: { classification: 'Secret', program: 'Ashgrove' },
  },
];

export function resourceById(id: string): ResourceFixture {
  const found = RESOURCES.find((r) => r.id === id);
  if (!found) throw new Error(`Unknown resource ${id}`);
  return found;
}

/* ------------------------------------------------------------------ */
/* Intake scenarios (00-research-and-intake.md §8), per direction        */
/* ------------------------------------------------------------------ */

/** A′ "Extend in place" writes directional rules as an Any list; B′ as a When card. */
export type DirectionId = 'a' | 'b';

export type ScenarioId = 's1' | 's3' | 's4' | 's5';

const contractor = () =>
  rule({ party: 'user', attr: 'employment_type' }, 'eq', value('Contractor'));
const notContractor = () =>
  rule({ party: 'user', attr: 'employment_type' }, 'neq', value('Contractor'));
const recipientIsBot = () =>
  rule({ party: 'recipient', attr: 'isbot' }, 'eq', value('Bot'));

function policy(
  id: string,
  name: string,
  permissions: Policy['permissions'],
  join: 'all' | 'any',
  children: RuleNode[],
): Policy {
  return { id, name, role: 'Members', permissions, root: group(join, children) };
}

export const SCENARIO_BUILDERS: Record<ScenarioId, (d: DirectionId) => Policy> = {
  // S1: DM/GM only when both people share a Program (designer).
  s1: () =>
    policy('s1', 'Same program only', ['dm_create', 'dm_write'], 'all', [
      rule({ party: 'user', attr: 'program' }, 'eq', attr('recipient', 'program')),
    ]),
  // S3: contractors can start DMs with bots only (planning notes, 00:53:12).
  s3: (d) =>
    d === 'a'
      ? policy('s3', 'Contractors can message bots only', ['dm_create'], 'any', [
          notContractor(),
          recipientIsBot(),
        ])
      : policy('s3', 'Contractors can message bots only', ['dm_create'], 'all', [
          when([contractor()], group('all', [recipientIsBot()])),
        ]),
  // S4: no file sharing in group messages above 8 members (planning notes, 00:41:47).
  s4: () =>
    policy('s4', 'No file sharing in large group messages', ['dm_upload'], 'all', [
      rule({ party: 'dm', attr: 'member_count' }, 'lte', value('8')),
    ]),
  // S5: contractors from different companies can't message each other (00:47:33).
  s5: (d) =>
    d === 'a'
      ? policy('s5', 'Contractors message their own company only', ['dm_create', 'dm_write'], 'any', [
          notContractor(),
          rule({ party: 'recipient', attr: 'employment_type' }, 'neq', value('Contractor')),
          rule({ party: 'user', attr: 'company' }, 'eq', attr('recipient', 'company')),
        ])
      : policy('s5', 'Contractors message their own company only', ['dm_create', 'dm_write'], 'all', [
          when(
            [
              contractor(),
              rule({ party: 'recipient', attr: 'employment_type' }, 'eq', value('Contractor')),
            ],
            group('all', [
              rule({ party: 'user', attr: 'company' }, 'eq', attr('recipient', 'company')),
            ]),
          ),
        ]),
};

export function buildScenario(id: ScenarioId, d: DirectionId): Policy {
  return SCENARIO_BUILDERS[id](d);
}

export function blankPolicy(): Policy {
  return { id: 'blank', name: '', role: 'Members', permissions: [], root: group('all', []) };
}

/* ------------------------------------------------------------------ */
/* Impact counts for the pre-save warning (demo numbers)               */
/* ------------------------------------------------------------------ */

/** How many people or resources on this demo server have no value for an attribute. */
export const MISSING_COUNTS: Record<string, { count: number; noun: string }> = {
  'user.program': { count: 14, noun: 'people' },
  'recipient.program': { count: 14, noun: 'people' },
  'user.company': { count: 212, noun: 'people' },
  'recipient.company': { count: 212, noun: 'people' },
  'user.clearance': { count: 9, noun: 'people' },
  'recipient.clearance': { count: 9, noun: 'people' },
  'post.classification': { count: 48210, noun: 'posts' },
  'file.classification': { count: 1840, noun: 'files' },
  'file.program': { count: 2311, noun: 'files' },
  'channel.classification': { count: 37, noun: 'channels' },
  'channel.program': { count: 22, noun: 'channels' },
  'team.program': { count: 2, noun: 'teams' },
};
