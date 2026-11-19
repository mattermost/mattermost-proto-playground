import { useState } from 'react';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { ProgressBar } from '@mattermost/compass-ui/components/progress-bar';
import { Tag } from '@mattermost/compass-ui/components/tag';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import { WithTooltip } from '@mattermost/compass-proto';
import CheckCircleIcon from '@mattermost/compass-icons/components/check-circle';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ClockOutlineIcon from '@mattermost/compass-icons/components/clock-outline';
import { PEOPLE } from '../spacesData';
import type { SitrepState } from '../spacesStory';
import styles from './AgentStrip.module.scss';

const STATUS: Record<
  SitrepState,
  { label: string; type: 'info' | 'warning' | 'success'; value: number }
> = {
  drafting: { label: 'Working', type: 'info', value: 55 },
  'needs-input': { label: 'Needs input', type: 'warning', value: 70 },
  ready: { label: 'Ready for review', type: 'success', value: 90 },
};

export interface AgentStripProps {
  state: SitrepState;
  onAnswer: () => void;
}

/**
 * Compact agent task strip: one line at rest, expands to the agent's checklist.
 * Every agent task has a person behind it (the sponsor).
 */
export function AgentStrip({ state, onAnswer }: AgentStripProps) {
  const [expanded, setExpanded] = useState(state === 'needs-input');
  const [posted, setPosted] = useState(false);
  const agent = PEOPLE.agent!;
  const status = posted
    ? { label: 'Posted', type: 'success' as const, value: 100 }
    : STATUS[state];

  const steps = [
    { label: 'Collect numbers from every run, channel and board', done: true },
    {
      label:
        state === 'needs-input'
          ? 'Ask Alex how to count INC-1294'
          : "Draft this week's sitrep",
      done: state !== 'drafting',
    },
    {
      label:
        'Alex reviews, then save as a page and post a summary to the war room',
      done: posted,
    },
  ];

  return (
    <div
      className={`${styles['agent-strip']} ${expanded ? styles['agent-strip--expanded'] : ''}`}
    >
      <div className={styles['agent-strip__bar']}>
        <UserAvatar src={agent.avatar} alt={agent.name} size="24" />
        <div className={styles['agent-strip__label']}>
          <span className={styles['agent-strip__title']}>Weekly sitrep</span>
          <span className={styles['agent-strip__meta']}>
            {agent.name} · sponsor Alex Taylor
          </span>
        </div>
        <Tag label={status.label} type={status.type} size="x-small" />
        <WithTooltip label={expanded ? 'Hide steps' : 'Show steps'}>
          <IconButton
            size="small"
            padding="compact"
            aria-expanded={expanded}
            aria-controls="agent-strip-steps"
            className={styles['agent-strip__toggle']}
            icon={<Icon glyph={<ChevronDownIcon />} />}
            onClick={() => setExpanded((v) => !v)}
          />
        </WithTooltip>
      </div>
      <ProgressBar
        value={status.value}
        size="small"
        aria-label="Sitrep progress"
      />
      <div
        id="agent-strip-steps"
        className={styles['agent-strip__collapse']}
        aria-hidden={!expanded}
      >
        <div className={styles['agent-strip__inner']}>
          <ol className={styles['agent-strip__steps']}>
            {steps.map((s) => (
              <li key={s.label} className={styles['agent-strip__step']}>
                <Icon
                  size="16"
                  glyph={s.done ? <CheckCircleIcon /> : <ClockOutlineIcon />}
                  className={s.done ? styles['agent-strip__done'] : undefined}
                />
                <span>{s.label}</span>
              </li>
            ))}
          </ol>
          {state === 'needs-input' ? (
            <div className={styles['agent-strip__question']}>
              <p>
                Should INC-1294 count as a new successful spray, or as part of
                INC-1281? It changes the &ldquo;14 days with no successful
                spray&rdquo; clock.
              </p>
              <div className={styles['agent-strip__actions']}>
                <Button
                  size="small"
                  emphasis="tertiary"
                  onClick={onAnswer}
                  tabIndex={expanded ? 0 : -1}
                >
                  New success
                </Button>
                <Button
                  size="small"
                  emphasis="tertiary"
                  onClick={onAnswer}
                  tabIndex={expanded ? 0 : -1}
                >
                  Part of INC-1281
                </Button>
              </div>
            </div>
          ) : null}
          {state === 'ready' && !posted ? (
            <div className={styles['agent-strip__actions']}>
              <Button
                size="small"
                emphasis="tertiary"
                onClick={() => setPosted(true)}
                tabIndex={expanded ? 0 : -1}
              >
                Approve and post
              </Button>
              <span className={styles['agent-strip__meta']}>
                Saves &ldquo;Sitrep · week 4&rdquo; to Pages
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
