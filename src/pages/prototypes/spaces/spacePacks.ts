import type { UseCaseId } from './environments';
import type { Health, TaskStatus } from './spacesData';
import type { AttentionItem } from './spacesStory';

export interface PackRun {
  id: string;
  title: string;
  source: string;
  phase: string;
  done: number;
  total: number;
  health: Health;
  ownerId: string;
  workstream: string;
  restricted?: boolean;
}

export interface PackTask {
  id: string;
  title: string;
  runId: string;
  ownerId: string;
  status: TaskStatus;
  note?: string;
}

export interface PackWorkstream {
  id: string;
  label: string;
  meta: string;
  health: Health;
  leadId: string;
  progress?: number;
  restricted?: boolean;
}

export interface SpacePack {
  groupLabel: string;
  name: string;
  shortName: string;
  type: string;
  outcome: string;
  leadId: string;
  sponsorId: string;
  targetEnd: string;
  lifecycle: readonly string[];
  lifecycleCurrent: string;
  health: Health;
  memberIds: string[];
  attention: (AttentionItem & { restricted?: boolean })[];
  workstreams: PackWorkstream[];
  runs: PackRun[];
  tasks: PackTask[];
  channels: {
    name: string;
    type: 'public' | 'private';
    origin: 'template' | 'linked' | 'auto';
    restricted?: boolean;
  }[];
  pages: { title: string; updated: string; by: string }[];
  library: { title: string; from: string }[];
  agentTitle: string;
  agentMeta: string;
  playbookRunId: string;
  primaryChannel: string;
  posts: { by: string; at: string; text: string }[];
}

