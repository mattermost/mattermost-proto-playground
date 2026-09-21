import { useEffect, useRef, useState } from 'react';
import { Chip } from '@mattermost/compass-ui/components/chip';
import { MessageSeparator } from '@mattermost/compass-ui/components/message-separator';
import { RightSidebarHeader } from '@mattermost/compass-ui/components/right-sidebar-header';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { Tag } from '@mattermost/compass-ui/components/tag';
import { ThreadFooter } from '@mattermost/compass-ui/components/thread-footer';
import {
  ChannelHeader,
  Message,
  RightSidebar,
} from '@mattermost/compass-proto';
import AgentApprovalCard from '../../../agents/components/AgentApprovalCard';
import AgentAvatar from '../../../agents/components/AgentAvatar';
import { agentAvatarChipSrc } from '../../../agents/components/agentAvatarShapes';
import MentionMessageInput from '../../../agents/components/MentionMessageInput';
import mentionStyles from '../../../agents/components/MentionMessageInput.module.scss';
import WebhookPost from '../../../agents/components/WebhookPost';
import type { AgentColor, AgentShape, ChannelMessagePart } from '../../../agents/agentsData';
import ChannelIntro from '../../../agents/products/channels/ChannelIntro';
import ChannelsProductSidebar from '../../../agents/products/channels/ChannelsProductSidebar';
import {
  CODER,
  DOCS_CHANNEL_MESSAGES,
  DOCS_MSG_CODER_PR,
  DOCS_MSG_JORDAN_PREVIEW,
  DOCS_MSG_JORDAN_REACTION,
  DOCS_MSG_MATTY_CODER2_SYSTEM,
  DOCS_MSG_MATTY_CODER_SYSTEM,
  DOCS_MSG_MATTY_TRACKER,
  DOCS_MSG_MATTY_WRITER_SYSTEM,
  DOCS_MSG_PRIYA_MENTION,
  DOCS_MSG_PRIYA_REPLY,
  DOCS_MSG_REVIEWER_WRITER_SYSTEM,
  DOCS_SCENE_CUTOFFS,
  MATTY,
  MATTY_CODER2_DM_MESSAGES,
  MATTY_CODER_DM_MESSAGES,
  MATTY_WRITER_DM_MESSAGES,
  REVIEWER,
  REVIEWER_WRITER_DM_MESSAGES,
  THREAD_CODER_PR_REPLIES,
  THREAD_JORDAN_REACTION_REPLIES,
  THREAD_PRIYA_MENTION_REPLIES,
  THREAD_PRIYA_REPLY_REPLIES,
  WRITER,
  type DocThreadReply,
  type DocsAgentDmMessage,
} from '../../agentsDocsData';
import type { AgentsDocsSceneId } from '../../agentsDocsScenes';
import AgentParallelTrackerCard from '../../components/AgentParallelTrackerCard';
import DocsDelegationDM, {
  computeDelegationAnchor,
  type DelegationDmAnchor,
} from '../../components/DocsDelegationDM';
import DocsPagePreviewCard from '../../components/DocsPagePreviewCard';
import styles from './DocsChannelHome.module.scss';

// ---------------------------------------------------------------------------
// MessageBody — renders plain text or parts with mention chips
// ---------------------------------------------------------------------------

