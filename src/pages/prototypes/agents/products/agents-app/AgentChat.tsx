import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { useParams, useSearchParams } from 'react-router-dom';
import ArchiveOutlineIcon from '@mattermost/compass-icons/components/archive-outline';
import CheckCircleOutlineIcon from '@mattermost/compass-icons/components/check-circle-outline';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ContentCopyIcon from '@mattermost/compass-icons/components/content-copy';
import LightningBoltOutlineIcon from '@mattermost/compass-icons/components/lightning-bolt-outline';
import MessageTextOutlineIcon from '@mattermost/compass-icons/components/message-text-outline';
import MonitorIcon from '@mattermost/compass-icons/components/monitor';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import SendOutlineIcon from '@mattermost/compass-icons/components/send-outline';
import SettingsOutlineIcon from '@mattermost/compass-icons/components/settings-outline';
import { AttachmentCard } from '@mattermost/compass-ui/components/attachment-card';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import {
  PopoverMenu,
  PopoverMenuDivider,
  PopoverMenuGroup,
} from '@mattermost/compass-ui/components/popover-menu';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { Spinner } from '@mattermost/compass-ui/components/spinner';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import { RightSidebar } from '@mattermost/compass-proto';
import { useExitAnimation } from '@/hooks/useExitAnimation';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import {
  AGENT_AUTOMATION_CONFIRM_ID,
  AGENT_AUTOMATION_PROMPT_ID,
  INCIDENT_RESPONSE_PLAYBOOK_DRAFT,
  MATTY,
  MATTY_TOOL_AUTH_ID,
  MATTY_TOOL_CONNECTED_ID,
  MATTY_TOOL_CONNECT_CONFIRM_ID,
  MATTY_TOOL_CONNECT_MESSAGE,
  SENTINEL_PLAYBOOK_CARD_ID,
  SENTINEL_PLAYBOOK_REPLY,
  SENTINEL_PLAYBOOK_REPLY_ID,
  SENTINEL_PLAYBOOK_SAVED_ID,
  VIEWER,
  buildAgentAutomationConfirm,
  buildAgentAutomationMessage,
  buildMattyToolAuthMessage,
  buildMattyToolConnectedMessage,
  buildMattyToolConnectConfirm,
  buildSentinelPlaybookCard,
  buildSentinelPlaybookCardMessage,
  buildSentinelPlaybookArtifactSession,
  buildSentinelPlaybookSavedMessage,
  buildWorkspaceDirectory,
  isAgentGroupChatId,
  isSentinelName,
  resolveAgentProfile,
  resolveSingleAgentProfile,
  type AgentProfile,
  type AgentToolConnectOption,
  type ChatAttachment,
  type LiveAgentSession,
  type LiveSessionMessage,
  type WorkspaceAgent,
} from '../../agentsData';
import AgentAvatar from '../../components/AgentAvatar';
import AgentComputerPip from '../../components/AgentComputerPip';
import AgentPlaybookCard from '../../components/AgentPlaybookCard';
import AgentPlaybookPreview, {
  AgentPlaybookRhsHeader,
} from '../../components/AgentPlaybookPreview';
import AgentProfilePopover, {
  profileAnchorFromEvent,
  type AgentProfileAnchor,
} from '../../components/AgentProfilePopover';
import AgentSettingsModal, {
  AGENT_SETTINGS_TABS,
  type SettingsTab,
} from '../../components/AgentSettingsModal';
import AgentToolAuthCard from '../../components/AgentToolAuthCard';
import AgentToolConnectCard from '../../components/AgentToolConnectCard';
import AgentTypingDots from '../../components/AgentTypingDots';
import { useAgents } from '../../context/AgentsContext';
import AgentsProductSidebar from './AgentsProductSidebar';
import styles from './AgentChat.module.scss';

const STREAM_MS_PER_WORD = 32;
/** Hold the typing dots before avatar reveal (within ~800–1200ms). */
const AVATAR_LOADING_MS = 1000;
/** Matches `--duration-moderate` for the dots → avatar crossfade. */
const AVATAR_REVEAL_MS = 300;
const OPTIONS_MENU_EXIT_MS = 150;
const OPTIONS_MENU_WIDTH = 280;
/** Matches `--duration-moderate` for playbook RHS slide. */
const PLAYBOOK_RHS_EXIT_MS = 300;
/** Brief beat after the welcome stream before the tool-choice post. */
const TOOL_POST_DELAY_MS = 280;
/** Dwell time for each post-confirm tool-connect status line. */
const TOOL_CONNECT_STATUS_MS = 1100;

const TOOL_CONNECT_STATUS_LABELS = [
  'Thinking…',
  'Checking connected tools…',
  'Connecting to provider…',
] as const;

const PLAYBOOK_STATUS_LABELS = [
  'Thinking…',
  'Connecting to Playbooks…',
  'Reading checklist…',
] as const;

const COMPOSER_FILE_ACCEPT =
  '.pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.md,.png,.jpg,.jpeg,.zip';

type PendingAttachment = ChatAttachment & {
  state: 'uploading' | 'uploaded';
  progress: number;
};

type ToolConnectPhase = 'idle' | 'streaming' | 'status' | 'done';
type PlaybookPhase = 'idle' | 'status' | 'streaming' | 'done';

function formatFileMeta(file: File): string {
  const ext = (file.name.split('.').pop() || 'FILE').toUpperCase();
  const kb = Math.max(1, Math.round(file.size / 1024));
  const size =
    kb >= 1024 ? `${(kb / 1024).toFixed(kb >= 10240 ? 0 : 1)}MB` : `${kb}KB`;
  return `${ext} ${size}`;
}

