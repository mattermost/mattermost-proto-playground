import ClockOutlineIcon from '@mattermost/compass-icons/components/clock-outline';
import TimelineTextOutlineIcon from '@mattermost/compass-icons/components/timeline-text-outline';
import { Button } from '@mattermost/compass-ui/components/button';
import { Checkbox } from '@mattermost/compass-ui/components/checkbox';
import { Chip } from '@mattermost/compass-ui/components/chip';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { UserAvatarGroup } from '@mattermost/compass-ui/components/user-avatar-group';
import isabellaPng from '@/assets/avatars/Isabella Cruz.png';
import ethanPng from '@/assets/avatars/Ethan Brooks.png';
import { ALEX, CIPHER, DYNAMO, JORDAN, MATTY, OTTO, SENTINEL_DEFAULT, VIEWER } from '../agentsData';
import { agentAvatarChipSrc } from './agentAvatarShapes';
import styles from './PlaybookRunRhs.module.scss';

type RunTaskAssignee = {
  label: string;
  agentShape?: string;
  agentColor?: string;
  avatarSrc?: string;
};

type RunTask = {
  id: string;
  label: string;
  description?: string;
  assignees?: RunTaskAssignee[];
  done: boolean;
};

type RunStage = {
  id: string;
  name: string;
  status: 'done' | 'active' | 'upcoming';
  tasks: RunTask[];
};

const sentinelAvatar = agentAvatarChipSrc(SENTINEL_DEFAULT.shape, SENTINEL_DEFAULT.color);
const cipherAvatar = agentAvatarChipSrc(CIPHER.shape, CIPHER.color);
const mattyAvatar = agentAvatarChipSrc(MATTY.shape, MATTY.color);
const ottoAvatar = agentAvatarChipSrc(OTTO.shape, OTTO.color);
const dynamoAvatar = agentAvatarChipSrc(DYNAMO.shape, DYNAMO.color);

const PLAYBOOK_RUN_STAGES: RunStage[] = [
  {
    id: 'triage',
    name: 'Triage',
    status: 'done',
    tasks: [
      {
        id: 't1',
        label: 'Confirm impact and affected services',
        description: 'Verify which services are degraded and estimate customer impact scope.',
        assignees: [{ label: SENTINEL_DEFAULT.name, agentShape: SENTINEL_DEFAULT.shape, agentColor: SENTINEL_DEFAULT.color, avatarSrc: sentinelAvatar }],
        done: true,
      },
      {
        id: 't2',
        label: 'Open incident ticket',
        description: 'Create a Jira ticket and link it to this channel. Use the impact summary from Sentinel.',
        assignees: [{ label: MATTY.name, agentShape: MATTY.shape, agentColor: MATTY.color, avatarSrc: mattyAvatar }],
        done: true,
      },
      {
        id: 't3',
        label: 'Assign severity level',
        description: 'Declare SEV-1 given checkout impact on active peak traffic.',
        assignees: [{ label: VIEWER.name, avatarSrc: isabellaPng }],
        done: true,
      },
    ],
  },
  {
    id: 'diagnosis',
    name: 'Diagnosis',
    status: 'active',
    tasks: [
      {
        id: 'd1',
        label: 'Identify root cause',
        description: 'Correlate error onset with build 8842 deployment window and analyze webhook retry logs.',
        assignees: [{ label: CIPHER.name, agentShape: CIPHER.shape, agentColor: CIPHER.color, avatarSrc: cipherAvatar }],
        done: true,
      },
      {
        id: 'd2',
        label: 'Document findings in ticket',
        description: 'Post Cipher\'s root-cause summary directly to INC-4471 as a comment.',
        assignees: [{ label: CIPHER.name, agentShape: CIPHER.shape, agentColor: CIPHER.color, avatarSrc: cipherAvatar }],
        done: false,
      },
      {
        id: 'd3',
        label: 'Reconcile and confirm root cause',
        description: 'Cross-check findings against infra telemetry before moving to Resolution.',
        assignees: [{ label: VIEWER.name, avatarSrc: isabellaPng }],
        done: false,
      },
    ],
  },
  {
    id: 'resolution',
    name: 'Resolution',
    status: 'upcoming',
    tasks: [
      {
        id: 'r1',
        label: 'Fix PayForge webhook handler',
        description: 'Restore header propagation in WebhookClient.sendWithRetry — see Cipher\'s full report for the exact change.',
        assignees: [
          { label: ALEX.name, avatarSrc: ethanPng },
          { label: DYNAMO.name, agentShape: DYNAMO.shape, agentColor: DYNAMO.color, avatarSrc: dynamoAvatar },
        ],
        done: false,
      },
      {
        id: 'r2',
        label: 'Open PR and get approval',
        description: 'Create a PR against main, request review, and wait for approval before merging.',
        assignees: [
          { label: ALEX.name, avatarSrc: ethanPng },
          { label: DYNAMO.name, agentShape: DYNAMO.shape, agentColor: DYNAMO.color, avatarSrc: dynamoAvatar },
        ],
        done: false,
      },
    ],
  },
  {
    id: 'deployment',
    name: 'Deployment',
    status: 'upcoming',
    tasks: [
      {
        id: 'dep1',
        label: 'Roll back deployment',
        description: 'Stage a rollback to build 8841 as a fallback if the code fix doesn\'t land in time.',
        assignees: [{ label: OTTO.name, agentShape: OTTO.shape, agentColor: OTTO.color, avatarSrc: ottoAvatar }],
        done: false,
      },
      {
        id: 'dep2',
        label: 'Verify deployment health',
        description: 'Confirm error rate recovers to baseline after the fix or rollback is applied.',
        assignees: [
          { label: OTTO.name, agentShape: OTTO.shape, agentColor: OTTO.color, avatarSrc: ottoAvatar },
          { label: JORDAN.name, avatarSrc: JORDAN.avatarSrc },
        ],
        done: false,
      },
    ],
  },
];

