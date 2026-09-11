import ClockOutlineIcon from '@mattermost/compass-icons/components/clock-outline';
import { Button } from '@mattermost/compass-ui/components/button';
import { Checkbox } from '@mattermost/compass-ui/components/checkbox';
import { Icon } from '@mattermost/compass-ui/components/icon';
import previewStyles from './AgentPlaybookPreview.module.scss';
import styles from './PlaybookRunRhs.module.scss';

type RunTask = {
  id: string;
  label: string;
  assignee?: string;
  done: boolean;
};

type RunStage = {
  id: string;
  name: string;
  tasks: RunTask[];
};

const PLAYBOOK_RUN_STAGES: RunStage[] = [
  {
    id: 'diagnosis',
    name: 'Diagnosis',
    tasks: [
      { id: 'd1', label: 'Identify root cause', assignee: 'Cipher', done: true },
      { id: 'd2', label: 'Document findings for postmortem', done: false },
    ],
  },
  {
    id: 'deployment',
    name: 'Deployment',
    tasks: [
      { id: 'dep1', label: 'Prepare rollback procedure', assignee: 'Otto', done: false },
      { id: 'dep2', label: 'Verify deployment health', assignee: 'Otto', done: false },
    ],
  },
  {
    id: 'resolution',
    name: 'Resolution',
    tasks: [
      {
        id: 'res1',
        label: 'Fix PayForge webhook handler',
        assignee: 'Alex + Dynamo',
        done: false,
      },
      { id: 'res2', label: 'Verify fix in staging', assignee: 'Alex', done: false },
      { id: 'res3', label: 'Update INC-4471 ticket status', done: false },
    ],
  },
];

type PlaybookRunRhsProps = {
  onPostUpdate?: () => void;
  onViewTimeline?: () => void;
};

/** Body content for the playbook run RHS panel — rendered inside a RightSidebar. */
export default function PlaybookRunRhs({
  onPostUpdate,
  onViewTimeline,
}: PlaybookRunRhsProps) {
  return (
    <div className={styles['playbook-run-rhs']}>
      <div className={styles['playbook-run-rhs__actions']}>
        <Button
          size="small"
          emphasis="tertiary"
          onClick={onViewTimeline}
        >
          View timeline
        </Button>
      </div>

      <div>
        <h2 className={styles['playbook-run-rhs__title']}>
          INC-4471: Checkout failures during peak traffic
        </h2>
      </div>

      <p className={styles['playbook-run-rhs__description']}>
        PayForge webhook event handling error rate exceeded 5.2% threshold. Root cause identified — fix in progress.
      </p>

      <div className={styles['playbook-run-rhs__meta']}>
        <div className={styles['playbook-run-rhs__meta-row']}>
          <span className={styles['playbook-run-rhs__meta-label']}>Status</span>
          <span className={styles['playbook-run-rhs__meta-value']}>
            <span className={styles['playbook-run-rhs__status']}>
              <span className={styles['playbook-run-rhs__status-dot']} aria-hidden />
              In Progress
            </span>
          </span>
        </div>
        <div className={styles['playbook-run-rhs__meta-row']}>
          <span className={styles['playbook-run-rhs__meta-label']}>Assignee</span>
          <span className={styles['playbook-run-rhs__meta-value']}>Priya Shah</span>
        </div>
        <div className={styles['playbook-run-rhs__meta-row']}>
          <span className={styles['playbook-run-rhs__meta-label']}>Participants</span>
          <span className={styles['playbook-run-rhs__meta-value']}>
            Priya, Jordan, Sentinel, Cipher, Otto, Alex, Dynamo
          </span>
        </div>
      </div>

      <div className={styles['playbook-run-rhs__update-box']}>
        <div className={styles['playbook-run-rhs__update-body']}>
          <Icon glyph={<ClockOutlineIcon />} size="16" />
          <span className={styles['playbook-run-rhs__update-text']}>
            Update due in 2 days
          </span>
        </div>
        <Button emphasis="primary" size="medium" onClick={onPostUpdate}>
          Post update
        </Button>
      </div>

      <div className={styles['playbook-run-rhs__checklists-section']}>
        <h3 className={styles['playbook-run-rhs__section-title']}>Checklists</h3>
        <div className={previewStyles['agent-playbook-preview__checklists']}>
          {PLAYBOOK_RUN_STAGES.map((stage, index) => (
            <div
              key={stage.id}
              className={previewStyles['agent-playbook-preview__checklist']}
            >
              <div className={previewStyles['agent-playbook-preview__checklist-header']}>
                <p className={previewStyles['agent-playbook-preview__checklist-name']}>
                  {index + 1}. {stage.name}
                </p>
                <p className={previewStyles['agent-playbook-preview__checklist-count']}>
                  {stage.tasks.filter((t) => t.done).length}/{stage.tasks.length} done
                </p>
              </div>
              <ul className={previewStyles['agent-playbook-preview__tasks']}>
                {stage.tasks.map((task) => (
                  <li
                    key={task.id}
                    className={previewStyles['agent-playbook-preview__task']}
                  >
                    <Checkbox
                      className={previewStyles['agent-playbook-preview__checkbox']}
                      size="medium"
                      aria-label={task.label}
                      checked={task.done}
                      onChange={() => undefined}
                    >
                      <span className={previewStyles['agent-playbook-preview__task-copy']}>
                        <span className={previewStyles['agent-playbook-preview__task-label']}>
                          {task.label}
                        </span>
                        {task.assignee ? (
                          <span className={previewStyles['agent-playbook-preview__assignee']}>
                            {task.assignee}
                          </span>
                        ) : null}
                      </span>
                    </Checkbox>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
