import {
  RUNS,
  TASKS,
  WORKSTREAMS,
  type Health,
  type Run,
  type Task,
  type WorkstreamId,
} from './spacesData';

export type SceneId =
  'day' | 'create' | 'overview' | 'board' | 'decision' | 'close';

export const SCENES: { id: SceneId; label: string; when: string }[] = [
  { id: 'day', label: 'Home', when: 'Week 4, Thursday' },
  { id: 'create', label: 'Open a Space', when: 'Week 1, Monday' },
  { id: 'overview', label: 'Space overview', when: 'Week 2, Wednesday' },
  { id: 'board', label: 'Campaign board', when: 'Week 3' },
  { id: 'decision', label: 'Decision', when: 'Week 4, Thursday' },
  { id: 'close', label: 'Close-out', when: 'Week 6' },
];

export type DecisionState = 'none' | 'pending' | 'approved';
export type SitrepState = 'drafting' | 'needs-input' | 'ready';

export interface StoryState {
  inc1294Joined: boolean;
  tasks: Task[];
  decision: DecisionState;
  sitrep: SitrepState;
  closed: boolean;
}

function withStatus(
  tasks: Task[],
  updates: Record<string, Task['status']>,
): Task[] {
  return tasks.map((t) =>
    updates[t.id] ? { ...t, status: updates[t.id]! } : t,
  );
}

/** Where the story stands when a scene opens. Each scene is a moment in the six weeks. */
export function presetFor(scene: SceneId): StoryState {
  switch (scene) {
    case 'create':
      return {
        inc1294Joined: false,
        tasks: TASKS,
        decision: 'none',
        sitrep: 'drafting',
        closed: false,
      };
    case 'overview':
      return {
        inc1294Joined: false,
        tasks: withStatus(TASKS, { t11: 'in-progress' }),
        decision: 'none',
        sitrep: 'drafting',
        closed: false,
      };
    case 'board':
      return {
        inc1294Joined: true,
        tasks: TASKS,
        decision: 'none',
        sitrep: 'drafting',
        closed: false,
      };
    case 'day':
    case 'decision':
      return {
        inc1294Joined: true,
        tasks: TASKS,
        decision: 'pending',
        sitrep: 'needs-input',
        closed: false,
      };
    case 'close':
      return {
        inc1294Joined: true,
        tasks: TASKS.map((t) =>
          t.runId === 'detection' && t.status === 'todo'
            ? t
            : { ...t, status: 'done' },
        ),
        decision: 'approved',
        sitrep: 'ready',
        closed: false,
      };
  }
}

export function visibleRuns(story: StoryState): Run[] {
  return RUNS.filter((r) => r.id !== 'inc-1294' || story.inc1294Joined);
}

export function runTasks(story: StoryState, runId: string): Task[] {
  return story.tasks.filter((t) => t.runId === runId);
}

export function runProgress(story: StoryState, runId: string) {
  const tasks = runTasks(story, runId);
  const done = tasks.filter((t) => t.status === 'done').length;
  return { done, total: tasks.length };
}

const RANK: Record<Health, number> = { nominal: 0, warning: 1, critical: 2 };

export function worst(values: Health[]): Health {
  return values.reduce<Health>(
    (acc, h) => (RANK[h] > RANK[acc] ? h : acc),
    'nominal',
  );
}

/**
 * Rule-based health: computed from task state, never typed in.
 * Blocked work is at risk; blocked work waiting on a decision is off track;
 * an open incident still in containment is at risk.
 */
export function runHealth(story: StoryState, run: Run): Health {
  const tasks = runTasks(story, run.id);
  if (tasks.some((t) => t.status === 'blocked')) {
    return story.decision === 'pending' ? 'critical' : 'warning';
  }
  if (run.id === 'inc-1294' && tasks.some((t) => t.status !== 'done')) {
    return 'warning';
  }
  if (run.id === 'sitrep' && story.sitrep === 'needs-input') return 'warning';
  return 'nominal';
}

export function workstreamHealth(story: StoryState, id: WorkstreamId): Health {
  return worst(
    visibleRuns(story)
      .filter((r) => r.workstream === id)
      .map((r) => runHealth(story, r)),
  );
}

export function spaceHealth(story: StoryState): Health {
  return worst(WORKSTREAMS.map((w) => workstreamHealth(story, w.id)));
}

export function hardeningDone(story: StoryState) {
  const units = RUNS.filter((r) => r.workstream === 'hardening');
  const done = units.filter((u) => {
    const p = runProgress(story, u.id);
    return p.done === p.total;
  }).length;
  return { done, total: units.length };
}

export interface AttentionItem {
  id: string;
  kind: 'decision' | 'blocked' | 'agent' | 'incident';
  title: string;
  detail: string;
  ownerId: string;
  waiting: string;
}

/** "Needs attention": the open loops that are stuck, rolled up from every run. */
export function needsAttention(story: StoryState): AttentionItem[] {
  const items: AttentionItem[] = [];
  const blocked = story.tasks.find((t) => t.id === 't11');
  if (story.decision === 'pending') {
    items.push({
      id: 'decision',
      kind: 'decision',
      title: 'Risk decision: legacy mail client exception',
      detail:
        'Hardening · Product Engineering is blocked. Escalated to Alex Reid after two nudges.',
      ownerId: 'areid',
      waiting: 'Waiting 2 days',
    });
  } else if (blocked?.status === 'blocked') {
    items.push({
      id: 'blocked',
      kind: 'blocked',
      title: blocked.title,
      detail: blocked.note ?? '',
      ownerId: blocked.ownerId,
      waiting: 'Blocked 1 day',
    });
  }
  if (story.sitrep === 'needs-input') {
    items.push({
      id: 'sitrep',
      kind: 'agent',
      title: 'Sitrep needs your input',
      detail:
        'Threat Analyzer Agent: "Should INC-1294 count as a new success for the campaign, or as part of INC-1281?"',
      ownerId: 'ataylor',
      waiting: 'Paused 1 h',
    });
  }
  if (story.inc1294Joined) {
    const open = story.tasks.find((t) => t.id === 't5' && t.status !== 'done');
    if (open) {
      items.push({
        id: 'inc-1294',
        kind: 'incident',
        title: 'INC-1294 in containment',
        detail: 'Revoke sessions for the finance account is due today.',
        ownerId: 'mcruz',
        waiting: 'Opened 3 h ago',
      });
    }
  }
  return items;
}
