import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import ChannelShell from '@/components/ui/ChannelShell/ChannelShell';
import Message from '@/components/ui/Message/Message';
import MessageReactions from '@/components/ui/MessageReactions/MessageReactions';
import MessageSeparator from '@/components/ui/MessageSeparator/MessageSeparator';
import Modal from '@/components/ui/Modal/Modal';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import RightSidebar, {
  RightSidebarHeader,
} from '@/components/ui/RightSidebar';
import type {
  AttrType,
  DisplayWhere,
} from '@/pages/AttributeManagementHub/hubData';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import shellStyles from '@/components/ui/ChannelShell/ChannelShell.module.scss';
import PostAttributeSummary from './PostAttributeSummary';
import PostAttributesThreadSidebar, {
  type AttributeRevealMode,
} from './PostAttributesThreadSidebar';
import { PostAttributeAddMenu } from './postAttributeAddMenu';
import ThreadReplyMessageInput from './ThreadReplyMessageInput';
import ChannelHeaderAttributeChips from './ChannelHeaderAttributeChips';
import ChannelAttributeHeaderStack from './ChannelAttributeHeaderStack';
import ChannelClassificationBanner from './ChannelClassificationBanner';
import {
  CHANNEL_INFO_SEED,
  channelClassificationBanner,
  type ChannelDemoState,
} from './channelViewData';
import {
  THREAD_ROOT,
  addAttributeToPost,
  addCustomAttributeToPost,
  addCustomAttributeValueOnPost,
  buildPostAttributesFromComposer,
  formatChannelPostTime,
  postScopedAttributes,
  removeAttributeFromPost,
  removeCustomAttributeFromPost,
  updateAttributeValueOnPost,
  updateCustomAttributeOnPost,
  type ThreadDemoPost,
} from './postViewData';
import styles from './ChannelThreadView.module.scss';

export type { AttributeRevealMode };

export interface ChannelThreadViewProps {
  onCreateAttribute?: () => void;
  onEditAttribute?: (attributeId: string) => void;
  /**
   * `thread` — channel + RHS (default).
   * `modal` — same screen, attributes editor modal starts open.
   */
  attributeReveal?: AttributeRevealMode;
}

const LEONARD_POST_ID = THREAD_ROOT.id;

function ClickableThreadPost({
  postId,
  selected,
  onOpen,
  children,
}: {
  postId: string;
  selected: boolean;
  onOpen: (postId: string) => void;
  children: ReactNode;
}) {
  return (
    <div
      className={[
        styles['channel-thread-view__thread-root-wrap'],
        styles['channel-thread-view__thread-root-wrap--clickable'],
        selected ? styles['channel-thread-view__thread-root-wrap--selected'] : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={() => onOpen(postId)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen(postId);
        }
      }}
      role="button"
      tabIndex={0}
    >
      {children}
    </div>
  );
}

