import type { ChannelSidebarItemProps } from '@/components/ChannelSidebarItem/ChannelSidebarItem';

export type ChannelsSidebarItemModel = Pick<
  ChannelSidebarItemProps,
  | 'name'
  | 'leadingVisual'
  | 'active'
  | 'status'
  | 'mentionCount'
  | 'memberCount'
  | 'avatarSrc'
  | 'avatarAlt'
  | 'showAvatarStatus'
  | 'onClick'
>;

export interface ChannelsSidebarCategoryModel {
  label: string;
  showChevron?: boolean;
  showPlusButton?: boolean;
}

export interface ChannelsSidebarGroupModel {
  key: string;
  category: ChannelsSidebarCategoryModel;
  items: ChannelsSidebarItemModel[];
}

export interface ChannelsSidebarModel {
  topGroupItems: ChannelsSidebarItemModel[];
  groups: ChannelsSidebarGroupModel[];
}

export interface BuildDefaultChannelsSidebarModelInput {
  showUnreadsCategory: boolean;
  /** When true, appends "Dial Pad" to the top group (Threads / Drafts row). */
  showDialPad?: boolean;
  avatarAikoTan: string;
  avatarArjunPatel: string;
  avatarDanielOkoro: string;
  avatarDariusCole: string;
  avatarDavidLiang: string;
  avatarEmmaNovak: string;
  avatarEthanBrooks: string;
}