const AIR: SpacePack = {
  groupLabel: 'Missions',
  name: 'Operation BLUE HARBOR',
  shortName: 'BLUE HARBOR',
  type: 'Operation',
  outcome:
    'Screen and escort through the ATO window, 14 Nov 06:00Z to 21 Nov 06:00Z.',
  leadId: 'jthomas',
  sponsorId: 'areid',
  targetEnd: 'Fri, 21 Nov',
  lifecycle: ['Planning', 'En route', 'On station', 'Over', 'Closed'],
  lifecycleCurrent: 'En route',
  health: 'critical',
  memberIds: ['jthomas', 'kchegg', 'mcruz', 'hanas', 'hstevens', 'admin'],
  attention: [
    {
      id: 'ife',
      kind: 'blocked',
      title: 'In-flight emergency on MSN-104',
      detail: 'ISR Orbit is critical. Maintenance has the aircraft.',
      ownerId: 'admin',
      waiting: 'Blocked 41 min',
    },
  ],
  workstreams: [
    {
      id: 'msn-101',
      label: 'MSN-101 Tanker Track Alpha',
      meta: 'On station · Divert 3 of 6',
      health: 'nominal',
      leadId: 'jthomas',
      progress: 50,
    },
    {
      id: 'msn-102',
      label: 'MSN-102 CAS Package',
      meta: 'En route · Intercept 2 of 5',
      health: 'nominal',
      leadId: 'mcruz',
      progress: 40,
    },
    {
      id: 'msn-103',
      label: 'MSN-103 CSAR Standby',
      meta: 'Planning · CSAR not started',
      health: 'warning',
      leadId: 'aarthur',
      progress: 0,
    },
    {
      id: 'msn-104',
      label: 'MSN-104 ISR Orbit',
      meta: 'Critical · in-flight emergency',
      health: 'critical',
      leadId: 'hstevens',
      progress: 20,
    },
  ],
  runs: [
    {
      id: 'divert',
      title: 'Divert',
      source: 'MSN-101 Tanker Track Alpha',
      phase: 'Step 3/6',
      done: 3,
      total: 6,
      health: 'nominal',
      ownerId: 'kchegg',
      workstream: 'msn-101',
    },
    {
      id: 'intercept',
      title: 'Intercept',
      source: 'MSN-102 CAS Package',
      phase: 'Step 2/5',
      done: 2,
      total: 5,
      health: 'nominal',
      ownerId: 'hanas',
      workstream: 'msn-102',
    },
    {
      id: 'csar',
      title: 'CSAR',
      source: 'MSN-103 CSAR Standby',
      phase: 'Not started',
      done: 0,
      total: 4,
      health: 'warning',
      ownerId: 'amccall',
      workstream: 'msn-103',
    },
    {
      id: 'ife',
      title: 'In-flight emergency (IFE)',
      source: 'MSN-104 ISR Orbit',
      phase: 'Blocked on Maintenance',
      done: 1,
      total: 5,
      health: 'critical',
      ownerId: 'admin',
      workstream: 'msn-104',
    },
  ],
  tasks: [
    {
      id: 'a1',
      title: 'Hold tanker track Alpha',
      runId: 'divert',
      ownerId: 'jthomas',
      status: 'done',
    },
    {
      id: 'a2',
      title: 'Clear the divert airfield',
      runId: 'divert',
      ownerId: 'kchegg',
      status: 'in-progress',
    },
    {
      id: 'a3',
      title: 'Join the CAS package',
      runId: 'intercept',
      ownerId: 'mcruz',
      status: 'in-progress',
    },
    {
      id: 'a4',
      title: 'Brief the CSAR crew',
      runId: 'csar',
      ownerId: 'aarthur',
      status: 'todo',
    },
    {
      id: 'a5',
      title: 'Get Maintenance on the ISR jet',
      runId: 'ife',
      ownerId: 'admin',
      status: 'blocked',
      note: 'Waiting 41 min',
    },
  ],
  channels: [
    { name: 'ops-blue-harbor', type: 'private', origin: 'template' },
    { name: 'msn-101-tanker', type: 'public', origin: 'template' },
    { name: 'msn-102-cas', type: 'public', origin: 'template' },
    { name: 'msn-103-csar', type: 'public', origin: 'template' },
    { name: 'msn-104-isr', type: 'private', origin: 'template' },
  ],
  pages: [
    { title: 'ATO v3', updated: '14 Nov', by: 'jthomas' },
    { title: 'Sortie and maintenance board', updated: '14 Nov', by: 'admin' },
  ],
  library: [
    { title: 'Air Ops SOP library', from: 'Linked, not copied in' },
    { title: 'TPDD card · logistics', from: 'Record on the operation' },
  ],
  agentTitle: 'SITREP',
  agentMeta: 'Reads the mission channels you can open',
  playbookRunId: 'divert',
  primaryChannel: 'ops-blue-harbor',
  posts: [
    {
      by: 'jthomas',
      at: '6:10 AM',
      text: 'ATO window is open. Tanker track Alpha is on station.',
    },
    {
      by: 'mcruz',
      at: '6:40 AM',
      text: 'CAS package is en route. Intercept is on step 2.',
    },
    {
      by: 'admin',
      at: '7:22 AM',
      text: 'MSN-104 called an in-flight emergency. Maintenance has it. 41 minutes so far.',
    },
  ],
};

