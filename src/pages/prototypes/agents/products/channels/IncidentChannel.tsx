import { Fragment, useEffect, useRef, useState } from 'react';
import { useExitAnimation } from '@/hooks/useExitAnimation';
import CheckCircleOutlineIcon from '@mattermost/compass-icons/components/check-circle-outline';
import CloseIcon from '@mattermost/compass-icons/components/close';
import { Chip } from '@mattermost/compass-ui/components/chip';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { Message } from '@mattermost/compass-proto';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import { MessageSeparator } from '@mattermost/compass-ui/components/message-separator';
import { RightSidebarHeader } from '@mattermost/compass-ui/components/right-sidebar-header';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { Spinner } from '@mattermost/compass-ui/components/spinner';
import { Tag } from '@mattermost/compass-ui/components/tag';
import { ThreadFooter } from '@mattermost/compass-ui/components/thread-footer';
import {
  ChannelHeader,
  RightSidebar,
  type RightSidebarThreadMessage,
} from '@mattermost/compass-proto';
import {
  ALEX,
  CIPHER,
  DYNAMO,
  INCIDENT_CHANNEL_MESSAGES,
  INCIDENT_OTTO_INVITE_ID,
  JORDAN,
  MATTY,
  OTTO,
  SENTINEL_DEFAULT,
  VIEWER,
  WORKSPACE_AGENTS,
  resolveSingleAgentProfile,
  type ChannelMessage,
  type WorkspaceAgent,
} from '../../agentsData';
import { useAgents } from '../../context/AgentsContext';
import AgentApprovalCard from '../../components/AgentApprovalCard';
import GitHubPrCard from '../../components/GitHubPrCard';
import AgentInviteCard from '../../components/AgentInviteCard';
import AgentArtifactCard from '../../components/AgentArtifactCard';
import AgentAvatar from '../../components/AgentAvatar';
import { AgentPlaybookRhsHeader } from '../../components/AgentPlaybookPreview';
import AgentProfilePopover, {
  profileAnchorFromEvent,
  type AgentProfileAnchor,
} from '../../components/AgentProfilePopover';
import { agentAvatarChipSrc } from '../../components/agentAvatarShapes';
import AgentTypingDots from '../../components/AgentTypingDots';
import { CodeSnippet } from '../../components/CodeSnippet';
import JiraCard from '../../components/JiraCard';
import ChannelIntro from './ChannelIntro';
import MarkdownArtifactRhs from './MarkdownArtifactRhs';
import MentionMessageInput from '../../components/MentionMessageInput';
import mentionStyles from '../../components/MentionMessageInput.module.scss';
import PlaybookRunRhs from '../../components/PlaybookRunRhs';
import ChannelsProductSidebar from './ChannelsProductSidebar';
import styles from './IncidentChannel.module.scss';

// Cipher reply sequence phases — only active when inc-sentinel-1 thread is open
type CipherPhase = 'idle' | 'typing' | 'ack' | 'thinking' | 'result' | 'done' | 'follow-up';

// Otto reply sequence phases — only active when inc-matty-otto-invite thread is open
type OttoPhase = 'idle' | 'typing' | 'ack' | 'done';

// Otto work phases — active when the Dynamo approval thread is open after Priya approves
type OttoWorkPhase = 'idle' | 'typing' | 'ack' | 'thinking' | 'result' | 'done';

// Dynamo work phases — follows Otto in the same thread; two thinking cycles
type DynamoWorkPhase = 'idle' | 'typing' | 'ack' | 'thinking1' | 'finding' | 'thinking2' | 'result' | 'done';

// Jordan/Otto deploy phases — active when the convergence Jordan thread is open after Priya replies
type JordanOttoPhase = 'idle' | 'typing' | 'ack' | 'thinking' | 'result' | 'done' | 'sentinel-reply';


const SENTINEL_POST_ID = 'inc-sentinel-1';
const MATTY_DYNAMO_APPROVAL_POST_ID = 'inc-matty-dynamo-approval';
const MATTY_ROLLBACK_POST_ID = 'inc-matty-rollback';
const CONVERGENCE_JORDAN_POST_ID = 'inc-jordan-convergence';

const CIPHER_ACK_TEXT = "On it — I'll dig into the error traces now.";
const CIPHER_RESULT_TEXT =
  'Analyzed 847 error traces from build 8842. Root cause: the new webhook retry handler drops the Authorization header on redirect. The 5% error spike is pure auth failures — downstream payment gateway is rejecting unsigned requests. Fix: restore header propagation in WebhookClient.sendWithRetry. P1 — every retry is a failed transaction. See the full report for details.';
const CIPHER_STATUS_LABELS = ['Thinking…', 'Connecting to tools…', 'Analyzing logs…'] as const;
const CIPHER_STATUS_MS = 1100;
const CIPHER_FOLLOW_UP_DELAY_MS = 900;
const STREAM_MS_PER_WORD = 32;

const OTTO_WORK_ACK_TEXT = "On it — checking deployment options now.";
const OTTO_WORK_RESULT_TEXT =
  "Rollback to build 8841 staged and ready. Can execute in under 2 minutes — holding until Dynamo's fix lands or you call it.";
const OTTO_WORK_STATUS_LABELS = [
  'Checking rollback target…',
  'Verifying build 8841 artifact…',
  'Staging rollback pipeline…',
] as const;
const OTTO_WORK_STATUS_MS = 1100;

const DYNAMO_WORK_ACK_TEXT = "On it — scanning the codebase now.";
const DYNAMO_WORK_FINDING_TEXT =
  "Authorization header dropped on redirect inside `WebhookClient.sendWithRetry` — introduced in build 8842. Fix is a one-liner: propagate the header through the retry chain.";
const DYNAMO_WORK_FINDING_CODE = [
  'async sendWithRetry(url, payload, opts = {}) {',
  '  const { headers, retries } = opts;',
  '  const res = await this.post(url, payload, { headers });',
  '  if (res.isRedirect()) {',
  '    return this.post(res.location, payload);  // headers not forwarded',
  '  }',
  '  return res;',
  '}',
];
const DYNAMO_WORK_RESULT_TEXT =
  "Propagated the header through the retry chain and opened a PR. Alex Rivera is assigned for review.";
const DYNAMO_WORK_STATUS_LABELS_1 = [
  'Searching repository…',
  'Reading PayForge webhook handler…',
  'Isolating build 8842 diff…',
] as const;
const DYNAMO_WORK_STATUS_LABELS_2 = [
  'Checking out fix branch from main…',
  'Applying header propagation fix…',
  'Running test suite…',
  'Opening pull request on GitHub…',
] as const;
const DYNAMO_WORK_STATUS_MS = 950;
const DYNAMO_WORK_START_DELAY_MS = 1200;

const JORDAN_OTTO_DEPLOY_ACK_TEXT = "On it — deploying the fix now.";
const JORDAN_OTTO_DEPLOY_RESULT_TEXT = "Fix is live. Error rate is dropping — we're clear.";
const JORDAN_OTTO_DEPLOY_STATUS_LABELS = [
  'Verifying fix branch...',
  'Deploying to production...',
  'Monitoring PayForge error rate...',
] as const;
const JORDAN_OTTO_DEPLOY_STATUS_MS = 1100;
const JORDAN_OTTO_SHIP_REPLY_DELAY_MS = 2000;
const JORDAN_OTTO_TYPING_DELAY_MS = 1200;
const JORDAN_OTTO_SENTINEL_REPLY_DELAY_MS = 1000;
const SENTINEL_REPLY_TEXT = "Error rates are dropping — we're clear.";


const OTTO_WORK_ACK_JOINED = OTTO_WORK_ACK_TEXT.trim().split(/\s+/).filter(Boolean).join(' ');
const OTTO_WORK_RESULT_JOINED = OTTO_WORK_RESULT_TEXT.trim().split(/\s+/).filter(Boolean).join(' ');
const DYNAMO_WORK_ACK_JOINED = DYNAMO_WORK_ACK_TEXT.trim().split(/\s+/).filter(Boolean).join(' ');
const DYNAMO_WORK_FINDING_JOINED = DYNAMO_WORK_FINDING_TEXT.trim().split(/\s+/).filter(Boolean).join(' ');
const DYNAMO_WORK_RESULT_JOINED = DYNAMO_WORK_RESULT_TEXT.trim().split(/\s+/).filter(Boolean).join(' ');
const JORDAN_OTTO_DEPLOY_ACK_JOINED = JORDAN_OTTO_DEPLOY_ACK_TEXT.trim().split(/\s+/).filter(Boolean).join(' ');
const JORDAN_OTTO_DEPLOY_RESULT_JOINED = JORDAN_OTTO_DEPLOY_RESULT_TEXT.trim().split(/\s+/).filter(Boolean).join(' ');

