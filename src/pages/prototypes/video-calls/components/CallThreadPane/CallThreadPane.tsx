import type { KeyboardEvent } from 'react';
import CloseIcon from '@mattermost/compass-icons/components/close';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import {
  Message,
  MessageInput,
  ParticipantsPanel,
  RightSidebar,
  messageStyles,
} from '@mattermost/compass-proto';
import styles from './CallThreadPane.module.scss';

export interface CallPaneParticipant {
  id: string;
  name: string;
  avatarSrc?: string;
  host?: boolean;
  talking?: boolean;
  muted?: boolean;
}

export interface CallPaneMessage {
  id: string;
  username: string;
  avatarSrc?: string;
  timestamp: string;
  text: string;
}

export interface CallThreadPaneLabels {
  /** Title of the chat pane. */
  chatTitle?: string;
  /** Accessible name of the pane. */
  participantsRegion?: string;
  chatRegion?: string;
  close?: string;
  composerPlaceholder?: string;
  /** Shown when there are no messages yet. */
  empty?: string;
}

export interface CallThreadPaneProps {
  mode: 'participants' | 'chat';
  onClose: () => void;
  /** Participants pane. */
  participants?: CallPaneParticipant[];
  currentUserId?: string;
  /** Chat pane. */
  messages?: CallPaneMessage[];
  draft?: string;
  onDraftChange?: (value: string) => void;
  /** Called on Enter (without Shift) with a non-empty draft. */
  onSend?: (text: string) => void;
  labels?: CallThreadPaneLabels;
  className?: string;
}

const DEFAULT_LABELS: Required<CallThreadPaneLabels> = {
  chatTitle: 'Call chat',
  participantsRegion: 'Call participants',
  chatRegion: 'Call chat',
  close: 'Close call chat',
  composerPlaceholder: 'Write to the call',
  empty: 'No messages yet',
};

/**
 * Right-hand pane of the call window. `participants` reuses the proto
 * `ParticipantsPanel`; `chat` is a proto `RightSidebar` with `Message` rows and
 * a `MessageInput` footer (RHS overlay pattern). Open/close is host-owned.
 */
export function CallThreadPane({
  mode,
  onClose,
  participants = [],
  currentUserId,
  messages = [],
  draft = '',
  onDraftChange,
  onSend,
  labels,
  className,
}: CallThreadPaneProps) {
  const l = { ...DEFAULT_LABELS, ...labels };
  const root = [styles['call-thread-pane'], className]
    .filter(Boolean)
    .join(' ');

  if (mode === 'participants') {
    return (
      <div className={root} role="region" aria-label={l.participantsRegion}>
        <ParticipantsPanel
          participants={participants}
          currentUserId={currentUserId}
          onClose={onClose}
        />
      </div>
    );
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter' || e.shiftKey || e.nativeEvent.isComposing) return;
    const text = draft.trim();
    if (!text || !onSend) return;
    e.preventDefault();
    onSend(text);
  };

  return (
    <div className={root} role="region" aria-label={l.chatRegion}>
      <RightSidebar
        fill
        alignBody="end"
        header={
          <div className={styles['call-thread-pane__header']}>
            <h2 className={styles['call-thread-pane__title']}>{l.chatTitle}</h2>
            <IconButton
              size="small"
              aria-label={l.close}
              icon={<Icon size="16" glyph={<CloseIcon />} />}
              onClick={onClose}
            />
          </div>
        }
        footer={
          // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- Enter bubbles up from the composer textarea
          <div
            className={styles['call-thread-pane__composer']}
            onKeyDown={handleKeyDown}
          >
            <MessageInput
              width="narrow"
              placeholder={l.composerPlaceholder}
              value={draft}
              onChange={onDraftChange}
            />
          </div>
        }
      >
        {messages.length === 0 ? (
          <p className={styles['call-thread-pane__empty']}>{l.empty}</p>
        ) : (
          <ul className={styles['call-thread-pane__messages']}>
            {messages.map((m) => (
              <li key={m.id}>
                <Message
                  avatarSrc={m.avatarSrc}
                  avatarAlt={m.username}
                  username={m.username}
                  timestamp={m.timestamp}
                  messageActionsType="rhs"
                  showMessageActions={false}
                >
                  <p className={messageStyles['message__body-text']}>
                    {m.text}
                  </p>
                </Message>
              </li>
            ))}
          </ul>
        )}
      </RightSidebar>
    </div>
  );
}
