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
