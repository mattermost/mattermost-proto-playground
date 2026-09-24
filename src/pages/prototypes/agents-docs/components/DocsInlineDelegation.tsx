import CheckCircleIcon from '@mattermost/compass-icons/components/check-circle';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import GithubCircleIcon from '@mattermost/compass-icons/components/github-circle';
import PlaylistCheckIcon from '@mattermost/compass-icons/components/playlist-check';
import { Chip } from '@mattermost/compass-ui/components/chip';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Spinner } from '@mattermost/compass-ui/components/spinner';
import { useEffect, useRef, useState } from 'react';
import type { AgentColor, AgentShape, ChannelMessagePart } from '../../agents/agentsData';
import { agentAvatarChipSrc, agentMidColor } from '../../agents/components/agentAvatarShapes';
import AgentAvatar from '../../agents/components/AgentAvatar';
import AgentArtifactCard from '../../agents/components/AgentArtifactCard';
import AgentTypingDots from '../../agents/components/AgentTypingDots';
import mentionStyles from '../../agents/components/MentionMessageInput.module.scss';
import type { DocsAgentDmMessage, DocsToolCall } from '../agentsDocsData';
import styles from './DocsInlineDelegation.module.scss';

export type InlineDelegationAgent = {
  id: string;
  name: string;
  shape: AgentShape;
  color: AgentColor;
};

export type InlineDelegationTask = {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'done';
  agentId?: string;
  startsAtStep?: number;
  doneAtStep?: number;
};

// Delay before the sequence begins (lets Matty's message finish rendering first).
const SEQUENCE_START_DELAY_MS = 2200;
const STEP_DURATION_MS = 1400;
const STREAM_MS_PER_WORD = 50;

