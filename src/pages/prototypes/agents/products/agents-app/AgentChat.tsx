import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useSearchParams } from 'react-router-dom';
import ArchiveOutlineIcon from '@mattermost/compass-icons/components/archive-outline';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ContentCopyIcon from '@mattermost/compass-icons/components/content-copy';
import LightningBoltOutlineIcon from '@mattermost/compass-icons/components/lightning-bolt-outline';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import SendOutlineIcon from '@mattermost/compass-icons/components/send-outline';
import SettingsOutlineIcon from '@mattermost/compass-icons/components/settings-outline';
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
import { useExitAnimation } from '@/hooks/useExitAnimation';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import {
  AGENT_AUTOMATION_CONFIRM_ID,
  AGENT_AUTOMATION_PROMPT_ID,
  MATTY,
  MATTY_TOOL_AUTH_ID,
  MATTY_TOOL_CONNECTED_ID,
  MATTY_TOOL_CONNECT_CONFIRM_ID,
  MATTY_TOOL_CONNECT_MESSAGE,
  VIEWER,
  buildAgentAutomationConfirm,
  buildAgentAutomationMessage,
  buildMattyToolAuthMessage,
  buildMattyToolConnectedMessage,
  buildMattyToolConnectConfirm,
  buildWorkspaceDirectory,
  isAgentGroupChatId,
  resolveAgentProfile,
  type AgentProfile,
  type AgentToolConnectOption,
  type LiveAgentSession,
  type LiveSessionMessage,
  type WorkspaceAgent,
} from '../../agentsData';
import AgentAvatar from '../../components/AgentAvatar';
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
const OPTIONS_MENU_WIDTH = 240;
/** Brief beat after the welcome stream before the tool-choice post. */
const TOOL_POST_DELAY_MS = 280;
/** Dwell time for each post-confirm tool-connect status line. */
const TOOL_CONNECT_STATUS_MS = 1100;

const TOOL_CONNECT_STATUS_LABELS = [
  'Thinking…',
  'Checking connected tools…',
  'Connecting to provider…',
] as const;

type ToolConnectPhase = 'idle' | 'streaming' | 'status' | 'done';

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
 */
export default function AgentChat() {
  const { agentId } = useParams<{ agentId: string }>();
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
  const tabParam = searchParams.get('tab');
  const settingsTab: SettingsTab = AGENT_SETTINGS_TABS.includes(
    tabParam as SettingsTab,
  )
    ? (tabParam as SettingsTab)
    : 'info';

  const sessions = sessionsByAgentId[agent.id] ?? [];
  const activeSessionId = activeSessionByAgentId[agent.id] ?? '';
  const [draft, setDraft] = useState('');
  const [welcomePlayed, setWelcomePlayed] = useState(false);
  /** One-shot loading + stream for sessions seeded by New agent automation. */
  const [automationIntroActive, setAutomationIntroActive] = useState(false);
  /** Matty tool-connect: stream confirm → status steps → auth card. */
  const [toolConnectPhase, setToolConnectPhase] =
    useState<ToolConnectPhase>('idle');
  const [toolConnectStatusIndex, setToolConnectStatusIndex] = useState(0);
  const [pendingToolOption, setPendingToolOption] =
    useState<AgentToolConnectOption | null>(null);
  const [toolPostReady, setToolPostReady] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [optionsAnchor, setOptionsAnchor] = useState<DOMRect | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(settingsParam);
  const optionsButtonRef = useRef<HTMLButtonElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const skipOptionsOutsideCloseRef = useRef(false);
  const { rendered: optionsRendered, exiting: optionsExiting } =
    useExitAnimation(optionsOpen, OPTIONS_MENU_EXIT_MS);

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
  const emptySubtitle = toFirstPersonAgentBlurb(
    agent.description?.trim() || agent.purpose?.trim() || '',
  );
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
  const toolConnectStatusLabel =
    toolConnectPhase === 'status'
      ? TOOL_CONNECT_STATUS_LABELS[toolConnectStatusIndex]
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

  useEffect(() => {
    setDraft('');
    setWelcomePlayed(false);
    setAutomationIntroActive(false);
    setToolConnectPhase('idle');
    setToolConnectStatusIndex(0);
    setPendingToolOption(null);
    setToolPostReady(false);
    setOptionsOpen(false);
    setSettingsOpen(settingsParam);
  }, [agent.id]);

  useEffect(() => {
    if (settingsParam) {
      setSettingsOpen(true);
    }
  }, [settingsParam]);

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

  const sendDraft = () => {
    const text = draft.trim();
    if (!text) return;

    const message: LiveSessionMessage = {
      id: nextId('msg'),
      role: 'user',
      timestamp: formatChatTime(),
      paragraphs: [text],
    };

    let targetId = activeSession?.id;
    if (!targetId) {
      const created: LiveAgentSession = {
        id: nextId('chat'),
        preview: text,
        messages: [message],
      };
      updateSessionsForAgent(agent.id, (prev) => [created, ...prev]);
      setActiveSessionForAgent(agent.id, created.id);
      setDraft('');
      return;
    }

    updateSessionsForAgent(agent.id, (prev) =>
      prev.map((session) => {
        if (session.id !== targetId) return session;
        return {
          ...session,
          preview: text,
          messages: [...session.messages, message],
        };
      }),
    );
    setDraft('');
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

  const composer = (
    <div className={styles['agent-chat__composer']}>
      <div className={styles['agent-chat__input']}>
        <button
          type="button"
          className={styles['agent-chat__input-plus']}
          aria-label="Add attachment"
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
          disabled={!draft.trim()}
          onClick={sendDraft}
        >
          <Icon glyph={<SendOutlineIcon />} size="16" />
        </button>
      </div>
    </div>
  );

  return (
    <div className={styles['agent-chat']}>
      <AgentsProductSidebar activeNav={agent.id} />

      <div className={styles['agent-chat__workspace']}>
        <section
          className={[
            styles['agent-chat__canvas'],
            isEmptyChat ? styles['agent-chat__canvas--empty'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-label={`Chat with ${agent.name}`}
        >
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
                              </div>
                            </div>
                          </article>
                        );
                      }

                      const isIntro = playIntro && index === 0;
                      const isConfirm =
                        message.id === MATTY_TOOL_CONNECT_CONFIRM_ID;
                      const isToolPost =
                        playWelcomeIntro &&
                        message.id === MATTY_TOOL_CONNECT_MESSAGE.id;
                      const enterBubble =
                        isIntro ||
                        isToolPost ||
                        (isConfirm && playConfirmStream) ||
                        (message.id === MATTY_TOOL_AUTH_ID &&
                          toolConnectPhase === 'done') ||
                        message.id === MATTY_TOOL_CONNECTED_ID;
                      const paragraphs = isIntro
                        ? streamedParagraphs
                        : isConfirm && playConfirmStream
                          ? streamedConfirmParagraphs
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
                              </div>
                            </div>
                          ) : null}
                        </article>
                      );
                    })}
                    {toolConnectStatusLabel ? (
                      <div
                        className={styles['agent-chat__status']}
                        role="status"
                        aria-live="polite"
                      >
                        <Spinner
                          size={12}
                          aria-label={toolConnectStatusLabel}
                        />
                        <span className={styles['agent-chat__status-label']}>
                          {toolConnectStatusLabel}
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
      <AgentProfilePopover
        target={profileTarget}
        onClose={() => setProfileTarget(null)}
      />
    </div>
  );
}
