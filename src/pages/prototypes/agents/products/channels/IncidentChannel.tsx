import { useEffect, useRef, useState } from 'react';
import { useExitAnimation } from '@/hooks/useExitAnimation';
import CheckCircleOutlineIcon from '@mattermost/compass-icons/components/check-circle-outline';
import { Chip } from '@mattermost/compass-ui/components/chip';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Message } from '@mattermost/compass-ui/components/message';
import { MessageSeparator } from '@mattermost/compass-ui/components/message-separator';
import { RightSidebarHeader } from '@mattermost/compass-ui/components/right-sidebar';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { Spinner } from '@mattermost/compass-ui/components/spinner';
import { Tag } from '@mattermost/compass-ui/components/tag';
import { ThreadFooter } from '@mattermost/compass-ui/components/thread-footer';
import {
  ChannelHeader,
  RightSidebar,
  RightSidebarThread,
  type RightSidebarThreadMessage,
} from '@mattermost/compass-proto';
import {
  CIPHER,
  INCIDENT_CHANNEL_MESSAGES,
  JORDAN,
  MATTY,
  SENTINEL_DEFAULT,
  WORKSPACE_AGENTS,
  type ChannelMessage,
  type WorkspaceAgent,
} from '../../agentsData';
import AgentArtifactCard from '../../components/AgentArtifactCard';
import AgentAvatar from '../../components/AgentAvatar';
import { AgentPlaybookRhsHeader } from '../../components/AgentPlaybookPreview';
import AgentProfilePopover, {
  profileAnchorFromEvent,
  type AgentProfileAnchor,
} from '../../components/AgentProfilePopover';
import { agentAvatarChipSrc } from '../../components/agentAvatarShapes';
import AgentTypingDots from '../../components/AgentTypingDots';
import JiraCard from '../../components/JiraCard';
import ChannelIntro from './ChannelIntro';
import MarkdownArtifactRhs from './MarkdownArtifactRhs';
import MentionMessageInput from '../../components/MentionMessageInput';
import mentionStyles from '../../components/MentionMessageInput.module.scss';
import PlaybookRunRhs from '../../components/PlaybookRunRhs';
import ChannelsProductSidebar from './ChannelsProductSidebar';
import styles from './IncidentChannel.module.scss';

// Cipher reply sequence phases — only active when inc-sentinel-1 thread is open
type CipherPhase = 'idle' | 'typing' | 'ack' | 'thinking' | 'result' | 'done';

const SENTINEL_POST_ID = 'inc-sentinel-1';

const CIPHER_ACK_TEXT = "On it — I'll dig into the error traces now.";
const CIPHER_RESULT_TEXT =
  'Analyzed 847 error traces from build 8842. Root cause: the new webhook retry handler drops the Authorization header on redirect. The 5% error spike is pure auth failures — downstream payment gateway is rejecting unsigned requests. Fix: restore header propagation in WebhookClient.sendWithRetry. P1 — every retry is a failed transaction. See the full report for details.';
const CIPHER_STATUS_LABELS = ['Thinking…', 'Connecting to tools…', 'Analyzing logs…'] as const;
const CIPHER_STATUS_MS = 1100;
const STREAM_MS_PER_WORD = 32;

/** Duration the thread / artifact panel open/close animation plays. */
const PANEL_EXIT_MS = 300;
/** Duration typing dots show before ack starts streaming. */
const TYPING_DURATION_MS = 1000;

const CIPHER_ACK_JOINED = CIPHER_ACK_TEXT.trim().split(/\s+/).filter(Boolean).join(' ');
const CIPHER_RESULT_JOINED = CIPHER_RESULT_TEXT.trim().split(/\s+/).filter(Boolean).join(' ');

// Static thread data for the Matty post
const MATTY_THREAD_MESSAGES: RightSidebarThreadMessage[] = [
  {
    avatarSrc: agentAvatarChipSrc(MATTY.shape, MATTY.color),
    avatarAlt: MATTY.name,
    username: MATTY.name,
    timestamp: '2:15 PM',
    body: <>I&apos;ve created Jira ticket <a href="https://mattermost.atlassian.net/browse/INC-4471" target="_blank" rel="noreferrer" className={styles['incident-channel__link']}>INC-4471</a> for this incident and started the Incident Response playbook. Sentinel is on the Diagnosis stage and Otto is pre-assigned to Deployment — same playbook assignments from when you saved it.</>,
  },
  {
    avatarSrc: JORDAN.avatarSrc,
    avatarAlt: JORDAN.avatarAlt,
    username: JORDAN.name,
    timestamp: '2:15 PM',
    body: "On it — I'll take point on the Deployment checklist once Diagnosis is done. Looping in Emma from on-call just in case.",
  },
];

