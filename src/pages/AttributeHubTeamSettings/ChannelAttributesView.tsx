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
import PostHeaderAttributeChips from './PostHeaderAttributeChips';
import ChannelClassificationBanner from './ChannelClassificationBanner';
import ChannelAttributeHeaderStack from './ChannelAttributeHeaderStack';
import PostAttributesThreadSidebar from './PostAttributesThreadSidebar';
import CreateChannelSidebar, {
  type SidebarChannelItem,
} from './CreateChannelSidebar';
import CreateChannelModal, {
  type CreateChannelPayload,
} from './CreateChannelModal';
import createChannelStyles from './CreateChannelModal.module.scss';
import {
  CHANNEL_INFO_SEED,
  addCustomAttributeToChannel,
  addCustomAttributeValueOnChannel,
  channelClassificationBanner,
  channelClassificationBannerForced,
  channelValueLabel,
  removeAttributeFromChannel,
  removeCustomAttributeFromChannel,
  updateChannelAttributeValue,
  updateCustomAttributeOnChannel,
  patchChannelBindingOverride,
  slugifyChannelName,
  type ChannelBindingOverride,
  type ChannelDemoState,
} from './channelViewData';
import {
  THREAD_ROOT,
  addAttributeToPost,
  addCustomAttributeToPost,
  addCustomAttributeValueOnPost,
  classificationLabel,
  removeAttributeFromPost,
  removeCustomAttributeFromPost,
  postClassificationBanner,
  postScopedAttributes,
  updateCustomAttributeOnPost,
  type ThreadDemoPost,
} from './postViewData';
import threadStyles from './ChannelThreadView.module.scss';

export interface BannerVisibility {
  channel: boolean;
  reply: boolean;
}

export interface ChannelAttributesViewProps {
  readOnly?: boolean;
  /** Open the channel Info RHS on first render (channel attributes panel). */
  initialInfoSidebarOpen?: boolean;
  /** Open the thread RHS on first render (reply attributes). */
  initialThreadOpen?: boolean;
  initialSelectedPostId?: string;
  initialChannelSeed?: ChannelDemoState;
  initialLeonardPost?: ThreadDemoPost;
  bannerVisibility?: BannerVisibility;
  /** Show channel header description text inline in the title row. */
  showChannelHeaderText?: boolean;
  /** Workspace classification band at the top of the shell frame. */
  globalBanner?: ReactNode;
  onCreateAttribute?: () => void;
  onEditAttribute?: (attributeId: string) => void;
}

const ALPHA_CHANNEL_ID = 'alpha-coordination';

const CHANNEL_HEADER_DESCRIPTION = 'This is a channel header';

const EMPTY_CHANNEL_STATE: ChannelDemoState = {
  attributes: [],
  customAttributes: [],
  bindingOverrides: {},
};

const DEFAULT_SIDEBAR_CHANNELS: SidebarChannelItem[] = [
  { id: ALPHA_CHANNEL_ID, name: 'alpha-coordination', privacy: 'public' },
  {
    id: 'program-planning',
    name: 'program-planning',
    privacy: 'private',
    status: 'Unread',
  },
  { id: 'field-ops', name: 'field-ops', privacy: 'public' },
  { id: 'sustainment', name: 'sustainment', privacy: 'public' },
];

const ATTR_LABEL_OVERRIDES: Record<string, string> = {
  program: 'Programs',
};

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

function channelStateFromCreatePayload(
  payload: CreateChannelPayload,
): ChannelDemoState {
  const attributes: ChannelDemoState['attributes'] = [];

  for (const [attributeId, valueId] of Object.entries(payload.attributes.single)) {
    if (!valueId) continue;
    attributes.push({ attributeId, valueId });
  }

  for (const [attributeId, valueIds] of Object.entries(payload.attributes.multi)) {
    const first = valueIds[0];
    if (!first) continue;
    attributes.push({ attributeId, valueId: first });
  }

  return {
    attributes,
    customAttributes: [],
    bindingOverrides: {},
  };
}