/** Duration the thread / artifact panel open/close animation plays. */
const PANEL_EXIT_MS = 300;
/** Duration typing dots show before ack starts streaming. */
const TYPING_DURATION_MS = 1000;

const CIPHER_ACK_JOINED = CIPHER_ACK_TEXT.trim().split(/\s+/).filter(Boolean).join(' ');
const CIPHER_RESULT_JOINED = CIPHER_RESULT_TEXT.trim().split(/\s+/).filter(Boolean).join(' ');

// Reply messages for the Matty thread — root post comes from INCIDENT_CHANNEL_MESSAGES
const MATTY_THREAD_REPLIES: RightSidebarThreadMessage[] = [
  {
    avatarSrc: JORDAN.avatarSrc,
    avatarAlt: JORDAN.avatarAlt,
    username: JORDAN.name,
    timestamp: '2:15 PM',
    body: "On it — I'll take point on the Deployment checklist once Diagnosis is done. Looping in Emma from on-call just in case.",
  },
];

const CIPHER_AVATAR_SRC = agentAvatarChipSrc(CIPHER.shape, CIPHER.color);

const OTTO_ACK_TEXT =
  "Standing by for rollback — if the diagnosis confirms a build regression, I can roll back 8842 in under 2 minutes.";
const OTTO_ACK_JOINED = OTTO_ACK_TEXT.trim().split(/\s+/).filter(Boolean).join(' ');
const OTTO_AVATAR_SRC = agentAvatarChipSrc(OTTO.shape, OTTO.color);
const DYNAMO_AVATAR_SRC = agentAvatarChipSrc(DYNAMO.shape, DYNAMO.color);
const SENTINEL_AVATAR_SRC = agentAvatarChipSrc(SENTINEL_DEFAULT.shape, SENTINEL_DEFAULT.color);

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

const SYSTEM_CHIP_CLASS = [
  mentionStyles['mention-input__mention-chip'],
  mentionStyles['mention-input__post-chip'],
  mentionStyles['mention-input__post-chip--system'],
].join(' ');

function AgentAddedMsg({
  agentSrc,
  agentName,
  byName,
  bySrc,
  byAgentShape,
  byAgentColor,
}: {
  agentSrc: string;
  agentName: string;
  byName: string;
  bySrc?: string;
  byAgentShape?: string;
  byAgentColor?: string;
}) {
  return (
    <div className={styles['incident-channel__system']}>
      <p>
        <Chip size="small" leadingAvatar={{ src: agentSrc, alt: agentName }} className={SYSTEM_CHIP_CLASS}>
          {agentName}
        </Chip>
        {' was added to the channel by '}
        <Chip
          size="small"
          leadingAvatar={{ src: bySrc ?? '', alt: byName }}
          className={SYSTEM_CHIP_CLASS}
        >
          {byName}
        </Chip>
      </p>
    </div>
  );
}