const SENTINEL_ROOT_MSG: RightSidebarThreadMessage = {
  avatarSrc: agentAvatarChipSrc(SENTINEL_DEFAULT.shape, SENTINEL_DEFAULT.color),
  avatarAlt: SENTINEL_DEFAULT.name,
  username: SENTINEL_DEFAULT.name,
  timestamp: '2:16 PM',
  body: "PayForge webhook error rate hit 5.2% at 2:14 PM — threshold is 5%. Error onset matches the deployment of build 8842 exactly at T+0. Signature doesn't point to one cause cleanly. Cipher, can you dig in?",
};

const CIPHER_AVATAR_SRC = agentAvatarChipSrc(CIPHER.shape, CIPHER.color);

function useStreamedText(text: string, enabled: boolean): string {
  const [visibleWordCount, setVisibleWordCount] = useState(0);
  const words = text.trim().split(/\s+/).filter(Boolean);
  const totalWords = words.length;

  useEffect(() => {
    setVisibleWordCount(0);
    if (!enabled || totalWords === 0) return;
    let count = 0;
    const id = window.setInterval(() => {
      count += 1;
      setVisibleWordCount(count);
      if (count >= totalWords) window.clearInterval(id);
    }, STREAM_MS_PER_WORD);
    return () => window.clearInterval(id);
  }, [text, totalWords, enabled]);

  return words.slice(0, visibleWordCount).join(' ');
}

type OnAgentClick = (agent: WorkspaceAgent, e: React.MouseEvent<HTMLElement>) => void;

function agentForMessage(message: ChannelMessage): WorkspaceAgent | null {
  if (!message.agentShape || !message.agentColor) return null;
  return (
    WORKSPACE_AGENTS.find(
      (a) => a.shape === message.agentShape && a.color === message.agentColor,
    ) ?? null
  );
}

function agentById(id: string): WorkspaceAgent | undefined {
  return WORKSPACE_AGENTS.find((a) => a.id === id);
}

