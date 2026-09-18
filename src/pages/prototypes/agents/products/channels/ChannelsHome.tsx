import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CheckCircleOutlineIcon from '@mattermost/compass-icons/components/check-circle-outline';
import { Chip } from '@mattermost/compass-ui/components/chip';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { Spinner } from '@mattermost/compass-ui/components/spinner';
import { Tag } from '@mattermost/compass-ui/components/tag';
import { Message } from '@mattermost/compass-proto';
import { ReactionsRow } from '@mattermost/compass-ui/components/reactions-row';
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
  MATTY_MESSAGED_SENTINEL_SYSTEM_ID,
  ON_CALL,
  PAYFORGE_ALERT_MESSAGE,
  SENTINEL_DEFAULT,
  SENTINEL_SECOPS_NOTIFY_ID,
  PRIYA_MATTY_THREAD_MESSAGE,
  SERVICE_STATUS_MESSAGES,
  VIEWER,
  buildMattyAgentReviewMessage,
  buildMattyMessagedSentinelNotice,
  buildMattySentinelConfirmMessage,
  buildSentinelJoinedSystemMessage,
  buildSentinelSecopNotifyMessage,
  buildWorkspaceDirectory,
  channelPartsMentionAgent,
  createdAgentToWorkspace,
  findAgentsNeedingChannelInvite,
  initialServiceStatusAgentIds,
  type ChannelMessage,
  type ChannelMessagePart,
  type WorkspaceAgent,
} from '../../agentsData';
import { useExitAnimation } from '@/hooks/useExitAnimation';
import AgentTypingDots from '../../components/AgentTypingDots';
import AddAgentToChannelModal from '../../components/AddAgentToChannelModal';
import AgentAvatar from '../../components/AgentAvatar';
import AgentProfilePopover, {
  profileAnchorFromEvent,
  type AgentProfileAnchor,
} from '../../components/AgentProfilePopover';
import AgentReviewCard from '../../components/AgentReviewCard';
import ChannelLinkCard from '../../components/ChannelLinkCard';
import MattyDelegationDM, {
  computeDelegationAnchor,
  type DelegationDmAnchor,
} from '../../components/MattyDelegationDM';
import WebhookPost from '../../components/WebhookPost';
import AgentSettingsModal from '../../components/AgentSettingsModal';
import MentionMessageInput from '../../components/MentionMessageInput';
import mentionStyles from '../../components/MentionMessageInput.module.scss';
import { agentAvatarChipSrc } from '../../components/agentAvatarShapes';
import { useAgents } from '../../context/AgentsContext';
import ChannelIntro from './ChannelIntro';
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
const SENTINEL_WAVE_DELAY_MS = 550;
const MATTY_TYPING_DURATION_MS = 1000;
const MATTY_ACK_TEXT = "I can help with that. I'll first look to see if there is an existing agent already suited for this task. If not, I'll create one.";
const MATTY_THINKING_LABELS = [
  'Reviewing channel activity…',
  'Checking available agents…',
  'Drafting agent config…',
] as const;
const MATTY_THINKING_MS = 1100;
const MATTY_CARD_DELAY_MS = 400;
const PANEL_EXIT_MS = 300;
const SENTINEL_NOTIFY_DELAY_MS = 1500;

