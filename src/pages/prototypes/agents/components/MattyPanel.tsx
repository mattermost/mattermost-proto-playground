import CloseIcon from '@mattermost/compass-icons/components/close';
import LockIcon from '@mattermost/compass-icons/components/lock';
import SendOutlineIcon from '@mattermost/compass-icons/components/send-outline';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AGENTS_BASE } from '../agentsScenes';
import { useAgents } from '../context/AgentsContext';
import AgentAvatar from './AgentAvatar';
import styles from './MattyPanel.module.scss';

const STREAM_MS_PER_WORD = 50;

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

function MattyMessage({ message, stream }: { message: ChatMessage; stream: boolean }) {
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
      </div>
    </article>
  );
}

type MattyContext = {
  placeLabel: string;
  greeting: string;
  suggestions: string[];
};

function resolveContext(pathname: string, basePath: string): MattyContext {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  if (normalized.startsWith(`${basePath}/channel/`)) {
    const channelId = normalized.replace(`${basePath}/channel/`, '');
    return {
      placeLabel: `#${channelId}`,
      greeting: `You're in ${channelId}. Want me to coordinate the response, summarize where things stand, or loop in another agent?`,
      suggestions: ['Summarize the incident', 'Schedule a postmortem', 'Loop in an agent'],
    };
  }

  if (normalized.startsWith(`${basePath}/dm/`)) {
    return {
      placeLabel: 'Direct message',
      greeting: `Want me to loop in another agent, start a group chat, or help with something else?`,
      suggestions: ['Start a group chat', 'Create a new agent', 'View all agents'],
    };
  }

  if (normalized.startsWith(`${basePath}/agents`)) {
    return {
      placeLabel: 'Agents',
      greeting: `You're in the Agents view — looking to build something new or adjust your team setup?`,
      suggestions: ['Create a new agent', 'Set up automation', 'Review your agents'],
    };
  }

  return {
    placeLabel: '#service-status',
    greeting: `Hey Priya — you're in #service-status. I can set up an agent, start a playbook, or help coordinate the team.`,
    suggestions: ['Set up a monitoring agent', 'Start a playbook', 'Review team roster'],
  };
}

type ChatMessage = {
  id: string;
  role: 'matty' | 'user';
  text: string;
  timestamp: string;
};

function nowLabel() {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export default function MattyPanel({ basePath = AGENTS_BASE }: { basePath?: string } = {}) {
  const { mattyPanelOpen, setMattyPanelOpen } = useAgents();
  const { pathname } = useLocation();

  const ctx = useMemo(() => resolveContext(pathname, basePath), [pathname, basePath]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const prevOpenRef = useRef(false);
  const prevPathnameRef = useRef(pathname);
  const bottomRef = useRef<HTMLDivElement>(null);

  const addMattyMessage = (text: string) => {
    const id = `matty-${Date.now()}`;
    setMessages((prev) => [...prev, { id, role: 'matty', text, timestamp: nowLabel() }]);
    setStreamingId(id);
  };

  // Seed on open; append context announcement when route changes while open.
  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    const prevPathname = prevPathnameRef.current;
    prevOpenRef.current = mattyPanelOpen;
    prevPathnameRef.current = pathname;

    if (!mattyPanelOpen) return;

    if (!wasOpen) {
      const id = `greeting-${Date.now()}`;
      setMessages([{ id, role: 'matty', text: ctx.greeting, timestamp: nowLabel() }]);
      setStreamingId(id);
    } else if (prevPathname !== pathname) {
      addMattyMessage(ctx.greeting);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mattyPanelOpen, pathname, ctx]);

  // Scroll to bottom when a new message is added.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: 'user', text: text.trim(), timestamp: nowLabel() },
    ]);
    setDraft('');
    window.setTimeout(() => {
      addMattyMessage(`Got it — I'll get started on that.`);
    }, 420);
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
    >
      <div className={styles['matty-panel__header']}>
        <span className={styles['matty-panel__avatar']}>
          <AgentAvatar shape="sphere" color="yellow" size="sm" eyes shadow={false} />
        </span>
        <div className={styles['matty-panel__title-block']}>
          <h2 className={styles['matty-panel__title']}>Matty</h2>
          <p className={styles['matty-panel__subtitle']}>
            <span className={styles['matty-panel__subtitle-icon']}>
              <Icon glyph={<LockIcon />} size="12" />
            </span>
            Only visible to you
          </p>
        </div>
        <IconButton
          aria-label="Close Matty panel"
          size="small"
          padding="compact"
          icon={<Icon size="16" glyph={<CloseIcon />} />}
          onClick={() => setMattyPanelOpen(false)}
        />
      </div>

      <Scrollbar className={styles['matty-panel__messages']}>
        <div className={styles['matty-panel__msg-list']}>
          {messages.map((m) => (
            <MattyMessage
              key={m.id}
              message={m}
              stream={m.role === 'matty' && m.id === streamingId}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </Scrollbar>

      {mattyPanelOpen && messages.length <= 1 ? (
        <div className={styles['matty-panel__suggestions']}>
          {ctx.suggestions.map((label) => (
            <button
              key={label}
              type="button"
              className={styles['matty-panel__suggestion']}
              onClick={() => send(label)}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}

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
