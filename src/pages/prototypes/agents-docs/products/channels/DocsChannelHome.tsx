import { useEffect, useRef, useState } from 'react';
import { useExitAnimation } from '@/hooks/useExitAnimation';
import { Button } from '@mattermost/compass-ui/components/button';
import { Chip } from '@mattermost/compass-ui/components/chip';
import { MessageSeparator } from '@mattermost/compass-ui/components/message-separator';
import { RightSidebarHeader } from '@mattermost/compass-ui/components/right-sidebar-header';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { Tag } from '@mattermost/compass-ui/components/tag';
import { ThreadFooter } from '@mattermost/compass-ui/components/thread-footer';
import {
  ChannelHeader,
  Message,
  RightSidebar,
} from '@mattermost/compass-proto';
import AgentApprovalCard from '../../../agents/components/AgentApprovalCard';
import AgentArtifactCard from '../../../agents/components/AgentArtifactCard';
import { AgentPlaybookRhsHeader } from '../../../agents/components/AgentPlaybookPreview';
import DocsArtifactRhs from '../../components/DocsArtifactRhs';
import AgentAvatar from '../../../agents/components/AgentAvatar';
import AgentTypingDots from '../../../agents/components/AgentTypingDots';
import AgentProfilePopover, {
  profileAnchorFromEvent,
  type AgentProfileAnchor,
} from '../../../agents/components/AgentProfilePopover';
import { agentAvatarChipSrc } from '../../../agents/components/agentAvatarShapes';
import MentionMessageInput from '../../../agents/components/MentionMessageInput';
import mentionStyles from '../../../agents/components/MentionMessageInput.module.scss';
import WebhookPost from '../../../agents/components/WebhookPost';
import type { AgentColor, AgentShape, ChannelMessagePart } from '../../../agents/agentsData';
import ChannelIntro from '../../../agents/products/channels/ChannelIntro';
import ChannelsProductSidebar from '../../../agents/products/channels/ChannelsProductSidebar';
import {
  ALEX,
  CODER,
  DOCS_CHANNEL_MESSAGES,
  DOCS_WORKSPACE_AGENTS,
  DOCS_MSG_COLLAPSIBLE_ROOT,
  DOCS_MSG_EMMA_FLAG,
  DOCS_MSG_JORDAN_PREVIEW,
  DOCS_MSG_MATTY_CODER2_SYSTEM,
  DOCS_MSG_MATTY_CODER_STAGING_SYSTEM,
  DOCS_MSG_MATTY_CODER_SYSTEM,
  DOCS_MSG_MATTY_TRACKER,
  DOCS_HISTORY_ENTRIES,
  DOCS_SCENE_CUTOFFS,
  DOCS_THREADS,
  JORDAN,
  MATTY,
  MATTY_CODER2_DM_MESSAGES,
  MATTY_CODER_STAGING_DM_MESSAGES,
  MATTY_CODER_SSO_STAGING_DM_MESSAGES,
  MATTY_CODER_WRITER_GROUP_DM_MESSAGES,
  REVIEWER,
  THREAD_COLLAPSIBLE_POST_DELEGATION,
  WRITER,
  type DocsAgentDmMessage,
  type DocsHistoryEntry,
  type DocsThread,
} from '../../agentsDocsData';
import type { AgentsDocsSceneId } from '../../agentsDocsScenes';
import AgentParallelTrackerCard from '../../components/AgentParallelTrackerCard';
import DocsInlineDelegation, { type InlineDelegationTask } from '../../components/DocsInlineDelegation';
import DocsPagePreviewCard from '../../components/DocsPagePreviewCard';
import styles from './DocsChannelHome.module.scss';

// ---------------------------------------------------------------------------
// Streaming helpers
// ---------------------------------------------------------------------------

const STREAM_MS_PER_WORD = 50;

function useStreamedText(
  text: string,
  enabled: boolean,
  msPerWord = STREAM_MS_PER_WORD,
): { visible: string; complete: boolean } {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const [visibleWordCount, setVisibleWordCount] = useState(enabled ? 0 : words.length);

  useEffect(() => {
    if (!enabled) {
      setVisibleWordCount(words.length);
      return;
    }
    setVisibleWordCount(0);
    if (!words.length) return;
    let count = 0;
    const id = window.setInterval(() => {
      count += 1;
      setVisibleWordCount(count);
      if (count >= words.length) window.clearInterval(id);
    }, msPerWord);
    return () => window.clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, enabled, msPerWord, words.length]);

  return {
    visible: words.slice(0, visibleWordCount).join(' '),
    complete: !enabled || visibleWordCount >= words.length,
  };
}

// ---------------------------------------------------------------------------
// MessageBody — renders plain text or parts with mention chips
// ---------------------------------------------------------------------------

