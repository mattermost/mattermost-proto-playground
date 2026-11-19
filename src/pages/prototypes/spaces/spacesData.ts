/**
 * Story data for the Spaces prototype. People and the existing channels come
 * from the Cyber Defense HQ team in the compass-proto sample workspace; the
 * Space, its runs, tasks and pages are invented for this story (stand-in data).
 */
import ataylor from './assets/avatars/ataylor.png';
import jthomas from './assets/avatars/jthomas.png';
import kchegg from './assets/avatars/kchegg.png';
import mcruz from './assets/avatars/mcruz.png';
import amccall from './assets/avatars/amccall.png';
import hanas from './assets/avatars/hanas.png';
import hstevens from './assets/avatars/hstevens.png';
import wdaniel from './assets/avatars/wdaniel.png';
import admin from './assets/avatars/admin.png';
import aarthur from './assets/avatars/aarthur.png';
import rhull from './assets/avatars/rhull.png';
import areid from './assets/avatars/areid.png';
import threatAnalyzer from './assets/avatars/threat-analyzer-ai.png';
import playbooksBot from './assets/avatars/playbooks.png';

export type Health = 'nominal' | 'warning' | 'critical';

export interface Person {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isBot?: boolean;
}

export const PEOPLE: Record<string, Person> = {
  ataylor: {
    id: 'ataylor',
    name: 'Alex Taylor',
    role: 'Technical Program Manager',
    avatar: ataylor,
  },
  jthomas: {
    id: 'jthomas',
    name: 'Jackson Thomas',
    role: 'SOC Manager',
    avatar: jthomas,
  },
  kchegg: {
    id: 'kchegg',
    name: 'Koen Chegg',
    role: 'Threat Intelligence Analyst',
    avatar: kchegg,
  },
  mcruz: {
    id: 'mcruz',
    name: 'Mary Cruz',
    role: 'Incident Response Analyst',
    avatar: mcruz,
  },
  amccall: {
    id: 'amccall',
    name: 'Adam McCall',
    role: 'Tier 1 SOC Analyst',
    avatar: amccall,
  },
  hanas: {
    id: 'hanas',
    name: 'Huzaifa Anas',
    role: 'Detection Engineer',
    avatar: hanas,
  },
  hstevens: {
    id: 'hstevens',
    name: 'Harper Stevens',
    role: 'Detection Engineer',
    avatar: hstevens,
  },
  wdaniel: {
    id: 'wdaniel',
    name: 'Warren Daniel',
    role: 'Security Automation Engineer',
    avatar: wdaniel,
  },
  admin: {
    id: 'admin',
    name: 'Casey Patel',
    role: 'System Administrator',
    avatar: admin,
  },
  aarthur: {
    id: 'aarthur',
    name: 'Austin Arthur',
    role: 'Director of Product Engineering',
    avatar: aarthur,
  },
  rhull: {
    id: 'rhull',
    name: 'Rhea Hull',
    role: 'Security Communications Coordinator',
    avatar: rhull,
  },
  areid: {
    id: 'areid',
    name: 'Alex Reid',
    role: 'Director, Global Security Operations',
    avatar: areid,
  },
  agent: {
    id: 'agent',
    name: 'Threat Analyzer Agent',
    role: 'Agent',
    avatar: threatAnalyzer,
    isBot: true,
  },
  playbooks: {
    id: 'playbooks',
    name: 'Playbooks',
    role: 'Bot',
    avatar: playbooksBot,
    isBot: true,
  },
};

export const ME = PEOPLE.ataylor;

export const SPACE = {
  name: 'Operation: Credential Spray Campaign',
  shortName: 'Credential spray campaign',
  type: 'Operation',
  template: 'Threat campaign',
  outcome:
    'Stop the credential spray campaign against ACME: retire legacy authentication everywhere and go 14 days with no successful spray.',
  leadId: 'jthomas',
  ownerId: 'ataylor',
  sponsorId: 'areid',
  opened: 'Mon, Oct 5',
  targetEnd: 'Fri, Nov 13',
  lifecycle: ['Open', 'Active', 'Closing', 'Closed'] as const,
};

