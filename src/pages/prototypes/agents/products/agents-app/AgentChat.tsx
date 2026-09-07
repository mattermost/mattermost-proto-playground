import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useSearchParams } from 'react-router-dom';
import ArchiveOutlineIcon from '@mattermost/compass-icons/components/archive-outline';
import ContentCopyIcon from '@mattermost/compass-icons/components/content-copy';
import DotsHorizontalIcon from '@mattermost/compass-icons/components/dots-horizontal';
import LightningBoltOutlineIcon from '@mattermost/compass-icons/components/lightning-bolt-outline';
import MessageTextOutlineIcon from '@mattermost/compass-icons/components/message-text-outline';
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
import { useExitAnimation } from '@/hooks/useExitAnimation';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import {
  buildAgentChatSessions,
  buildAgentWelcomeMessage,
  resolveAgentProfile,
} from '../../agentsData';
import AgentAvatar from '../../components/AgentAvatar';
import AgentSettingsModal from '../../components/AgentSettingsModal';
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
  const { customAgents, updateAgent } = useAgents();
  const agent = useMemo(
    () => resolveAgentProfile(agentId, customAgents),
    [agentId, customAgents],
  );
  const sessions = useMemo(() => buildAgentChatSessions(agent), [agent]);
  const welcomeMessage = useMemo(
    () => buildAgentWelcomeMessage(agent),
    [agent],
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const settingsParam = searchParams.get('settings') === 'true';

  const [activeSessionId, setActiveSessionId] = useState(
    sessions[0]?.id ?? '',
  );
  const [draft, setDraft] = useState('');
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [optionsAnchor, setOptionsAnchor] = useState<DOMRect | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(settingsParam);
  const optionsButtonRef = useRef<HTMLDivElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const skipOptionsOutsideCloseRef = useRef(false);
  const { rendered: optionsRendered, exiting: optionsExiting } =
    useExitAnimation(optionsOpen, OPTIONS_MENU_EXIT_MS);

  useOutsideClose(optionsMenuRef, optionsOpen && !optionsExiting, () => {
    if (skipOptionsOutsideCloseRef.current) {
      skipOptionsOutsideCloseRef.current = false;
      return;
    }
    setOptionsOpen(false);
  });

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
    setOptionsOpen(false);
    setSettingsOpen(settingsParam);
  }, [agent.id, sessions, settingsParam]);

  useEffect(() => {
    if (settingsParam) {
      setSettingsOpen(true);
    }
  }, [settingsParam]);

  useEffect(() => {
    if (!optionsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOptionsOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [optionsOpen]);

  const openOptionsMenu = () => {
    const rect =
      optionsButtonRef.current?.getBoundingClientRect() ?? null;
    setOptionsAnchor(rect);
    setOptionsOpen((prev) => !prev);
  };

  const closeOptionsMenu = () => setOptionsOpen(false);

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
                imageSrc={agent.customImageSrc}
              />
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
                        imageSrc={agent.customImageSrc}
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
                    onClick={closeOptionsMenu}
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
              </PopoverMenu>
            </div>,
            document.body,
          )
        : null}

      <AgentSettingsModal
        open={settingsOpen}
        agent={agent}
        onClose={() => {
          setSettingsOpen(false);
          if (searchParams.get('settings')) {
            setSearchParams(
              (prev) => {
                const next = new URLSearchParams(prev);
                next.delete('settings');
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
