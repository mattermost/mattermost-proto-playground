import type { ChannelsSidebarModel } from '@mattermost/compass-ui/components/channels-sidebar';
import avatarAikoTan from '@/assets/avatars/Aiko Tan.png';
import avatarArjunPatel from '@/assets/avatars/Arjun Patel.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';

/**
 * The channel the policy hides. Private, defense-flavoured, and named so that
 * its absence in later screens is obvious at a glance.
 */
export const RESTRICTED_CHANNEL = 'Watchfloor Ops';

/**
 * A second channel covered by the same policy, but PUBLIC.
 *
 * Needed for the Browse Channels case: browse only lists public channels, so a
 * private channel's absence there would prove nothing. The policy applies
 * workspace-wide regardless of channel type, so a public channel under the same
 * rule is the honest way to show that denial removes it from discovery too.
 */
export const PUBLIC_RESTRICTED_CHANNEL = 'Range Control';

export const DEFAULT_DM = 'Aiko Tan';
export const GROUP_MESSAGE = 'Watch leads';

/**
 * Local row shape.
 *
 * `ChannelsSidebarItemModel` is published as a `Pick<…>` whose members resolve
 * as required rather than optional, so building rows against it directly forces
 * every optional field to be spelled out. This mirrors the fields we actually
 * set and is cast at the boundary instead.
 */
type SidebarRow = {
  name: string;
  leadingVisual:
    | 'public'
    | 'private'
    | 'direct-message'
    | 'group-message'
    | 'threads'
    | 'drafts';
  status?: 'read' | 'unread' | 'mention';
  mentionCount?: number;
  memberCount?: number;
  avatarSrc?: string;
  avatarAlt?: string;
  showAvatarStatus?: boolean;
  active?: boolean;
  onClick?: () => void;
};

const TOP_GROUP: SidebarRow[] = [
  { name: 'Threads', leadingVisual: 'threads' },
  { name: 'Drafts', leadingVisual: 'drafts' },
];

const DM_ROWS: SidebarRow[] = [
  {
    name: DEFAULT_DM,
    leadingVisual: 'direct-message',
    avatarSrc: avatarAikoTan,
    avatarAlt: 'Aiko Tan',
    showAvatarStatus: true,
  },
  {
    name: 'Arjun Patel',
    leadingVisual: 'direct-message',
    avatarSrc: avatarArjunPatel,
    avatarAlt: 'Arjun Patel',
    showAvatarStatus: true,
  },
  {
    name: GROUP_MESSAGE,
    leadingVisual: 'group-message',
    memberCount: 3,
  },
  {
    name: 'Marco Rinaldi',
    leadingVisual: 'direct-message',
    avatarSrc: avatarMarco,
    avatarAlt: 'Marco Rinaldi',
    showAvatarStatus: true,
  },
];

const DIRECT_OR_GROUP_NAMES = new Set(DM_ROWS.map((row) => row.name));

/** DMs and GMs are out of scope for both Read Channel and Create Posts. */
export function isDirectOrGroup(name: string): boolean {
  return DIRECT_OR_GROUP_NAMES.has(name);
}

export function buildSidebarModel(options: {
  activeChannelName?: string;
  restrictedState?: 'read' | 'unread' | 'mention';
  restrictedMentionCount?: number;
  onItemClick?: (name: string) => void;
  /** When false, the CHANNELS group is omitted — workspace-wide Read Channel denial. */
  includeChannels?: boolean;
}): ChannelsSidebarModel {
  const {
    activeChannelName = '',
    restrictedState,
    restrictedMentionCount,
    onItemClick,
    includeChannels = true,
  } = options;

  const channelItems: SidebarRow[] = [
    { name: 'Town Square', leadingVisual: 'public' },
    { name: 'Off-Topic', leadingVisual: 'public' },
    { name: 'Engineering', leadingVisual: 'public', status: 'unread' },
  ];

  // The restricted channel sits mid-list so its removal leaves a visible gap in
  // the alphabetical run rather than trimming the end of the list.
  if (restrictedState) {
    channelItems.splice(2, 0, {
      name: RESTRICTED_CHANNEL,
      leadingVisual: 'private',
      status: restrictedState,
      ...(restrictedMentionCount ? { mentionCount: restrictedMentionCount } : {}),
    });
  }

  const withHandlers = (item: SidebarRow): SidebarRow => ({
    ...item,
    active: item.name === activeChannelName,
    onClick: onItemClick ? () => onItemClick(item.name) : undefined,
  });

  const groups = [];
  if (includeChannels) {
    groups.push({
      key: 'channels',
      category: { label: 'CHANNELS', showChevron: true, showPlusButton: true },
      items: channelItems.map(withHandlers),
    });
  }
  groups.push({
    key: 'dms',
    category: { label: 'DIRECT MESSAGES', showChevron: true, showPlusButton: true },
    items: DM_ROWS.map(withHandlers),
  });

  return {
    topGroupItems: TOP_GROUP.map(withHandlers),
    groups,
  } as ChannelsSidebarModel;
}