function MessageBody({
  body,
  parts,
  onAgentProfile,
}: {
  body: string;
  parts?: ChannelMessagePart[];
  onAgentProfile?: (id: string, e: React.MouseEvent<HTMLElement>) => void;
}) {
  if (!parts?.length) return <p className={styles['docs-channel__post']}>{body}</p>;
  return (
    <p className={mentionStyles['mention-input__post']}>
      {parts.map((part, i) =>
        part.type === 'text' ? (
          <span key={i}>{part.text}</span>
        ) : part.type === 'link' ? (
          <a key={i} href={part.href} target="_blank" rel="noreferrer">{part.text}</a>
        ) : (
          <Chip
            key={i}
            size="medium"
            compact
            leadingAvatar={{
              src:
                part.avatarSrc ||
                (part.kind === 'agent' && part.agentShape && part.agentColor
                  ? agentAvatarChipSrc(part.agentShape as AgentShape, part.agentColor as AgentColor)
                  : ''),
              alt: part.label,
            }}
            role={part.kind === 'agent' && onAgentProfile ? 'button' : undefined}
            tabIndex={part.kind === 'agent' && onAgentProfile ? 0 : undefined}
            aria-label={part.kind === 'agent' && onAgentProfile ? `View ${part.label} profile` : undefined}
            onClick={
              part.kind === 'agent' && onAgentProfile
                ? (e) => { e.stopPropagation(); onAgentProfile(part.id, e as React.MouseEvent<HTMLElement>); }
                : undefined
            }
            onKeyDown={
              part.kind === 'agent' && onAgentProfile
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      onAgentProfile(part.id, e as unknown as React.MouseEvent<HTMLElement>);
                    }
                  }
                : undefined
            }
            className={[
              mentionStyles['mention-input__mention-chip'],
              mentionStyles['mention-input__post-chip'],
              part.kind === 'agent' ? mentionStyles['mention-input__mention-chip--agent'] : '',
              part.kind === 'agent' && onAgentProfile ? mentionStyles['mention-input__post-chip--interactive'] : '',
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

// Streams body text word-by-word on mount; switches to full MessageBody (with
// chips) once complete. Children render only after streaming finishes.
function StreamingAgentPost({
  body,
  parts,
  onAgentProfile,
  children,
}: {
  body: string;
  parts?: ChannelMessagePart[];
  onAgentProfile?: (id: string, e: React.MouseEvent<HTMLElement>) => void;
  children?: React.ReactNode;
}) {
  const { visible, complete } = useStreamedText(body, true);
  return (
    <>
      {complete
        ? <MessageBody body={body} parts={parts} onAgentProfile={onAgentProfile} />
        : <p className={styles['docs-channel__post']}>{visible}</p>}
      {complete && children}
    </>
  );
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DocsChannelHomeProps = {
  activeScene: AgentsDocsSceneId;
};

// ---------------------------------------------------------------------------
// Parallel tracker rows
// ---------------------------------------------------------------------------

const TRACKER_ROWS_RUNNING = [
  { id: 'tr-1', agentName: 'Coder', task: 'Running CI checks on the merged PR', status: 'running' as const },
  { id: 'tr-2', agentName: 'Reviewer', task: 'Checking the combined page (style, links)', status: 'running' as const },
];
const TRACKER_ROWS_DONE = [
  { id: 'tr-1', agentName: 'Coder', task: 'Running CI checks on the merged PR', status: 'done' as const },
  { id: 'tr-2', agentName: 'Reviewer', task: 'Checking the combined page (style, links)', status: 'done' as const },
];

// ---------------------------------------------------------------------------
// Delegation data — drives DocsInlineDelegation in both channel and thread
// ---------------------------------------------------------------------------

const STAGING_DEPLOY_THINKING = [
  'Merging PR #1851',
  'Running staging deploy pipeline',
  'Verifying staging deployment',
] as const;

const EMMA_THREAD_DELEGATION_THINKING = [
  'Assigning tasks to Coder and Writer',
  'Coder reading auth service config',
  'Coder tracing SAML assertion flow',
  'Coder reviewing OAuth2 redirect chain',
  'Coder compiling flow analysis',
  'Coder writing findings summary',
  'Matty reviewing findings',
  'Writer reading current SSO docs page',
  'Writer drafting content updates',
  'Writer updating SAML step sequence',
  'Reviewer analyzing SSO draft',
  'Reviewer checking tone and accuracy',
  'Reviewer preparing revision',
] as const;

const COLLAPSIBLE_BUILD_THINKING = [
  'Reading the SAML section layout',
  'Analyzing the branching step structure',
  'Designing CollapsibleStep component API',
  'Scaffolding component boilerplate',
  'Implementing expand/collapse logic',
  'Writing component styles',
  'Wiring CollapsibleStep into the SAML section',
  'Verifying interactive behaviour',
  'Adding component to docs library',
  'Running docs site build',
  'Opening PR against docs site repo',
] as const;

type DelegationAgent = { id: string; name: string; shape: AgentShape; color: AgentColor };

type DelegationDef = {
  fromAgent: DelegationAgent;
  toAgents: DelegationAgent[];
  messages: DocsAgentDmMessage[];
  tasks?: InlineDelegationTask[];
  thinkingSteps?: readonly string[];
};

const DM_DELEGATION_MAP: Record<string, DelegationDef> = {
  [DOCS_MSG_MATTY_CODER_SYSTEM]: {
    fromAgent: { id: MATTY.id, name: MATTY.name, shape: MATTY.shape as AgentShape, color: MATTY.color as AgentColor },
    toAgents: [
      { id: CODER.id, name: CODER.name, shape: CODER.shape, color: CODER.color },
      { id: WRITER.id, name: WRITER.name, shape: WRITER.shape, color: WRITER.color },
      { id: REVIEWER.id, name: REVIEWER.name, shape: REVIEWER.shape, color: REVIEWER.color },
    ],
    messages: MATTY_CODER_WRITER_GROUP_DM_MESSAGES,
    tasks: [
      { id: 't1', label: 'Inspect SAML and OAuth2 auth flows', status: 'done', agentId: CODER.id, startsAtStep: 1, doneAtStep: 5 },
      { id: 't2', label: 'Write findings summary', status: 'done', agentId: CODER.id, startsAtStep: 5, doneAtStep: 7 },
      { id: 't3', label: 'Rewrite SSO setup page', status: 'done', agentId: WRITER.id, startsAtStep: 7, doneAtStep: 10 },
      { id: 't4', label: 'Quality review for tone and accuracy', status: 'done', agentId: REVIEWER.id, startsAtStep: 10 },
    ],
    thinkingSteps: EMMA_THREAD_DELEGATION_THINKING,
  },
  [DOCS_MSG_MATTY_CODER2_SYSTEM]: {
    fromAgent: { id: MATTY.id, name: MATTY.name, shape: MATTY.shape as AgentShape, color: MATTY.color as AgentColor },
    toAgents: [{ id: CODER.id, name: CODER.name, shape: CODER.shape, color: CODER.color }],
    messages: MATTY_CODER2_DM_MESSAGES,
    tasks: [
      { id: 't1', label: 'Build CollapsibleStep component', status: 'done', agentId: CODER.id, startsAtStep: 2, doneAtStep: 7 },
      { id: 't2', label: 'Add to docs component library', status: 'done', agentId: CODER.id, startsAtStep: 7, doneAtStep: 9 },
      { id: 't3', label: 'Open PR against docs site repo', status: 'done', agentId: CODER.id, startsAtStep: 9 },
    ],
    thinkingSteps: COLLAPSIBLE_BUILD_THINKING,
  },
  [DOCS_MSG_MATTY_CODER_STAGING_SYSTEM]: {
    fromAgent: { id: MATTY.id, name: MATTY.name, shape: MATTY.shape as AgentShape, color: MATTY.color as AgentColor },
    toAgents: [{ id: CODER.id, name: CODER.name, shape: CODER.shape, color: CODER.color }],
    messages: MATTY_CODER_STAGING_DM_MESSAGES,
    tasks: [
      { id: 't1', label: 'Merge PR #1851', status: 'done', agentId: CODER.id },
      { id: 't2', label: 'Deploy CollapsibleStep to staging', status: 'done', agentId: CODER.id },
    ],
    thinkingSteps: STAGING_DEPLOY_THINKING,
  },
};

// Thread content is driven entirely by DOCS_THREADS (imported from agentsDocsData).
// To add a new threaded post: add an entry to DOCS_THREADS — no changes needed here.

// ---------------------------------------------------------------------------
// renderHistoryEntry — compact renderer for the pre-seeded Mon–Thu messages.
// Handles date-separators, human messages, and agent messages (with threads).
// Does not handle system/webhook/special-card posts — those only appear today.
// ---------------------------------------------------------------------------

function renderHistoryEntry(
  entry: DocsHistoryEntry,
  openThread: (id: string) => void,
  openProfile: (shape: AgentShape, color: AgentColor, e: React.MouseEvent<HTMLElement>) => void,
  s: typeof styles,
) {
  if ('label' in entry && entry.kind === 'date-separator') {
    return <MessageSeparator key={entry.id} type="date" label={entry.label} />;
  }
  const msg = entry as Exclude<DocsHistoryEntry, { kind: 'date-separator' }>;
  const thread = DOCS_THREADS[msg.id];

  if (msg.kind === 'agent') {
    return (
      <div key={msg.id} className={s['docs-channel__agent-message']}>
        <div
          className={s['docs-channel__agent-message-avatar']}
          role="button"
          tabIndex={0}
          onClick={(e) => openProfile(msg.agentShape ?? 'sphere', msg.agentColor ?? 'yellow', e)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProfile(msg.agentShape ?? 'sphere', msg.agentColor ?? 'yellow', e as unknown as React.MouseEvent<HTMLElement>); } }}
        >
          <AgentAvatar shape={msg.agentShape ?? 'sphere'} color={msg.agentColor ?? 'yellow'} size="sm" eyes />
        </div>
        <div className={s['docs-channel__agent-message-body']}>
          <div className={s['docs-channel__agent-message-meta']}>
            <span className={s['docs-channel__agent-message-name']}>{msg.username}</span>
            <Tag label="Agent" size="x-small" />
            <time className={s['docs-channel__agent-message-time']}>{msg.timestamp}</time>
          </div>
          <p className={s['docs-channel__post']}>{msg.body}</p>
          {thread && (
            <ThreadFooter
              replyCount={thread.replyCount}
              lastReplyTime={thread.lastReplyTime}
              avatars={thread.participants.map((p) => ({
                key: p.key, name: p.name,
                src: p.agentShape && p.agentColor
                  ? agentAvatarChipSrc(p.agentShape as AgentShape, p.agentColor as AgentColor)
                  : (p.avatarSrc ?? ''),
              }))}
              onReply={() => openThread(msg.id)}
            />
          )}
        </div>
      </div>
    );
  }

  // Human message
  return (
    <div
      key={msg.id}
      className={[s['docs-channel__message-row'], thread ? s['docs-channel__message-row--threaded'] : ''].filter(Boolean).join(' ')}
      role={thread ? 'button' : undefined}
      tabIndex={thread ? 0 : undefined}
      onClick={thread ? () => openThread(msg.id) : undefined}
      onKeyDown={thread ? (e) => { if (e.key === 'Enter') openThread(msg.id); } : undefined}
    >
      <Message
        username={msg.username}
        avatarSrc={msg.avatarSrc}
        avatarAlt={msg.avatarAlt}
        timestamp={msg.timestamp}
        showMessageActions={false}
      >
        <p className={s['docs-channel__post']}>{msg.body}</p>
        {thread && (
          <ThreadFooter
            replyCount={thread.replyCount}
            lastReplyTime={thread.lastReplyTime}
            avatars={thread.participants.map((p) => ({
              key: p.key, name: p.name,
              src: p.agentShape && p.agentColor
                ? agentAvatarChipSrc(p.agentShape as AgentShape, p.agentColor as AgentColor)
                : (p.avatarSrc ?? ''),
            }))}
            onReply={() => openThread(msg.id)}
          />
        )}
      </Message>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DocsChannelHome({ activeScene }: DocsChannelHomeProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const threadBodyRef = useRef<HTMLDivElement>(null);
  const [previewApproved, setPreviewApproved] = useState(false);
  const [approvalThreadApproved, setApprovalThreadApproved] = useState(false);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [delegationSettled, setDelegationSettled] = useState(false);
  const [collapsibleSettled, setCollapsibleSettled] = useState(false);
  const [artifactTitle, setArtifactTitle] = useState('');
  const [artifactOpen, setArtifactOpen] = useState(false);
  const [artifactApproved, setArtifactApproved] = useState(false);
  const { rendered: artifactRendered, exiting: artifactExiting } = useExitAnimation(artifactOpen, 220);
  const [profileTarget, setProfileTarget] = useState<AgentProfileAnchor | null>(null);
  // Numeric phase: even = showing messages, odd = showing typing indicator for step floor(phase/2)
  const [threadPhase, setThreadPhase] = useState(0);
  // Sequential reveal index for post-delegation collapsible content (0 = none visible)
  const [postDelegationPhase, setPostDelegationPhase] = useState(0);
  const { rendered: rhsRendered, exiting: rhsExiting } = useExitAnimation(!!activePostId, 220);

  const openAgentProfile = (agentId: string, e: React.MouseEvent<HTMLElement>) => {
    const agent = DOCS_WORKSPACE_AGENTS.find((a) => a.id === agentId);
    if (agent) setProfileTarget(profileAnchorFromEvent(agent, e));
  };

  const openAgentProfileByShapeColor = (shape: AgentShape, color: AgentColor, e: React.MouseEvent<HTMLElement>) => {
    const agent = DOCS_WORKSPACE_AGENTS.find((a) => a.shape === shape && a.color === color);
    if (agent) setProfileTarget(profileAnchorFromEvent(agent, e));
  };

  const openThread = (postId: string) => setActivePostId(postId);
  const closeThread = () => setActivePostId(null);

  const cutoffId = DOCS_SCENE_CUTOFFS[activeScene] ?? DOCS_MSG_MATTY_TRACKER;
  const cutoffIndex = DOCS_CHANNEL_MESSAGES.findIndex((m) => m.id === cutoffId);
  const visibleMessages =
    cutoffIndex >= 0
      ? DOCS_CHANNEL_MESSAGES.slice(0, cutoffIndex + 1)
      : DOCS_CHANNEL_MESSAGES;

  const isApprovalScene = activeScene === 'approval';
  const isLaterThatWeek = activeScene === 'later-that-week';

  // Scroll channel to bottom on scene change — rAF ensures DOM is fully painted
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const raf = requestAnimationFrame(() => {
      const viewport = el.closest('.simplebar-content-wrapper') as HTMLElement | null;
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    });
    return () => cancelAnimationFrame(raf);
  }, [activeScene]);

  // Scroll both channel and thread RHS to bottom when thread opens
  useEffect(() => {
    if (!activePostId) return;
    const channelEl = scrollRef.current;
    const threadEl = threadBodyRef.current;
    const raf = requestAnimationFrame(() => {
      if (channelEl) {
        const vp = channelEl.closest('.simplebar-content-wrapper') as HTMLElement | null;
        if (vp) vp.scrollTop = vp.scrollHeight;
      }
      if (threadEl) {
        const vp = threadEl.closest('.simplebar-content-wrapper') as HTMLElement | null;
        if (vp) vp.scrollTop = vp.scrollHeight;
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [activePostId]);

  // Keep the thread RHS pinned to bottom as content grows (streaming, typing dots, card expand, new posts).
  // Tracks whether the user is at the bottom via a scroll listener; ResizeObserver scrolls only when pinned.
  useEffect(() => {
    if (!rhsRendered) return;
    const el = threadBodyRef.current;
    if (!el) return;
    const vp = el.closest('.simplebar-content-wrapper') as HTMLElement | null;
    if (!vp) return;

    const pinned = { current: true };
    const onScroll = () => {
      pinned.current = vp.scrollHeight - vp.scrollTop - vp.clientHeight < 20;
    };
    const observer = new ResizeObserver(() => {
      if (pinned.current) vp.scrollTop = vp.scrollHeight;
    });

    vp.addEventListener('scroll', onScroll, { passive: true });
    observer.observe(el);
    return () => {
      vp.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, [activePostId, rhsRendered]);

  // Open/close thread on scene change. Grounding fast-forwards the Emma thread; approval fast-forwards the collapsible thread.
  useEffect(() => {
    if (activeScene === 'grounding') {
      setActivePostId(DOCS_MSG_EMMA_FLAG);
    } else if (activeScene === 'approval') {
      setActivePostId(DOCS_MSG_COLLAPSIBLE_ROOT);
    } else {
      setActivePostId(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeScene]);

  // Typing animation sequence — step through each DocsTypingStep in the thread.
  // Also resets delegation settled state and handles grounding fast-forward.
  useEffect(() => {
    setThreadPhase(0);
    setDelegationSettled(false);
    setCollapsibleSettled(false);
    setArtifactApproved(false);
    setApprovalThreadApproved(false);
    if (!activePostId) return;

    // Grounding scene: skip all animations, jump straight to settled state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (activeScene === 'grounding') {
      const steps = DOCS_THREADS[activePostId]?.typing;
      if (steps?.length) setThreadPhase(steps.length * 2);
      setDelegationSettled(true);
      return;
    }

    // Approval scene: fast-forward collapsible thread to fully settled state.
    if (activeScene === 'approval' && activePostId === DOCS_MSG_COLLAPSIBLE_ROOT) {
      const steps = DOCS_THREADS[activePostId]?.typing;
      if (steps?.length) setThreadPhase(steps.length * 2);
      setDelegationSettled(true);
      setCollapsibleSettled(true);
      return;
    }

    const steps = DOCS_THREADS[activePostId]?.typing;
    if (!steps?.length) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const FIRST_DELAY = 800;
    const TYPING_DURATION = 1500;
    const BETWEEN_DELAY = 1200;
    let t = FIRST_DELAY;
    steps.forEach((_, i) => {
      timers.push(setTimeout(() => setThreadPhase(i * 2 + 1), t)); // show typing i
      t += TYPING_DURATION;
      timers.push(setTimeout(() => setThreadPhase(i * 2 + 2), t)); // advance messages
      t += BETWEEN_DELAY;
    });
    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePostId]);

  // After the Coder2 delegation settles, reveal post-delegation replies one by one.
  // Delays are chosen so each agent message finishes streaming before the next appears.
  useEffect(() => {
    setPostDelegationPhase(0);
    if (!delegationSettled || activePostId !== DOCS_MSG_COLLAPSIBLE_ROOT) return;
    if (activeScene === 'approval') {
      setPostDelegationPhase(THREAD_COLLAPSIBLE_POST_DELEGATION.length);
      return;
    }
    const REVEAL_DELAYS = [600, 2200, 3800, 5200, 7000, 8800];
    const timers = REVEAL_DELAYS.map((delay, i) =>
      setTimeout(() => setPostDelegationPhase(i + 1), delay),
    );
    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delegationSettled, activePostId, activeScene]);

  // Thread content
  const currentThread: DocsThread | null = activePostId ? (DOCS_THREADS[activePostId] ?? null) : null;
  const rootMessage = activePostId
    ? (
        DOCS_CHANNEL_MESSAGES.find((m) => m.id === activePostId) ??
        (DOCS_HISTORY_ENTRIES.find(
          (e): e is Exclude<DocsHistoryEntry, { kind: 'date-separator'; id: string; label: string }> =>
            !('label' in e) && (e as { id: string }).id === activePostId,
        ) ?? null)
      )
    : null;

  const visibleReplies = (() => {
    if (!currentThread) return [];
    const { typing, replies } = currentThread;
    if (!typing?.length) return replies;
    const completedSteps = Math.floor(threadPhase / 2);
    if (completedSteps >= typing.length) return replies;
    return replies.slice(0, typing[completedSteps].afterIndex);
  })();

  const activeTypingStep = (() => {
    const steps = currentThread?.typing;
    if (!steps?.length || threadPhase % 2 === 0) return null;
    return steps[Math.floor(threadPhase / 2)] ?? null;
  })();

  // Live reply count for the channel-side thread footer — sums every visible item in the active thread.
  // When a thread is not active, callers fall back to the static DOCS_THREADS replyCount.
  const liveReplyCount = (() => {
    if (!activePostId) return 0;
    let n = visibleReplies.length;
    if (activePostId === DOCS_MSG_COLLAPSIBLE_ROOT) {
      n += postDelegationPhase;
      if (collapsibleSettled) n += 1; // Matty's staging-preview post
      if (activeScene === 'approval' && collapsibleSettled) {
        n += 3; // Matty tracker, Alex, Jordan
        if (approvalThreadApproved) n += 1; // Coder deploy
      }
    } else if (activePostId === DOCS_MSG_EMMA_FLAG) {
      if (delegationSettled) n += 1; // Matty's revised-doc post
      if (delegationSettled && artifactApproved) n += 3; // Jordan reply + Matty delegation request + SSO staging card
      if (collapsibleSettled) n += 1; // Matty SSO staging preview
    }
    return n;
  })();

  return (
    <div className={styles['docs-channel']}>
      <ChannelsProductSidebar activeChannelName="docs-site" />
      <div className={styles['docs-channel__inner']}>
        <div className={styles['docs-channel__center']}>
          <ChannelHeader
            type="channel"
            name="docs-site"
            description="Docs site updates, reviews, and deploy coordination."
            memberCount={5}
            pinnedCount={0}
          />
          <div className={styles['docs-channel__messages']}>
            <Scrollbar>
              <div ref={scrollRef} className={styles['docs-channel__messages-list']}>
                <ChannelIntro
                  name="docs-site"
                  createdBy="Jordan Lee"
                  createdAt="Jan 12"
                  description="Channel for docs site updates, reviews, and deploy coordination."
                  variant="public"
                />

                {DOCS_HISTORY_ENTRIES.map((entry) =>
                  renderHistoryEntry(entry, openThread, openAgentProfileByShapeColor, styles)
                )}

                <MessageSeparator type="date" label="Today" />

                {visibleMessages.map((message) => {
                  // System notices (delegation DM triggers)
                  if (message.kind === 'system') {
                    const dmDef = message.actionable ? DM_DELEGATION_MAP[message.id] : undefined;
                    if (dmDef) {
                      return (
                        <DocsInlineDelegation
                          key={message.id}
                          label={message.body}
                          fromAgent={dmDef.fromAgent}
                          toAgents={dmDef.toAgents}
                          messages={dmDef.messages}
                          thinkingSteps={dmDef.thinkingSteps}
                          onArtifactOpen={(title) => { setArtifactTitle(title); setArtifactOpen(true); }}
                        />
                      );
                    }
                    return (
                      <div key={message.id} className={styles['docs-channel__system']}>
                        <p>{message.body}</p>
                      </div>
                    );
                  }

                  // Webhook posts (Monitor uptime alert)
                  if (message.kind === 'webhook' && message.webhookPost) {
                    return (
                      <div key={message.id} className={styles['docs-channel__agent-message']}>
                        <div
                          className={styles['docs-channel__agent-message-avatar']}
                          role="button"
                          tabIndex={0}
                          onClick={(e) => openAgentProfileByShapeColor(message.agentShape ?? 'shield', message.agentColor ?? 'blue', e)}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAgentProfileByShapeColor(message.agentShape ?? 'shield', message.agentColor ?? 'blue', e as unknown as React.MouseEvent<HTMLElement>); } }}
                        >
                          <AgentAvatar
                            shape={message.agentShape ?? 'shield'}
                            color={message.agentColor ?? 'blue'}
                            size="sm"
                            eyes
                          />
                        </div>
                        <div className={styles['docs-channel__agent-message-body']}>
                          <div className={styles['docs-channel__agent-message-meta']}>
                            <span className={styles['docs-channel__agent-message-name']}>{message.username}</span>
                            <Tag label="Agent" size="x-small" />
                            <time className={styles['docs-channel__agent-message-time']}>{message.timestamp}</time>
                          </div>
                          <WebhookPost data={message.webhookPost} />
                        </div>
                      </div>
                    );
                  }

                  // Agent posts
                  if (message.kind === 'agent') {
                    const isTracker = message.id === DOCS_MSG_MATTY_TRACKER;
                    const trackerDone = isApprovalScene || isLaterThatWeek;

                    return (
                      <div key={message.id} className={styles['docs-channel__agent-message']}>
                        <div
                          className={styles['docs-channel__agent-message-avatar']}
                          role="button"
                          tabIndex={0}
                          onClick={(e) => openAgentProfileByShapeColor(message.agentShape ?? 'sphere', message.agentColor ?? 'yellow', e)}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAgentProfileByShapeColor(message.agentShape ?? 'sphere', message.agentColor ?? 'yellow', e as unknown as React.MouseEvent<HTMLElement>); } }}
                        >
                          <AgentAvatar
                            shape={message.agentShape ?? 'sphere'}
                            color={message.agentColor ?? 'yellow'}
                            size="sm"
                            eyes
                          />
                        </div>
                        <div className={styles['docs-channel__agent-message-body']}>
                          <div className={styles['docs-channel__agent-message-meta']}>
                            <span className={styles['docs-channel__agent-message-name']}>{message.username}</span>
                            <Tag label="Agent" size="x-small" />
                            <time className={styles['docs-channel__agent-message-time']}>{message.timestamp}</time>
                          </div>
                          {isTracker ? (
                            <div className={styles['docs-channel__card']}>
                              <AgentParallelTrackerCard
                                rows={trackerDone ? TRACKER_ROWS_DONE : TRACKER_ROWS_RUNNING}
                                allDone={trackerDone}
                              />
                            </div>
                          ) : message.agentReviewCard ? (
                            <StreamingAgentPost body={message.body} parts={message.parts} onAgentProfile={openAgentProfile}>
                              <div className={styles['docs-channel__card']}>
                                <AgentApprovalCard
                                  title={message.agentReviewCard.name}
                                  description={message.agentReviewCard.description}
                                  agentShape={WRITER.shape}
                                  agentColor={WRITER.color}
                                  accepted={true}
                                  dismissed={false}
                                  onApprove={() => {}}
                                  onDismiss={() => {}}
                                />
                              </div>
                            </StreamingAgentPost>
                          ) : (
                            <StreamingAgentPost body={message.body} parts={message.parts} onAgentProfile={openAgentProfile} />
                          )}
                          {(() => {
                            const t = DOCS_THREADS[message.id];
                            return t ? (
                              <ThreadFooter
                                replyCount={t.replyCount}
                                lastReplyTime={t.lastReplyTime}
                                avatars={t.participants.map((p) => ({
                                  key: p.key,
                                  name: p.name,
                                  src:
                                    p.agentShape && p.agentColor
                                      ? agentAvatarChipSrc(p.agentShape as AgentShape, p.agentColor as AgentColor)
                                      : (p.avatarSrc ?? ''),
                                }))}
                                onReply={() => openThread(message.id)}
                              />
                            ) : null;
                          })()}
                        </div>
                      </div>
                    );
                  }

                  // Jordan's preview card post
                  if (message.id === DOCS_MSG_JORDAN_PREVIEW) {
                    return (
                      <div key={message.id} className={styles['docs-channel__message-row']}>
                        <Message
                          username={message.username}
                          avatarSrc={message.avatarSrc}
                          avatarAlt={message.avatarAlt}
                          timestamp={message.timestamp}
                          showMessageActions={false}
                        >
                          <MessageBody body={message.body} parts={message.parts} onAgentProfile={openAgentProfile} />
                          <DocsPagePreviewCard
                            approved={previewApproved}
                            onApprove={() => setPreviewApproved(true)}
                            onReject={() => {}}
                          />
                        </Message>
                      </div>
                    );
                  }

                  // Collapsible-component root post — heading + body
                  if (message.id === DOCS_MSG_COLLAPSIBLE_ROOT) {
                    const thread = DOCS_THREADS[message.id];
                    const isActive = activePostId === message.id;
                    const footerCount = isActive ? liveReplyCount : (thread?.replyCount ?? 0);
                    const showFooter = isActive ? footerCount > 0 : !!thread;
                    return (
                      <div
                        key={message.id}
                        className={[
                          styles['docs-channel__message-row'],
                          styles['docs-channel__message-row--threaded'],
                        ].join(' ')}
                        role="button"
                        tabIndex={0}
                        onClick={() => openThread(message.id)}
                        onKeyDown={(e) => { if (e.key === 'Enter') openThread(message.id); }}
                      >
                        <Message
                          username={message.username}
                          avatarSrc={message.avatarSrc}
                          avatarAlt={message.avatarAlt}
                          timestamp={message.timestamp}
                          showMessageActions={false}
                        >
                          <p className={styles['docs-channel__post-heading']}>New collapsible component needed</p>
                          <p className={styles['docs-channel__post']}>{message.body}</p>
                          {showFooter && thread && (
                            <ThreadFooter
                              replyCount={footerCount}
                              lastReplyTime={thread.lastReplyTime}
                              avatars={thread.participants.map((p) => ({
                                key: p.key,
                                name: p.name,
                                src:
                                  p.agentShape && p.agentColor
                                    ? agentAvatarChipSrc(p.agentShape as AgentShape, p.agentColor as AgentColor)
                                    : (p.avatarSrc ?? ''),
                              }))}
                              onReply={() => openThread(message.id)}
                            />
                          )}
                        </Message>
                      </div>
                    );
                  }

                  // Emma's flag post — heading + body
                  if (message.id === DOCS_MSG_EMMA_FLAG) {
                    const t = DOCS_THREADS[message.id];
                    const isActive = activePostId === message.id;
                    const footerCount = isActive ? liveReplyCount : (t?.replyCount ?? 0);
                    const showFooter = isActive ? footerCount > 0 : !!t;
                    return (
                      <div
                        key={message.id}
                        className={[
                          styles['docs-channel__message-row'],
                          styles['docs-channel__message-row--threaded'],
                        ].join(' ')}
                        role="button"
                        tabIndex={0}
                        onClick={() => openThread(message.id)}
                        onKeyDown={(e) => { if (e.key === 'Enter') openThread(message.id); }}
                      >
                        <Message
                          username={message.username}
                          avatarSrc={message.avatarSrc}
                          avatarAlt={message.avatarAlt}
                          timestamp={message.timestamp}
                          showMessageActions={false}
                        >
                          <p className={styles['docs-channel__post-heading']}>SSO setup page is out of date</p>
                          <p className={styles['docs-channel__post']}>{message.body}</p>
                          {showFooter && t && (
                            <ThreadFooter
                              replyCount={footerCount}
                              lastReplyTime={t.lastReplyTime}
                              avatars={t.participants.map((p) => ({
                                key: p.key,
                                name: p.name,
                                src:
                                  p.agentShape && p.agentColor
                                    ? agentAvatarChipSrc(p.agentShape as AgentShape, p.agentColor as AgentColor)
                                    : (p.avatarSrc ?? ''),
                              }))}
                              onReply={() => openThread(message.id)}
                            />
                          )}
                        </Message>
                      </div>
                    );
                  }

                  // Human user posts
                  const thread = DOCS_THREADS[message.id];
                  const isActive = activePostId === message.id;
                  const footerCount = isActive ? liveReplyCount : (thread?.replyCount ?? 0);
                  const hasThread = isActive ? footerCount > 0 : !!thread;
                  return (
                    <div
                      key={message.id}
                      className={[
                        styles['docs-channel__message-row'],
                        hasThread ? styles['docs-channel__message-row--threaded'] : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      role={hasThread ? 'button' : undefined}
                      tabIndex={hasThread ? 0 : undefined}
                      onClick={hasThread ? () => openThread(message.id) : undefined}
                      onKeyDown={
                        hasThread
                          ? (e) => { if (e.key === 'Enter') openThread(message.id); }
                          : undefined
                      }
                    >
                      <Message
                        username={message.username}
                        avatarSrc={message.avatarSrc}
                        avatarAlt={message.avatarAlt}
                        timestamp={message.timestamp}
                        showMessageActions={false}
                      >
                        <MessageBody body={message.body} parts={message.parts} onAgentProfile={openAgentProfile} />
                        {hasThread && thread && (
                          <ThreadFooter
                            replyCount={footerCount}
                            lastReplyTime={thread.lastReplyTime}
                            avatars={thread.participants.map((p) => ({
                              key: p.key,
                              name: p.name,
                              src:
                                p.agentShape && p.agentColor
                                  ? agentAvatarChipSrc(p.agentShape as AgentShape, p.agentColor as AgentColor)
                                  : (p.avatarSrc ?? ''),
                            }))}
                            onReply={() => openThread(message.id)}
                          />
                        )}
                      </Message>
                    </div>
                  );
                })}
              </div>
            </Scrollbar>
          </div>
          <div className={[styles['docs-channel__composer'], activePostId ? styles['docs-channel__composer--rhs-open'] : ''].filter(Boolean).join(' ')}>
            <MentionMessageInput
              placeholder="Write to docs-site"
              onSend={() => undefined}
            />
          </div>
        </div>

        {/* Thread RHS */}
        {rhsRendered && (
          <div className={[
            styles['docs-channel__rhs'],
            rhsExiting ? styles['docs-channel__rhs--exiting'] : '',
          ].filter(Boolean).join(' ')}>
            <div className={styles['docs-channel__rhs-thread']}>
            <RightSidebar
              alignBody="end"
              header={
                <RightSidebarHeader
                  title="Thread"
                  onClose={closeThread}
                />
              }
              footer={
                <div className={styles['docs-channel__rhs-composer']}>
                  <MentionMessageInput placeholder="Reply in thread…" onSend={() => undefined} />
                </div>
              }
            >
              <div key={activePostId} ref={threadBodyRef} className={styles['docs-channel__rhs-thread-messages']}>
                {/* Root post */}
                {rootMessage?.kind === 'agent' && (
                  <div className={styles['docs-channel__agent-message']}>
                    <div
                      className={styles['docs-channel__agent-message-avatar']}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => openAgentProfileByShapeColor(rootMessage.agentShape ?? 'sphere', rootMessage.agentColor ?? 'yellow', e)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAgentProfileByShapeColor(rootMessage.agentShape ?? 'sphere', rootMessage.agentColor ?? 'yellow', e as unknown as React.MouseEvent<HTMLElement>); } }}
                    >
                      <AgentAvatar
                        shape={rootMessage.agentShape ?? 'sphere'}
                        color={rootMessage.agentColor ?? 'yellow'}
                        size="sm"
                        eyes
                      />
                    </div>
                    <div className={styles['docs-channel__agent-message-body']}>
                      <div className={styles['docs-channel__agent-message-meta']}>
                        <span className={styles['docs-channel__agent-message-name']}>{rootMessage.username}</span>
                        <Tag label="Agent" size="x-small" />
                        <time className={styles['docs-channel__agent-message-time']}>{rootMessage.timestamp}</time>
                      </div>
                      <MessageBody body={rootMessage.body} parts={rootMessage.parts} onAgentProfile={openAgentProfile} />
                    </div>
                  </div>
                )}
                {rootMessage?.kind !== 'agent' && rootMessage && (
                  <div className={styles['docs-channel__message-row']}>
                    <Message
                      avatarSrc={rootMessage.avatarSrc}
                      avatarAlt={rootMessage.avatarAlt}
                      username={rootMessage.username}
                      timestamp={rootMessage.timestamp}
                      showMessageActions={false}
                    >
                      {rootMessage.id === DOCS_MSG_COLLAPSIBLE_ROOT && (
                        <p className={styles['docs-channel__post-heading']}>New collapsible component needed</p>
                      )}
                      {rootMessage.id === DOCS_MSG_EMMA_FLAG && (
                        <p className={styles['docs-channel__post-heading']}>SSO setup page is out of date</p>
                      )}
                      <MessageBody body={rootMessage.body} parts={rootMessage.parts} onAgentProfile={openAgentProfile} />
                    </Message>
                  </div>
                )}

                {/* Reply separator — count tracks visible replies so it increments as replies arrive */}
                {visibleReplies.length > 0 && (
                  <MessageSeparator
                    type="reply-count"
                    label={`${visibleReplies.length} ${visibleReplies.length === 1 ? 'reply' : 'replies'}`}
                  />
                )}

                {/* Thread replies */}
                {visibleReplies.map((reply, i) =>
                  reply.kind === 'system' ? (
                    (() => {
                      const dmDef = reply.actionable && reply.id ? DM_DELEGATION_MAP[reply.id] : undefined;
                      if (dmDef) {
                        return (
                          <DocsInlineDelegation
                            key={i}
                            label={reply.body}
                            fromAgent={dmDef.fromAgent}
                            toAgents={dmDef.toAgents}
                            messages={dmDef.messages}
                            tasks={dmDef.tasks}
                            thinkingSteps={activeScene === 'grounding' ? undefined : dmDef.thinkingSteps}
                            onSettled={
                              dmDef.thinkingSteps && activeScene !== 'grounding'
                                ? reply.id === DOCS_MSG_MATTY_CODER_STAGING_SYSTEM
                                  ? () => setCollapsibleSettled(true)
                                  : () => setDelegationSettled(true)
                                : undefined
                            }
                            onArtifactOpen={(title) => { setArtifactTitle(title); setArtifactOpen(true); }}
                          />
                        );
                      }
                      return (
                        <div key={i} className={styles['docs-channel__system']}>
                          <p>{reply.body}</p>
                        </div>
                      );
                    })()
                  ) : reply.agentShape ? (
                    <div key={i} className={styles['docs-channel__agent-message']}>
                      <div
                        className={styles['docs-channel__agent-message-avatar']}
                        role="button"
                        tabIndex={0}
                        onClick={(e) => openAgentProfileByShapeColor(reply.agentShape!, reply.agentColor ?? 'yellow', e)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAgentProfileByShapeColor(reply.agentShape!, reply.agentColor ?? 'yellow', e as unknown as React.MouseEvent<HTMLElement>); } }}
                      >
                        <AgentAvatar
                          shape={reply.agentShape}
                          color={reply.agentColor ?? 'yellow'}
                          size="sm"
                          eyes
                        />
                      </div>
                      <div className={styles['docs-channel__agent-message-body']}>
                        <div className={styles['docs-channel__agent-message-meta']}>
                          <span className={styles['docs-channel__agent-message-name']}>{reply.username}</span>
                          <Tag label="Agent" size="x-small" />
                          <time className={styles['docs-channel__agent-message-time']}>{reply.timestamp}</time>
                        </div>
                        <StreamingAgentPost body={reply.body} parts={reply.parts} onAgentProfile={openAgentProfile} />
                      </div>
                    </div>
                  ) : (
                    <div key={i} className={styles['docs-channel__message-row']}>
                      <Message
                        avatarSrc={reply.avatarSrc}
                        avatarAlt={reply.avatarAlt}
                        username={reply.username}
                        timestamp={reply.timestamp}
                        showMessageActions={false}
                      >
                        <MessageBody body={reply.body} parts={reply.parts} onAgentProfile={openAgentProfile} />
                      </Message>
                    </div>
                  ),
                )}
                {activeTypingStep && (
                  <div className={styles['docs-channel__rhs-typing']}>
                    <AgentTypingDots label={activeTypingStep.label ?? 'Typing…'} />
                  </div>
                )}

                {/* Collapsible thread: PR review + staging delegation, gated on Coder2 delegation settling.
                    postDelegationPhase sequences reveals so messages appear one at a time. */}
                {delegationSettled && activePostId === DOCS_MSG_COLLAPSIBLE_ROOT && (() => {
                  const stagingDef = DM_DELEGATION_MAP[DOCS_MSG_MATTY_CODER_STAGING_SYSTEM];
                  return (
                    <>
                      {THREAD_COLLAPSIBLE_POST_DELEGATION.slice(0, postDelegationPhase).map((reply, i) => {
                        if (reply.kind === 'system') {
                          const dmDef = reply.actionable && reply.id ? DM_DELEGATION_MAP[reply.id] : undefined;
                          if (dmDef) {
                            return (
                              <DocsInlineDelegation
                                key={`cpd-${i}`}
                                label={reply.body}
                                fromAgent={dmDef.fromAgent}
                                toAgents={dmDef.toAgents}
                                messages={dmDef.messages}
                                tasks={dmDef.tasks}
                                thinkingSteps={dmDef.thinkingSteps}
                                onSettled={reply.id === DOCS_MSG_MATTY_CODER_STAGING_SYSTEM ? () => setCollapsibleSettled(true) : undefined}
                                onArtifactOpen={(title) => { setArtifactTitle(title); setArtifactOpen(true); }}
                              />
                            );
                          }
                          return (
                            <div key={`cpd-${i}`} className={styles['docs-channel__system']}>
                              <p>{reply.body}</p>
                            </div>
                          );
                        }
                        if (reply.agentShape) {
                          return (
                            <div key={`cpd-${i}`} className={styles['docs-channel__agent-message']}>
                              <div
                                className={styles['docs-channel__agent-message-avatar']}
                                role="button"
                                tabIndex={0}
                                onClick={(e) => openAgentProfileByShapeColor(reply.agentShape!, reply.agentColor ?? 'yellow', e)}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAgentProfileByShapeColor(reply.agentShape!, reply.agentColor ?? 'yellow', e as unknown as React.MouseEvent<HTMLElement>); } }}
                              >
                                <AgentAvatar shape={reply.agentShape} color={reply.agentColor ?? 'yellow'} size="sm" eyes />
                              </div>
                              <div className={styles['docs-channel__agent-message-body']}>
                                <div className={styles['docs-channel__agent-message-meta']}>
                                  <span className={styles['docs-channel__agent-message-name']}>{reply.username}</span>
                                  <Tag label="Agent" size="x-small" />
                                  <time className={styles['docs-channel__agent-message-time']}>{reply.timestamp}</time>
                                </div>
                                <StreamingAgentPost body={reply.body} parts={reply.parts} onAgentProfile={openAgentProfile} />
                              </div>
                            </div>
                          );
                        }
                        return (
                          <div key={`cpd-${i}`} className={styles['docs-channel__message-row']}>
                            <Message
                              avatarSrc={reply.avatarSrc}
                              avatarAlt={reply.avatarAlt}
                              username={reply.username}
                              timestamp={reply.timestamp}
                              showMessageActions={false}
                            >
                              <MessageBody body={reply.body} parts={reply.parts} onAgentProfile={openAgentProfile} />
                            </Message>
                          </div>
                        );
                      })}
                    </>
                  );
                })()}

                {/* Matty posts the revised doc once all delegation tasks are done */}
                {delegationSettled && activePostId === DOCS_MSG_EMMA_FLAG && (
                  <div className={styles['docs-channel__agent-message']}>
                    <div
                      className={styles['docs-channel__agent-message-avatar']}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => openAgentProfileByShapeColor(MATTY.shape as AgentShape, MATTY.color as AgentColor, e)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAgentProfileByShapeColor(MATTY.shape as AgentShape, MATTY.color as AgentColor, e as unknown as React.MouseEvent<HTMLElement>); } }}
                    >
                      <AgentAvatar shape={MATTY.shape as AgentShape} color={MATTY.color as AgentColor} size="sm" eyes />
                    </div>
                    <div className={styles['docs-channel__agent-message-body']}>
                      <div className={styles['docs-channel__agent-message-meta']}>
                        <span className={styles['docs-channel__agent-message-name']}>{MATTY.name}</span>
                        <Tag label="Agent" size="x-small" />
                        <time className={styles['docs-channel__agent-message-time']}>10:09 AM</time>
                      </div>
                      <StreamingAgentPost
                        body="Jordan — the revised SSO setup page is ready for your approval. Reviewer checked it for tone, spelling, grammar, and accuracy."
                        parts={[
                          { type: 'mention', id: 'jordan', label: 'Jordan Lee', avatarSrc: JORDAN.avatarSrc, kind: 'user' as const },
                          { type: 'text', text: ' — the revised SSO setup page is ready for your approval. Reviewer checked it for tone, spelling, grammar, and accuracy.' },
                        ]}
                        onAgentProfile={openAgentProfile}
                      >
                        <div className={styles['docs-channel__card']}>
                          <AgentArtifactCard
                            title="SSO setup page — revised"
                            meta="Markdown · 528 words"
                            onOpen={() => { setArtifactTitle('SSO setup page — revised'); setArtifactOpen(true); }}
                          />
                        </div>
                      </StreamingAgentPost>
                    </div>
                  </div>
                )}

                {/* Matty posts the staging preview once Coder's deploy delegation is done */}
                {collapsibleSettled && activePostId === DOCS_MSG_COLLAPSIBLE_ROOT && (
                  <div className={styles['docs-channel__agent-message']}>
                    <div
                      className={styles['docs-channel__agent-message-avatar']}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => openAgentProfileByShapeColor(MATTY.shape as AgentShape, MATTY.color as AgentColor, e)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAgentProfileByShapeColor(MATTY.shape as AgentShape, MATTY.color as AgentColor, e as unknown as React.MouseEvent<HTMLElement>); } }}
                    >
                      <AgentAvatar shape={MATTY.shape as AgentShape} color={MATTY.color as AgentColor} size="sm" eyes />
                    </div>
                    <div className={styles['docs-channel__agent-message-body']}>
                      <div className={styles['docs-channel__agent-message-meta']}>
                        <span className={styles['docs-channel__agent-message-name']}>{MATTY.name}</span>
                        <Tag label="Agent" size="x-small" />
                        <time className={styles['docs-channel__agent-message-time']}>12:15 PM</time>
                      </div>
                      <StreamingAgentPost
                        body="Staging is live. Jordan — here's a preview of the SSO setup page with the CollapsibleStep component in place."
                        parts={[
                          { type: 'text', text: 'Staging is live. ' },
                          { type: 'mention', id: 'jordan', label: 'Jordan Lee', avatarSrc: JORDAN.avatarSrc, kind: 'user' as const },
                          { type: 'text', text: ' — here\'s a preview of the SSO setup page with the CollapsibleStep component in place.' },
                        ]}
                        onAgentProfile={openAgentProfile}
                      >
                        <div className={styles['docs-channel__card']}>
                          <DocsPagePreviewCard showActions={false} />
                        </div>
                      </StreamingAgentPost>
                    </div>
                  </div>
                )}

                {/* Approval scene: tracker (done), Alex code review, Jordan staging preview with Approve, Coder deploy */}
                {activeScene === 'approval' && activePostId === DOCS_MSG_COLLAPSIBLE_ROOT && collapsibleSettled && (
                  <>
                    <div className={styles['docs-channel__agent-message']}>
                      <div
                        className={styles['docs-channel__agent-message-avatar']}
                        role="button"
                        tabIndex={0}
                        onClick={(e) => openAgentProfileByShapeColor(MATTY.shape as AgentShape, MATTY.color as AgentColor, e)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAgentProfileByShapeColor(MATTY.shape as AgentShape, MATTY.color as AgentColor, e as unknown as React.MouseEvent<HTMLElement>); } }}
                      >
                        <AgentAvatar shape={MATTY.shape as AgentShape} color={MATTY.color as AgentColor} size="sm" eyes />
                      </div>
                      <div className={styles['docs-channel__agent-message-body']}>
                        <div className={styles['docs-channel__agent-message-meta']}>
                          <span className={styles['docs-channel__agent-message-name']}>{MATTY.name}</span>
                          <Tag label="Agent" size="x-small" />
                          <time className={styles['docs-channel__agent-message-time']}>12:05 PM</time>
                        </div>
                        <p className={styles['docs-channel__post']}>Running final checks in parallel before publish.</p>
                        <div className={styles['docs-channel__card']}>
                          <AgentParallelTrackerCard rows={TRACKER_ROWS_DONE} allDone />
                        </div>
                      </div>
                    </div>
                    <div className={styles['docs-channel__message-row']}>
                      <Message
                        avatarSrc={ALEX.avatarSrc}
                        avatarAlt={ALEX.avatarAlt}
                        username={ALEX.name}
                        timestamp="12:10 PM"
                        showMessageActions={false}
                      >
                        <p className={styles['docs-channel__post']}>Code looks good — approved the PR. The CollapsibleStep component is clean.</p>
                      </Message>
                    </div>
                    <div className={styles['docs-channel__message-row']}>
                      <Message
                        avatarSrc={JORDAN.avatarSrc}
                        avatarAlt={JORDAN.avatarAlt}
                        username={JORDAN.name}
                        timestamp="12:15 PM"
                        showMessageActions={false}
                      >
                        <p className={styles['docs-channel__post']}>Staging preview looks great. Approving.</p>
                        <div className={styles['docs-channel__card']}>
                          <DocsPagePreviewCard
                            approved={approvalThreadApproved}
                            onApprove={() => setApprovalThreadApproved(true)}
                            onReject={() => {}}
                          />
                        </div>
                      </Message>
                    </div>
                    {approvalThreadApproved && (
                      <div className={styles['docs-channel__agent-message']}>
                        <div
                          className={styles['docs-channel__agent-message-avatar']}
                          role="button"
                          tabIndex={0}
                          onClick={(e) => openAgentProfileByShapeColor(CODER.shape, CODER.color, e)}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAgentProfileByShapeColor(CODER.shape, CODER.color, e as unknown as React.MouseEvent<HTMLElement>); } }}
                        >
                          <AgentAvatar shape={CODER.shape} color={CODER.color} size="sm" eyes />
                        </div>
                        <div className={styles['docs-channel__agent-message-body']}>
                          <div className={styles['docs-channel__agent-message-meta']}>
                            <span className={styles['docs-channel__agent-message-name']}>{CODER.name}</span>
                            <Tag label="Agent" size="x-small" />
                            <time className={styles['docs-channel__agent-message-time']}>12:20 PM</time>
                          </div>
                          <StreamingAgentPost body="SSO setup page published to docs.mattermost.com. Deploy complete." />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Jordan's approval reply */}
                {delegationSettled && activePostId === DOCS_MSG_EMMA_FLAG && artifactApproved && (
                  <div className={styles['docs-channel__message-row']}>
                    <Message
                      avatarSrc={JORDAN.avatarSrc}
                      avatarAlt="Jordan Lee"
                      username="Jordan Lee"
                      timestamp="10:11 AM"
                      showMessageActions={false}
                    >
                      <p className={styles['docs-channel__post']}>Approved. Thanks, Matty.</p>
                    </Message>
                  </div>
                )}

                {/* Matty asks Coder to deploy SSO page changes to staging */}
                {delegationSettled && activePostId === DOCS_MSG_EMMA_FLAG && artifactApproved && (
                  <div className={styles['docs-channel__agent-message']}>
                    <div
                      className={styles['docs-channel__agent-message-avatar']}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => openAgentProfileByShapeColor(MATTY.shape as AgentShape, MATTY.color as AgentColor, e)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAgentProfileByShapeColor(MATTY.shape as AgentShape, MATTY.color as AgentColor, e as unknown as React.MouseEvent<HTMLElement>); } }}
                    >
                      <AgentAvatar shape={MATTY.shape as AgentShape} color={MATTY.color as AgentColor} size="sm" eyes />
                    </div>
                    <div className={styles['docs-channel__agent-message-body']}>
                      <div className={styles['docs-channel__agent-message-meta']}>
                        <span className={styles['docs-channel__agent-message-name']}>{MATTY.name}</span>
                        <Tag label="Agent" size="x-small" />
                        <time className={styles['docs-channel__agent-message-time']}>10:12 AM</time>
                      </div>
                      <StreamingAgentPost
                        body="Coder Jordan approved - can you create a PR with these text updates and deploy it to staging for a last review before publishing to production?"
                        parts={[
                          { type: 'mention', id: 'coder', label: 'Coder', avatarSrc: '', kind: 'agent' as const, agentShape: CODER.shape, agentColor: CODER.color },
                          { type: 'text', text: ' Jordan approved - can you create a PR with these text updates and deploy it to staging for a last review before publishing to production?' },
                        ]}
                        onAgentProfile={openAgentProfile}
                      />
                    </div>
                  </div>
                )}

                {/* SSO staging delegation */}
                {delegationSettled && activePostId === DOCS_MSG_EMMA_FLAG && artifactApproved && (
                  <DocsInlineDelegation
                    label="Matty sent a message to Coder"
                    fromAgent={{ id: MATTY.id, name: MATTY.name, shape: MATTY.shape as AgentShape, color: MATTY.color as AgentColor }}
                    toAgents={[{ id: CODER.id, name: CODER.name, shape: CODER.shape, color: CODER.color }]}
                    messages={MATTY_CODER_SSO_STAGING_DM_MESSAGES}
                    tasks={[
                      { id: 't1', label: 'Create PR with text updates', status: 'done', agentId: CODER.id },
                      { id: 't2', label: 'Deploy to staging', status: 'done', agentId: CODER.id },
                    ]}
                    thinkingSteps={STAGING_DEPLOY_THINKING}
                    onSettled={() => setCollapsibleSettled(true)}
                  />
                )}

                {/* Matty posts SSO staging preview */}
                {collapsibleSettled && activePostId === DOCS_MSG_EMMA_FLAG && (
                  <div className={styles['docs-channel__agent-message']}>
                    <div
                      className={styles['docs-channel__agent-message-avatar']}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => openAgentProfileByShapeColor(MATTY.shape as AgentShape, MATTY.color as AgentColor, e)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAgentProfileByShapeColor(MATTY.shape as AgentShape, MATTY.color as AgentColor, e as unknown as React.MouseEvent<HTMLElement>); } }}
                    >
                      <AgentAvatar shape={MATTY.shape as AgentShape} color={MATTY.color as AgentColor} size="sm" eyes />
                    </div>
                    <div className={styles['docs-channel__agent-message-body']}>
                      <div className={styles['docs-channel__agent-message-meta']}>
                        <span className={styles['docs-channel__agent-message-name']}>{MATTY.name}</span>
                        <Tag label="Agent" size="x-small" />
                        <time className={styles['docs-channel__agent-message-time']}>10:15 AM</time>
                      </div>
                      <StreamingAgentPost
                        body="Staging is live. Jordan — here's the updated SSO setup page for your final review."
                        parts={[
                          { type: 'text', text: 'Staging is live. ' },
                          { type: 'mention', id: 'jordan', label: 'Jordan Lee', avatarSrc: JORDAN.avatarSrc, kind: 'user' as const },
                          { type: 'text', text: ' — here\'s the updated SSO setup page for your final review.' },
                        ]}
                        onAgentProfile={openAgentProfile}
                      >
                        <div className={styles['docs-channel__card']}>
                          <DocsPagePreviewCard showActions={false} />
                        </div>
                      </StreamingAgentPost>
                    </div>
                  </div>
                )}
              </div>
            </RightSidebar>
            </div>
            {/* Artifact panel — slides over thread within the RHS wrapper */}
            {artifactRendered && (
              <div className={[
                styles['docs-channel__rhs-artifact'],
                artifactExiting ? styles['docs-channel__rhs-artifact--exiting'] : '',
              ].filter(Boolean).join(' ')}>
                <RightSidebar
                  header={
                    <AgentPlaybookRhsHeader
                      secondaryTitle={artifactTitle}
                      onClose={() => setArtifactOpen(false)}
                    />
                  }
                  footer={
                    <div className={styles['docs-channel__artifact-footer']}>
                      {artifactApproved ? (
                        <span className={styles['docs-channel__artifact-approved']}>Approved</span>
                      ) : (
                        <>
                          <Button emphasis="primary" size="medium" onClick={() => setArtifactApproved(true)}>
                            Approve
                          </Button>
                          <Button emphasis="tertiary" size="medium">
                            Request changes
                          </Button>
                        </>
                      )}
                    </div>
                  }
                >
                  <DocsArtifactRhs title={artifactTitle} approved={artifactApproved} />
                </RightSidebar>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Agent profile popover */}
      {profileTarget && (
        <AgentProfilePopover
          target={profileTarget}
          onClose={() => setProfileTarget(null)}
        />
      )}

    </div>
  );
}