export type WorkstreamId =
  'incidents' | 'hardening' | 'detection' | 'intel' | 'comms';

export const WORKSTREAMS: {
  id: WorkstreamId;
  label: string;
  leadId: string;
}[] = [
  { id: 'incidents', label: 'Incidents', leadId: 'jthomas' },
  { id: 'hardening', label: 'Hardening', leadId: 'ataylor' },
  { id: 'detection', label: 'Detection', leadId: 'hanas' },
  { id: 'intel', label: 'Intel', leadId: 'kchegg' },
  { id: 'comms', label: 'Comms', leadId: 'rhull' },
];

export type RunKind = 'incident' | 'checklist' | 'board' | 'agent';

export interface Run {
  id: string;
  title: string;
  kind: RunKind;
  workstream: WorkstreamId;
  ownerId: string;
  /** Playbook or source the run came from. */
  source: string;
  phase: string;
  restricted?: boolean;
}

export const RUNS: Run[] = [
  {
    id: 'inc-1281',
    title: 'INC-1281 · Legacy IMAP spray',
    kind: 'incident',
    workstream: 'incidents',
    ownerId: 'mcruz',
    source: 'Credential compromise playbook',
    phase: 'Recovery',
  },
  {
    id: 'inc-1294',
    title: 'INC-1294 · Finance account spray',
    kind: 'incident',
    workstream: 'incidents',
    ownerId: 'mcruz',
    source: 'Credential compromise playbook',
    phase: 'Containment',
  },
  {
    id: 'forensics',
    title: 'Forensics · mailbox exports',
    kind: 'checklist',
    workstream: 'incidents',
    ownerId: 'mcruz',
    source: 'Forensics checklist',
    phase: 'In progress',
    restricted: true,
  },
  {
    id: 'bu-corp',
    title: 'Hardening · Corporate IT',
    kind: 'checklist',
    workstream: 'hardening',
    ownerId: 'admin',
    source: 'Retire legacy auth',
    phase: 'Done',
  },
  {
    id: 'bu-fin',
    title: 'Hardening · Finance',
    kind: 'checklist',
    workstream: 'hardening',
    ownerId: 'admin',
    source: 'Retire legacy auth',
    phase: 'Done',
  },
  {
    id: 'bu-soc',
    title: 'Hardening · Security Operations',
    kind: 'checklist',
    workstream: 'hardening',
    ownerId: 'jthomas',
    source: 'Retire legacy auth',
    phase: 'Done',
  },
  {
    id: 'bu-eng',
    title: 'Hardening · Product Engineering',
    kind: 'checklist',
    workstream: 'hardening',
    ownerId: 'aarthur',
    source: 'Retire legacy auth',
    phase: 'In progress',
  },
  {
    id: 'bu-sup',
    title: 'Hardening · Customer Support',
    kind: 'checklist',
    workstream: 'hardening',
    ownerId: 'aarthur',
    source: 'Retire legacy auth',
    phase: 'In progress',
  },
  {
    id: 'detection',
    title: 'Detection tuning',
    kind: 'board',
    workstream: 'detection',
    ownerId: 'hanas',
    source: 'threat-discussion-tasks board',
    phase: 'Ongoing',
  },
  {
    id: 'intel',
    title: 'Intel · SentryMBA infrastructure',
    kind: 'board',
    workstream: 'intel',
    ownerId: 'kchegg',
    source: 'Campaign board',
    phase: 'Ongoing',
  },
  {
    id: 'comms',
    title: 'Comms · staff advisory',
    kind: 'checklist',
    workstream: 'comms',
    ownerId: 'rhull',
    source: 'Advisory checklist',
    phase: 'Draft',
  },
  {
    id: 'sitrep',
    title: 'Weekly sitrep',
    kind: 'agent',
    workstream: 'comms',
    ownerId: 'agent',
    source: 'Agent task · sponsor Alex Taylor',
    phase: 'Drafting',
  },
];