function useStreamedText(text: string, startDelay = 0) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!words.length) return;
    let n = 0;
    let intervalId: number;
    const start = () => {
      intervalId = window.setInterval(() => {
        n += 1;
        setCount(n);
        if (n >= words.length) window.clearInterval(intervalId);
      }, STREAM_MS_PER_WORD);
    };
    if (startDelay > 0) {
      const delayId = window.setTimeout(start, startDelay);
      return () => { window.clearTimeout(delayId); window.clearInterval(intervalId); };
    }
    start();
    return () => window.clearInterval(intervalId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { visible: words.slice(0, count).join(' '), complete: count >= words.length };
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function formatTitle(fromAgent: InlineDelegationAgent, toAgents: InlineDelegationAgent[]): string {
  const names = [fromAgent.name, ...toAgents.map((a) => a.name)];
  if (names.length <= 2) return names.join(' & ');
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
}

function computeTaskStatus(
  task: InlineDelegationTask,
  thinkingIndex: number,
  settled: boolean,
): InlineDelegationTask['status'] {
  if (settled || task.startsAtStep === undefined) return task.status;
  if (task.doneAtStep !== undefined && thinkingIndex >= task.doneAtStep) return 'done';
  if (thinkingIndex >= task.startsAtStep) return 'running';
  return 'pending';
}

function CardTaskStatusIcon({ status }: { status: InlineDelegationTask['status'] }) {
  if (status === 'done') {
    return (
      <span className={[
        styles['inline-delegation__card-task-status'],
        styles['inline-delegation__card-task-status--done'],
      ].join(' ')}>
        <Icon size="16" glyph={<CheckCircleIcon />} />
      </span>
    );
  }
  if (status === 'running') {
    return (
      <span className={[
        styles['inline-delegation__card-task-status'],
        styles['inline-delegation__card-task-status--running'],
      ].join(' ')}>
        <Spinner size="12" />
      </span>
    );
  }
  return (
    <span className={[
      styles['inline-delegation__card-task-status'],
      styles['inline-delegation__card-task-status--pending'],
    ].join(' ')} />
  );
}

function DmMessageBody({ text, parts }: { text: string; parts?: ChannelMessagePart[] }) {
  if (!parts?.length) {
    return <p className={styles['inline-delegation__msg-text']}>{text}</p>;
  }
  return (
    <p className={[styles['inline-delegation__msg-text'], mentionStyles['mention-input__post']].join(' ')}>
      {parts.map((part, i) =>
        part.type === 'text' ? (
          <span key={i}>{part.text}</span>
        ) : part.type === 'mention' ? (
          <Chip
            key={i}
            size="small"
            compact
            leadingAvatar={{
              src: part.agentShape && part.agentColor
                ? agentAvatarChipSrc(part.agentShape as AgentShape, part.agentColor as AgentColor)
                : (part.avatarSrc || ''),
              alt: part.label,
            }}
            className={[
              mentionStyles['mention-input__mention-chip'],
              mentionStyles['mention-input__post-chip'],
              mentionStyles['mention-input__post-chip--system'],
              part.kind === 'agent' ? mentionStyles['mention-input__mention-chip--agent'] : '',
            ].filter(Boolean).join(' ')}
          >
            {part.label}
          </Chip>
        ) : null,
      )}
    </p>
  );
}

function toolCallIcon(tool: string) {
  if (tool.startsWith('playbook.')) return <PlaylistCheckIcon />;
  return <GithubCircleIcon />;
}

function ToolCallList({ toolCalls }: { toolCalls: DocsToolCall[] }) {
  return (
    <div className={styles['inline-delegation__msg-tool-calls']}>
      {toolCalls.map((tc, i) => (
        <div key={i} className={styles['inline-delegation__msg-tool-call']}>
          <span className={styles['inline-delegation__msg-tool-call-icon']}>
            <Icon size="10" glyph={toolCallIcon(tc.tool)} />
          </span>
          <span className={styles['inline-delegation__msg-tool-call-name']}>{tc.tool}</span>
          <span className={styles['inline-delegation__msg-tool-call-sep']}>·</span>
          <span className={styles['inline-delegation__msg-tool-call-label']}>{tc.label}</span>
        </div>
      ))}
    </div>
  );
}

function StreamingDmMessageBody({
  text,
  parts,
  startDelay = 0,
  children,
}: {
  text: string;
  parts?: ChannelMessagePart[];
  startDelay?: number;
  children?: React.ReactNode;
}) {
  const { visible, complete } = useStreamedText(text, startDelay);
  return (
    <>
      {complete
        ? <DmMessageBody text={text} parts={parts} />
        : <p className={styles['inline-delegation__msg-text']}>{visible}</p>}
      {complete && children}
    </>
  );
}

type DocsInlineDelegationProps = {
  label: string;
  fromAgent: InlineDelegationAgent;
  toAgents: InlineDelegationAgent[];
  messages: DocsAgentDmMessage[];
  tasks?: InlineDelegationTask[];
  thinkingSteps?: readonly string[];
  onSettled?: () => void;
  onArtifactOpen?: (title: string) => void;
};

export default function DocsInlineDelegation({
  label,
  fromAgent,
  toAgents,
  messages,
  tasks,
  thinkingSteps,
  onSettled,
  onArtifactOpen,
}: DocsInlineDelegationProps) {
  const hasThinking = Boolean(thinkingSteps?.length);

  // Hidden until SEQUENCE_START_DELAY_MS has passed (lets preceding message finish).
  const [ready, setReady] = useState(!hasThinking);
  // -1 = no thinking; 0..n-1 = in progress; n = settled
  const [thinkingIndex, setThinkingIndex] = useState(hasThinking ? 0 : -1);
  const [expanded, setExpanded] = useState(false);

  const settled = !hasThinking || thinkingIndex >= thinkingSteps!.length;

  // Fire onSettled once when the thinking sequence completes.
  const firedSettled = useRef(false);
  useEffect(() => {
    if (settled && hasThinking && !firedSettled.current) {
      firedSettled.current = true;
      onSettled?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settled]);

  useEffect(() => {
    if (!hasThinking) return;

    let stepTimer: number;

    const startSequence = () => {
      setReady(true);
      let current = 0;
      const advance = () => {
        current += 1;
        setThinkingIndex(current);
        if (current < thinkingSteps!.length) {
          stepTimer = window.setTimeout(advance, STEP_DURATION_MS);
        }
      };
      stepTimer = window.setTimeout(advance, STEP_DURATION_MS);
    };

    const startTimer = window.setTimeout(startSequence, SEQUENCE_START_DELAY_MS);
    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(stepTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) return null;

  const allAgents = [fromAgent, ...toAgents];
  const hasTasks = Boolean(tasks?.length);
  const doneCount = tasks
    ? tasks.filter((t) => computeTaskStatus(t, thinkingIndex, settled) === 'done').length
    : 0;

  const triggerLabel = settled && hasTasks
    ? `${formatTitle(fromAgent, toAgents)} worked to complete ${tasks!.length} task${tasks!.length !== 1 ? 's' : ''}`
    : !settled
      ? thinkingSteps![thinkingIndex]
      : label;

  const visibleMessages = settled
    ? messages
    : messages.filter((m) => m.visibleAtStep === undefined || m.visibleAtStep <= thinkingIndex);

  // For messages that become visible at the same step (or all at once), compute sequential
  // stream delays so they appear one after the other rather than simultaneously.
  // Key is the effective "reveal key": visibleAtStep value, or 'settled' when no step.
  const streamDelays = new Map<string, number>();
  const revealGroupAccum = new Map<string | number, number>();
  for (const m of visibleMessages) {
    const key = m.visibleAtStep ?? 'settled';
    const prev = revealGroupAccum.get(key) ?? 0;
    streamDelays.set(m.id, prev);
    revealGroupAccum.set(key, prev + wordCount(m.text) * STREAM_MS_PER_WORD);
  }

  // Next speaker — the agent whose message is about to appear (drives typing dots).
  const nextMessage = !settled
    ? messages.find((m) => m.visibleAtStep !== undefined && m.visibleAtStep > thinkingIndex)
    : undefined;
  const nextSpeaker = nextMessage
    ? (nextMessage.role === 'from'
        ? fromAgent
        : (toAgents.find((a) => a.id === nextMessage.agentId) ?? toAgents[0]))
    : undefined;

  return (
    <div className={styles['inline-delegation']}>
      <button
        type="button"
        className={styles['inline-delegation__trigger']}
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        <span className={[
          styles['inline-delegation__chevron'],
          expanded ? styles['inline-delegation__chevron--open'] : '',
        ].filter(Boolean).join(' ')}>
          <Icon size="12" glyph={<ChevronRightIcon />} />
        </span>
        {!settled && (
          <span className={styles['inline-delegation__thinking-spinner']}>
            <Spinner size="12" />
          </span>
        )}
        <div className={[
          styles['inline-delegation__avatars'],
          styles['inline-delegation__avatars--trigger'],
        ].join(' ')}>
          {allAgents.map((a) => (
            <span key={a.id} className={styles['inline-delegation__avatar-wrap']}>
              <AgentAvatar shape={a.shape} color={a.color} size="xs" eyes shadow={false} outlined />
            </span>
          ))}
        </div>
        <span className={styles['inline-delegation__label']}>{triggerLabel}</span>
      </button>

      <div className={[
        styles['inline-delegation__collapse'],
        expanded ? styles['inline-delegation__collapse--expanded'] : '',
      ].filter(Boolean).join(' ')}>
        <div className={styles['inline-delegation__collapse-inner']}>
          <div className={styles['inline-delegation__card']}>

            {/* Task list panel */}
            {hasTasks && (
              <div className={styles['inline-delegation__card-tasks']}>
                <div className={styles['inline-delegation__card-tasks-header']}>
                  <span className={styles['inline-delegation__card-tasks-title']}>
                    <Icon size="16" glyph={<PlaylistCheckIcon />} />
                    Tasks
                  </span>
                  <span className={styles['inline-delegation__card-tasks-count']}>
                    {doneCount} of {tasks!.length} done
                  </span>
                </div>
                {tasks!.map((task) => {
                  const agent = allAgents.find((a) => a.id === task.agentId);
                  const effectiveStatus = computeTaskStatus(task, thinkingIndex, settled);
                  return (
                    <div key={task.id} className={styles['inline-delegation__card-task']}>
                      <CardTaskStatusIcon status={effectiveStatus} />
                      <span className={[
                        styles['inline-delegation__card-task-label'],
                        effectiveStatus === 'done' ? styles['inline-delegation__card-task-label--done'] : '',
                      ].filter(Boolean).join(' ')}>
                        {task.label}
                      </span>
                      {agent && (
                        <span
                          className={styles['inline-delegation__card-task-agent']}
                          style={{ '--agent-dot-color': agentMidColor(agent.color) } as React.CSSProperties}
                        >
                          <span className={styles['inline-delegation__card-task-agent-dot']} />
                          {agent.name}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* DM transcript — filtered by step during thinking, all messages when settled */}
            {(visibleMessages.length > 0 || nextSpeaker) && (
              <div className={styles['inline-delegation__messages']}>
                {visibleMessages.map((m) => {
                  const speaker = m.role === 'from'
                    ? fromAgent
                    : (toAgents.find((a) => a.id === m.agentId) ?? toAgents[0]);
                  return (
                    <div key={m.id} className={styles['inline-delegation__msg']}>
                      <span className={styles['inline-delegation__msg-avatar']}>
                        <AgentAvatar shape={speaker.shape} color={speaker.color} size="xs" eyes shadow={false} outlined />
                      </span>
                      <div className={styles['inline-delegation__msg-content']}>
                        <div className={styles['inline-delegation__msg-meta']}>
                          <span className={styles['inline-delegation__msg-name']}>{speaker.name}</span>
                          <time className={styles['inline-delegation__msg-time']}>{m.timestamp}</time>
                        </div>
                        <StreamingDmMessageBody text={m.text} parts={m.parts} startDelay={streamDelays.get(m.id) ?? 0}>
                          {m.toolCalls && <ToolCallList toolCalls={m.toolCalls} />}
                          {m.artifact && (
                            <div className={styles['inline-delegation__msg-artifact']}>
                              <AgentArtifactCard
                                title={m.artifact.title}
                                meta={m.artifact.meta}
                                compact
                                onOpen={onArtifactOpen ? () => onArtifactOpen(m.artifact!.title) : undefined}
                              />
                            </div>
                          )}
                        </StreamingDmMessageBody>
                      </div>
                    </div>
                  );
                })}
                {nextSpeaker && (
                  <div className={styles['inline-delegation__msg']}>
                    <span className={styles['inline-delegation__msg-avatar']}>
                      <AgentAvatar shape={nextSpeaker.shape} color={nextSpeaker.color} size="xs" eyes shadow={false} outlined />
                    </span>
                    <div className={styles['inline-delegation__msg-content']}>
                      <AgentTypingDots label={`${nextSpeaker.name} is thinking`} />
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
