import { useEffect, useState } from 'react';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { ProgressBar } from '@mattermost/compass-ui/components/progress-bar';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { Tag } from '@mattermost/compass-ui/components/tag';
import { Toast } from '@mattermost/compass-ui/components/toast';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import FileTextOutlineIcon from '@mattermost/compass-icons/components/file-text-outline';
import GlobeIcon from '@mattermost/compass-icons/components/globe';
import LockOutlineIcon from '@mattermost/compass-icons/components/lock-outline';
import { AgentStrip } from '../components/AgentStrip';
import { AttentionList } from '../components/AttentionList';
import { HealthDot } from '../components/HealthDot';
import {
  HEALTH_LABEL,
  HEALTH_TAG,
  INC_1294_CHANNEL,
  PEOPLE,
  SPACE_CHANNELS,
  SPACE_LIBRARY,
  SPACE_PAGES,
  WORKSTREAMS,
  type WorkstreamId,
} from '../spacesData';
import type { SpacePack } from '../spacePacks';
import {
  hardeningDone,
  needsAttention,
  runHealth,
  runProgress,
  visibleRuns,
  workstreamHealth,
  type AttentionItem,
  type StoryState,
} from '../spacesStory';
import styles from '../Spaces.module.scss';

const ORIGIN_LABEL = {
  template: 'From template',
  linked: 'Linked',
  auto: 'Joined automatically',
};

export interface OverviewSceneProps {
  story: StoryState;
  onStoryChange: (update: Partial<StoryState>) => void;
  onOpenDecision: () => void;
  onOpenBoard: () => void;
  showPages: boolean;
  pack?: SpacePack;
  showRestricted?: boolean;
}

