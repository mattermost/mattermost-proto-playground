import {
  type KeyboardEvent,
  useMemo,
  useRef,
  useState,
} from 'react';
import SendIcon from '@mattermost/compass-icons/components/send';
import { Chip } from '@mattermost/compass-ui/components/chip';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import { Tag } from '@mattermost/compass-ui/components/tag';
import { UserAvatar } from '@mattermost/compass-ui/components/user-avatar';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import {
  buildServiceStatusMentionables,
  type AgentColor,
  type AgentShape,
  type ChannelMessagePart,
  type MentionCandidate,
} from '../agentsData';
import { agentAvatarChipSrc } from './agentAvatarShapes';
import styles from './MentionMessageInput.module.scss';

const AT_TOKEN = /(^|[\s([{])@([^\s@]*)$/;

type DraftPart =
  | { type: 'text'; text: string }
  | {
      type: 'mention';
      id: string;
      label: string;
      avatarSrc: string;
      kind: 'agent' | 'person';
      agentShape?: AgentShape;
      agentColor?: AgentColor;
    };

type AtToken = { start: number; query: string };

type MentionMessageInputProps = {
  placeholder?: string;
  /** Return `false` to keep the draft (e.g. while an invite modal is open). */
  onSend: (payload: {
    parts: ChannelMessagePart[];
    body: string;
  }) => boolean | void;
};

function detectAtToken(value: string, cursor: number): AtToken | null {
  const before = value.slice(0, cursor);
  const match = AT_TOKEN.exec(before);
  if (!match) {
    return null;
  }
  return {
    start: match.index + match[1].length,
    query: match[2],
  };
}

function filterMentionables(
  candidates: MentionCandidate[],
  query: string,
): MentionCandidate[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return candidates;
  }
  return candidates.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.secondaryLabel.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q),
  );
}

