import ArrowLeftIcon from '@mattermost/compass-icons/components/arrow-left';
import { Button, Icon, Scrollbar, Tag } from '@mattermost/compass-ui';
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
          emphasis="Tertiary"
          size="Small"
          onClick={() => navigate(`${BASE}/${id}/runs`)}
        >
          Back to runs
        </Button>
      </div>
    );
  }

  return (
    <Scrollbar className={styles.history}>
      <div className={styles.history__toolbar}>
        <Button
          emphasis="Tertiary"
          size="Small"
          leadingIcon={<Icon size="16" glyph={<ArrowLeftIcon />} />}
          onClick={() => navigate(`${BASE}/${id}/runs`)}
        >
          Back to runs
        </Button>
        <Button
          emphasis="Tertiary"
          size="Small"
          onClick={() => navigate(`${BASE}/${id}/editor`)}
        >
          Back to editor
        </Button>
      </div>
      <h1 className={styles.history__title}>Run detail · {automation.name}</h1>
      <Tag
        label={run.status}
        size="X-Small"
        type={run.status === 'success' ? 'Success' : 'Danger'}
      />
      <p style={{ margin: '8px 0 0', fontSize: 13, opacity: 0.72 }}>
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
                size="X-Small"
                type={step.status === 'success' ? 'Success' : 'Danger'}
              />
              <span style={{ opacity: 0.56, fontSize: 12 }}>{step.id}</span>
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
