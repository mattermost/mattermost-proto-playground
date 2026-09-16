import { useEffect, useMemo, useRef, useState } from 'react';
import CheckCircleOutlineIcon from '@mattermost/compass-icons/components/check-circle-outline';
import { Chip } from '@mattermost/compass-ui/components/chip';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Spinner } from '@mattermost/compass-ui/components/spinner';
import { Tag } from '@mattermost/compass-ui/components/tag';
import { Message } from '@mattermost/compass-proto';
import { MessageReactions } from '@mattermost/compass-ui/components/message-reactions';
import { Tooltip } from '@mattermost/compass-ui/components/tooltip';
import { ThreadFooter } from '@mattermost/compass-ui/components/thread-footer';
import { MessageSeparator } from '@mattermost/compass-ui/components/message-separator';
import { RightSidebarHeader } from '@mattermost/compass-ui/components/right-sidebar-header';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import {
  ChannelHeader,
  RightSidebar,
  RightSidebarChannelMembers,
  type RightSidebarChannelMember,
  type RightSidebarChannelMemberGroup,
} from '@mattermost/compass-proto';
import {
  DARIUS,
  JORDAN,
  MATTY,
  MATTY_ACK_ID,
  MATTY_AGENT_REVIEW_ID,
  ON_CALL,
  SENTINEL_DEFAULT,
  SERVICE_STATUS_MESSAGES,
  VIEWER,
  buildMattyAckMessage,
  buildMattyAgentReviewMessage,
  buildMattySentinelConfirmMessage,
  buildSentinelJoinedSystemMessage,
  buildWorkspaceDirectory,
  channelPartsMentionAgent,
  createdAgentToWorkspace,
  findAgentsNeedingChannelInvite,
  initialServiceStatusAgentIds,
  type ChannelMessage,
  type ChannelMessagePart,
  type WorkspaceAgent,
} from '../../agentsData';
import AgentTypingDots from '../../components/AgentTypingDots';
import AddAgentToChannelModal from '../../components/AddAgentToChannelModal';
import AgentAvatar from '../../components/AgentAvatar';
import AgentProfilePopover, {
  profileAnchorFromEvent,
  type AgentProfileAnchor,
} from '../../components/AgentProfilePopover';
import AgentReviewCard from '../../components/AgentReviewCard';
import WebhookPost from '../../components/WebhookPost';
import AgentSettingsModal from '../../components/AgentSettingsModal';
import MentionMessageInput from '../../components/MentionMessageInput';
import mentionStyles from '../../components/MentionMessageInput.module.scss';
import { agentAvatarChipSrc } from '../../components/agentAvatarShapes';
import { useAgents } from '../../context/AgentsContext';
import ChannelsProductSidebar from './ChannelsProductSidebar';
import styles from './ChannelsHome.module.scss';

const CHANNEL_ADMIN_IDS = new Set(['priya']);

const CHANNEL_PEOPLE: RightSidebarChannelMember[] = [
  {
    id: 'priya',
    name: VIEWER.name,
    secondaryLabel: '@priya.shah',
    avatarSrc: VIEWER.avatarSrc,
    status: true,
  },
  {
    id: 'jordan',
    name: JORDAN.name,
    secondaryLabel: '@jordan.lee',
    avatarSrc: JORDAN.avatarSrc,
    status: true,
  },
  {
    id: 'emma',
    name: ON_CALL.name,
    secondaryLabel: '@emma.novak',
    avatarSrc: ON_CALL.avatarSrc,
    status: true,
  },
  {
    id: 'darius',
    name: DARIUS.name,
    secondaryLabel: '@darius.cole',
    avatarSrc: DARIUS.avatarSrc,
    status: true,
  },
];

function personIdFromUsername(username: string): string | null {
  const match = CHANNEL_PEOPLE.find((person) => person.name === username);
  return match?.id ?? null;
}

type MattyPhase = 'idle' | 'typing' | 'ack' | 'thinking' | 'result';

const STREAM_MS_PER_WORD = 32;
/** Beat after Matty's confirm stream before Sentinel's wave shows. */
const SENTINEL_WAVE_DELAY_MS = 550;

/** Duration typing dots show before the ack message streams in. */
const MATTY_TYPING_DURATION_MS = 1000;
const MATTY_ACK_TEXT = "I can help with that. I'll first look to see if there is an existing agent already suited for this task. If not, I'll create one.";
const MATTY_THINKING_LABELS = [
  'Reviewing channel activity…',
  'Checking available agents…',
  'Drafting agent config…',
] as const;
const MATTY_THINKING_MS = 1100;
/** Short pause between thinking done and review card appearing. */
const MATTY_CARD_DELAY_MS = 400;