const COALITION: SpacePack = {
  groupLabel: 'Cells',
  name: 'Exercise CRIMSON ONE',
  shortName: 'CRIMSON ONE',
  type: 'Exercise',
  outcome: 'STARTEX 17 Nov through ENDEX 24 Nov. After-action review at ENDEX.',
  leadId: 'jthomas',
  sponsorId: 'areid',
  targetEnd: 'Mon, 24 Nov',
  lifecycle: ['Planning', 'Execute', 'ENDEX', 'Closed'],
  lifecycleCurrent: 'Execute',
  health: 'warning',
  memberIds: ['jthomas', 'kchegg', 'mcruz', 'hanas', 'hstevens', 'wdaniel'],
  attention: [
    {
      id: 'deconflict',
      kind: 'blocked',
      title: 'Effects deconfliction is waiting on the partner',
      detail:
        'Cyber Effects Cell cannot finish until the partner cell answers.',
      ownerId: 'mcruz',
      waiting: 'Waiting on partner',
      restricted: true,
    },
    {
      id: 'sigint',
      kind: 'incident',
      title: 'SIGINT Fusion Cell is critical',
      detail: 'Collection plan and the source check are still open.',
      ownerId: 'hstevens',
      waiting: 'This cell only',
      restricted: true,
    },
  ],
  workstreams: [
    {
      id: 'air-defense',
      label: 'Coalition Air Defense',
      meta: 'On station · Intercept 4 of 5',
      health: 'nominal',
      leadId: 'jthomas',
      progress: 80,
    },
    {
      id: 'cyber',
      label: 'Cyber Effects Cell',
      meta: 'Warning · deconfliction waiting on the partner',
      health: 'warning',
      leadId: 'kchegg',
      progress: 45,
      restricted: true,
    },
    {
      id: 'sigint',
      label: 'SIGINT Fusion Cell',
      meta: 'Critical · collection plan open',
      health: 'critical',
      leadId: 'hstevens',
      progress: 25,
      restricted: true,
    },
  ],
  runs: [
    {
      id: 'cad-intercept',
      title: 'Intercept',
      source: 'Coalition Air Defense',
      phase: 'Step 4/5',
      done: 4,
      total: 5,
      health: 'nominal',
      ownerId: 'hanas',
      workstream: 'air-defense',
    },
    {
      id: 'cyber-effects',
      title: 'Cyber effects',
      source: 'Cyber Effects Cell',
      phase: 'Warning',
      done: 2,
      total: 5,
      health: 'warning',
      ownerId: 'kchegg',
      workstream: 'cyber',
      restricted: true,
    },
    {
      id: 'deconflict',
      title: 'Effects deconfliction',
      source: 'Cyber Effects Cell',
      phase: 'Waiting on partner',
      done: 1,
      total: 4,
      health: 'warning',
      ownerId: 'mcruz',
      workstream: 'cyber',
      restricted: true,
    },
    {
      id: 'collection',
      title: 'Collection plan',
      source: 'SIGINT Fusion Cell',
      phase: 'Critical',
      done: 1,
      total: 4,
      health: 'critical',
      ownerId: 'hstevens',
      workstream: 'sigint',
      restricted: true,
    },
    {
      id: 'source-check',
      title: 'Source compromise',
      source: 'SIGINT Fusion Cell',
      phase: 'Step 1/4',
      done: 1,
      total: 4,
      health: 'critical',
      ownerId: 'wdaniel',
      workstream: 'sigint',
      restricted: true,
    },
  ],
  tasks: [
    {
      id: 'b1',
      title: 'Run the air-defense intercept',
      runId: 'cad-intercept',
      ownerId: 'hanas',
      status: 'in-progress',
    },
    {
      id: 'b2',
      title: 'Score the cyber effect',
      runId: 'cyber-effects',
      ownerId: 'kchegg',
      status: 'in-progress',
    },
    {
      id: 'b3',
      title: 'Deconflict with the partner cell',
      runId: 'deconflict',
      ownerId: 'mcruz',
      status: 'blocked',
      note: 'Waiting on the partner',
    },
    {
      id: 'b4',
      title: 'Publish the collection plan',
      runId: 'collection',
      ownerId: 'hstevens',
      status: 'in-progress',
    },
    {
      id: 'b5',
      title: 'Check the source',
      runId: 'source-check',
      ownerId: 'wdaniel',
      status: 'todo',
    },
  ],
  channels: [
    { name: 'crimson-one-coord', type: 'public', origin: 'template' },
    { name: 'partner-liaison', type: 'private', origin: 'linked' },
    { name: 'coalition-air-defense', type: 'public', origin: 'template' },
    {
      name: 'cyber-effects',
      type: 'private',
      origin: 'template',
      restricted: true,
    },
    {
      name: 'sigint-fusion',
      type: 'private',
      origin: 'template',
      restricted: true,
    },
  ],
  pages: [
    { title: 'EXORD v2', updated: '17 Nov', by: 'jthomas' },
    { title: 'Exercise scenario library', updated: '17 Nov', by: 'kchegg' },
  ],
  library: [
    {
      title: 'Releasability rules',
      from: 'Linked. Each member keeps their own access policy.',
    },
  ],
  agentTitle: 'Exercise SITREP',
  agentMeta: 'Reads only the channels you can open',
  playbookRunId: 'cad-intercept',
  primaryChannel: 'crimson-one-coord',
  posts: [
    {
      by: 'jthomas',
      at: '8:00 AM',
      text: 'STARTEX is called. Coalition Air Defense is on station.',
    },
    {
      by: 'hanas',
      at: '9:15 AM',
      text: 'Intercept is on step 4 of 5.',
    },
    {
      by: 'kchegg',
      at: '10:05 AM',
      text: 'Partner liaison is up. White cell is scoring on this instance.',
    },
  ],
};

