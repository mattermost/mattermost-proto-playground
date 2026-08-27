import { useMemo, useRef, useState } from 'react';
import Message from '@/components/ui/Message/Message';
import messageStyles from '@/components/ui/Message/Message.module.scss';
import MessageSeparator from '@/components/ui/MessageSeparator/MessageSeparator';
import type {
  AttrType,
  DisplayWhere,
  HubAttribute,
} from '@/pages/AttributeManagementHub/hubData';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import PostAttributeSummary from './PostAttributeSummary';
import { PostAttributeAddMenu } from './postAttributeAddMenu';
import {
  THREAD_ROOT,
  addAttributeToPost,
  postScopedAttributes,
  removeAttributeFromPost,
  updateAttributeValueOnPost,
  type PostCustomAttribute,
  type ThreadDemoPost,
} from './postViewData';
import styles from './PostAttributesThreadSidebar.module.scss';

/** Scene helper for ChannelThreadView — `modal` starts with the editor open. */
export type AttributeRevealMode = 'thread' | 'modal';

const REPLY_SEEDS: ThreadDemoPost[] = [
  {
    id: 'reply-aiko',
    author: 'Aiko Tan',
    avatarSrc: avatarAikoTan,
    avatarAlt: 'Aiko Tan',
    timestamp: 'Today at 10:22 AM',
    body: "Tempo bump to Surge makes sense for the leadership sync — I'll align the downstream caveats on my draft.",
    attributes: [],
  },
  {
    id: 'reply-danielle',
    author: 'Danielle Okoro',
    avatarSrc: avatarDanielle,
    avatarAlt: 'Danielle Okoro',
    timestamp: 'Today at 10:26 AM',
    body: 'Unclassified on the ops brief looks right for the outbound sync. Channel ceiling still caps us at SECRET.',
    attributes: [],
  },
];

export interface PostAttributesThreadSidebarProps {
  post?: ThreadDemoPost;
  postAttributesById?: Map<string, HubAttribute>;
  onAddAttribute?: (attributeId: string) => void;
  onAddCustomAttribute?: (type: AttrType) => void;
  onUpdateCustomAttribute?: (
    id: string,
    patch: Partial<Pick<PostCustomAttribute, 'name' | 'selectedValueId'>>,
  ) => void;
  onAddCustomAttributeValue?: (id: string, label: string) => void;
  onRemoveAttribute?: (attributeId: string) => void;
  onRemoveCustomAttribute?: (id: string) => void;
  onRenameCustomAttribute?: (id: string, name: string) => void;
  onUpdateAttributeValue?: (attributeId: string, valueId: string) => void;
  showWhereById?: Record<string, DisplayWhere[]>;
  onEditAttribute?: (attributeId: string) => void;
  /** Opens the attribute picker popover for a post, anchored to the trigger. */
  onOpenAddAttributePicker?: (postId: string, anchor: HTMLElement) => void;
  /** Opens the shared attributes editor modal (from hover card Edit). */
  onOpenAttributesModal?: (postId: string) => void;
  showReplies?: boolean;
}

