import { useCallback, useMemo, useState, type ReactNode } from 'react';
import ChannelHeader from '@/components/ui/ChannelHeader/ChannelHeader';
import ChannelShell from '@/components/ui/ChannelShell/ChannelShell';
import MessageInput from '@/components/ui/MessageInput';
import Message from '@/components/ui/Message/Message';
import MessageSeparator from '@/components/ui/MessageSeparator/MessageSeparator';
import Scrollbars from '@/components/ui/Scrollbars/Scrollbars';
import RightSidebar, {
  RightSidebarHeader,
} from '@/components/ui/RightSidebar';
import type { AttrType } from '@/pages/AttributeManagementHub/hubData';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import shellStyles from '@/components/ui/ChannelShell/ChannelShell.module.scss';
import ChannelInfoSidebar from './ChannelInfoSidebar';
import ChannelHeaderAttributeChips from './ChannelHeaderAttributeChips';
import ChannelClassificationBanner from './ChannelClassificationBanner';
import PostAttributesThreadSidebar from './PostAttributesThreadSidebar';
import {
  CHANNEL_INFO_SEED,
  addCustomAttributeToChannel,
  addCustomAttributeValueOnChannel,
  channelClassificationBanner,
  removeAttributeFromChannel,
  removeCustomAttributeFromChannel,
  updateChannelAttributeValue,
  updateCustomAttributeOnChannel,
  patchChannelBindingOverride,
  type ChannelBindingOverride,
  type ChannelDemoState,
} from './channelViewData';
import {
  THREAD_ROOT,
  addAttributeToPost,
  addCustomAttributeToPost,
  addCustomAttributeValueOnPost,
  removeAttributeFromPost,
  removeCustomAttributeFromPost,
  updateCustomAttributeOnPost,
  type ThreadDemoPost,
} from './postViewData';
import threadStyles from './ChannelThreadView.module.scss';

export interface ChannelAttributesViewProps {
  readOnly?: boolean;
  onCreateAttribute?: () => void;
  onEditAttribute?: (attributeId: string) => void;
}

const SOFIA_POST_ID = 'post-sofia-info';
const AIKO_POST_ID = 'post-aiko-info';
const LEONARD_POST_ID = THREAD_ROOT.id;

const SOFIA_POST: ThreadDemoPost = {
  id: SOFIA_POST_ID,
  author: 'Sofia Bauer',
  avatarSrc: avatarSofia,
  avatarAlt: 'Sofia Bauer',
  timestamp: '09:12',
  body: 'Click the info icon in the channel header to open channel attributes in the right sidebar.',
  attributes: [],
};

const AIKO_POST: ThreadDemoPost = {
  id: AIKO_POST_ID,
  author: 'Aiko Tan',
  avatarSrc: avatarAikoTan,
  avatarAlt: 'Aiko Tan',
  timestamp: '09:18',
  body: 'Classification, Program, Caveat, and Engagement tempo apply at the channel level — edit them from Info when you need to.',
  attributes: [],
};

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
        threadStyles['channel-thread-view__thread-root-wrap'],
        threadStyles['channel-thread-view__thread-root-wrap--clickable'],
        selected ? threadStyles['channel-thread-view__thread-root-wrap--selected'] : '',
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