const RANSOM: SpacePack = {
  groupLabel: 'Workstreams',
  name: 'INC-2026-1120 · Ransomware at Plant 7',
  shortName: 'INC-2026-1120',
  type: 'Case',
  outcome:
    'Opened 18 Nov 09:40Z. Containment target 72h, with 19h left. MTTA 7 min.',
  leadId: 'mcruz',
  sponsorId: 'jthomas',
  targetEnd: '72h from open',
  lifecycle: ['Triage', 'Containment', 'Eradication', 'Recovery', 'Closed'],
  lifecycleCurrent: 'Containment',
  health: 'warning',
  memberIds: ['mcruz', 'jthomas', 'kchegg', 'wdaniel', 'rhull', 'ataylor'],
  attention: [
    {
      id: 'contain',
      kind: 'blocked',
      title: 'Ransomware containment is blocked',
      detail: 'Waiting on IT Ops. 42 minutes so far.',
      ownerId: 'mcruz',
      waiting: 'Blocked 42 min',
    },
    {
      id: 'ciso',
      kind: 'decision',
      title: 'Brief the CISO at 16:00',
      detail: 'Owned by the case. Due in 90 minutes.',
      ownerId: 'ataylor',
      waiting: 'Due in 90 min',
    },
  ],
  workstreams: [
    {
      id: 'containment',
      label: 'Containment',
      meta: 'Active · blocked 42 min on IT Ops',
      health: 'warning',
      leadId: 'mcruz',
      progress: 35,
    },
    {
      id: 'forensics',
      label: 'Forensics',
      meta: 'Active · imaging 1 of 4',
      health: 'nominal',
      leadId: 'kchegg',
      progress: 25,
    },
    {
      id: 'legal',
      label: 'Legal & Comms',
      meta: 'Planned · breach notification not started',
      health: 'warning',
      leadId: 'rhull',
      progress: 0,
    },
  ],
  runs: [
    {
      id: 'rw-contain',
      title: 'Ransomware containment',
      source: 'Containment',
      phase: 'Blocked on IT Ops',
      done: 2,
      total: 6,
      health: 'warning',
      ownerId: 'mcruz',
      workstream: 'containment',
    },
    {
      id: 'imaging',
      title: 'Forensic imaging',
      source: 'Forensics',
      phase: 'Step 1/4',
      done: 1,
      total: 4,
      health: 'nominal',
      ownerId: 'kchegg',
      workstream: 'forensics',
    },
    {
      id: 'custody',
      title: 'Chain-of-custody record',
      source: 'Forensics',
      phase: 'Sealed',
      done: 1,
      total: 1,
      health: 'nominal',
      ownerId: 'wdaniel',
      workstream: 'forensics',
    },
    {
      id: 'breach',
      title: 'Breach notification',
      source: 'Legal & Comms',
      phase: 'Not started',
      done: 0,
      total: 3,
      health: 'warning',
      ownerId: 'rhull',
      workstream: 'legal',
    },
  ],
  tasks: [
    {
      id: 'c1',
      title: 'Isolate plant 7',
      runId: 'rw-contain',
      ownerId: 'mcruz',
      status: 'blocked',
      note: 'Waiting on IT Ops',
    },
    {
      id: 'c2',
      title: 'Image the first host',
      runId: 'imaging',
      ownerId: 'kchegg',
      status: 'in-progress',
    },
    {
      id: 'c3',
      title: 'Seal the custody record',
      runId: 'custody',
      ownerId: 'wdaniel',
      status: 'done',
    },
    {
      id: 'c4',
      title: 'Draft the breach notification',
      runId: 'breach',
      ownerId: 'rhull',
      status: 'todo',
    },
    {
      id: 'c5',
      title: 'Brief the CISO at 16:00',
      runId: 'rw-contain',
      ownerId: 'ataylor',
      status: 'todo',
      note: 'Due in 90 min',
    },
  ],
  channels: [
    { name: 'case-1120-war-room', type: 'private', origin: 'template' },
    { name: 'case-1120-containment', type: 'private', origin: 'template' },
    { name: 'case-1120-forensics', type: 'private', origin: 'template' },
    { name: 'case-1120-legal', type: 'private', origin: 'template' },
  ],
  pages: [
    { title: 'Live timeline', updated: '18 Nov', by: 'mcruz' },
    { title: 'Containment tracker', updated: '18 Nov', by: 'mcruz' },
    { title: 'Evidence log', updated: '18 Nov', by: 'wdaniel' },
  ],
  library: [
    { title: 'IR runbooks', from: 'Linked' },
    { title: 'Threat intel feed', from: 'Linked' },
    { title: 'Evidence retention policy', from: 'Linked' },
  ],
  agentTitle: 'Case summary',
  agentMeta: 'Reads the workstream channels you can open',
  playbookRunId: 'rw-contain',
  primaryChannel: 'case-1120-war-room',
  posts: [
    {
      by: 'mcruz',
      at: '9:47 AM',
      text: 'Plant 7 is in containment. MTTA was 7 minutes. We are blocked on IT Ops.',
    },
    {
      by: 'kchegg',
      at: '10:20 AM',
      text: 'Forensic imaging is on the first host. Custody record is sealed.',
    },
    {
      by: 'ataylor',
      at: '11:05 AM',
      text: 'CISO brief is at 16:00. I need the containment status before then.',
    },
  ],
};

