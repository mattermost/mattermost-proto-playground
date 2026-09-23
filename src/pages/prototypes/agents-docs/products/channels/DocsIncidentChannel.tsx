import { useState } from 'react';
import ArrowCollapseIcon from '@mattermost/compass-icons/components/arrow-collapse';
import ArrowExpandIcon from '@mattermost/compass-icons/components/arrow-expand';
import ClockOutlineIcon from '@mattermost/compass-icons/components/clock-outline';
import CloseIcon from '@mattermost/compass-icons/components/close';
import TimelineTextOutlineIcon from '@mattermost/compass-icons/components/timeline-text-outline';
import { Button } from '@mattermost/compass-ui/components/button';
import { Checkbox } from '@mattermost/compass-ui/components/checkbox';
import { Chip } from '@mattermost/compass-ui/components/chip';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { MessageSeparator } from '@mattermost/compass-ui/components/message-separator';
import { PermalinkPreview } from '@mattermost/compass-ui/components/permalink-preview';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { Tag } from '@mattermost/compass-ui/components/tag';
import { ThreadFooter } from '@mattermost/compass-ui/components/thread-footer';
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
import { useExitAnimation } from '../../../../../hooks/useExitAnimation';
import type { DocsAgentDmMessage } from '../../agentsDocsData';
import { CODER, MATTY, MONITOR, PRIYA } from '../../agentsDocsData';
import { AGENTS_DOCS_BASE } from '../../agentsDocsScenes';
import DocsInlineDelegation, { type InlineDelegationAgent, type InlineDelegationTask } from '../../components/DocsInlineDelegation';
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
        done: false,
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

const MONITOR_POST_ID = 'monitor-root-post';

const MONITOR_DELEGATION_AGENT: InlineDelegationAgent = {
  id: 'monitor', name: MONITOR.name, shape: MONITOR.shape, color: MONITOR.color,
};
const CODER_DELEGATION_AGENT: InlineDelegationAgent = {
  id: 'coder', name: CODER.name, shape: CODER.shape, color: CODER.color,
};

const CODER_THINKING_STEPS = [
  'Reviewing deployment history…',
  'Scanning error logs…',
  'Isolating failure window…',
] as const;

const CODER_INVESTIGATION_TASKS: InlineDelegationTask[] = [
  { id: 'i1', label: 'Review recent deployments', status: 'done', agentId: 'coder', startsAtStep: 0, doneAtStep: 1 },
  { id: 'i2', label: 'Identify root cause', status: 'done', agentId: 'coder', startsAtStep: 1, doneAtStep: 3 },
  { id: 'i3', label: 'Check CDN and DNS configuration', status: 'pending', agentId: 'coder', startsAtStep: 2 },
  { id: 'i4', label: 'Document findings in incident channel', status: 'pending', agentId: 'coder' },
];

const CODER_DM_MESSAGES: DocsAgentDmMessage[] = [
  {
    id: 'inc-dm-1',
    role: 'from',
    text: 'Coder — work through the Investigation checklist. Pull deployment history around 3:09 AM and correlate with the 503 onset.',
    timestamp: '3:14 AM',
    visibleAtStep: 0,
    parts: [
      { type: 'mention', id: 'coder', label: CODER.name, avatarSrc: coderAvatar, kind: 'agent', agentShape: CODER.shape, agentColor: CODER.color },
      { type: 'text', text: ' — work through the Investigation checklist. Pull deployment history around 3:09 AM and correlate with the 503 onset.' },
    ],
  },
  {
    id: 'inc-dm-2',
    role: 'to',
    agentId: 'coder',
    text: 'On it. Reviewing deployment history now.',
    timestamp: '3:14 AM',
    visibleAtStep: 0,
    toolCalls: [
      { tool: 'playbook.check_task', label: 'Marked "Review recent deployments" complete' },
    ],
  },
  {
    id: 'inc-dm-3',
    role: 'to',
    agentId: 'coder',
    text: 'Found it — a CDN cache purge from the 3:09 AM deploy is serving stale 503 responses for static assets. Rolling back the purge config should restore service.',
    timestamp: '3:15 AM',
    visibleAtStep: 3,
    toolCalls: [
      { tool: 'playbook.check_task', label: 'Marked "Identify root cause" complete' },
    ],
  },
];

