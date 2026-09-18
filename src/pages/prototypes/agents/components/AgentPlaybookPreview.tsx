import { useState, type ComponentType, type SVGProps } from 'react';
import ArrowExpandIcon from '@mattermost/compass-icons/components/arrow-expand';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ClockOutlineIcon from '@mattermost/compass-icons/components/clock-outline';
import CloseIcon from '@mattermost/compass-icons/components/close';
import CurrencyUsdIcon from '@mattermost/compass-icons/components/currency-usd';
import { Checkbox } from '@mattermost/compass-ui/components/checkbox';
import { Chip } from '@mattermost/compass-ui/components/chip';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { Switch } from '@mattermost/compass-ui/components/switch';
import { TextArea } from '@mattermost/compass-ui/components/text-area';
import type { PlaybookDraft } from '../agentsData';
import styles from './AgentPlaybookPreview.module.scss';

type AgentPlaybookPreviewProps = {
  draft: PlaybookDraft;
};

type AgentPlaybookRhsHeaderProps = {
  onClose: () => void;
  onSave?: () => void;
  secondaryTitle?: string;
};

type MetricIcon = ComponentType<SVGProps<SVGSVGElement>>;

const METRIC_ICONS: Record<
  PlaybookDraft['retrospectiveMetrics'][number]['icon'],
  MetricIcon
> = {
  cost: CurrencyUsdIcon,
  time: ClockOutlineIcon,
  customers: CurrencyUsdIcon,
};

function StatusChip({ label }: { label: string }) {
  return (
    <Chip
      size="medium"
      className={styles['agent-playbook-preview__status-chip']}
      onRemove={() => undefined}
    >
      {label}
    </Chip>
  );
}

/** RHS header — Artifact | Playbook + Save split (Figma 134:40632). */
export function AgentPlaybookRhsHeader({
  onClose,
  onSave,
  secondaryTitle = 'Playbook',
}: AgentPlaybookRhsHeaderProps) {
  return (
    <div className={styles['agent-playbook-rhs-header']}>
      <div className={styles['agent-playbook-rhs-header__left']}>
        <span className={styles['agent-playbook-rhs-header__title']}>
          Artifact
        </span>
        <span
          className={styles['agent-playbook-rhs-header__divider']}
          aria-hidden
        />
        <span className={styles['agent-playbook-rhs-header__secondary']}>
          {secondaryTitle}
        </span>
      </div>
      <div className={styles['agent-playbook-rhs-header__actions']}>
        <div className={styles['agent-playbook-rhs-header__save']}>
          <button
            type="button"
            className={styles['agent-playbook-rhs-header__save-primary']}
            onClick={onSave}
          >
            Save
          </button>
          <span
            className={styles['agent-playbook-rhs-header__save-divider']}
            aria-hidden
          />
          <button
            type="button"
            className={styles['agent-playbook-rhs-header__save-chevron']}
            aria-label="Save options"
          >
            <Icon glyph={<ChevronDownIcon />} size="16" />
          </button>
        </div>
        <IconButton
          size="small"
          aria-label="Expand"
          onClick={() => undefined}
          icon={<Icon size="16" glyph={<ArrowExpandIcon />} />}
        />
        <IconButton
          size="small"
          aria-label="Close"
          onClick={onClose}
          icon={<Icon size="16" glyph={<CloseIcon />} />}
        />
      </div>
    </div>
  );
}

