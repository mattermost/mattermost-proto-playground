import { useCallback, useMemo, useState, type ReactNode } from 'react';
import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import ChannelShell from '@/components/ui/ChannelShell/ChannelShell';
import Chip from '@/components/ui/Chip/Chip';
import MessageInput from '@/components/ui/MessageInput';
import Message from '@/components/ui/Message/Message';
import MessageReactions from '@/components/ui/MessageReactions/MessageReactions';
import MessageSeparator from '@/components/ui/MessageSeparator/MessageSeparator';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import RightSidebar, {
  RightSidebarHeader,
} from '@/components/ui/RightSidebar';
import ClassificationPill from '@/pages/attribute-system/ClassificationPill';
import type { HubAttribute } from '@/pages/AttributeManagementHub/hubData';
import type { AttrType } from '@/pages/AttributeManagementHub/hubData';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import shellStyles from '@/components/ui/ChannelShell/ChannelShell.module.scss';
import PostAttributesThreadSidebar from './PostAttributesThreadSidebar';
import ThreadReplyMessageInput from './ThreadReplyMessageInput';
import {
  THREAD_ROOT,
  addCustomAttributeToPost,
  addCustomAttributeValueOnPost,
  buildPostAttributesFromComposer,
  formatChannelPostTime,
  postScopedAttributes,
  removeAttributeFromPost,
  removeCustomAttributeFromPost,
  updateCustomAttributeOnPost,
  valueLabel,
  type PostAttributeValue,
  type ThreadDemoPost,
} from './postViewData';
import styles from './ChannelThreadView.module.scss';

export interface ChannelThreadViewProps {
  onCreateAttribute?: () => void;
}

const LEONARD_POST_ID = THREAD_ROOT.id;

function PostMetaChips({
  attributes,
  postAttributesById,
}: {
  attributes: PostAttributeValue[];
  postAttributesById: Map<string, HubAttribute>;
}) {
  const visible = attributes.filter((instance) => instance.overridden);
  if (visible.length === 0) return null;

  return (
    <div className={styles['channel-thread-view__post-meta']}>
      {visible.map((instance) => {
        const attribute = postAttributesById.get(instance.attributeId);
        if (!attribute) return null;

        if (attribute.id === 'classification') {
          return (
            <ClassificationPill
              key={instance.attributeId}
              valueId={instance.valueId}
              label={valueLabel(attribute, instance.valueId)}
              locked
            />
          );
        }

        return (
          <Chip
            key={instance.attributeId}
            size="Small"
            className={styles['channel-thread-view__meta-chip']}
          >
            {valueLabel(attribute, instance.valueId)}
          </Chip>
        );
      })}
    </div>
  );
}

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
}: ChannelThreadViewProps) {
  const [threadSidebarOpen, setThreadSidebarOpen] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState(LEONARD_POST_ID);
  const [leonardPost, setLeonardPost] = useState<ThreadDemoPost>(() => ({
    ...THREAD_ROOT,
    avatarSrc: avatarLeonard,
  }));
  const [userPosts, setUserPosts] = useState<ThreadDemoPost[]>([]);

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

  const openThread = useCallback((postId: string) => {
    setSelectedPostId(postId);
    setThreadSidebarOpen(true);
  }, []);

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
    },
    [],
  );

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
      applyPostUpdate(postId, (post) => removeAttributeFromPost(post, attributeId));
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

  return (
    <>
    <ChannelShell
      layout="fullscreen"
      userAvatarSrc={avatarLeonard}
      userAvatarAlt="Leonard Riley"
      channelHeader={
        <ChannelHeader
          type="Channel"
          name="alpha-coordination"
          description="Program ALPHA · Team coordination"
          memberCount={28}
          pinnedCount={2}
          favorited
        />
      }
      trailing={
        threadSidebarOpen ? (
          <RightSidebar
            alignBody="start"
            className={shellStyles['channel-shell__right-sidebar']}
            header={
              <RightSidebarHeader
                title="Thread"
                secondaryTitle="alpha-coordination"
                onExpand={() => {}}
                onClose={() => setThreadSidebarOpen(false)}
              />
            }
            footer={
              <div className={shellStyles['channel-shell__message-input']}>
                <MessageInput
                  placeholder="Reply to thread…"
                  width="narrow"
                />
              </div>
            }
          >
            <PostAttributesThreadSidebar
              post={selectedPost}
              onAddCustomAttribute={(type) =>
                handleAddCustomAttribute(selectedPostId, type)
              }
              onUpdateCustomAttribute={(attributeId, patch) =>
                handleUpdateCustomAttribute(selectedPostId, attributeId, patch)
              }
              onAddCustomAttributeValue={(attributeId, label) =>
                handleAddCustomAttributeValue(selectedPostId, attributeId, label)
              }
              onRemoveAttribute={(attributeId) =>
                handleRemoveAttribute(selectedPostId, attributeId)
              }
              onRemoveCustomAttribute={(attributeId) =>
                handleRemoveCustomAttribute(selectedPostId, attributeId)
              }
              onRenameCustomAttribute={(attributeId, name) =>
                handleRenameCustomAttribute(selectedPostId, attributeId, name)
              }
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
                  Channel tempo is Elevated until Thursday. Posts inherit unless
                  the author overrides at compose.
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
                  <PostMetaChips
                    attributes={leonardPost.attributes}
                    postAttributesById={postAttributesById}
                  />
                  <p className={shellStyles['channel-shell__post-text']}>
                    {leonardPost.body}
                  </p>
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
                  >
                    <PostMetaChips
                      attributes={post.attributes}
                      postAttributesById={postAttributesById}
                    />
                    <p className={shellStyles['channel-shell__post-text']}>
                      {post.body}
                    </p>
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
                  Open the thread in the right sidebar to review post attributes
                  on Leonard&apos;s message.
                </p>
              </Message>
            </div>
          </Scrollbars>
        </div>

        <div className={shellStyles['channel-shell__message-input']}>
          <ThreadReplyMessageInput
            placeholder="Write to alpha-coordination"
            postAttributes={allPostAttributes}
            onCreateAttribute={onCreateAttribute}
            onPost={handlePost}
          />
        </div>
      </>
    </ChannelShell>
    </>
  );
}