export default function ChannelAttributesView({
  readOnly = false,
  onCreateAttribute: _onCreateAttribute,
  onEditAttribute,
}: ChannelAttributesViewProps) {
  const [infoSidebarOpen, setInfoSidebarOpen] = useState(false);
  const [threadSidebarOpen, setThreadSidebarOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [channel, setChannel] = useState<ChannelDemoState>(CHANNEL_INFO_SEED);
  const [leonardPost, setLeonardPost] = useState<ThreadDemoPost>(() => ({
    ...THREAD_ROOT,
    avatarSrc: avatarLeonard,
  }));
  const classificationBanner = channelClassificationBanner(channel);

  const postsById = useMemo(
    () =>
      new Map<string, ThreadDemoPost>([
        [SOFIA_POST_ID, SOFIA_POST],
        [AIKO_POST_ID, AIKO_POST],
        [LEONARD_POST_ID, leonardPost],
      ]),
    [leonardPost],
  );

  const selectedPost = selectedPostId
    ? (postsById.get(selectedPostId) ?? null)
    : null;

  const openThread = useCallback((postId: string) => {
    setSelectedPostId(postId);
    setThreadSidebarOpen(true);
    setInfoSidebarOpen(false);
  }, []);

  const toggleInfoSidebar = useCallback(() => {
    setInfoSidebarOpen((open) => {
      if (!open) setThreadSidebarOpen(false);
      return !open;
    });
  }, []);

  const openInfoSidebar = useCallback(() => {
    setInfoSidebarOpen(true);
    setThreadSidebarOpen(false);
  }, []);

  const applyLeonardPostUpdate = useCallback(
    (updater: (post: ThreadDemoPost) => ThreadDemoPost) => {
      setLeonardPost((current) => updater(current));
    },
    [],
  );

  const handleAddCustomAttribute = useCallback((type: AttrType) => {
    setChannel((current) => addCustomAttributeToChannel(current, type));
  }, []);

  const handleUpdateCustomAttribute = useCallback(
    (id: string, patch: Parameters<typeof updateCustomAttributeOnChannel>[2]) => {
      setChannel((current) => updateCustomAttributeOnChannel(current, id, patch));
    },
    [],
  );

  const handleAddCustomAttributeValue = useCallback((id: string, label: string) => {
    setChannel((current) => addCustomAttributeValueOnChannel(current, id, label));
  }, []);

  const handleRemoveAttribute = useCallback((attributeId: string) => {
    setChannel((current) => removeAttributeFromChannel(current, attributeId));
  }, []);

  const handleRemoveCustomAttribute = useCallback((id: string) => {
    setChannel((current) => removeCustomAttributeFromChannel(current, id));
  }, []);

  const handleUpdateAttributeValue = useCallback(
    (attributeId: string, valueId: string) => {
      setChannel((current) => updateChannelAttributeValue(current, attributeId, valueId));
    },
    [],
  );

  const handlePatchBindingOverride = useCallback(
    (attributeId: string, patch: Partial<ChannelBindingOverride>) => {
      setChannel((current) => patchChannelBindingOverride(current, attributeId, patch));
    },
    [],
  );

  const handleAddAttributeToPost = useCallback(
    (attributeId: string) => {
      if (selectedPostId !== LEONARD_POST_ID) return;
      applyLeonardPostUpdate((post) => addAttributeToPost(post, attributeId));
    },
    [applyLeonardPostUpdate, selectedPostId],
  );

  const handleAddCustomAttributeToPost = useCallback(
    (type: AttrType) => {
      if (selectedPostId !== LEONARD_POST_ID) return;
      applyLeonardPostUpdate((post) => addCustomAttributeToPost(post, type));
    },
    [applyLeonardPostUpdate, selectedPostId],
  );

  const handleUpdateCustomAttributeOnPost = useCallback(
    (
      attributeId: string,
      patch: Parameters<typeof updateCustomAttributeOnPost>[2],
    ) => {
      if (selectedPostId !== LEONARD_POST_ID) return;
      applyLeonardPostUpdate((post) =>
        updateCustomAttributeOnPost(post, attributeId, patch),
      );
    },
    [applyLeonardPostUpdate, selectedPostId],
  );

  const handleAddCustomAttributeValueOnPost = useCallback(
    (attributeId: string, label: string) => {
      if (selectedPostId !== LEONARD_POST_ID) return;
      applyLeonardPostUpdate((post) =>
        addCustomAttributeValueOnPost(post, attributeId, label),
      );
    },
    [applyLeonardPostUpdate, selectedPostId],
  );

  const handleRemoveAttributeFromPost = useCallback(
    (attributeId: string) => {
      if (selectedPostId !== LEONARD_POST_ID) return;
      applyLeonardPostUpdate((post) => removeAttributeFromPost(post, attributeId));
    },
    [applyLeonardPostUpdate, selectedPostId],
  );

  const handleRemoveCustomAttributeFromPost = useCallback(
    (attributeId: string) => {
      if (selectedPostId !== LEONARD_POST_ID) return;
      applyLeonardPostUpdate((post) =>
        removeCustomAttributeFromPost(post, attributeId),
      );
    },
    [applyLeonardPostUpdate, selectedPostId],
  );

  const handleRenameCustomAttributeOnPost = useCallback(
    (attributeId: string, name: string) => {
      if (selectedPostId !== LEONARD_POST_ID) return;
      applyLeonardPostUpdate((post) =>
        updateCustomAttributeOnPost(post, attributeId, { name }),
      );
    },
    [applyLeonardPostUpdate, selectedPostId],
  );

  return (
    <ChannelShell
      layout="fullscreen"
      userAvatarSrc={avatarLeonard}
      userAvatarAlt="Leonard Riley"
      channelHeader={
        <>
          <ChannelHeader
            type="Channel"
            name="alpha-coordination"
            memberCount={28}
            pinnedCount={2}
            favorited
            onInfoClick={toggleInfoSidebar}
            infoToggled={infoSidebarOpen}
            metaSlot={
              <ChannelHeaderAttributeChips
                channel={channel}
                onChipClick={openInfoSidebar}
              />
            }
          />
          {classificationBanner && (
            <ChannelClassificationBanner
              valueId={classificationBanner.valueId}
              label={classificationBanner.label}
            />
          )}
        </>
      }
      trailing={
        infoSidebarOpen ? (
          <RightSidebar
            alignBody="start"
            className={shellStyles['channel-shell__right-sidebar']}
            header={
              <RightSidebarHeader
                title="Info"
                secondaryTitle="alpha-coordination"
                onExpand={() => {}}
                onClose={() => setInfoSidebarOpen(false)}
              />
            }
          >
            <ChannelInfoSidebar
              channel={channel}
              readOnly={readOnly}
              onAddCustomAttribute={readOnly ? undefined : handleAddCustomAttribute}
              onUpdateCustomAttribute={readOnly ? undefined : handleUpdateCustomAttribute}
              onAddCustomAttributeValue={readOnly ? undefined : handleAddCustomAttributeValue}
              onRemoveAttribute={readOnly ? undefined : handleRemoveAttribute}
              onRemoveCustomAttribute={readOnly ? undefined : handleRemoveCustomAttribute}
              onUpdateAttributeValue={readOnly ? undefined : handleUpdateAttributeValue}
              onPatchBindingOverride={readOnly ? undefined : handlePatchBindingOverride}
              onEditAttribute={readOnly ? undefined : onEditAttribute}
            />
          </RightSidebar>
        ) : threadSidebarOpen && selectedPost ? (
          <RightSidebar
            alignBody="start"
            className={shellStyles['channel-shell__right-sidebar']}
            header={
              <div className={threadStyles['channel-thread-view__rhs-header']}>
                <RightSidebarHeader
                  title="Thread"
                  secondaryTitle="alpha-coordination"
                  onExpand={() => {}}
                  onClose={() => setThreadSidebarOpen(false)}
                  className={threadStyles['channel-thread-view__rhs-header-bar']}
                />
                <ChannelHeaderAttributeChips
                  channel={channel}
                  className={threadStyles['channel-thread-view__rhs-header-attrs']}
                />
              </div>
            }
            footer={
              <div className={shellStyles['channel-shell__message-input']}>
                <MessageInput placeholder="Reply to thread…" width="narrow" />
              </div>
            }
          >
            <PostAttributesThreadSidebar
              post={selectedPost}
              onAddAttribute={handleAddAttributeToPost}
              onAddCustomAttribute={handleAddCustomAttributeToPost}
              onUpdateCustomAttribute={handleUpdateCustomAttributeOnPost}
              onAddCustomAttributeValue={handleAddCustomAttributeValueOnPost}
              onRemoveAttribute={handleRemoveAttributeFromPost}
              onRemoveCustomAttribute={handleRemoveCustomAttributeFromPost}
              onRenameCustomAttribute={handleRenameCustomAttributeOnPost}
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

              <ClickableThreadPost
                postId={SOFIA_POST_ID}
                selected={selectedPostId === SOFIA_POST_ID}
                onOpen={openThread}
              >
                <Message
                  avatarSrc={avatarSofia}
                  avatarAlt="Sofia Bauer"
                  username="Sofia Bauer"
                  timestamp="09:12"
                  className={threadStyles['channel-thread-view__thread-root']}
                >
                  <p className={shellStyles['channel-shell__post-text']}>
                    {SOFIA_POST.body}
                  </p>
                </Message>
              </ClickableThreadPost>

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
                  className={threadStyles['channel-thread-view__thread-root']}
                >
                  <p className={shellStyles['channel-shell__post-text']}>
                    {leonardPost.body}
                  </p>
                </Message>
              </ClickableThreadPost>

              <ClickableThreadPost
                postId={AIKO_POST_ID}
                selected={selectedPostId === AIKO_POST_ID}
                onOpen={openThread}
              >
                <Message
                  avatarSrc={avatarAikoTan}
                  avatarAlt="Aiko Tan"
                  username="Aiko Tan"
                  timestamp="09:18"
                  className={threadStyles['channel-thread-view__thread-root']}
                >
                  <p className={shellStyles['channel-shell__post-text']}>
                    {AIKO_POST.body}
                  </p>
                </Message>
              </ClickableThreadPost>
            </div>
          </Scrollbars>
        </div>

        <div className={shellStyles['channel-shell__message-input']}>
          <MessageInput placeholder="Write to alpha-coordination" />
        </div>
      </>
    </ChannelShell>
  );
}
