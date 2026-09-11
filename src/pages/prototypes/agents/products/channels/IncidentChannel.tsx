import { useState } from 'react';
import { useExitAnimation } from '@/hooks/useExitAnimation';
import { Chip } from '@mattermost/compass-ui/components/chip';
import { Message } from '@mattermost/compass-ui/components/message';
import { MessageSeparator } from '@mattermost/compass-ui/components/message-separator';
import { RightSidebarHeader } from '@mattermost/compass-ui/components/right-sidebar';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { ThreadFooter } from '@mattermost/compass-ui/components/thread-footer';
import {
  ChannelHeader,
  RightSidebar,
  RightSidebarThread,
  type RightSidebarThreadMessage,
} from '@mattermost/compass-proto';
import {
  CIPHER,
  INCIDENT_CHANNEL_MESSAGES,
  SENTINEL_DEFAULT,
  WORKSPACE_AGENTS,
  type ChannelMessage,
  type WorkspaceAgent,
} from '../../agentsData';
import AgentAvatar from '../../components/AgentAvatar';
import AgentProfilePopover, {
  profileAnchorFromEvent,
  type AgentProfileAnchor,
} from '../../components/AgentProfilePopover';
import { agentAvatarChipSrc } from '../../components/agentAvatarShapes';
import JiraCard from '../../components/JiraCard';
import MentionMessageInput from '../../components/MentionMessageInput';
import mentionStyles from '../../components/MentionMessageInput.module.scss';
import PlaybookRunRhs from '../../components/PlaybookRunRhs';
import ChannelsProductSidebar from './ChannelsProductSidebar';
import styles from './IncidentChannel.module.scss';

type OnAgentClick = (agent: WorkspaceAgent, e: React.MouseEvent<HTMLElement>) => void;

function agentForMessage(message: ChannelMessage): WorkspaceAgent | null {
  if (!message.agentShape || !message.agentColor) return null;
  return (
    WORKSPACE_AGENTS.find(
      (a) => a.shape === message.agentShape && a.color === message.agentColor,
    ) ?? null
  );
}

function agentById(id: string): WorkspaceAgent | undefined {
  return WORKSPACE_AGENTS.find((a) => a.id === id);
}

