import CloseIcon from '@mattermost/compass-icons/components/close';
import {
  Icon,
  IconButton,
  Message,
  MessageInput,
  Scrollbar,
  messageStyles,
} from '@mattermost/compass-ui';
import { useEffect, useMemo, useState } from 'react';
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

type AiAssistantPanelProps = {
  onClose: () => void;
};

export default function AiAssistantPanel({ onClose }: AiAssistantPanelProps) {
  const { pathname } = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const { getAutomation, createAiDraft, recordRecent } = useAutomations();

  const automationId = params.id;
  const automation = automationId ? getAutomation(automationId) : undefined;

  const ctx = useMemo(
    () => resolveAutomationsAiContext(pathname, automation?.name),
    [pathname, automation?.name],
  );

  const suggestions = useMemo(() => suggestionsForContext(ctx), [ctx]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);

  // Reset greeting when surface/context changes while open.
  useEffect(() => {
    setMessages([
      {
        id: `greet-${ctx.surface}-${Date.now()}`,
        role: 'assistant',
        text: greetingForContext(ctx),
        timestamp: nowLabel(),
      },
    ]);
    setDraft('');
    setBusy(false);
  }, [ctx]);

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

      if (action === 'create-workflow') {
        window.setTimeout(() => {
          const id = createAiDraft();
          recordRecent(id);
          onClose();
          navigate(`${BASE}/${id}/editor?agent=1`);
        }, 600);
      } else if (action === 'open-editor-agent' && ctx.automationId) {
        window.setTimeout(() => {
          onClose();
          navigate(`${BASE}/${ctx.automationId}/editor?agent=1`);
        }, 500);
      } else if (action === 'go-templates') {
        window.setTimeout(() => {
          onClose();
          navigate(`${BASE}/templates`);
        }, 500);
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
    <aside className={styles['assistant-panel']} aria-label="AI assistant">
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
          onClick={onClose}
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

      {!busy ? (
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
            disabled={busy || !draft.trim()}
            onClick={onSend}
            style={{ opacity: busy || !draft.trim() ? 0.5 : 1 }}
          >
            Send
          </button>
        </div>
      </div>
    </aside>
  );
}
