import { Chip } from '@mattermost/compass-ui/components/chip';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { ProgressBar } from '@mattermost/compass-ui/components/progress-bar';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { Tag } from '@mattermost/compass-ui/components/tag';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import { AgentChatBox } from '../components/AgentChatBox';
import {
  FRESHNESS_LABEL,
  FRESHNESS_TAG,
  rollupNodes,
  type EnvironmentFixture,
  type RollupView,
  type SpaceFixture,
} from '../environments';
import shared from '../Spaces.module.scss';
import styles from './DayScene.module.scss';

export interface DaySceneProps {
  environment: EnvironmentFixture;
  rollup: RollupView;
  onOpenSpace: (spaceId: string) => void;
}

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const width = 72;
  const height = 28;
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / span) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      className={styles['day-scene__spark']}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      <polyline points={points} />
    </svg>
  );
}

function spaceMeta(space: SpaceFixture, leak: boolean): string {
  if (space.tenure === 'standing') {
    return space.freshness
      ? `Reference · ${FRESHNESS_LABEL[space.freshness]}`
      : 'Reference';
  }
  const visible = rollupNodes(space.children, leak).length;
  const state = space.state ? `${space.state} · ` : '';
  return `${state}${visible} items${space.timeframe ? ` · ${space.timeframe}` : ''}`;
}

