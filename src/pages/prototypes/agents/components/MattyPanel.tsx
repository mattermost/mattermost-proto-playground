import AiSummarizeIcon from '@mattermost/compass-icons/components/ai-summarize';
import CheckCircleOutlineIcon from '@mattermost/compass-icons/components/check-circle-outline';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import CloseIcon from '@mattermost/compass-icons/components/close';
import LockIcon from '@mattermost/compass-icons/components/lock';
import MagnifyIcon from '@mattermost/compass-icons/components/magnify';
import PencilOutlineIcon from '@mattermost/compass-icons/components/pencil-outline';
import MessagePlusOutlineIcon from '@mattermost/compass-icons/components/message-plus-outline';
import ProductPlaybooksIcon from '@mattermost/compass-icons/components/product-playbooks';
import SendOutlineIcon from '@mattermost/compass-icons/components/send-outline';
import { Button } from '@mattermost/compass-ui/components/button';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { Spinner } from '@mattermost/compass-ui/components/spinner';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AGENTS_BASE } from '../agentsScenes';
import {
  EMPTY_CHAT_TITLES,
  MATTY,
  resolveSingleAgentProfile,
  type LiveAgentSession,
  type ChannelLinkCardData,
  type LiveSessionMessage,
} from '../agentsData';
import { useAgents } from '../context/AgentsContext';
import AgentAvatar from './AgentAvatar';
import ChannelLinkCard from './ChannelLinkCard';
import ChatActionsMenu from './ChatActionsMenu';
import {
  CHANNEL_FLOW_START,
  CHANNEL_FLOW_TRIGGER,
  advanceChannelFlow,
  buildChannelCard,
  buildChannelToolSteps,
  type ChannelDraft,
  type ChannelFlowState,
} from './mattyChannelFlow';
import styles from './MattyPanel.module.scss';

const STREAM_MS_PER_WORD = 50;

const SUGGESTIONS = [
  { label: 'Search for anything', icon: <MagnifyIcon /> },
  { label: 'Summarize this channel', icon: <AiSummarizeIcon /> },
  { label: 'Create a new channel', icon: <MessagePlusOutlineIcon /> },
  { label: 'Start a playbook here', icon: <ProductPlaybooksIcon /> },
  { label: 'Help draft a message in this channel', icon: <PencilOutlineIcon /> },
];

function useStreamedText(text: string, enabled: boolean): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const [count, setCount] = useState(enabled ? 0 : words.length);

  useEffect(() => {
    if (!enabled) {
      setCount(words.length);
      return;
    }
    setCount(0);
    if (!words.length) return;
    let c = 0;
    const id = window.setInterval(() => {
      c += 1;
      setCount(c);
      if (c >= words.length) window.clearInterval(id);
    }, STREAM_MS_PER_WORD);
    return () => window.clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, enabled, words.length]);

  return words.slice(0, count).join(' ');
}

