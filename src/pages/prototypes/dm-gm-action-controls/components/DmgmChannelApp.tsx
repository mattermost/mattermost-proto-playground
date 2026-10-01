// [AI DRAFT] The signed-in end user's Mattermost window, rendered from one
// session's verdicts. Composition follows the Access Channel port's
// AcvcChannelApp (ChannelShell + ChannelsSidebar + ChannelHeader + Message +
// MessageInput) with this prototype's cast and the DM/GM rules.
import {
  useEffect,
  useId,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import {
  ChannelsSidebar,
  type ChannelsSidebarModel,
} from '@mattermost/compass-ui/components/channels-sidebar';
import { EmptyState } from '@mattermost/compass-ui/components/empty-state';
import { MessageSeparator } from '@mattermost/compass-ui/components/message-separator';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import {
  ChannelHeader,
  ChannelShell,
  MessageInput,
  shellStyles,
  type ChannelHeaderType,
} from '@mattermost/compass-proto';
import LockedMessagesSvg from '@/assets/illustrations/locked-messages.svg?react';
import AcvcMessage from '../../action-controls-view-channel/components/AcvcMessage';
import {
  CHANNELS,
  DIRECT,
  TEAM_NAME,
  conversationByName,
  isDirect,
  type Conversation,
  type ConversationMessage,
} from '../conversations';
import { VIEWER } from '../dmgmData';
import type { DirectionId } from '../dmgmScenes';
import DeniedReason from './DeniedReason';
import type { DmSession } from './useDmSession';
import styles from './DmgmChannelApp.module.scss';

/** Matches the inherited View Channel D+C′ redirect. */
const REDIRECT_SECONDS = 10;
const FALLBACK_CHANNEL = 'Town Square';

type SidebarRow = {
  name: string;
  leadingVisual:
    | 'public'
    | 'private'
    | 'direct-message'
    | 'group-message'
    | 'threads'
    | 'drafts';
  status?: 'read' | 'unread' | 'mention';
  memberCount?: number;
  avatarSrc?: string;
  avatarAlt?: string;
  showAvatarStatus?: boolean;
  onClick?: () => void;
};

function sidebarRow(c: Conversation): SidebarRow {
  if (c.type === 'channel') {
    return { name: c.name, leadingVisual: 'public', status: c.status };
  }
  if (c.type === 'gm') {
    return {
      name: c.name,
      leadingVisual: 'group-message',
      memberCount: c.members.length + 1,
      status: c.status,
    };
  }
  const person = c.type === 'self' ? VIEWER : c.members[0];
  return {
    name: c.name,
    leadingVisual: 'direct-message',
    avatarSrc: person.avatarSrc,
    avatarAlt: person.name,
    showAvatarStatus: true,
    status: c.status,
  };
}

function buildSidebar(
  visible: string[],
  onClick: (name: string) => void,
): ChannelsSidebarModel {
  const withClick = (row: SidebarRow): SidebarRow => ({
    ...row,
    onClick: () => onClick(row.name),
  });
  return {
    topGroupItems: [
      { name: 'Threads', leadingVisual: 'threads' },
      { name: 'Drafts', leadingVisual: 'drafts' },
    ],
    groups: [
      {
        key: 'channels',
        category: {
          label: 'CHANNELS',
          showChevron: true,
          showPlusButton: true,
        },
        items: CHANNELS.filter((c) => visible.includes(c.name))
          .map(sidebarRow)
          .map(withClick),
      },
      {
        key: 'dms',
        category: {
          label: 'DIRECT MESSAGES',
          showChevron: true,
          showPlusButton: true,
        },
        items: DIRECT.filter((c) => visible.includes(c.name))
          .map(sidebarRow)
          .map(withClick),
      },
    ],
  } as ChannelsSidebarModel;
}

function headerType(c: Conversation): ChannelHeaderType {
  if (c.type === 'channel') return 'channel';
  if (c.type === 'gm') return 'gm';
  return 'dm';
}

/** Inherited D+C′ centre state: no reason, no policy, no attribute; redirects. */
function HiddenState({ onRedirect }: { onRedirect: () => void }) {
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);
  useEffect(() => {
    if (secondsLeft <= 0) {
      onRedirect();
      return;
    }
    const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [secondsLeft, onRedirect]);

  return (
    <div className={styles['dmgm-app__denied']} role="status" tabIndex={-1}>
      <EmptyState
        illustration={{
          children: <LockedMessagesSvg />,
          width: '200px',
          'aria-label': '',
        }}
        title="You do not have permission to view this content"
        description="Contact your system administrator if you believe this is an error."
      />
      <p className={styles['dmgm-app__denied-redirect']} aria-live="polite">
        {secondsLeft === 1
          ? 'Redirecting in 1 second…'
          : `Redirecting in ${secondsLeft} seconds…`}
      </p>
    </div>
  );
}

function ReadOnlyComposer({
  draft,
  direction,
  conversationName,
}: {
  draft: string;
  direction: DirectionId;
  conversationName: string;
}) {
  const reasonId = useId();
  if (!draft) {
    // No draft: the bar itself is the aria-disabled, focusable field.
    return (
      <div
        className={styles['dmgm-app__readonly']}
        role="textbox"
        tabIndex={0}
        aria-label={`Message ${conversationName}`}
        aria-disabled="true"
        aria-describedby={reasonId}
      >
        <DeniedReason id={reasonId} kind="post" direction={direction} />
      </div>
    );
  }
  return (
    <div className={styles['dmgm-app__readonly']}>
      {/* FR-23: the typed draft is kept, neither sent nor discarded. The field is
          aria-disabled (still focusable) and points at the reason. */}
      <textarea
        className={styles['dmgm-app__readonly-draft']}
        aria-label={`Message ${conversationName}`}
        aria-disabled="true"
        aria-describedby={reasonId}
        readOnly
        rows={2}
        value={draft}
      />
      <DeniedReason id={reasonId} kind="post" direction={direction} />
    </div>
  );
}

export interface DmgmChannelAppProps {
  session: DmSession;
  direction: DirectionId;
  /** Modal layer inside the frame (Direct Messages modal). */
  overlay?: ReactNode;
  /** Absolutely positioned floating UI (profile popover). */
  floating?: ReactNode;
  /** Called when the DIRECT MESSAGES "+" is clicked. */
  onNewDirectMessage?: () => void;
  /** Intercepts Enter in the composer; return true when handled. */
  onSubmit?: (text: string) => boolean;
  /** Called when a message author's avatar or name is clicked. */
  onAuthorClick?: (username: string) => void;
}

export default function DmgmChannelApp({
  session,
  direction,
  overlay,
  floating,
  onNewDirectMessage,
  onSubmit,
  onAuthorClick,
}: DmgmChannelAppProps) {
  const { active, canView, canPost, openConversation } = session;
  const conversation = conversationByName(active);
  const direct = isDirect(conversation);
  const hidden = direct && !canView;
  const readOnly = direct && canView && !canPost;
  const messages: ConversationMessage[] = [
    ...conversation.messages,
    ...session.extraMessages,
  ];

  const sidebar = buildSidebar(
    session.visibleConversationNames,
    openConversation,
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter' || e.shiftKey) return;
    const text = session.draft.trim();
    if (!text) return;
    e.preventDefault();
    if (onSubmit?.(text)) {
      session.setDraft('');
      return;
    }
    session.addMessage(active, { author: VIEWER, time: 'Now', text });
    session.setDraft('');
  };

  const header = hidden ? (
    <ChannelHeader type={headerType(conversation)} name={conversation.name} />
  ) : (
    <ChannelHeader
      type={headerType(conversation)}
      name={conversation.name}
      description={conversation.description}
      memberCount={
        conversation.type === 'channel'
          ? conversation.memberCount
          : conversation.type === 'gm'
            ? conversation.members.length + 1
            : undefined
      }
      avatarSrc={
        conversation.type === 'dm'
          ? conversation.members[0].avatarSrc
          : conversation.type === 'self'
            ? VIEWER.avatarSrc
            : undefined
      }
      avatarStatus={conversation.type === 'dm' || conversation.type === 'self'}
    />
  );

  return (
    <div
      className={styles['dmgm-app']}
      onClickCapture={(e) => {
        const target = e.target as HTMLElement;
        if (
          onNewDirectMessage &&
          target.closest('[aria-label="New direct messages"]')
        ) {
          onNewDirectMessage();
        }
        const author = target.closest<HTMLElement>('[data-dmgm-author]');
        if (onAuthorClick && author?.dataset.dmgmAuthor) {
          onAuthorClick(author.dataset.dmgmAuthor);
        }
      }}
    >
      <ChannelShell
        teamName={TEAM_NAME}
        teams={[
          { id: 'program-office', name: TEAM_NAME, initials: 'PO' },
          { id: 'test-wing', name: 'Test Wing', initials: 'TW', unread: true },
        ]}
        activeTeamId="program-office"
        userAvatarSrc={VIEWER.avatarSrc}
        userAvatarAlt={VIEWER.name}
        channelsSidebar={
          <div
            className={styles['dmgm-app__sidebar']}
            key={session.visibleConversationNames.join('|')}
          >
            <ChannelsSidebar
              teamName={TEAM_NAME}
              activeChannelName={active}
              onItemClick={openConversation}
              model={sidebar}
            />
          </div>
        }
        channelHeader={header}
      >
        <div
          key={hidden ? 'hidden' : active}
          className={styles['dmgm-app__center']}
        >
          {hidden ? (
            <HiddenState
              onRedirect={() => openConversation(FALLBACK_CHANNEL)}
            />
          ) : (
            <div className={shellStyles['channel-shell__messages']}>
              <Scrollbar>
                <div className={shellStyles['channel-shell__messages-list']}>
                  <MessageSeparator type="date" label="Today" />
                  {messages.map((m, i) => (
                    <div
                      key={`${m.time}-${i}`}
                      className={styles['dmgm-app__message']}
                      data-dmgm-author={m.author.username}
                    >
                      <AcvcMessage
                        writeDenied={readOnly}
                        showMessageActions
                        avatarSrc={m.author.avatarSrc}
                        avatarAlt={m.author.name}
                        username={
                          m.author.id === 'system' ? 'System' : m.author.name
                        }
                        isBot={
                          m.author.kind === 'bot' && m.author.id !== 'system'
                        }
                        timestamp={m.time}
                      >
                        {m.body ?? (
                          <p
                            className={shellStyles['channel-shell__post-text']}
                          >
                            {m.text}
                          </p>
                        )}
                      </AcvcMessage>
                    </div>
                  ))}
                </div>
              </Scrollbar>
            </div>
          )}
        </div>
        {hidden ? null : (
          <div
            className={shellStyles['channel-shell__message-input']}
            onKeyDownCapture={handleKeyDown}
          >
            {readOnly ? (
              <ReadOnlyComposer
                draft={session.draft}
                direction={direction}
                conversationName={conversation.name}
              />
            ) : (
              <MessageInput
                placeholder={`Write to ${conversation.name}`}
                value={session.draft}
                onChange={session.setDraft}
              />
            )}
          </div>
        )}
      </ChannelShell>
      {floating}
      {overlay ? (
        <div className={styles['dmgm-app__overlay']}>{overlay}</div>
      ) : null}
    </div>
  );
}