function partsToBody(parts: DraftPart[]): string {
  return parts
    .map((part) => (part.type === 'text' ? part.text : `@${part.label}`))
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

function toMessageParts(parts: DraftPart[]): ChannelMessagePart[] {
  return parts
    .filter((part) => (part.type === 'text' ? part.text.length > 0 : true))
    .map((part) =>
      part.type === 'text'
        ? { type: 'text' as const, text: part.text }
        : {
            type: 'mention' as const,
            id: part.id,
            label: part.label,
            avatarSrc: part.avatarSrc,
            kind: part.kind,
            agentShape: part.agentShape,
            agentColor: part.agentColor,
          },
    );
}

export default function MentionMessageInput({
  placeholder = 'Write to service-status',
  onSend,
}: MentionMessageInputProps) {
  const mentionables = useMemo(
    () => buildServiceStatusMentionables(agentAvatarChipSrc),
    [],
  );
  const [committed, setCommitted] = useState<DraftPart[]>([]);
  const [value, setValue] = useState('');
  const [token, setToken] = useState<AtToken | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const suggestions = token
    ? filterMentionables(mentionables, token.query)
    : [];
  const menuOpen = token != null && suggestions.length > 0;

  useOutsideClose(wrapRef, menuOpen, () => setToken(null));

  const recomputeToken = (nextValue: string, cursor: number) => {
    const nextToken = detectAtToken(nextValue, cursor);
    setToken(nextToken);
    setActiveIndex(0);
  };

  const handleChange = (nextValue: string) => {
    setValue(nextValue);
    const cursor = inputRef.current?.selectionStart ?? nextValue.length;
    recomputeToken(nextValue, cursor);
  };

  const insertMention = (candidate: MentionCandidate) => {
    if (!token) {
      return;
    }
    const before = value.slice(0, token.start);
    const after = value.slice(token.start + 1 + token.query.length);
    const nextCommitted = [...committed];
    if (before) {
      nextCommitted.push({ type: 'text', text: before });
    }
    nextCommitted.push({
      type: 'mention',
      id: candidate.id,
      label: candidate.name,
      avatarSrc: candidate.avatarSrc,
      kind: candidate.kind,
      agentShape: candidate.agentShape,
      agentColor: candidate.agentColor,
    });
    if (after.startsWith(' ')) {
      setValue(after);
      setCommitted(nextCommitted);
    } else {
      setValue(after ? ` ${after}` : ' ');
      setCommitted(nextCommitted);
    }
    setToken(null);
    setActiveIndex(0);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const removeMention = (index: number) => {
    setCommitted((prev) => prev.filter((_, i) => i !== index));
    inputRef.current?.focus();
  };

  const canSend =
    committed.some((part) => part.type === 'mention') ||
    value.trim().length > 0 ||
    committed.some((part) => part.type === 'text' && part.text.trim());

  const send = () => {
    if (!canSend) {
      return;
    }
    const trailing = value.trimEnd();
    const allParts: DraftPart[] = [
      ...committed,
      ...(trailing ? [{ type: 'text' as const, text: trailing }] : []),
    ];
    const parts = toMessageParts(allParts);
    const body = partsToBody(allParts);
    if (!body) {
      return;
    }
    const allowed = onSend({ parts, body });
    if (allowed === false) {
      return;
    }
    setCommitted([]);
    setValue('');
    setToken(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (menuOpen) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((prev) => (prev + 1) % suggestions.length);
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex(
          (prev) => (prev - 1 + suggestions.length) % suggestions.length,
        );
        return;
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        const pick = suggestions[activeIndex] ?? suggestions[0];
        if (pick) {
          insertMention(pick);
        }
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        setToken(null);
        return;
      }
    }

    if (event.key === 'Backspace' && value.length === 0 && committed.length) {
      event.preventDefault();
      setCommitted((prev) => prev.slice(0, -1));
      return;
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  const showPlaceholder = committed.length === 0 && value.length === 0;

  return (
    <div className={styles['mention-input']} ref={wrapRef}>
      {menuOpen ? (
        <ul
          className={styles['mention-input__menu']}
          role="listbox"
          aria-label="Mention someone"
        >
          {suggestions.map((item, index) => (
            <li key={item.id} className={styles['mention-input__menu-item']}>
              <MenuItem
                role="option"
                active={index === activeIndex}
                label={item.name}
                secondaryLabel={item.secondaryLabel}
                leadingVisual={
                  <span
                    className={
                      item.kind === 'agent'
                        ? styles['mention-input__agent-avatar']
                        : undefined
                    }
                  >
                    <UserAvatar
                      src={item.avatarSrc}
                      alt={item.avatarAlt}
                      size="24"
                    />
                  </span>
                }
                trailingElement={item.kind === 'agent'}
                trailingVisual={
                  item.kind === 'agent' ? (
                    <Tag label="Agent" size="x-small" casing="all-caps" />
                  ) : undefined
                }
                onClick={() => insertMention(item)}
                onMouseEnter={() => setActiveIndex(index)}
              />
            </li>
          ))}
        </ul>
      ) : null}

      <div className={styles['mention-input__container']}>
        <div
          className={styles['mention-input__body']}
          onClick={() => inputRef.current?.focus()}
        >
          <div className={styles['mention-input__field']}>
            {committed.map((part, index) =>
              part.type === 'mention' ? (
                <Chip
                  key={`${part.id}-${index}`}
                  size="medium-compact"
                  leadingAvatar={{ src: part.avatarSrc, alt: part.label }}
                  onRemove={() => removeMention(index)}
                  className={[
                    styles['mention-input__mention-chip'],
                    part.kind === 'agent'
                      ? styles['mention-input__mention-chip--agent']
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {part.label}
                </Chip>
              ) : (
                <span key={`text-${index}`} className={styles['mention-input__text']}>
                  {part.text}
                </span>
              ),
            )}
            <input
              ref={inputRef}
              className={styles['mention-input__input']}
              type="text"
              value={value}
              placeholder={showPlaceholder ? placeholder : undefined}
              aria-label={placeholder}
              onChange={(event) => handleChange(event.target.value)}
              onKeyDown={onKeyDown}
              onSelect={() => {
                const el = inputRef.current;
                if (!el) return;
                recomputeToken(value, el.selectionStart ?? value.length);
              }}
            />
          </div>
        </div>
        <div className={styles['mention-input__actions']}>
          <IconButton
            size="small"
            padding="compact"
            aria-label="Send message"
            disabled={!canSend}
            icon={<Icon glyph={<SendIcon />} size="16" />}
            onClick={send}
          />
        </div>
      </div>
    </div>
  );
}
