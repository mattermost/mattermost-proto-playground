import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useSearchParams } from 'react-router-dom';
import ArchiveOutlineIcon from '@mattermost/compass-icons/components/archive-outline';
import ContentCopyIcon from '@mattermost/compass-icons/components/content-copy';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import LightningBoltOutlineIcon from '@mattermost/compass-icons/components/lightning-bolt-outline';
import MessageTextOutlineIcon from '@mattermost/compass-icons/components/message-text-outline';
import OpenInNewIcon from '@mattermost/compass-icons/components/open-in-new';
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
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import { useExitAnimation } from '@/hooks/useExitAnimation';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import {
  AGENT_AUTOMATION_CONFIRM_ID,
  AGENT_AUTOMATION_PROMPT_ID,
  MATTY,
  MATTY_TOOL_CONNECT_CONFIRM_ID,
  MATTY_TOOL_CONNECT_MESSAGE,
  VIEWER,
  buildAgentAutomationConfirm,
  buildAgentAutomationMessage,
  buildAgentChatSessions,
  buildAgentWelcomeMessage,
  buildMattyToolConnectConfirm,
  isAgentGroupChatId,
  resolveAgentProfile,
  type AgentChatMessage,
  type AgentChatSession,
  type AgentProfile,
  type AgentToolConnectOption,
} from '../../agentsData';
import AgentAvatar from '../../components/AgentAvatar';
import AgentSettingsModal, {
  AGENT_SETTINGS_TABS,
  type SettingsTab,
} from '../../components/AgentSettingsModal';
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
const SESSION_MENU_WIDTH = 220;
/** Brief beat after the welcome stream before the tool-choice post. */
const TOOL_POST_DELAY_MS = 280;

type AvatarRevealPhase = 'loading' | 'revealing' | 'ready';

type SessionMessage = AgentChatMessage & {
  role: 'agent' | 'user';
};

type LiveSession = AgentChatSession & {
  messages: SessionMessage[];
  selectedToolId?: string;
};

function nextId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function formatChatTime(date = new Date()) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function seedWelcomeMessages(agent: AgentProfile): SessionMessage[] {
  const welcome: SessionMessage = {
    ...buildAgentWelcomeMessage(agent),
    role: 'agent',
  };
  if (agent.id !== MATTY.id) {
    return [welcome];
  }
  return [welcome, { ...MATTY_TOOL_CONNECT_MESSAGE, role: 'agent' }];
}