function AgentPost({
  message,
  onAgentClick,
  onOpenThread,
  showThreadReplies = false,
  inviteCardNode,
}: {
  message: ChannelMessage;
  onAgentClick: OnAgentClick;
  onOpenThread: () => void;
  showThreadReplies?: boolean;
  inviteCardNode?: React.ReactNode;
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
          {message.threadReplies?.resolved && showThreadReplies && (
            <Tag label="Resolved" type="success" size="x-small" />
          )}
          <time className={styles['incident-channel__agent-message-time']}>
            {message.timestamp}
          </time>
        </div>
        {renderParts(message, onAgentClick)}
        {message.jiraCard ? <JiraCard card={message.jiraCard} /> : null}
        {inviteCardNode ?? null}
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
  const { customAgents } = useAgents();
  const mattyProfile = resolveSingleAgentProfile(MATTY.id, customAgents);

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
  const threadBottomRef = useRef<HTMLDivElement>(null);

  // Keep the channel viewport pinned to the bottom so the latest message is always visible.
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
  const [ottoInviteAccepted, setOttoInviteAccepted] = useState(false);
  const [ottoInviteDismissed, setOttoInviteDismissed] = useState(false);
  const [ottoPhase, setOttoPhase] = useState<OttoPhase>('idle');
  const [ottoHasReplied, setOttoHasReplied] = useState(false);
  const [cipherPhase, setCipherPhase] = useState<CipherPhase>('idle');
  const [cipherStatusIndex, setCipherStatusIndex] = useState(0);
  /** Sticky flag — stays true once Cipher starts replying. Controls center-channel ThreadFooter. */
  const [cipherHasReplied, setCipherHasReplied] = useState(false);
  /** Sticky flag — stays true once Cipher posts the follow-up. Controls playbook task checkboxes. */
  const [cipherReportPosted, setCipherReportPosted] = useState(false);
  const [mattyApprovalVisible, setMattyApprovalVisible] = useState(false);
  const [mattyRollbackVisible, setMattyRollbackVisible] = useState(false);
  const [dynamoApprovalAccepted, setDynamoApprovalAccepted] = useState(false);
  const [dynamoApprovalDismissed, setDynamoApprovalDismissed] = useState(false);
  const [ottoWorkPhase, setOttoWorkPhase] = useState<OttoWorkPhase>('idle');
  const [ottoWorkStatusIndex, setOttoWorkStatusIndex] = useState(0);
  const [ottoWorkHasReplied, setOttoWorkHasReplied] = useState(false);
  const [dynamoWorkPhase, setDynamoWorkPhase] = useState<DynamoWorkPhase>('idle');
  const [dynamoWorkStatusIndex, setDynamoWorkStatusIndex] = useState(0);
  const [dynamoWorkHasReplied, setDynamoWorkHasReplied] = useState(false);
  const [convergenceDynamoVisible, setConvergenceDynamoVisible] = useState(false);
  const [convergenceOttoVisible, setConvergenceOttoVisible] = useState(false);
  const [priyaSynthesisVisible, setPriyaSynthesisVisible] = useState(false);
  const [prMerged, setPrMerged] = useState(false);
  const [jordanShipReplyVisible, setJordanShipReplyVisible] = useState(false);
  const [jordanOttoPhase, setJordanOttoPhase] = useState<JordanOttoPhase>('idle');
  const [jordanOttoStatusIndex, setJordanOttoStatusIndex] = useState(0);

  // Scroll the thread RHS to bottom when new messages appear.
  useEffect(() => {
    const el = threadBottomRef.current;
    if (!el) return;
    const viewport = el.closest('.simplebar-content-wrapper') as HTMLElement | null;
    if (viewport) viewport.scrollTop = viewport.scrollHeight;
  }, [cipherPhase, ottoPhase, ottoWorkPhase, dynamoWorkPhase, jordanOttoPhase]);

  const streamedAck = useStreamedText(CIPHER_ACK_TEXT, cipherPhase === 'ack');
  const streamedResult = useStreamedText(CIPHER_RESULT_TEXT, cipherPhase === 'result');
  const streamedOttoAck = useStreamedText(OTTO_ACK_TEXT, ottoPhase === 'ack');
  const streamedOttoWorkAck = useStreamedText(OTTO_WORK_ACK_TEXT, ottoWorkPhase === 'ack');
  const streamedOttoWorkResult = useStreamedText(OTTO_WORK_RESULT_TEXT, ottoWorkPhase === 'result');
  const streamedDynamoWorkAck = useStreamedText(DYNAMO_WORK_ACK_TEXT, dynamoWorkPhase === 'ack');
  const streamedDynamoWorkFinding = useStreamedText(DYNAMO_WORK_FINDING_TEXT, dynamoWorkPhase === 'finding');
  const streamedDynamoWorkResult = useStreamedText(DYNAMO_WORK_RESULT_TEXT, dynamoWorkPhase === 'result');
  const streamedJordanOttoAck = useStreamedText(JORDAN_OTTO_DEPLOY_ACK_TEXT, jordanOttoPhase === 'ack');
  const streamedJordanOttoResult = useStreamedText(JORDAN_OTTO_DEPLOY_RESULT_TEXT, jordanOttoPhase === 'result');

  const ottoWorkAckComplete = ottoWorkPhase !== 'ack' || streamedOttoWorkAck === OTTO_WORK_ACK_JOINED;
  const ottoWorkResultComplete = ottoWorkPhase !== 'result' || streamedOttoWorkResult === OTTO_WORK_RESULT_JOINED;
  const dynamoWorkAckComplete = dynamoWorkPhase !== 'ack' || streamedDynamoWorkAck === DYNAMO_WORK_ACK_JOINED;
  const dynamoWorkFindingComplete = dynamoWorkPhase !== 'finding' || streamedDynamoWorkFinding === DYNAMO_WORK_FINDING_JOINED;
  const dynamoWorkResultComplete = dynamoWorkPhase !== 'result' || streamedDynamoWorkResult === DYNAMO_WORK_RESULT_JOINED;
  const jordanOttoAckComplete = jordanOttoPhase !== 'ack' || streamedJordanOttoAck === JORDAN_OTTO_DEPLOY_ACK_JOINED;
  const jordanOttoResultComplete = jordanOttoPhase !== 'result' || streamedJordanOttoResult === JORDAN_OTTO_DEPLOY_RESULT_JOINED;

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

  // done → follow-up (short pause, then Cipher posts the Jira follow-up)
  useEffect(() => {
    if (cipherPhase !== 'done') return;
    const id = window.setTimeout(() => {
      setCipherPhase('follow-up');
      setCipherReportPosted(true);
    }, CIPHER_FOLLOW_UP_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [cipherPhase]);

  // Otto work animation — fires when the rollback thread is opened (mirrors Cipher/Otto-invite pattern)
  useEffect(() => {
    if (activePostId !== MATTY_ROLLBACK_POST_ID) {
      setOttoWorkPhase('idle');
      return;
    }
    setOttoWorkPhase('idle');
    const typingId = window.setTimeout(() => setOttoWorkPhase('typing'), PANEL_EXIT_MS);
    const ackId = window.setTimeout(() => {
      setOttoWorkPhase('ack');
      setOttoWorkHasReplied(true);
    }, PANEL_EXIT_MS + TYPING_DURATION_MS);
    return () => {
      window.clearTimeout(typingId);
      window.clearTimeout(ackId);
    };
  }, [activePostId]);

  // ack → thinking
  useEffect(() => {
    if (ottoWorkPhase === 'ack' && ottoWorkAckComplete) {
      setOttoWorkPhase('thinking');
      setOttoWorkStatusIndex(0);
    }
  }, [ottoWorkPhase, ottoWorkAckComplete]);

  // thinking: cycle status labels then → result
  useEffect(() => {
    if (ottoWorkPhase !== 'thinking') return;
    const id = window.setTimeout(() => {
      if (ottoWorkStatusIndex < OTTO_WORK_STATUS_LABELS.length - 1) {
        setOttoWorkStatusIndex((i) => i + 1);
      } else {
        setOttoWorkPhase('result');
      }
    }, OTTO_WORK_STATUS_MS);
    return () => window.clearTimeout(id);
  }, [ottoWorkPhase, ottoWorkStatusIndex]);

  // result → done
  useEffect(() => {
    if (ottoWorkPhase === 'result' && ottoWorkResultComplete) {
      setOttoWorkPhase('done');
    }
  }, [ottoWorkPhase, ottoWorkResultComplete]);

  // Dynamo work animation — fires when Priya approves, opens the coding thread
  useEffect(() => {
    if (!dynamoApprovalAccepted) return;
    setActivePostId(MATTY_DYNAMO_APPROVAL_POST_ID);
    setDynamoWorkPhase('idle');
    const typingId = window.setTimeout(() => setDynamoWorkPhase('typing'), PANEL_EXIT_MS);
    const ackId = window.setTimeout(() => {
      setDynamoWorkPhase('ack');
      setDynamoWorkHasReplied(true);
    }, PANEL_EXIT_MS + TYPING_DURATION_MS);
    return () => {
      window.clearTimeout(typingId);
      window.clearTimeout(ackId);
    };
  }, [dynamoApprovalAccepted]);

  // ack → thinking1
  useEffect(() => {
    if (dynamoWorkPhase === 'ack' && dynamoWorkAckComplete) {
      setDynamoWorkPhase('thinking1');
      setDynamoWorkStatusIndex(0);
    }
  }, [dynamoWorkPhase, dynamoWorkAckComplete]);

  // thinking1: cycle LABELS_1 → finding
  useEffect(() => {
    if (dynamoWorkPhase !== 'thinking1') return;
    const id = window.setTimeout(() => {
      if (dynamoWorkStatusIndex < DYNAMO_WORK_STATUS_LABELS_1.length - 1) {
        setDynamoWorkStatusIndex((i) => i + 1);
      } else {
        setDynamoWorkPhase('finding');
      }
    }, DYNAMO_WORK_STATUS_MS);
    return () => window.clearTimeout(id);
  }, [dynamoWorkPhase, dynamoWorkStatusIndex]);

  // finding → thinking2 (after finding text finishes streaming)
  useEffect(() => {
    if (dynamoWorkPhase === 'finding' && dynamoWorkFindingComplete) {
      setDynamoWorkPhase('thinking2');
      setDynamoWorkStatusIndex(0);
    }
  }, [dynamoWorkPhase, dynamoWorkFindingComplete]);

  // thinking2: cycle LABELS_2 → result
  useEffect(() => {
    if (dynamoWorkPhase !== 'thinking2') return;
    const id = window.setTimeout(() => {
      if (dynamoWorkStatusIndex < DYNAMO_WORK_STATUS_LABELS_2.length - 1) {
        setDynamoWorkStatusIndex((i) => i + 1);
      } else {
        setDynamoWorkPhase('result');
      }
    }, DYNAMO_WORK_STATUS_MS);
    return () => window.clearTimeout(id);
  }, [dynamoWorkPhase, dynamoWorkStatusIndex]);

  // result → done
  useEffect(() => {
    if (dynamoWorkPhase === 'result' && dynamoWorkResultComplete) {
      setDynamoWorkPhase('done');
    }
  }, [dynamoWorkPhase, dynamoWorkResultComplete]);

  // Both Matty posts appear after Cipher's follow-up lands — approval first, rollback shortly after
  useEffect(() => {
    if (!cipherReportPosted) return;
    const approvalId = window.setTimeout(() => setMattyApprovalVisible(true), 1400);
    const rollbackId = window.setTimeout(() => setMattyRollbackVisible(true), 2200);
    return () => {
      window.clearTimeout(approvalId);
      window.clearTimeout(rollbackId);
    };
  }, [cipherReportPosted]);

  // Convergence: Dynamo's "fix ready" post appears shortly after the coding thread finishes
  useEffect(() => {
    if (dynamoWorkPhase !== 'done') return;
    const id = window.setTimeout(() => setConvergenceDynamoVisible(true), 1200);
    return () => window.clearTimeout(id);
  }, [dynamoWorkPhase]);

  // Convergence: Jordan's "rollback on standby" post appears shortly after the rollback thread finishes
  useEffect(() => {
    if (ottoWorkPhase !== 'done') return;
    const id = window.setTimeout(() => setConvergenceOttoVisible(true), 1200);
    return () => window.clearTimeout(id);
  }, [ottoWorkPhase]);

  // Priya's reply to Jordan appears shortly after Jordan's post is visible
  useEffect(() => {
    if (!convergenceOttoVisible) return;
    const id = window.setTimeout(() => setPriyaSynthesisVisible(true), 1400);
    return () => window.clearTimeout(id);
  }, [convergenceOttoVisible]);

  // PR flips to merged ~2s after Alex's reply lands
  useEffect(() => {
    if (!convergenceDynamoVisible) return;
    const id = window.setTimeout(() => setPrMerged(true), 2000);
    return () => window.clearTimeout(id);
  }, [convergenceDynamoVisible]);

  // Jordan's "ship it" reply appears shortly after Priya's synthesis
  useEffect(() => {
    if (!priyaSynthesisVisible) return;
    const id = window.setTimeout(() => setJordanShipReplyVisible(true), JORDAN_OTTO_SHIP_REPLY_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [priyaSynthesisVisible]);

  // Otto starts the deploy sequence after Jordan's ship reply lands
  useEffect(() => {
    if (!jordanShipReplyVisible) return;
    setJordanOttoPhase('idle');
    const typingId = window.setTimeout(() => setJordanOttoPhase('typing'), JORDAN_OTTO_TYPING_DELAY_MS);
    const ackId = window.setTimeout(() => setJordanOttoPhase('ack'), JORDAN_OTTO_TYPING_DELAY_MS + TYPING_DURATION_MS);
    return () => {
      window.clearTimeout(typingId);
      window.clearTimeout(ackId);
    };
  }, [jordanShipReplyVisible]);

  // ack → thinking
  useEffect(() => {
    if (jordanOttoPhase === 'ack' && jordanOttoAckComplete) {
      setJordanOttoPhase('thinking');
      setJordanOttoStatusIndex(0);
    }
  }, [jordanOttoPhase, jordanOttoAckComplete]);

  // thinking: cycle status labels → result
  useEffect(() => {
    if (jordanOttoPhase !== 'thinking') return;
    const id = window.setTimeout(() => {
      if (jordanOttoStatusIndex < JORDAN_OTTO_DEPLOY_STATUS_LABELS.length - 1) {
        setJordanOttoStatusIndex((i) => i + 1);
      } else {
        setJordanOttoPhase('result');
      }
    }, JORDAN_OTTO_DEPLOY_STATUS_MS);
    return () => window.clearTimeout(id);
  }, [jordanOttoPhase, jordanOttoStatusIndex]);

  // result → done
  useEffect(() => {
    if (jordanOttoPhase === 'result' && jordanOttoResultComplete) {
      setJordanOttoPhase('done');
    }
  }, [jordanOttoPhase, jordanOttoResultComplete]);

  // done → sentinel-reply (Sentinel monitors and confirms)
  useEffect(() => {
    if (jordanOttoPhase !== 'done') return;
    const id = window.setTimeout(() => setJordanOttoPhase('sentinel-reply'), JORDAN_OTTO_SENTINEL_REPLY_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [jordanOttoPhase]);

  // Otto animation — fires when the invite is accepted
  useEffect(() => {
    if (!ottoInviteAccepted) return;
    setActivePostId(INCIDENT_OTTO_INVITE_ID);
    setOttoPhase('idle');
    const typingId = window.setTimeout(() => {
      setOttoPhase('typing');
    }, PANEL_EXIT_MS);
    const ackId = window.setTimeout(() => {
      setOttoPhase('ack');
      setOttoHasReplied(true);
    }, PANEL_EXIT_MS + TYPING_DURATION_MS);
    return () => {
      window.clearTimeout(typingId);
      window.clearTimeout(ackId);
    };
  }, [ottoInviteAccepted]);

  // ack → done
  useEffect(() => {
    if (ottoPhase === 'ack' && streamedOttoAck === OTTO_ACK_JOINED) {
      setOttoPhase('done');
    }
  }, [ottoPhase, streamedOttoAck]);

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
  // Root post is looked up from the channel so the same AgentPost component renders it.
  // The approval post is dynamic (not in INCIDENT_CHANNEL_MESSAGES) so we compute it here.
  const mattyApprovalMessage: ChannelMessage = {
    id: MATTY_DYNAMO_APPROVAL_POST_ID,
    kind: 'agent',
    username: mattyProfile.name,
    avatarSrc: '',
    avatarAlt: mattyProfile.name,
    timestamp: '2:20 PM',
    body: '',
    parts: [
      { type: 'mention', id: 'priya', label: VIEWER.name, avatarSrc: VIEWER.avatarSrc, kind: 'person' },
      { type: 'text', text: " — Cipher's analysis confirms the root cause is in the PayForge webhook handler. Ready to bring in " },
      { type: 'mention', id: DYNAMO.id, label: DYNAMO.name, avatarSrc: '', kind: 'agent', agentShape: DYNAMO.shape, agentColor: DYNAMO.color },
      { type: 'text', text: ' to work through the fix with ' },
      { type: 'mention', id: 'alex', label: ALEX.name, avatarSrc: ALEX.avatarSrc, kind: 'person' },
      { type: 'text', text: '. Approve to proceed?' },
    ],
    agentShape: mattyProfile.shape,
    agentColor: mattyProfile.color,
    threadReplies: dynamoWorkHasReplied
      ? {
          count:
            convergenceDynamoVisible ? 5 :
            dynamoWorkPhase === 'done' ? 4 :
            dynamoWorkPhase === 'finding' || dynamoWorkPhase === 'thinking2' ? 2 : 1,
          lastReplyTime: convergenceDynamoVisible ? '2:26 PM' : dynamoWorkPhase === 'done' ? '2:25 PM' : '2:23 PM',
          resolved: convergenceDynamoVisible,
          resolvedBy: ALEX.name,
          participants: [
            { key: DYNAMO.id, name: DYNAMO.name, agentShape: DYNAMO.shape, agentColor: DYNAMO.color },
            ...(convergenceDynamoVisible ? [{ key: 'alex', name: ALEX.name, avatarSrc: ALEX.avatarSrc }] : []),
          ],
        }
      : undefined,
  };

  const mattyRollbackMessage: ChannelMessage = {
    id: MATTY_ROLLBACK_POST_ID,
    kind: 'agent',
    username: mattyProfile.name,
    avatarSrc: '',
    avatarAlt: mattyProfile.name,
    timestamp: '2:21 PM',
    body: '',
    parts: [
      { type: 'mention', id: 'jordan', label: JORDAN.name, avatarSrc: JORDAN.avatarSrc, kind: 'person' },
      { type: 'text', text: ' — while the code fix is in progress, let\'s have Otto stage a rollback to build 8841 as a safety net. Assigning the Deployment tasks now.' },
    ],
    agentShape: mattyProfile.shape,
    agentColor: mattyProfile.color,
    threadReplies: ottoWorkHasReplied
      ? {
          count: ottoWorkPhase === 'result' || ottoWorkPhase === 'done' ? 3 : 2,
          lastReplyTime: ottoWorkPhase === 'done' ? '2:23 PM' : '2:22 PM',
          resolved: ottoWorkPhase === 'done',
          resolvedBy: ottoWorkPhase === 'done' ? mattyProfile.name : undefined,
          participants: [
            { key: 'jordan', name: JORDAN.name, avatarSrc: JORDAN.avatarSrc },
            { key: OTTO.id, name: OTTO.name, agentShape: OTTO.shape, agentColor: OTTO.color },
          ],
        }
      : undefined,
  };

  const jordanThreadResolved = jordanOttoPhase === 'done' || jordanOttoPhase === 'sentinel-reply';
  const jordanOttoReplyCount = jordanOttoPhase === 'result' || jordanOttoPhase === 'done' || jordanOttoPhase === 'sentinel-reply' ? 2 : jordanOttoPhase !== 'idle' ? 1 : 0;
  const sentinelReplyCount = jordanOttoPhase === 'sentinel-reply' ? 1 : 0;
  const convergenceJordanMessage: ChannelMessage = {
    id: CONVERGENCE_JORDAN_POST_ID,
    kind: 'user',
    username: JORDAN.name,
    avatarSrc: JORDAN.avatarSrc,
    avatarAlt: JORDAN.avatarAlt,
    timestamp: '2:27 PM',
    body: "Rollback to 8841 is staged — Otto can execute in under 2 minutes if needed. Standing by.",
    threadReplies: priyaSynthesisVisible
      ? {
          count: 1 + (jordanShipReplyVisible ? 1 : 0) + jordanOttoReplyCount + sentinelReplyCount,
          lastReplyTime: jordanOttoPhase === 'sentinel-reply' ? '2:32 PM' : jordanOttoPhase === 'done' ? '2:31 PM' : jordanShipReplyVisible ? '2:29 PM' : '2:28 PM',
          resolved: jordanThreadResolved,
          resolvedBy: JORDAN.name,
          participants: [
            { key: 'priya', name: VIEWER.name, avatarSrc: VIEWER.avatarSrc },
            ...(jordanShipReplyVisible ? [{ key: 'jordan', name: JORDAN.name, avatarSrc: JORDAN.avatarSrc }] : []),
            ...(jordanOttoPhase !== 'idle' ? [{ key: OTTO.id, name: OTTO.name, agentShape: OTTO.shape, agentColor: OTTO.color }] : []),
            ...(jordanOttoPhase === 'sentinel-reply' ? [{ key: 'sentinel', name: SENTINEL_DEFAULT.name, agentShape: SENTINEL_DEFAULT.shape, agentColor: SENTINEL_DEFAULT.color }] : []),
          ],
        }
      : undefined,
  };

  const rootMessage =
    activePostId === MATTY_DYNAMO_APPROVAL_POST_ID
      ? mattyApprovalMessage
      : activePostId === MATTY_ROLLBACK_POST_ID
        ? mattyRollbackMessage
        : activePostId === CONVERGENCE_JORDAN_POST_ID
          ? convergenceJordanMessage
          : INCIDENT_CHANNEL_MESSAGES.find((m) => m.id === activePostId) ?? null;

  const sentinelThreadResolved = cipherPhase === 'done' || cipherPhase === 'follow-up';
  const activeThreadResolved =
    (activePostId === SENTINEL_POST_ID && sentinelThreadResolved) ||
    (rootMessage?.threadReplies?.resolved ?? false);
  const activeThreadResolvedBy =
    activePostId === SENTINEL_POST_ID
      ? mattyProfile.name
      : rootMessage?.threadReplies?.resolvedBy;
  const activeThreadResolvedSrc =
    activeThreadResolvedBy === mattyProfile.name
      ? agentAvatarChipSrc(mattyProfile.shape, mattyProfile.color)
      : activeThreadResolvedBy === JORDAN.name
        ? JORDAN.avatarSrc
        : activeThreadResolvedBy === ALEX.name
          ? ALEX.avatarSrc
          : VIEWER.avatarSrc;

  type ThreadMessage = RightSidebarThreadMessage & { agentShape?: string; agentColor?: string };

  function AgentThreadMessage({ message }: { message: ThreadMessage }) {
    const agent = message.agentShape && message.agentColor
      ? WORKSPACE_AGENTS.find((a) => a.shape === message.agentShape && a.color === message.agentColor) ?? null
      : null;
    return (
      <article className={styles['incident-channel__agent-message']}>
        <div
          className={styles['incident-channel__agent-message-avatar']}
          role={agent ? 'button' : undefined}
          tabIndex={agent ? 0 : undefined}
          style={{ cursor: agent ? 'pointer' : undefined }}
          onClick={(e) => { if (agent) openAgentProfile(agent, e); }}
          onKeyDown={(e) => {
            if (agent && (e.key === 'Enter' || e.key === ' ')) {
              openAgentProfile(agent, e as unknown as React.MouseEvent<HTMLElement>);
            }
          }}
        >
          <AgentAvatar
            shape={(message.agentShape as any) ?? 'sphere'}
            color={(message.agentColor as any) ?? 'blue'}
            size="sm"
            eyes
            shadow={false}
          />
        </div>
        <div className={styles['incident-channel__agent-message-body']}>
          <div className={styles['incident-channel__agent-message-meta']}>
            <span className={styles['incident-channel__agent-message-name']}>{message.username}</span>
            <Tag label="Agent" size="x-small" />
            <time className={styles['incident-channel__agent-message-time']}>{message.timestamp}</time>
          </div>
          <p className={styles['incident-channel__post']}>{message.body}</p>
        </div>
      </article>
    );
  }

  const cipherBase: Omit<ThreadMessage, 'body'> = {
    avatarSrc: CIPHER_AVATAR_SRC,
    avatarAlt: CIPHER.name,
    username: CIPHER.name,
    timestamp: '2:17 PM',
    agentShape: CIPHER.shape,
    agentColor: CIPHER.color,
  };

  let threadMessages: ThreadMessage[] = [];
  let replySeparatorLabel = '';
  let showTypingRow = false;
  let typingLabel = '';

  if (activePostId === MATTY_ROLLBACK_POST_ID) {
    // Static Jordan opener
    threadMessages.push({
      avatarSrc: JORDAN.avatarSrc,
      avatarAlt: JORDAN.name,
      username: JORDAN.name,
      timestamp: '2:22 PM',
      body: (
        <p className={styles['incident-channel__post']}>
          <span>{'On it — confirming rollback readiness with '}</span>
          <Chip
            size="medium-compact"
            leadingAvatar={{ src: OTTO_AVATAR_SRC, alt: OTTO.name }}
            className={[
              mentionStyles['mention-input__mention-chip'],
              mentionStyles['mention-input__post-chip'],
              mentionStyles['mention-input__mention-chip--agent'],
            ].join(' ')}
            onClick={(e) => {
              e.stopPropagation();
              const agent = agentById(OTTO.id);
              if (agent) openAgentProfile(agent, e as React.MouseEvent<HTMLElement>);
            }}
          >
            {OTTO.name}
          </Chip>
          <span>{' now.'}</span>
        </p>
      ),
    });

    const ottoWorkBase: Omit<ThreadMessage, 'body'> = {
      avatarSrc: OTTO_AVATAR_SRC,
      avatarAlt: OTTO.name,
      username: OTTO.name,
      timestamp: '2:22 PM',
      agentShape: OTTO.shape,
      agentColor: OTTO.color,
    };
    if (ottoWorkPhase === 'typing') {
      showTypingRow = true;
      typingLabel = 'Otto is typing';
    } else if (ottoWorkPhase === 'ack') {
      threadMessages.push({ ...ottoWorkBase, body: streamedOttoWorkAck });
    } else if (ottoWorkPhase === 'thinking') {
      threadMessages.push({
        ...ottoWorkBase,
        body: (
          <>
            {OTTO_WORK_ACK_TEXT}
            <div
              className={styles['incident-channel__thread-status']}
              role="status"
              aria-live="polite"
            >
              <Spinner size={12} aria-label={OTTO_WORK_STATUS_LABELS[ottoWorkStatusIndex]} />
              <span className={styles['incident-channel__thread-status-label']}>
                {OTTO_WORK_STATUS_LABELS[ottoWorkStatusIndex]}
              </span>
            </div>
          </>
        ),
      });
    } else if (ottoWorkPhase === 'result' || ottoWorkPhase === 'done') {
      threadMessages.push({
        ...ottoWorkBase,
        body: (
          <>
            {OTTO_WORK_ACK_TEXT}
            <div
              className={[
                styles['incident-channel__thread-status'],
                styles['incident-channel__thread-status--done'],
              ].join(' ')}
            >
              <Icon glyph={<CheckCircleOutlineIcon />} size="12" />
              <span className={styles['incident-channel__thread-status-label']}>
                Rollback pipeline staged
              </span>
            </div>
          </>
        ),
      });
      threadMessages.push({
        ...ottoWorkBase,
        timestamp: '2:23 PM',
        body: ottoWorkPhase === 'done'
          ? <p className={styles['incident-channel__thread-result-text']}>{OTTO_WORK_RESULT_TEXT}</p>
          : streamedOttoWorkResult,
      });
    }

    const ottoReplyCount = ottoWorkPhase === 'result' || ottoWorkPhase === 'done' ? 2 : ottoWorkPhase !== 'idle' ? 1 : 0;
    const totalReplies = 1 + ottoReplyCount; // Jordan's static message + Otto's
    replySeparatorLabel = `${totalReplies} ${totalReplies === 1 ? 'Reply' : 'Replies'}`;
  } else if (activePostId === MATTY_DYNAMO_APPROVAL_POST_ID) {
    // Dynamo messages only — no Otto in this thread
    const dynamoWorkBase: Omit<ThreadMessage, 'body'> = {
      avatarSrc: DYNAMO_AVATAR_SRC,
      avatarAlt: DYNAMO.name,
      username: DYNAMO.name,
      timestamp: '2:23 PM',
      agentShape: DYNAMO.shape,
      agentColor: DYNAMO.color,
    };
    if (dynamoWorkPhase === 'typing') {
      showTypingRow = true;
      typingLabel = 'Dynamo is typing';
    } else if (dynamoWorkPhase === 'ack') {
      threadMessages.push({ ...dynamoWorkBase, body: streamedDynamoWorkAck });
    } else if (dynamoWorkPhase === 'thinking1') {
      threadMessages.push({
        ...dynamoWorkBase,
        body: (
          <>
            {DYNAMO_WORK_ACK_TEXT}
            <div
              className={styles['incident-channel__thread-status']}
              role="status"
              aria-live="polite"
            >
              <Spinner size={12} aria-label={DYNAMO_WORK_STATUS_LABELS_1[dynamoWorkStatusIndex]} />
              <span className={styles['incident-channel__thread-status-label']}>
                {DYNAMO_WORK_STATUS_LABELS_1[dynamoWorkStatusIndex]}
              </span>
            </div>
          </>
        ),
      });
    } else if (dynamoWorkPhase === 'finding') {
      threadMessages.push({
        ...dynamoWorkBase,
        body: (
          <>
            {DYNAMO_WORK_ACK_TEXT}
            <div
              className={[
                styles['incident-channel__thread-status'],
                styles['incident-channel__thread-status--done'],
              ].join(' ')}
            >
              <Icon glyph={<CheckCircleOutlineIcon />} size="12" />
              <span className={styles['incident-channel__thread-status-label']}>
                Regression isolated to build 8842
              </span>
            </div>
          </>
        ),
      });
      threadMessages.push({
        ...dynamoWorkBase,
        timestamp: '2:23 PM',
        body: streamedDynamoWorkFinding,
      });
    } else if (dynamoWorkPhase === 'thinking2') {
      threadMessages.push({
        ...dynamoWorkBase,
        body: (
          <>
            {DYNAMO_WORK_ACK_TEXT}
            <div
              className={[
                styles['incident-channel__thread-status'],
                styles['incident-channel__thread-status--done'],
              ].join(' ')}
            >
              <Icon glyph={<CheckCircleOutlineIcon />} size="12" />
              <span className={styles['incident-channel__thread-status-label']}>
                Regression isolated to build 8842
              </span>
            </div>
          </>
        ),
      });
      threadMessages.push({
        ...dynamoWorkBase,
        timestamp: '2:23 PM',
        body: (
          <>
            {DYNAMO_WORK_FINDING_TEXT}
            <CodeSnippet lines={DYNAMO_WORK_FINDING_CODE} startLine={14} />
            <div
              className={styles['incident-channel__thread-status']}
              role="status"
              aria-live="polite"
            >
              <Spinner size={12} aria-label={DYNAMO_WORK_STATUS_LABELS_2[dynamoWorkStatusIndex]} />
              <span className={styles['incident-channel__thread-status-label']}>
                {DYNAMO_WORK_STATUS_LABELS_2[dynamoWorkStatusIndex]}
              </span>
            </div>
          </>
        ),
      });
    } else if (dynamoWorkPhase === 'result' || dynamoWorkPhase === 'done') {
      threadMessages.push({
        ...dynamoWorkBase,
        body: (
          <>
            {DYNAMO_WORK_ACK_TEXT}
            <div
              className={[
                styles['incident-channel__thread-status'],
                styles['incident-channel__thread-status--done'],
              ].join(' ')}
            >
              <Icon glyph={<CheckCircleOutlineIcon />} size="12" />
              <span className={styles['incident-channel__thread-status-label']}>
                Regression isolated to build 8842
              </span>
            </div>
          </>
        ),
      });
      threadMessages.push({
        ...dynamoWorkBase,
        timestamp: '2:23 PM',
        body: (
          <>
            {DYNAMO_WORK_FINDING_TEXT}
            <CodeSnippet lines={DYNAMO_WORK_FINDING_CODE} startLine={14} />
            <div
              className={[
                styles['incident-channel__thread-status'],
                styles['incident-channel__thread-status--done'],
              ].join(' ')}
            >
              <Icon glyph={<CheckCircleOutlineIcon />} size="12" />
              <span className={styles['incident-channel__thread-status-label']}>
                Pull request opened on GitHub
              </span>
            </div>
          </>
        ),
      });
      threadMessages.push({
        ...dynamoWorkBase,
        timestamp: '2:24 PM',
        body: dynamoWorkPhase === 'done' ? (
          <>
            <p className={styles['incident-channel__thread-result-text']}>{DYNAMO_WORK_RESULT_TEXT}</p>
            <GitHubPrCard
              title="Fix PayForge webhook handler regression"
              branch="fix/payforge-webhook-header-propagation"
              authorName="dynamo-bot"
              authorAvatarSrc={DYNAMO_AVATAR_SRC}
              prNumber={4471}
              repoSlug="mattermost/platform"
              reviewers={[{ name: ALEX.name, avatarSrc: ALEX.avatarSrc }]}
              merged={prMerged}
            />
          </>
        ) : streamedDynamoWorkResult,
      });
      if (dynamoWorkPhase === 'done') {
        threadMessages.push({
          avatarSrc: agentAvatarChipSrc(mattyProfile.shape, mattyProfile.color),
          avatarAlt: mattyProfile.name,
          username: mattyProfile.name,
          timestamp: '2:25 PM',
          agentShape: mattyProfile.shape,
          agentColor: mattyProfile.color,
          body: "I'll let Otto know as soon as this is merged so he can deploy.",
        });
        if (convergenceDynamoVisible) {
          threadMessages.push({
            avatarSrc: ALEX.avatarSrc,
            avatarAlt: ALEX.avatarAlt,
            username: ALEX.name,
            timestamp: '2:26 PM',
            body: "Fix is in. Dynamo's PR #4471 is open — header propagation restored, all checks passing. I'll review and merge.",
          });
        }
      }
    }

    const dynamoReplyCount =
      convergenceDynamoVisible ? 5 :
      dynamoWorkPhase === 'done' ? 4 :
      dynamoWorkPhase === 'result' ? 3 :
      (dynamoWorkPhase === 'finding' || dynamoWorkPhase === 'thinking2') ? 2 :
      dynamoWorkPhase !== 'idle' ? 1 : 0;
    replySeparatorLabel = dynamoReplyCount === 0 || dynamoWorkPhase === 'typing'
      ? ''
      : `${dynamoReplyCount} ${dynamoReplyCount === 1 ? 'Reply' : 'Replies'}`;
  } else if (activePostId === INCIDENT_OTTO_INVITE_ID) {
    if (ottoPhase === 'typing') {
      showTypingRow = true;
      typingLabel = 'Otto is typing';
    } else if (ottoPhase === 'ack' || ottoPhase === 'done') {
      threadMessages.push({
        avatarSrc: OTTO_AVATAR_SRC,
        avatarAlt: OTTO.name,
        username: OTTO.name,
        timestamp: '2:16 PM',
        agentShape: OTTO.shape,
        agentColor: OTTO.color,
        body: ottoPhase === 'done' ? OTTO_ACK_TEXT : streamedOttoAck,
      });
    }
    replySeparatorLabel =
      ottoPhase === 'idle' || ottoPhase === 'typing' ? '' : '1 Reply';
  } else if (activePostId === SENTINEL_POST_ID) {
    threadMessages = [];

    if (cipherPhase === 'typing') {
      showTypingRow = true;
      typingLabel = 'Cipher is typing';
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
    } else if (cipherPhase === 'result' || cipherPhase === 'done' || cipherPhase === 'follow-up') {
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
      const resultFullyStreamed = cipherPhase === 'done' || cipherPhase === 'follow-up';
      threadMessages.push({
        ...cipherBase,
        timestamp: '2:18 PM',
        body: resultFullyStreamed ? (
          <>
            <p className={styles['incident-channel__thread-result-text']}>
              <span>{CIPHER_RESULT_TEXT}</span>
              {' '}
              <Chip
                size="medium-compact"
                leadingAvatar={{ src: agentAvatarChipSrc(SENTINEL_DEFAULT.shape, SENTINEL_DEFAULT.color), alt: SENTINEL_DEFAULT.name }}
                className={[
                  mentionStyles['mention-input__mention-chip'],
                  mentionStyles['mention-input__post-chip'],
                  mentionStyles['mention-input__mention-chip--agent'],
                ].join(' ')}
                onClick={(e) => {
                  e.stopPropagation();
                  const agent = agentById('sentinel');
                  if (agent) openAgentProfile(agent, e as React.MouseEvent<HTMLElement>);
                }}
              >
                {SENTINEL_DEFAULT.name}
              </Chip>
              {' '}
              <Chip
                size="medium-compact"
                leadingAvatar={{ src: agentAvatarChipSrc(mattyProfile.shape, mattyProfile.color), alt: mattyProfile.name }}
                className={[
                  mentionStyles['mention-input__mention-chip'],
                  mentionStyles['mention-input__post-chip'],
                  mentionStyles['mention-input__mention-chip--agent'],
                ].join(' ')}
                onClick={(e) => {
                  e.stopPropagation();
                  const agent = agentById(MATTY.id);
                  if (agent) openAgentProfile(agent, e as React.MouseEvent<HTMLElement>);
                }}
              >
                {mattyProfile.name}
              </Chip>
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
      if (cipherPhase === 'follow-up') {
        threadMessages.push({
          ...cipherBase,
          timestamp: '2:19 PM',
          body: (
            <p className={styles['incident-channel__post']}>
              {'Report attached to '}
              <a
                href="https://mattermost.atlassian.net/browse/INC-4471"
                target="_blank"
                rel="noreferrer"
                className={styles['incident-channel__link']}
              >
                INC-4471
              </a>
              {". I've also checked off my assigned Diagnosis tasks in the playbook."}
            </p>
          ),
        });
      }
    }

    replySeparatorLabel =
      cipherPhase === 'idle' || cipherPhase === 'typing'
        ? ''
        : cipherPhase === 'follow-up'
          ? '3 Replies'
          : cipherPhase === 'result' || cipherPhase === 'done'
            ? '2 Replies'
            : '1 Reply';
  } else if (activePostId === 'inc-matty-1') {
    threadMessages = MATTY_THREAD_REPLIES;
    replySeparatorLabel = '1 Reply';
  } else if (activePostId === CONVERGENCE_JORDAN_POST_ID && priyaSynthesisVisible) {
    threadMessages = [
      {
        avatarSrc: VIEWER.avatarSrc,
        avatarAlt: VIEWER.avatarAlt,
        username: VIEWER.name,
        timestamp: '2:28 PM',
        body: "Let's ship the fix directly — we know the cause, no need to roll back.",
      },
    ];
    if (jordanShipReplyVisible) {
      threadMessages.push({
        avatarSrc: JORDAN.avatarSrc,
        avatarAlt: JORDAN.avatarAlt,
        username: JORDAN.name,
        timestamp: '2:29 PM',
        body: (
          <p className={styles['incident-channel__post']}>
            <Chip
              size="medium-compact"
              leadingAvatar={{ src: OTTO_AVATAR_SRC, alt: OTTO.name }}
              className={[
                mentionStyles['mention-input__mention-chip'],
                mentionStyles['mention-input__post-chip'],
                mentionStyles['mention-input__mention-chip--agent'],
              ].join(' ')}
              onClick={(e) => {
                e.stopPropagation();
                const agent = agentById(OTTO.id);
                if (agent) openAgentProfile(agent, e as React.MouseEvent<HTMLElement>);
              }}
            >
              {OTTO.name}
            </Chip>
            {', no need to rollback. Let\'s ship the fix directly.'}
          </p>
        ),
      });
      const ottoDeployBase: Omit<ThreadMessage, 'body'> = {
        avatarSrc: OTTO_AVATAR_SRC,
        avatarAlt: OTTO.name,
        username: OTTO.name,
        timestamp: '2:30 PM',
        agentShape: OTTO.shape,
        agentColor: OTTO.color,
      };
      if (jordanOttoPhase === 'typing') {
        showTypingRow = true;
        typingLabel = 'Otto is typing';
      } else if (jordanOttoPhase === 'ack') {
        threadMessages.push({ ...ottoDeployBase, body: streamedJordanOttoAck });
      } else if (jordanOttoPhase === 'thinking') {
        threadMessages.push({
          ...ottoDeployBase,
          body: (
            <>
              {JORDAN_OTTO_DEPLOY_ACK_TEXT}
              <div className={styles['incident-channel__thread-status']} role="status" aria-live="polite">
                <Spinner size={12} aria-label={JORDAN_OTTO_DEPLOY_STATUS_LABELS[jordanOttoStatusIndex]} />
                <span className={styles['incident-channel__thread-status-label']}>
                  {JORDAN_OTTO_DEPLOY_STATUS_LABELS[jordanOttoStatusIndex]}
                </span>
              </div>
            </>
          ),
        });
      } else if (jordanOttoPhase === 'result' || jordanOttoPhase === 'done' || jordanOttoPhase === 'sentinel-reply') {
        threadMessages.push({
          ...ottoDeployBase,
          body: (
            <>
              {JORDAN_OTTO_DEPLOY_ACK_TEXT}
              <div className={[
                styles['incident-channel__thread-status'],
                styles['incident-channel__thread-status--done'],
              ].join(' ')}>
                <Icon glyph={<CheckCircleOutlineIcon />} size="12" />
                <span className={styles['incident-channel__thread-status-label']}>Fix deployed successfully</span>
              </div>
            </>
          ),
        });
        const ottoResultFullyStreamed = jordanOttoPhase === 'done' || jordanOttoPhase === 'sentinel-reply';
        threadMessages.push({
          ...ottoDeployBase,
          timestamp: '2:31 PM',
          body: ottoResultFullyStreamed
            ? (
              <p className={styles['incident-channel__thread-result-text']}>
                {JORDAN_OTTO_DEPLOY_RESULT_TEXT + ' '}
                <Chip
                  size="medium-compact"
                  leadingAvatar={{ src: SENTINEL_AVATAR_SRC, alt: SENTINEL_DEFAULT.name }}
                  className={[
                    mentionStyles['mention-input__mention-chip'],
                    mentionStyles['mention-input__post-chip'],
                    mentionStyles['mention-input__mention-chip--agent'],
                  ].join(' ')}
                  onClick={(e) => {
                    e.stopPropagation();
                    const agent = agentById('sentinel');
                    if (agent) openAgentProfile(agent, e as React.MouseEvent<HTMLElement>);
                  }}
                >
                  {SENTINEL_DEFAULT.name}
                </Chip>
                {' — monitor and confirm error rates are clear.'}
              </p>
            )
            : streamedJordanOttoResult,
        });
        if (jordanOttoPhase === 'sentinel-reply') {
          threadMessages.push({
            avatarSrc: SENTINEL_AVATAR_SRC,
            avatarAlt: SENTINEL_DEFAULT.name,
            username: SENTINEL_DEFAULT.name,
            timestamp: '2:32 PM',
            agentShape: SENTINEL_DEFAULT.shape,
            agentColor: SENTINEL_DEFAULT.color,
            body: <p className={styles['incident-channel__thread-result-text']}>{SENTINEL_REPLY_TEXT}</p>,
          });
        }
      }
    }
    const jordanTotalReplies = 1 + (jordanShipReplyVisible ? 1 : 0) + jordanOttoReplyCount + sentinelReplyCount;
    replySeparatorLabel = `${jordanTotalReplies} ${jordanTotalReplies === 1 ? 'Reply' : 'Replies'}`;
  }

  // Card node to show on the thread root post — mirrors what's shown in the channel.
  let threadRootInviteCard: React.ReactNode = null;
  if (activePostId === INCIDENT_OTTO_INVITE_ID) {
    threadRootInviteCard = (
      <AgentInviteCard
        card={{
          agentId: OTTO.id,
          name: OTTO.name,
          description: OTTO.description,
          accepted: ottoInviteAccepted,
          dismissed: ottoInviteDismissed,
        }}
        shape={OTTO.shape}
        color={OTTO.color}
        onAdd={() => setOttoInviteAccepted(true)}
        onDismiss={() => setOttoInviteDismissed(true)}
      />
    );
  } else if (activePostId === MATTY_DYNAMO_APPROVAL_POST_ID) {
    threadRootInviteCard = (
      <AgentApprovalCard
        title="Start fix with Dynamo"
        description="Dynamo will work with Alex in a thread, surface the change from build 8842, and propose a fix to the webhook handler."
        agentShape={DYNAMO.shape}
        agentColor={DYNAMO.color}
        accepted={dynamoApprovalAccepted}
        dismissed={dynamoApprovalDismissed}
        onApprove={() => setDynamoApprovalAccepted(true)}
        onDismiss={() => setDynamoApprovalDismissed(true)}
      />
    );
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
                    const inviteCard = message.id === INCIDENT_OTTO_INVITE_ID && message.agentInviteCard ? (
                      <AgentInviteCard
                        card={{
                          ...message.agentInviteCard,
                          accepted: ottoInviteAccepted,
                          dismissed: ottoInviteDismissed,
                        }}
                        shape={OTTO.shape}
                        color={OTTO.color}
                        onAdd={() => setOttoInviteAccepted(true)}
                        onDismiss={() => setOttoInviteDismissed(true)}
                      />
                    ) : undefined;
                    return (
                      <Fragment key={message.id}>
                        <AgentPost
                          message={
                            message.id === SENTINEL_POST_ID && message.threadReplies
                              ? { ...message, threadReplies: { ...message.threadReplies, resolved: sentinelThreadResolved } }
                              : message
                          }
                          onAgentClick={openAgentProfile}
                          onOpenThread={() => openThread(message.id)}
                          showThreadReplies={
                            message.id === SENTINEL_POST_ID
                              ? cipherHasReplied
                              : message.id === INCIDENT_OTTO_INVITE_ID
                                ? ottoHasReplied
                                : true
                          }
                          inviteCardNode={inviteCard}
                        />
                        {message.id === INCIDENT_OTTO_INVITE_ID && ottoInviteAccepted && (
                          <AgentAddedMsg
                            agentSrc={OTTO_AVATAR_SRC}
                            agentName={OTTO.name}
                            byName={VIEWER.name}
                            bySrc={VIEWER.avatarSrc}
                          />
                        )}
                      </Fragment>
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
                {mattyApprovalVisible && (
                  <>
                    <AgentPost
                      message={mattyApprovalMessage}
                      onAgentClick={openAgentProfile}
                      onOpenThread={() => openThread(MATTY_DYNAMO_APPROVAL_POST_ID)}
                      showThreadReplies={dynamoWorkHasReplied}
                      inviteCardNode={
                        <AgentApprovalCard
                          title="Start fix with Dynamo"
                          description="Dynamo will work with Alex in a thread, surface the change from build 8842, and propose a fix to the webhook handler."
                          agentShape={DYNAMO.shape}
                          agentColor={DYNAMO.color}
                          accepted={dynamoApprovalAccepted}
                          dismissed={dynamoApprovalDismissed}
                          onApprove={() => setDynamoApprovalAccepted(true)}
                          onDismiss={() => setDynamoApprovalDismissed(true)}
                        />
                      }
                    />
                    {dynamoApprovalAccepted && (
                      <AgentAddedMsg
                        agentSrc={DYNAMO_AVATAR_SRC}
                        agentName={DYNAMO.name}
                        byName={VIEWER.name}
                        bySrc={VIEWER.avatarSrc}
                      />
                    )}
                  </>
                )}
                {mattyRollbackVisible && (
                  <AgentPost
                    message={mattyRollbackMessage}
                    onAgentClick={openAgentProfile}
                    onOpenThread={() => openThread(MATTY_ROLLBACK_POST_ID)}
                    showThreadReplies={ottoWorkHasReplied}
                  />
                )}
                {convergenceOttoVisible && (
                  <article
                    className={styles['incident-channel__agent-message']}
                    role="button"
                    tabIndex={0}
                    onClick={() => openThread(CONVERGENCE_JORDAN_POST_ID)}
                    onKeyDown={(e) => { if (e.key === 'Enter') openThread(CONVERGENCE_JORDAN_POST_ID); }}
                  >
                    <div className={styles['incident-channel__agent-message-avatar']}>
                      <UserAvatar src={JORDAN.avatarSrc} alt={JORDAN.avatarAlt} size="32" />
                    </div>
                    <div className={styles['incident-channel__agent-message-body']}>
                      <div className={styles['incident-channel__agent-message-meta']}>
                        <span className={styles['incident-channel__agent-message-name']}>{JORDAN.name}</span>
                        {jordanThreadResolved && (
                          <Tag label="Resolved" type="success" size="x-small" />
                        )}
                        <time className={styles['incident-channel__agent-message-time']}>2:27 PM</time>
                      </div>
                      <p className={styles['incident-channel__post']}>
                        {'Rollback to 8841 is staged — '}
                        <Chip
                          size="medium-compact"
                          leadingAvatar={{ src: OTTO_AVATAR_SRC, alt: OTTO.name }}
                          className={[
                            mentionStyles['mention-input__mention-chip'],
                            mentionStyles['mention-input__post-chip'],
                            mentionStyles['mention-input__mention-chip--agent'],
                          ].join(' ')}
                          onClick={(e) => {
                            e.stopPropagation();
                            const agent = agentById(OTTO.id);
                            if (agent) openAgentProfile(agent, e as React.MouseEvent<HTMLElement>);
                          }}
                        >
                          {OTTO.name}
                        </Chip>
                        {' can execute in under 2 minutes if needed. Standing by.'}
                      </p>
                      {convergenceJordanMessage.threadReplies && (
                        <div className={styles['incident-channel__thread-footer']}>
                          <ThreadFooter
                            replyCount={convergenceJordanMessage.threadReplies.count}
                            lastReplyTime={convergenceJordanMessage.threadReplies.lastReplyTime}
                            avatars={convergenceJordanMessage.threadReplies.participants.map((p) => ({
                              key: p.key,
                              name: p.name,
                              src: p.agentShape && p.agentColor ? agentAvatarChipSrc(p.agentShape, p.agentColor) : p.avatarSrc,
                            }))}
                            onReply={() => openThread(CONVERGENCE_JORDAN_POST_ID)}
                          />
                        </div>
                      )}
                    </div>
                  </article>
                )}
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
            <PlaybookRunRhs reportPosted={cipherReportPosted} prOpened={dynamoWorkPhase === 'done'} />
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
                  <div className={styles['incident-channel__thread-header']}>
                    <div className={styles['incident-channel__thread-header-left']}>
                      <div className={styles['incident-channel__thread-header-primary']}>
                        <span className={styles['incident-channel__thread-header-title']}>Thread</span>
                      </div>
                      <div className={styles['incident-channel__thread-header-secondary']}>
                        <span className={styles['incident-channel__thread-header-subtitle']}>INC-4471</span>
                        {activeThreadResolved && (
                          <Tag label="Resolved" type="success" size="x-small" />
                        )}
                      </div>
                    </div>
                    <div className={styles['incident-channel__thread-header-actions']}>
                      <IconButton
                        size="small"
                        aria-label="Close thread"
                        onClick={closeThread}
                        icon={<Icon size="16" glyph={<CloseIcon />} />}
                      />
                    </div>
                  </div>
                }
                footer={
                  <div className={styles['incident-channel__rhs-composer']}>
                    <MentionMessageInput
                      placeholder="Reply in thread…"
                      disabled={activeThreadResolved}
                      onSend={() => undefined}
                    />
                  </div>
                }
              >
                <div className={styles['incident-channel__rhs-thread-messages']}>
                  {rootMessage?.kind === 'agent' && (
                    <AgentPost
                      message={rootMessage}
                      onAgentClick={openAgentProfile}
                      onOpenThread={() => undefined}
                      showThreadReplies={false}
                      inviteCardNode={threadRootInviteCard}
                    />
                  )}
                  {rootMessage?.kind === 'user' && (
                    <div className={styles['incident-channel__message-row']}>
                      <Message
                        avatarSrc={rootMessage.avatarSrc}
                        avatarAlt={rootMessage.avatarAlt}
                        username={rootMessage.username}
                        timestamp={rootMessage.timestamp}
                        showMessageActions={false}
                      >
                        {activePostId === CONVERGENCE_JORDAN_POST_ID ? (
                          <p className={styles['incident-channel__post']}>
                            {'Rollback to 8841 is staged — '}
                            <Chip
                              size="medium-compact"
                              leadingAvatar={{ src: OTTO_AVATAR_SRC, alt: OTTO.name }}
                              className={[
                                mentionStyles['mention-input__mention-chip'],
                                mentionStyles['mention-input__post-chip'],
                                mentionStyles['mention-input__mention-chip--agent'],
                              ].join(' ')}
                              onClick={(e) => {
                                e.stopPropagation();
                                const agent = agentById(OTTO.id);
                                if (agent) openAgentProfile(agent, e as React.MouseEvent<HTMLElement>);
                              }}
                            >
                              {OTTO.name}
                            </Chip>
                            {' can execute in under 2 minutes if needed. Standing by.'}
                          </p>
                        ) : (
                          <p className={styles['incident-channel__post']}>{rootMessage.body}</p>
                        )}
                      </Message>
                    </div>
                  )}
                  {Boolean(replySeparatorLabel) && threadMessages.length > 0 && (
                    <MessageSeparator type="reply-count" label={replySeparatorLabel} />
                  )}
                  {threadMessages.map((message, i) =>
                    message.agentShape ? (
                      <AgentThreadMessage key={`${message.username}-${message.timestamp}-${i}`} message={message} />
                    ) : (
                      <Message
                        key={`${message.username}-${message.timestamp}-${i}`}
                        avatarSrc={message.avatarSrc}
                        avatarAlt={message.avatarAlt}
                        username={message.username}
                        timestamp={message.timestamp}
                        showMessageActions={false}
                      >
                        {message.body}
                      </Message>
                    )
                  )}
                  {/* Typing dots — shown while the active agent is composing */}
                  {showTypingRow ? (
                    <div className={styles['incident-channel__thread-typing-row']}>
                      <AgentTypingDots label={typingLabel} />
                    </div>
                  ) : null}
                  {activeThreadResolved && (
                    <div className={styles['incident-channel__thread-resolved-notice']}>
                      <p>
                        <Chip
                          size="small"
                          leadingAvatar={{
                            src: activeThreadResolvedSrc,
                            alt: activeThreadResolvedBy ?? VIEWER.name,
                          }}
                          className={SYSTEM_CHIP_CLASS}
                        >
                          {activeThreadResolvedBy ?? VIEWER.name}
                        </Chip>
                        {' marked the thread resolved.'}
                      </p>
                    </div>
                  )}
                  <div ref={threadBottomRef} />
                </div>
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