export default function PostAttributesThreadSidebar({
  post = {
    ...THREAD_ROOT,
    avatarSrc: avatarLeonard,
  },
  postAttributesById: postAttributesByIdProp,
  onUpdateCustomAttribute,
  onAddCustomAttributeValue,
  onRemoveAttribute,
  onRemoveCustomAttribute,
  onRenameCustomAttribute,
  onUpdateAttributeValue,
  showWhereById,
  onEditAttribute,
  onOpenAddAttributePicker,
  onOpenAttributesModal,
  showReplies = true,
}: PostAttributesThreadSidebarProps) {
  const [replies, setReplies] = useState<ThreadDemoPost[]>(REPLY_SEEDS);
  const [replyPickerOpen, setReplyPickerOpen] = useState(false);
  const [replyPickerPostId, setReplyPickerPostId] = useState<string | null>(
    null,
  );
  const replyPickerAnchorRef = useRef<HTMLElement | null>(null);
  const textClass = messageStyles['message__body-text'];

  const postAttributesById = useMemo(() => {
    if (postAttributesByIdProp) return postAttributesByIdProp;
    return new Map(
      postScopedAttributes().map((attribute) => [attribute.id, attribute]),
    );
  }, [postAttributesByIdProp]);

  const replyPickerPost = useMemo(
    () => replies.find((row) => row.id === replyPickerPostId) ?? null,
    [replies, replyPickerPostId],
  );

  const openAddForReply = (postId: string, anchor: HTMLElement) => {
    replyPickerAnchorRef.current = anchor;
    setReplyPickerPostId(postId);
    setReplyPickerOpen(true);
  };

  const closeReplyPicker = () => {
    setReplyPickerOpen(false);
    setReplyPickerPostId(null);
  };

  const applyReplyUpdate = (
    postId: string,
    updater: (current: ThreadDemoPost) => ThreadDemoPost,
  ) => {
    setReplies((current) =>
      current.map((row) => (row.id === postId ? updater(row) : row)),
    );
  };

  return (
    <div className={styles['thread']}>
      <div className={styles['thread__root']}>
        <Message
          avatarSrc={post.avatarSrc}
          avatarAlt={post.avatarAlt}
          username={post.author}
          timestamp={post.timestamp}
          messageActionsType="RHS"
          className={styles['thread__message']}
          onAddAttribute={(anchor) =>
            onOpenAddAttributePicker?.(post.id, anchor)
          }
        >
          <PostAttributeSummary
            post={post}
            postAttributesById={postAttributesById}
            onEditAttribute={onEditAttribute}
            onRemoveAttribute={onRemoveAttribute}
            onRemoveCustomAttribute={onRemoveCustomAttribute}
            onRenameCustomAttribute={onRenameCustomAttribute}
            onUpdateCustomAttribute={onUpdateCustomAttribute}
            onAddCustomAttributeValue={onAddCustomAttributeValue}
            onUpdateAttributeValue={onUpdateAttributeValue}
            showWhereById={showWhereById}
            onAddAttributeClick={(anchor) =>
              onOpenAddAttributePicker?.(post.id, anchor)
            }
            onEditAttributes={
              onOpenAttributesModal
                ? () => onOpenAttributesModal(post.id)
                : undefined
            }
          >
            <p className={textClass}>{post.body}</p>
          </PostAttributeSummary>
        </Message>
      </div>

      {showReplies && (
        <div className={styles['thread__replies']}>
          <MessageSeparator
            type="Reply Count"
            label={`${replies.length} replies`}
            className={styles['thread__reply-separator']}
          />
          {replies.map((reply) => (
            <Message
              key={reply.id}
              avatarSrc={reply.avatarSrc}
              avatarAlt={reply.avatarAlt}
              username={reply.author}
              timestamp={reply.timestamp}
              messageActionsType="RHS"
              className={styles['thread__message']}
              onAddAttribute={(anchor) => openAddForReply(reply.id, anchor)}
            >
              <PostAttributeSummary
                post={reply}
                postAttributesById={postAttributesById}
                onRemoveAttribute={(attributeId) =>
                  applyReplyUpdate(reply.id, (current) =>
                    removeAttributeFromPost(current, attributeId),
                  )
                }
                onUpdateAttributeValue={(attributeId, valueId) =>
                  applyReplyUpdate(reply.id, (current) =>
                    updateAttributeValueOnPost(current, attributeId, valueId),
                  )
                }
                showWhereById={showWhereById}
                onAddAttributeClick={(anchor) =>
                  openAddForReply(reply.id, anchor)
                }
              >
                <p className={textClass}>{reply.body}</p>
              </PostAttributeSummary>
            </Message>
          ))}
        </div>
      )}

      {replyPickerPost && replyPickerPostId && (
        <PostAttributeAddMenu
          open={replyPickerOpen}
          onClose={closeReplyPicker}
          anchorRef={replyPickerAnchorRef}
          align="end"
          attachedIds={replyPickerPost.attributes.map(
            (row) => row.attributeId,
          )}
          attributes={Array.from(postAttributesById.values())}
          post={replyPickerPost}
          onEditAttributes={
            onOpenAttributesModal
              ? () => onOpenAttributesModal(replyPickerPostId)
              : undefined
          }
          onPickAttribute={(attributeId) => {
            applyReplyUpdate(replyPickerPostId, (current) =>
              addAttributeToPost(current, attributeId),
            );
          }}
        />
      )}
    </div>
  );
}
