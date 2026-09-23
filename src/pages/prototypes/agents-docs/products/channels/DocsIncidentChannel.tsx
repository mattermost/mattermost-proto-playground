import ClockOutlineIcon from '@mattermost/compass-icons/components/clock-outline';
import TimelineTextOutlineIcon from '@mattermost/compass-icons/components/timeline-text-outline';
import { Button } from '@mattermost/compass-ui/components/button';
import { Checkbox } from '@mattermost/compass-ui/components/checkbox';
import { Chip } from '@mattermost/compass-ui/components/chip';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { MessageSeparator } from '@mattermost/compass-ui/components/message-separator';
import { PermalinkPreview } from '@mattermost/compass-ui/components/permalink-preview';
import { RightSidebarHeader } from '@mattermost/compass-ui/components/right-sidebar-header';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { Tag } from '@mattermost/compass-ui/components/tag';
import { UserAvatarGroup } from '@mattermost/compass-ui/components/user-avatar-group';
import {
  ChannelHeader,
  RightSidebar,
} from '@mattermost/compass-proto';
import AgentAvatar from '../../../agents/components/AgentAvatar';
import { agentAvatarChipSrc } from '../../../agents/components/agentAvatarShapes';
import MentionMessageInput from '../../../agents/components/MentionMessageInput';
import mentionStyles from '../../../agents/components/MentionMessageInput.module.scss';
import ChannelIntro from '../../../agents/products/channels/ChannelIntro';
import ChannelsProductSidebar from '../../../agents/products/channels/ChannelsProductSidebar';
import { CODER, MATTY, MONITOR, PRIYA } from '../../agentsDocsData';
import { AGENTS_DOCS_BASE } from '../../agentsDocsScenes';
import styles from './DocsIncidentChannel.module.scss';

const coderAvatar = agentAvatarChipSrc(CODER.shape, CODER.color);
const monitorAvatar = agentAvatarChipSrc(MONITOR.shape, MONITOR.color);
const mattyAvatar = agentAvatarChipSrc(MATTY.shape, MATTY.color);

const SYSTEM_CHIP_CLASS = [
  mentionStyles['mention-input__mention-chip'],
  mentionStyles['mention-input__post-chip'],
  mentionStyles['mention-input__post-chip--system'],
].join(' ');

type OutageTask = {
  id: string;
  label: string;
  description?: string;
  done: boolean;
  assignees: Array<{ label: string; agentShape?: string; agentColor?: string; avatarSrc: string }>;
};

type OutageStage = {
  id: string;
  name: string;
  status: 'done' | 'active' | 'upcoming';
  tasks: OutageTask[];
};

const OUTAGE_STAGES: OutageStage[] = [
  {
    id: 'triage',
    name: 'Triage',
    status: 'done',
    tasks: [
      {
        id: 't1',
        label: 'Confirm site is down',
        description: "Monitor's health check detected a 503 on docs.mattermost.com. Both primary and fallback nodes are returning errors.",
        done: true,
        assignees: [{ label: MONITOR.name, agentShape: MONITOR.shape, agentColor: MONITOR.color, avatarSrc: monitorAvatar }],
      },
      {
        id: 't2',
        label: 'Open incident channel',
        description: 'Monitor created this channel and started the Website outage playbook run automatically at 3:14 AM.',
        done: true,
        assignees: [{ label: MONITOR.name, agentShape: MONITOR.shape, agentColor: MONITOR.color, avatarSrc: monitorAvatar }],
      },
      {
        id: 't3',
        label: 'Assign severity level',
        description: 'SEV-2 — docs site fully unavailable but no data loss and API subdomain is unaffected.',
        done: true,
        assignees: [{ label: PRIYA.name, avatarSrc: PRIYA.avatarSrc }],
      },
    ],
  },
  {
    id: 'investigation',
    name: 'Investigation',
    status: 'active',
    tasks: [
      {
        id: 'i1',
        label: 'Review recent deployments',
        description: 'Check for any infrastructure changes or deploys in the 30 minutes before the outage began.',
        done: true,
        assignees: [{ label: CODER.name, agentShape: CODER.shape, agentColor: CODER.color, avatarSrc: coderAvatar }],
      },
      {
        id: 'i2',
        label: 'Identify root cause',
        description: 'Correlate error onset with recent changes and analyze server logs for the 503 failure.',
        done: false,
        assignees: [{ label: CODER.name, agentShape: CODER.shape, agentColor: CODER.color, avatarSrc: coderAvatar }],
      },
      {
        id: 'i3',
        label: 'Check CDN and DNS configuration',
        description: 'Verify Cloudflare settings and DNS records are unchanged since the last successful health check.',
        done: false,
        assignees: [{ label: CODER.name, agentShape: CODER.shape, agentColor: CODER.color, avatarSrc: coderAvatar }],
      },
      {
        id: 'i4',
        label: 'Document findings in incident channel',
        description: 'Post a root-cause summary with evidence to INC-4472 before moving to Resolution.',
        done: false,
        assignees: [{ label: CODER.name, agentShape: CODER.shape, agentColor: CODER.color, avatarSrc: coderAvatar }],
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
        label: 'Apply fix or rollback',
        description: "Revert the last infrastructure change or apply a targeted fix based on Coder's root-cause findings.",
        done: false,
        assignees: [{ label: CODER.name, agentShape: CODER.shape, agentColor: CODER.color, avatarSrc: coderAvatar }],
      },
      {
        id: 'r2',
        label: 'Verify site recovery',
        description: 'Confirm docs.mattermost.com returns 200 and all major pages load correctly.',
        done: false,
        assignees: [{ label: MONITOR.name, agentShape: MONITOR.shape, agentColor: MONITOR.color, avatarSrc: monitorAvatar }],
      },
      {
        id: 'r3',
        label: 'Run full health sweep',
        description: 'Trigger Monitor to check all docs subpaths and confirm no secondary pages are still affected.',
        done: false,
        assignees: [{ label: MONITOR.name, agentShape: MONITOR.shape, agentColor: MONITOR.color, avatarSrc: monitorAvatar }],
      },
    ],
  },
  {
    id: 'communication',
    name: 'Communication',
    status: 'upcoming',
    tasks: [
      {
        id: 'c1',
        label: 'Post resolution update to docs-site',
        description: 'Announce the resolution, summarize the outage window, and thank the team.',
        done: false,
        assignees: [{ label: MATTY.name, agentShape: MATTY.shape, agentColor: MATTY.color, avatarSrc: mattyAvatar }],
      },
      {
        id: 'c2',
        label: 'Update external status page',
        description: 'Record the incident on the Mattermost public status page with timeline and resolution notes.',
        done: false,
        assignees: [{ label: MATTY.name, agentShape: MATTY.shape, agentColor: MATTY.color, avatarSrc: mattyAvatar }],
      },
    ],
  },
];