function MessageBody({ body, parts }: { body: string; parts?: ChannelMessagePart[] }) {
  if (!parts?.length) return <p className={styles['docs-channel__post']}>{body}</p>;
  return (
    <p className={mentionStyles['mention-input__post']}>
      {parts.map((part, i) =>
        part.type === 'text' ? (
          <span key={i}>{part.text}</span>
        ) : part.type === 'link' ? (
          <a key={i} href={part.href} target="_blank" rel="noreferrer">{part.text}</a>
        ) : (
          <Chip
            key={i}
            size="medium"
            compact
            leadingAvatar={{
              src:
                part.avatarSrc ||
                (part.kind === 'agent' && part.agentShape && part.agentColor
                  ? agentAvatarChipSrc(part.agentShape as AgentShape, part.agentColor as AgentColor)
                  : ''),
              alt: part.label,
            }}
            className={[
              mentionStyles['mention-input__mention-chip'],
              mentionStyles['mention-input__post-chip'],
              part.kind === 'agent' ? mentionStyles['mention-input__mention-chip--agent'] : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {part.label}
          </Chip>
        ),
      )}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ActiveDm = {
  fromAgent: { id: string; name: string; shape: AgentShape; color: AgentColor };
  toAgent: { id: string; name: string; shape: AgentShape; color: AgentColor };
  messages: DocsAgentDmMessage[];
  anchor: DelegationDmAnchor;
};

type DocsChannelHomeProps = {
  activeScene: AgentsDocsSceneId;
};

// ---------------------------------------------------------------------------
// Parallel tracker rows
// ---------------------------------------------------------------------------

const TRACKER_ROWS_RUNNING = [
  { id: 'tr-1', agentName: 'Coder', task: 'Running CI checks on the merged PR', status: 'running' as const },
  { id: 'tr-2', agentName: 'Reviewer', task: 'Checking the combined page (style, links)', status: 'running' as const },
];
const TRACKER_ROWS_DONE = [
  { id: 'tr-1', agentName: 'Coder', task: 'Running CI checks on the merged PR', status: 'done' as const },
  { id: 'tr-2', agentName: 'Reviewer', task: 'Checking the combined page (style, links)', status: 'done' as const },
];

// ---------------------------------------------------------------------------
// Delegation DM map
// ---------------------------------------------------------------------------

const DM_DELEGATION_MAP: Record<string, {
  fromAgent: { id: string; name: string; shape: AgentShape; color: AgentColor };
  toAgent: { id: string; name: string; shape: AgentShape; color: AgentColor };
  messages: DocsAgentDmMessage[];
}> = {
  [DOCS_MSG_MATTY_CODER_SYSTEM]: {
    fromAgent: { id: MATTY.id, name: MATTY.name, shape: MATTY.shape as AgentShape, color: MATTY.color as AgentColor },
    toAgent: { id: CODER.id, name: CODER.name, shape: CODER.shape, color: CODER.color },
    messages: MATTY_CODER_DM_MESSAGES,
  },
  [DOCS_MSG_MATTY_WRITER_SYSTEM]: {
    fromAgent: { id: MATTY.id, name: MATTY.name, shape: MATTY.shape as AgentShape, color: MATTY.color as AgentColor },
    toAgent: { id: WRITER.id, name: WRITER.name, shape: WRITER.shape, color: WRITER.color },
    messages: MATTY_WRITER_DM_MESSAGES,
  },
  [DOCS_MSG_REVIEWER_WRITER_SYSTEM]: {
    fromAgent: { id: REVIEWER.id, name: REVIEWER.name, shape: REVIEWER.shape, color: REVIEWER.color },
    toAgent: { id: WRITER.id, name: WRITER.name, shape: WRITER.shape, color: WRITER.color },
    messages: REVIEWER_WRITER_DM_MESSAGES,
  },
  [DOCS_MSG_MATTY_CODER2_SYSTEM]: {
    fromAgent: { id: MATTY.id, name: MATTY.name, shape: MATTY.shape as AgentShape, color: MATTY.color as AgentColor },
    toAgent: { id: CODER.id, name: CODER.name, shape: CODER.shape, color: CODER.color },
    messages: MATTY_CODER2_DM_MESSAGES,
  },
};

// ---------------------------------------------------------------------------
// Thread reply map
// ---------------------------------------------------------------------------

const THREAD_REPLIES_BY_ID: Record<string, DocThreadReply[]> = {
  [DOCS_MSG_PRIYA_MENTION]: THREAD_PRIYA_MENTION_REPLIES,
  [DOCS_MSG_PRIYA_REPLY]: THREAD_PRIYA_REPLY_REPLIES,
  [DOCS_MSG_JORDAN_REACTION]: THREAD_JORDAN_REACTION_REPLIES,
  [DOCS_MSG_CODER_PR]: THREAD_CODER_PR_REPLIES,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DocsChannelHome({ activeScene }: DocsChannelHomeProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeDm, setActiveDm] = useState<ActiveDm | null>(null);
  const [previewApproved, setPreviewApproved] = useState(false);
  const [activePostId, setActivePostId] = useState<string | null>(null);

  const openThread = (postId: string) => setActivePostId(postId);
  const closeThread = () => setActivePostId(null);

  const cutoffId = DOCS_SCENE_CUTOFFS[activeScene] ?? DOCS_MSG_MATTY_TRACKER;
  const cutoffIndex = DOCS_CHANNEL_MESSAGES.findIndex((m) => m.id === cutoffId);
  const visibleMessages =
    cutoffIndex >= 0
      ? DOCS_CHANNEL_MESSAGES.slice(0, cutoffIndex + 1)
      : DOCS_CHANNEL_MESSAGES;

  const isApprovalScene = activeScene === 'approval';
  const isLaterThatWeek = activeScene === 'later-that-week';

  // Scroll to bottom when scene changes
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const viewport = el.closest('.simplebar-content-wrapper') as HTMLElement | null;
    if (viewport) {
      setTimeout(() => { viewport.scrollTop = viewport.scrollHeight; }, 50);
    }
  }, [activeScene]);

  // Close thread when scene changes
  useEffect(() => {
    setActivePostId(null);
  }, [activeScene]);

  function openDm(msgId: string, triggerEl: HTMLElement) {
    const def = DM_DELEGATION_MAP[msgId];
    if (!def) return;
    const rect = triggerEl.getBoundingClientRect();
    const anchor = computeDelegationAnchor(rect);
    setActiveDm({ ...def, anchor });
  }

  // Thread content
  const currentThreadReplies = activePostId ? (THREAD_REPLIES_BY_ID[activePostId] ?? []) : [];
  const rootMessage = activePostId
    ? DOCS_CHANNEL_MESSAGES.find((m) => m.id === activePostId) ?? null
    : null;

  const threadReplyCount = currentThreadReplies.length;

  return (
    <div className={styles['docs-channel']}>
      <ChannelsProductSidebar activeChannelName="docs-site" />
      <div className={styles['docs-channel__inner']}>
        <div className={styles['docs-channel__center']}>
          <ChannelHeader
            type="channel"
            name="docs-site"
            description="Docs site updates, reviews, and deploy coordination."
            memberCount={5}
            pinnedCount={0}
          />
          <div className={styles['docs-channel__messages']}>
            <Scrollbar>
              <div ref={scrollRef} className={styles['docs-channel__messages-list']}>
                <ChannelIntro
                  name="docs-site"
                  createdBy="Jordan Lee"
                  createdAt="Jan 12"
                  description="Channel for docs site updates, reviews, and deploy coordination."
                  variant="public"
                />
                <MessageSeparator type="date" label="Today" />

                {visibleMessages.map((message) => {
                  // System notices (delegation DM triggers)
                  if (message.kind === 'system') {
                    const isActionable = !!message.actionable && !!DM_DELEGATION_MAP[message.id];
                    return (
                      <button
                        key={message.id}
                        type="button"
                        className={styles['docs-channel__system']}
                        onClick={isActionable ? (e) => openDm(message.id, e.currentTarget) : undefined}
                        style={isActionable ? undefined : { cursor: 'default' }}
                      >
                        <p>{message.body}</p>
                      </button>
                    );
                  }

                  // Webhook posts (Monitor uptime alert)
                  if (message.kind === 'webhook' && message.webhookPost) {
                    return (
                      <div key={message.id} className={styles['docs-channel__agent-message']}>
                        <div className={styles['docs-channel__agent-message-avatar']}>
                          <AgentAvatar
                            shape={message.agentShape ?? 'shield'}
                            color={message.agentColor ?? 'blue'}
                            size="sm"
                            eyes
                          />
                        </div>
                        <div className={styles['docs-channel__agent-message-body']}>
                          <div className={styles['docs-channel__agent-message-meta']}>
                            <span className={styles['docs-channel__agent-message-name']}>{message.username}</span>
                            <Tag label="Agent" size="x-small" />
                            <time className={styles['docs-channel__agent-message-time']}>{message.timestamp}</time>
                          </div>
                          <WebhookPost data={message.webhookPost} />
                        </div>
                      </div>
                    );
                  }

                  // Agent posts
                  if (message.kind === 'agent') {
                    const isTracker = message.id === DOCS_MSG_MATTY_TRACKER;
                    const trackerDone = isApprovalScene || isLaterThatWeek;

                    return (
                      <div key={message.id} className={styles['docs-channel__agent-message']}>
                        <div className={styles['docs-channel__agent-message-avatar']}>
                          <AgentAvatar
                            shape={message.agentShape ?? 'sphere'}
                            color={message.agentColor ?? 'yellow'}
                            size="sm"
                            eyes
                          />
                        </div>
                        <div className={styles['docs-channel__agent-message-body']}>
                          <div className={styles['docs-channel__agent-message-meta']}>
                            <span className={styles['docs-channel__agent-message-name']}>{message.username}</span>
                            <Tag label="Agent" size="x-small" />
                            <time className={styles['docs-channel__agent-message-time']}>{message.timestamp}</time>
                          </div>
                          {isTracker ? (
                            <div className={styles['docs-channel__card']}>
                              <AgentParallelTrackerCard
                                rows={trackerDone ? TRACKER_ROWS_DONE : TRACKER_ROWS_RUNNING}
                                allDone={trackerDone}
                              />
                            </div>
                          ) : message.agentReviewCard ? (
                            <>
                              <MessageBody body={message.body} parts={message.parts} />
                              <div className={styles['docs-channel__card']}>
                                <AgentApprovalCard
                                  title={message.agentReviewCard.name}
                                  description={message.agentReviewCard.description}
                                  agentShape={WRITER.shape}
                                  agentColor={WRITER.color}
                                  accepted={true}
                                  dismissed={false}
                                  onApprove={() => {}}
                                  onDismiss={() => {}}
                                />
                              </div>
                            </>
                          ) : (
                            <MessageBody body={message.body} parts={message.parts} />
                          )}
                          {message.threadReplies && (
                            <div className={styles['docs-channel__thread-footer']}>
                              <ThreadFooter
                                replyCount={message.threadReplies.count}
                                lastReplyTime={message.threadReplies.lastReplyTime}
                                avatars={message.threadReplies.participants.map((p) => ({
                                  key: p.key,
                                  name: p.name,
                                  src:
                                    p.agentShape && p.agentColor
                                      ? agentAvatarChipSrc(p.agentShape as AgentShape, p.agentColor as AgentColor)
                                      : (p.avatarSrc ?? ''),
                                }))}
                                onReply={() => openThread(message.id)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Jordan's preview card post
                  if (message.id === DOCS_MSG_JORDAN_PREVIEW) {
                    return (
                      <div key={message.id} className={styles['docs-channel__message-row']}>
                        <Message
                          username={message.username}
                          avatarSrc={message.avatarSrc}
                          avatarAlt={message.avatarAlt}
                          timestamp={message.timestamp}
                          showMessageActions={false}
                        >
                          <MessageBody body={message.body} parts={message.parts} />
                          <DocsPagePreviewCard
                            approved={previewApproved}
                            onApprove={() => setPreviewApproved(true)}
                            onReject={() => {}}
                          />
                        </Message>
                      </div>
                    );
                  }

                  // Human user posts
                  const hasThread = !!message.threadReplies && !!THREAD_REPLIES_BY_ID[message.id];
                  return (
                    <div
                      key={message.id}
                      className={[
                        styles['docs-channel__message-row'],
                        hasThread ? styles['docs-channel__message-row--threaded'] : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      role={hasThread ? 'button' : undefined}
                      tabIndex={hasThread ? 0 : undefined}
                      onClick={hasThread ? () => openThread(message.id) : undefined}
                      onKeyDown={
                        hasThread
                          ? (e) => { if (e.key === 'Enter') openThread(message.id); }
                          : undefined
                      }
                    >
                      <Message
                        username={message.username}
                        avatarSrc={message.avatarSrc}
                        avatarAlt={message.avatarAlt}
                        timestamp={message.timestamp}
                        showMessageActions={false}
                      >
                        <MessageBody body={message.body} parts={message.parts} />
                      </Message>
                      {message.threadReplies && (
                        <div className={styles['docs-channel__thread-footer']}>
                          <ThreadFooter
                            replyCount={message.threadReplies.count}
                            lastReplyTime={message.threadReplies.lastReplyTime}
                            avatars={message.threadReplies.participants.map((p) => ({
                              key: p.key,
                              name: p.name,
                              src:
                                p.agentShape && p.agentColor
                                  ? agentAvatarChipSrc(p.agentShape as AgentShape, p.agentColor as AgentColor)
                                  : (p.avatarSrc ?? ''),
                            }))}
                            onReply={() => openThread(message.id)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Scrollbar>
          </div>
          <div className={styles['docs-channel__composer']}>
            <MentionMessageInput
              placeholder="Write to docs-site"
              onSend={() => undefined}
            />
          </div>
        </div>

        {/* Thread RHS */}
        {activePostId && (
          <div className={styles['docs-channel__thread-rhs']}>
            <RightSidebar
              alignBody="end"
              header={
                <RightSidebarHeader
                  title="Thread"
                  onClose={closeThread}
                />
              }
              footer={
                <div className={styles['docs-channel__rhs-composer']}>
                  <MentionMessageInput placeholder="Reply in thread…" onSend={() => undefined} />
                </div>
              }
            >
              <div className={styles['docs-channel__rhs-thread-messages']}>
                {/* Root post */}
                {rootMessage?.kind === 'agent' && (
                  <div className={styles['docs-channel__agent-message']}>
                    <div className={styles['docs-channel__agent-message-avatar']}>
                      <AgentAvatar
                        shape={rootMessage.agentShape ?? 'sphere'}
                        color={rootMessage.agentColor ?? 'yellow'}
                        size="sm"
                        eyes
                      />
                    </div>
                    <div className={styles['docs-channel__agent-message-body']}>
                      <div className={styles['docs-channel__agent-message-meta']}>
                        <span className={styles['docs-channel__agent-message-name']}>{rootMessage.username}</span>
                        <Tag label="Agent" size="x-small" />
                        <time className={styles['docs-channel__agent-message-time']}>{rootMessage.timestamp}</time>
                      </div>
                      <MessageBody body={rootMessage.body} parts={rootMessage.parts} />
                    </div>
                  </div>
                )}
                {rootMessage?.kind !== 'agent' && rootMessage && (
                  <div className={styles['docs-channel__message-row']}>
                    <Message
                      avatarSrc={rootMessage.avatarSrc}
                      avatarAlt={rootMessage.avatarAlt}
                      username={rootMessage.username}
                      timestamp={rootMessage.timestamp}
                      showMessageActions={false}
                    >
                      <MessageBody body={rootMessage.body} parts={rootMessage.parts} />
                    </Message>
                  </div>
                )}

                {/* Reply separator */}
                {threadReplyCount > 0 && (
                  <MessageSeparator
                    type="reply-count"
                    label={`${threadReplyCount} ${threadReplyCount === 1 ? 'reply' : 'replies'}`}
                  />
                )}

                {/* Thread replies */}
                {currentThreadReplies.map((reply, i) =>
                  reply.agentShape ? (
                    <div key={i} className={styles['docs-channel__agent-message']}>
                      <div className={styles['docs-channel__agent-message-avatar']}>
                        <AgentAvatar
                          shape={reply.agentShape}
                          color={reply.agentColor ?? 'yellow'}
                          size="sm"
                          eyes
                        />
                      </div>
                      <div className={styles['docs-channel__agent-message-body']}>
                        <div className={styles['docs-channel__agent-message-meta']}>
                          <span className={styles['docs-channel__agent-message-name']}>{reply.username}</span>
                          <Tag label="Agent" size="x-small" />
                          <time className={styles['docs-channel__agent-message-time']}>{reply.timestamp}</time>
                        </div>
                        <p className={styles['docs-channel__post']}>{reply.body}</p>
                      </div>
                    </div>
                  ) : (
                    <div key={i} className={styles['docs-channel__message-row']}>
                      <Message
                        avatarSrc={reply.avatarSrc}
                        avatarAlt={reply.avatarAlt}
                        username={reply.username}
                        timestamp={reply.timestamp}
                        showMessageActions={false}
                      >
                        <p className={styles['docs-channel__post']}>{reply.body}</p>
                      </Message>
                    </div>
                  ),
                )}
              </div>
            </RightSidebar>
          </div>
        )}
      </div>

      {/* Delegation DM popovers */}
      {activeDm && (
        <DocsDelegationDM
          fromAgent={activeDm.fromAgent}
          toAgent={activeDm.toAgent}
          messages={activeDm.messages}
          anchor={activeDm.anchor}
          open={true}
          onClose={() => setActiveDm(null)}
        />
      )}
    </div>
  );
}