export default function DocsIncidentChannel() {
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [coderSettled, setCoderSettled] = useState(false);
  const [rhsExpanded, setRhsExpanded] = useState(false);
  const [playbookExpanded, setPlaybookExpanded] = useState(false);
  const { rendered: threadRendered, exiting: threadExiting } = useExitAnimation(!!activePostId, 220);
  const closeThread = () => { setActivePostId(null); setRhsExpanded(false); };

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
                      Playbook run started for the following alert:
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
                <div
                  className={[
                    styles['docs-incident-channel__agent-message'],
                    styles['docs-incident-channel__agent-message--clickable'],
                    activePostId === MONITOR_POST_ID ? styles['docs-incident-channel__agent-message--active'] : '',
                  ].filter(Boolean).join(' ')}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActivePostId(MONITOR_POST_ID)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActivePostId(MONITOR_POST_ID); }}
                >
                  <div className={styles['docs-incident-channel__agent-message-avatar']}>
                    <AgentAvatar shape={MONITOR.shape} color={MONITOR.color} size="sm" eyes />
                  </div>
                  <div className={styles['docs-incident-channel__agent-message-body']}>
                    <div className={styles['docs-incident-channel__agent-message-meta']}>
                      <span className={styles['docs-incident-channel__agent-message-name']}>{MONITOR.name}</span>
                      <Tag label="Agent" size="x-small" />
                      <time className={styles['docs-incident-channel__agent-message-time']}>3:14 AM</time>
                    </div>
                    <p className={[styles['docs-incident-channel__post'], mentionStyles['mention-input__post']].join(' ')}>
                      I&apos;ve assigned{' '}
                      <Chip
                        size="small"
                        leadingAvatar={{ src: coderAvatar, alt: CODER.name }}
                        className={[
                          mentionStyles['mention-input__mention-chip'],
                          mentionStyles['mention-input__post-chip'],
                          mentionStyles['mention-input__mention-chip--agent'],
                        ].join(' ')}
                      >
                        {CODER.name}
                      </Chip>
                      {' to investigate the root cause. I will continue to monitor service status and will post updates in the channel as things progress.'}
                    </p>
                    {coderSettled && (
                      <ThreadFooter
                        replyCount={1}
                        lastReplyTime="3:15 AM"
                        avatars={[{ key: 'coder', name: CODER.name, src: coderAvatar }]}
                        onReply={() => setActivePostId(MONITOR_POST_ID)}
                      />
                    )}
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
          <div className={[
            styles['docs-incident-channel__playbook-panel'],
            playbookExpanded ? styles['docs-incident-channel__playbook-panel--expanded'] : '',
          ].filter(Boolean).join(' ')}>
            <RightSidebar
              fill
              header={
                <div className={styles['docs-incident-channel__rhs-header']}>
                  <div className={styles['docs-incident-channel__rhs-header-title-group']}>
                    <span className={styles['docs-incident-channel__rhs-header-title']}>INC-4472: Docs site outage</span>
                    <span className={styles['docs-incident-channel__rhs-header-subtitle']}>Website outage</span>
                  </div>
                  <div className={styles['docs-incident-channel__rhs-header-actions']}>
                    <IconButton
                      size="small"
                      aria-label={playbookExpanded ? 'Collapse' : 'Expand'}
                      onClick={() => setPlaybookExpanded((v) => !v)}
                      icon={<Icon size="16" glyph={playbookExpanded ? <ArrowCollapseIcon /> : <ArrowExpandIcon />} />}
                    />
                    <IconButton
                      size="small"
                      aria-label="Close"
                      onClick={() => undefined}
                      icon={<Icon size="16" glyph={<CloseIcon />} />}
                    />
                  </div>
                </div>
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
                    const doneCount = stage.tasks.filter((t) => (t.id === 'i1' || t.id === 'i2' ? coderSettled : t.done)).length;
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
                              <Checkbox size="medium" checked={(task.id === 'i1' || task.id === 'i2') ? coderSettled : task.done} onChange={() => undefined}>
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
          {threadRendered && (
            <div className={[
              styles['docs-incident-channel__thread-panel'],
              rhsExpanded ? styles['docs-incident-channel__thread-panel--expanded'] : '',
              threadExiting ? styles['docs-incident-channel__thread-panel--exiting'] : '',
            ].filter(Boolean).join(' ')}>
              <RightSidebar
                fill
                header={
                  <div className={styles['docs-incident-channel__rhs-header']}>
                    <div className={styles['docs-incident-channel__rhs-header-title-group']}>
                      <span className={styles['docs-incident-channel__rhs-header-title']}>Thread</span>
                      <span className={styles['docs-incident-channel__rhs-header-subtitle']}>INC-4472</span>
                    </div>
                    <div className={styles['docs-incident-channel__rhs-header-actions']}>
                      <IconButton
                        size="small"
                        aria-label={rhsExpanded ? 'Collapse' : 'Expand'}
                        onClick={() => setRhsExpanded((v) => !v)}
                        icon={<Icon size="16" glyph={rhsExpanded ? <ArrowCollapseIcon /> : <ArrowExpandIcon />} />}
                      />
                      <IconButton
                        size="small"
                        aria-label="Close"
                        onClick={closeThread}
                        icon={<Icon size="16" glyph={<CloseIcon />} />}
                      />
                    </div>
                  </div>
                }
              >
                <div className={styles['docs-incident-channel__thread-body']}>
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
                      <p className={[styles['docs-incident-channel__post'], mentionStyles['mention-input__post']].join(' ')}>
                        I&apos;ve assigned{' '}
                        <Chip
                          size="small"
                          leadingAvatar={{ src: coderAvatar, alt: CODER.name }}
                          className={[
                            mentionStyles['mention-input__mention-chip'],
                            mentionStyles['mention-input__post-chip'],
                            mentionStyles['mention-input__mention-chip--agent'],
                          ].join(' ')}
                        >
                          {CODER.name}
                        </Chip>
                        {' to investigate the root cause. I will continue to monitor service status and will post updates in the channel as things progress.'}
                      </p>
                    </div>
                  </div>
                  <DocsInlineDelegation
                    label="Coder investigated root cause"
                    fromAgent={MONITOR_DELEGATION_AGENT}
                    toAgents={[CODER_DELEGATION_AGENT]}
                    messages={CODER_DM_MESSAGES}
                    tasks={CODER_INVESTIGATION_TASKS}
                    thinkingSteps={CODER_THINKING_STEPS}
                    onSettled={() => setCoderSettled(true)}
                  />
                </div>
              </RightSidebar>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