function renderParts(message: ChannelMessage, onAgentClick: OnAgentClick) {
  if (!message.parts?.length) {
    return <p className={styles['incident-channel__post']}>{message.body}</p>;
  }
  return (
    <p className={mentionStyles['mention-input__post']}>
      {message.parts.map((part, i) =>
        part.type === 'text' ? (
          <span key={i}>{part.text}</span>
        ) : (
          <Chip
            key={i}
            size="medium-compact"
            leadingAvatar={{
              src:
                part.agentShape && part.agentColor
                  ? agentAvatarChipSrc(part.agentShape, part.agentColor)
                  : part.avatarSrc || '',
              alt: part.label,
            }}
            className={[
              mentionStyles['mention-input__mention-chip'],
              mentionStyles['mention-input__post-chip'],
              part.kind === 'agent' ? mentionStyles['mention-input__mention-chip--agent'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={(e) => {
              if (part.kind === 'agent' && part.id) {
                const agent = agentById(part.id);
                if (agent) onAgentClick(agent, e as React.MouseEvent<HTMLElement>);
              }
            }}
          >
            {part.label}
          </Chip>
        ),
      )}
    </p>
  );
}

function AgentPost({
  message,
  onAgentClick,
  onOpenThread,
}: {
  message: ChannelMessage;
  onAgentClick: OnAgentClick;
  onOpenThread: () => void;
}) {
  const agent = agentForMessage(message);
  return (
    <article className={styles['incident-channel__agent-message']}>
      <div
        className={styles['incident-channel__agent-message-avatar']}
        role={agent ? 'button' : undefined}
        tabIndex={agent ? 0 : undefined}
        style={{ cursor: agent ? 'pointer' : undefined }}
        onClick={(e) => agent && onAgentClick(agent, e)}
        onKeyDown={(e) => {
          if (agent && (e.key === 'Enter' || e.key === ' ')) {
            onAgentClick(agent, e as unknown as React.MouseEvent<HTMLElement>);
          }
        }}
      >
        <AgentAvatar
          shape={message.agentShape ?? 'sphere'}
          color={message.agentColor ?? 'blue'}
          size="sm"
          eyes
          shadow={false}
        />
      </div>
      <div className={styles['incident-channel__agent-message-body']}>
        <div className={styles['incident-channel__agent-message-meta']}>
          <span className={styles['incident-channel__agent-message-name']}>
            {message.username}
          </span>
          <time className={styles['incident-channel__agent-message-time']}>
            {message.timestamp}
          </time>
        </div>
        {renderParts(message, onAgentClick)}
        {message.jiraCard ? <JiraCard card={message.jiraCard} /> : null}
        {message.threadReplies ? (
          <div className={styles['incident-channel__thread-footer']}>
            <ThreadFooter
              replyCount={message.threadReplies.count}
              lastReplyTime={message.threadReplies.lastReplyTime}
              avatars={message.threadReplies.participants.map((p) => ({
                key: p.key,
                name: p.name,
                src:
                  p.agentShape && p.agentColor
                    ? agentAvatarChipSrc(p.agentShape, p.agentColor)
                    : p.avatarSrc,
              }))}
              onReply={onOpenThread}
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}

const THREAD_MESSAGES: RightSidebarThreadMessage[] = [
  {
    avatarSrc: agentAvatarChipSrc(SENTINEL_DEFAULT.shape, SENTINEL_DEFAULT.color),
    avatarAlt: SENTINEL_DEFAULT.name,
    username: SENTINEL_DEFAULT.name,
    timestamp: '2:16 PM',
    body: "PayForge webhook error rate hit 5.2% at 2:14 PM — threshold is 5%. Error onset matches the deployment of build 8842 exactly at T+0. Signature doesn't point to one cause cleanly. Cipher, can you dig in?",
  },
  {
    avatarSrc: agentAvatarChipSrc(CIPHER.shape, CIPHER.color),
    avatarAlt: CIPHER.name,
    username: CIPHER.name,
    timestamp: '2:18 PM',
    body: 'Analyzed 847 error traces from build 8842. Root cause: the new webhook retry handler drops the Authorization header on redirect. The 5% error spike is pure auth failures — downstream payment gateway is rejecting unsigned requests. Fix: restore header propagation in WebhookClient.sendWithRetry. P1 — every retry is a failed transaction.',
  },
];

const THREAD_RHS_EXIT_MS = 300;

/** Incident channel view — INC-4471 with playbook run RHS open. */
export default function IncidentChannel() {
  const [threadOpen, setThreadOpen] = useState(false);
  const { rendered: threadRendered, exiting: threadExiting } = useExitAnimation(
    threadOpen,
    THREAD_RHS_EXIT_MS,
  );
  const [profileTarget, setProfileTarget] = useState<AgentProfileAnchor | null>(null);

  const openAgentProfile: OnAgentClick = (agent, event) => {
    setProfileTarget(profileAnchorFromEvent(agent, event));
  };

  return (
    <div className={styles['incident-channel']}>
      <ChannelsProductSidebar />
      <div className={styles['incident-channel__inner']}>
        <div className={styles['incident-channel__center']}>
          <ChannelHeader
            type="channel"
            name="INC-4471"
            description="Checkout failures during peak traffic — PayForge webhook regression."
            memberCount={7}
            pinnedCount={0}
          />
          <div className={styles['incident-channel__messages']}>
            <Scrollbar>
              <div className={styles['incident-channel__messages-list']}>
                <MessageSeparator type="date" label="Today" />
                {INCIDENT_CHANNEL_MESSAGES.map((message) => {
                  if (message.kind === 'system') {
                    return (
                      <div
                        key={message.id}
                        className={styles['incident-channel__system']}
                        role="status"
                      >
                        <p>
                          {message.parts?.length
                            ? message.parts.map((part, i) =>
                                part.type === 'text' ? (
                                  <span key={i}>{part.text}</span>
                                ) : (
                                  <Chip
                                    key={i}
                                    size="small"
                                    leadingAvatar={{
                                      src:
                                        part.agentShape && part.agentColor
                                          ? agentAvatarChipSrc(
                                              part.agentShape,
                                              part.agentColor,
                                            )
                                          : part.avatarSrc || '',
                                      alt: part.label,
                                    }}
                                    className={[
                                      mentionStyles['mention-input__mention-chip'],
                                      mentionStyles['mention-input__post-chip'],
                                      mentionStyles['mention-input__post-chip--system'],
                                    ].join(' ')}
                                  >
                                    {part.label}
                                  </Chip>
                                ),
                              )
                            : message.body}
                        </p>
                      </div>
                    );
                  }

                  if (message.kind === 'agent') {
                    return (
                      <AgentPost
                        key={message.id}
                        message={message}
                        onAgentClick={openAgentProfile}
                        onOpenThread={() => setThreadOpen(true)}
                      />
                    );
                  }

                  return (
                    <Message
                      key={message.id}
                      avatarSrc={message.avatarSrc}
                      avatarAlt={message.avatarAlt}
                      username={message.username}
                      timestamp={message.timestamp}
                      showMessageActions={false}
                    >
                      <p className={styles['incident-channel__post']}>{message.body}</p>
                    </Message>
                  );
                })}
              </div>
            </Scrollbar>
          </div>
          <div className={styles['incident-channel__composer']}>
            <MentionMessageInput
              placeholder="Write to INC-4471"
              onSend={() => undefined}
            />
          </div>
        </div>
        <div className={styles['incident-channel__rhs']}>
          {/* Playbook sidebar — always mounted underneath */}
          <RightSidebar
            header={
              <RightSidebarHeader
                title="Run details"
                secondaryTitle="Incident Response Checklist v1"
                onExpand={() => undefined}
                onClose={() => undefined}
              />
            }
          >
            <PlaybookRunRhs />
          </RightSidebar>

          {/* Thread panel — slides in from right on top of playbook */}
          {threadRendered && (
            <div
              className={[
                styles['incident-channel__rhs-thread'],
                threadExiting ? styles['incident-channel__rhs-thread--exiting'] : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <RightSidebar
                alignBody="end"
                header={
                  <RightSidebarHeader
                    title="Thread"
                    secondaryTitle="INC-4471"
                    onExpand={() => undefined}
                    onClose={() => setThreadOpen(false)}
                  />
                }
                footer={
                  <div className={styles['incident-channel__rhs-composer']}>
                    <MentionMessageInput
                      placeholder="Reply in thread…"
                      onSend={() => undefined}
                    />
                  </div>
                }
              >
                <RightSidebarThread messages={THREAD_MESSAGES} replySeparatorLabel="1 Reply" />
              </RightSidebar>
            </div>
          )}
        </div>
      </div>
      <AgentProfilePopover
        target={profileTarget}
        onClose={() => setProfileTarget(null)}
      />
    </div>
  );
}