export default function OverviewScene({
  story,
  onStoryChange,
  onOpenDecision,
  onOpenBoard,
  showPages,
  pack,
  showRestricted = false,
}: OverviewSceneProps) {
  const [arrived, setArrived] = useState(false);
  const [toast, setToast] = useState(false);

  // Scripted live change (beat 4): a new alert matches the campaign's IOCs and
  // INC-1294 opens inside the Space a moment after the overview loads.
  useEffect(() => {
    if (pack || story.inc1294Joined) return;
    const timer = window.setTimeout(() => {
      onStoryChange({ inc1294Joined: true });
      setArrived(true);
      setToast(true);
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [pack, story.inc1294Joined, onStoryChange]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(false), 8000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const open = <T extends { restricted?: boolean }>(items: T[]) =>
    showRestricted ? items : items.filter((item) => !item.restricted);
  const attention = pack ? open(pack.attention) : needsAttention(story);
  const runs = visibleRuns(story);
  const hardening = hardeningDone(story);
  const channels = pack
    ? open(pack.channels)
    : story.inc1294Joined
      ? [...SPACE_CHANNELS, INC_1294_CHANNEL]
      : SPACE_CHANNELS;
  const packRuns = pack ? open(pack.runs) : null;
  const packGroups = pack ? open(pack.workstreams) : null;
  const pages = pack ? pack.pages : SPACE_PAGES;
  const library = pack ? pack.library : SPACE_LIBRARY;

  const summary: Record<WorkstreamId, string> = {
    incidents: `${runs.filter((r) => r.workstream === 'incidents' && r.kind === 'incident').length} incident runs`,
    hardening: `${hardening.done} of ${hardening.total} business units done`,
    detection: `${runProgress(story, 'detection').done} of ${runProgress(story, 'detection').total} detection tasks done`,
    intel: 'IOC set v3 shared with the team',
    comms:
      story.sitrep === 'ready'
        ? 'Sitrep ready for review'
        : 'Advisory in draft · sitrep due Friday',
  };

  const handleAttention = (item: AttentionItem) => {
    if (item.kind === 'decision' || item.kind === 'blocked') onOpenDecision();
    else if (item.kind === 'incident') onOpenBoard();
  };

  if (showPages) {
    return (
      <Scrollbar className={styles['spaces__scroll']}>
        <div className={styles['spaces__body']}>
          <div className={styles['spaces__grid']}>
            <section
              className={styles['spaces__panel']}
              aria-labelledby="pages-title"
            >
              <div className={styles['spaces__panel-header']}>
                <h2 id="pages-title" className={styles['spaces__panel-title']}>
                  Pages
                </h2>
              </div>
              <ul className={styles['spaces__list']}>
                {pages.map((p) => (
                  <li key={p.title} className={styles['spaces__row']}>
                    <span className={styles['spaces__icon-tile']} aria-hidden>
                      <Icon glyph={<FileTextOutlineIcon />} size="20" />
                    </span>
                    <div className={styles['spaces__row-main']}>
                      <span className={styles['spaces__row-title']}>
                        {p.title}
                      </span>
                      <span className={styles['spaces__row-meta']}>
                        Updated {p.updated} by {PEOPLE[p.by]!.name}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
            <section
              className={styles['spaces__panel']}
              aria-labelledby="library-title"
            >
              <div className={styles['spaces__panel-header']}>
                <h2
                  id="library-title"
                  className={styles['spaces__panel-title']}
                >
                  Library
                </h2>
              </div>
              <ul className={styles['spaces__list']}>
                {library.map((f) => (
                  <li key={f.title} className={styles['spaces__row']}>
                    <div className={styles['spaces__row-main']}>
                      <span className={styles['spaces__row-title']}>
                        {f.title}
                      </span>
                      <span className={styles['spaces__row-meta']}>
                        {f.from}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </Scrollbar>
    );
  }

  return (
    <>
      <Scrollbar className={styles['spaces__scroll']}>
        <div className={styles['spaces__body']}>
          <div className={styles['spaces__grid']}>
            <div className={styles['spaces__column']}>
              <section
                className={styles['spaces__panel']}
                aria-labelledby="attention-title"
              >
                <div className={styles['spaces__panel-header']}>
                  <h2
                    id="attention-title"
                    className={styles['spaces__panel-title']}
                  >
                    Needs attention
                  </h2>
                  <Tag
                    label={String(attention.length)}
                    type="danger"
                    size="x-small"
                  />
                  <span className={styles['spaces__panel-aside']}>
                    Across this Space
                  </span>
                </div>
                <AttentionList
                  items={attention}
                  onAction={handleAttention}
                  actionLabel={(item) =>
                    item.kind === 'decision'
                      ? 'Open decision'
                      : item.kind === 'incident'
                        ? 'View tasks'
                        : null
                  }
                />
              </section>

              <section
                className={styles['spaces__panel']}
                aria-labelledby="workstreams-title"
              >
                <div className={styles['spaces__panel-header']}>
                  <h2
                    id="workstreams-title"
                    className={styles['spaces__panel-title']}
                  >
                    {pack?.groupLabel ?? 'Workstreams'}
                  </h2>
                  <span className={styles['spaces__panel-aside']}>
                    From open work
                  </span>
                </div>
                <ul className={styles['spaces__list']} aria-live="polite">
                  {(packGroups
                    ? packGroups.map((w) => ({
                        id: w.id,
                        label: w.label,
                        leadId: w.leadId,
                        health: w.health,
                        meta: w.meta,
                        progress: w.progress,
                      }))
                    : WORKSTREAMS.map((w) => ({
                        id: w.id,
                        label: w.label,
                        leadId: w.leadId,
                        health: workstreamHealth(story, w.id),
                        meta: summary[w.id],
                        progress: undefined as number | undefined,
                      }))
                  ).map((w) => {
                    const lead = PEOPLE[w.leadId]!;
                    return (
                      <li key={w.id} className={styles['spaces__row']}>
                        <HealthDot health={w.health} />
                        <div className={styles['spaces__row-main']}>
                          <span className={styles['spaces__row-title']}>
                            {w.label}
                          </span>
                          <span className={styles['spaces__row-meta']}>
                            {w.meta}
                          </span>
                          {w.progress != null ? (
                            <ProgressBar
                              value={w.progress}
                              size="small"
                              aria-label={`${w.label} progress`}
                            />
                          ) : null}
                          {w.id === 'hardening' && !packGroups ? (
                            <ProgressBar
                              value={(hardening.done / hardening.total) * 100}
                              size="small"
                              aria-label="Hardening progress"
                            />
                          ) : null}
                        </div>
                        <div className={styles['spaces__row-end']}>
                          <span className={styles['spaces__muted']}>
                            {HEALTH_LABEL[w.health]}
                          </span>
                          <UserAvatar
                            src={lead.avatar}
                            alt={lead.name}
                            size="24"
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <section
                className={styles['spaces__panel']}
                aria-labelledby="runs-title"
              >
                <div className={styles['spaces__panel-header']}>
                  <h2 id="runs-title" className={styles['spaces__panel-title']}>
                    Runs and boards
                  </h2>
                  <span className={styles['spaces__panel-aside']}>
                    {(packRuns ?? runs).length} in this Space
                  </span>
                </div>
                <ul className={styles['spaces__list']}>
                  {(packRuns
                    ? packRuns.map((run) => ({
                        id: run.id,
                        title: run.title,
                        source: run.source,
                        phase: run.phase,
                        ownerId: run.ownerId,
                        restricted: run.restricted,
                        done: run.done,
                        total: run.total,
                        health: run.health,
                      }))
                    : runs.map((run) => {
                        const p = runProgress(story, run.id);
                        return {
                          id: run.id,
                          title: run.title,
                          source: run.source,
                          phase: run.phase,
                          ownerId: run.ownerId,
                          restricted: run.restricted,
                          done: p.done,
                          total: p.total,
                          health: runHealth(story, run),
                        };
                      })
                  ).map((run) => {
                    const p = { done: run.done, total: run.total };
                    const health = run.health;
                    const owner = PEOPLE[run.ownerId]!;
                    const isNew = run.id === 'inc-1294' && arrived;
                    return (
                      <li
                        key={run.id}
                        className={`${styles['spaces__row']} ${isNew ? styles['spaces__row--arrived'] : ''}`}
                      >
                        <div className={styles['spaces__row-main']}>
                          <span className={styles['spaces__row-title']}>
                            {run.title}
                            {run.restricted ? (
                              <>
                                {' '}
                                <Icon
                                  glyph={<LockOutlineIcon />}
                                  size="12"
                                  aria-label="Restricted"
                                />
                              </>
                            ) : null}
                          </span>
                          <span className={styles['spaces__row-meta']}>
                            {run.source} · {run.phase}
                            {isNew
                              ? ' · joined automatically: alert matched campaign IOCs'
                              : ''}
                          </span>
                        </div>
                        <div className={styles['spaces__row-end']}>
                          <span className={styles['spaces__muted']}>
                            {p.done}/{p.total}
                          </span>
                          <Tag
                            label={HEALTH_LABEL[health]}
                            type={HEALTH_TAG[health]}
                            size="x-small"
                          />
                          <UserAvatar
                            src={owner.avatar}
                            alt={owner.name}
                            size="24"
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </div>

            <div className={styles['spaces__column']}>
              <section
                className={styles['spaces__panel']}
                aria-labelledby="agent-title"
              >
                <div className={styles['spaces__panel-header']}>
                  <h2
                    id="agent-title"
                    className={styles['spaces__panel-title']}
                  >
                    Agent work
                  </h2>
                </div>
                <div className={styles['spaces__panel-body']}>
                  <AgentStrip
                    state={story.sitrep}
                    title={pack?.agentTitle}
                    meta={pack?.agentMeta}
                    onAnswer={() => onStoryChange({ sitrep: 'ready' })}
                  />
                </div>
              </section>

              <section
                className={styles['spaces__panel']}
                aria-labelledby="channels-title"
              >
                <div className={styles['spaces__panel-header']}>
                  <h2
                    id="channels-title"
                    className={styles['spaces__panel-title']}
                  >
                    Channels
                  </h2>
                  <span className={styles['spaces__panel-aside']}>
                    {channels.length}
                  </span>
                </div>
                <ul className={styles['spaces__list']}>
                  {channels.map((c) => (
                    <li
                      key={c.name}
                      className={`${styles['spaces__row']} ${
                        c.origin === 'auto' && arrived
                          ? styles['spaces__row--arrived']
                          : ''
                      }`}
                    >
                      <Icon
                        glyph={
                          c.type === 'private' ? (
                            <LockOutlineIcon />
                          ) : (
                            <GlobeIcon />
                          )
                        }
                        size="16"
                      />
                      <div className={styles['spaces__row-main']}>
                        <span className={styles['spaces__row-title']}>
                          {c.name}
                        </span>
                        <span className={styles['spaces__row-meta']}>
                          {ORIGIN_LABEL[c.origin]}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <section
                className={styles['spaces__panel']}
                aria-labelledby="pages-side-title"
              >
                <div className={styles['spaces__panel-header']}>
                  <h2
                    id="pages-side-title"
                    className={styles['spaces__panel-title']}
                  >
                    Pages
                  </h2>
                  <span className={styles['spaces__panel-aside']}>
                    {pages.length}
                  </span>
                </div>
                <ul className={styles['spaces__list']}>
                  {pages.slice(0, 4).map((p) => (
                    <li key={p.title} className={styles['spaces__row']}>
                      <Icon glyph={<FileTextOutlineIcon />} size="16" />
                      <div className={styles['spaces__row-main']}>
                        <span className={styles['spaces__row-title']}>
                          {p.title}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </div>
      </Scrollbar>
      {toast ? (
        <div className={styles['spaces__toast']} role="status">
          <Toast
            type="info"
            message="INC-1294 joined this Space: its alert matched the campaign's IOCs"
            actionLabel="View tasks"
            onAction={onOpenBoard}
            onDismiss={() => setToast(false)}
          />
        </div>
      ) : null}
    </>
  );
}
