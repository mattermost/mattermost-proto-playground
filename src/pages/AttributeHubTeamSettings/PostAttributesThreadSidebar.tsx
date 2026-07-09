import { useMemo, useRef, useState } from 'react';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import Message from '@/components/ui/Message/Message';
import messageStyles from '@/components/ui/Message/Message.module.scss';
import MessageSeparator from '@/components/ui/MessageSeparator/MessageSeparator';
import Icon from '@/components/ui/Icon/Icon';
import FixedPopoverMenu from '@/components/ui/FixedPopoverMenu/FixedPopoverMenu';
import MenuItem from '@/components/ui/MenuItem/MenuItem';
import PopoverMenu from '@/components/ui/PopoverMenu/PopoverMenu';
import type { AttrType } from '@/pages/AttributeManagementHub/hubData';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import PostAttributesPanel from './PostAttributesPanel';
import {
  PostAttributeAddMenu,
  attributeTypeIcon,
} from './postAttributeAddMenu';
import {
  POST_ATTRIBUTE_TYPES,
  THREAD_ROOT,
  type PostCustomAttribute,
  type ThreadDemoPost,
} from './postViewData';
import styles from './PostAttributesThreadSidebar.module.scss';

export interface PostAttributesThreadSidebarProps {
  post?: ThreadDemoPost;
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
  showReplies?: boolean;
}

export default function PostAttributesThreadSidebar({
  post = {
    ...THREAD_ROOT,
    avatarSrc: avatarLeonard,
  },
  onAddAttribute,
  onAddCustomAttribute,
  onUpdateCustomAttribute,
  onAddCustomAttributeValue,
  onRemoveAttribute,
  onRemoveCustomAttribute,
  onRenameCustomAttribute,
  showReplies = true,
}: PostAttributesThreadSidebarProps) {
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const addTriggerRef = useRef<HTMLButtonElement>(null);
  const textClass = messageStyles['message__body-text'];

  const attachedIds = useMemo(
    () => post.attributes.map((row) => row.attributeId),
    [post.attributes],
  );

  const closeAddMenu = () => setAddMenuOpen(false);
  const closeTypeMenu = () => setTypeMenuOpen(false);

  const openAddMenu = () => {
    closeTypeMenu();
    setAddMenuOpen(true);
  };

  const pickAttribute = (attributeId: string) => {
    onAddAttribute?.(attributeId);
    closeAddMenu();
  };

  const openCreateTypeMenu = () => {
    closeAddMenu();
    setTypeMenuOpen(true);
  };

  const pickType = (type: AttrType) => {
    onAddCustomAttribute?.(type);
    closeTypeMenu();
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
        >
          <p className={textClass}>{post.body}</p>
        </Message>
      </div>

      <div className={styles['thread__attrs']}>
        <PostAttributesPanel
          post={post}
          variant="thread"
          onUpdateCustomAttribute={onUpdateCustomAttribute}
          onAddCustomAttributeValue={onAddCustomAttributeValue}
          onRemoveAttribute={onRemoveAttribute}
          onRemoveCustomAttribute={onRemoveCustomAttribute}
          onRenameCustomAttribute={onRenameCustomAttribute}
        />
        <button
          ref={addTriggerRef}
          type="button"
          className={styles['thread__add']}
          aria-label="Add attribute"
          aria-haspopup="menu"
          aria-expanded={addMenuOpen || typeMenuOpen}
          onClick={openAddMenu}
        >
          <span className={styles['thread__add-icon']} aria-hidden>
            <Icon size="16" glyph={<PlusIcon />} />
          </span>
          Add attribute
        </button>
      </div>

      <PostAttributeAddMenu
        open={addMenuOpen}
        onClose={closeAddMenu}
        anchorRef={addTriggerRef}
        attachedIds={attachedIds}
        onPickAttribute={pickAttribute}
        onCreateNew={openCreateTypeMenu}
        preferAbove={false}
      />

      <FixedPopoverMenu
        open={typeMenuOpen}
        onClose={closeTypeMenu}
        anchorRef={addTriggerRef}
        align="start"
        preferAbove={false}
        minWidthFloor={220}
      >
        <PopoverMenu aria-label="Attribute type">
          {POST_ATTRIBUTE_TYPES.map((type) => (
            <MenuItem
              key={type}
              label={type}
              leadingVisual={attributeTypeIcon(type)}
              onClick={() => pickType(type)}
            />
          ))}
        </PopoverMenu>
      </FixedPopoverMenu>

      {showReplies && (
        <div className={styles['thread__replies']}>
          <MessageSeparator
            type="Reply Count"
            label="3 replies"
            className={styles['thread__reply-separator']}
          />
          <Message
            avatarSrc={avatarAikoTan}
            avatarAlt="Aiko Tan"
            username="Aiko Tan"
            timestamp="Today at 10:22 AM"
            messageActionsType="RHS"
            className={styles['thread__message']}
          >
            <p className={textClass}>
              Tempo bump to Surge makes sense for the leadership sync — I&apos;ll
              align the downstream caveats on my draft.
            </p>
          </Message>
          <Message
            avatarSrc={avatarDanielle}
            avatarAlt="Danielle Okoro"
            username="Danielle Okoro"
            timestamp="Today at 10:26 AM"
            messageActionsType="RHS"
            className={styles['thread__message']}
          >
            <p className={textClass}>
              Classification stays locked at SECRET per channel policy. No change
              needed on my side.
            </p>
          </Message>
        </div>
      )}
    </div>
  );
}
