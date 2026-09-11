import CloseIcon from '@mattermost/compass-icons/components/close';
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

type MattyContext = {
  placeLabel: string;
  greeting: string;
  suggestions: string[];
};

function resolveContext(pathname: string): MattyContext {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  if (normalized.startsWith(`${AGENTS_BASE}/channel/`)) {
    const channelId = normalized.replace(`${AGENTS_BASE}/channel/`, '');
    return {
      placeLabel: `#${channelId}`,
      greeting: `You're in ${channelId}. Want me to coordinate the response, summarize where things stand, or loop in another agent?`,
      suggestions: ['Summarize the incident', 'Schedule a postmortem', 'Loop in an agent'],
    };
  }

  if (normalized.startsWith(`${AGENTS_BASE}/dm/`)) {
    return {
      placeLabel: 'Direct message',
      greeting: `Want me to loop in another agent, start a group chat, or help with something else?`,
      suggestions: ['Start a group chat', 'Create a new agent', 'View all agents'],
    };
  }

  if (normalized.startsWith(`${AGENTS_BASE}/agents`)) {
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

export default function MattyPanel() {
  const { mattyPanelOpen, setMattyPanelOpen } = useAgents();
  const { pathname } = useLocation();

  const ctx = useMemo(() => resolveContext(pathname), [pathname]);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: 'greeting', role: 'matty', text: ctx.greeting, timestamp: nowLabel() },
  ]);
  const [draft, setDraft] = useState('');
  const seededOpen = useRef(false);
  const prevContextKey = useRef(pathname);

  // Seed greeting on first open.
  useEffect(() => {
    if (!mattyPanelOpen || seededOpen.current) return;
    seededOpen.current = true;
    setMessages([{ id: 'greeting-init', role: 'matty', text: ctx.greeting, timestamp: nowLabel() }]);
  }, [mattyPanelOpen, ctx]);

  // Announce context change while panel is open.
  useEffect(() => {
    if (!mattyPanelOpen) {
      prevContextKey.current = pathname;
      return;
    }
    if (prevContextKey.current === pathname) return;
    prevContextKey.current = pathname;
    setMessages((prev) => [
      ...prev,
      { id: `ctx-${Date.now()}`, role: 'matty', text: ctx.greeting, timestamp: nowLabel() },
    ]);
  }, [pathname, mattyPanelOpen, ctx]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: 'user', text: text.trim(), timestamp: nowLabel() },
    ]);
    setDraft('');
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `matty-${Date.now()}`,
          role: 'matty',
          text: `Got it — I'll get started on that.`,
          timestamp: nowLabel(),
        },
      ]);
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
            <article
              key={m.id}
              className={[
                styles['matty-panel__msg'],
                m.role === 'user' ? styles['matty-panel__msg--user'] : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className={styles['matty-panel__msg-bubble']}>
                <div className={styles['matty-panel__msg-meta']}>
                  <span className={styles['matty-panel__msg-name']}>
                    {m.role === 'matty' ? 'Matty' : 'Priya'}
                  </span>
                  <time className={styles['matty-panel__msg-time']}>
                    {m.timestamp}
                  </time>
                </div>
                <div className={styles['matty-panel__msg-body']}>
                  <p>{m.text}</p>
                </div>
              </div>
            </article>
          ))}
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