export default function ChannelThreadView({
  onCreateAttribute,
  onEditAttribute,
  attributeReveal = 'thread',
}: ChannelThreadViewProps) {
  const startWithModal = attributeReveal === 'modal';

  const [threadSidebarOpen, setThreadSidebarOpen] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState(LEONARD_POST_ID);
  const [attributesModalPostId, setAttributesModalPostId] = useState<
    string | null
  >(() => (startWithModal ? LEONARD_POST_ID : null));
  const [channel] = useState<ChannelDemoState>(CHANNEL_INFO_SEED);
  const classificationBanner = channelClassificationBanner(channel);
  const channelClassificationValueId =
    channel.attributes.find((row) => row.attributeId === 'classification')
      ?.valueId ?? 's';
  const [leonardPost, setLeonardPost] = useState<ThreadDemoPost>(() => ({
    ...THREAD_ROOT,
    avatarSrc: avatarLeonard,
  }));
  const [userPosts, setUserPosts] = useState<ThreadDemoPost[]>([]);
  const [postShowWhereById] = useState<Record<string, DisplayWhere[]>>({});
  const [addPickerOpen, setAddPickerOpen] = useState(false);
  const [addPickerPostId, setAddPickerPostId] = useState<string | null>(null);
  const addPickerAnchorRef = useRef<HTMLElement | null>(null);

  const allPostAttributes = useMemo(() => postScopedAttributes(), []);

  const postAttributesById = useMemo(() => {
    const map = new Map(
      allPostAttributes.map((attribute) => [attribute.id, attribute]),
    );
    return map;
  }, [allPostAttributes]);

  const selectedPost = useMemo(() => {
    if (selectedPostId === LEONARD_POST_ID) return leonardPost;
    return userPosts.find((post) => post.id === selectedPostId) ?? leonardPost;
  }, [leonardPost, selectedPostId, userPosts]);

  const attributesModalPost = useMemo(() => {
    if (!attributesModalPostId) return null;
    if (attributesModalPostId === LEONARD_POST_ID) return leonardPost;
    return (
      userPosts.find((post) => post.id === attributesModalPostId) ?? leonardPost
    );
  }, [attributesModalPostId, leonardPost, userPosts]);

  const addPickerPost = useMemo(() => {
    if (!addPickerPostId) return null;
    if (addPickerPostId === LEONARD_POST_ID) return leonardPost;
    return userPosts.find((post) => post.id === addPickerPostId) ?? leonardPost;
  }, [addPickerPostId, leonardPost, userPosts]);

  const openThread = useCallback((postId: string) => {
    setSelectedPostId(postId);
    setThreadSidebarOpen(true);
  }, []);

  const openAttributesModal = useCallback((postId: string) => {
    setAttributesModalPostId(postId);
  }, []);

  const closeAttributesModal = useCallback(() => {
    setAttributesModalPostId(null);
  }, []);

  const openAddAttributePicker = useCallback(
    (postId: string, anchor: HTMLElement) => {
      addPickerAnchorRef.current = anchor;
      setAddPickerPostId(postId);
      setAddPickerOpen(true);
    },
    [],
  );

  const closeAddAttributePicker = useCallback(() => {
    setAddPickerOpen(false);
    setAddPickerPostId(null);
  }, []);

  const applyPostUpdate = useCallback(
    (postId: string, updater: (post: ThreadDemoPost) => ThreadDemoPost) => {
      if (postId === LEONARD_POST_ID) {
        setLeonardPost((current) => updater(current));
        return;
      }
      setUserPosts((current) =>
        current.map((post) => (post.id === postId ? updater(post) : post)),
      );
    },
    [],
  );

  const handlePost = useCallback(
    ({
      body,
      attachedIds,
      valuesById,
    }: {
      body: string;
      attachedIds: string[];
      valuesById: Record<string, string>;
    }) => {
      const id = `post-user-${Date.now()}`;
      const newPost: ThreadDemoPost = {
        id,
        author: 'Leonard Riley',
        avatarSrc: avatarLeonard,
        avatarAlt: 'Leonard Riley',
        timestamp: formatChannelPostTime(),
        body,
        attributes: buildPostAttributesFromComposer(attachedIds, valuesById),
      };
      setUserPosts((current) => [...current, newPost]);
      setSelectedPostId(id);
      setThreadSidebarOpen(true);
    },
    [],
  );

  const handleAddAttribute = useCallback(
    (postId: string, attributeId: string) => {
      applyPostUpdate(postId, (post) => addAttributeToPost(post, attributeId));
    },
    [applyPostUpdate],
  );

  const handleAddCustomAttribute = useCallback(
    (postId: string, type: AttrType) => {
      applyPostUpdate(postId, (post) => addCustomAttributeToPost(post, type));
    },
    [applyPostUpdate],
  );

  const handleUpdateCustomAttribute = useCallback(
    (
      postId: string,
      attributeId: string,
      patch: Parameters<typeof updateCustomAttributeOnPost>[2],
    ) => {
      applyPostUpdate(postId, (post) =>
        updateCustomAttributeOnPost(post, attributeId, patch),
      );
    },
    [applyPostUpdate],
  );

  const handleAddCustomAttributeValue = useCallback(
    (postId: string, attributeId: string, label: string) => {
      applyPostUpdate(postId, (post) =>
        addCustomAttributeValueOnPost(post, attributeId, label),
      );
    },
    [applyPostUpdate],
  );

  const handleRemoveAttribute = useCallback(
    (postId: string, attributeId: string) => {
      applyPostUpdate(postId, (post) =>
        removeAttributeFromPost(post, attributeId),
      );
    },
    [applyPostUpdate],
  );

  const handleRemoveCustomAttribute = useCallback(
    (postId: string, attributeId: string) => {
      applyPostUpdate(postId, (post) =>
        removeCustomAttributeFromPost(post, attributeId),
      );
    },
    [applyPostUpdate],
  );

  const handleRenameCustomAttribute = useCallback(
    (postId: string, attributeId: string, name: string) => {
      applyPostUpdate(postId, (post) =>
        updateCustomAttributeOnPost(post, attributeId, { name }),
      );
    },
    [applyPostUpdate],
  );

  const handleUpdateAttributeValue = useCallback(
    (postId: string, attributeId: string, valueId: string) => {
      applyPostUpdate(postId, (post) =>
        updateAttributeValueOnPost(post, attributeId, valueId),
      );
    },
    [applyPostUpdate],
  );

  const summaryHandlers = (postId: string) => ({
    onEditAttribute,
    onRemoveAttribute: (attributeId: string) =>
      handleRemoveAttribute(postId, attributeId),
    onRemoveCustomAttribute: (attributeId: string) =>
      handleRemoveCustomAttribute(postId, attributeId),
    onRenameCustomAttribute: (attributeId: string, name: string) =>
      handleRenameCustomAttribute(postId, attributeId, name),
    onUpdateCustomAttribute: (
      attributeId: string,
      patch: Parameters<typeof updateCustomAttributeOnPost>[2],
    ) => handleUpdateCustomAttribute(postId, attributeId, patch),
    onAddCustomAttributeValue: (attributeId: string, label: string) =>
      handleAddCustomAttributeValue(postId, attributeId, label),
    onUpdateAttributeValue: (attributeId: string, valueId: string) =>
      handleUpdateAttributeValue(postId, attributeId, valueId),
    showWhereById: postShowWhereById,
  });

  const centerSummaryProps = (postId: string) => ({
    ...summaryHandlers(postId),
    onEditAttributes: () => openAttributesModal(postId),
    onAddAttributeClick: (anchor: HTMLElement) =>
      openAddAttributePicker(postId, anchor),
  });

  return (
    <>
      <ChannelShell
        userAvatarSrc={avatarLeonard}
        userAvatarAlt="Leonard Riley"
        channelHeader={
          <ChannelAttributeHeaderStack
            titleBar={
              <ChannelHeader
                type="Channel"
                name="field-coordination"
                memberCount={28}
                pinnedCount={2}
                favorited
              />
            }
            chips={<ChannelHeaderAttributeChips channel={channel} />}
            banner={
              classificationBanner ? (
                <ChannelClassificationBanner
                  valueId={classificationBanner.valueId}
                  label={classificationBanner.label}
                />
              ) : undefined
            }
          />
        }
        trailing={
          threadSidebarOpen ? (
            <RightSidebar
              alignBody="start"
              className={shellStyles['channel-shell__right-sidebar']}
              header={
                <ChannelAttributeHeaderStack
                  titleBar={
                    <RightSidebarHeader
                      title="Thread"
                      secondaryTitle="field-coordination"
                      onExpand={() => {}}
                      onClose={() => setThreadSidebarOpen(false)}
                    />
                  }
                  chips={<ChannelHeaderAttributeChips channel={channel} />}
                  banner={
                    classificationBanner ? (
                      <ChannelClassificationBanner
                        valueId={classificationBanner.valueId}
                        label={classificationBanner.label}
                      />
                    ) : undefined
                  }
                />
              }
              footer={
                <div className={shellStyles['channel-shell__message-input']}>
                  <ThreadReplyMessageInput
                    placeholder="Reply to thread…"
                    width="narrow"
                    postAttributes={allPostAttributes}
                    showWhereById={postShowWhereById}
                    channelClassificationValueId={channelClassificationValueId}
                    onCreateAttribute={onCreateAttribute}
                  />
                </div>
              }
            >
              <PostAttributesThreadSidebar
                post={selectedPost}
                postAttributesById={postAttributesById}
                onAddAttribute={(attributeId) =>
                  handleAddAttribute(selectedPostId, attributeId)
                }
                onAddCustomAttribute={(type) =>
                  handleAddCustomAttribute(selectedPostId, type)
                }
                onUpdateCustomAttribute={(attributeId, patch) =>
                  handleUpdateCustomAttribute(
                    selectedPostId,
                    attributeId,
                    patch,
                  )
                }
                onAddCustomAttributeValue={(attributeId, label) =>
                  handleAddCustomAttributeValue(
                    selectedPostId,
                    attributeId,
                    label,
                  )
                }
                onRemoveAttribute={(attributeId) =>
                  handleRemoveAttribute(selectedPostId, attributeId)
                }
                onRemoveCustomAttribute={(attributeId) =>
                  handleRemoveCustomAttribute(selectedPostId, attributeId)
                }
                onRenameCustomAttribute={(attributeId, name) =>
                  handleRenameCustomAttribute(
                    selectedPostId,
                    attributeId,
                    name,
                  )
                }
                onUpdateAttributeValue={(attributeId, valueId) =>
                  handleUpdateAttributeValue(
                    selectedPostId,
                    attributeId,
                    valueId,
                  )
                }
                showWhereById={postShowWhereById}
                onEditAttribute={onEditAttribute}
                onOpenAddAttributePicker={openAddAttributePicker}
                onOpenAttributesModal={openAttributesModal}
                showReplies={selectedPostId === LEONARD_POST_ID}
              />
            </RightSidebar>
          ) : null
        }
      >
        <>
          <div className={shellStyles['channel-shell__messages']}>
            <Scrollbars>
              <div className={shellStyles['channel-shell__messages-list']}>
                <MessageSeparator type="Date" label="Today" />

                <Message
                  avatarSrc={avatarSofia}
                  avatarAlt="Sofia Bauer"
                  username="Sofia Bauer"
                  timestamp="09:12"
                >
                  <p className={shellStyles['channel-shell__post-text']}>
                    Weekly sync notes are pinned — use this channel for ALPHA
                    coordination through sustainment.
                  </p>
                </Message>

                <Message
                  avatarSrc={avatarMarco}
                  avatarAlt="Marco Rinaldi"
                  username="Marco Rinaldi"
                  timestamp="09:41"
                >
                  <p className={shellStyles['channel-shell__post-text']}>
                    Channel tempo is Elevated until Thursday. Posts inherit
                    unless the author overrides at compose.
                  </p>
                </Message>

                <ClickableThreadPost
                  postId={LEONARD_POST_ID}
                  selected={selectedPostId === LEONARD_POST_ID}
                  onOpen={openThread}
                >
                  <Message
                    avatarSrc={avatarLeonard}
                    avatarAlt="Leonard Riley"
                    username="Leonard Riley"
                    timestamp="10:18"
                    className={styles['channel-thread-view__thread-root']}
                    onAddAttribute={(anchor) =>
                      openAddAttributePicker(LEONARD_POST_ID, anchor)
                    }
                    footer={
                      <MessageReactions
                        reactions={[
                          { emoji: '👍', count: 2, byCurrentUser: true },
                          { emoji: '✅', count: 1 },
                        ]}
                        showAddReaction
                      />
                    }
                  >
                    <PostAttributeSummary
                      post={leonardPost}
                      postAttributesById={postAttributesById}
                      {...centerSummaryProps(LEONARD_POST_ID)}
                    >
                      <p className={shellStyles['channel-shell__post-text']}>
                        {leonardPost.body}
                      </p>
                    </PostAttributeSummary>
                  </Message>
                </ClickableThreadPost>

                {userPosts.map((post) => (
                  <ClickableThreadPost
                    key={post.id}
                    postId={post.id}
                    selected={selectedPostId === post.id}
                    onOpen={openThread}
                  >
                    <Message
                      avatarSrc={post.avatarSrc}
                      avatarAlt={post.avatarAlt}
                      username={post.author}
                      timestamp={post.timestamp}
                      className={styles['channel-thread-view__thread-root']}
                      onAddAttribute={(anchor) =>
                        openAddAttributePicker(post.id, anchor)
                      }
                    >
                      <PostAttributeSummary
                        post={post}
                        postAttributesById={postAttributesById}
                        {...centerSummaryProps(post.id)}
                      >
                        <p className={shellStyles['channel-shell__post-text']}>
                          {post.body}
                        </p>
                      </PostAttributeSummary>
                    </Message>
                  </ClickableThreadPost>
                ))}

                <Message
                  avatarSrc={avatarAikoTan}
                  avatarAlt="Aiko Tan"
                  username="Aiko Tan"
                  timestamp="10:22"
                >
                  <p className={shellStyles['channel-shell__post-text']}>
                    Hover Leonard&apos;s attribute pills for a read-only summary,
                    then choose Edit to change attributes and values in the
                    modal.
                  </p>
                </Message>
              </div>
            </Scrollbars>
          </div>

          <div className={shellStyles['channel-shell__message-input']}>
            <ThreadReplyMessageInput
              placeholder="Write to field-coordination"
              postAttributes={allPostAttributes}
              showWhereById={postShowWhereById}
              channelClassificationValueId={channelClassificationValueId}
              onCreateAttribute={onCreateAttribute}
              onPost={handlePost}
            />
          </div>
        </>
      </ChannelShell>

      {addPickerPost && addPickerPostId && (
        <PostAttributeAddMenu
          open={addPickerOpen}
          onClose={closeAddAttributePicker}
          anchorRef={addPickerAnchorRef}
          align={threadSidebarOpen ? 'end' : 'start'}
          attachedIds={addPickerPost.attributes.map((row) => row.attributeId)}
          attributes={allPostAttributes}
          post={addPickerPost}
          onEditAttributes={() => openAttributesModal(addPickerPostId)}
          onPickAttribute={(attributeId) =>
            handleAddAttribute(addPickerPostId, attributeId)
          }
          onCreateNew={onCreateAttribute}
        />
      )}

      {attributesModalPost && attributesModalPostId && (
        <div
          className={styles['channel-thread-view__attr-overlay']}
          role="presentation"
        >
          <button
            type="button"
            className={styles['channel-thread-view__attr-scrim']}
            aria-label="Close post attributes"
            onClick={closeAttributesModal}
          />
          <div className={styles['channel-thread-view__attr-dialog']}>
            <Modal
              title="Post attributes"
              subtitle={`${attributesModalPost.author} · field-coordination`}
              size="Medium"
              onClose={closeAttributesModal}
              noBodyPadding
            >
              <div className={styles['channel-thread-view__attr-modal-body']}>
                <Message
                  className={styles['channel-thread-view__attr-modal-message']}
                  avatarSrc={attributesModalPost.avatarSrc}
                  avatarAlt={attributesModalPost.avatarAlt}
                  username={attributesModalPost.author}
                  timestamp={attributesModalPost.timestamp}
                  showMessageActions={false}
                >
                  <PostAttributeSummary
                    post={attributesModalPost}
                    postAttributesById={postAttributesById}
                    {...summaryHandlers(attributesModalPostId)}
                    defaultExpanded
                    hideSummary
                    detailsPlacement="below"
                    onAddAttributeClick={(anchor) =>
                      openAddAttributePicker(attributesModalPostId, anchor)
                    }
                  >
                    <p className={shellStyles['channel-shell__post-text']}>
                      {attributesModalPost.body}
                    </p>
                  </PostAttributeSummary>
                </Message>
              </div>
            </Modal>
          </div>
        </div>
      )}
    </>
  );
}