function renderParts(message: ChannelMessage, onAgentClick: OnAgentClick) {
  if (!message.parts?.length) {
    return <p className={styles['incident-channel__post']}>{message.body}</p>;
  }
  return (
    <p className={mentionStyles['mention-input__post']}>
      {message.parts.map((part, i) =>
        part.type === 'text' ? (
          <span key={i}>{part.text}</span>
        ) : part.type === 'link' ? (
          <a key={i} href={part.href} target="_blank" rel="noreferrer" className={styles['incident-channel__link']}>{part.text}</a>
        ) : (
          <Chip
            key={i}
            size="medium-compact"
            leadingAvatar={{
              src:
                part.agentShape && part.agentColor
                  ? agentAvatarChipSrc(part.agentShape, part.agentColor)
                  : part.avatarSrc || '',
              alt: part.label,
            }}
            className={[
              mentionStyles['mention-input__mention-chip'],
              mentionStyles['mention-input__post-chip'],
              part.kind === 'agent' ? mentionStyles['mention-input__mention-chip--agent'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={(e) => {
              e.stopPropagation();
              if (part.kind === 'agent' && part.id) {
                const agent = agentById(part.id);
                if (agent) onAgentClick(agent, e as React.MouseEvent<HTMLElement>);
              }
            }}
          >
            {part.label}
          </Chip>
        ),
      )}
    </p>
  );
}

function AgentPost({
  message,
  onAgentClick,
  onOpenThread,
  showThreadReplies = false,
}: {
  message: ChannelMessage;
  onAgentClick: OnAgentClick;
  onOpenThread: () => void;
  showThreadReplies?: boolean;
}) {
  const agent = agentForMessage(message);
  return (
    <article
      className={styles['incident-channel__agent-message']}
      role="button"
      tabIndex={0}
      onClick={onOpenThread}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpenThread();
      }}
    >
      <div
        className={styles['incident-channel__agent-message-avatar']}
        role={agent ? 'button' : undefined}
        tabIndex={agent ? 0 : undefined}
        style={{ cursor: agent ? 'pointer' : undefined }}
        onClick={(e) => {
          e.stopPropagation();
          if (agent) onAgentClick(agent, e);
        }}
        onKeyDown={(e) => {
          if (agent && (e.key === 'Enter' || e.key === ' ')) {
            e.stopPropagation();
            onAgentClick(agent, e as unknown as React.MouseEvent<HTMLElement>);
          }
        }}
      >
        <AgentAvatar
          shape={message.agentShape ?? 'sphere'}
          color={message.agentColor ?? 'blue'}
          size="sm"
          eyes
          shadow={false}
        />
      </div>
      <div className={styles['incident-channel__agent-message-body']}>
        <div className={styles['incident-channel__agent-message-meta']}>
          <span className={styles['incident-channel__agent-message-name']}>
            {message.username}
          </span>
          <Tag label="Agent" size="x-small" />
          <time className={styles['incident-channel__agent-message-time']}>
            {message.timestamp}
          </time>
        </div>
        {renderParts(message, onAgentClick)}
        {message.jiraCard ? <JiraCard card={message.jiraCard} /> : null}
        {message.threadReplies && showThreadReplies ? (
          <div className={styles['incident-channel__thread-footer']}>
            <ThreadFooter
              replyCount={message.threadReplies.count}
              lastReplyTime={message.threadReplies.lastReplyTime}
              avatars={message.threadReplies.participants.map((p) => ({
                key: p.key,
                name: p.name,
                src:
                  p.agentShape && p.agentColor
                    ? agentAvatarChipSrc(p.agentShape, p.agentColor)
                    : p.avatarSrc,
              }))}
              onReply={onOpenThread}
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}

/** Incident channel view — INC-4471 with playbook run RHS open. */
export default function IncidentChannel() {
  // ID of the post whose thread is open, or null when the thread panel is closed.
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const threadOpen = activePostId !== null;

  const { rendered: threadRendered, exiting: threadExiting } = useExitAnimation(
    threadOpen,
    PANEL_EXIT_MS,
  );

  const [artifactOpen, setArtifactOpen] = useState(false);
  const { rendered: artifactRendered, exiting: artifactExiting } = useExitAnimation(
    artifactOpen,
    PANEL_EXIT_MS,
  );

  const messagesListRef = useRef<HTMLDivElement>(null);

  // Keep the viewport pinned to the bottom so the latest message is always visible.
  useEffect(() => {
    const list = messagesListRef.current;
    if (!list) return;
    const scrollToBottom = () => {
      const viewport = list.closest('.simplebar-content-wrapper') as HTMLElement | null;
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    };
    scrollToBottom();
    const observer = new ResizeObserver(scrollToBottom);
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  const [profileTarget, setProfileTarget] = useState<AgentProfileAnchor | null>(null);
  const [cipherPhase, setCipherPhase] = useState<CipherPhase>('idle');
  const [cipherStatusIndex, setCipherStatusIndex] = useState(0);
  /** Sticky flag — stays true once Cipher starts replying. Controls center-channel ThreadFooter. */
  const [cipherHasReplied, setCipherHasReplied] = useState(false);

  const streamedAck = useStreamedText(CIPHER_ACK_TEXT, cipherPhase === 'ack');
  const streamedResult = useStreamedText(CIPHER_RESULT_TEXT, cipherPhase === 'result');

  const ackComplete = cipherPhase !== 'ack' || streamedAck === CIPHER_ACK_JOINED;
  const resultComplete = cipherPhase !== 'result' || streamedResult === CIPHER_RESULT_JOINED;

  // Cipher animation sequence — only runs for the Sentinel post thread.
  useEffect(() => {
    if (activePostId !== SENTINEL_POST_ID) {
      setCipherPhase('idle');
      return;
    }
    setCipherPhase('idle');
    const typingId = window.setTimeout(() => {
      setCipherPhase('typing');
    }, PANEL_EXIT_MS);
    const ackId = window.setTimeout(() => {
      setCipherPhase('ack');
      setCipherHasReplied(true);
    }, PANEL_EXIT_MS + TYPING_DURATION_MS);
    return () => {
      window.clearTimeout(typingId);
      window.clearTimeout(ackId);
    };
  }, [activePostId]);

  // ack → thinking
  useEffect(() => {
    if (cipherPhase === 'ack' && ackComplete) {
      setCipherPhase('thinking');
      setCipherStatusIndex(0);
    }
  }, [cipherPhase, ackComplete]);

  // thinking: cycle status labels then → result
  useEffect(() => {
    if (cipherPhase !== 'thinking') return;
    const id = window.setTimeout(() => {
      if (cipherStatusIndex < CIPHER_STATUS_LABELS.length - 1) {
        setCipherStatusIndex((i) => i + 1);
      } else {
        setCipherPhase('result');
      }
    }, CIPHER_STATUS_MS);
    return () => window.clearTimeout(id);
  }, [cipherPhase, cipherStatusIndex]);

  // result → done
  useEffect(() => {
    if (cipherPhase === 'result' && resultComplete) {
      setCipherPhase('done');
    }
  }, [cipherPhase, resultComplete]);

  const openThread = (postId: string) => {
    setActivePostId(postId);
  };

  const closeThread = () => {
    setActivePostId(null);
  };

  const openAgentProfile: OnAgentClick = (agent, event) => {
    setProfileTarget(profileAnchorFromEvent(agent, event));
  };

  // Thread content is derived from which post is active.
  const cipherBase: Omit<RightSidebarThreadMessage, 'body'> = {
    avatarSrc: CIPHER_AVATAR_SRC,
    avatarAlt: CIPHER.name,
    username: CIPHER.name,
    timestamp: '2:17 PM',
  };

  let threadMessages: RightSidebarThreadMessage[] = [];
  let replySeparatorLabel = '';
  let showTypingRow = false;

  if (activePostId === SENTINEL_POST_ID) {
    threadMessages = [SENTINEL_ROOT_MSG];

    if (cipherPhase === 'typing') {
      showTypingRow = true;
    } else if (cipherPhase === 'ack') {
      threadMessages.push({ ...cipherBase, body: streamedAck });
    } else if (cipherPhase === 'thinking') {
      threadMessages.push({
        ...cipherBase,
        body: (
          <>
            {CIPHER_ACK_TEXT}
            <div
              className={styles['incident-channel__thread-status']}
              role="status"
              aria-live="polite"
            >
              <Spinner size={12} aria-label={CIPHER_STATUS_LABELS[cipherStatusIndex]} />
              <span className={styles['incident-channel__thread-status-label']}>
                {CIPHER_STATUS_LABELS[cipherStatusIndex]}
              </span>
            </div>
          </>
        ),
      });
    } else if (cipherPhase === 'result' || cipherPhase === 'done') {
      // Ack message: stays with the completed thinking summary (checkmark replaces spinner)
      threadMessages.push({
        ...cipherBase,
        body: (
          <>
            {CIPHER_ACK_TEXT}
            <div
              className={[
                styles['incident-channel__thread-status'],
                styles['incident-channel__thread-status--done'],
              ].join(' ')}
            >
              <Icon glyph={<CheckCircleOutlineIcon />} size="12" />
              <span className={styles['incident-channel__thread-status-label']}>
                Analyzed 847 error traces from build 8842
              </span>
            </div>
          </>
        ),
      });
      threadMessages.push({
        avatarSrc: CIPHER_AVATAR_SRC,
        avatarAlt: CIPHER.name,
        username: CIPHER.name,
        timestamp: '2:18 PM',
        body:
          cipherPhase === 'done' ? (
            <>
              <p className={styles['incident-channel__thread-result-text']}>
                {CIPHER_RESULT_TEXT}
              </p>
              <AgentArtifactCard
                title="INC-4471 Root Cause Analysis"
                meta="Markdown · Generated by Cipher"
                onOpen={() => setArtifactOpen(true)}
              />
            </>
          ) : (
            streamedResult
          ),
      });
    }

    replySeparatorLabel =
      cipherPhase === 'idle' || cipherPhase === 'typing'
        ? ''
        : cipherPhase === 'result' || cipherPhase === 'done'
          ? '2 Replies'
          : '1 Reply';
  } else if (activePostId === 'inc-matty-1') {
    threadMessages = MATTY_THREAD_MESSAGES;
    replySeparatorLabel = '1 Reply';
  }

  return (
    <div className={styles['incident-channel']}>
      <ChannelsProductSidebar />
      <div className={styles['incident-channel__inner']}>
        <div className={styles['incident-channel__center']}>
          <ChannelHeader
            type="channel"
            name="INC-4471"
            description="Checkout failures during peak traffic — PayForge webhook regression."
            memberCount={7}
            pinnedCount={0}
          />
          <div className={styles['incident-channel__messages']}>
            <Scrollbar>
              <div ref={messagesListRef} className={styles['incident-channel__messages-list']}>
                <ChannelIntro
                  name="INC-4471"
                  createdBy="Matty"
                  createdAt="Today at 2:14 PM"
                  description="Checkout failures during peak traffic — PayForge webhook regression. This channel was created automatically when the incident was declared."
                />
                <MessageSeparator type="date" label="Today" />
                {INCIDENT_CHANNEL_MESSAGES.map((message) => {
                  if (message.kind === 'system') {
                    // System messages aren't threaded — render as non-interactive
                    return (
                      <div
                        key={message.id}
                        className={styles['incident-channel__system']}
                      >
                        <p>
                          {message.parts?.length
                            ? message.parts.map((part, i) =>
                                part.type === 'text' ? (
                                  <span key={i}>{part.text}</span>
                                ) : part.type === 'link' ? (
                                  <a key={i} href={part.href} target="_blank" rel="noreferrer" className={styles['incident-channel__link']}>{part.text}</a>
                                ) : (
                                  <Chip
                                    key={i}
                                    size="small"
                                    leadingAvatar={{
                                      src:
                                        part.agentShape && part.agentColor
                                          ? agentAvatarChipSrc(
                                              part.agentShape,
                                              part.agentColor,
                                            )
                                          : part.avatarSrc || '',
                                      alt: part.label,
                                    }}
                                    className={[
                                      mentionStyles['mention-input__mention-chip'],
                                      mentionStyles['mention-input__post-chip'],
                                      mentionStyles['mention-input__post-chip--system'],
                                    ].join(' ')}
                                  >
                                    {part.label}
                                  </Chip>
                                ),
                              )
                            : message.body}
                        </p>
                      </div>
                    );
                  }

                  if (message.kind === 'agent') {
                    return (
                      <AgentPost
                        key={message.id}
                        message={message}
                        onAgentClick={openAgentProfile}
                        onOpenThread={() => openThread(message.id)}
                        showThreadReplies={
                          message.id === SENTINEL_POST_ID ? cipherHasReplied : true
                        }
                      />
                    );
                  }

                  return (
                    <div
                      key={message.id}
                      className={styles['incident-channel__message-row']}
                      role="button"
                      tabIndex={0}
                      onClick={() => openThread(message.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') openThread(message.id);
                      }}
                    >
                      <Message
                        avatarSrc={message.avatarSrc}
                        avatarAlt={message.avatarAlt}
                        username={message.username}
                        timestamp={message.timestamp}
                        showMessageActions={false}
                      >
                        <p className={styles['incident-channel__post']}>{message.body}</p>
                      </Message>
                    </div>
                  );
                })}
              </div>
            </Scrollbar>
          </div>
          <div className={styles['incident-channel__composer']}>
            <MentionMessageInput
              placeholder="Write to INC-4471"
              onSend={() => undefined}
            />
          </div>
        </div>
        <div className={styles['incident-channel__rhs']}>
          {/* Playbook sidebar — always mounted underneath */}
          <RightSidebar
            header={
              <RightSidebarHeader
                title="Run details"
                secondaryTitle="Incident Response Checklist v1"
                onExpand={() => undefined}
                onClose={() => undefined}
              />
            }
          >
            <PlaybookRunRhs />
          </RightSidebar>

          {/* Thread panel — slides in from right over the playbook panel */}
          {threadRendered && (
            <div
              className={[
                styles['incident-channel__rhs-thread'],
                threadExiting ? styles['incident-channel__rhs-thread--exiting'] : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <RightSidebar
                alignBody="end"
                header={
                  <RightSidebarHeader
                    title="Thread"
                    secondaryTitle="INC-4471"
                    onExpand={() => undefined}
                    onClose={closeThread}
                  />
                }
                footer={
                  <div className={styles['incident-channel__rhs-composer']}>
                    <MentionMessageInput
                      placeholder="Reply in thread…"
                      onSend={() => undefined}
                    />
                  </div>
                }
              >
                <RightSidebarThread
                  messages={threadMessages}
                  replySeparatorLabel={replySeparatorLabel}
                />
                {/* Typing dots — replaces Cipher's avatar+name while they "type" */}
                {showTypingRow ? (
                  <div className={styles['incident-channel__thread-typing-row']}>
                    <AgentTypingDots label="Cipher is typing" />
                  </div>
                ) : null}
              </RightSidebar>
            </div>
          )}

          {/* Artifact panel — slides in over the thread panel */}
          {artifactRendered && (
            <div
              className={[
                styles['incident-channel__rhs-artifact'],
                artifactExiting ? styles['incident-channel__rhs-artifact--exiting'] : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <RightSidebar
                header={
                  <AgentPlaybookRhsHeader
                    secondaryTitle="Root Cause Analysis"
                    onClose={() => setArtifactOpen(false)}
                  />
                }
              >
                <MarkdownArtifactRhs />
              </RightSidebar>
            </div>
          )}
        </div>
      </div>
      <AgentProfilePopover
        target={profileTarget}
        onClose={() => setProfileTarget(null)}
      />
    </div>
  );
}
