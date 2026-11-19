import { useState } from 'react';
import { MessageInput } from '@mattermost/compass-proto';
import { Button } from '@mattermost/compass-ui/components/button';
import { Chip } from '@mattermost/compass-ui/components/chip';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { Tabs } from '@mattermost/compass-ui/components/tabs';
import { Tag } from '@mattermost/compass-ui/components/tag';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import LayersOutlineIcon from '@mattermost/compass-icons/components/layers-outline';
import MessageTextOutlineIcon from '@mattermost/compass-icons/components/message-text-outline';
import { AgentStrip } from '../components/AgentStrip';
import { HealthDot } from '../components/HealthDot';
import { HEALTH_LABEL, OTHER_SPACES, PEOPLE, SPACE } from '../spacesData';
import {
  hardeningDone,
  needsAttention,
  spaceHealth,
  type StoryState,
} from '../spacesStory';
import shared from '../Spaces.module.scss';
import styles from './DayScene.module.scss';

type LoopTab = 'owe' | 'asked' | 'watching';

interface Loop {
  id: string;
  title: string;
  detail: string;
  personId: string;
  source: string;
  sourceKind: 'space' | 'one-off';
  due?: string;
  dueTone?: 'warning' | 'danger';
}

export interface DaySceneProps {
  story: StoryState;
  onStoryChange: (update: Partial<StoryState>) => void;
  onOpenSpace: () => void;
  onOpenDecision: () => void;
}