const OOB: SpacePack = {
  groupLabel: 'Workstreams',
  name: 'Failover Event · Region East outage',
  shortName: 'Region East',
  type: 'Event',
  outcome:
    'Declared 20 Nov 06:40Z. Restore target 8h. 5h 12m elapsed. The library stays when this event closes.',
  leadId: 'jthomas',
  sponsorId: 'areid',
  targetEnd: '8h from declare',
  lifecycle: ['Declared', 'Failed over', 'Recovering', 'Failed back', 'Closed'],
  lifecycleCurrent: 'Failed over',
  health: 'warning',
  memberIds: ['jthomas', 'admin', 'wdaniel', 'aarthur', 'areid'],
  attention: [
    {
      id: 'vendor',
      kind: 'blocked',
      title: 'Identity failover is waiting on the vendor',
      detail:
        '2 hours 10 minutes. Core apps cannot finish until identity moves.',
      ownerId: 'wdaniel',
      waiting: 'Waiting 2h 10m',
    },
  ],
  workstreams: [
    {
      id: 'network',
      label: 'Network',
      meta: 'Done soon · failover 5 of 6',
      health: 'nominal',
      leadId: 'admin',
      progress: 83,
    },
    {
      id: 'identity',
      label: 'Identity',
      meta: 'Blocked · waiting on the vendor',
      health: 'warning',
      leadId: 'wdaniel',
      progress: 40,
    },
    {
      id: 'apps',
      label: 'Core apps',
      meta: 'Active · restore 3 of 9, behind plan',
      health: 'warning',
      leadId: 'aarthur',
      progress: 33,
    },
  ],
  runs: [
    {
      id: 'net-fail',
      title: 'Network failover',
      source: 'Network',
      phase: 'Step 5/6',
      done: 5,
      total: 6,
      health: 'nominal',
      ownerId: 'admin',
      workstream: 'network',
    },
    {
      id: 'id-fail',
      title: 'Identity failover',
      source: 'Identity',
      phase: 'Waiting on vendor',
      done: 2,
      total: 5,
      health: 'warning',
      ownerId: 'wdaniel',
      workstream: 'identity',
    },
    {
      id: 'app-restore',
      title: 'Core app restore',
      source: 'Core apps',
      phase: 'Step 3/9, behind plan',
      done: 3,
      total: 9,
      health: 'warning',
      ownerId: 'aarthur',
      workstream: 'apps',
    },
  ],
  tasks: [
    {
      id: 'd1',
      title: 'Finish the WAN cutover',
      runId: 'net-fail',
      ownerId: 'admin',
      status: 'in-progress',
    },
    {
      id: 'd2',
      title: 'Move identity to the west region',
      runId: 'id-fail',
      ownerId: 'wdaniel',
      status: 'blocked',
      note: 'Waiting on the vendor, 2h 10m',
    },
    {
      id: 'd3',
      title: 'Restore the core app tier',
      runId: 'app-restore',
      ownerId: 'aarthur',
      status: 'in-progress',
    },
  ],
  channels: [
    { name: 'failover-east-bridge', type: 'private', origin: 'template' },
    { name: 'failover-network', type: 'public', origin: 'template' },
    { name: 'failover-identity', type: 'private', origin: 'template' },
    { name: 'failover-apps', type: 'public', origin: 'template' },
  ],
  pages: [
    { title: 'Decision log', updated: '20 Nov', by: 'jthomas' },
    {
      title: 'Disaster Recovery Library',
      updated: 'Pinned at declare',
      by: 'areid',
    },
  ],
  library: [
    { title: 'DR Library · WAN cutover v14', from: 'Pinned at declaration' },
    { title: 'DR Library · Break-glass accounts v6', from: 'Pinned' },
    {
      title: 'DR Library · Executive call tree v3',
      from: 'Pinned · stale, flagged',
    },
  ],
  agentTitle: 'Next procedure',
  agentMeta: 'Suggests the next page from the library and flags stale ones',
  playbookRunId: 'net-fail',
  primaryChannel: 'failover-east-bridge',
  posts: [
    {
      by: 'jthomas',
      at: '6:40 AM',
      text: 'Region East is declared. We are failed over. Restore target is 8 hours.',
    },
    {
      by: 'admin',
      at: '9:10 AM',
      text: 'Network failover is on step 5 of 6.',
    },
    {
      by: 'wdaniel',
      at: '10:50 AM',
      text: 'Identity is waiting on the vendor. 2 hours 10 minutes.',
    },
  ],
};