const PARTICIPANTS = [
  { key: 'sentinel', name: SENTINEL_DEFAULT.name, src: sentinelAvatar },
  { key: 'cipher', name: CIPHER.name, src: cipherAvatar },
  { key: 'matty', name: MATTY.name, src: mattyAvatar },
  { key: 'priya', name: VIEWER.name, src: isabellaPng },
  { key: 'jordan', name: JORDAN.name, src: JORDAN.avatarSrc },
  { key: 'alex', name: ALEX.name, src: ethanPng },
  { key: 'otto', name: OTTO.name, src: ottoAvatar },
  { key: 'dynamo', name: DYNAMO.name, src: dynamoAvatar },
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
          <Chip size="medium" leadingAvatar={{ src: isabellaPng, alt: VIEWER.name }}>
            {VIEWER.name}
          </Chip>
        </div>
        <div className={styles['playbook-run-rhs__meta-row']}>
          <span className={styles['playbook-run-rhs__meta-label']}>Participants</span>
          <UserAvatarGroup avatars={PARTICIPANTS} size="24" max={4} />
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
              <div
                key={stage.id}
                className={[
                  styles['playbook-run-rhs__checklist-card'],
                  stage.status === 'done' ? styles['playbook-run-rhs__checklist-card--done'] : '',
                  stage.status === 'upcoming' ? styles['playbook-run-rhs__checklist-card--upcoming'] : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
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
                      {task.description ? (
                        <p className={styles['playbook-run-rhs__task-description']}>
                          {task.description}
                        </p>
                      ) : null}
                      {task.assignees?.length ? (
                        <div className={styles['playbook-run-rhs__task-tags']}>
                          {task.assignees.map((a) => (
                            <Chip
                              key={a.label}
                              size="small"
                              leadingAvatar={{ src: a.avatarSrc ?? '', alt: a.label }}
                            >
                              {a.label}
                            </Chip>
                          ))}
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
