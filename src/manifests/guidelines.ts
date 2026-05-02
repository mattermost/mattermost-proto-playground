import type { ComponentType } from 'react';

export type GuidelineCategory =
  | 'overview'
  | 'foundations'
  | 'components'
  | 'patterns'
  | 'layouts';

export interface GuidelineEntry {
  /** URL-safe identifier. */
  slug: string;
  /** Display name. */
  name: string;
  /** Top-level grouping. */
  category: GuidelineCategory;
  /** One-line summary for index pages and the page hero. */
  description?: string;
  /** Lazy import of the .mdx page. */
  page: () => Promise<{ default: ComponentType }>;
}

export const GUIDELINE_ENTRIES: GuidelineEntry[] = [
  // Overview
  {
    slug: 'why-compass',
    name: 'Why Compass',
    category: 'overview',
    description: 'Why we built Compass and the problems it solves.',
    page: () => import('@/guidelines/overview/WhyCompass.mdx'),
  },
  {
    slug: 'principles',
    name: 'Design Principles',
    category: 'overview',
    description: 'Principles that guide every design decision.',
    page: () => import('@/guidelines/overview/Principles.mdx'),
  },
  {
    slug: 'system-hierarchy',
    name: 'System Hierarchy',
    category: 'overview',
    description: 'How foundations, components, patterns, and layouts relate.',
    page: () => import('@/guidelines/overview/SystemHierarchy.mdx'),
  },
  {
    slug: 'status-legend',
    name: 'Status Legend',
    category: 'overview',
    description: 'How to read status badges on library entries.',
    page: () => import('@/guidelines/overview/StatusLegend.mdx'),
  },

  // Foundations
  {
    slug: 'writing-style',
    name: 'Writing Style',
    category: 'foundations',
    description: 'Voice, tone, and language conventions across the product.',
    page: () => import('@/guidelines/foundations/WritingStyle.mdx'),
  },
  {
    slug: 'usability-heuristics',
    name: 'Usability Heuristics',
    category: 'foundations',
    description: 'The lens we use to evaluate design quality.',
    page: () => import('@/guidelines/foundations/UsabilityHeuristics.mdx'),
  },
  {
    slug: 'system-feedback',
    name: 'System Feedback',
    category: 'foundations',
    description:
      'How the system communicates back to the user — confirmation, errors, progress.',
    page: () => import('@/guidelines/foundations/SystemFeedback.mdx'),
  },
  {
    slug: 'accessibility-guidelines',
    name: 'Accessibility Guidelines',
    category: 'foundations',
    description:
      'Standards every component must meet — contrast, keyboard, assistive tech.',
    page: () => import('@/guidelines/foundations/AccessibilityGuidelines.mdx'),
  },
  {
    slug: 'color',
    name: 'Color',
    category: 'foundations',
    description: 'Palette intent, semantic tokens, and contrast rules.',
    page: () => import('@/guidelines/foundations/Color.mdx'),
  },
  {
    slug: 'themes',
    name: 'Themes',
    category: 'foundations',
    description: 'How themes adapt color and authoring components that work across them.',
    page: () => import('@/guidelines/foundations/Themes.mdx'),
  },
  {
    slug: 'typography',
    name: 'Typography',
    category: 'foundations',
    description: 'Type families, the scale, and weight conventions.',
    page: () => import('@/guidelines/foundations/Typography.mdx'),
  },
  {
    slug: 'iconography',
    name: 'Iconography',
    category: 'foundations',
    description: 'When to use icons, sizing, and pairing with labels.',
    page: () => import('@/guidelines/foundations/Iconography.mdx'),
  },
  {
    slug: 'shape',
    name: 'Shape',
    category: 'foundations',
    description: 'Corner radius scale and the role of shape in hierarchy.',
    page: () => import('@/guidelines/foundations/Shape.mdx'),
  },
  {
    slug: 'elevation',
    name: 'Elevation',
    category: 'foundations',
    description: 'The relative distance between objects along the z-axis.',
    page: () => import('@/guidelines/foundations/Elevation.mdx'),
  },
  {
    slug: 'spacing',
    name: 'Spacing',
    category: 'foundations',
    description: 'The base unit, spacing scale, and how padding flows from it.',
    page: () => import('@/guidelines/foundations/Spacing.mdx'),
  },
  {
    slug: 'layout',
    name: 'Layout',
    category: 'foundations',
    description: 'Grids, breakpoints, panel offsets, and interaction targets.',
    page: () => import('@/guidelines/foundations/Layout.mdx'),
  },
  {
    slug: 'animation',
    name: 'Animation',
    category: 'foundations',
    description: 'Duration and easing tokens, and when to animate.',
    page: () => import('@/guidelines/foundations/Animation.mdx'),
  },

  // Components
  {
    slug: 'action-button',
    name: 'Action Button',
    category: 'components',
    page: () => import('@/guidelines/components/ActionButton.mdx'),
  },
  {
    slug: 'app-bar-item',
    name: 'App Bar Item',
    category: 'components',
    page: () => import('@/guidelines/components/AppBarItem.mdx'),
  },
  {
    slug: 'attachment-card',
    name: 'Attachment Card',
    category: 'components',
    page: () => import('@/guidelines/components/AttachmentCard.mdx'),
  },
  {
    slug: 'button',
    name: 'Button',
    category: 'components',
    description:
      'Anatomy, sizes, emphasis, states, variations, and positioning for the button family.',
    page: () => import('@/guidelines/components/Button.mdx'),
  },
  {
    slug: 'call-participant-avatar',
    name: 'Call Participant Avatar',
    category: 'components',
    page: () => import('@/guidelines/components/CallParticipantAvatar.mdx'),
  },
  {
    slug: 'channel-info-msg-header',
    name: 'Channel Info Msg Header',
    category: 'components',
    page: () => import('@/guidelines/components/ChannelInfoMsgHeader.mdx'),
  },
  {
    slug: 'channel-sidebar-item',
    name: 'Channel Sidebar Item',
    category: 'components',
    page: () => import('@/guidelines/components/ChannelSidebarItem.mdx'),
  },
  {
    slug: 'checkbox',
    name: 'Checkbox',
    category: 'components',
    page: () => import('@/guidelines/components/Checkbox.mdx'),
  },
  {
    slug: 'chip',
    name: 'Chip',
    category: 'components',
    page: () => import('@/guidelines/components/Chip.mdx'),
  },
  {
    slug: 'date-range-picker',
    name: 'Date & Range Picker',
    category: 'components',
    page: () => import('@/guidelines/components/DateRangePicker.mdx'),
  },
  {
    slug: 'divider',
    name: 'Divider',
    category: 'components',
    page: () => import('@/guidelines/components/Divider.mdx'),
  },
  {
    slug: 'dropdown',
    name: 'Dropdown',
    category: 'components',
    page: () => import('@/guidelines/components/Dropdown.mdx'),
  },
  {
    slug: 'emoji',
    name: 'Emoji',
    category: 'components',
    page: () => import('@/guidelines/components/Emoji.mdx'),
  },
  {
    slug: 'empty-state',
    name: 'Empty State',
    category: 'components',
    page: () => import('@/guidelines/components/EmptyState.mdx'),
  },
  {
    slug: 'error-message',
    name: 'Error Message',
    category: 'components',
    page: () => import('@/guidelines/components/ErrorMessage.mdx'),
  },
  {
    slug: 'feature-discovery-panel',
    name: 'Feature Discovery Panel',
    category: 'components',
    page: () => import('@/guidelines/components/FeatureDiscoveryPanel.mdx'),
  },
  {
    slug: 'global-banner',
    name: 'Global Banner',
    category: 'components',
    page: () => import('@/guidelines/components/GlobalBanner.mdx'),
  },
  {
    slug: 'icon',
    name: 'Icon',
    category: 'components',
    page: () => import('@/guidelines/components/Icon.mdx'),
  },
  {
    slug: 'icon-button',
    name: 'Icon Button',
    category: 'components',
    page: () => import('@/guidelines/components/IconButton.mdx'),
  },
  {
    slug: 'illustration',
    name: 'Illustration',
    category: 'components',
    page: () => import('@/guidelines/components/Illustration.mdx'),
  },
  {
    slug: 'image-preview',
    name: 'Image Preview',
    category: 'components',
    page: () => import('@/guidelines/components/ImagePreview.mdx'),
  },
  {
    slug: 'label-tag',
    name: 'Label Tag',
    category: 'components',
    page: () => import('@/guidelines/components/LabelTag.mdx'),
  },
  {
    slug: 'link-preview',
    name: 'Link Preview',
    category: 'components',
    page: () => import('@/guidelines/components/LinkPreview.mdx'),
  },
  {
    slug: 'mention-badge',
    name: 'Mention Badge',
    category: 'components',
    page: () => import('@/guidelines/components/MentionBadge.mdx'),
  },
  {
    slug: 'menu-item',
    name: 'Menu Item',
    category: 'components',
    page: () => import('@/guidelines/components/MenuItem.mdx'),
  },
  {
    slug: 'message-actions',
    name: 'Message Actions',
    category: 'components',
    page: () => import('@/guidelines/components/MessageActions.mdx'),
  },
  {
    slug: 'message-header',
    name: 'Message Header',
    category: 'components',
    page: () => import('@/guidelines/components/MessageHeader.mdx'),
  },
  {
    slug: 'message-reactions',
    name: 'Message Reactions',
    category: 'components',
    page: () => import('@/guidelines/components/MessageReactions.mdx'),
  },
  {
    slug: 'message-separator',
    name: 'Message Separator',
    category: 'components',
    page: () => import('@/guidelines/components/MessageSeparator.mdx'),
  },
  {
    slug: 'more-unreads-banner',
    name: 'More Unreads Banner',
    category: 'components',
    page: () => import('@/guidelines/components/MoreUnreadsBanner.mdx'),
  },
  {
    slug: 'new-message-banner',
    name: 'New Message Banner',
    category: 'components',
    page: () => import('@/guidelines/components/NewMessageBanner.mdx'),
  },
  {
    slug: 'pagination-dots',
    name: 'Pagination Dots',
    category: 'components',
    page: () => import('@/guidelines/components/PaginationDots.mdx'),
  },
  {
    slug: 'permalink-preview',
    name: 'Permalink Preview',
    category: 'components',
    page: () => import('@/guidelines/components/PermalinkPreview.mdx'),
  },
  {
    slug: 'popover-notice',
    name: 'Popover Notice',
    category: 'components',
    page: () => import('@/guidelines/components/PopoverNotice.mdx'),
  },
  {
    slug: 'progress-bar',
    name: 'Progress Bar',
    category: 'components',
    page: () => import('@/guidelines/components/ProgressBar.mdx'),
  },
  {
    slug: 'radio',
    name: 'Radio',
    category: 'components',
    page: () => import('@/guidelines/components/Radio.mdx'),
  },
  {
    slug: 'reaction-pill',
    name: 'Reaction Pill',
    category: 'components',
    page: () => import('@/guidelines/components/ReactionPill.mdx'),
  },
  {
    slug: 'recording-pill',
    name: 'Recording Pill',
    category: 'components',
    page: () => import('@/guidelines/components/RecordingPill.mdx'),
  },
  {
    slug: 'scrollbar',
    name: 'Scrollbar',
    category: 'components',
    page: () => import('@/guidelines/components/Scrollbar.mdx'),
  },
  {
    slug: 'search-input',
    name: 'Search Input',
    category: 'components',
    page: () => import('@/guidelines/components/SearchInput.mdx'),
  },
  {
    slug: 'search-tip-banner',
    name: 'Search Tip Banner',
    category: 'components',
    page: () => import('@/guidelines/components/SearchTipBanner.mdx'),
  },
  {
    slug: 'section-notice',
    name: 'Section Notice',
    category: 'components',
    page: () => import('@/guidelines/components/SectionNotice.mdx'),
  },
  {
    slug: 'select',
    name: 'Select',
    category: 'components',
    page: () => import('@/guidelines/components/Select.mdx'),
  },
  {
    slug: 'spinner',
    name: 'Spinner',
    category: 'components',
    page: () => import('@/guidelines/components/Spinner.mdx'),
  },
  {
    slug: 'status-badge',
    name: 'Status Badge',
    category: 'components',
    page: () => import('@/guidelines/components/StatusBadge.mdx'),
  },
  {
    slug: 'switch',
    name: 'Switch',
    category: 'components',
    page: () => import('@/guidelines/components/Switch.mdx'),
  },
  {
    slug: 'tabs',
    name: 'Tabs',
    category: 'components',
    page: () => import('@/guidelines/components/Tabs.mdx'),
  },
  {
    slug: 'tags',
    name: 'Tags',
    category: 'components',
    page: () => import('@/guidelines/components/Tags.mdx'),
  },
  {
    slug: 'team-avatar',
    name: 'Team Avatar',
    category: 'components',
    page: () => import('@/guidelines/components/TeamAvatar.mdx'),
  },
  {
    slug: 'text-area',
    name: 'Text Area',
    category: 'components',
    page: () => import('@/guidelines/components/TextArea.mdx'),
  },
  {
    slug: 'text-input',
    name: 'Text Input',
    category: 'components',
    page: () => import('@/guidelines/components/TextInput.mdx'),
  },
  {
    slug: 'thread-footer',
    name: 'Thread Footer',
    category: 'components',
    page: () => import('@/guidelines/components/ThreadFooter.mdx'),
  },
  {
    slug: 'thread-list-item',
    name: 'Thread List Item',
    category: 'components',
    page: () => import('@/guidelines/components/ThreadListItem.mdx'),
  },
  {
    slug: 'toast-banner',
    name: 'Toast Banner',
    category: 'components',
    page: () => import('@/guidelines/components/ToastBanner.mdx'),
  },
  {
    slug: 'tooltip',
    name: 'Tooltip',
    category: 'components',
    page: () => import('@/guidelines/components/Tooltip.mdx'),
  },
  {
    slug: 'unread-badge',
    name: 'Unread Badge',
    category: 'components',
    page: () => import('@/guidelines/components/UnreadBadge.mdx'),
  },
  {
    slug: 'user-avatar',
    name: 'User Avatar',
    category: 'components',
    page: () => import('@/guidelines/components/UserAvatar.mdx'),
  },
  {
    slug: 'user-avatar-group',
    name: 'User Avatar Group',
    category: 'components',
    page: () => import('@/guidelines/components/UserAvatarGroup.mdx'),
  },
];

export function findGuidelineEntry(
  category: GuidelineCategory,
  slug: string,
): GuidelineEntry | undefined {
  return GUIDELINE_ENTRIES.find(
    (e) => e.category === category && e.slug === slug,
  );
}

export function guidelineEntriesByCategory(
  category: GuidelineCategory,
): GuidelineEntry[] {
  return GUIDELINE_ENTRIES.filter((e) => e.category === category);
}
