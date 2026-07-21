import CloseIcon from '@mattermost/compass-icons/components/close';
import {
  Icon,
  IconButton,
  Message,
  MessageInput,
  Scrollbar,
  messageStyles,
} from '@mattermost/compass-ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import avatarBot from '@/assets/avatars/Aiko Tan.png';
import avatarUser from '@/assets/avatars/Danielle Okoro.png';
import { useAutomations } from '../../context/AutomationsContext';
import {
  greetingForContext,
  resolveAutomationsAiContext,
  scriptedReplyFor,
  suggestionsForContext,
  type AiSuggestion,
} from '../../data/aiAssistantContext';
import styles from './AiAssistant.module.scss';

const BASE = '/prototypes/automations';
const bodyTextClass = messageStyles['message__body-text'];

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  timestamp: string;
};

function nowLabel() {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/**
 * Persistent AI assistant panel. Stays mounted in the product shell so it can
 * remain open while the user navigates (e.g. into the workflow builder).
 */
export default function AiAssistantPanel() {
  const { pathname } = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const {
    getAutomation,
    createAiDraft,
    recordRecent,
    assistantOpen,
    setAssistantOpen,
  } = useAutomations();

  const automationId = params.id;
  const automation = automationId ? getAutomation(automationId) : undefined;

  const ctx = useMemo(
    () => resolveAutomationsAiContext(pathname, automation?.name),
    [pathname, automation?.name],
  );

  const suggestions = useMemo(() => suggestionsForContext(ctx), [ctx]);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'greet-initial',
      role: 'assistant',
      text: greetingForContext(ctx),
      timestamp: nowLabel(),
    },
  ]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const prevContextKey = useRef(`${ctx.surface}:${ctx.automationId ?? ''}`);
  const seededOpen = useRef(false);

  // First open: ensure we have a greeting for the current place.
  useEffect(() => {
    if (!assistantOpen || seededOpen.current) return;
    seededOpen.current = true;
    setMessages([
      {
        id: `greet-${Date.now()}`,
        role: 'assistant',
        text: greetingForContext(ctx),
        timestamp: nowLabel(),
      },
    ]);
  }, [assistantOpen, ctx]);

  // While open, announce context changes instead of wiping the thread.
  useEffect(() => {
    const key = `${ctx.surface}:${ctx.automationId ?? ''}`;
    if (!assistantOpen) {
      prevContextKey.current = key;
      return;
    }
    if (prevContextKey.current === key) return;
    prevContextKey.current = key;
    setMessages((prev) => [
      ...prev,
      {
        id: `ctx-${Date.now()}`,
        role: 'assistant',
        text: greetingForContext(ctx),
        timestamp: nowLabel(),
      },
    ]);
  }, [ctx, assistantOpen]);

  const runAction = (suggestion: AiSuggestion | null, prompt: string) => {
    const action = suggestion?.action ?? 'none';
    const reply = scriptedReplyFor(ctx, prompt, action);

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        text: prompt,
        timestamp: nowLabel(),
      },
    ]);
    setDraft('');
    setBusy(true);

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          text: reply,
          timestamp: nowLabel(),
        },
      ]);
      setBusy(false);

      // Keep the assistant open on top while navigating behind it.
      if (action === 'create-workflow') {
        window.setTimeout(() => {
          const id = createAiDraft();
          recordRecent(id);
          navigate(`${BASE}/${id}/editor?agent=1`);
        }, 500);
      } else if (action === 'open-editor-agent' && ctx.automationId) {
        window.setTimeout(() => {
          navigate(`${BASE}/${ctx.automationId}/editor?agent=1`);
        }, 400);
      } else if (action === 'go-templates') {
        window.setTimeout(() => {
          navigate(`${BASE}/templates`);
        }, 400);
      }
    }, 450);
  };

  const onSend = () => {
    const prompt = draft.trim();
    if (!prompt || busy) return;
    const matched =
      suggestions.find((s) => s.prompt === prompt || s.label === prompt) ?? null;
    runAction(matched, prompt);
  };

  return (
    <aside
      className={[
        styles['assistant-panel'],
        assistantOpen ? styles['assistant-panel--open'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="AI assistant"
      aria-hidden={!assistantOpen}
    >
      <div className={styles['assistant-panel__header']}>
        <div className={styles['assistant-panel__title-block']}>
          <h2 className={styles['assistant-panel__title']}>Automations assistant</h2>
          <p className={styles['assistant-panel__context']}>{ctx.placeLabel}</p>
        </div>
        <IconButton
          aria-label="Close assistant"
          size="Small"
          padding="Compact"
          icon={<Icon size="16" glyph={<CloseIcon />} />}
          onClick={() => setAssistantOpen(false)}
        />
      </div>

      <Scrollbar className={styles['assistant-panel__messages']}>
        {messages.map((m) =>
          m.role === 'assistant' ? (
            <Message
              key={m.id}
              avatarSrc={avatarBot}
              avatarAlt="Automations assistant"
              username="Automations assistant"
              timestamp={m.timestamp}
              isBot
              botLabel="BOT"
              showMessageActions={false}
            >
              <p className={bodyTextClass}>{m.text}</p>
            </Message>
          ) : (
            <Message
              key={m.id}
              avatarSrc={avatarUser}
              avatarAlt="Danielle Okoro"
              username="Danielle Okoro"
              timestamp={m.timestamp}
              showMessageActions={false}
            >
              <p className={bodyTextClass}>{m.text}</p>
            </Message>
          ),
        )}
      </Scrollbar>

      {assistantOpen && !busy ? (
        <div className={styles['assistant-panel__suggestions']}>
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              className={styles['assistant-panel__suggestion']}
              onClick={() => runAction(s, s.prompt)}
            >
              {s.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className={styles['assistant-panel__composer']}>
        <MessageInput
          width="narrow"
          placeholder="Ask how I can help…"
          value={draft}
          onChange={setDraft}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button
            type="button"
            className={styles['assistant-panel__suggestion']}
            disabled={busy || !draft.trim() || !assistantOpen}
            onClick={onSend}
            style={{ opacity: busy || !draft.trim() || !assistantOpen ? 0.5 : 1 }}
          >
            Send
          </button>
        </div>
      </div>
    </aside>
  );
}
