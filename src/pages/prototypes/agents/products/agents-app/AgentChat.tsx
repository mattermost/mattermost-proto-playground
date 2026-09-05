import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import MessageTextOutlineIcon from '@mattermost/compass-icons/components/message-text-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import SendOutlineIcon from '@mattermost/compass-icons/components/send-outline';
import { Icon } from '@mattermost/compass-ui/components/icon';
import { IconButton } from '@mattermost/compass-ui/components/icon-button';
import { MenuItem } from '@mattermost/compass-ui/components/menu-item';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import {
  buildAgentChatSessions,
  buildAgentWelcomeMessage,
  resolveAgentProfile,
} from '../../agentsData';
import AgentAvatar from '../../components/AgentAvatar';
import AgentTypingDots from '../../components/AgentTypingDots';
import { useAgents } from '../../context/AgentsContext';
import AgentsProductSidebar from './AgentsProductSidebar';
import styles from './AgentChat.module.scss';

const STREAM_MS_PER_WORD = 32;
/** Hold the typing dots before avatar reveal (within ~800–1200ms). */
const AVATAR_LOADING_MS = 1000;
/** Matches `--duration-moderate` for the dots → avatar crossfade. */
const AVATAR_REVEAL_MS = 300;

type AvatarRevealPhase = 'loading' | 'revealing' | 'ready';

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
    const take = Math.min(remaining, words.length);
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
    (sum, words) => sum + words.length,
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
function useAvatarReveal(resetKey: string): AvatarRevealPhase {
  const [phase, setPhase] = useState<AvatarRevealPhase>('loading');

  useEffect(() => {
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
  }, [resetKey]);

  return phase;
}

/**
 * Agent chat layout (Figma 71:102213) — session list + message canvas.
 * Supports Matty and agents created via the New Agent modal.
 */
export default function AgentChat() {
  const { agentId } = useParams<{ agentId: string }>();
  const { customAgents } = useAgents();
  const agent = useMemo(
    () => resolveAgentProfile(agentId, customAgents),
    [agentId, customAgents],
  );
  const sessions = useMemo(() => buildAgentChatSessions(agent), [agent]);
  const welcomeMessage = useMemo(
    () => buildAgentWelcomeMessage(agent),
    [agent],
  );

  const [activeSessionId, setActiveSessionId] = useState(
    sessions[0]?.id ?? '',
  );
  const [draft, setDraft] = useState('');
  const avatarPhase = useAvatarReveal(agent.id);
  // Bubble + stream only after dots → avatar reveal completes.
  const showBubble = avatarPhase === 'ready';
  const streamedParagraphs = useStreamedParagraphs(
    welcomeMessage.paragraphs,
    showBubble,
  );
  const showDots = avatarPhase === 'loading' || avatarPhase === 'revealing';
  const showAvatar = avatarPhase === 'revealing' || avatarPhase === 'ready';

  useEffect(() => {
    setActiveSessionId(sessions[0]?.id ?? '');
    setDraft('');
  }, [agent.id, sessions]);

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
              <AgentAvatar
                shape={agent.shape}
                color={agent.color}
                size="xs"
                eyes
                shadow={false}
              />
              <h1 className={styles['agent-chat__sessions-name']}>
                {agent.name}
              </h1>
            </div>
            <IconButton
              size="small"
              padding="compact"
              icon={<Icon glyph={<DotsHorizontalIcon />} size="16" />}
              aria-label={`${agent.name} options`}
            />
          </header>

          <div className={styles['agent-chat__sessions-list']}>
            {sessions.map((session) => (
              <MenuItem
                key={session.id}
                className={styles['agent-chat__session-item']}
                label={session.preview}
                active={session.id === activeSessionId}
                leadingVisual={
                  <Icon glyph={<MessageTextOutlineIcon />} size="16" />
                }
                onClick={() => setActiveSessionId(session.id)}
              />
            ))}
            <MenuItem
              className={styles['agent-chat__session-item']}
              label="New chat"
              leadingVisual={<Icon glyph={<PlusIcon />} size="16" />}
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
                <article className={styles['agent-chat__message']}>
                  <div
                    className={[
                      styles['agent-chat__message-avatar'],
                      styles[`agent-chat__message-avatar--${avatarPhase}`],
                    ].join(' ')}
                  >
                    {showDots ? (
                      <AgentTypingDots
                        className={styles['agent-chat__message-dots']}
                        label={`${agent.name} is thinking`}
                      />
                    ) : null}
                    {showAvatar ? (
                      <AgentAvatar
                        className={styles['agent-chat__message-avatar-face']}
                        shape={agent.shape}
                        color={agent.color}
                        size="sm"
                        eyes
                        shadow={false}
                      />
                    ) : null}
                  </div>
                  {showBubble ? (
                    <div
                      className={[
                        styles['agent-chat__message-bubble'],
                        styles['agent-chat__message-bubble--enter'],
                      ].join(' ')}
                    >
                      <div className={styles['agent-chat__message-meta']}>
                        <span className={styles['agent-chat__message-name']}>
                          {agent.name}
                        </span>
                        <time
                          className={styles['agent-chat__message-time']}
                          dateTime="10:43"
                        >
                          {welcomeMessage.timestamp}
                        </time>
                      </div>
                      <div className={styles['agent-chat__message-body']}>
                        {streamedParagraphs.map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </article>
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
                aria-label={`Chat with ${agent.name}`}
              />
              <button
                type="button"
                className={styles['agent-chat__input-send']}
                aria-label="Send message"
                disabled={!draft.trim()}
              >
                <Icon glyph={<SendOutlineIcon />} size="16" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