/** Builds the canonical playground sidebar tree (matches pre-model hardcoded markup). */
export function buildDefaultChannelsSidebarModel(
  input: BuildDefaultChannelsSidebarModelInput,
): ChannelsSidebarModel {
  const {
    showUnreadsCategory,
    showDialPad = false,
    avatarAikoTan,
    avatarArjunPatel,
    avatarDanielOkoro,
    avatarDariusCole,
    avatarDavidLiang,
    avatarEmmaNovak,
    avatarEthanBrooks,
  } = input;

  const topGroupItems: ChannelsSidebarItemModel[] = [
    { name: 'Threads', leadingVisual: 'Threads' },
    {
      name: 'Drafts',
      leadingVisual: 'Drafts',
      status: 'Mention',
      mentionCount: 1,
    },
  ];
  if (showDialPad) {
    topGroupItems.push({ name: 'Dial Pad', leadingVisual: 'Dial Pad' });
  }

  const groups: ChannelsSidebarGroupModel[] = [];

  if (showUnreadsCategory) {
    groups.push({
      key: 'unreads',
      category: { label: 'Unreads', showChevron: false },
      items: [
        { name: 'UX Design', leadingVisual: 'Public', active: true },
        { name: 'Orion', leadingVisual: 'Public', status: 'Unread' },
        {
          name: 'Release Discussion',
          leadingVisual: 'Public',
          status: 'Unread',
        },
        {
          name: 'Customer Onboarding',
          leadingVisual: 'Private',
          status: 'Unread',
        },
        { name: 'Race Teams', leadingVisual: 'Private', status: 'Unread' },
        {
          name: 'Arjun Patel',
          leadingVisual: 'Direct Message',
          status: 'Mention',
          mentionCount: 1,
          avatarSrc: avatarArjunPatel,
          avatarAlt: 'Arjun Patel',
          showAvatarStatus: true,
        },
        {
          name: 'Daniel Okoro',
          leadingVisual: 'Direct Message',
          status: 'Mention',
          mentionCount: 1,
          avatarSrc: avatarDanielOkoro,
          avatarAlt: 'Daniel Okoro',
          showAvatarStatus: true,
        },
      ],
    });
  }

  const favoritesItems: ChannelsSidebarItemModel[] = [
    { name: 'UI Redesign', leadingVisual: 'Public' },
  ];
  if (!showUnreadsCategory) {
    favoritesItems.push({
      name: 'UX Design',
      leadingVisual: 'Public',
      active: true,
    });
  }
  favoritesItems.push(
    { name: 'softphone-ux', leadingVisual: 'Public' },
    {
      name: 'Aiko Tan',
      leadingVisual: 'Direct Message',
      avatarSrc: avatarAikoTan,
      avatarAlt: 'Aiko Tan',
      showAvatarStatus: true,
    },
    {
      name: 'Hilda Martin, Steve M...',
      leadingVisual: 'Group Message',
      memberCount: 2,
    },
  );

  groups.push({
    key: 'favorites',
    category: { label: 'Favorites' },
    items: favoritesItems,
  });

  const channelsItems: ChannelsSidebarItemModel[] = [
    { name: 'Contributors', leadingVisual: 'Public' },
    { name: 'Developers', leadingVisual: 'Public' },
  ];
  if (!showUnreadsCategory) {
    channelsItems.push(
      { name: 'Orion', leadingVisual: 'Public', status: 'Unread' },
      {
        name: 'Release Discussion',
        leadingVisual: 'Public',
        status: 'Unread',
      },
    );
  }
  channelsItems.push(
    { name: 'calling-eng', leadingVisual: 'Public' },
    { name: 'Security Incident', leadingVisual: 'Public' },
    { name: 'telephony-vendors', leadingVisual: 'Private' },
    { name: 'System Status', leadingVisual: 'Private' },
    { name: 'Product Support', leadingVisual: 'Private' },
  );
  if (!showUnreadsCategory) {
    channelsItems.push(
      { name: 'Sales Partners', leadingVisual: 'Private', status: 'Unread' },
      {
        name: 'Customer Onboarding',
        leadingVisual: 'Private',
        status: 'Unread',
      },
    );
  }

  groups.push({
    key: 'channels',
    category: { label: 'Channels' },
    items: channelsItems,
  });

  const dmItems: ChannelsSidebarItemModel[] = [
    {
      name: 'Aiko Tan',
      leadingVisual: 'Direct Message',
      avatarSrc: avatarAikoTan,
      avatarAlt: 'Aiko Tan',
      showAvatarStatus: true,
    },
  ];
  if (!showUnreadsCategory) {
    dmItems.push(
      {
        name: 'Arjun Patel',
        leadingVisual: 'Direct Message',
        status: 'Mention',
        mentionCount: 1,
        avatarSrc: avatarArjunPatel,
        avatarAlt: 'Arjun Patel',
        showAvatarStatus: true,
      },
      {
        name: 'Daniel Okoro',
        leadingVisual: 'Direct Message',
        status: 'Mention',
        mentionCount: 1,
        avatarSrc: avatarDanielOkoro,
        avatarAlt: 'Daniel Okoro',
        showAvatarStatus: true,
      },
    );
  }
  dmItems.push(
    {
      name: 'Richard McDaniel, P...',
      leadingVisual: 'Group Message',
      memberCount: 2,
    },
    {
      name: 'Darius Cole',
      leadingVisual: 'Direct Message',
      avatarSrc: avatarDariusCole,
      avatarAlt: 'Darius Cole',
      showAvatarStatus: true,
    },
    {
      name: 'David Liang',
      leadingVisual: 'Direct Message',
      avatarSrc: avatarDavidLiang,
      avatarAlt: 'David Liang',
      showAvatarStatus: true,
    },
    {
      name: 'Emma Novak',
      leadingVisual: 'Direct Message',
      avatarSrc: avatarEmmaNovak,
      avatarAlt: 'Emma Novak',
      showAvatarStatus: true,
    },
    {
      name: 'Ethan Brooks',
      leadingVisual: 'Direct Message',
      avatarSrc: avatarEthanBrooks,
      avatarAlt: 'Ethan Brooks',
      showAvatarStatus: true,
    },
  );

  groups.push({
    key: 'direct-messages',
    category: { label: 'Direct Messages', showPlusButton: true },
    items: dmItems,
  });

  return { topGroupItems, groups };
}

/**
 * Applies per-page display renames (keys = default names from the model) to
 * `name` and `avatarAlt` on each row, matching pre-model `channelNameOverrides` behavior.
 */
export function applyChannelNameOverrides(
  model: ChannelsSidebarModel,
  channelNameOverrides?: Record<string, string>,
): ChannelsSidebarModel {
  if (!channelNameOverrides || Object.keys(channelNameOverrides).length === 0) {
    return model;
  }

  const resolve = (s: string) => channelNameOverrides[s] ?? s;

  const mapRow = (row: ChannelsSidebarItemModel): ChannelsSidebarItemModel => ({
    ...row,
    name: resolve(row.name),
    avatarAlt: row.avatarAlt != null ? resolve(row.avatarAlt) : row.avatarAlt,
  });

  return {
    topGroupItems: model.topGroupItems.map(mapRow),
    groups: model.groups.map((g) => ({
      ...g,
      items: g.items.map(mapRow),
    })),
  };
}