export type TaskStatus = 'todo' | 'in-progress' | 'blocked' | 'done';

export interface Task {
  id: string;
  title: string;
  runId: string;
  ownerId: string;
  status: TaskStatus;
  due?: string;
  note?: string;
}

export const TASKS: Task[] = [
  {
    id: 't1',
    title: 'Reset passwords for the 4 sprayed accounts',
    runId: 'inc-1281',
    ownerId: 'mcruz',
    status: 'done',
  },
  {
    id: 't2',
    title: 'Confirm no mail forwarding rules were added',
    runId: 'inc-1281',
    ownerId: 'mcruz',
    status: 'done',
  },
  {
    id: 't3',
    title: 'Write the INC-1281 after-action notes',
    runId: 'inc-1281',
    ownerId: 'mcruz',
    status: 'in-progress',
    due: 'Fri',
  },
  {
    id: 't4',
    title: 'Block attacker IP range at the edge',
    runId: 'inc-1294',
    ownerId: 'mcruz',
    status: 'done',
  },
  {
    id: 't5',
    title: 'Revoke sessions for the finance account',
    runId: 'inc-1294',
    ownerId: 'mcruz',
    status: 'in-progress',
    due: 'Today',
  },
  {
    id: 't6',
    title: 'Export mailbox audit logs',
    runId: 'forensics',
    ownerId: 'mcruz',
    status: 'in-progress',
  },
  {
    id: 't7',
    title: 'Disable IMAP and POP for all mailboxes',
    runId: 'bu-corp',
    ownerId: 'admin',
    status: 'done',
  },
  {
    id: 't8',
    title: 'Enforce MFA on legacy service accounts',
    runId: 'bu-fin',
    ownerId: 'admin',
    status: 'done',
  },
  {
    id: 't9',
    title: 'Retire basic auth on the SOC jump hosts',
    runId: 'bu-soc',
    ownerId: 'jthomas',
    status: 'done',
  },
  {
    id: 't10',
    title: 'Move build bots off basic auth',
    runId: 'bu-eng',
    ownerId: 'aarthur',
    status: 'done',
  },
  {
    id: 't11',
    title: 'Replace the legacy mail client on the release servers',
    runId: 'bu-eng',
    ownerId: 'aarthur',
    status: 'blocked',
    due: 'Oct 29',
    note: 'Needs an exception: the release servers still use a legacy mail client.',
  },
  {
    id: 't12',
    title: 'Disable basic auth in the support desk tool',
    runId: 'bu-sup',
    ownerId: 'aarthur',
    status: 'in-progress',
    due: 'Fri',
  },
  {
    id: 't13',
    title: 'Alert on 20+ failed logins from one ASN',
    runId: 'detection',
    ownerId: 'hanas',
    status: 'done',
  },
  {
    id: 't14',
    title: 'Tune the impossible-travel rule for VPN users',
    runId: 'detection',
    ownerId: 'hstevens',
    status: 'in-progress',
    due: 'Thu',
  },
  {
    id: 't15',
    title: 'Add Okta spoof domains to the blocklist',
    runId: 'detection',
    ownerId: 'hanas',
    status: 'todo',
    due: 'Next week',
  },
  {
    id: 't16',
    title: 'Map SentryMBA hosting providers',
    runId: 'intel',
    ownerId: 'kchegg',
    status: 'in-progress',
  },
  {
    id: 't17',
    title: 'Share IOC set with the ISAC',
    runId: 'intel',
    ownerId: 'kchegg',
    status: 'todo',
    due: 'Fri',
  },
  {
    id: 't18',
    title: 'Draft the staff advisory on spoofed login pages',
    runId: 'comms',
    ownerId: 'rhull',
    status: 'in-progress',
    due: 'Wed',
  },
  {
    id: 't19',
    title: 'Collect numbers from every run for the sitrep',
    runId: 'sitrep',
    ownerId: 'agent',
    status: 'done',
  },
  {
    id: 't20',
    title: "Draft this week's sitrep",
    runId: 'sitrep',
    ownerId: 'agent',
    status: 'in-progress',
    due: 'Fri',
  },
];