export default function DayScene({
  environment,
  rollup,
  onOpenSpace,
}: DaySceneProps) {
  const leak = rollup === 'leak';
  const temporary = environment.spaces.filter((s) => s.tenure === 'temporary');
  const standing = environment.spaces.filter((s) => s.tenure === 'standing');
  const metrics = environment.metrics.map((metric) => {
    if (environment.id === 'b' && metric.id === 'visible') {
      return leak
        ? {
            ...metric,
            value: '2',
            detail: 'Force-on-force, plus one restricted mission.',
            bar: 100,
          }
        : {
            ...metric,
            value: '1',
            detail: 'Force-on-force only. The partner annex is removed.',
            bar: 50,
          };
    }
    if (environment.id !== 'b' || metric.id !== 'hidden') return metric;
    if (leak) {
      return {
        ...metric,
        value: '1',
        detail: 'One restricted mission is listed.',
        bar: 100,
      };
    }
    return {
      ...metric,
      value: '0',
      detail: 'Restricted missions are hidden.',
      bar: 0,
    };
  });

  return (
    <Scrollbar className={shared['spaces__scroll']}>
      <div className={shared['spaces__body']}>
        <header className={styles['day-scene__header']}>
          <span className={shared['spaces__muted']}>
            {environment.dateLabel}
          </span>
          <h1 className={styles['day-scene__title']}>Good morning, Alex</h1>
          <span className={shared['spaces__muted']}>
            {environment.title} · {environment.audience}
          </span>
        </header>

        <section
          className={styles['day-scene__ask']}
          aria-label="Ask about your work"
        >
          <AgentChatBox placeholder="Ask about your work, or tell me what to do…" />
          <div className={styles['day-scene__suggestions']}>
            {environment.suggestions.map((suggestion) => (
              <Chip
                key={suggestion}
                size="small"
                leadingIcon={<Icon glyph={<CreationOutlineIcon />} size="12" />}
              >
                {suggestion}
              </Chip>
            ))}
          </div>
        </section>

        <section className={styles['day-scene__metrics']} aria-label="Status">
          {metrics.map((metric) => (
            <article key={metric.id} className={styles['day-scene__metric']}>
              <div className={styles['day-scene__metric-top']}>
                <span className={styles['day-scene__metric-value']}>
                  {metric.value}
                </span>
                {metric.series ? <Sparkline values={metric.series} /> : null}
              </div>
              <span className={styles['day-scene__metric-label']}>
                {metric.label}
              </span>
              {metric.bar != null ? (
                <ProgressBar
                  value={metric.bar}
                  size="small"
                  aria-label={metric.label}
                />
              ) : null}
              <span className={styles['day-scene__metric-detail']}>
                {metric.detail}
              </span>
            </article>
          ))}
        </section>

        <div className={shared['spaces__grid']}>
          <section
            className={shared['spaces__panel']}
            aria-labelledby="temporary-title"
          >
            <div className={shared['spaces__panel-header']}>
              <h2
                id="temporary-title"
                className={shared['spaces__panel-title']}
              >
                Active
              </h2>
              <span className={shared['spaces__panel-aside']}>Open</span>
            </div>
            {temporary.length === 0 ? (
              <p className={styles['day-scene__empty']}>No open Spaces.</p>
            ) : (
              <ul className={shared['spaces__list']}>
                {temporary.map((space) => (
                  <li key={space.id}>
                    <button
                      type="button"
                      className={styles['day-scene__space']}
                      onClick={() => onOpenSpace(space.id)}
                    >
                      <span className={styles['day-scene__space-top']}>
                        <span className={shared['spaces__row-title']}>
                          {space.name}
                        </span>
                        <Tag label={space.vocabulary} size="x-small" />
                        {space.state ? (
                          <Tag label={space.state} type="info" size="x-small" />
                        ) : null}
                        <Icon
                          glyph={<ChevronRightIcon />}
                          size="16"
                          className={styles['day-scene__chevron']}
                        />
                      </span>
                      <span className={shared['spaces__row-meta']}>
                        {spaceMeta(space, leak)}
                      </span>
                      {space.progress != null ? (
                        <ProgressBar
                          value={space.progress}
                          size="small"
                          aria-label={`${space.name} progress`}
                        />
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <h3 id="updates-title" className={styles['day-scene__subhead']}>
              Open items
            </h3>
            <ul className={shared['spaces__list']}>
              {environment.updates.map((item) => (
                <li key={item.id} className={shared['spaces__row']}>
                  <div className={shared['spaces__row-main']}>
                    <span className={shared['spaces__row-title']}>
                      {item.title}
                    </span>
                    <span className={shared['spaces__row-meta']}>
                      {item.detail}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <div className={shared['spaces__column']}>
            <section
              className={shared['spaces__panel']}
              aria-labelledby="standing-title"
            >
              <div className={shared['spaces__panel-header']}>
                <h2
                  id="standing-title"
                  className={shared['spaces__panel-title']}
                >
                  Reference
                </h2>
                <span className={shared['spaces__panel-aside']}>Kept</span>
              </div>
              {standing.length === 0 ? (
                <p className={styles['day-scene__empty']}>
                  No reference Spaces.
                </p>
              ) : (
                <ul className={shared['spaces__list']}>
                  {standing.map((space) => (
                    <li key={space.id}>
                      <button
                        type="button"
                        className={styles['day-scene__space']}
                        onClick={() => onOpenSpace(space.id)}
                      >
                        <span className={styles['day-scene__space-top']}>
                          <span className={shared['spaces__row-title']}>
                            {space.name}
                          </span>
                          {space.freshness ? (
                            <Tag
                              label={FRESHNESS_LABEL[space.freshness]}
                              type={FRESHNESS_TAG[space.freshness]}
                              size="x-small"
                            />
                          ) : null}
                          <Icon
                            glyph={<ChevronRightIcon />}
                            size="16"
                            className={styles['day-scene__chevron']}
                          />
                        </span>
                        <span className={shared['spaces__row-meta']}>
                          {space.summary}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {environment.agent ? (
              <section
                className={shared['spaces__panel']}
                aria-labelledby="agent-day-title"
              >
                <div className={shared['spaces__panel-header']}>
                  <h2
                    id="agent-day-title"
                    className={shared['spaces__panel-title']}
                  >
                    {environment.agent.name}
                  </h2>
                </div>
                <div className={shared['spaces__panel-body']}>
                  <span className={shared['spaces__row-meta']}>
                    {environment.agent.status}
                  </span>
                  <ProgressBar
                    value={environment.agent.progress}
                    size="small"
                    aria-label={`${environment.agent.name} progress`}
                  />
                </div>
              </section>
            ) : null}

            <section
              className={shared['spaces__panel']}
              aria-labelledby="rollup-title"
            >
              <div className={shared['spaces__panel-header']}>
                <h2 id="rollup-title" className={shared['spaces__panel-title']}>
                  Status
                </h2>
              </div>
              <ul className={styles['day-scene__since']}>
                {environment.callouts.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </Scrollbar>
  );
}
