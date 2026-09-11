import ClockOutlineIcon from '@mattermost/compass-icons/components/clock-outline';
import TimelineTextOutlineIcon from '@mattermost/compass-icons/components/timeline-text-outline';
import { Button } from '@mattermost/compass-ui/components/button';
import { Checkbox } from '@mattermost/compass-ui/components/checkbox';
import { Chip } from '@mattermost/compass-ui/components/chip';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { UserAvatarGroup } from '@mattermost/compass-ui/components/user-avatar-group';
import isabellaPng from '@/assets/avatars/Isabella Cruz.png';
import { CIPHER, MATTY, SENTINEL_DEFAULT } from '../agentsData';
import { agentAvatarChipSrc } from './agentAvatarShapes';
import styles from './PlaybookRunRhs.module.scss';

type RunTask = {
  id: string;
  label: string;
  assignee?: { label: string; shape: string; color: string };
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
      {
        id: 'd1',
        label: 'Identify root cause',
        assignee: { label: 'Cipher', shape: CIPHER.shape, color: CIPHER.color },
        done: true,
      },
      { id: 'd2', label: 'Document findings', done: false },
      { id: 'd3', label: 'Assign severity level', done: false },
    ],
  },
  {
    id: 'deployment',
    name: 'Deployment',
    tasks: [
      { id: 'dep1', label: 'Prepare rollback procedure', done: false },
      { id: 'dep2', label: 'Verify deployment health', done: false },
    ],
  },
];

const PARTICIPANTS = [
  { key: 'sentinel', name: 'Sentinel', src: agentAvatarChipSrc(SENTINEL_DEFAULT.shape, SENTINEL_DEFAULT.color) },
  { key: 'cipher', name: 'Cipher', src: agentAvatarChipSrc(CIPHER.shape, CIPHER.color) },
  { key: 'matty', name: 'Matty', src: agentAvatarChipSrc(MATTY.shape, MATTY.color) },
  { key: 'priya', name: 'Priya Shah', src: isabellaPng },
  { key: 'jordan', name: 'Jordan Lee' },
  { key: 'alex', name: 'Alex Rivera' },
  { key: 'otto', name: 'Otto' },
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
      <Button
        size="small"
        emphasis="tertiary"
        className={styles['playbook-run-rhs__timeline-btn']}
        leadingIcon={<Icon glyph={<TimelineTextOutlineIcon />} size="16" />}
        onClick={onViewTimeline}
      >
        View timeline
      </Button>

      <h2 className={styles['playbook-run-rhs__title']}>
        INC-4471: Checkout failures during peak traffic
      </h2>

      <p className={styles['playbook-run-rhs__description']}>
        PayForge webhook event handling error rate exceeded 5.2% threshold. Root cause identified — fix in progress.
      </p>

      <div className={styles['playbook-run-rhs__meta']}>
        <div className={styles['playbook-run-rhs__meta-row']}>
          <span className={styles['playbook-run-rhs__meta-label']}>Status</span>
          <Chip size="medium">In progress</Chip>
        </div>
        <div className={styles['playbook-run-rhs__meta-row']}>
          <span className={styles['playbook-run-rhs__meta-label']}>Severity</span>
          <Chip size="medium">SEV1</Chip>
        </div>
        <div className={styles['playbook-run-rhs__meta-row']}>
          <span className={styles['playbook-run-rhs__meta-label']}>Assignee</span>
          <Chip size="medium" leadingAvatar={{ src: isabellaPng, alt: 'Priya Shah' }}>
            Priya Shah
          </Chip>
        </div>
        <div className={styles['playbook-run-rhs__meta-row']}>
          <span className={styles['playbook-run-rhs__meta-label']}>Participants</span>
          <UserAvatarGroup avatars={PARTICIPANTS} size="24" max={3} />
        </div>
      </div>

      <div className={styles['playbook-run-rhs__update-box']}>
        <div className={styles['playbook-run-rhs__update-left']}>
          <Icon glyph={<ClockOutlineIcon />} size="40" />
          <div className={styles['playbook-run-rhs__update-text']}>
            <span className={styles['playbook-run-rhs__update-label']}>Update due in</span>
            <span className={styles['playbook-run-rhs__update-value']}>6 days</span>
          </div>
        </div>
        <Button emphasis="primary" size="medium" onClick={onPostUpdate}>
          Post update
        </Button>
      </div>

      <div className={styles['playbook-run-rhs__checklists']}>
        <h3 className={styles['playbook-run-rhs__section-title']}>Checklists</h3>
        <div className={styles['playbook-run-rhs__checklist-list']}>
          {PLAYBOOK_RUN_STAGES.map((stage, index) => {
            const doneCount = stage.tasks.filter((t) => t.done).length;
            return (
              <div key={stage.id} className={styles['playbook-run-rhs__checklist-card']}>
                <div className={styles['playbook-run-rhs__checklist-header']}>
                  <span className={styles['playbook-run-rhs__checklist-name']}>
                    {index + 1}. {stage.name}
                  </span>
                  <span className={styles['playbook-run-rhs__checklist-count']}>
                    {doneCount}/{stage.tasks.length} done
                  </span>
                </div>
                <ul className={styles['playbook-run-rhs__task-list']}>
                  {stage.tasks.map((task) => (
                    <li key={task.id} className={styles['playbook-run-rhs__task-item']}>
                      <Checkbox
                        size="medium"
                        checked={task.done}
                        onChange={() => undefined}
                      >
                        <span className={styles['playbook-run-rhs__task-label']}>
                          {task.label}
                        </span>
                      </Checkbox>
                      {task.assignee ? (
                        <div className={styles['playbook-run-rhs__task-tags']}>
                          <Chip
                            size="small"
                            leadingAvatar={{
                              src: agentAvatarChipSrc(task.assignee.shape as any, task.assignee.color as any),
                              alt: task.assignee.label,
                            }}
                          >
                            {task.assignee.label}
                          </Chip>
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