const DEVSECOPS: SpacePack = {
  groupLabel: 'Workstreams',
  name: 'Dependency Vulnerability Sprint · Q4',
  shortName: 'Vuln sprint',
  type: 'Project',
  outcome: 'Sprint 3 Nov to 4 Dec. 14 days left.',
  leadId: 'ataylor',
  sponsorId: 'aarthur',
  targetEnd: 'Wed, 4 Dec',
  lifecycle: ['Planned', 'In progress', 'Done'],
  lifecycleCurrent: 'In progress',
  health: 'warning',
  memberIds: ['ataylor', 'aarthur', 'wdaniel', 'hanas', 'kchegg'],
  attention: [
    {
      id: 'keys',
      kind: 'blocked',
      title: 'Rotate signing keys',
      detail: 'Owned by the project. Platform is at risk.',
      ownerId: 'aarthur',
      waiting: 'At risk',
    },
    {
      id: 'hotfix',
      kind: 'blocked',
      title: 'Hotfix release is waiting on QA sign-off',
      detail: 'The release cannot ship until QA signs.',
      ownerId: 'hanas',
      waiting: 'Waiting on QA',
    },
  ],
  workstreams: [
    {
      id: 'cves',
      label: 'Critical CVEs',
      meta: 'At risk · triage 4 of 5',
      health: 'warning',
      leadId: 'wdaniel',
      progress: 80,
    },
    {
      id: 'hotfix',
      label: 'Hotfix release',
      meta: 'Waiting on QA sign-off',
      health: 'warning',
      leadId: 'hanas',
      progress: 60,
    },
    {
      id: 'backlog',
      label: 'Backlog burn-down',
      meta: 'On track · weekly review',
      health: 'nominal',
      leadId: 'kchegg',
      progress: 55,
    },
  ],
  runs: [
    {
      id: 'triage',
      title: 'CVE triage',
      source: 'Critical CVEs',
      phase: 'Step 4/5',
      done: 4,
      total: 5,
      health: 'warning',
      ownerId: 'wdaniel',
      workstream: 'cves',
    },
    {
      id: 'hotfix-run',
      title: 'Hotfix release',
      source: 'Hotfix release',
      phase: 'Waiting on QA sign-off',
      done: 3,
      total: 5,
      health: 'warning',
      ownerId: 'hanas',
      workstream: 'hotfix',
    },
    {
      id: 'review',
      title: 'Weekly dependency review',
      source: 'Backlog burn-down',
      phase: 'Recurring',
      done: 2,
      total: 4,
      health: 'nominal',
      ownerId: 'kchegg',
      workstream: 'backlog',
    },
  ],
  tasks: [
    {
      id: 'e1',
      title: 'Finish CVE triage',
      runId: 'triage',
      ownerId: 'wdaniel',
      status: 'in-progress',
    },
    {
      id: 'e2',
      title: 'Get QA sign-off on the hotfix',
      runId: 'hotfix-run',
      ownerId: 'hanas',
      status: 'blocked',
      note: 'Waiting on QA',
    },
    {
      id: 'e3',
      title: 'Rotate signing keys',
      runId: 'hotfix-run',
      ownerId: 'aarthur',
      status: 'blocked',
      note: 'Owned by the project',
    },
    {
      id: 'e4',
      title: 'Run the weekly dependency review',
      runId: 'review',
      ownerId: 'kchegg',
      status: 'in-progress',
    },
  ],
  channels: [
    { name: 'dep-vuln-sprint', type: 'public', origin: 'template' },
    { name: 'dep-vuln-critical', type: 'private', origin: 'template' },
    { name: 'dep-vuln-hotfix', type: 'public', origin: 'template' },
    { name: 'dep-vuln-backlog', type: 'public', origin: 'template' },
  ],
  pages: [
    { title: 'Remediation plan', updated: '16 Oct', by: 'ataylor' },
    { title: 'Sprint board', updated: '16 Oct', by: 'wdaniel' },
  ],
  library: [
    { title: 'Security Engineering Handbook', from: 'Linked' },
    { title: 'Vulnerability SLA policy', from: 'Linked' },
  ],
  agentTitle: 'Sprint status',
  agentMeta: 'Answers what is blocking the release',
  playbookRunId: 'triage',
  primaryChannel: 'dep-vuln-sprint',
  posts: [
    {
      by: 'ataylor',
      at: '9:00 AM',
      text: '14 days left in the sprint. Critical CVEs are at risk.',
    },
    {
      by: 'wdaniel',
      at: '10:12 AM',
      text: 'CVE triage is on step 4 of 5.',
    },
    {
      by: 'hanas',
      at: '11:40 AM',
      text: 'Hotfix is waiting on QA sign-off. Signing-key rotation is still open.',
    },
  ],
};

export const SPACE_PACKS: Record<UseCaseId, SpacePack> = {
  a: AIR,
  b: COALITION,
  c: RANSOM,
  d: OOB,
  e: DEVSECOPS,
};

export function spacePack(id: UseCaseId): SpacePack {
  return SPACE_PACKS[id];
}