export interface SpaceChannel {
  name: string;
  type: 'public' | 'private';
  origin: 'template' | 'linked' | 'auto';
  unread?: boolean;
  mentions?: number;
}

export const SPACE_CHANNELS: SpaceChannel[] = [
  { name: 'spray-war-room', type: 'private', origin: 'template', mentions: 2 },
  { name: 'spray-hardening', type: 'public', origin: 'template', unread: true },
  { name: 'spray-comms', type: 'private', origin: 'template' },
  { name: 'threat-discussions', type: 'public', origin: 'linked' },
  { name: 'inc-1281-credential-comp', type: 'private', origin: 'linked' },
];

export const INC_1294_CHANNEL: SpaceChannel = {
  name: 'inc-1294-finance-spray',
  type: 'private',
  origin: 'auto',
  mentions: 1,
};

export const SPACE_PAGES = [
  { title: 'Campaign brief', updated: 'Oct 5', by: 'ataylor' },
  { title: 'Response runbook', updated: 'Oct 6', by: 'jthomas' },
  { title: 'Advisory draft', updated: 'Oct 19', by: 'rhull' },
  { title: 'Decision log', updated: 'Oct 29', by: 'areid' },
  { title: 'Sitrep · week 3', updated: 'Oct 23', by: 'agent' },
];

export const SPACE_LIBRARY = [
  {
    title: 'SentryMBA IOC set (v3).csv',
    from: 'Linked from ~inc-1281-credential-comp',
  },
  { title: 'Okta spoof domains.txt', from: 'Linked from ~threat-discussions' },
  { title: 'Legacy auth inventory.xlsx', from: 'Uploaded by Casey Patel' },
];

/** Existing work the Space can pull in by link (beat 2). */
export const LINKABLE_WORK = [
  {
    id: 'run-1281',
    label: 'INC-1281 run',
    detail: 'Playbook run · ~inc-1281-credential-comp',
    kind: 'run',
  },
  {
    id: 'thread-aws',
    label: '"AWS failed logins spike"',
    detail: 'Thread by Adam McCall · ~threat-discussions',
    kind: 'thread',
  },
  {
    id: 'thread-okta',
    label: '"Fake Okta login pages"',
    detail: 'Thread by Mary Cruz · ~threat-discussions',
    kind: 'thread',
  },
  {
    id: 'board',
    label: 'threat-discussion-tasks',
    detail: 'Board · ~threat-discussions',
    kind: 'board',
  },
  {
    id: 'iocs',
    label: 'SentryMBA IOC set (v3)',
    detail: 'File · ~inc-1281-credential-comp',
    kind: 'file',
  },
] as const;

/** Other Spaces Alex is in, for the day view. */
export const OTHER_SPACES = [
  {
    name: 'Detection engineering',
    type: 'Team area',
    health: 'nominal' as Health,
    note: '2 rules waiting on review',
    needs: 0,
  },
  {
    name: 'SOC 2 audit prep',
    type: 'Project',
    health: 'warning' as Health,
    note: 'Evidence due in 9 days, 3 items open',
    needs: 1,
  },
];

export const HEALTH_LABEL: Record<Health, string> = {
  nominal: 'On track',
  warning: 'At risk',
  critical: 'Off track',
};

export const HEALTH_TAG: Record<Health, 'success' | 'warning' | 'danger'> = {
  nominal: 'success',
  warning: 'warning',
  critical: 'danger',
};
