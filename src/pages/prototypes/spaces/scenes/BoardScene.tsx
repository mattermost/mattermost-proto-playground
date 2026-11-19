import { useMemo, useState } from 'react';
import { Checkbox } from '@mattermost/compass-ui/components/checkbox';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { SegmentedControl } from '@mattermost/compass-ui/components/segmented-control';
import { Tag } from '@mattermost/compass-ui/components/tag';
import { Toast } from '@mattermost/compass-ui/components/toast';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import { HealthDot } from '../components/HealthDot';
import { PEOPLE, RUNS, WORKSTREAMS, type Task } from '../spacesData';
import {
  hardeningDone,
  runHealth,
  runProgress,
  visibleRuns,
  type StoryState,
} from '../spacesStory';
import shared from '../Spaces.module.scss';
import styles from './BoardScene.module.scss';

type GroupBy = 'run' | 'workstream' | 'owner';

const STATUS_TAG: Record<
  Task['status'],
  { label: string; type: 'default' | 'info' | 'danger' | 'success' }
> = {
  todo: { label: 'To do', type: 'default' },
  'in-progress': { label: 'In progress', type: 'info' },
  blocked: { label: 'Blocked', type: 'danger' },
  done: { label: 'Done', type: 'success' },
};

const ORDER: Record<Task['status'], number> = {
  blocked: 0,
  'in-progress': 1,
  todo: 2,
  done: 3,
};

export interface BoardSceneProps {
  story: StoryState;
  onStoryChange: (update: Partial<StoryState>) => void;
}

export default function BoardScene({ story, onStoryChange }: BoardSceneProps) {
  const [groupBy, setGroupBy] = useState<GroupBy>('run');
  const [toast, setToast] = useState<string | null>(null);

  const runIds = new Set(visibleRuns(story).map((r) => r.id));
  const tasks = story.tasks.filter((t) => runIds.has(t.runId));

  const groups = useMemo(() => {
    const sorted = (list: Task[]) =>
      [...list].sort((a, b) => ORDER[a.status] - ORDER[b.status]);
    if (groupBy === 'run') {
      return visibleRuns(story)
        .filter((r) => !r.restricted)
        .map((run) => ({
          key: run.id,
          title: run.title,
          meta: `${runProgress(story, run.id).done} of ${runProgress(story, run.id).total} done · ${run.source}`,
          health: runHealth(story, run),
          tasks: sorted(tasks.filter((t) => t.runId === run.id)),
        }));
    }
    if (groupBy === 'workstream') {
      return WORKSTREAMS.map((w) => ({
        key: w.id,
        title: w.label,
        meta: `Lead ${PEOPLE[w.leadId]!.name}`,
        health: undefined,
        tasks: sorted(
          tasks.filter(
            (t) =>
              RUNS.find((r) => r.id === t.runId)?.workstream === w.id &&
              !RUNS.find((r) => r.id === t.runId)?.restricted,
          ),
        ),
      }));
    }
    const owners = Array.from(new Set(tasks.map((t) => t.ownerId)));
    return owners.map((id) => ({
      key: id,
      title: PEOPLE[id]!.name,
      meta: PEOPLE[id]!.role,
      health: undefined,
      tasks: sorted(
        tasks.filter(
          (t) =>
            t.ownerId === id && !RUNS.find((r) => r.id === t.runId)?.restricted,
        ),
      ),
    }));
  }, [groupBy, story, tasks]);

  const toggle = (task: Task) => {
    if (task.status === 'blocked') return;
    const next: Task['status'] =
      task.status === 'done' ? 'in-progress' : 'done';
    const nextTasks = story.tasks.map((t) =>
      t.id === task.id ? { ...t, status: next } : t,
    );
    const before = hardeningDone(story).done;
    const after = hardeningDone({ ...story, tasks: nextTasks }).done;
    onStoryChange({ tasks: nextTasks });
    if (after > before) {
      const run = RUNS.find((r) => r.id === task.runId)!;
      setToast(
        `${run.title.replace('Hardening · ', '')} is done. Hardening is at ${after} of 5 units.`,
      );
      window.setTimeout(() => setToast(null), 7000);
    }
  };

  const open = tasks.filter((t) => t.status !== 'done').length;

  return (
    <div className={styles['board-scene']}>
      <div className={styles['board-scene__toolbar']}>
        <span className={shared['spaces__muted']}>
          {open} open tasks from checklists, boards and agents · same items as
          each run&rsquo;s own checklist
        </span>
        <SegmentedControl
          size="small"
          aria-label="Group tasks by"
          value={groupBy}
          onChange={(key) => setGroupBy(key as GroupBy)}
          options={[
            { key: 'run', label: 'Run' },
            { key: 'workstream', label: 'Workstream' },
            { key: 'owner', label: 'Owner' },
          ]}
        />
      </div>
      <Scrollbar className={styles['board-scene__scroll']}>
        <div className={styles['board-scene__lanes']}>
          {groups.map((g) => (
            <section
              key={g.key}
              className={styles['board-scene__lane']}
              aria-label={g.title}
            >
              <header className={styles['board-scene__lane-header']}>
                {g.health ? <HealthDot health={g.health} /> : null}
                <span className={styles['board-scene__lane-title']}>
                  {g.title}
                </span>
                <span className={shared['spaces__muted']}>
                  {g.tasks.length}
                </span>
              </header>
              <span className={styles['board-scene__lane-meta']}>{g.meta}</span>
              <ul className={styles['board-scene__cards']}>
                {g.tasks.map((task) => {
                  const owner = PEOPLE[task.ownerId]!;
                  const run = RUNS.find((r) => r.id === task.runId)!;
                  const status = STATUS_TAG[task.status];
                  return (
                    <li
                      key={task.id}
                      className={`${styles['board-scene__card']} ${
                        task.status === 'done'
                          ? styles['board-scene__card--done']
                          : ''
                      } ${task.status === 'blocked' ? styles['board-scene__card--blocked'] : ''}`}
                    >
                      <div className={styles['board-scene__card-top']}>
                        <Checkbox
                          size="small"
                          checked={task.status === 'done'}
                          disabled={task.status === 'blocked' || owner.isBot}
                          onChange={() => toggle(task)}
                        >
                          <span className={styles['board-scene__card-title']}>
                            {task.title}
                          </span>
                        </Checkbox>
                      </div>
                      {task.note ? (
                        <span className={styles['board-scene__note']}>
                          {task.note}
                        </span>
                      ) : null}
                      <div className={styles['board-scene__card-meta']}>
                        <Tag
                          label={status.label}
                          type={status.type}
                          size="x-small"
                        />
                        {groupBy !== 'run' ? (
                          <span className={shared['spaces__muted']}>
                            {run.title}
                          </span>
                        ) : null}
                        {task.due ? (
                          <span className={shared['spaces__muted']}>
                            Due {task.due}
                          </span>
                        ) : null}
                        <UserAvatar
                          className={styles['board-scene__avatar']}
                          src={owner.avatar}
                          alt={owner.name}
                          size="20"
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </Scrollbar>
      {toast ? (
        <div className={shared['spaces__toast']} role="status">
          <Toast
            type="success"
            message={toast}
            onDismiss={() => setToast(null)}
          />
        </div>
      ) : null}
    </div>
  );
}
