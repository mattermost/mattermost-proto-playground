import type { ComponentType } from 'react';

export type LibraryStatus = 'stable' | 'beta' | 'deprecated';
export type LibraryCategory =
  | 'foundations'
  | 'components'
  | 'patterns'
  | 'layouts';

export interface LibraryEntry {
  /** URL-safe identifier, used as the route slug. */
  slug: string;
  /** Display name. */
  name: string;
  /** Top-level grouping. */
  category: LibraryCategory;
  /** Lifecycle stage. Stored now, surfaced in UI later. */
  status: LibraryStatus;
  /** One-line summary for index pages and search. */
  description?: string;
  /** Lazy import of the .library.tsx page. */
  page: () => Promise<{ default: ComponentType }>;
  /** Render outside DocPage chrome. Use for layouts and other full-width demos. */
  fullBleed?: boolean;
}

export const LIBRARY_ENTRIES: LibraryEntry[] = [
  {
    slug: 'action-button',
    name: 'Action Button',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/ActionButton/ActionButton.library'),
  },
  {
    slug: 'app-bar-item',
    name: 'App Bar Item',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/AppBarItem/AppBarItem.library'),
  },
  {
    slug: 'attachment-card',
    name: 'Attachment Card',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/AttachmentCard/AttachmentCard.library'),
  },
  {
    slug: 'button',
    name: 'Button',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/Button/Button.library'),
  },
  {
    slug: 'call-participant-avatar',
    name: 'Call Participant Avatar',
    category: 'components',
    status: 'stable',
    page: () =>
      import('@/components/ui/CallParticipantAvatar/CallParticipantAvatar.library'),
  },
  {
    slug: 'channel-info-msg-header',
    name: 'Channel Info Msg Header',
    category: 'components',
    status: 'stable',
    page: () =>
      import('@/components/ui/ChannelInfoMsgHeader/ChannelInfoMsgHeader.library'),
  },
  {
    slug: 'channel-sidebar-item',
    name: 'Channel Sidebar Item',
    category: 'components',
    status: 'stable',
    page: () =>
      import('@/components/ui/ChannelSidebarItem/ChannelSidebarItem.library'),
  },
  {
    slug: 'checkbox',
    name: 'Checkbox',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/Checkbox/Checkbox.library'),
  },
  {
    slug: 'chip',
    name: 'Chip',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/Chip/Chip.library'),
  },
  {
    slug: 'date-range-picker',
    name: 'Date & Range Picker',
    category: 'components',
    status: 'stable',
    page: () =>
      import('@/components/ui/DateRangePicker/DateRangePicker.library'),
  },
  {
    slug: 'divider',
    name: 'Divider',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/Divider/Divider.library'),
  },
  {
    slug: 'dropdown',
    name: 'Dropdown',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/Dropdown/Dropdown.library'),
  },
  {
    slug: 'emoji',
    name: 'Emoji',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/Emoji/Emoji.library'),
  },
  {
    slug: 'empty-state',
    name: 'Empty State',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/EmptyState/EmptyState.library'),
  },
  {
    slug: 'error-message',
    name: 'Error Message',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/ErrorMessage/ErrorMessage.library'),
  },
  {
    slug: 'feature-discovery-panel',
    name: 'Feature Discovery Panel',
    category: 'components',
    status: 'stable',
    page: () =>
      import('@/components/ui/FeatureDiscoveryPanel/FeatureDiscoveryPanel.library'),
  },
  {
    slug: 'global-banner',
    name: 'Global Banner',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/GlobalBanner/GlobalBanner.library'),
  },
  {
    slug: 'icon',
    name: 'Icon',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/Icon/Icon.library'),
  },
  {
    slug: 'icon-button',
    name: 'Icon Button',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/IconButton/IconButton.library'),
  },
  {
    slug: 'illustration',
    name: 'Illustration',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/Illustration/Illustration.library'),
  },
  {
    slug: 'image-preview',
    name: 'Image Preview',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/ImagePreview/ImagePreview.library'),
  },
  {
    slug: 'label-tag',
    name: 'Label Tag',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/LabelTag/LabelTag.library'),
  },
  {
    slug: 'link-preview',
    name: 'Link Preview',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/LinkPreview/LinkPreview.library'),
  },
  {
    slug: 'mention-badge',
    name: 'Mention Badge',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/MentionBadge/MentionBadge.library'),
  },
  {
    slug: 'menu-item',
    name: 'Menu Item',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/MenuItem/MenuItem.library'),
  },
  {
    slug: 'message-actions',
    name: 'Message Actions',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/MessageActions/MessageActions.library'),
  },
  {
    slug: 'message-header',
    name: 'Message Header',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/MessageHeader/MessageHeader.library'),
  },
  {
    slug: 'message-reactions',
    name: 'Message Reactions',
    category: 'components',
    status: 'stable',
    page: () =>
      import('@/components/ui/MessageReactions/MessageReactions.library'),
  },
  {
    slug: 'message-separator',
    name: 'Message Separator',
    category: 'components',
    status: 'stable',
    page: () =>
      import('@/components/ui/MessageSeparator/MessageSeparator.library'),
  },
  {
    slug: 'more-unreads-banner',
    name: 'More Unreads Banner',
    category: 'components',
    status: 'stable',
    page: () =>
      import('@/components/ui/MoreUnreadsBanner/MoreUnreadsBanner.library'),
  },
  {
    slug: 'new-message-banner',
    name: 'New Message Banner',
    category: 'components',
    status: 'stable',
    page: () =>
      import('@/components/ui/NewMessageBanner/NewMessageBanner.library'),
  },
  {
    slug: 'pagination-dots',
    name: 'Pagination Dots',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/PaginationDots/PaginationDots.library'),
  },
  {
    slug: 'permalink-preview',
    name: 'Permalink Preview',
    category: 'components',
    status: 'stable',
    page: () =>
      import('@/components/ui/PermalinkPreview/PermalinkPreview.library'),
  },
  {
    slug: 'popover-notice',
    name: 'Popover Notice',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/PopoverNotice/PopoverNotice.library'),
  },
  {
    slug: 'progress-bar',
    name: 'Progress Bar',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/ProgressBar/ProgressBar.library'),
  },
  {
    slug: 'radio',
    name: 'Radio',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/Radio/Radio.library'),
  },
  {
    slug: 'reaction-pill',
    name: 'Reaction Pill',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/ReactionPill/ReactionPill.library'),
  },
  {
    slug: 'recording-pill',
    name: 'Recording Pill',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/RecordingPill/RecordingPill.library'),
  },
  {
    slug: 'scrollbar',
    name: 'Scrollbar',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/Scrollbar/Scrollbar.library'),
  },
  {
    slug: 'search-input',
    name: 'Search Input',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/SearchInput/SearchInput.library'),
  },
  {
    slug: 'search-tip-banner',
    name: 'Search Tip Banner',
    category: 'components',
    status: 'stable',
    page: () =>
      import('@/components/ui/SearchTipBanner/SearchTipBanner.library'),
  },
  {
    slug: 'section-notice',
    name: 'Section Notice',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/SectionNotice/SectionNotice.library'),
  },
  {
    slug: 'select',
    name: 'Select',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/Select/Select.library'),
  },
  {
    slug: 'spinner',
    name: 'Spinner',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/Spinner/Spinner.library'),
  },
  {
    slug: 'status-badge',
    name: 'Status Badge',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/StatusBadge/StatusBadge.library'),
  },
  {
    slug: 'switch',
    name: 'Switch',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/Switch/Switch.library'),
  },
  {
    slug: 'tabs',
    name: 'Tabs',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/Tabs/Tabs.library'),
  },
  {
    slug: 'tags',
    name: 'Tags',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/Tags/Tags.library'),
  },
  {
    slug: 'team-avatar',
    name: 'Team Avatar',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/TeamAvatar/TeamAvatar.library'),
  },
  {
    slug: 'text-area',
    name: 'Text Area',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/TextArea/TextArea.library'),
  },
  {
    slug: 'text-input',
    name: 'Text Input',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/TextInput/TextInput.library'),
  },
  {
    slug: 'thread-footer',
    name: 'Thread Footer',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/ThreadFooter/ThreadFooter.library'),
  },
  {
    slug: 'thread-list-item',
    name: 'Thread List Item',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/ThreadListItem/ThreadListItem.library'),
  },
  {
    slug: 'toast-banner',
    name: 'Toast Banner',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/ToastBanner/ToastBanner.library'),
  },
  {
    slug: 'tooltip',
    name: 'Tooltip',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/Tooltip/Tooltip.library'),
  },
  {
    slug: 'unread-badge',
    name: 'Unread Badge',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/UnreadBadge/UnreadBadge.library'),
  },
  {
    slug: 'user-avatar',
    name: 'User Avatar',
    category: 'components',
    status: 'stable',
    page: () => import('@/components/ui/UserAvatar/UserAvatar.library'),
  },
  {
    slug: 'user-avatar-group',
    name: 'User Avatar Group',
    category: 'components',
    status: 'stable',
    page: () =>
      import('@/components/ui/UserAvatarGroup/UserAvatarGroup.library'),
  },

  // Patterns
  {
    slug: 'modal',
    name: 'Modal',
    category: 'patterns',
    status: 'stable',
    page: () => import('@/components/ui/Modal/Modal.library'),
  },
  {
    slug: 'global-header',
    name: 'Global Header',
    category: 'patterns',
    status: 'stable',
    page: () => import('@/components/ui/GlobalHeader/GlobalHeader.library'),
  },
  {
    slug: 'channel-header',
    name: 'Channel Header',
    category: 'patterns',
    status: 'stable',
    page: () => import('@/components/ui/ChannelHeader/ChannelHeader.library'),
  },
  {
    slug: 'post',
    name: 'Post',
    category: 'patterns',
    status: 'stable',
    page: () => import('@/components/ui/Post/Post.library'),
  },
  {
    slug: 'team-sidebar',
    name: 'Team Sidebar',
    category: 'patterns',
    status: 'stable',
    page: () => import('@/components/ui/TeamSidebar/TeamSidebar.library'),
  },
  {
    slug: 'channel-sidebar',
    name: 'Channel Sidebar',
    category: 'patterns',
    status: 'stable',
    page: () =>
      import('@/components/ui/ChannelsSidebar/ChannelsSidebar.library'),
  },
  {
    slug: 'message-input',
    name: 'Message Input',
    category: 'patterns',
    status: 'stable',
    page: () => import('@/components/ui/MessageInput/MessageInput.library'),
  },
  {
    slug: 'call-widget',
    name: 'Call Widget',
    category: 'patterns',
    status: 'stable',
    page: () => import('@/components/ui/CallWidget/CallWidget.library'),
  },
  {
    slug: 'profile-popover',
    name: 'Profile Popover',
    category: 'patterns',
    status: 'stable',
    page: () => import('@/components/ui/ProfilePopover/ProfilePopover.library'),
  },
  {
    slug: 'right-sidebar',
    name: 'Right Sidebar',
    category: 'patterns',
    status: 'stable',
    page: () => import('@/components/ui/RightSidebar/RightSidebar.library'),
  },

  // Layouts
  {
    slug: 'messaging',
    name: 'Messaging',
    category: 'layouts',
    status: 'stable',
    page: () => import('@/pages/Layouts/Layouts'),
    fullBleed: true,
  },
];

export function findLibraryEntry(
  category: LibraryCategory,
  slug: string,
): LibraryEntry | undefined {
  return LIBRARY_ENTRIES.find(
    (e) => e.category === category && e.slug === slug,
  );
}

export function libraryEntriesByCategory(
  category: LibraryCategory,
): LibraryEntry[] {
  return LIBRARY_ENTRIES.filter((e) => e.category === category);
}