function attachmentFileType(file: File): ChatAttachment['fileType'] {
  const name = file.name.toLowerCase();
  const type = file.type;
  if (type === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
  if (
    type.includes('spreadsheet') ||
    type.includes('excel') ||
    /\.(xlsx?|csv)$/.test(name)
  ) {
    return 'excel';
  }
  if (type.includes('word') || /\.docx?$/.test(name)) return 'word';
  if (type.includes('presentation') || /\.pptx?$/.test(name)) {
    return 'powerpoint';
  }
  if (type.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/.test(name)) {
    return 'image-icon';
  }
  if (type.includes('zip') || name.endsWith('.zip')) return 'zip';
  if (/\.(txt|md|markdown)$/.test(name)) return 'text';
  if (/\.(js|ts|tsx|jsx|json|html|css)$/.test(name)) return 'code';
  return 'generic';
}

function nextAttachmentId() {
  return `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const EMPTY_CHAT_TITLES = [
  'How can I help today?',
  "Let's get some work done",
  'What should we tackle?',
  'Ready when you are',
  'Where should we start?',
  'Got something on your mind?',
];

/** Turn a directory blurb into a first-person empty-state subtitle. */
function toFirstPersonAgentBlurb(description: string): string {
  const trimmed = description.trim();
  if (!trimmed) return '';
  if (/^i\b/i.test(trimmed)) {
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }

  // Role noun: "General purpose agent that…" → "I am a general purpose agent that…"
  // Avoid mid-sentence uses like "whether agent actions…".
  const isAgentRoleNoun =
    /^(an?\s+)?(?:[\w-]+[\s,]+){0,6}agent\b(?:\s+that\b|\s+who\b|\s+for\b|\s+to\b|\s*[,.]|\s*$)/i.test(
      trimmed,
    );
  if (isAgentRoleNoun) {
    const rest = trimmed
      .replace(/^(an?\s+)/i, '')
      .replace(/^[A-Z]/, (char) => char.toLowerCase());
    const article = /^[aeiou]/i.test(rest) ? 'an' : 'a';
    return `I am ${article} ${rest}`;
  }

  // Verb lead: "Opens tickets…" / "Runs CI/CD…" → "I open…" / "I run…"
  const match = trimmed.match(/^([A-Za-z]+)([\s\S]*)$/);
  if (!match) return trimmed;
  return `I ${toFirstPersonPresentVerb(match[1])}${match[2]}`;
}

function toFirstPersonPresentVerb(verb: string): string {
  const lower = verb.toLowerCase();
  if (lower.endsWith('ies') && lower.length > 4) {
    return `${lower.slice(0, -3)}y`;
  }
  if (
    lower.endsWith('sses') ||
    lower.endsWith('xes') ||
    lower.endsWith('zes') ||
    lower.endsWith('ches') ||
    lower.endsWith('shes')
  ) {
    return lower.slice(0, -2);
  }
  if (lower.endsWith('s') && !lower.endsWith('ss')) {
    return lower.slice(0, -1);
  }
  return lower;
}

type AvatarRevealPhase = 'loading' | 'revealing' | 'ready';

function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function profileAgentFromChat(
  agent: AgentProfile,
  customAgents: Parameters<typeof buildWorkspaceDirectory>[0],
): WorkspaceAgent {
  const fromDirectory = buildWorkspaceDirectory(customAgents).find(
    (entry) => entry.id === agent.id,
  );
  if (fromDirectory) {
    return fromDirectory;
  }
  return {
    id: agent.id,
    name: agent.name,
    role: 'Custom',
    owner: VIEWER.name,
    description: agent.description || agent.purpose || '',
    shape: agent.shape,
    color: agent.color,
    channels: agent.knowledgeChannelIds ?? [],
    model: agent.model,
    customImageSrc: agent.customImageSrc,
  };
}

function formatChatTime(date = new Date()) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function splitParagraphWords(paragraphs: string[]): string[][] {
  return paragraphs.map((paragraph) =>
    paragraph.trim().split(/\s+/).filter(Boolean),
  );
}

function takeVisibleParagraphs(
  wordsByParagraph: string[][],
  visibleWordCount: number,
): string[] {
  const visible: string[] = [];
  let remaining = visibleWordCount;
  for (const words of wordsByParagraph) {
    if (remaining <= 0) {
      break;
    }
    const take = Math.min(words.length, remaining);
    visible.push(words.slice(0, take).join(' '));
    remaining -= take;
  }
  return visible;
}

/** Reveal full paragraphs word-by-word while keeping paragraph breaks. */
function useStreamedParagraphs(
  paragraphs: string[],
  enabled: boolean,
  msPerWord = STREAM_MS_PER_WORD,
): string[] {
  const [visibleWordCount, setVisibleWordCount] = useState(0);
  const wordsByParagraph = splitParagraphWords(paragraphs);
  const totalWords = wordsByParagraph.reduce(
    (sum, words) => words.length + sum,
    0,
  );

  useEffect(() => {
    setVisibleWordCount(0);
    if (!enabled || totalWords === 0) {
      return;
    }

    let count = 0;
    const id = window.setInterval(() => {
      count += 1;
      setVisibleWordCount(count);
      if (count >= totalWords) {
        window.clearInterval(id);
      }
    }, msPerWord);

    return () => window.clearInterval(id);
  }, [paragraphs, totalWords, msPerWord, enabled]);

  return takeVisibleParagraphs(wordsByParagraph, visibleWordCount);
}

/** Dot loader → avatar crossfade; stream starts when avatar is ready. */
function useAvatarReveal(
  resetKey: string,
  enabled: boolean,
): AvatarRevealPhase {
  const [phase, setPhase] = useState<AvatarRevealPhase>(
    enabled ? 'loading' : 'ready',
  );
  const prevRef = useRef({ resetKey, enabled });

  let resolvedPhase = phase;
  // Reset synchronously when the intro target changes so we never flash the bubble.
  if (
    prevRef.current.resetKey !== resetKey ||
    prevRef.current.enabled !== enabled
  ) {
    prevRef.current = { resetKey, enabled };
    resolvedPhase = enabled ? 'loading' : 'ready';
    if (phase !== resolvedPhase) {
      setPhase(resolvedPhase);
    }
  }

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reducedMotion) {
      setPhase('ready');
      return;
    }

    setPhase('loading');
    const revealId = window.setTimeout(() => {
      setPhase('revealing');
    }, AVATAR_LOADING_MS);
    const readyId = window.setTimeout(() => {
      setPhase('ready');
    }, AVATAR_LOADING_MS + AVATAR_REVEAL_MS);

    return () => {
      window.clearTimeout(revealId);
      window.clearTimeout(readyId);
    };
  }, [resetKey, enabled]);

  return resolvedPhase;
}

/**
 * Agent chat layout — spanning header + message canvas.
 * Sessions live in the product LHS under each agent.
 * `embedded` hides the Agents LHS for Channels DM center-pane use.
 */
export default function AgentChat({
  agentId: agentIdProp,
  embedded = false,
}: {
  agentId?: string;
  embedded?: boolean;
} = {}) {
  const { agentId: agentIdParam } = useParams<{ agentId: string }>();
  const agentId = agentIdProp ?? agentIdParam;
  const {
    customAgents,
    groupChats,
    updateAgent,
    rememberOpenedAgent,
    sessionsByAgentId,
    activeSessionByAgentId,
    ensureAgentSessions,
    startNewChat: startNewChatForAgent,
    renameSession: renameSessionForAgent,
    archiveSession: archiveSessionForAgent,
    updateSessionsForAgent,
    setActiveSessionForAgent,
  } = useAgents();
  const agent = useMemo(
    () => resolveAgentProfile(agentId, customAgents, groupChats),
    [agentId, customAgents, groupChats],
  );
  // Group chats use id prefix + memberIds; hide the single AgentAvatar in the header.
  const isGroupChat =
    isAgentGroupChatId(agent.id) || Boolean(agent.memberIds?.length);

  useEffect(() => {
    rememberOpenedAgent(agent.id);
    ensureAgentSessions(agent);
  }, [agent, rememberOpenedAgent, ensureAgentSessions]);

  const [searchParams, setSearchParams] = useSearchParams();
  const [profileTarget, setProfileTarget] =
    useState<AgentProfileAnchor | null>(null);
  const settingsParam = searchParams.get('settings') === 'true';
  const artifactParam = searchParams.get('artifact') === '1';
  const tabParam = searchParams.get('tab');
  const settingsTab: SettingsTab = AGENT_SETTINGS_TABS.includes(
    tabParam as SettingsTab,
  )
    ? (tabParam as SettingsTab)
    : 'info';

  const sessions = sessionsByAgentId[agent.id] ?? [];
  const activeSessionId = activeSessionByAgentId[agent.id] ?? '';
  const [draft, setDraft] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<
    PendingAttachment[]
  >([]);
  const [dragActive, setDragActive] = useState(false);
  const [welcomePlayed, setWelcomePlayed] = useState(false);
  /** One-shot loading + stream for sessions seeded by New agent automation. */
  const [automationIntroActive, setAutomationIntroActive] = useState(false);
  /** Matty tool-connect: stream confirm → status steps → auth card. */
  const [toolConnectPhase, setToolConnectPhase] =
    useState<ToolConnectPhase>('idle');
  const [toolConnectStatusIndex, setToolConnectStatusIndex] = useState(0);
  const [pendingToolOption, setPendingToolOption] =
    useState<AgentToolConnectOption | null>(null);
  const [connectedToolLabel, setConnectedToolLabel] = useState<string | null>(null);
  const [toolPostReady, setToolPostReady] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [optionsAnchor, setOptionsAnchor] = useState<DOMRect | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(settingsParam);
  const [computerOpen, setComputerOpen] = useState(false);
  const [computerFullscreen, setComputerFullscreen] = useState(false);
  const [computerAnchor, setComputerAnchor] = useState<DOMRect | null>(null);
  const [playbookPhase, setPlaybookPhase] = useState<PlaybookPhase>('idle');
  const [playbookStatusIndex, setPlaybookStatusIndex] = useState(0);
  const [playbookRhsOpen, setPlaybookRhsOpen] = useState(false);
  const optionsButtonRef = useRef<HTMLButtonElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const skipOptionsOutsideCloseRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTimersRef = useRef<Record<string, number>>({});
  const dragDepthRef = useRef(0);
  const {
    rendered: optionsRendered,
    exiting: optionsExiting,
  } = useExitAnimation(optionsOpen, OPTIONS_MENU_EXIT_MS);
  const {
    rendered: playbookRhsRendered,
    exiting: playbookRhsExiting,
  } = useExitAnimation(playbookRhsOpen, PLAYBOOK_RHS_EXIT_MS);

  useEffect(() => {
    setComputerOpen(false);
    setComputerFullscreen(false);
    setComputerAnchor(null);
    setPendingAttachments([]);
    setDragActive(false);
    dragDepthRef.current = 0;
    setPlaybookPhase('idle');
    setPlaybookStatusIndex(0);
    setPlaybookRhsOpen(false);
    Object.values(uploadTimersRef.current).forEach((id) =>
      window.clearTimeout(id),
    );
    uploadTimersRef.current = {};
  }, [agent.id]);

  useEffect(() => {
    return () => {
      Object.values(uploadTimersRef.current).forEach((id) =>
        window.clearTimeout(id),
      );
    };
  }, []);

  useOutsideClose(optionsMenuRef, optionsOpen && !optionsExiting, () => {
    if (skipOptionsOutsideCloseRef.current) {
      skipOptionsOutsideCloseRef.current = false;
      return;
    }
    setOptionsOpen(false);
  });

  const activeSession =
    sessions.find((session) => session.id === activeSessionId) ??
    sessions[0];
  const isEmptyChat = (activeSession?.messages.length ?? 0) === 0;
  const emptyTitle = useMemo(() => {
    const index = Math.floor(Math.random() * EMPTY_CHAT_TITLES.length);
    return EMPTY_CHAT_TITLES[index];
  }, [activeSessionId]);
  const emptySubtitle = useMemo(() => {
    if (isGroupChat && agent.memberIds?.length) {
      const names = agent.memberIds.map(
        (id) => resolveSingleAgentProfile(id, customAgents).name,
      );
      if (names.length === 1) {
        return `This is a group chat with you and ${names[0]}.`;
      }
      if (names.length === 2) {
        return `This is a group chat with you, ${names[0]}, and ${names[1]}.`;
      }
      const last = names[names.length - 1];
      return `This is a group chat with you, ${names.slice(0, -1).join(', ')}, and ${last}.`;
    }
    return toFirstPersonAgentBlurb(
      agent.description?.trim() || agent.purpose?.trim() || '',
    );
  }, [isGroupChat, agent.memberIds, agent.description, agent.purpose, customAgents]);
  const playWelcomeIntro =
    activeSession?.id === 'welcome' && !welcomePlayed;
  const playAutomationIntro =
    automationIntroActive &&
    activeSession?.messages[0]?.id === AGENT_AUTOMATION_PROMPT_ID;
  /** Shared dots → avatar → stream path for welcome and automation seed. */
  const playIntro = playWelcomeIntro || playAutomationIntro;
  const confirmMessage = activeSession?.messages.find(
    (message) => message.id === MATTY_TOOL_CONNECT_CONFIRM_ID,
  );
  const playConfirmStream =
    toolConnectPhase === 'streaming' && Boolean(confirmMessage);
  const playbookReplyMessage = activeSession?.messages.find(
    (message) => message.id === SENTINEL_PLAYBOOK_REPLY_ID,
  );
  const playPlaybookStream =
    playbookPhase === 'streaming' && Boolean(playbookReplyMessage);
  const avatarRevealKey = playAutomationIntro
    ? `automation-${activeSessionId}`
    : agent.id;
  const avatarPhase = useAvatarReveal(avatarRevealKey, playIntro);
  // Bubble + stream only after dots → avatar reveal completes.
  const showBubble = !playIntro || avatarPhase === 'ready';
  const introParagraphs = activeSession?.messages[0]?.paragraphs ?? [];
  const streamedParagraphs = useStreamedParagraphs(
    playIntro ? introParagraphs : [],
    playIntro && showBubble,
  );
  const streamedConfirmParagraphs = useStreamedParagraphs(
    playConfirmStream ? (confirmMessage?.paragraphs ?? []) : [],
    playConfirmStream,
  );
  const streamedPlaybookParagraphs = useStreamedParagraphs(
    playPlaybookStream ? (playbookReplyMessage?.paragraphs ?? []) : [],
    playPlaybookStream,
  );
  const showDots =
    playIntro &&
    (avatarPhase === 'loading' || avatarPhase === 'revealing');
  const showAvatar =
    !playIntro ||
    avatarPhase === 'revealing' ||
    avatarPhase === 'ready';
  const firstPostComplete =
    !playIntro ||
    streamedParagraphs.join('\n') === introParagraphs.join('\n');
  const confirmStreamComplete =
    !playConfirmStream ||
    streamedConfirmParagraphs.join('\n') ===
      (confirmMessage?.paragraphs ?? []).join('\n');
  const playbookStreamComplete =
    !playPlaybookStream ||
    streamedPlaybookParagraphs.join('\n') ===
      (playbookReplyMessage?.paragraphs ?? []).join('\n');
  const toolConnectStatusLabel =
    toolConnectPhase === 'status'
      ? TOOL_CONNECT_STATUS_LABELS[toolConnectStatusIndex]
      : null;
  const playbookStatusLabel =
    playbookPhase === 'status'
      ? PLAYBOOK_STATUS_LABELS[playbookStatusIndex]
      : null;
  const statusLabel = playbookStatusLabel ?? toolConnectStatusLabel;
  // Persistent "done" label — shown with checkmark after the status steps complete.
  const doneLabel =
    playbookPhase === 'done'
      ? 'Loaded Incident Response Playbook'
      : toolConnectPhase === 'done' && connectedToolLabel
        ? `Connected to ${connectedToolLabel}`
        : null;

  useEffect(() => {
    if (!playIntro) {
      setToolPostReady(true);
      return;
    }
    if (!firstPostComplete || !showBubble) {
      setToolPostReady(false);
      return;
    }
    const id = window.setTimeout(() => {
      setToolPostReady(true);
    }, TOOL_POST_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [playIntro, firstPostComplete, showBubble]);

  useEffect(() => {
    if (toolConnectPhase !== 'streaming' || !confirmStreamComplete) {
      return;
    }
    setToolConnectPhase('status');
    setToolConnectStatusIndex(0);
  }, [toolConnectPhase, confirmStreamComplete]);

  useEffect(() => {
    if (toolConnectPhase !== 'status' || !pendingToolOption) {
      return;
    }
    const id = window.setTimeout(() => {
      if (toolConnectStatusIndex < TOOL_CONNECT_STATUS_LABELS.length - 1) {
        setToolConnectStatusIndex((index) => index + 1);
        return;
      }
      const authMessage: LiveSessionMessage = {
        ...buildMattyToolAuthMessage(pendingToolOption, formatChatTime()),
        role: 'agent',
      };
      updateSessionsForAgent(agent.id, (prev) =>
        prev.map((session) => {
          if (session.id !== activeSessionId) return session;
          const withoutAuth = session.messages.filter(
            (message) => message.id !== MATTY_TOOL_AUTH_ID,
          );
          return {
            ...session,
            messages: [...withoutAuth, authMessage],
          };
        }),
      );
      setConnectedToolLabel(pendingToolOption.label);
      setPendingToolOption(null);
      setToolConnectPhase('done');
    }, TOOL_CONNECT_STATUS_MS);
    return () => window.clearTimeout(id);
  }, [
    toolConnectPhase,
    toolConnectStatusIndex,
    pendingToolOption,
    agent.id,
    activeSessionId,
    updateSessionsForAgent,
  ]);

  // Sentinel PDF → Playbook: cycle think/connect statuses, then stream reply.
  useEffect(() => {
    if (playbookPhase !== 'status') return;
    const id = window.setTimeout(() => {
      if (playbookStatusIndex < PLAYBOOK_STATUS_LABELS.length - 1) {
        setPlaybookStatusIndex((index) => index + 1);
        return;
      }
      const reply: LiveSessionMessage = {
        ...SENTINEL_PLAYBOOK_REPLY,
        timestamp: formatChatTime(),
        role: 'agent',
      };
      updateSessionsForAgent(agent.id, (prev) =>
        prev.map((session) => {
          if (session.id !== activeSessionId) return session;
          const withoutReply = session.messages.filter(
            (message) => message.id !== SENTINEL_PLAYBOOK_REPLY_ID,
          );
          return {
            ...session,
            messages: [...withoutReply, reply],
          };
        }),
      );
      setPlaybookPhase('streaming');
    }, TOOL_CONNECT_STATUS_MS);
    return () => window.clearTimeout(id);
  }, [
    playbookPhase,
    playbookStatusIndex,
    agent.id,
    activeSessionId,
    updateSessionsForAgent,
  ]);

  // After playbook reply streams, post the draft card and open the RHS preview.
  useEffect(() => {
    if (playbookPhase !== 'streaming' || !playbookStreamComplete) return;
    const cardMessage: LiveSessionMessage = {
      ...buildSentinelPlaybookCardMessage(formatChatTime()),
      role: 'agent',
    };
    updateSessionsForAgent(agent.id, (prev) =>
      prev.map((session) => {
        if (session.id !== activeSessionId) return session;
        if (
          session.messages.some(
            (message) => message.id === SENTINEL_PLAYBOOK_CARD_ID,
          )
        ) {
          return session;
        }
        return {
          ...session,
          messages: [...session.messages, cardMessage],
        };
      }),
    );
    setPlaybookRhsOpen(true);
    setPlaybookPhase('done');
  }, [
    playbookPhase,
    playbookStreamComplete,
    agent.id,
    activeSessionId,
    updateSessionsForAgent,
  ]);

  useEffect(() => {
    setDraft('');
    setWelcomePlayed(false);
    setAutomationIntroActive(false);
    setToolConnectPhase('idle');
    setToolConnectStatusIndex(0);
    setPendingToolOption(null);
    setConnectedToolLabel(null);
    setToolPostReady(false);
    setOptionsOpen(false);
    setSettingsOpen(settingsParam);
    setPlaybookPhase('idle');
    setPlaybookStatusIndex(0);
    setPlaybookRhsOpen(false);
  }, [agent.id]);

  useEffect(() => {
    if (settingsParam) {
      setSettingsOpen(true);
    }
  }, [settingsParam]);

  // Artifact scene: hydrate Sentinel PDF → playbook thread with RHS open.
  useEffect(() => {
    if (!artifactParam) return;
    if (!(agent.id === 'sentinel' || isSentinelName(agent.name))) return;

    const artifactSession = buildSentinelPlaybookArtifactSession();
    updateSessionsForAgent(agent.id, (prev) => {
      const rest = prev.filter((session) => session.id !== artifactSession.id);
      return [artifactSession, ...rest];
    });
    setActiveSessionForAgent(agent.id, artifactSession.id);
    setWelcomePlayed(true);
    setPlaybookPhase('done');
    setPlaybookStatusIndex(0);
    setPlaybookRhsOpen(true);
    setSettingsOpen(false);
  }, [
    artifactParam,
    agent.id,
    agent.name,
    updateSessionsForAgent,
    setActiveSessionForAgent,
  ]);

  useEffect(() => {
    if (activeSessionId && activeSessionId !== 'welcome') {
      setWelcomePlayed(true);
    }
    setToolConnectPhase('idle');
    setToolConnectStatusIndex(0);
    setPendingToolOption(null);
  }, [activeSessionId]);

  useEffect(() => {
    if (!optionsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOptionsOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [optionsOpen]);

  const openOptionsMenu = () => {
    const rect =
      optionsButtonRef.current?.getBoundingClientRect() ?? null;
    setOptionsAnchor(rect);
    setOptionsOpen((prev) => !prev);
  };

  const closeOptionsMenu = () => setOptionsOpen(false);

  const renameSession = (sessionId: string) => {
    const session = sessions.find((entry) => entry.id === sessionId);
    if (!session) return;
    const next = window.prompt('Rename chat', session.preview);
    closeOptionsMenu();
    if (next === null) return;
    const trimmed = next.trim();
    if (!trimmed || trimmed === session.preview) return;
    renameSessionForAgent(agent.id, sessionId, trimmed);
  };

  const archiveSession = (sessionId: string) => {
    closeOptionsMenu();
    setWelcomePlayed(true);
    setAutomationIntroActive(false);
    setDraft('');
    archiveSessionForAgent(agent.id, sessionId);
  };

  const startNewChat = () => {
    setWelcomePlayed(true);
    setAutomationIntroActive(false);
    setDraft('');
    setPendingAttachments([]);
    setPlaybookPhase('idle');
    setPlaybookStatusIndex(0);
    setPlaybookRhsOpen(false);
    setOptionsOpen(false);
    startNewChatForAgent(agent.id);
  };

  const startNewAutomation = () => {
    setWelcomePlayed(true);
    setDraft('');
    setOptionsOpen(false);
    setToolPostReady(false);
    const prompt: LiveSessionMessage = {
      ...buildAgentAutomationMessage(formatChatTime()),
      role: 'agent',
    };
    const empty = sessions.find((session) => session.messages.length === 0);
    if (empty) {
      updateSessionsForAgent(agent.id, (prev) =>
        prev.map((session) =>
          session.id === empty.id
            ? {
                ...session,
                preview: 'New agent automation',
                messages: [prompt],
                selectedToolId: undefined,
              }
            : session,
        ),
      );
      setActiveSessionForAgent(agent.id, empty.id);
      setAutomationIntroActive(true);
      return;
    }
    const created: LiveAgentSession = {
      id: nextId('chat'),
      preview: 'New agent automation',
      messages: [prompt],
    };
    updateSessionsForAgent(agent.id, (prev) => [created, ...prev]);
    setActiveSessionForAgent(agent.id, created.id);
    setAutomationIntroActive(true);
  };

  const clearPendingAttachment = (attachmentId: string) => {
    const timer = uploadTimersRef.current[attachmentId];
    if (timer) {
      window.clearTimeout(timer);
      delete uploadTimersRef.current[attachmentId];
    }
    setPendingAttachments((prev) =>
      prev.filter((attachment) => attachment.id !== attachmentId),
    );
  };

  const queueFilesForUpload = (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;

    for (const file of list) {
      const id = nextAttachmentId();
      const pending: PendingAttachment = {
        id,
        fileName: file.name,
        fileMeta: formatFileMeta(file),
        fileType: attachmentFileType(file),
        state: 'uploading',
        progress: 0,
      };
      setPendingAttachments((prev) => [...prev, pending]);

      let progress = 0;
      const tick = () => {
        progress = Math.min(100, progress + 10 + Math.random() * 18);
        const done = progress >= 100;
        setPendingAttachments((prev) =>
          prev.map((attachment) =>
            attachment.id === id
              ? {
                  ...attachment,
                  progress: Math.floor(progress),
                  state: done ? 'uploaded' : 'uploading',
                }
              : attachment,
          ),
        );
        if (!done) {
          uploadTimersRef.current[id] = window.setTimeout(tick, 70);
        } else {
          delete uploadTimersRef.current[id];
        }
      };
      uploadTimersRef.current[id] = window.setTimeout(tick, 50);
    }
  };

  const onCanvasDragEnter = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current += 1;
    if (event.dataTransfer.types.includes('Files')) {
      setDragActive(true);
    }
  };

  const onCanvasDragLeave = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) {
      setDragActive(false);
    }
  };

  const onCanvasDragOver = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.types.includes('Files')) {
      event.dataTransfer.dropEffect = 'copy';
    }
  };

  const onCanvasDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepthRef.current = 0;
    setDragActive(false);
    if (event.dataTransfer.files?.length) {
      queueFilesForUpload(event.dataTransfer.files);
    }
  };

  const onFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      queueFilesForUpload(event.target.files);
    }
    event.target.value = '';
  };

  const sendDraft = () => {
    const text = draft.trim();
    const readyAttachments = pendingAttachments.filter(
      (attachment) => attachment.state === 'uploaded',
    );
    const uploading = pendingAttachments.some(
      (attachment) => attachment.state === 'uploading',
    );
    if (uploading) return;
    if (!text && readyAttachments.length === 0) return;

    const attachments: ChatAttachment[] | undefined =
      readyAttachments.length > 0
        ? readyAttachments.map(
            ({ id, fileName, fileMeta, fileType }) => ({
              id,
              fileName,
              fileMeta,
              fileType,
            }),
          )
        : undefined;

    const message: LiveSessionMessage = {
      id: nextId('msg'),
      role: 'user',
      timestamp: formatChatTime(),
      paragraphs: text ? [text] : [],
      attachments,
    };

    const preview =
      text || readyAttachments[0]?.fileName || 'Attachment';

    const isSentinel =
      agent.id === 'sentinel' || isSentinelName(agent.name);
    const startPlaybookFlow =
      isSentinel &&
      Boolean(attachments?.some((attachment) => attachment.fileType === 'pdf'));

    let targetId = activeSession?.id;
    if (!targetId) {
      const created: LiveAgentSession = {
        id: nextId('chat'),
        preview,
        messages: [message],
      };
      updateSessionsForAgent(agent.id, (prev) => [created, ...prev]);
      setActiveSessionForAgent(agent.id, created.id);
      setDraft('');
      setPendingAttachments([]);
      if (startPlaybookFlow) {
        setPlaybookStatusIndex(0);
        setPlaybookRhsOpen(false);
        setPlaybookPhase('status');
      }
      return;
    }

    updateSessionsForAgent(agent.id, (prev) =>
      prev.map((session) => {
        if (session.id !== targetId) return session;
        return {
          ...session,
          preview,
          messages: [...session.messages, message],
        };
      }),
    );
    setDraft('');
    setPendingAttachments([]);
    if (startPlaybookFlow) {
      setPlaybookStatusIndex(0);
      setPlaybookRhsOpen(false);
      setPlaybookPhase('status');
    }
  };

  const selectAttachmentOption = (
    messageId: string,
    option: AgentToolConnectOption,
  ) => {
    const sessionId = activeSession?.id;
    if (!sessionId) return;

    const isAutomation = messageId === AGENT_AUTOMATION_PROMPT_ID;
    const confirmId = isAutomation
      ? AGENT_AUTOMATION_CONFIRM_ID
      : MATTY_TOOL_CONNECT_CONFIRM_ID;
    const confirmMessageBody = isAutomation
      ? buildAgentAutomationConfirm(option.id, option.label, formatChatTime())
      : buildMattyToolConnectConfirm(option.label, formatChatTime());

    updateSessionsForAgent(agent.id, (prev) =>
      prev.map((session) => {
        if (session.id !== sessionId) return session;
        const withoutFollowUps = session.messages.filter(
          (message) =>
            message.id !== confirmId &&
            message.id !== MATTY_TOOL_AUTH_ID &&
            message.id !== MATTY_TOOL_CONNECTED_ID,
        );
        const confirm: LiveSessionMessage = {
          ...confirmMessageBody,
          role: 'agent',
        };
        return {
          ...session,
          selectedToolId: option.id,
          messages: [...withoutFollowUps, confirm],
        };
      }),
    );

    if (!isAutomation) {
      setPendingToolOption(option);
      setToolConnectStatusIndex(0);
      setToolConnectPhase('streaming');
    }
  };

  const completeToolAuth = (card: NonNullable<LiveSessionMessage['authCard']>) => {
    const connectedMessage: LiveSessionMessage = {
      ...buildMattyToolConnectedMessage(card.toolLabel, formatChatTime()),
      role: 'agent',
    };
    updateSessionsForAgent(agent.id, (prev) =>
      prev.map((session) => {
        if (session.id !== activeSessionId) return session;
        const withoutConnected = session.messages.filter(
          (message) => message.id !== MATTY_TOOL_CONNECTED_ID,
        );
        return {
          ...session,
          messages: [
            ...withoutConnected.map((message) =>
              message.id === MATTY_TOOL_AUTH_ID && message.authCard
                ? {
                    ...message,
                    authCard: { ...message.authCard, connected: true },
                  }
                : message,
            ),
            connectedMessage,
          ],
        };
      }),
    );
  };

  const savePlaybookDraft = () => {
    const draft = INCIDENT_RESPONSE_PLAYBOOK_DRAFT;
    const activeCard = buildSentinelPlaybookCard(draft, 'active');
    const savedMessage: LiveSessionMessage = {
      ...buildSentinelPlaybookSavedMessage(formatChatTime(), draft),
      role: 'agent',
    };
    updateSessionsForAgent(agent.id, (prev) =>
      prev.map((session) => {
        if (session.id !== activeSessionId) return session;
        const alreadySaved = session.messages.some(
          (message) => message.id === SENTINEL_PLAYBOOK_SAVED_ID,
        );
        const messages = session.messages.map((message) =>
          message.id === SENTINEL_PLAYBOOK_CARD_ID && message.playbookCard
            ? { ...message, playbookCard: activeCard }
            : message,
        );
        if (alreadySaved) {
          return { ...session, messages };
        }
        return {
          ...session,
          messages: [...messages, savedMessage],
        };
      }),
    );
  };

  const canSend =
    (Boolean(draft.trim()) ||
      pendingAttachments.some((attachment) => attachment.state === 'uploaded')) &&
    !pendingAttachments.some((attachment) => attachment.state === 'uploading');

  const composer = (
    <div
      className={[
        styles['agent-chat__composer'],
        pendingAttachments.length > 0
          ? styles['agent-chat__composer--has-attachments']
          : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <input
        ref={fileInputRef}
        type="file"
        className={styles['agent-chat__file-input']}
        accept={COMPOSER_FILE_ACCEPT}
        multiple
        aria-hidden
        tabIndex={-1}
        onChange={onFileInputChange}
      />
      {pendingAttachments.length > 0 ? (
        <div className={styles['agent-chat__composer-attachments']}>
          {pendingAttachments.map((attachment) => (
            <AttachmentCard
              key={attachment.id}
              fileName={attachment.fileName}
              fileMeta={attachment.fileMeta}
              fileType={attachment.fileType}
              state={attachment.state}
              progress={attachment.progress}
              onRemove={() => clearPendingAttachment(attachment.id)}
            />
          ))}
        </div>
      ) : null}
      <div className={styles['agent-chat__input']}>
        <button
          type="button"
          className={styles['agent-chat__input-plus']}
          aria-label="Add attachment"
          onClick={() => fileInputRef.current?.click()}
        >
          <Icon glyph={<PlusIcon />} size="16" />
        </button>
        <input
          className={styles['agent-chat__input-field']}
          type="text"
          placeholder={`Chat with ${agent.name}`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              sendDraft();
            }
          }}
          aria-label={`Chat with ${agent.name}`}
        />
        <button
          type="button"
          className={styles['agent-chat__input-send']}
          aria-label="Send message"
          disabled={!canSend}
          onClick={sendDraft}
        >
          <Icon glyph={<SendOutlineIcon />} size="16" />
        </button>
      </div>
    </div>
  );

  return (
    <div
      className={[
        styles['agent-chat'],
        embedded ? styles['agent-chat--embedded'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {!embedded ? <AgentsProductSidebar activeNav={agent.id} /> : null}

      <div className={styles['agent-chat__workspace']}>
        <section
          className={[
            styles['agent-chat__canvas'],
            isEmptyChat ? styles['agent-chat__canvas--empty'] : '',
            dragActive ? styles['agent-chat__canvas--drag'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-label={`Chat with ${agent.name}`}
          onDragEnter={onCanvasDragEnter}
          onDragLeave={onCanvasDragLeave}
          onDragOver={onCanvasDragOver}
          onDrop={onCanvasDrop}
        >
          {dragActive ? (
            <div
              className={styles['agent-chat__drop-overlay']}
              aria-hidden
            >
              <p className={styles['agent-chat__drop-overlay-label']}>
                Drop file to attach
              </p>
            </div>
          ) : null}
          <header className={styles['agent-chat__header']}>
            <div className={styles['agent-chat__header-title']}>
              {!isGroupChat ? (
                <AgentAvatar
                  shape={agent.shape}
                  color={agent.color}
                  size="xs"
                  eyes
                  shadow={false}
                  imageSrc={agent.customImageSrc}
                />
              ) : null}
              <button
                ref={optionsButtonRef}
                type="button"
                className={styles['agent-chat__header-title-button']}
                aria-label={`${agent.name} options`}
                aria-haspopup="menu"
                aria-expanded={optionsOpen}
                onMouseDown={() => {
                  if (optionsOpen) {
                    skipOptionsOutsideCloseRef.current = true;
                  }
                }}
                onClick={openOptionsMenu}
              >
                <h1 className={styles['agent-chat__header-name']}>
                  {agent.name}
                </h1>
                <Icon glyph={<ChevronDownIcon />} size="16" />
              </button>
            </div>
            <div className={styles['agent-chat__header-actions']}>
              {!isGroupChat ? (
                computerOpen ? (
                  <button
                    type="button"
                    className={styles['agent-chat__computer-working']}
                    aria-label={`Close ${agent.name} computer`}
                    aria-pressed={true}
                    onClick={() => {
                      setComputerOpen(false);
                      setComputerFullscreen(false);
                      setComputerAnchor(null);
                    }}
                  >
                    <Icon glyph={<MonitorIcon />} size="16" />
                    <span>Working…</span>
                  </button>
                ) : (
                  <IconButton
                    size="small"
                    padding="compact"
                    icon={<Icon glyph={<MonitorIcon />} size="16" />}
                    aria-label={`Open ${agent.name} computer`}
                    aria-pressed={false}
                    onClick={(event) => {
                      const rect = event.currentTarget.getBoundingClientRect();
                      setComputerAnchor(rect);
                      setComputerOpen(true);
                    }}
                  />
                )
              ) : null}
              <IconButton
                size="small"
                padding="compact"
                icon={<Icon glyph={<PlusIcon />} size="16" />}
                aria-label="New chat"
                onClick={startNewChat}
              />
            </div>
          </header>

          {isEmptyChat ? (
            <div className={styles['agent-chat__empty']}>
              <div className={styles['agent-chat__empty-intro']}>
                <h2 className={styles['agent-chat__empty-title']}>
                  {emptyTitle}
                </h2>
                {emptySubtitle ? (
                  <p className={styles['agent-chat__empty-subtitle']}>
                    {emptySubtitle}
                  </p>
                ) : null}
              </div>
              {composer}
            </div>
          ) : (
            <>
              <div className={styles['agent-chat__messages']}>
                <Scrollbar>
                  <div className={styles['agent-chat__messages-list']}>
                    {(activeSession?.messages ?? [])
                      .filter(
                        (_, index) =>
                          !playWelcomeIntro || toolPostReady || index === 0,
                      )
                      .map((message, index) => {
                      if (message.role === 'user') {
                        return (
                          <article
                            key={message.id}
                            className={[
                              styles['agent-chat__message'],
                              styles['agent-chat__message--user'],
                            ].join(' ')}
                          >
                            <div className={styles['agent-chat__message-avatar']}>
                              <UserAvatar
                                size="32"
                                src={VIEWER.avatarSrc}
                                alt={VIEWER.avatarAlt}
                              />
                            </div>
                            <div className={styles['agent-chat__message-bubble']}>
                              <div className={styles['agent-chat__message-meta']}>
                                <span className={styles['agent-chat__message-name']}>
                                  {VIEWER.name}
                                </span>
                                <time className={styles['agent-chat__message-time']}>
                                  {message.timestamp}
                                </time>
                              </div>
                              <div className={styles['agent-chat__message-body']}>
                                {message.paragraphs.map((paragraph, pIndex) => (
                                  <p key={pIndex}>{paragraph}</p>
                                ))}
                                {message.attachments?.length ? (
                                  <div
                                    className={
                                      styles['agent-chat__message-attachments']
                                    }
                                  >
                                    {message.attachments.map((attachment) => (
                                      <AttachmentCard
                                        key={attachment.id}
                                        fileName={attachment.fileName}
                                        fileMeta={attachment.fileMeta}
                                        fileType={attachment.fileType}
                                        state="default"
                                      />
                                    ))}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </article>
                        );
                      }

                      const isIntro = playIntro && index === 0;
                      const isConfirm =
                        message.id === MATTY_TOOL_CONNECT_CONFIRM_ID;
                      const isPlaybookReply =
                        message.id === SENTINEL_PLAYBOOK_REPLY_ID;
                      const isToolPost =
                        playWelcomeIntro &&
                        message.id === MATTY_TOOL_CONNECT_MESSAGE.id;
                      const enterBubble =
                        isIntro ||
                        isToolPost ||
                        (isConfirm && playConfirmStream) ||
                        (isPlaybookReply && playPlaybookStream) ||
                        (message.id === MATTY_TOOL_AUTH_ID &&
                          toolConnectPhase === 'done') ||
                        message.id === MATTY_TOOL_CONNECTED_ID ||
                        message.id === SENTINEL_PLAYBOOK_CARD_ID;
                      const paragraphs = isIntro
                        ? streamedParagraphs
                        : isConfirm && playConfirmStream
                          ? streamedConfirmParagraphs
                          : isPlaybookReply && playPlaybookStream
                            ? streamedPlaybookParagraphs
                            : message.paragraphs;

                      return (
                        <article
                          key={message.id}
                          className={[
                            styles['agent-chat__message'],
                            styles['agent-chat__message--agent'],
                          ].join(' ')}
                        >
                          <div
                            className={[
                              styles['agent-chat__message-avatar'],
                              isIntro
                                ? styles[
                                    `agent-chat__message-avatar--${avatarPhase}`
                                  ]
                                : styles['agent-chat__message-avatar--ready'],
                            ].join(' ')}
                          >
                            {isIntro && showDots ? (
                              <AgentTypingDots
                                className={styles['agent-chat__message-dots']}
                                label={`${agent.name} is thinking`}
                              />
                            ) : null}
                            {!isIntro || showAvatar ? (
                              <button
                                type="button"
                                className={
                                  styles['agent-chat__message-avatar-button']
                                }
                                aria-label={`View ${agent.name} profile`}
                                onClick={(event) => {
                                  setProfileTarget(
                                    profileAnchorFromEvent(
                                      profileAgentFromChat(agent, customAgents),
                                      event,
                                    ),
                                  );
                                }}
                              >
                                <AgentAvatar
                                  className={
                                    styles['agent-chat__message-avatar-face']
                                  }
                                  shape={agent.shape}
                                  color={agent.color}
                                  size="sm"
                                  eyes
                                  shadow={false}
                                  imageSrc={agent.customImageSrc}
                                />
                              </button>
                            ) : null}
                          </div>
                          {!isIntro || showBubble ? (
                            <div
                              className={[
                                styles['agent-chat__message-bubble'],
                                enterBubble
                                  ? styles['agent-chat__message-bubble--enter']
                                  : '',
                              ]
                                .filter(Boolean)
                                .join(' ')}
                            >
                              <div className={styles['agent-chat__message-meta']}>
                                <span className={styles['agent-chat__message-name']}>
                                  {agent.name}
                                </span>
                                <time className={styles['agent-chat__message-time']}>
                                  {message.timestamp}
                                </time>
                              </div>
                              <div className={styles['agent-chat__message-body']}>
                                {message.title ? (
                                  <div
                                    className={styles['agent-chat__message-copy']}
                                  >
                                    <h2
                                      className={
                                        styles['agent-chat__message-title']
                                      }
                                    >
                                      {message.title}
                                    </h2>
                                    {paragraphs.map((paragraph, pIndex) => (
                                      <p key={pIndex}>{paragraph}</p>
                                    ))}
                                  </div>
                                ) : (
                                  paragraphs.map((paragraph, pIndex) => (
                                    <p key={pIndex}>{paragraph}</p>
                                  ))
                                )}
                                {message.toolOptions?.length &&
                                (!playAutomationIntro || toolPostReady) ? (
                                  <AgentToolConnectCard
                                    options={message.toolOptions}
                                    selectedId={activeSession?.selectedToolId}
                                    ariaLabel={
                                      message.id === AGENT_AUTOMATION_PROMPT_ID
                                        ? 'Automated task types'
                                        : undefined
                                    }
                                    onSelect={(option) =>
                                      selectAttachmentOption(message.id, option)
                                    }
                                  />
                                ) : null}
                                {message.authCard ? (
                                  <AgentToolAuthCard
                                    card={message.authCard}
                                    onConnected={completeToolAuth}
                                  />
                                ) : null}
                                {message.playbookCard ? (
                                  <AgentPlaybookCard
                                    card={message.playbookCard}
                                    onOpen={() => setPlaybookRhsOpen(true)}
                                  />
                                ) : null}
                              </div>
                            </div>
                          ) : null}
                        </article>
                      );
                    })}
                    {(statusLabel || doneLabel) ? (
                      <div
                        className={[
                          styles['agent-chat__status'],
                          doneLabel ? styles['agent-chat__status--done'] : '',
                        ].filter(Boolean).join(' ')}
                        role="status"
                        aria-live="polite"
                      >
                        {doneLabel ? (
                          <Icon glyph={<CheckCircleOutlineIcon />} size="12" />
                        ) : (
                          <Spinner size={12} aria-label={statusLabel!} />
                        )}
                        <span className={styles['agent-chat__status-label']}>
                          {doneLabel ?? statusLabel}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </Scrollbar>
              </div>

              {composer}
            </>
          )}
        </section>

        {playbookRhsRendered ? (
          <div
            className={[
              styles['agent-chat__rhs'],
              playbookRhsExiting ? styles['agent-chat__rhs--exiting'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <RightSidebar
              header={
                <AgentPlaybookRhsHeader
                  onClose={() => setPlaybookRhsOpen(false)}
                  onSave={savePlaybookDraft}
                />
              }
            >
              <AgentPlaybookPreview draft={INCIDENT_RESPONSE_PLAYBOOK_DRAFT} />
            </RightSidebar>
          </div>
        ) : null}
      </div>

      {optionsRendered && optionsAnchor
        ? createPortal(
            <div
              ref={optionsMenuRef}
              className={[
                styles['agent-chat__options-menu'],
                optionsExiting
                  ? styles['agent-chat__options-menu--exiting']
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{
                top: optionsAnchor.bottom + 4,
                left: Math.min(
                  Math.max(8, optionsAnchor.left),
                  window.innerWidth - OPTIONS_MENU_WIDTH - 8,
                ),
                width: OPTIONS_MENU_WIDTH,
              }}
              role="menu"
              aria-label={`${agent.name} options`}
            >
              <PopoverMenu>
                <PopoverMenuGroup>
                  <MenuItem
                    role="menuitem"
                    label="Agent settings"
                    leadingVisual={
                      <Icon glyph={<SettingsOutlineIcon />} size="16" />
                    }
                    onClick={() => {
                      closeOptionsMenu();
                      setSettingsOpen(true);
                    }}
                  />
                  <MenuItem
                    role="menuitem"
                    label="New agent automation"
                    leadingVisual={
                      <Icon glyph={<LightningBoltOutlineIcon />} size="16" />
                    }
                    onClick={startNewAutomation}
                  />
                  <MenuItem
                    role="menuitem"
                    label="Make template"
                    leadingVisual={
                      <Icon glyph={<ContentCopyIcon />} size="16" />
                    }
                    onClick={closeOptionsMenu}
                  />
                </PopoverMenuGroup>
                {!embedded && sessions.length > 0 ? (
                  <>
                    <PopoverMenuDivider />
                    <PopoverMenuGroup>
                      {sessions.map((session) => {
                        const isActive = session.id === activeSessionId;
                        return (
                          <MenuItem
                            key={session.id}
                            role="menuitem"
                            label={session.preview || 'New chat'}
                            active={isActive}
                            trailingElement={isActive}
                            leadingVisual={
                              <Icon
                                glyph={<MessageTextOutlineIcon />}
                                size="16"
                              />
                            }
                            onClick={() => {
                              closeOptionsMenu();
                              if (isActive) return;
                              setWelcomePlayed(true);
                              setAutomationIntroActive(false);
                              setDraft('');
                              setActiveSessionForAgent(agent.id, session.id);
                            }}
                          />
                        );
                      })}
                    </PopoverMenuGroup>
                  </>
                ) : null}
                {activeSessionId ? (
                  <>
                    <PopoverMenuDivider />
                    <PopoverMenuGroup>
                      <MenuItem
                        role="menuitem"
                        label="Rename chat"
                        leadingVisual={
                          <Icon glyph={<PencilOutlineIcon />} size="16" />
                        }
                        onClick={() => renameSession(activeSessionId)}
                      />
                      <MenuItem
                        role="menuitem"
                        label="Archive chat"
                        destructive
                        leadingVisual={
                          <Icon glyph={<ArchiveOutlineIcon />} size="16" />
                        }
                        onClick={() => archiveSession(activeSessionId)}
                      />
                    </PopoverMenuGroup>
                  </>
                ) : null}
                {agent.id !== MATTY.id ? (
                  <>
                    <PopoverMenuDivider />
                    <PopoverMenuGroup>
                      <MenuItem
                        role="menuitem"
                        label="Archive agent"
                        destructive
                        leadingVisual={
                          <Icon glyph={<ArchiveOutlineIcon />} size="16" />
                        }
                        onClick={closeOptionsMenu}
                      />
                    </PopoverMenuGroup>
                  </>
                ) : null}
              </PopoverMenu>
            </div>,
            document.body,
          )
        : null}

      <AgentSettingsModal
        open={settingsOpen}
        agent={agent}
        initialTab={settingsTab}
        onClose={() => {
          setSettingsOpen(false);
          if (searchParams.get('settings') || searchParams.get('tab')) {
            setSearchParams(
              (prev) => {
                const next = new URLSearchParams(prev);
                next.delete('settings');
                next.delete('tab');
                return next;
              },
              { replace: true },
            );
          }
        }}
        onSave={(updates) => {
          updateAgent(agent.id, updates);
        }}
      />
      {!isGroupChat ? (
        <AgentComputerPip
          open={computerOpen}
          fullscreen={computerFullscreen}
          anchorRect={computerAnchor}
          agentName={agent.name}
          shape={agent.shape}
          color={agent.color}
          imageSrc={agent.customImageSrc}
          onClose={() => {
            setComputerOpen(false);
            setComputerFullscreen(false);
            setComputerAnchor(null);
          }}
          onToggleFullscreen={() =>
            setComputerFullscreen((prev) => !prev)
          }
        />
      ) : null}
      <AgentProfilePopover
        target={profileTarget}
        onClose={() => setProfileTarget(null)}
      />
    </div>
  );
}