function formatAssignedAttributesSummary(payload: CreateChannelPayload): string {
  const catalog = channelScopedAttributes();
  const byId = new Map(catalog.map((attribute) => [attribute.id, attribute]));
  const parts: string[] = [];

  for (const [attributeId, valueId] of Object.entries(payload.attributes.single)) {
    if (!valueId) continue;
    const attribute = byId.get(attributeId);
    const label = ATTR_LABEL_OVERRIDES[attributeId] ?? attribute?.name ?? attributeId;
    const value =
      attributeId === 'classification'
        ? classificationLabel(valueId)
        : attribute
          ? channelValueLabel(attribute, valueId)
          : valueId;
    parts.push(`${label}: ${value}`);
  }

  for (const [attributeId, valueIds] of Object.entries(payload.attributes.multi)) {
    if (valueIds.length === 0) continue;
    const attribute = byId.get(attributeId);
    const label = ATTR_LABEL_OVERRIDES[attributeId] ?? attribute?.name ?? attributeId;
    const values = valueIds
      .map((valueId) =>
        attribute ? channelValueLabel(attribute, valueId) : valueId,
      )
      .join(', ');
    parts.push(`${label}: ${values}`);
  }

  if (parts.length === 0) {
    return 'You assigned attributes to this channel.';
  }

  return `You assigned ${parts.join(', ')} to this channel.`;
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
  initialInfoSidebarOpen = false,
  initialThreadOpen = false,
  initialSelectedPostId = LEONARD_POST_ID,
  initialChannelSeed,
  initialLeonardPost,
  bannerVisibility = { channel: true, reply: true },
  showChannelHeaderText = false,
  globalBanner,
  onCreateAttribute: _onCreateAttribute,
  onEditAttribute,
}: ChannelAttributesViewProps) {
  const [infoSidebarOpen, setInfoSidebarOpen] = useState(
    initialInfoSidebarOpen && !initialThreadOpen,
  );
  const [threadSidebarOpen, setThreadSidebarOpen] = useState(initialThreadOpen);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(
    initialThreadOpen ? initialSelectedPostId : null,
  );
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [createChannelOpen, setCreateChannelOpen] = useState(false);
  const [sidebarChannels, setSidebarChannels] = useState<SidebarChannelItem[]>(
    DEFAULT_SIDEBAR_CHANNELS,
  );
  const [activeChannelId, setActiveChannelId] = useState(ALPHA_CHANNEL_ID);
  const [channelStates, setChannelStates] = useState<Record<string, ChannelDemoState>>(
    () => ({
      [ALPHA_CHANNEL_ID]: initialChannelSeed ?? CHANNEL_INFO_SEED,
    }),
  );
  const [createdSummaries, setCreatedSummaries] = useState<Record<string, string>>({});
  const [leonardPost, setLeonardPost] = useState<ThreadDemoPost>(() =>
    initialLeonardPost ?? {
      ...THREAD_ROOT,
      avatarSrc: avatarLeonard,
    },
  );

  const activeChannelMeta =
    sidebarChannels.find((channel) => channel.id === activeChannelId) ??
    sidebarChannels[0];
  const channelName = activeChannelMeta?.name ?? 'alpha-coordination';
  const channel = channelStates[activeChannelId] ?? EMPTY_CHANNEL_STATE;
  const isAlphaChannel = activeChannelId === ALPHA_CHANNEL_ID;
  const isCreatedChannel = Boolean(createdSummaries[activeChannelId]);
  const classificationBanner = useMemo(() => {
    if (!bannerVisibility.channel) return null;
    return (
      channelClassificationBanner(channel) ??
      channelClassificationBannerForced(channel)
    );
  }, [bannerVisibility.channel, channel]);

  const postAttributesById = useMemo(
    () =>
      new Map(
        postScopedAttributes().map((attribute) => [attribute.id, attribute]),
      ),
    [],
  );

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

  const replyClassificationBanner = useMemo(() => {
    if (!bannerVisibility.reply || !selectedPost) return null;
    return postClassificationBanner(selectedPost, postAttributesById);
  }, [bannerVisibility.reply, postAttributesById, selectedPost]);

  const updateActiveChannel = useCallback(
    (updater: (current: ChannelDemoState) => ChannelDemoState) => {
      setChannelStates((current) => {
        const existing =
          current[activeChannelId] ??
          (activeChannelId === ALPHA_CHANNEL_ID
            ? CHANNEL_INFO_SEED
            : EMPTY_CHANNEL_STATE);
        return {
          ...current,
          [activeChannelId]: updater(existing),
        };
      });
    },
    [activeChannelId],
  );

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

  const handleSelectChannel = useCallback((channelId: string) => {
    setActiveChannelId(channelId);
    setInfoSidebarOpen(false);
    setThreadSidebarOpen(false);
    setSelectedPostId(null);
  }, []);

  const handleCreateChannel = useCallback((payload: CreateChannelPayload) => {
    const baseSlug = slugifyChannelName(payload.name) || 'channel';
    const createdId = `${baseSlug}-${Date.now()}`;
    const nextState = channelStateFromCreatePayload(payload);
    const summary = formatAssignedAttributesSummary(payload);

    setSidebarChannels((current) => [
      {
        id: createdId,
        name: baseSlug,
        privacy: payload.privacy,
      },
      ...current,
    ]);
    setChannelStates((current) => ({
      ...current,
      [createdId]: nextState,
    }));
    setCreatedSummaries((current) => ({
      ...current,
      [createdId]: summary,
    }));
    setActiveChannelId(createdId);
    setInfoSidebarOpen(false);
    setThreadSidebarOpen(false);
    setSelectedPostId(null);
    setCreateChannelOpen(false);
  }, []);

  const applyLeonardPostUpdate = useCallback(
    (updater: (post: ThreadDemoPost) => ThreadDemoPost) => {
      setLeonardPost((current) => updater(current));
    },
    [],
  );

  const handleAddCustomAttribute = useCallback(
    (type: AttrType) => {
      updateActiveChannel((current) => addCustomAttributeToChannel(current, type));
    },
    [updateActiveChannel],
  );

  const handleUpdateCustomAttribute = useCallback(
    (id: string, patch: Parameters<typeof updateCustomAttributeOnChannel>[2]) => {
      updateActiveChannel((current) =>
        updateCustomAttributeOnChannel(current, id, patch),
      );
    },
    [updateActiveChannel],
  );

  const handleAddCustomAttributeValue = useCallback(
    (id: string, label: string) => {
      updateActiveChannel((current) =>
        addCustomAttributeValueOnChannel(current, id, label),
      );
    },
    [updateActiveChannel],
  );

  const handleRemoveAttribute = useCallback(
    (attributeId: string) => {
      updateActiveChannel((current) =>
        removeAttributeFromChannel(current, attributeId),
      );
    },
    [updateActiveChannel],
  );

  const handleRemoveCustomAttribute = useCallback(
    (id: string) => {
      updateActiveChannel((current) =>
        removeCustomAttributeFromChannel(current, id),
      );
    },
    [updateActiveChannel],
  );

  const handleUpdateAttributeValue = useCallback(
    (attributeId: string, valueId: string) => {
      updateActiveChannel((current) =>
        updateChannelAttributeValue(current, attributeId, valueId),
      );
    },
    [updateActiveChannel],
  );

  const handlePatchBindingOverride = useCallback(
    (attributeId: string, patch: Partial<ChannelBindingOverride>) => {
      updateActiveChannel((current) =>
        patchChannelBindingOverride(current, attributeId, patch),
      );
    },
    [updateActiveChannel],
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
    <div className={createChannelStyles['create-channel-modal__host']}>
    <ChannelShell
      topBanner={globalBanner}
      teamName="Program ALPHA"
      userAvatarSrc={avatarLeonard}
      userAvatarAlt="Leonard Riley"
      channelsSidebar={
        !readOnly ? (
          <CreateChannelSidebar
            menuOpen={addMenuOpen}
            onMenuOpen={() => setAddMenuOpen(true)}
            onMenuClose={() => setAddMenuOpen(false)}
            onCreateChannel={() => setCreateChannelOpen(true)}
            channels={sidebarChannels}
            activeChannelId={activeChannelId}
            onSelectChannel={handleSelectChannel}
          />
        ) : undefined
      }
      channelHeader={
        <ChannelAttributeHeaderStack
          titleBar={
            <ChannelHeader
              type="Channel"
              name={channelName}
              memberCount={isCreatedChannel ? 1 : 28}
              pinnedCount={isCreatedChannel ? 0 : 2}
              favorited={!isCreatedChannel}
              description={
                showChannelHeaderText ? CHANNEL_HEADER_DESCRIPTION : undefined
              }
              onInfoClick={toggleInfoSidebar}
              infoToggled={infoSidebarOpen}
            />
          }
          chips={
            isAlphaChannel || isCreatedChannel ? (
              <ChannelHeaderAttributeChips
                channel={channel}
                onChipClick={openInfoSidebar}
                onViewAllAttributes={openInfoSidebar}
              />
            ) : undefined
          }
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
        infoSidebarOpen ? (
          <RightSidebar
            alignBody="start"
            className={shellStyles['channel-shell__right-sidebar']}
            header={
              <RightSidebarHeader
                title="Info"
                secondaryTitle={channelName}
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
        ) : threadSidebarOpen && selectedPost && isAlphaChannel ? (
          <RightSidebar
            alignBody="start"
            className={shellStyles['channel-shell__right-sidebar']}
            header={
              <ChannelAttributeHeaderStack
                titleBar={
                  <RightSidebarHeader
                    title="Thread"
                    secondaryTitle={channelName}
                    onExpand={() => {}}
                    onClose={() => setThreadSidebarOpen(false)}
                  />
                }
                chips={
                  selectedPost ? (
                    <PostHeaderAttributeChips
                      post={selectedPost}
                      postAttributesById={postAttributesById}
                      omitClassification={
                        bannerVisibility.reply &&
                        Boolean(replyClassificationBanner)
                      }
                    />
                  ) : (
                    <ChannelHeaderAttributeChips
                      channel={channel}
                      onChipClick={openInfoSidebar}
                      onViewAllAttributes={openInfoSidebar}
                    />
                  )
                }
                banner={
                  bannerVisibility.reply && replyClassificationBanner ? (
                    <ChannelClassificationBanner
                      valueId={replyClassificationBanner.valueId}
                      label={replyClassificationBanner.label}
                    />
                  ) : undefined
                }
              />
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

              {isCreatedChannel ? (
                <Message
                  avatarSrc={avatarLeonard}
                  avatarAlt="Mattermost"
                  username="Mattermost"
                  timestamp="Just now"
                  isBot
                  showMessageActions={false}
                >
                  <p className={shellStyles['channel-shell__post-text']}>
                    {createdSummaries[activeChannelId]}
                  </p>
                  <p className={shellStyles['channel-shell__post-text']}>
                    You can configure these attributes in{' '}
                    <button
                      type="button"
                      className={createChannelStyles['create-channel-modal__sys-link']}
                      onClick={openInfoSidebar}
                    >
                      channel info
                    </button>
                    .
                  </p>
                </Message>
              ) : isAlphaChannel ? (
                <>
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
                </>
              ) : null}
            </div>
          </Scrollbars>
        </div>

        <div className={shellStyles['channel-shell__message-input']}>
          <MessageInput placeholder={`Write to ${channelName}`} />
        </div>
      </>
    </ChannelShell>

    {!readOnly && createChannelOpen && (
      <div
        className={createChannelStyles['create-channel-modal__overlay']}
        role="presentation"
      >
        <button
          type="button"
          className={createChannelStyles['create-channel-modal__backdrop']}
          aria-label="Close create channel modal"
          onClick={() => setCreateChannelOpen(false)}
        />
        <div className={createChannelStyles['create-channel-modal__dialog']}>
          <CreateChannelModal
            onClose={() => setCreateChannelOpen(false)}
            onSave={handleCreateChannel}
          />
        </div>
      </div>
    )}
    </div>
  );
}