function MattyMessage({
  message,
  stream,
  children,
}: {
  message: ChatMessage;
  stream: boolean;
  children?: ReactNode;
}) {
  const displayText = useStreamedText(message.text, stream);
  return (
    <article
      className={[
        styles['matty-panel__msg'],
        message.role === 'user' ? styles['matty-panel__msg--user'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles['matty-panel__msg-bubble']}>
        <div className={styles['matty-panel__msg-meta']}>
          <span className={styles['matty-panel__msg-name']}>
            {message.role === 'matty' ? 'Matty' : 'Priya'}
          </span>
          <time className={styles['matty-panel__msg-time']}>{message.timestamp}</time>
        </div>
        <div className={styles['matty-panel__msg-body']}>
          <p>{displayText}</p>
        </div>
        {children}
      </div>
    </article>
  );
}

type MattyContext = {
  placeLabel: string;
  greeting: string;
};

function resolveContext(pathname: string, basePath: string): MattyContext {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  if (normalized.startsWith(`${basePath}/channel/`)) {
    const channelId = normalized.replace(`${basePath}/channel/`, '');
    return {
      placeLabel: channelId,
      greeting: `You're in ${channelId}. Want me to coordinate the response, summarize where things stand, or loop in another agent?`,
    };
  }

  if (normalized.startsWith(`${basePath}/dm/`)) {
    return {
      placeLabel: 'Direct message',
      greeting: `Want me to loop in another agent, start a group chat, or help with something else?`,
    };
  }

  if (normalized.startsWith(`${basePath}/agents`)) {
    return {
      placeLabel: 'Agents',
      greeting: `You're in the Agents view — looking to build something new or adjust your team setup?`,
    };
  }

  return {
    placeLabel: 'service-status',
    greeting: `Hey Priya — you're in service-status. I can set up an agent, start a playbook, or help coordinate the team.`,
  };
}

type ChatMessage = {
  id: string;
  role: 'matty' | 'user';
  text: string;
  timestamp: string;
};

function randomTitle() {
  return EMPTY_CHAT_TITLES[Math.floor(Math.random() * EMPTY_CHAT_TITLES.length)];
}

function nowLabel() {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

type MessageExtras = {
  quickReplies?: string[];
  card?: ChannelLinkCardData;
};

type ToolRun = {
  messageId: string;
  sessionId: string;
  draft: ChannelDraft;
  steps: string[];
  progress: number;
  finished: boolean;
};

// The channel appears in the LHS once the "Creating channel" step completes.
const CHANNEL_CREATED_AT_STEP = 2;
const TOOL_STEP_MS = 900;
const TOOL_FINISH_MS = 500;

function toChatMessage(message: LiveSessionMessage): ChatMessage {
  return {
    id: message.id,
    role: message.role === 'user' ? 'user' : 'matty',
    text: message.paragraphs.join('\n\n'),
    timestamp: message.timestamp,
  };
}

function nextMessageId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function MattyPanel({
  basePath = AGENTS_BASE,
  focusId,
}: { basePath?: string; focusId?: string } = {}) {
  const {
    mattyPanelOpen,
    setMattyPanelOpen,
    customAgents,
    sessionsByAgentId,
    ensureAgentSessions,
    updateSessionsForAgent,
    setActiveSessionForAgent,
    rememberOpenedAgent,
    addCreatedChannel,
    archiveSession,
  } = useAgents();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const ctx = useMemo(() => resolveContext(pathname, basePath), [pathname, basePath]);

  // The panel chat is a real Matty DM session; null until the first message.
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [emptyTitle, setEmptyTitle] = useState(randomTitle);
  const prevOpenRef = useRef(false);
  const prevPathnameRef = useRef(pathname);
  const bottomRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<ChannelFlowState | null>(null);
  const [extras, setExtras] = useState<Record<string, MessageExtras>>({});
  const [toolRun, setToolRun] = useState<ToolRun | null>(null);
  const [toolsExpanded, setToolsExpanded] = useState(false);

  const session = sessionId
    ? sessionsByAgentId[MATTY.id]?.find((item) => item.id === sessionId)
    : undefined;
  const messages = useMemo(() => (session?.messages ?? []).map(toChatMessage), [session]);
  const isEmpty = messages.length === 0;

  const addMattyMessage = (targetSessionId: string, text: string, messageExtras?: MessageExtras) => {
    const id = nextMessageId('matty');
    const message: LiveSessionMessage = {
      id,
      role: 'agent',
      timestamp: nowLabel(),
      paragraphs: [text],
    };
    updateSessionsForAgent(MATTY.id, (prev) =>
      prev.map((item) =>
        item.id === targetSessionId
          ? { ...item, messages: [...item.messages, message] }
          : item,
      ),
    );
    if (messageExtras) setExtras((prev) => ({ ...prev, [id]: messageExtras }));
    setStreamingId(id);
    return id;
  };

  const resetChannelFlow = () => {
    flowRef.current = null;
    setExtras({});
    setToolRun(null);
    setToolsExpanded(false);
  };

  const respond = (targetSessionId: string, text: string) => {
    const current = flowRef.current;
    const result = current
      ? advanceChannelFlow(current, text)
      : CHANNEL_FLOW_TRIGGER.test(text)
        ? CHANNEL_FLOW_START
        : null;

    if (!result) {
      addMattyMessage(targetSessionId, `Got it — I'll get started on that.`);
      return;
    }

    if (result.kind === 'ask') {
      flowRef.current = result.flow;
      addMattyMessage(targetSessionId, result.text, { quickReplies: result.quickReplies });
      return;
    }

    flowRef.current = null;
    const messageId = addMattyMessage(targetSessionId, result.text);
    setToolRun({
      messageId,
      sessionId: targetSessionId,
      draft: result.draft,
      steps: buildChannelToolSteps(result.draft),
      progress: 0,
      finished: false,
    });
  };

  // Step through the tool sequence, then post the channel card.
  useEffect(() => {
    if (!toolRun || toolRun.finished) return;
    const done = toolRun.progress >= toolRun.steps.length;
    const id = window.setTimeout(
      () => {
        if (!done) {
          if (toolRun.progress + 1 === CHANNEL_CREATED_AT_STEP) {
            addCreatedChannel({ ...toolRun.draft });
          }
          setToolRun({ ...toolRun, progress: toolRun.progress + 1 });
          return;
        }
        addMattyMessage(toolRun.sessionId, `Done — ${toolRun.draft.name} is ready.`, {
          card: buildChannelCard(toolRun.draft),
        });
        setToolRun({ ...toolRun, finished: true });
      },
      done ? TOOL_FINISH_MS : TOOL_STEP_MS,
    );
    return () => window.clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolRun]);

  // Start from the empty state on open; announce route changes during a chat.
  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    const prevPathname = prevPathnameRef.current;
    prevOpenRef.current = mattyPanelOpen;
    prevPathnameRef.current = pathname;

    if (!mattyPanelOpen) return;

    if (!wasOpen) {
      setSessionId(null);
      setStreamingId(null);
      setDraft('');
      setEmptyTitle(randomTitle());
      resetChannelFlow();
    } else if (prevPathname !== pathname && sessionId) {
      addMattyMessage(sessionId, ctx.greeting);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mattyPanelOpen, pathname, ctx]);

  // Scroll to bottom when a new message is added.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  const startNewChat = () => {
    setSessionId(null);
    setStreamingId(null);
    setDraft('');
    setEmptyTitle(randomTitle());
    resetChannelFlow();
  };

  const selectChat = (id: string) => {
    resetChannelFlow();
    setSessionId(id);
    setStreamingId(null);
    setDraft('');
    setActiveSessionForAgent(MATTY.id, id);
  };

  const deleteChat = () => {
    if (sessionId) archiveSession(MATTY.id, sessionId);
    startNewChat();
  };

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMessage: LiveSessionMessage = {
      id: nextMessageId('user'),
      role: 'user',
      timestamp: nowLabel(),
      paragraphs: [trimmed],
    };

    let targetId = sessionId;
    if (targetId) {
      updateSessionsForAgent(MATTY.id, (prev) =>
        prev.map((item) =>
          item.id === targetId
            ? { ...item, messages: [...item.messages, userMessage] }
            : item,
        ),
      );
    } else {
      targetId = nextMessageId('chat');
      const created: LiveAgentSession = {
        id: targetId,
        preview: trimmed,
        messages: [userMessage],
      };
      ensureAgentSessions(resolveSingleAgentProfile(MATTY.id, customAgents));
      updateSessionsForAgent(MATTY.id, (prev) => [created, ...prev]);
      setActiveSessionForAgent(MATTY.id, targetId);
      rememberOpenedAgent(MATTY.id);
      setSessionId(targetId);
    }

    setDraft('');
    const replyTarget = targetId;
    window.setTimeout(() => respond(replyTarget, trimmed), 420);
  };

  return (
    <aside
      className={[
        styles['matty-panel'],
        mattyPanelOpen ? styles['matty-panel--open'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Chat with Matty"
      aria-hidden={!mattyPanelOpen}
      data-wt-focus={focusId}
    >
      <div className={styles['matty-panel__header']}>
        <div className={styles['matty-panel__title-block']}>
          <h2 className={styles['matty-panel__title']}>Matty</h2>
          <p className={styles['matty-panel__subtitle']}>
            <span className={styles['matty-panel__subtitle-icon']}>
              <Icon glyph={<LockIcon />} size="12" />
            </span>
            Only visible to you
          </p>
        </div>
        <div className={styles['matty-panel__actions']}>
          <ChatActionsMenu
            chats={(sessionsByAgentId[MATTY.id] ?? []).map((item) => ({
              id: item.id,
              label: item.preview,
              active: item.id === sessionId,
            }))}
            onSelectChat={selectChat}
            onNewChat={startNewChat}
            onDeleteChat={deleteChat}
            onViewAllAgents={() => {
              setMattyPanelOpen(false);
              navigate(`${basePath}/agents?view=all`);
            }}
            deleteDisabled={isEmpty}
          />
          <IconButton
            aria-label="Close Matty panel"
            size="small"
            padding="compact"
            icon={<Icon size="16" glyph={<CloseIcon />} />}
            onClick={() => setMattyPanelOpen(false)}
          />
        </div>
      </div>

      {isEmpty ? (
        <div className={styles['matty-panel__empty']}>
          <div className={styles['matty-panel__empty-intro']}>
            <AgentAvatar shape="sphere" color="yellow" size="lg" eyes />
            <h3 className={styles['matty-panel__empty-title']}>{emptyTitle}</h3>
          </div>
          <div className={styles['matty-panel__suggestions']}>
            {SUGGESTIONS.map(({ label, icon }) => (
              <button
                key={label}
                type="button"
                className={styles['matty-panel__suggestion']}
                onClick={() => send(label)}
              >
                <Icon glyph={icon} size="16" />
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <Scrollbar className={styles['matty-panel__messages']}>
          <div className={styles['matty-panel__msg-list']}>
            {messages.map((m, index) => {
              const messageExtras = extras[m.id];
              const isLast = index === messages.length - 1;
              const showTools = toolRun?.messageId === m.id;
              const toolsRunning = showTools && toolRun.progress < toolRun.steps.length;
              return (
                <MattyMessage
                  key={m.id}
                  message={m}
                  stream={m.role === 'matty' && m.id === streamingId}
                >
                  {showTools ? (
                    <div className={styles['matty-panel__tools']}>
                      <button
                        type="button"
                        className={styles['matty-panel__tools-trigger']}
                        aria-expanded={toolsExpanded}
                        onClick={() => setToolsExpanded((prev) => !prev)}
                      >
                        <span
                          className={[
                            styles['matty-panel__tools-chevron'],
                            toolsExpanded ? styles['matty-panel__tools-chevron--open'] : '',
                          ].filter(Boolean).join(' ')}
                        >
                          <Icon glyph={<ChevronRightIcon />} size="12" />
                        </span>
                        <span className={styles['matty-panel__tools-label']}>
                          {toolsRunning
                            ? toolRun.steps[toolRun.progress]
                            : `Completed ${toolRun.steps.length} steps`}
                        </span>
                        {toolsRunning ? (
                          <Spinner size="12" aria-label={toolRun.steps[toolRun.progress]} />
                        ) : null}
                      </button>
                      <div
                        className={[
                          styles['matty-panel__tools-collapse'],
                          toolsExpanded ? styles['matty-panel__tools-collapse--expanded'] : '',
                        ].filter(Boolean).join(' ')}
                      >
                        <ul className={styles['matty-panel__steps']}>
                          {toolRun.steps.map((label, stepIndex) => {
                            if (stepIndex > toolRun.progress) return null;
                            const stepDone = stepIndex < toolRun.progress;
                            return (
                              <li key={label} className={styles['matty-panel__step']}>
                                {stepDone ? (
                                  <Icon glyph={<CheckCircleOutlineIcon />} size="12" />
                                ) : (
                                  <Spinner size="12" aria-label={label} />
                                )}
                                {label}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  ) : null}
                  {messageExtras?.card ? <ChannelLinkCard
                      card={messageExtras.card}
                      onOpen={() => navigate(`${basePath}/channel/${messageExtras.card!.channelName}`)}
                    /> : null}
                  {isLast && messageExtras?.quickReplies ? (
                    <div className={styles['matty-panel__quick-replies']}>
                      {messageExtras.quickReplies.map((label) => (
                        <Button
                          key={label}
                          size="x-small"
                          emphasis="tertiary"
                          onClick={() => send(label)}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  ) : null}
                </MattyMessage>
              );
            })}
            <div ref={bottomRef} />
          </div>
        </Scrollbar>
      )}

      <div className={styles['matty-panel__composer']}>
        <div className={styles['matty-panel__input']}>
          <input
            className={styles['matty-panel__input-field']}
            type="text"
            placeholder="Message Matty…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(draft);
              }
            }}
            aria-label="Message Matty"
          />
          <button
            type="button"
            className={styles['matty-panel__input-send']}
            aria-label="Send message"
            disabled={!draft.trim()}
            onClick={() => send(draft)}
          >
            <Icon glyph={<SendOutlineIcon />} size="16" />
          </button>
        </div>
      </div>
    </aside>
  );
}
