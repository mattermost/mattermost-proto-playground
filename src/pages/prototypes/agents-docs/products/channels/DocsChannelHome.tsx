import { useEffect, useRef, useState } from 'react';
import { ChannelHeader, Message } from '@mattermost/compass-proto';
import { MessageSeparator } from '@mattermost/compass-ui/components/message-separator';
import { Scrollbar } from '@mattermost/compass-ui/components/scrollbar';
import { ThreadFooter } from '@mattermost/compass-ui/components/thread-footer';
import AgentApprovalCard from '../../../agents/components/AgentApprovalCard';
import AgentAvatar from '../../../agents/components/AgentAvatar';
import WebhookPost from '../../../agents/components/WebhookPost';
import ChannelIntro from '../../../agents/products/channels/ChannelIntro';
import ChannelsProductSidebar from '../../../agents/products/channels/ChannelsProductSidebar';
import {
  CODER,
  DOCS_CHANNEL_MESSAGES,
  DOCS_MSG_MATTY_CODER2_SYSTEM,
  DOCS_MSG_MATTY_CODER_SYSTEM,
  DOCS_MSG_MATTY_TRACKER,
  DOCS_MSG_REVIEWER_WRITER_SYSTEM,
  DOCS_MSG_MATTY_WRITER_SYSTEM,
  DOCS_MSG_JORDAN_PREVIEW,
  DOCS_SCENE_CUTOFFS,
  MATTY,
  MATTY_CODER2_DM_MESSAGES,
  MATTY_CODER_DM_MESSAGES,
  MATTY_WRITER_DM_MESSAGES,
  REVIEWER,
  REVIEWER_WRITER_DM_MESSAGES,
  WRITER,
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

type ActiveDm = {
  fromAgent: { id: string; name: string; shape: typeof MATTY.shape; color: typeof MATTY.color };
  toAgent: { id: string; name: string; shape: typeof CODER.shape; color: typeof CODER.color };
  messages: DocsAgentDmMessage[];
  anchor: DelegationDmAnchor;
};

type DocsChannelHomeProps = {
  activeScene: AgentsDocsSceneId;
};

const TRACKER_ROWS_RUNNING = [
  { id: 'tr-1', agentName: 'Coder', task: 'Running CI checks on the merged PR', status: 'running' as const },
  { id: 'tr-2', agentName: 'Reviewer', task: 'Checking the combined page (style, links)', status: 'running' as const },
];
const TRACKER_ROWS_DONE = [
  { id: 'tr-1', agentName: 'Coder', task: 'Running CI checks on the merged PR', status: 'done' as const },
  { id: 'tr-2', agentName: 'Reviewer', task: 'Checking the combined page (style, links)', status: 'done' as const },
];

const DM_DELEGATION_MAP: Record<string, {
  fromAgent: ActiveDm['fromAgent'];
  toAgent: ActiveDm['toAgent'];
  messages: DocsAgentDmMessage[];
}> = {
  [DOCS_MSG_MATTY_CODER_SYSTEM]: {
    fromAgent: { id: MATTY.id, name: MATTY.name, shape: MATTY.shape, color: MATTY.color },
    toAgent: { id: CODER.id, name: CODER.name, shape: CODER.shape, color: CODER.color },
    messages: MATTY_CODER_DM_MESSAGES,
  },
  [DOCS_MSG_MATTY_WRITER_SYSTEM]: {
    fromAgent: { id: MATTY.id, name: MATTY.name, shape: MATTY.shape, color: MATTY.color },
    toAgent: { id: WRITER.id, name: WRITER.name, shape: WRITER.shape, color: WRITER.color },
    messages: MATTY_WRITER_DM_MESSAGES,
  },
  [DOCS_MSG_REVIEWER_WRITER_SYSTEM]: {
    fromAgent: { id: REVIEWER.id, name: REVIEWER.name, shape: REVIEWER.shape, color: REVIEWER.color },
    toAgent: { id: WRITER.id, name: WRITER.name, shape: WRITER.shape, color: WRITER.color },
    messages: REVIEWER_WRITER_DM_MESSAGES,
  },
  [DOCS_MSG_MATTY_CODER2_SYSTEM]: {
    fromAgent: { id: MATTY.id, name: MATTY.name, shape: MATTY.shape, color: MATTY.color },
    toAgent: { id: CODER.id, name: CODER.name, shape: CODER.shape, color: CODER.color },
    messages: MATTY_CODER2_DM_MESSAGES,
  },
};

export default function DocsChannelHome({ activeScene }: DocsChannelHomeProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeDm, setActiveDm] = useState<ActiveDm | null>(null);
  const [previewApproved, setPreviewApproved] = useState(false);

  const cutoffId = DOCS_SCENE_CUTOFFS[activeScene] ?? DOCS_MSG_MATTY_TRACKER;
  const cutoffIndex = DOCS_CHANNEL_MESSAGES.findIndex((m) => m.id === cutoffId);
  const visibleMessages =
    cutoffIndex >= 0
      ? DOCS_CHANNEL_MESSAGES.slice(0, cutoffIndex + 1)
      : DOCS_CHANNEL_MESSAGES;

  const isApprovalScene = activeScene === 'approval';
  const isLaterThatWeek = activeScene === 'later-that-week';

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const viewport = el.closest('.simplebar-content-wrapper') as HTMLElement | null;
    if (viewport) {
      setTimeout(() => { viewport.scrollTop = viewport.scrollHeight; }, 50);
    }
  }, [activeScene]);

  function openDm(msgId: string, triggerEl: HTMLElement) {
    const def = DM_DELEGATION_MAP[msgId];
    if (!def) return;
    const rect = triggerEl.getBoundingClientRect();
    const anchor = computeDelegationAnchor(rect);
    setActiveDm({ ...def, anchor });
  }

  return (
    <div className={styles['docs-channel']}>
      <ChannelsProductSidebar />
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
                  name="#docs-site"
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
                              <p className={styles['docs-channel__post']}>{message.body}</p>
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
                            <p className={styles['docs-channel__post']}>{message.body}</p>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Jordan's preview card post
                  if (message.id === DOCS_MSG_JORDAN_PREVIEW) {
                    return (
                      <div key={message.id}>
                        <Message
                          username={message.username}
                          avatarSrc={message.avatarSrc}
                          avatarAlt={message.avatarAlt}
                          timestamp={message.timestamp}
                          footer={
                            <DocsPagePreviewCard
                              approved={previewApproved}
                              onApprove={() => setPreviewApproved(true)}
                              onReject={() => {}}
                            />
                          }
                        >
                          <p className={styles['docs-channel__post']}>{message.body}</p>
                        </Message>
                      </div>
                    );
                  }

                  // Human user posts
                  return (
                    <div key={message.id}>
                      <Message
                        username={message.username}
                        avatarSrc={message.avatarSrc}
                        avatarAlt={message.avatarAlt}
                        timestamp={message.timestamp}
                        footer={message.threadReplies ? (
                          <ThreadFooter
                            replyCount={message.threadReplies.count}
                            lastReplyTime={message.threadReplies.lastReplyTime}
                            avatars={message.threadReplies.participants.map((p) => ({
                              key: p.key,
                              id: p.key,
                              name: p.name,
                              src: p.avatarSrc ?? '',
                            }))}
                          />
                        ) : undefined}
                      >
                        <p className={styles['docs-channel__post']}>{message.body}</p>
                      </Message>
                    </div>
                  );
                })}
              </div>
            </Scrollbar>
          </div>
          <div className={styles['docs-channel__composer']}>
            <input
              type="text"
              placeholder={`Message #docs-site`}
              readOnly
              style={{
                width: '100%',
                padding: 'var(--spacing-s) var(--spacing-m)',
                borderRadius: 'var(--radius-m)',
                border: '1px solid rgba(var(--center-channel-color-rgb), 0.16)',
                background: 'transparent',
                color: 'var(--center-channel-color)',
                fontFamily: 'var(--font-family-body)',
                fontSize: 'var(--font-size-100)',
                outline: 'none',
                cursor: 'text',
              }}
            />
          </div>
        </div>
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