const participants = [
  { key: 'monitor', name: MONITOR.name, src: monitorAvatar },
  { key: 'coder', name: CODER.name, src: coderAvatar },
  { key: 'matty', name: MATTY.name, src: mattyAvatar },
  { key: 'priya', name: PRIYA.name, src: PRIYA.avatarSrc },
];

export default function DocsIncidentChannel() {
  return (
    <div className={styles['docs-incident-channel']}>
      <ChannelsProductSidebar basePath={AGENTS_DOCS_BASE} activeChannelName="INC-4472" />
      <div className={styles['docs-incident-channel__inner']}>
        <div className={styles['docs-incident-channel__center']}>
          <ChannelHeader
            type="channel"
            name="INC-4472"
            description="Docs site outage incident — Monitor started this playbook run."
            memberCount={3}
            pinnedCount={0}
          />
          <div className={styles['docs-incident-channel__messages']}>
            <Scrollbar>
              <div className={styles['docs-incident-channel__messages-list']}>
                <ChannelIntro
                  name="INC-4472"
                  createdBy="Monitor"
                  createdAt="Today at 3:14 AM"
                  description="This channel was created automatically when the Website outage playbook run was started."
                />
                <MessageSeparator type="date" label="Thu, Sep 18" />
                <div className={styles['docs-incident-channel__system']}>
                  <p>
                    <Chip
                      size="small"
                      leadingAvatar={{ src: monitorAvatar, alt: MONITOR.name }}
                      className={SYSTEM_CHIP_CLASS}
                    >
                      {MONITOR.name}
                    </Chip>
                    {' started a new playbook run: Website outage'}
                  </p>
                </div>
                <div className={styles['docs-incident-channel__agent-message']}>
                  <div className={styles['docs-incident-channel__agent-message-avatar']}>
                    <AgentAvatar shape={MONITOR.shape} color={MONITOR.color} size="sm" eyes />
                  </div>
                  <div className={styles['docs-incident-channel__agent-message-body']}>
                    <div className={styles['docs-incident-channel__agent-message-meta']}>
                      <span className={styles['docs-incident-channel__agent-message-name']}>{MONITOR.name}</span>
                      <Tag label="Agent" size="x-small" />
                      <time className={styles['docs-incident-channel__agent-message-time']}>3:14 AM</time>
                    </div>
                    <p className={styles['docs-incident-channel__post']}>
                      Playbook run started. Coder — I&apos;ve assigned you to investigate the root cause. I&apos;ll continue monitoring service status and update the channel.
                    </p>
                    <PermalinkPreview
                      authorName="Mattermost Web Services"
                      avatarSrc=""
                      timestamp="3:14 AM"
                      messageText="Uptime failure: docs.mattermost.com — Health check failed at 3:14 AM. Status 503 Service Unavailable. Duration: 4 min 12 s and counting."
                      originalChannel="#docs-site"
                    />
                  </div>
                </div>
              </div>
            </Scrollbar>
          </div>
          <div className={styles['docs-incident-channel__composer']}>
            <MentionMessageInput placeholder="Message INC-4472" />
          </div>
        </div>
        <div className={styles['docs-incident-channel__rhs']}>
          <RightSidebar
            header={
              <RightSidebarHeader
                title="INC-4472: Docs site outage"
                secondaryTitle="Website outage"
                onExpand={() => undefined}
                onClose={() => undefined}
              />
            }
          >
            <div className={styles['docs-incident-channel__playbook-body']}>
              <Button
                size="small"
                emphasis="tertiary"
                className={styles['docs-incident-channel__playbook-timeline-btn']}
                leadingIcon={<Icon glyph={<TimelineTextOutlineIcon />} size="16" />}
              >
                View timeline
              </Button>

              <div className={styles['docs-incident-channel__playbook-heading']}>
                <h2 className={styles['docs-incident-channel__playbook-title']}>
                  INC-4472: Docs site outage
                </h2>
                <p className={styles['docs-incident-channel__playbook-description']}>
                  docs.mattermost.com health check failed at 3:14 AM. Monitor triggered this run automatically.
                </p>
              </div>

              <div className={styles['docs-incident-channel__playbook-meta']}>
                <div className={styles['docs-incident-channel__playbook-meta-row']}>
                  <span className={styles['docs-incident-channel__playbook-meta-label']}>Status</span>
                  <Chip size="medium">In progress</Chip>
                </div>
                <div className={styles['docs-incident-channel__playbook-meta-row']}>
                  <span className={styles['docs-incident-channel__playbook-meta-label']}>Severity</span>
                  <Chip size="medium">SEV2</Chip>
                </div>
                <div className={styles['docs-incident-channel__playbook-meta-row']}>
                  <span className={styles['docs-incident-channel__playbook-meta-label']}>Assignee</span>
                  <Chip size="medium" leadingAvatar={{ src: PRIYA.avatarSrc, alt: PRIYA.name }}>
                    {PRIYA.name}
                  </Chip>
                </div>
                <div className={styles['docs-incident-channel__playbook-meta-row']}>
                  <span className={styles['docs-incident-channel__playbook-meta-label']}>Participants</span>
                  <UserAvatarGroup avatars={participants} size="24" max={4} />
                </div>
              </div>

              <div className={styles['docs-incident-channel__playbook-update-box']}>
                <div className={styles['docs-incident-channel__playbook-update-left']}>
                  <Icon className={styles['docs-incident-channel__playbook-update-icon']} glyph={<ClockOutlineIcon />} size="40" />
                  <div className={styles['docs-incident-channel__playbook-update-text']}>
                    <span className={styles['docs-incident-channel__playbook-update-label']}>Update due in</span>
                    <span className={styles['docs-incident-channel__playbook-update-value']}>2 hours</span>
                  </div>
                </div>
                <Button emphasis="primary" size="medium">
                  Post update
                </Button>
              </div>

              <div className={styles['docs-incident-channel__playbook-checklists']}>
                <h3 className={styles['docs-incident-channel__playbook-section-title']}>Checklists</h3>
                <div className={styles['docs-incident-channel__playbook-checklist-list']}>
                  {OUTAGE_STAGES.map((stage, index) => {
                    const doneCount = stage.tasks.filter((t) => t.done).length;
                    return (
                      <div
                        key={stage.id}
                        className={[
                          styles['docs-incident-channel__playbook-checklist-card'],
                          stage.status === 'upcoming'
                            ? styles['docs-incident-channel__playbook-checklist-card--upcoming']
                            : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        <div className={styles['docs-incident-channel__playbook-checklist-header']}>
                          <span className={styles['docs-incident-channel__playbook-checklist-name']}>
                            {index + 1}. {stage.name}
                          </span>
                          <span className={styles['docs-incident-channel__playbook-checklist-count']}>
                            {doneCount}/{stage.tasks.length} done
                          </span>
                        </div>
                        <ul className={styles['docs-incident-channel__playbook-task-list']}>
                          {stage.tasks.map((task) => (
                            <li key={task.id} className={styles['docs-incident-channel__playbook-task-item']}>
                              <Checkbox size="medium" checked={task.done} onChange={() => undefined}>
                                <span className={styles['docs-incident-channel__playbook-task-label']}>
                                  {task.label}
                                </span>
                              </Checkbox>
                              {task.description && (
                                <p className={styles['docs-incident-channel__playbook-task-description']}>
                                  {task.description}
                                </p>
                              )}
                              {task.assignees.length > 0 && (
                                <div className={styles['docs-incident-channel__playbook-task-tags']}>
                                  {task.assignees.map((a) => (
                                    <Chip
                                      key={a.label}
                                      size="small"
                                      leadingAvatar={{ src: a.avatarSrc, alt: a.label }}
                                    >
                                      {a.label}
                                    </Chip>
                                  ))}
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </RightSidebar>
        </div>
      </div>
    </div>
  );
}