function formatChannelTime(date = new Date()) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Word-by-word reveal for Matty channel replies. */
function useStreamedText(
  text: string,
  enabled: boolean,
  msPerWord = STREAM_MS_PER_WORD,
): { visible: string; complete: boolean } {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const [visibleWordCount, setVisibleWordCount] = useState(
    enabled ? 0 : words.length,
  );

  useEffect(() => {
    if (!enabled) {
      setVisibleWordCount(words.length);
      return;
    }
    setVisibleWordCount(0);
    if (words.length === 0) return;

    let count = 0;
    const id = window.setInterval(() => {
      count += 1;
      setVisibleWordCount(count);
      if (count >= words.length) {
        window.clearInterval(id);
      }
    }, msPerWord);

    return () => window.clearInterval(id);
  }, [text, enabled, msPerWord, words.length]);

  const complete = !enabled || visibleWordCount >= words.length;
  const visible = words.slice(0, visibleWordCount).join(' ');
  return { visible, complete };
}

function MessageBody({
  body,
  parts,
  onAgentProfile,
  density = 'default',
}: {
  body: string;
  parts?: ChannelMessagePart[];
  onAgentProfile: (
    agentId: string,
    event: { currentTarget: EventTarget & Element },
  ) => void;
  /** System messages use a smaller chip so it matches muted caption text. */
  density?: 'default' | 'system';
}) {
  if (!parts?.length) {
    return <p className={styles['channels-home__post']}>{body}</p>;
  }

  const isSystem = density === 'system';

  return (
    <p className={mentionStyles['mention-input__post']}>
      {parts.map((part, index) =>
        part.type === 'text' ? (
          <span key={`t-${index}`}>{part.text}</span>
        ) : part.type === 'link' ? (
          <a key={`l-${index}`} href={part.href} target="_blank" rel="noreferrer">{part.text}</a>
        ) : (
          <Chip
            key={`m-${part.id}-${index}`}
            size={isSystem ? 'small' : 'medium-compact'}
            leadingAvatar={{
              src:
                part.avatarSrc ||
                (part.kind === 'agent' &&
                part.agentShape &&
                part.agentColor
                  ? agentAvatarChipSrc(part.agentShape, part.agentColor)
                  : ''),
              alt: part.label,
            }}
            role={part.kind === 'agent' ? 'button' : undefined}
            tabIndex={part.kind === 'agent' ? 0 : undefined}
            aria-label={
              part.kind === 'agent' ? `View ${part.label} profile` : undefined
            }
            onClick={
              part.kind === 'agent'
                ? (event) => {
                    event.stopPropagation();
                    onAgentProfile(part.id, event);
                  }
                : undefined
            }
            onKeyDown={
              part.kind === 'agent'
                ? (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      event.stopPropagation();
                      onAgentProfile(part.id, event);
                    }
                  }
                : undefined
            }
            className={[
              mentionStyles['mention-input__mention-chip'],
              mentionStyles['mention-input__post-chip'],
              isSystem ? mentionStyles['mention-input__post-chip--system'] : '',
              part.kind === 'agent'
                ? mentionStyles['mention-input__mention-chip--agent']
                : '',
              part.kind === 'agent'
                ? mentionStyles['mention-input__post-chip--interactive']
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {part.label}
          </Chip>
        ),
      )}
    </p>
  );
}

function MattyChannelMessage({
  message,
  onAgentProfile,
  onReview,
  cardImageSrc,
  phase,
  streamedBody,
  thinkingIndex,
  thinkingLabels,
}: {
  message: ChannelMessage;
  onAgentProfile: (
    agentId: string,
    event: { currentTarget: EventTarget & Element },
  ) => void;
  onReview: () => void;
  cardImageSrc?: string;
  /** When provided, switches to external phase-driven rendering (ack message). */
  phase?: MattyPhase;
  /** Externally streamed visible text — used when phase is provided. */
  streamedBody?: string;
  thinkingIndex?: number;
  thinkingLabels?: readonly string[];
}) {
  // Internal streaming — only used when phase is not provided (card / confirm messages).
  const [streamFinished, setStreamFinished] = useState(false);
  const [reactionsVisible, setReactionsVisible] = useState(false);
  const [reactionTooltipOpen, setReactionTooltipOpen] = useState(false);
  const { visible, complete } = useStreamedText(
    message.body,
    phase === undefined && !streamFinished,
  );

  useEffect(() => {
    if (phase !== undefined) return;
    if (complete) setStreamFinished(true);
  }, [complete, phase]);

  useEffect(() => {
    if (!streamFinished || !message.reactions?.length) {
      setReactionsVisible(false);
      return;
    }
    const id = window.setTimeout(() => {
      setReactionsVisible(true);
    }, SENTINEL_WAVE_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [streamFinished, message.reactions]);

  return (
    <article className={styles['channels-home__agent-message']}>
      <div className={styles['channels-home__agent-message-avatar']}>
        <AgentAvatar
          shape={message.agentShape ?? 'sphere'}
          color={message.agentColor ?? 'yellow'}
          size="sm"
          eyes
          shadow={false}
          imageSrc={message.agentImageSrc}
        />
      </div>
      <div className={styles['channels-home__agent-message-body']}>
        <div className={styles['channels-home__agent-message-meta']}>
          <span className={styles['channels-home__agent-message-name']}>
            {message.username}
          </span>
          <Tag label="Agent" size="x-small" />
          <time className={styles['channels-home__agent-message-time']}>
            {message.timestamp}
          </time>
        </div>
        {phase !== undefined ? (
          <>
            <p className={styles['channels-home__post']}>{streamedBody ?? message.body}</p>
            {phase === 'thinking' && thinkingLabels && thinkingIndex !== undefined && (
              <div
                className={styles['channels-home__agent-status']}
                role="status"
                aria-live="polite"
              >
                <Spinner size={12} aria-label={thinkingLabels[thinkingIndex]} />
                <span className={styles['channels-home__agent-status-label']}>
                  {thinkingLabels[thinkingIndex]}
                </span>
              </div>
            )}
            {phase === 'result' && (
              <div
                className={[
                  styles['channels-home__agent-status'],
                  styles['channels-home__agent-status--done'],
                ].join(' ')}
              >
                <Icon glyph={<CheckCircleOutlineIcon />} size="12" />
                <span className={styles['channels-home__agent-status-label']}>
                  Agent config drafted
                </span>
              </div>
            )}
          </>
        ) : streamFinished ? (
          <MessageBody
            body={message.body}
            parts={message.parts}
            onAgentProfile={onAgentProfile}
          />
        ) : (
          <p className={styles['channels-home__post']}>{visible}</p>
        )}
        {phase === undefined && streamFinished && message.agentReviewCard ? (
          <AgentReviewCard
            card={message.agentReviewCard}
            shape={SENTINEL_DEFAULT.shape}
            color={SENTINEL_DEFAULT.color}
            imageSrc={cardImageSrc}
            onReview={onReview}
          />
        ) : null}
        {reactionsVisible && message.reactions?.length ? (
          <div
            className={styles['channels-home__reaction-anchor']}
            onMouseEnter={() => setReactionTooltipOpen(true)}
            onMouseLeave={() => setReactionTooltipOpen(false)}
          >
            <MessageReactions reactions={message.reactions} />
            {reactionTooltipOpen && (
              <div className={styles['channels-home__reaction-tooltip']}>
                <Tooltip label="Sentinel reacted with 👋" arrow="bottom" />
              </div>
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
}

type PendingInvite = {
  agents: WorkspaceAgent[];
  parts: ChannelMessagePart[];
  body: string;
};

/** Channels product — quiet `#service-status` home for the vision demo. */
export default function ChannelsHome() {
  const { customAgents, ensureSentinel, updateAgent } = useAgents();
  const [mattyPhase, setMattyPhase] = useState<MattyPhase>('idle');
  const [mattyThinkingIndex, setMattyThinkingIndex] = useState(0);
  const [messages, setMessages] = useState<ChannelMessage[]>(
    SERVICE_STATUS_MESSAGES,
  );
  const [channelAgentIds, setChannelAgentIds] = useState(
    () => new Set(initialServiceStatusAgentIds()),
  );
  const [pendingInvite, setPendingInvite] = useState<PendingInvite | null>(
    null,
  );
  const [composerKey, setComposerKey] = useState(0);
  const [profileTarget, setProfileTarget] =
    useState<AgentProfileAnchor | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [membersRhsOpen, setMembersRhsOpen] = useState(false);
  const [settingsAgent, setSettingsAgent] = useState(() =>
    customAgents.find((agent) => agent.id === 'sentinel') ?? null,
  );
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesListRef = useRef<HTMLDivElement>(null);
  const mattyReviewTimerRef = useRef<number | null>(null);
  const mattyReviewQueuedRef = useRef(false);
  const channelAgentIdsRef = useRef(channelAgentIds);
  channelAgentIdsRef.current = channelAgentIds;

  // Keep the SimpleBar viewport pinned to the latest message (incl. streaming growth).
  useEffect(() => {
    const list = messagesListRef.current;
    if (!list) return;

    const scrollToBottom = () => {
      const viewport = list.closest(
        '.simplebar-content-wrapper',
      ) as HTMLElement | null;
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
        return;
      }
      bottomRef.current?.scrollIntoView({ block: 'end' });
    };

    scrollToBottom();
    const observer = new ResizeObserver(scrollToBottom);
    observer.observe(list);
    return () => observer.disconnect();
  }, [messages.length]);

  useEffect(() => {
    return () => {
      if (mattyReviewTimerRef.current != null) {
        window.clearTimeout(mattyReviewTimerRef.current);
      }
    };
  }, []);

  const { visible: mattyAckVisible, complete: mattyAckComplete } = useStreamedText(
    MATTY_ACK_TEXT,
    mattyPhase === 'ack',
  );

  // ack → thinking
  useEffect(() => {
    if (mattyPhase !== 'ack') return;
    if (!mattyAckComplete) return;
    setMattyPhase('thinking');
    setMattyThinkingIndex(0);
  }, [mattyPhase, mattyAckComplete]);

  // thinking: cycle labels then → result
  useEffect(() => {
    if (mattyPhase !== 'thinking') return;
    const id = window.setTimeout(() => {
      if (mattyThinkingIndex < MATTY_THINKING_LABELS.length - 1) {
        setMattyThinkingIndex((i) => i + 1);
      } else {
        setMattyPhase('result');
      }
    }, MATTY_THINKING_MS);
    return () => window.clearTimeout(id);
  }, [mattyPhase, mattyThinkingIndex]);

  // result → show review card message (short beat after checkmark appears)
  useEffect(() => {
    if (mattyPhase !== 'result') return;
    const id = window.setTimeout(() => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === MATTY_AGENT_REVIEW_ID)) return prev;
        return [...prev, buildMattyAgentReviewMessage(formatChannelTime())];
      });
    }, MATTY_CARD_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [mattyPhase]);

  const resolveAgent = (id: string) =>
    buildWorkspaceDirectory(customAgents).find((agent) => agent.id === id);

  const memberGroups = useMemo((): RightSidebarChannelMemberGroup[] => {
    const toAgentRow = (agent: WorkspaceAgent): RightSidebarChannelMember => ({
      id: agent.id,
      name: agent.name,
      tag: agent.role,
      leadingVisual: (
        <span className={styles['channels-home__member-agent-avatar']}>
          <AgentAvatar
            shape={agent.shape}
            color={agent.color}
            size="xs"
            eyes
            trackEyes={false}
            shadow={false}
            imageSrc={agent.customImageSrc}
          />
        </span>
      ),
    });

    const agentsInChannel = buildWorkspaceDirectory(customAgents).filter(
      (agent) => channelAgentIds.has(agent.id),
    );

    const peopleById = new Map(
      CHANNEL_PEOPLE.map((person) => [person.id, person]),
    );
    const memberPeople: RightSidebarChannelMember[] = [];
    const seenPeople = new Set<string>();

    for (const message of messages) {
      if (message.kind === 'agent' || message.kind === 'system') continue;
      const personId = personIdFromUsername(message.username);
      if (!personId || CHANNEL_ADMIN_IDS.has(personId)) continue;
      if (seenPeople.has(personId)) continue;
      seenPeople.add(personId);
      const person = peopleById.get(personId);
      if (person) {
        memberPeople.push(person);
      }
    }

    return [
      {
        id: 'admins',
        title: 'Channel Admins',
        members: CHANNEL_PEOPLE.filter((person) =>
          CHANNEL_ADMIN_IDS.has(person.id),
        ),
      },
      {
        id: 'agents',
        title: 'Agents',
        members: agentsInChannel.map(toAgentRow),
      },
      {
        id: 'members',
        title: 'Channel Members',
        members: memberPeople,
      },
    ].filter((group) => group.members.length > 0);
  }, [channelAgentIds, customAgents, messages]);

  const memberCount = useMemo(
    () =>
      memberGroups.reduce((total, group) => total + group.members.length, 0),
    [memberGroups],
  );

  const openAgentProfile = (
    agentId: string,
    event: { currentTarget: EventTarget & Element },
  ) => {
    const agent = resolveAgent(agentId);
    if (!agent) return;
    setProfileTarget(profileAnchorFromEvent(agent, event));
  };

  const appendMessages = (...next: ChannelMessage[]) => {
    setMessages((prev) => [...prev, ...next]);
  };

  const postUserMessage = (parts: ChannelMessagePart[], body: string) => {
    appendMessages({
      id: `live-${Date.now()}`,
      kind: 'user',
      username: VIEWER.name,
      avatarSrc: VIEWER.avatarSrc,
      avatarAlt: VIEWER.avatarAlt,
      timestamp: formatChannelTime(),
      body,
      parts,
    });
  };

  const queueMattyAgentReview = (parts: ChannelMessagePart[]) => {
    if (!channelPartsMentionAgent(parts, MATTY.id)) return;
    if (channelAgentIdsRef.current.has('sentinel')) return;
    if (mattyReviewQueuedRef.current) return;

    mattyReviewQueuedRef.current = true;
    ensureSentinel();
    setMattyPhase('typing');

    mattyReviewTimerRef.current = window.setTimeout(() => {
      if (channelAgentIdsRef.current.has('sentinel')) {
        mattyReviewTimerRef.current = null;
        setMattyPhase('idle');
        return;
      }
      setMessages((prev) => {
        if (prev.some((m) => m.id === MATTY_ACK_ID)) return prev;
        return [...prev, buildMattyAckMessage(formatChannelTime())];
      });
      setMattyPhase('ack');
      mattyReviewTimerRef.current = null;
    }, MATTY_TYPING_DURATION_MS);
  };

  const handleSend = ({
    parts,
    body,
  }: {
    parts: ChannelMessagePart[];
    body: string;
  }): boolean | void => {
    const needed = findAgentsNeedingChannelInvite(
      parts,
      channelAgentIds,
      customAgents,
    );
    if (needed.length > 0) {
      setPendingInvite({ agents: needed, parts, body });
      return false;
    }
    postUserMessage(parts, body);
    queueMattyAgentReview(parts);
  };

  const confirmInvite = () => {
    if (!pendingInvite) return;
    setChannelAgentIds((prev) => {
      const next = new Set(prev);
      for (const agent of pendingInvite.agents) {
        next.add(agent.id);
      }
      return next;
    });
    postUserMessage(pendingInvite.parts, pendingInvite.body);
    queueMattyAgentReview(pendingInvite.parts);
    setPendingInvite(null);
    setComposerKey((key) => key + 1);
  };

  const addAgentFromProfile = (agent: WorkspaceAgent) => {
    if (channelAgentIds.has(agent.id)) return;
    setChannelAgentIds((prev) => new Set(prev).add(agent.id));
  };

  const openSentinelSettings = () => {
    const agent = ensureSentinel();
    setSettingsAgent(agent);
    setSettingsOpen(true);
  };

  const approveSentinel = (
    updates: Parameters<typeof updateAgent>[1],
  ) => {
    const saved = updateAgent('sentinel', updates);
    setSettingsAgent(saved);
    setMessages((prev) =>
      prev.map((message) =>
        message.id === MATTY_AGENT_REVIEW_ID && message.agentReviewCard
          ? {
              ...message,
              agentReviewCard: {
                ...message.agentReviewCard,
                approved: true,
              },
            }
          : message,
      ),
    );
    setSettingsOpen(false);

    if (channelAgentIdsRef.current.has('sentinel')) return;

    setChannelAgentIds((prev) => new Set(prev).add('sentinel'));
    const timestamp = formatChannelTime();
    appendMessages(
      buildSentinelJoinedSystemMessage(
        timestamp,
        createdAgentToWorkspace(saved),
      ),
      buildMattySentinelConfirmMessage(
        timestamp,
        createdAgentToWorkspace(saved),
      ),
    );
  };

  return (
    <div className={styles['channels-home']}>
      <ChannelsProductSidebar />
      <div className={styles['channels-home__inner']}>
        <div className={styles['channels-home__center']}>
          <ChannelHeader
            type="channel"
            name="service-status"
            description="Customer-facing reliability and checkout health."
            memberCount={memberCount}
            pinnedCount={1}
            onMembersClick={() => setMembersRhsOpen((open) => !open)}
            membersToggled={membersRhsOpen}
          />
          <div className={styles['channels-home__messages']}>
            <Scrollbar>
              <div
                ref={messagesListRef}
                className={styles['channels-home__messages-list']}
              >
                <MessageSeparator type="date" label="Today" />
                {messages.map((message) => {
                  if (message.kind === 'system') {
                    return (
                      <div
                        key={message.id}
                        className={styles['channels-home__system']}
                        role="status"
                      >
                        <MessageBody
                          body={message.body}
                          parts={message.parts}
                          density="system"
                          onAgentProfile={openAgentProfile}
                        />
                      </div>
                    );
                  }

                  if (message.kind === 'agent') {
                    const isAck = message.id === MATTY_ACK_ID;
                    return (
                      <MattyChannelMessage
                        key={message.id}
                        message={message}
                        onAgentProfile={openAgentProfile}
                        onReview={openSentinelSettings}
                        cardImageSrc={settingsAgent?.customImageSrc}
                        phase={isAck ? mattyPhase : undefined}
                        streamedBody={isAck ? mattyAckVisible : undefined}
                        thinkingIndex={isAck ? mattyThinkingIndex : undefined}
                        thinkingLabels={isAck ? MATTY_THINKING_LABELS : undefined}
                      />
                    );
                  }

                  if (message.kind === 'webhook') {
                    return (
                      <Message
                        key={message.id}
                        avatarSrc={message.avatarSrc}
                        avatarAlt={message.avatarAlt}
                        username={message.username}
                        timestamp={message.timestamp}
                        showMessageActions={false}
                      >
                        {message.webhookPost ? (
                          <WebhookPost data={message.webhookPost} />
                        ) : null}
                      </Message>
                    );
                  }

                  return (
                    <Message
                      key={message.id}
                      avatarSrc={message.avatarSrc}
                      avatarAlt={message.avatarAlt}
                      username={message.username}
                      timestamp={message.timestamp}
                      showMessageActions={false}
                    >
                      <MessageBody
                        body={message.body}
                        parts={message.parts}
                        onAgentProfile={openAgentProfile}
                      />
                      {message.threadReplies ? (
                        <div className={styles['channels-home__thread-footer']}>
                          <ThreadFooter
                            replyCount={message.threadReplies.count}
                            lastReplyTime={message.threadReplies.lastReplyTime}
                            avatars={message.threadReplies.participants.map((p) => ({
                              key: p.key,
                              name: p.name,
                              src: p.agentShape && p.agentColor
                                ? agentAvatarChipSrc(p.agentShape, p.agentColor)
                                : p.avatarSrc,
                            }))}
                          />
                        </div>
                      ) : null}
                    </Message>
                  );
                })}
                {mattyPhase === 'typing' && (
                  <div className={styles['channels-home__typing-row']}>
                    <AgentTypingDots label="Matty is typing" />
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </Scrollbar>
          </div>
          <div className={[
            styles['channels-home__composer'],
            membersRhsOpen ? styles['channels-home__composer--rhs-open'] : '',
          ].filter(Boolean).join(' ')}>
            <MentionMessageInput
              key={composerKey}
              placeholder="Write to service-status"
              onSend={handleSend}
            />
          </div>
        </div>
        {membersRhsOpen ? (
          <RightSidebar
            className={styles['channels-home__rhs']}
            header={
              <RightSidebarHeader
                title="Members"
                secondaryTitle="service-status"
                onClose={() => setMembersRhsOpen(false)}
              />
            }
          >
            <RightSidebarChannelMembers
              memberCount={memberCount}
              groups={memberGroups}
              onMemberClick={(member) => {
                const agent = resolveAgent(member.id);
                if (!agent) return;
                setProfileTarget({
                  agent,
                  anchorRect: new DOMRect(
                    window.innerWidth - 420,
                    120,
                    40,
                    32,
                  ),
                });
              }}
            />
          </RightSidebar>
        ) : null}
      </div>
      <AddAgentToChannelModal
        open={pendingInvite != null}
        agents={pendingInvite?.agents ?? []}
        onCancel={() => setPendingInvite(null)}
        onConfirm={confirmInvite}
      />
      {settingsAgent ? (
        <AgentSettingsModal
          open={settingsOpen}
          agent={settingsAgent}
          mode="review"
          onClose={() => setSettingsOpen(false)}
          onSave={approveSentinel}
        />
      ) : null}
      <AgentProfilePopover
        target={profileTarget}
        onClose={() => setProfileTarget(null)}
        onAddToChannel={
          profileTarget && !channelAgentIds.has(profileTarget.agent.id)
            ? addAgentFromProfile
            : undefined
        }
      />
    </div>
  );
}