/** RHS playbook artifact preview — Figma 134:40631. */
export default function AgentPlaybookPreview({
  draft,
}: AgentPlaybookPreviewProps) {
  const [statusUpdatesOn, setStatusUpdatesOn] = useState(true);
  const [retrospectiveOn, setRetrospectiveOn] = useState(true);
  const [summary, setSummary] = useState(draft.summary);
  const [statusTemplate, setStatusTemplate] = useState(
    draft.statusTemplate.join('\n'),
  );
  const [retrospectiveTemplate, setRetrospectiveTemplate] = useState(
    draft.retrospectiveTemplate.join('\n'),
  );

  return (
    <div className={styles['agent-playbook-preview']}>
      <h2 className={styles['agent-playbook-preview__title']}>{draft.title}</h2>

      <section className={styles['agent-playbook-preview__section']}>
        <h3 className={styles['agent-playbook-preview__section-title']}>
          Summary
        </h3>
        <TextArea
          className={styles['agent-playbook-preview__field']}
          aria-label="Summary"
          size="medium"
          rows={4}
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
        />
      </section>

      <section className={styles['agent-playbook-preview__section']}>
        <h3 className={styles['agent-playbook-preview__section-title']}>
          Checklists
        </h3>
        <div className={styles['agent-playbook-preview__checklists']}>
          {draft.stages.map((stage, index) => (
            <div
              key={stage.id}
              className={styles['agent-playbook-preview__checklist']}
            >
              <div className={styles['agent-playbook-preview__checklist-header']}>
                <p className={styles['agent-playbook-preview__checklist-name']}>
                  {index + 1}. {stage.name}
                </p>
                <p className={styles['agent-playbook-preview__checklist-count']}>
                  {stage.tasks.length} tasks
                </p>
              </div>
              <ul className={styles['agent-playbook-preview__tasks']}>
                {stage.tasks.map((task) => (
                  <li
                    key={task.id}
                    className={styles['agent-playbook-preview__task']}
                  >
                    <Checkbox
                      className={styles['agent-playbook-preview__checkbox']}
                      size="medium"
                      aria-label={task.label}
                      checked={false}
                      onChange={() => undefined}
                    >
                      <span className={styles['agent-playbook-preview__task-copy']}>
                        <span
                          className={styles['agent-playbook-preview__task-label']}
                        >
                          {task.label}
                        </span>
                        {task.description ? (
                          <span
                            className={
                              styles['agent-playbook-preview__task-description']
                            }
                          >
                            {task.description}
                          </span>
                        ) : null}
                        {task.assignee ? (
                          <Chip
                            size="small"
                            className={styles['agent-playbook-preview__assignee-chip']}
                          >
                            {task.assignee}
                          </Chip>
                        ) : null}
                      </span>
                    </Checkbox>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className={styles['agent-playbook-preview__section']}>
        <Switch
          className={styles['agent-playbook-preview__status-switch']}
          size="small"
          checked={statusUpdatesOn}
          aria-label="Enable status updates"
          onChange={(event) => setStatusUpdatesOn(event.target.checked)}
        >
          <span className={styles['agent-playbook-preview__section-title']}>
            Status updates
          </span>
        </Switch>

        {statusUpdatesOn ? (
          <>
            <div className={styles['agent-playbook-preview__status-copy']}>
              <p>
                A status update is expected every{' '}
                <StatusChip label={draft.statusUpdateEvery} />
              </p>
              <p>
                New updates will be posted to{' '}
                <StatusChip label={draft.statusChannels} /> and{' '}
                <StatusChip label={draft.statusWebhooks} /> URL.
              </p>
            </div>

            <div className={styles['agent-playbook-preview__template-block']}>
              <h4 className={styles['agent-playbook-preview__template-title']}>
                Status update template
              </h4>
              <TextArea
                className={styles['agent-playbook-preview__field']}
                aria-label="Status update template"
                size="medium"
                rows={8}
                value={statusTemplate}
                onChange={(event) => setStatusTemplate(event.target.value)}
              />
            </div>
          </>
        ) : null}
      </section>

      <section className={styles['agent-playbook-preview__section']}>
        <Switch
          className={styles['agent-playbook-preview__status-switch']}
          size="small"
          checked={retrospectiveOn}
          aria-label="Enable retrospective"
          onChange={(event) => setRetrospectiveOn(event.target.checked)}
        >
          <span className={styles['agent-playbook-preview__section-title']}>
            Retrospective
          </span>
        </Switch>

        {retrospectiveOn ? (
          <>
            <p className={styles['agent-playbook-preview__retro-copy']}>
              A reminder to publish the retrospective will be sent every{' '}
              <StatusChip label={draft.retrospectiveReminder} /> after the run
              is finished.
            </p>

            <div className={styles['agent-playbook-preview__metrics']}>
              {draft.retrospectiveMetrics.map((metric) => {
                const Glyph = METRIC_ICONS[metric.icon];
                return (
                  <div
                    key={metric.id}
                    className={styles['agent-playbook-preview__metric']}
                  >
                    <span
                      className={styles['agent-playbook-preview__metric-icon']}
                      aria-hidden
                    >
                      <Icon glyph={<Glyph />} size="16" />
                    </span>
                    <div className={styles['agent-playbook-preview__metric-copy']}>
                      <p
                        className={styles['agent-playbook-preview__metric-label']}
                      >
                        {metric.label}
                      </p>
                      <p
                        className={
                          styles['agent-playbook-preview__metric-target']
                        }
                      >
                        {metric.target}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <TextArea
              className={styles['agent-playbook-preview__field']}
              aria-label="Retrospective template"
              size="medium"
              rows={12}
              value={retrospectiveTemplate}
              onChange={(event) =>
                setRetrospectiveTemplate(event.target.value)
              }
            />
          </>
        ) : null}
      </section>
    </div>
  );
}