export default function DayScene({
  story,
  onStoryChange,
  onOpenSpace,
  onOpenDecision,
}: DaySceneProps) {
  const [tab, setTab] = useState<LoopTab>('owe');
  const [onboardingDone, setOnboardingDone] = useState(false);

  const health = spaceHealth(story);
  const hardening = hardeningDone(story);
  const attention = needsAttention(story);

  const owe: Loop[] = [
    ...(story.sitrep === 'needs-input'
      ? [
          {
            id: 'sitrep',
            title: 'Answer the Threat Analyzer Agent',
            detail:
              'The weekly sitrep is paused on one question about INC-1294.',
            personId: 'agent',
            source: SPACE.shortName,
            sourceKind: 'space' as const,
            due: 'Sitrep due Fri',
          },
        ]
      : []),
    ...(!onboardingDone
      ? [
          {
            id: 'onboarding',
            title: "Finish Adam McCall's onboarding",
            detail: 'Jackson asked on Monday. You replied "Will do by Friday."',
            personId: 'jthomas',
            source: 'Direct message',
            sourceKind: 'one-off' as const,
            due: 'Due tomorrow',
            dueTone: 'warning' as const,
          },
        ]
      : []),
    {
      id: 'soc2',
      title: 'Upload access review evidence',
      detail: 'One of three items left before the auditor deadline.',
      personId: 'areid',
      source: 'SOC 2 audit prep',
      sourceKind: 'space',
      due: 'Due in 9 days',
    },
  ];

  const asked: Loop[] = [
    ...(story.decision === 'pending'
      ? [
          {
            id: 'decision',
            title: 'Risk decision: legacy mail client exception',
            detail:
              'Escalated to Alex Reid on Monday. Hardening can’t finish without it.',
            personId: 'areid',
            source: SPACE.shortName,
            sourceKind: 'space' as const,
            due: 'Waiting 2 days',
            dueTone: 'danger' as const,
          },
        ]
      : []),
    {
      id: 'advisory',
      title: 'Review the staff advisory draft',
      detail: 'You asked Rhea for a version without the forensics detail.',
      personId: 'rhull',
      source: SPACE.shortName,
      sourceKind: 'space',
      due: 'Promised Wed',
    },
  ];

  const loops = tab === 'owe' ? owe : asked;

  return (
    <Scrollbar className={shared['spaces__scroll']}>
      <div className={shared['spaces__body']}>
        <header className={styles['day-scene__header']}>
          <span className={shared['spaces__muted']}>Thursday, October 29</span>
          <h1 className={styles['day-scene__title']}>Good morning, Alex</h1>
        </header>

        <section
          className={styles['day-scene__ask']}
          aria-label="Ask about your work"
        >
          <MessageInput
            placeholder="Ask about your work, or tell me what to do…"
            showAttachments={false}
          />
          <div className={styles['day-scene__suggestions']}>
            <Chip
              size="small"
              leadingIcon={<Icon glyph={<CreationOutlineIcon />} size="12" />}
            >
              What changed in the campaign since Monday?
            </Chip>
            <Chip
              size="small"
              leadingIcon={<Icon glyph={<CreationOutlineIcon />} size="12" />}
            >
              What am I waiting on?
            </Chip>
            <Chip
              size="small"
              leadingIcon={<Icon glyph={<CreationOutlineIcon />} size="12" />}
            >
              Draft my update for Alex Reid
            </Chip>
          </div>
        </section>

        <div className={shared['spaces__grid']}>
          <div className={shared['spaces__column']}>
            <section
              className={shared['spaces__panel']}
              aria-labelledby="loops-title"
            >
              <div className={shared['spaces__panel-header']}>
                <h2 id="loops-title" className={shared['spaces__panel-title']}>
                  Your open loops
                </h2>
                <span className={shared['spaces__panel-aside']}>
                  Across every Space, plus one-offs
                </span>
              </div>
              <div className={styles['day-scene__tabs']}>
                <Tabs
                  appearance="underlined"
                  activeKey={tab}
                  onChange={(k) => setTab(k as LoopTab)}
                  tabs={[
                    {
                      key: 'owe',
                      label: 'Waiting on you',
                      countBadge: owe.length,
                    },
                    {
                      key: 'asked',
                      label: 'You asked',
                      countBadge: asked.length,
                    },
                    { key: 'watching', label: 'Watching' },
                  ]}
                />
              </div>
              {tab === 'watching' ? (
                <p className={styles['day-scene__empty']}>
                  You follow 6 threads and 2 runs. Nothing changed since
                  yesterday.
                </p>
              ) : (
                <ul className={shared['spaces__list']}>
                  {loops.map((loop) => {
                    const person = PEOPLE[loop.personId]!;
                    return (
                      <li key={loop.id} className={shared['spaces__row']}>
                        <UserAvatar
                          src={person.avatar}
                          alt={person.name}
                          size="32"
                        />
                        <div className={shared['spaces__row-main']}>
                          <span className={shared['spaces__row-title']}>
                            {loop.title}
                          </span>
                          <span className={shared['spaces__row-meta']}>
                            {loop.detail}
                          </span>
                          <span className={styles['day-scene__source']}>
                            <Icon
                              glyph={
                                loop.sourceKind === 'space' ? (
                                  <LayersOutlineIcon />
                                ) : (
                                  <MessageTextOutlineIcon />
                                )
                              }
                              size="12"
                            />
                            {loop.source}
                            {loop.sourceKind === 'one-off'
                              ? ' · one-off, not in any Space'
                              : ''}
                          </span>
                        </div>
                        <div className={shared['spaces__row-end']}>
                          {loop.due ? (
                            <Tag
                              label={loop.due}
                              type={
                                loop.dueTone === 'danger'
                                  ? 'danger'
                                  : loop.dueTone === 'warning'
                                    ? 'warning'
                                    : 'default'
                              }
                              size="x-small"
                            />
                          ) : null}
                          {loop.id === 'onboarding' ? (
                            <Button
                              size="small"
                              emphasis="tertiary"
                              onClick={() => setOnboardingDone(true)}
                            >
                              Mark done
                            </Button>
                          ) : null}
                          {loop.id === 'decision' ? (
                            <Button
                              size="small"
                              emphasis="tertiary"
                              onClick={onOpenDecision}
                            >
                              Open
                            </Button>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section
              className={shared['spaces__panel']}
              aria-labelledby="agent-day-title"
            >
              <div className={shared['spaces__panel-header']}>
                <h2
                  id="agent-day-title"
                  className={shared['spaces__panel-title']}
                >
                  Agent work you sponsor
                </h2>
              </div>
              <div className={shared['spaces__panel-body']}>
                <AgentStrip
                  state={story.sitrep}
                  onAnswer={() => onStoryChange({ sitrep: 'ready' })}
                />
              </div>
            </section>
          </div>

          <div className={shared['spaces__column']}>
            <section
              className={shared['spaces__panel']}
              aria-labelledby="spaces-title"
            >
              <div className={shared['spaces__panel-header']}>
                <h2 id="spaces-title" className={shared['spaces__panel-title']}>
                  Your Spaces
                </h2>
              </div>
              <ul className={shared['spaces__list']}>
                <li>
                  <button
                    type="button"
                    className={styles['day-scene__space']}
                    onClick={onOpenSpace}
                  >
                    <span className={styles['day-scene__space-top']}>
                      <HealthDot health={health} />
                      <span className={shared['spaces__row-title']}>
                        {SPACE.shortName}
                      </span>
                      <Icon
                        glyph={<ChevronRightIcon />}
                        size="16"
                        className={styles['day-scene__chevron']}
                      />
                    </span>
                    <span className={shared['spaces__row-meta']}>
                      {HEALTH_LABEL[health]} · {attention.length} need attention
                      · ends {SPACE.targetEnd}
                    </span>
                    <span className={styles['day-scene__stats']}>
                      <span>
                        <strong>{hardening.done}/5</strong> units hardened
                      </span>
                      <span>
                        <strong>{story.inc1294Joined ? 2 : 1}</strong> incident
                        runs
                      </span>
                      <span>
                        <strong>{story.decision === 'approved' ? 0 : 1}</strong>{' '}
                        decision open
                      </span>
                    </span>
                  </button>
                </li>
                {OTHER_SPACES.map((s) => (
                  <li key={s.name} className={shared['spaces__row']}>
                    <HealthDot health={s.health} />
                    <div className={shared['spaces__row-main']}>
                      <span className={shared['spaces__row-title']}>
                        {s.name}
                      </span>
                      <span className={shared['spaces__row-meta']}>
                        {s.type} · {s.note}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section
              className={shared['spaces__panel']}
              aria-labelledby="since-title"
            >
              <div className={shared['spaces__panel-header']}>
                <h2 id="since-title" className={shared['spaces__panel-title']}>
                  Since yesterday
                </h2>
              </div>
              <ul className={styles['day-scene__since']}>
                <li>Customer Support finished 2 of 3 hardening steps.</li>
                <li>
                  Detection blocked 312 sign-in attempts from the SentryMBA
                  ranges.
                </li>
                <li>No new successful sprays: day 6 of 14.</li>
              </ul>
              <span className={styles['day-scene__footnote']}>
                Built from run and task events, so it works without an agent.
              </span>
            </section>
          </div>
        </div>
      </div>
    </Scrollbar>
  );
}
