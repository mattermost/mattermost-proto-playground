import { useState } from 'react';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ClockOutlineIcon from '@mattermost/compass-icons/components/clock-outline';
import EyeOutlineIcon from '@mattermost/compass-icons/components/eye-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import TrashCanOutlineIcon from '@mattermost/compass-icons/components/trash-can-outline';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import { Select } from '@mattermost/compass-ui/components/select';
import { TextArea } from '@mattermost/compass-ui/components/text-area';
import { TextInput } from '@mattermost/compass-ui/components/text-input';
import {
  SCHEDULED_JOB_PATTERN_OPTIONS,
  SCHEDULED_JOB_TIME_OPTIONS,
  formatScheduledJobSubtitle,
  type ScheduledJob,
  type ScheduledJobRecurrence,
} from '../agentsData';
import styles from './AgentSettingsModal.module.scss';

type AgentSettingsTasksPanelProps = {
  jobs: ScheduledJob[];
  onChange: (jobs: ScheduledJob[]) => void;
};

function nextJobId(): string {
  return `job-${Date.now().toString(36)}`;
}

function updateJob(
  jobs: ScheduledJob[],
  index: number,
  patch: Partial<ScheduledJob>,
): ScheduledJob[] {
  return jobs.map((item, i) => (i === index ? { ...item, ...patch } : item));
}

function patternValue(job: ScheduledJob): string {
  return job.trigger === 'continuous'
    ? 'continuous'
    : (job.recurrence ?? 'daily');
}

export default function AgentSettingsTasksPanel({
  jobs,
  onChange,
}: AgentSettingsTasksPanelProps) {
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  return (
    <div className={styles['agent-settings-modal__access']}>
      <div className={styles['agent-settings-modal__access-block']}>
        <div className={styles['agent-settings-modal__section-header']}>
          <h3 className={styles['agent-settings-modal__section-title']}>
            Automated tasks
          </h3>
          <p className={styles['agent-settings-modal__help']}>
            Standing jobs this agent handles without being asked — the routine
            work you&apos;d rather never think about again.
          </p>
        </div>
        <div
          className={styles['agent-settings-modal__jobs']}
          role="list"
          aria-label="Automated tasks"
        >
          {jobs.map((job, index) => {
            const expanded = expandedJobId === job.id;
            const detailsId = `agent-job-details-${job.id}`;
            const isContinuous = job.trigger === 'continuous';

            return (
              <div
                key={job.id}
                className={styles['agent-settings-modal__job']}
                role="listitem"
              >
                <MenuItem
                  type="button"
                  className={styles['agent-settings-modal__job-item']}
                  label={job.title || 'Untitled task'}
                  secondaryLabel={formatScheduledJobSubtitle(job)}
                  secondaryLabelPosition="below"
                  active={expanded}
                  aria-expanded={expanded}
                  aria-controls={detailsId}
                  leadingVisual={
                    <Icon
                      glyph={
                        isContinuous ? (
                          <EyeOutlineIcon />
                        ) : (
                          <ClockOutlineIcon />
                        )
                      }
                      size="16"
                    />
                  }
                  trailingElement
                  trailingVisual={
                    <span
                      className={[
                        styles['agent-settings-modal__job-chevron'],
                        expanded
                          ? styles['agent-settings-modal__job-chevron--expanded']
                          : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      aria-hidden
                    >
                      <Icon glyph={<ChevronDownIcon />} size="16" />
                    </span>
                  }
                  onClick={() =>
                    setExpandedJobId((prev) =>
                      prev === job.id ? null : job.id,
                    )
                  }
                />
                <div
                  id={detailsId}
                  className={[
                    styles['agent-settings-modal__job-details'],
                    expanded
                      ? styles['agent-settings-modal__job-details--expanded']
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden={!expanded}
                >
                  <div
                    className={styles['agent-settings-modal__job-details-inner']}
                  >
                    <div className={styles['agent-settings-modal__job-fields']}>
                      <TextInput
                        label="Title"
                        value={job.title}
                        onChange={(e) =>
                          onChange(
                            updateJob(jobs, index, { title: e.target.value }),
                          )
                        }
                        aria-label={`Task ${index + 1} title`}
                      />
                      <div
                        className={[
                          styles['agent-settings-modal__job-schedule'],
                          isContinuous
                            ? styles[
                                'agent-settings-modal__job-schedule--continuous'
                              ]
                            : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        <Select
                          label="Recurring pattern"
                          size="medium"
                          value={patternValue(job)}
                          options={SCHEDULED_JOB_PATTERN_OPTIONS}
                          onChange={(value) => {
                            if (value === 'continuous') {
                              onChange(
                                updateJob(jobs, index, {
                                  trigger: 'continuous',
                                  recurrence: undefined,
                                  time: undefined,
                                }),
                              );
                              return;
                            }
                            onChange(
                              updateJob(jobs, index, {
                                trigger: 'schedule',
                                recurrence: value as ScheduledJobRecurrence,
                                time: job.time ?? '09:00',
                              }),
                            );
                          }}
                          zIndex={1400}
                          aria-label={`Task ${index + 1} recurring pattern`}
                        />
                        {!isContinuous ? (
                          <Select
                            label="Time"
                            size="medium"
                            value={job.time ?? '09:00'}
                            options={SCHEDULED_JOB_TIME_OPTIONS}
                            onChange={(time) =>
                              onChange(updateJob(jobs, index, { time }))
                            }
                            zIndex={1400}
                            aria-label={`Task ${index + 1} time`}
                          />
                        ) : null}
                      </div>
                      <TextArea
                        label="Instructions"
                        value={job.instructions}
                        rows={4}
                        onChange={(e) =>
                          onChange(
                            updateJob(jobs, index, {
                              instructions: e.target.value,
                            }),
                          )
                        }
                        placeholder="What should this agent do when the task runs?"
                        aria-label={`Task ${index + 1} instructions`}
                      />
                      <Button
                        className={styles['agent-settings-modal__job-remove']}
                        emphasis="tertiary"
                        destructive
                        leadingIcon={
                          <Icon glyph={<TrashCanOutlineIcon />} size="16" />
                        }
                        onClick={() => {
                          if (expandedJobId === job.id) {
                            setExpandedJobId(null);
                          }
                          onChange(jobs.filter((_, i) => i !== index));
                        }}
                      >
                        Remove task
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <Button
          className={styles['agent-settings-modal__add-job']}
          emphasis="tertiary"
          leadingIcon={<Icon glyph={<PlusIcon />} size="16" />}
          onClick={() => {
            const id = nextJobId();
            onChange([
              ...jobs,
              {
                id,
                title: '',
                trigger: 'schedule',
                recurrence: 'daily',
                time: '09:00',
                instructions: '',
              },
            ]);
            setExpandedJobId(id);
          }}
        >
          Add scheduled work
        </Button>
      </div>
    </div>
  );
}
