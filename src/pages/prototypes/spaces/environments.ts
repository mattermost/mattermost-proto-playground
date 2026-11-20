/**
 * Illustrative fixtures for five environments. Names, dates, and rollup
 * rules come from a chat summary, not from a product decision. One selector
 * swaps this data through the same shell.
 */

export type UseCaseId = 'a' | 'b' | 'c' | 'd' | 'e';

export type Tenure = 'temporary' | 'standing';

export type Freshness = 'current' | 'review-due' | 'stale';

export type RollupView = 'safe' | 'leak';

export interface TreeNode {
  id: string;
  name: string;
  /** Vocabulary of this node: Mission, Run, Workstream, Task, Record… */
  kind: string;
  state?: string;
  /** 0–100 progress. Temporary work rolls this up. */
  progress?: number;
  freshness?: Freshness;
  /** Omitted from a safe rollup. An unsafe rollup leaks that it exists. */
  restricted?: boolean;
  note?: string;
  children?: TreeNode[];
}

export interface SpaceReference {
  spaceId: string;
  name: string;
  /** Set when the reference is pinned. Absent when it is only a pointer. */
  version?: string;
}

export interface SpaceFixture {
  id: string;
  name: string;
  /** Operation, Exercise, Case, Project, Library, Handbook. */
  vocabulary: string;
  tenure: Tenure;
  summary: string;
  state?: string;
  timeframe?: string;
  freshness?: Freshness;
  /** 0–100. Standing spaces leave this empty and roll freshness up instead. */
  progress?: number;
  closeOut?: string;
  references?: SpaceReference[];
  children: TreeNode[];
}

export interface FloorItem {
  name: string;
  private?: boolean;
}

export interface MetricFixture {
  id: string;
  label: string;
  value: string;
  detail: string;
  /** 0–100. Omit when the metric uses a sparkline. */
  bar?: number;
  series?: number[];
}

export interface EnvironmentFixture {
  id: UseCaseId;
  switchLabel: string;
  title: string;
  audience: string;
  dateLabel: string;
  suggestions: string[];
  metrics: MetricFixture[];
  spaces: SpaceFixture[];
  floors: {
    command: FloorItem[];
    currentOps: FloorItem[];
    support: FloorItem[];
  };
  watching: string[];
  /** Present only when the environment compares two rollups. */
  compareRollup?: boolean;
  agent?: { name: string; status: string; progress: number };
  callouts: string[];
}

export const FRESHNESS_LABEL: Record<Freshness, string> = {
  current: 'Current',
  'review-due': 'Review due',
  stale: 'Stale',
};

export const FRESHNESS_TAG: Record<
  Freshness,
  'success' | 'warning' | 'danger'
> = {
  current: 'success',
  'review-due': 'warning',
  stale: 'danger',
};

export interface RollupNode extends TreeNode {
  /** True when this row exists only to show that a hidden child is there. */
  leaked?: boolean;
}

/** Safe rollup drops restricted nodes. Unsafe rollup keeps a nameless row. */
export function rollupNodes(
  nodes: TreeNode[] | undefined,
  leak: boolean,
): RollupNode[] {
  if (!nodes) return [];
  const out: RollupNode[] = [];
  for (const node of nodes) {
    if (node.restricted) {
      if (leak) {
        out.push({
          id: node.id,
          name: 'Hidden child',
          kind: 'Restricted',
          leaked: true,
          note: 'Existence only. The contents stay on the other side.',
        });
      }
      continue;
    }
    out.push({
      ...node,
      children: node.children ? rollupNodes(node.children, leak) : undefined,
    });
  }
  return out;
}

