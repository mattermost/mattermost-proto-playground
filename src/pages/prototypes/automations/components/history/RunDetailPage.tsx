import ArrowLeftIcon from '@mattermost/compass-icons/components/arrow-left';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { Tag } from '@mattermost/compass-ui/components/tag';
import { useNavigate, useParams } from 'react-router-dom';
import { useAutomations } from '../../context/AutomationsContext';
import styles from './history.module.scss';

const BASE = '/prototypes/automations';

export default function RunDetailPage() {
  const { id = '', runId = '' } = useParams();
  const navigate = useNavigate();
  const { getAutomation, getRun } = useAutomations();
  const automation = getAutomation(id);
  const run = getRun(runId);

  if (!automation || !run || run.automationId !== id) {
    return (
      <div className={styles.history}>
        <p>Run not found</p>
        <Button
          emphasis="tertiary"
          size="small"
          onClick={() => navigate(`${BASE}/${id}/runs`)}
        >
          Back to runs
        </Button>
      </div>
    );
  }

  return (
    <Scrollbar className={styles.history}>
      <div className={styles.history__header}>
        <div className={styles['history__title-row']}>
          <IconButton
            aria-label="Back to runs"
            size="small"
            padding="compact"
            icon={<Icon size="16" glyph={<ArrowLeftIcon />} />}
            onClick={() => navigate(`${BASE}/${id}/runs`)}
          />
          <h1 className={styles.history__title}>Run detail · {automation.name}</h1>
        </div>
        <Button
          emphasis="tertiary"
          size="small"
          onClick={() => navigate(`${BASE}/${id}/editor`)}
        >
          Open editor
        </Button>
      </div>
      <Tag
        label={run.status}
        size="x-small"
        type={run.status === 'success' ? 'success' : 'danger'}
      />
      <p className={styles.detail__meta}>
        Started {new Date(run.startedAt).toLocaleString()} · {run.durationMs} ms
      </p>

      <section className={styles.detail__section}>
        <h3>Trigger payload</h3>
        <pre className={styles.detail__code}>
          {JSON.stringify(run.triggerPayload, null, 2)}
        </pre>
      </section>

      <section className={styles.detail__section}>
        <h3>Steps</h3>
        {run.steps.map((step) => (
          <div key={step.id} className={styles.detail__step}>
            <div className={styles['detail__step-head']}>
              <strong>{step.label}</strong>
              <Tag
                label={step.status}
                size="x-small"
                type={step.status === 'success' ? 'success' : 'danger'}
              />
              <span className={styles['detail__step-id']}>{step.id}</span>
            </div>
            <div className={styles.detail__io}>
              <div>
                <h3>Input</h3>
                <pre className={styles.detail__code}>
                  {JSON.stringify(step.input, null, 2)}
                </pre>
              </div>
              <div>
                <h3>Output</h3>
                <pre className={styles.detail__code}>
                  {JSON.stringify(step.output, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        ))}
      </section>
    </Scrollbar>
  );
}