function formatChannelTime(date = new Date()) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

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
  disableAgentChips = false,
}: {
  body: string;
  parts?: ChannelMessagePart[];
  onAgentProfile: (
    agentId: string,
    event: { currentTarget: EventTarget & Element },
  ) => void;
  density?: 'default' | 'system';
  disableAgentChips?: boolean;
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
            size={isSystem ? 'small' : 'medium'}
            compact={!isSystem}
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
            role={part.kind === 'agent' && !disableAgentChips ? 'button' : undefined}
            tabIndex={part.kind === 'agent' && !disableAgentChips ? 0 : undefined}
            aria-label={
              part.kind === 'agent' && !disableAgentChips ? `View ${part.label} profile` : undefined
            }
            onClick={
              part.kind === 'agent' && !disableAgentChips
                ? (event) => {
                    event.stopPropagation();
                    onAgentProfile(part.id, event);
                  }
                : undefined
            }
            onKeyDown={
              part.kind === 'agent' && !disableAgentChips
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
              part.kind === 'agent' && !disableAgentChips
                ? mentionStyles['mention-input__mention-chip--agent']
                : '',
              part.kind === 'agent' && !disableAgentChips
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
  phase?: MattyPhase;
  streamedBody?: string;
  thinkingIndex?: number;
  thinkingLabels?: readonly string[];
}) {
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
                <Spinner size="12" aria-label={thinkingLabels[thinkingIndex]} />
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
            <ReactionsRow reactions={message.reactions} />
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

type ChannelsHomeSnapshot = {
  messages: ChannelMessage[];
  channelAgentIds: Set<string>;
};

/** Channels product — quiet `#service-status` home for the vision demo. */
export default function ChannelsHome({
  initialSnapshot,
  onNavigateToIncident,
}: {
  initialSnapshot?: ChannelsHomeSnapshot;
  onNavigateToIncident?: () => void;
}) {
  const { customAgents, ensureSentinel, updateAgent } = useAgents();
  const [mattyPhase, setMattyPhase] = useState<MattyPhase>('idle');
  const [mattyThinkingIndex, setMattyThinkingIndex] = useState(0);
  const [messages, setMessages] = useState<ChannelMessage[]>(
    () => initialSnapshot?.messages ?? SERVICE_STATUS_MESSAGES,
  );
  const [channelAgentIds, setChannelAgentIds] = useState(
    () => initialSnapshot?.channelAgentIds ?? new Set(initialServiceStatusAgentIds()),
  );
  const [pendingInvite, setPendingInvite] = useState<PendingInvite | null>(null);
  const [composerKey, setComposerKey] = useState(0);
  const [profileTarget, setProfileTarget] = useState<AgentProfileAnchor | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [membersRhsOpen, setMembersRhsOpen] = useState(false);
  const [settingsAgent, setSettingsAgent] = useState(() =>
    customAgents.find((agent) => agent.id === 'sentinel') ?? null,
  );

  // ── Thread RHS state ───────────────────────────────────────────────────────
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const { rendered: threadRendered, exiting: threadExiting } = useExitAnimation(
    activePostId !== null,
    PANEL_EXIT_MS,
  );
  const [threadReviewCardVisible, setThreadReviewCardVisible] = useState(false);
  const [sentinelApproved, setSentinelApproved] = useState(false);
  const [confirmedSentinel, setConfirmedSentinel] = useState<WorkspaceAgent | null>(null);
  const priyaMentionPostIdRef = useRef<string | null>(null);
  const mattyAckTimestampRef = useRef<string>('');
  const approvalTimestampRef = useRef<string>('');

  // ── Delegation DM panel state ──────────────────────────────────────────────
  const [delegationDmOpen, setDelegationDmOpen] = useState(false);
  const [delegationAnchor, setDelegationAnchor] = useState<DelegationDmAnchor>({ top: 0, left: 0 });
  const delegationDmWasOpenedRef = useRef(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesListRef = useRef<HTMLDivElement>(null);
  const mattyReviewTimerRef = useRef<number | null>(null);
  const mattyReviewQueuedRef = useRef(false);
  const sentinelNotifyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelAgentIdsRef = useRef(channelAgentIds);
  channelAgentIdsRef.current = channelAgentIds;

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
      if (sentinelNotifyTimerRef.current != null) {
        clearTimeout(sentinelNotifyTimerRef.current);
      }
    };
  }, []);

  const { visible: mattyAckVisible, complete: mattyAckComplete } = useStreamedText(
    MATTY_ACK_TEXT,
    mattyPhase === 'ack',
  );

  // ack → stamp root post with thread footer as soon as first reply appears
  useEffect(() => {
    if (mattyPhase !== 'ack') return;
    const mentionPostId = priyaMentionPostIdRef.current;
    if (!mentionPostId) return;
    const replyTs = mattyAckTimestampRef.current || formatChannelTime();
    setMessages((prev) =>
      prev.map((m) =>
        m.id === mentionPostId && !m.threadReplies
          ? {
              ...m,
              threadReplies: {
                count: 1,
                lastReplyTime: replyTs,
                participants: [
                  { key: 'matty', name: MATTY.name, agentShape: MATTY.shape, agentColor: MATTY.color },
                ],
              },
            }
          : m,
      ),
    );
  }, [mattyPhase]);

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

  // result → show review card in thread (short beat after checkmark appears)
  useEffect(() => {
    if (mattyPhase !== 'result') return;
    const id = window.setTimeout(() => {
      setThreadReviewCardVisible(true);
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

  const postUserMessage = (
    parts: ChannelMessagePart[],
    body: string,
    id?: string,
  ): string => {
    const msgId = id ?? `live-${Date.now()}`;
    appendMessages({
      id: msgId,
      kind: 'user',
      username: VIEWER.name,
      avatarSrc: VIEWER.avatarSrc,
      avatarAlt: VIEWER.avatarAlt,
      timestamp: formatChannelTime(),
      body,
      parts,
    });
    return msgId;
  };

  const queueMattyAgentReview = useCallback(
    (parts: ChannelMessagePart[], triggerPostId: string) => {
      if (!channelPartsMentionAgent(parts, MATTY.id)) return;
      if (channelAgentIdsRef.current.has('sentinel')) return;
      if (mattyReviewQueuedRef.current) return;

      mattyReviewQueuedRef.current = true;
      ensureSentinel();
      setActivePostId(triggerPostId);
      setMattyPhase('typing');

      mattyReviewTimerRef.current = window.setTimeout(() => {
        if (channelAgentIdsRef.current.has('sentinel')) {
          mattyReviewTimerRef.current = null;
          setMattyPhase('idle');
          return;
        }
        mattyAckTimestampRef.current = formatChannelTime();
        setMattyPhase('ack');
        mattyReviewTimerRef.current = null;
      }, MATTY_TYPING_DURATION_MS);
    },
    [ensureSentinel],
  );

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
    const newId = `live-${Date.now()}`;
    const isMattySend = channelPartsMentionAgent(parts, MATTY.id);
    // Substitute canned message when Matty is mentioned so the narrative is consistent.
    const postedParts = isMattySend ? (PRIYA_MATTY_THREAD_MESSAGE.parts ?? parts) : parts;
    const postedBody = isMattySend ? PRIYA_MATTY_THREAD_MESSAGE.body : body;
    if (isMattySend) {
      priyaMentionPostIdRef.current = newId;
    }
    postUserMessage(postedParts, postedBody, newId);
    queueMattyAgentReview(postedParts, newId);
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
    const newId = `live-${Date.now()}`;
    const isMattySend = channelPartsMentionAgent(pendingInvite.parts, MATTY.id);
    const postedParts = isMattySend ? (PRIYA_MATTY_THREAD_MESSAGE.parts ?? pendingInvite.parts) : pendingInvite.parts;
    const postedBody = isMattySend ? PRIYA_MATTY_THREAD_MESSAGE.body : pendingInvite.body;
    if (isMattySend) {
      priyaMentionPostIdRef.current = newId;
    }
    postUserMessage(postedParts, postedBody, newId);
    queueMattyAgentReview(postedParts, newId);
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

  const openDelegationDm = (triggerEl: HTMLElement) => {
    const rect = triggerEl.getBoundingClientRect();
    setDelegationAnchor(computeDelegationAnchor(rect));
    delegationDmWasOpenedRef.current = true;
    setDelegationDmOpen(true);
  };

  const closeDelegationDm = () => {
    setDelegationDmOpen(false);
    if (!delegationDmWasOpenedRef.current) return;

    // Gate: only fire the alert sequence once, on first close
    delegationDmWasOpenedRef.current = false;

    setMessages((prev) => {
      if (prev.some((m) => m.id === PAYFORGE_ALERT_MESSAGE.id)) return prev;
      return [...prev, PAYFORGE_ALERT_MESSAGE];
    });

    sentinelNotifyTimerRef.current = setTimeout(() => {
      const agent = buildWorkspaceDirectory(customAgents).find((a) => a.id === 'sentinel');
      const ts = formatChannelTime();
      setMessages((prev) => {
        if (prev.some((m) => m.id === SENTINEL_SECOPS_NOTIFY_ID)) return prev;
        return [
          ...prev,
          buildSentinelSecopNotifyMessage(ts, agent ?? SENTINEL_DEFAULT),
        ];
      });
    }, SENTINEL_NOTIFY_DELAY_MS);
  };

  const approveSentinel = (
    updates: Parameters<typeof updateAgent>[1],
  ) => {
    const saved = updateAgent('sentinel', updates);
    const savedAsWorkspace = createdAgentToWorkspace(saved);
    setSettingsAgent(saved);
    setSettingsOpen(false);

    // Thread stays open; confirm + delegation notice appear inside it.
    approvalTimestampRef.current = formatChannelTime();
    setSentinelApproved(true);
    setConfirmedSentinel(savedAsWorkspace);

    // Stamp the root @Matty post with a thread footer (5 replies: ack + thinking + card + confirm + delegation).
    const mentionPostId = priyaMentionPostIdRef.current;
    if (mentionPostId) {
      const replyTs = approvalTimestampRef.current;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === mentionPostId
            ? {
                ...m,
                threadReplies: {
                  count: 5,
                  lastReplyTime: replyTs,
                  participants: [
                    { key: 'matty', name: MATTY.name, agentShape: MATTY.shape, agentColor: MATTY.color },
                  ],
                },
              }
            : m,
        ),
      );
    }

    if (channelAgentIdsRef.current.has('sentinel')) return;

    setChannelAgentIds((prev) => new Set(prev).add('sentinel'));
    const timestamp = approvalTimestampRef.current;
    // Confirm message + delegation notice live in the thread — only the system notice goes to center channel.
    appendMessages(
      buildSentinelJoinedSystemMessage(timestamp, savedAsWorkspace),
    );
  };

  const rootThreadMessage = activePostId
    ? messages.find((m) => m.id === activePostId) ?? null
    : null;

  const threadReviewMessage = threadReviewCardVisible
    ? buildMattyAgentReviewMessage(mattyAckTimestampRef.current || formatChannelTime())
    : null;

  const threadDelegationNotice =
    sentinelApproved && confirmedSentinel
      ? buildMattyMessagedSentinelNotice(approvalTimestampRef.current, confirmedSentinel)
      : null;

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
                <ChannelIntro
                  variant="public"
                  name="service-status"
                  createdBy="Priya"
                  createdAt="6 months ago"
                  description="Customer-facing reliability and checkout health."
                />
                <MessageSeparator type="date" label="Today" />
                {messages.map((message) => {
                  if (message.kind === 'system') {
                    if (message.actionable) {
                      return (
                        <div
                          key={message.id}
                          role="button"
                          tabIndex={0}
                          className={[
                            styles['channels-home__system'],
                            styles['channels-home__system--actionable'],
                          ].join(' ')}
                          onClick={(e) => {
                            if (message.id === MATTY_MESSAGED_SENTINEL_SYSTEM_ID) {
                              openDelegationDm(e.currentTarget);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              if (message.id === MATTY_MESSAGED_SENTINEL_SYSTEM_ID) {
                                openDelegationDm(e.currentTarget);
                              }
                            }
                          }}
                        >
                          <MessageBody
                            body={message.body}
                            parts={message.parts}
                            density="system"
                            disableAgentChips
                            onAgentProfile={openAgentProfile}
                          />
                        </div>
                      );
                    }
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
                    return (
                      <div key={message.id}>
                        <MattyChannelMessage
                          message={message}
                          onAgentProfile={openAgentProfile}
                          onReview={openSentinelSettings}
                          cardImageSrc={settingsAgent?.customImageSrc}
                        />
                        {message.channelLinkCard ? (
                          <div className={styles['channels-home__channel-link-card']}>
                            <ChannelLinkCard
                              card={message.channelLinkCard}
                              onOpen={
                                message.channelLinkCard.channelName === 'INC-4471'
                                  ? onNavigateToIncident
                                  : undefined
                              }
                            />
                          </div>
                        ) : null}
                      </div>
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

        {/* Thread RHS — flex sibling that contracts the center channel */}
        <div
          className={[
            styles['channels-home__thread-rhs'],
            threadRendered && !threadExiting ? styles['channels-home__thread-rhs--open'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {threadRendered && (
            <RightSidebar
              header={
                <RightSidebarHeader
                  title="Thread"
                  onClose={() => setActivePostId(null)}
                />
              }
              footer={
                <div className={styles['channels-home__thread-composer']}>
                  <MentionMessageInput
                    placeholder="Reply in thread…"
                    onSend={() => {}}
                  />
                </div>
              }
            >
              <Scrollbar className={styles['channels-home__thread-scroll']}>
                <div className={styles['channels-home__thread-body']}>
                  {/* Root post */}
                  {rootThreadMessage ? (
                    <Message
                      avatarSrc={rootThreadMessage.avatarSrc}
                      avatarAlt={rootThreadMessage.avatarAlt}
                      username={rootThreadMessage.username}
                      timestamp={rootThreadMessage.timestamp}
                      showMessageActions={false}
                    >
                      <MessageBody
                        body={rootThreadMessage.body}
                        parts={rootThreadMessage.parts}
                        onAgentProfile={openAgentProfile}
                      />
                    </Message>
                  ) : null}

                  <MessageSeparator type="reply-count" label="Replies" />

                  {/* Matty typing dots */}
                  {mattyPhase === 'typing' && (
                    <div className={styles['channels-home__typing-row']}>
                      <AgentTypingDots label="Matty is typing" />
                    </div>
                  )}

                  {/* Matty ack / thinking / result phase */}
                  {(mattyPhase === 'ack' || mattyPhase === 'thinking' || mattyPhase === 'result') && (
                    <MattyChannelMessage
                      message={{
                        id: MATTY_ACK_ID,
                        kind: 'agent',
                        username: MATTY.name,
                        avatarSrc: '',
                        avatarAlt: MATTY.name,
                        timestamp: mattyAckTimestampRef.current,
                        body: MATTY_ACK_TEXT,
                        agentShape: MATTY.shape,
                        agentColor: MATTY.color,
                      }}
                      onAgentProfile={openAgentProfile}
                      onReview={openSentinelSettings}
                      phase={mattyPhase}
                      streamedBody={mattyAckVisible}
                      thinkingIndex={mattyThinkingIndex}
                      thinkingLabels={MATTY_THINKING_LABELS}
                    />
                  )}

                  {/* Review card — appears after result phase delay */}
                  {threadReviewMessage ? (
                    <MattyChannelMessage
                      message={threadReviewMessage}
                      onAgentProfile={openAgentProfile}
                      onReview={openSentinelSettings}
                      cardImageSrc={settingsAgent?.customImageSrc}
                    />
                  ) : null}

                  {/* Post-approval: confirm message + delegation notice stay in thread */}
                  {sentinelApproved && confirmedSentinel && threadDelegationNotice ? (
                    <>
                      <MattyChannelMessage
                        message={buildMattySentinelConfirmMessage(
                          approvalTimestampRef.current,
                          confirmedSentinel,
                        )}
                        onAgentProfile={openAgentProfile}
                        onReview={openSentinelSettings}
                        cardImageSrc={confirmedSentinel.customImageSrc}
                      />
                      <div
                        role="button"
                        tabIndex={0}
                        className={[
                          styles['channels-home__system'],
                          styles['channels-home__system--actionable'],
                        ].join(' ')}
                        onClick={(e) => openDelegationDm(e.currentTarget)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openDelegationDm(e.currentTarget);
                          }
                        }}
                      >
                        <MessageBody
                          body={threadDelegationNotice.body}
                          parts={threadDelegationNotice.parts}
                          density="system"
                          disableAgentChips
                          onAgentProfile={openAgentProfile}
                        />
                      </div>
                    </>
                  ) : null}
                </div>
              </Scrollbar>
            </RightSidebar>
          )}
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

      <MattyDelegationDM
        anchor={delegationAnchor}
        open={delegationDmOpen}
        onClose={closeDelegationDm}
      />

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
