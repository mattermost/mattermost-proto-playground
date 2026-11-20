import { useRef, useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import SendOutlineIcon from '@mattermost/compass-icons/components/send-outline';
import { Icon } from '@mattermost/compass-ui/components/icon';
import styles from './AgentChatBox.module.scss';

export interface AgentChatBoxProps {
  placeholder: string;
}

/**
 * Agent chat pill from the agents-vision prototype (plus, field, send).
 * MessageInput is the channel composer, so it does not carry this shape.
 */
export function AgentChatBox({ placeholder }: AgentChatBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState('');
  const canSend = draft.trim().length > 0;

  return (
    <div className={styles['agent-chat-box']}>
      <button
        type="button"
        className={styles['agent-chat-box__plus']}
        aria-label="Add to your question"
        onClick={() => inputRef.current?.focus()}
      >
        <Icon glyph={<PlusIcon />} size="16" />
      </button>
      <input
        ref={inputRef}
        className={styles['agent-chat-box__input']}
        type="text"
        placeholder={placeholder}
        value={draft}
        aria-label="Ask about your work"
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && canSend) {
            event.preventDefault();
            setDraft('');
          }
        }}
      />
      <button
        type="button"
        className={styles['agent-chat-box__send']}
        aria-label="Send message"
        disabled={!canSend}
        onClick={() => setDraft('')}
      >
        <Icon glyph={<SendOutlineIcon />} size="16" />
      </button>
    </div>
  );
}