export const ENVIRONMENTS: EnvironmentFixture[] = [
  {
    id: 'a',
    switchLabel: 'A Harbor',
    title: 'Operation BLUE HARBOR',
    audience: 'MissionOps · Ops Center',
    dateLabel: 'Wednesday, 12 November',
    suggestions: [
      'Draft the SITREP from mission states',
      'Which missions are still planned?',
      'What archives together on close-out?',
    ],
    metrics: [
      {
        id: 'missions',
        label: 'Missions underway',
        value: '1/2',
        detail: 'Harbor Sweep is underway. Night Transit is planned.',
        bar: 50,
      },
      {
        id: 'runs',
        label: 'Runs complete',
        value: '1/3',
        detail: 'Operation → Mission → Run',
        bar: 33,
      },
      {
        id: 'ato',
        label: 'Seeded from ATO',
        value: '1844',
        detail: 'The operation was opened from the ATO record.',
        bar: 100,
      },
      {
        id: 'window',
        label: 'Days in window',
        value: '6',
        detail: '12–26 November. Closes as one archive.',
        series: [2, 3, 4, 5, 5, 6, 6],
      },
    ],
    agent: {
      name: 'SITREP skill',
      status: 'Waiting on Night Transit before it can draft',
      progress: 55,
    },
    callouts: [
      'Temporary. State, timeframe, and a close-out that archives the operation, its missions, and its runs together.',
      'Close-out can open an after-action review. There is no standing Space in this environment.',
    ],
    spaces: [
      {
        id: 'blue-harbor',
        name: 'Operation BLUE HARBOR',
        vocabulary: 'Operation',
        tenure: 'temporary',
        summary: 'Seeded from ATO 1844. Screen and escort through 26 November.',
        state: 'Active',
        timeframe: '12–26 November',
        progress: 45,
        closeOut:
          'Archive the operation, missions, and runs together, then open an after-action review.',
        children: [
          {
            id: 'harbor-sweep',
            name: 'Harbor Sweep',
            kind: 'Mission',
            state: 'Underway',
            progress: 70,
            children: [
              {
                id: 'screen-lane',
                name: 'Screen the northern lane',
                kind: 'Run',
                state: 'Running',
                progress: 80,
              },
              {
                id: 'board-traffic',
                name: 'Board merchant traffic',
                kind: 'Run',
                state: 'Running',
                progress: 40,
              },
            ],
          },
          {
            id: 'night-transit',
            name: 'Night Transit',
            kind: 'Mission',
            state: 'Planned',
            progress: 0,
            children: [
              {
                id: 'escort',
                name: 'Escort the convoy',
                kind: 'Run',
                state: 'Planned',
                progress: 0,
              },
            ],
          },
        ],
      },
    ],
    floors: {
      command: [{ name: 'ops-center' }, { name: 'ato-1844', private: true }],
      currentOps: [{ name: 'harbor-sweep' }, { name: 'night-transit' }],
      support: [{ name: 'weather' }, { name: 'logistics' }],
    },
    watching: ['SITREP skill', 'Night Transit'],
  },
  {
    id: 'b',
    switchLabel: 'B Crimson',
    title: 'Exercise CRIMSON ONE',
    audience: 'MissionOps · one Space, two security levels',
    dateLabel: 'Monday, 3 March',
    compareRollup: true,
    suggestions: [
      'What can the partner instance see?',
      'Which children does the safe rollup drop?',
      'Summarize the unclassified injects',
    ],
    metrics: [
      {
        id: 'visible',
        label: 'Missions in the rollup',
        value: '1',
        detail: 'Force-on-force is visible at this level.',
        bar: 50,
      },
      {
        id: 'hidden',
        label: 'Hidden children',
        value: '0',
        detail: 'Safe rollup removes them instead of naming them.',
        bar: 0,
      },
      {
        id: 'injects',
        label: 'Injects run',
        value: '2/4',
        detail: 'Exercise control, this instance only.',
        bar: 50,
      },
      {
        id: 'bridge',
        label: 'Partner traffic',
        value: '18',
        detail: 'Messages across the partner instance today.',
        series: [4, 6, 9, 8, 11, 14, 18],
      },
    ],
    callouts: [
      'One temporary Space spans security levels and a partner instance.',
      'Switch Viewing as to compare a safe rollup with one that leaks existence.',
    ],
    spaces: [
      {
        id: 'crimson-one',
        name: 'Exercise CRIMSON ONE',
        vocabulary: 'Exercise',
        tenure: 'temporary',
        summary:
          'Force-on-force on this instance, with a partner annex the other cell cannot be shown.',
        state: 'Active',
        timeframe: '3–7 March',
        progress: 50,
        closeOut:
          'Archive the exercise and every inject together when the window ends.',
        children: [
          {
            id: 'force-on-force',
            name: 'Force-on-force',
            kind: 'Mission',
            state: 'Underway',
            progress: 50,
            children: [
              {
                id: 'inject-2',
                name: 'Inject 2 · comms loss',
                kind: 'Run',
                state: 'Running',
                progress: 60,
              },
            ],
          },
          {
            id: 'partner-annex',
            name: 'Partner annex',
            kind: 'Mission',
            state: 'Underway',
            restricted: true,
            progress: 35,
            note: 'Lives on the partner instance.',
            children: [
              {
                id: 'liaison',
                name: 'Cross-instance liaison',
                kind: 'Run',
                restricted: true,
                progress: 20,
              },
            ],
          },
        ],
      },
    ],
    floors: {
      command: [{ name: 'exercise-control' }],
      currentOps: [
        { name: 'crimson-one' },
        { name: 'partner-bridge', private: true },
      ],
      support: [{ name: 'white-cell' }],
    },
    watching: ['Inject 2 · comms loss'],
  },
  {
    id: 'c',
    switchLabel: 'C INC-1120',
    title: 'Ransomware case INC-1120',
    audience: 'CyberSec · Threat Response',
    dateLabel: 'Friday, 18 April',
    suggestions: [
      'Where is the blocked time?',
      'Who owns the regulator task?',
      'Read the chain-of-custody record',
    ],
    metrics: [
      {
        id: 'mtta',
        label: 'MTTA',
        value: '18m',
        detail: 'Rolled up from the Playbooks POC.',
        bar: 30,
      },
      {
        id: 'mttr',
        label: 'MTTR',
        value: '6.5h',
        detail: 'Containment is still open.',
        bar: 54,
      },
      {
        id: 'blocked',
        label: 'Blocked time',
        value: '14h',
        detail: 'Isolate the file server is blocked on the backup key.',
        bar: 70,
      },
      {
        id: 'blocked-trend',
        label: 'Blocked hours',
        value: '14',
        detail: 'Hours blocked, by day, from the playbook runs.',
        series: [1, 2, 4, 6, 9, 12, 14],
      },
    ],
    callouts: [
      'Case → Workstream → Run. One task is owned by the Case itself, not by a playbook.',
      'Chain of custody is a record on the case. Blocked time, MTTA, and MTTR roll up from Playbooks.',
    ],
    spaces: [
      {
        id: 'inc-1120',
        name: 'INC-1120',
        vocabulary: 'Case',
        tenure: 'temporary',
        summary: 'Ransomware on the finance file server. Containment is open.',
        state: 'Containment',
        timeframe: 'Opened 18 April',
        progress: 40,
        closeOut:
          'Archive the case, workstreams, runs, the case-owned task, and the custody record together.',
        children: [
          {
            id: 'containment',
            name: 'Containment',
            kind: 'Workstream',
            state: 'Blocked',
            progress: 35,
            children: [
              {
                id: 'isolate',
                name: 'Isolate the file server',
                kind: 'Run',
                state: 'Blocked',
                progress: 35,
                note: 'Blocked 14h on the backup key.',
              },
            ],
          },
          {
            id: 'recovery',
            name: 'Recovery',
            kind: 'Workstream',
            state: 'Planned',
            progress: 10,
            children: [
              {
                id: 'restore',
                name: 'Restore from the last clean backup',
                kind: 'Run',
                state: 'Planned',
                progress: 10,
              },
            ],
          },
          {
            id: 'regulator',
            name: 'Notify the regulator',
            kind: 'Task',
            state: 'Open',
            progress: 0,
            note: 'Owned by the Case, not by a playbook run.',
          },
          {
            id: 'custody',
            name: 'Disk image 04',
            kind: 'Record',
            state: 'Sealed',
            progress: 100,
            note: 'Chain of custody. Held on the case.',
          },
        ],
      },
    ],
    floors: {
      command: [{ name: 'threat-response' }],
      currentOps: [{ name: 'inc-1120', private: true }],
      support: [{ name: 'legal' }, { name: 'ir-playbooks' }],
    },
    watching: ['Disk image 04', 'Notify the regulator'],
  },
  {
    id: 'd',
    switchLabel: 'D Failover',
    title: 'DR Library and Failover Event',
    audience: 'CyberSec · one standing, one temporary',
    dateLabel: 'Tuesday, 2 September',
    suggestions: [
      'Which runbook version is pinned?',
      'What in the library is stale?',
      'Is the library inside the event?',
    ],
    metrics: [
      {
        id: 'fresh',
        label: 'Library freshness',
        value: '1/3',
        detail: 'Current pages over the library. Two need review.',
        bar: 33,
      },
      {
        id: 'event',
        label: 'Failover progress',
        value: '2/4',
        detail: 'Temporary event. It does not contain the library.',
        bar: 50,
      },
      {
        id: 'pin',
        label: 'Pinned version',
        value: 'v2024.3',
        detail: 'Failover Event references DR Library at this version.',
        bar: 100,
      },
      {
        id: 'sync',
        label: 'Sync lag',
        value: '3h',
        detail: 'Hours since the library last synced.',
        series: [1, 1, 2, 2, 4, 6, 3],
      },
    ],
    callouts: [
      'DR Library is standing: no timeframe, no close-out, freshness instead of progress.',
      'Failover Event is temporary and references the library by pinned version. It does not contain it.',
    ],
    spaces: [
      {
        id: 'failover',
        name: 'Failover Event · us-east-1',
        vocabulary: 'Event',
        tenure: 'temporary',
        summary:
          'Regional failover in progress. The runbook is pinned, not copied in.',
        state: 'Active',
        timeframe: 'Opened 2 September',
        progress: 50,
        closeOut: 'Archive the event when traffic is back. The library stays.',
        references: [
          { spaceId: 'dr-library', name: 'DR Library', version: 'v2024.3' },
        ],
        children: [
          {
            id: 'execute-runbook',
            name: 'Execute pinned runbook',
            kind: 'Run',
            state: 'Running',
            progress: 50,
            note: 'Uses DR Library v2024.3. The library is not a child of this event.',
          },
          {
            id: 'shift-traffic',
            name: 'Shift traffic to us-west-2',
            kind: 'Run',
            state: 'Running',
            progress: 40,
          },
        ],
      },
      {
        id: 'dr-library',
        name: 'DR Library',
        vocabulary: 'Library',
        tenure: 'standing',
        summary:
          'MetLife-style disaster-recovery library. Synced, freshness-rated.',
        freshness: 'review-due',
        children: [
          {
            id: 'runbook',
            name: 'Runbook · regional failover',
            kind: 'Page',
            freshness: 'current',
            note: 'Synced. This is the page v2024.3 pins.',
          },
          {
            id: 'contacts',
            name: 'Contact tree',
            kind: 'Page',
            freshness: 'stale',
          },
          {
            id: 'comms-plan',
            name: 'Customer comms plan',
            kind: 'Page',
            freshness: 'review-due',
          },
        ],
      },
    ],
    floors: {
      command: [{ name: 'cybersec-leads' }],
      currentOps: [{ name: 'failover-us-east-1' }],
      support: [{ name: 'dr-library' }],
    },
    watching: ['Contact tree'],
  },
  {
    id: 'e',
    switchLabel: 'E Sprint',
    title: 'Dependency Vulnerability Sprint',
    audience: 'DevSecOps · a Project and a standing Handbook',
    dateLabel: 'Thursday, 16 October',
    suggestions: [
      'What is Dependency Scout doing?',
      'Which task is owned by the Project?',
      'Where does the Handbook get referenced?',
    ],
    metrics: [
      {
        id: 'findings',
        label: 'Findings open',
        value: '7',
        detail: 'On the sprint board.',
        bar: 70,
      },
      {
        id: 'owned',
        label: 'Project-owned tasks',
        value: '1',
        detail: 'Exception for lodash sits on the Project, not a playbook.',
        bar: 100,
      },
      {
        id: 'agent',
        label: 'Agent coverage',
        value: '4/7',
        detail: 'Dependency Scout has triaged four findings.',
        bar: 57,
      },
      {
        id: 'advisories',
        label: 'New advisories',
        value: '5',
        detail: 'This week, across the dependency tree.',
        series: [1, 1, 2, 2, 3, 4, 5],
      },
    ],
    agent: {
      name: 'Dependency Scout',
      status: 'Triaging the sprint board',
      progress: 57,
    },
    callouts: [
      'The sprint is a temporary Project: a board, a custom agent, and a task the Project owns.',
      'Security Handbook is standing. The project references it and does not contain it.',
    ],
    spaces: [
      {
        id: 'vuln-sprint',
        name: 'Dependency Vulnerability Sprint',
        vocabulary: 'Project',
        tenure: 'temporary',
        summary: 'Two-week sprint on direct dependencies.',
        state: 'In progress',
        timeframe: '13–24 October',
        progress: 55,
        closeOut:
          'Archive the project, board, and project-owned tasks together.',
        references: [{ spaceId: 'handbook', name: 'Security Handbook' }],
        children: [
          {
            id: 'scout',
            name: 'Dependency Scout',
            kind: 'Agent',
            state: 'Working',
            progress: 57,
            note: 'Custom agent on this Project.',
          },
          {
            id: 'board',
            name: 'Sprint board',
            kind: 'Board',
            state: 'In progress',
            progress: 55,
            note: 'Seven findings. Four triaged.',
          },
          {
            id: 'lodash',
            name: 'Exception for lodash',
            kind: 'Task',
            state: 'Open',
            progress: 20,
            note: 'Owned by the Project, not by a playbook.',
          },
        ],
      },
      {
        id: 'handbook',
        name: 'Security Handbook',
        vocabulary: 'Handbook',
        tenure: 'standing',
        summary: 'Standing policy. The sprint points at it.',
        freshness: 'current',
        children: [
          {
            id: 'dep-policy',
            name: 'Dependency policy',
            kind: 'Page',
            freshness: 'current',
          },
          {
            id: 'exception-bar',
            name: 'Exception bar',
            kind: 'Page',
            freshness: 'current',
            note: 'The lodash task references this page.',
          },
        ],
      },
    ],
    floors: {
      command: [{ name: 'devsecops' }],
      currentOps: [{ name: 'vuln-sprint' }],
      support: [{ name: 'security-handbook' }],
    },
    watching: ['Exception for lodash'],
  },
];

export function environmentById(id: UseCaseId): EnvironmentFixture {
  const found = ENVIRONMENTS.find((env) => env.id === id);
  if (!found) return ENVIRONMENTS[0]!;
  return found;
}