function seedAgentSessions(agent: AgentProfile): LiveSession[] {
  return buildAgentChatSessions(agent).map((session) => ({
    ...session,
    messages: session.id === 'welcome' ? seedWelcomeMessages(agent) : [],
  }));
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
 * Agent chat layout (Figma 71:102213) — session list + message canvas.
 * Supports Matty and agents created via the New Agent modal.
 */
export default function AgentChat() {
  const { agentId } = useParams<{ agentId: string }>();
  const { customAgents, groupChats, updateAgent, rememberOpenedAgent } =
    useAgents();
  const agent = useMemo(
    () => resolveAgentProfile(agentId, customAgents, groupChats),
    [agentId, customAgents, groupChats],
  );
  // Group chats use id prefix + memberIds; hide the single AgentAvatar in the header.
  const isGroupChat =
    isAgentGroupChatId(agent.id) || Boolean(agent.memberIds?.length);

  useEffect(() => {
    rememberOpenedAgent(agent.id);
  }, [agent.id, rememberOpenedAgent]);

  const [searchParams, setSearchParams] = useSearchParams();
  const settingsParam = searchParams.get('settings') === 'true';
  const tabParam = searchParams.get('tab');
  const settingsTab: SettingsTab = AGENT_SETTINGS_TABS.includes(
    tabParam as SettingsTab,
  )
    ? (tabParam as SettingsTab)
    : 'info';

  const [sessions, setSessions] = useState<LiveSession[]>(() =>
    seedAgentSessions(agent),
  );
  const [activeSessionId, setActiveSessionId] = useState(
    () => seedAgentSessions(agent)[0]?.id ?? '',
  );
  const [draft, setDraft] = useState('');
  const [welcomePlayed, setWelcomePlayed] = useState(false);
  /** One-shot loading + stream for sessions seeded by New agent automation. */
  const [automationIntroActive, setAutomationIntroActive] = useState(false);
  const [toolPostReady, setToolPostReady] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [optionsAnchor, setOptionsAnchor] = useState<DOMRect | null>(null);
  const [sessionMenuId, setSessionMenuId] = useState<string | null>(null);
  const [sessionMenuAnchor, setSessionMenuAnchor] = useState<DOMRect | null>(
    null,
  );
  const [settingsOpen, setSettingsOpen] = useState(settingsParam);
  const optionsButtonRef = useRef<HTMLDivElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const sessionMenuRef = useRef<HTMLDivElement>(null);
  const skipOptionsOutsideCloseRef = useRef(false);
  const skipSessionOutsideCloseRef = useRef(false);
  const { rendered: optionsRendered, exiting: optionsExiting } =
    useExitAnimation(optionsOpen, OPTIONS_MENU_EXIT_MS);
  const sessionMenuOpen = sessionMenuId !== null;
  const { rendered: sessionMenuRendered, exiting: sessionMenuExiting } =
    useExitAnimation(sessionMenuOpen, OPTIONS_MENU_EXIT_MS);

  useOutsideClose(optionsMenuRef, optionsOpen && !optionsExiting, () => {
    if (skipOptionsOutsideCloseRef.current) {
      skipOptionsOutsideCloseRef.current = false;
      return;
    }
    setOptionsOpen(false);
  });

  useOutsideClose(
    sessionMenuRef,
    sessionMenuOpen && !sessionMenuExiting,
    () => {
      if (skipSessionOutsideCloseRef.current) {
        skipSessionOutsideCloseRef.current = false;
        return;
      }
      setSessionMenuId(null);
    },
  );

  const activeSession =
    sessions.find((session) => session.id === activeSessionId) ??
    sessions[0];
  const playWelcomeIntro =
    activeSession?.id === 'welcome' && !welcomePlayed;
  const playAutomationIntro =
    automationIntroActive &&
    activeSession?.messages[0]?.id === AGENT_AUTOMATION_PROMPT_ID;
  /** Shared dots → avatar → stream path for welcome and automation seed. */
  const playIntro = playWelcomeIntro || playAutomationIntro;
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
    const seeded = seedAgentSessions(agent);
    setSessions(seeded);
    setActiveSessionId(seeded[0]?.id ?? '');
    setDraft('');
    setWelcomePlayed(false);
    setAutomationIntroActive(false);
    setToolPostReady(false);
    setOptionsOpen(false);
    setSessionMenuId(null);
    setSettingsOpen(settingsParam);
  }, [agent.id]);

  useEffect(() => {
    if (settingsParam) {
      setSettingsOpen(true);
    }
  }, [settingsParam]);

  useEffect(() => {
    if (!optionsOpen && !sessionMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOptionsOpen(false);
        setSessionMenuId(null);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [optionsOpen, sessionMenuOpen]);

  const openOptionsMenu = () => {
    setSessionMenuId(null);
    const rect =
      optionsButtonRef.current?.getBoundingClientRect() ?? null;
    setOptionsAnchor(rect);
    setOptionsOpen((prev) => !prev);
  };

  const closeOptionsMenu = () => setOptionsOpen(false);

  const closeSessionMenu = () => setSessionMenuId(null);

  const openSessionMenu = (
    sessionId: string,
    anchorEl: HTMLElement,
  ) => {
    setOptionsOpen(false);
    setSessionMenuAnchor(anchorEl.getBoundingClientRect());
    setSessionMenuId((prev) => (prev === sessionId ? null : sessionId));
  };

  const selectSession = (id: string) => {
    if (id !== 'welcome') {
      setWelcomePlayed(true);
    }
    setAutomationIntroActive(false);
    setActiveSessionId(id);
    setDraft('');
    setSessionMenuId(null);
  };

  const renameSession = (sessionId: string) => {
    const session = sessions.find((item) => item.id === sessionId);
    if (!session) {
      return;
    }
    const next = window.prompt('Rename chat', session.preview);
    closeSessionMenu();
    if (next === null) {
      return;
    }
    const trimmed = next.trim();
    if (!trimmed || trimmed === session.preview) {
      return;
    }
    setSessions((prev) =>
      prev.map((item) =>
        item.id === sessionId ? { ...item, preview: trimmed } : item,
      ),
    );
  };

  const archiveSession = (sessionId: string) => {
    closeSessionMenu();
    setSessions((prev) => {
      const next = prev.filter((item) => item.id !== sessionId);
      if (activeSessionId !== sessionId) {
        return next;
      }
      const fallback = next[0];
      if (fallback) {
        setActiveSessionId(fallback.id);
        if (fallback.id !== 'welcome') {
          setWelcomePlayed(true);
        }
        setAutomationIntroActive(false);
        setDraft('');
        return next;
      }
      const created: LiveSession = {
        id: nextId('chat'),
        preview: 'New chat',
        messages: [],
      };
      setActiveSessionId(created.id);
      setWelcomePlayed(true);
      setAutomationIntroActive(false);
      setDraft('');
      return [created];
    });
  };

  const startNewChat = () => {
    setWelcomePlayed(true);
    setAutomationIntroActive(false);
    setDraft('');
    setOptionsOpen(false);
    setSessionMenuId(null);
    const empty = sessions.find((session) => session.messages.length === 0);
    if (empty) {
      setActiveSessionId(empty.id);
      return;
    }
    const created: LiveSession = {
      id: nextId('chat'),
      preview: 'New chat',
      messages: [],
    };
    setSessions((prev) => [created, ...prev]);
    setActiveSessionId(created.id);
  };

  const startNewAutomation = () => {
    setWelcomePlayed(true);
    setDraft('');
    setOptionsOpen(false);
    setToolPostReady(false);
    const prompt: SessionMessage = {
      ...buildAgentAutomationMessage(formatChatTime()),
      role: 'agent',
    };
    const empty = sessions.find((session) => session.messages.length === 0);
    if (empty) {
      setSessions((prev) =>
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
      setActiveSessionId(empty.id);
      setAutomationIntroActive(true);
      return;
    }
    const created: LiveSession = {
      id: nextId('chat'),
      preview: 'New agent automation',
      messages: [prompt],
    };
    setSessions((prev) => [created, ...prev]);
    setActiveSessionId(created.id);
    setAutomationIntroActive(true);
  };

  const sendDraft = () => {
    const text = draft.trim();
    if (!text) return;

    const message: SessionMessage = {
      id: nextId('msg'),
      role: 'user',
      timestamp: formatChatTime(),
      paragraphs: [text],
    };

    let targetId = activeSession?.id;
    if (!targetId) {
      const created: LiveSession = {
        id: nextId('chat'),
        preview: text,
        messages: [message],
      };
      setSessions((prev) => [created, ...prev]);
      setActiveSessionId(created.id);
      setDraft('');
      return;
    }

    setSessions((prev) =>
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
    const confirmMessage = isAutomation
      ? buildAgentAutomationConfirm(option.id, option.label, formatChatTime())
      : buildMattyToolConnectConfirm(option.label, formatChatTime());

    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== sessionId) return session;
        const withoutConfirm = session.messages.filter(
          (message) => message.id !== confirmId,
        );
        const confirm: SessionMessage = {
          ...confirmMessage,
          role: 'agent',
        };
        return {
          ...session,
          selectedToolId: option.id,
          messages: [...withoutConfirm, confirm],
        };
      }),
    );
  };

  return (
    <div className={styles['agent-chat']}>
      <AgentsProductSidebar activeNav={agent.id} />

      <div className={styles['agent-chat__workspace']}>
        <aside
          className={styles['agent-chat__sessions']}
          aria-label={`${agent.name} chats`}
        >
          <header className={styles['agent-chat__sessions-header']}>
            <div className={styles['agent-chat__sessions-title']}>
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
              <h1 className={styles['agent-chat__sessions-name']}>
                {agent.name}
              </h1>
            </div>
            <div
              ref={optionsButtonRef}
              className={styles['agent-chat__options-trigger']}
              onMouseDown={() => {
                if (optionsOpen) {
                  skipOptionsOutsideCloseRef.current = true;
                }
              }}
            >
              <IconButton
                size="small"
                padding="compact"
                icon={<Icon glyph={<DotsHorizontalIcon />} size="16" />}
                aria-label={`${agent.name} options`}
                aria-haspopup="menu"
                aria-expanded={optionsOpen}
                onClick={openOptionsMenu}
              />
            </div>
          </header>

          <div className={styles['agent-chat__sessions-list']}>
            {sessions.map((session) => {
              const menuOpen = sessionMenuId === session.id;
              return (
                <div
                  key={session.id}
                  className={[
                    styles['agent-chat__session-row'],
                    menuOpen
                      ? styles['agent-chat__session-row--menu-open']
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <MenuItem
                    className={styles['agent-chat__session-item']}
                    label={session.preview}
                    active={session.id === activeSessionId}
                    leadingVisual={
                      <Icon glyph={<MessageTextOutlineIcon />} size="16" />
                    }
                    onClick={() => selectSession(session.id)}
                  />
                  <div
                    className={styles['agent-chat__session-more']}
                    onMouseDown={() => {
                      if (sessionMenuId === session.id) {
                        skipSessionOutsideCloseRef.current = true;
                      }
                    }}
                  >
                    <IconButton
                      size="x-small"
                      padding="compact"
                      icon={<Icon glyph={<DotsHorizontalIcon />} size="16" />}
                      aria-label={`${session.preview} options`}
                      aria-haspopup="menu"
                      aria-expanded={menuOpen}
                      onClick={(event) => {
                        event.stopPropagation();
                        openSessionMenu(
                          session.id,
                          event.currentTarget,
                        );
                      }}
                    />
                  </div>
                </div>
              );
            })}
            <MenuItem
              className={styles['agent-chat__session-item']}
              label="New chat"
              leadingVisual={<Icon glyph={<PlusIcon />} size="16" />}
              onClick={startNewChat}
            />
          </div>
        </aside>

        <section
          className={styles['agent-chat__canvas']}
          aria-label={`Chat with ${agent.name}`}
        >
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
                        className={styles['agent-chat__message']}
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
                  const isToolPost =
                    playWelcomeIntro &&
                    message.id === MATTY_TOOL_CONNECT_MESSAGE.id;
                  const enterBubble =
                    isIntro ||
                    isToolPost ||
                    (playWelcomeIntro &&
                      message.id === MATTY_TOOL_CONNECT_CONFIRM_ID);
                  const paragraphs = isIntro
                    ? streamedParagraphs
                    : message.paragraphs;

                  return (
                    <article
                      key={message.id}
                      className={styles['agent-chat__message']}
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
                          <AgentAvatar
                            className={styles['agent-chat__message-avatar-face']}
                            shape={agent.shape}
                            color={agent.color}
                            size="sm"
                            eyes
                            shadow={false}
                            imageSrc={agent.customImageSrc}
                          />
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
                          </div>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </Scrollbar>
          </div>

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
                left: Math.max(
                  8,
                  optionsAnchor.right - OPTIONS_MENU_WIDTH,
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

      {sessionMenuRendered && sessionMenuAnchor && sessionMenuId
        ? createPortal(
            <div
              ref={sessionMenuRef}
              className={[
                styles['agent-chat__options-menu'],
                sessionMenuExiting
                  ? styles['agent-chat__options-menu--exiting']
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{
                top: sessionMenuAnchor.bottom + 4,
                left: Math.max(
                  8,
                  sessionMenuAnchor.right - SESSION_MENU_WIDTH,
                ),
                width: SESSION_MENU_WIDTH,
              }}
              role="menu"
              aria-label="Chat options"
            >
              <PopoverMenu>
                <PopoverMenuGroup>
                  <MenuItem
                    role="menuitem"
                    label="Open in new window"
                    leadingVisual={
                      <Icon glyph={<OpenInNewIcon />} size="16" />
                    }
                    onClick={() => {
                      closeSessionMenu();
                      window.open(window.location.href, '_blank');
                    }}
                  />
                  <MenuItem
                    role="menuitem"
                    label="Rename chat"
                    leadingVisual={
                      <Icon glyph={<PencilOutlineIcon />} size="16" />
                    }
                    onClick={() => renameSession(sessionMenuId)}
                  />
                </PopoverMenuGroup>
                <PopoverMenuDivider />
                <PopoverMenuGroup>
                  <MenuItem
                    role="menuitem"
                    label="Archive chat"
                    destructive
                    leadingVisual={
                      <Icon glyph={<ArchiveOutlineIcon />} size="16" />
                    }
                    onClick={() => archiveSession(sessionMenuId)}
                  />
                </PopoverMenuGroup>
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
    </div>
  );
}
