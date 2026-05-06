import type { ComponentType } from 'react';

export type TopicCategory = 'foundations' | 'components' | 'patterns' | 'layouts';

export type TopicStatus = 'stable' | 'beta' | 'deprecated';

/**
 * Visual hint for richly-rendered index cards (e.g. the Foundations bento).
 * `kind` selects which visual primitive to render. Indexes that don't use
 * card layout ignore this. Card sizing (hero, medium, small) is decided by
 * the index page's layout, not the manifest entry.
 */
export interface TopicVisual {
  kind:
    | 'swatches'
    | 'type-specimen'
    | 'icon-grid'
    | 'spacing-stack'
    | 'shape-stack'
    | 'elevation-stack'
    | 'theme-split'
    | 'motion'
    | 'layout-grid';
}

/**
 * A single design-system topic. The page shell renders Guidelines (prose)
 * and Specimen (live demos) as tabs over the same topic. Topics with no
 * `specimenPage` (e.g. overview-style writing) hide the tab strip and just
 * render the guideline.
 */
export interface Topic {
  /** URL-safe identifier, used as the route slug. */
  slug: string;
  /** Display name. */
  name: string;
  /** Top-level grouping. */
  category: TopicCategory;
  /** One-line summary for index pages and the page hero. */
  description?: string;
  /** Lifecycle stage; surfaced as a chip in the hero when set. */
  status?: TopicStatus;
  /** Optional visual hint for card-style index pages (e.g. Foundations bento). */
  visual?: TopicVisual;
  /** Lazy import of the .mdx guideline page. Required — every topic has prose. */
  guidelinePage: () => Promise<{ default: ComponentType }>;
  /** Lazy import of the .library.tsx specimen page. Omit for prose-only topics. */
  specimenPage?: () => Promise<{ default: ComponentType }>;
  /** Render specimen outside DocPage chrome. Use for layouts and other full-width demos. */
  fullBleedSpecimen?: boolean;
}

export const TOPICS: Topic[] = [
  // ===========================================================================
  // Foundations
  // ===========================================================================
  {
    slug: 'why-compass',
    name: 'Why Compass',
    category: 'foundations',
    description: 'Why we built Compass and the problems it solves.',
    guidelinePage: () => import('@/guidelines/overview/WhyCompass.mdx'),
  },
  {
    slug: 'principles',
    name: 'Design Principles',
    category: 'foundations',
    description: 'Principles that guide every design decision.',
    guidelinePage: () => import('@/guidelines/overview/Principles.mdx'),
  },
  {
    slug: 'system-hierarchy',
    name: 'System Hierarchy',
    category: 'foundations',
    description: 'How foundations, components, patterns, and layouts relate.',
    guidelinePage: () => import('@/guidelines/overview/SystemHierarchy.mdx'),
  },
  {
    slug: 'writing-style',
    name: 'Writing Style',
    category: 'foundations',
    description: 'Voice, tone, and language conventions across the product.',
    guidelinePage: () => import('@/guidelines/foundations/WritingStyle.mdx'),
  },
  {
    slug: 'usability-heuristics',
    name: 'Usability Heuristics',
    category: 'foundations',
    description: 'The lens we use to evaluate design quality.',
    guidelinePage: () => import('@/guidelines/foundations/UsabilityHeuristics.mdx'),
  },
  {
    slug: 'system-feedback',
    name: 'System Feedback',
    category: 'foundations',
    description:
      'How the system communicates back to the user — confirmation, errors, progress.',
    guidelinePage: () => import('@/guidelines/foundations/SystemFeedback.mdx'),
  },
  {
    slug: 'accessibility-guidelines',
    name: 'Accessibility Guidelines',
    category: 'foundations',
    description:
      'Standards every component must meet — contrast, keyboard, assistive tech.',
    guidelinePage: () => import('@/guidelines/foundations/AccessibilityGuidelines.mdx'),
  },
  {
    slug: 'color',
    name: 'Color',
    category: 'foundations',
    status: 'stable',
    description: 'Palette intent, semantic tokens, and contrast rules.',
    visual: { kind: 'swatches' },
    guidelinePage: () => import('@/guidelines/foundations/Color.mdx'),
    specimenPage: () => import('@/pages/Foundations/Color.library'),
  },
  {
    slug: 'themes',
    name: 'Themes',
    category: 'foundations',
    status: 'stable',
    description:
      'How themes adapt color and authoring components that work across them.',
    visual: { kind: 'theme-split' },
    guidelinePage: () => import('@/guidelines/foundations/Themes.mdx'),
    specimenPage: () => import('@/pages/Foundations/ThemeColors.library'),
  },
  {
    slug: 'typography',
    name: 'Typography',
    category: 'foundations',
    status: 'stable',
    description: 'Type families, the scale, and weight conventions.',
    visual: { kind: 'type-specimen' },
    guidelinePage: () => import('@/guidelines/foundations/Typography.mdx'),
    specimenPage: () => import('@/pages/Foundations/Typography.library'),
  },
  {
    slug: 'iconography',
    name: 'Iconography',
    category: 'foundations',
    description: 'When to use icons, sizing, and pairing with labels.',
    visual: { kind: 'icon-grid' },
    guidelinePage: () => import('@/guidelines/foundations/Iconography.mdx'),
  },
  {
    slug: 'shape',
    name: 'Shape',
    category: 'foundations',
    status: 'stable',
    description: 'Corner radius scale and the role of shape in hierarchy.',
    visual: { kind: 'shape-stack' },
    guidelinePage: () => import('@/guidelines/foundations/Shape.mdx'),
    specimenPage: () => import('@/pages/Foundations/Shape.library'),
  },
  {
    slug: 'elevation',
    name: 'Elevation',
    category: 'foundations',
    status: 'stable',
    description: 'The relative distance between objects along the z-axis.',
    visual: { kind: 'elevation-stack' },
    guidelinePage: () => import('@/guidelines/foundations/Elevation.mdx'),
    specimenPage: () => import('@/pages/Foundations/Elevation.library'),
  },
  {
    slug: 'spacing',
    name: 'Spacing',
    category: 'foundations',
    status: 'stable',
    description: 'The base unit, spacing scale, and how padding flows from it.',
    visual: { kind: 'spacing-stack' },
    guidelinePage: () => import('@/guidelines/foundations/Spacing.mdx'),
    specimenPage: () => import('@/pages/Foundations/Spacing.library'),
  },
  {
    slug: 'layout',
    name: 'Layout',
    category: 'foundations',
    description: 'Grids, breakpoints, panel offsets, and interaction targets.',
    visual: { kind: 'layout-grid' },
    guidelinePage: () => import('@/guidelines/foundations/Layout.mdx'),
  },
  {
    slug: 'animation',
    name: 'Animation',
    category: 'foundations',
    status: 'stable',
    description: 'Duration and easing tokens, and when to animate.',
    visual: { kind: 'motion' },
    guidelinePage: () => import('@/guidelines/foundations/Animation.mdx'),
    specimenPage: () => import('@/pages/Foundations/Animation.library'),
  },

  // ===========================================================================
  // Components
  // ===========================================================================
  {
    slug: 'action-button',
    name: 'Action Button',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/ActionButton.mdx'),
    specimenPage: () => import('@/components/ui/ActionButton/ActionButton.library'),
  },
  {
    slug: 'app-bar-item',
    name: 'App Bar Item',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/AppBarItem.mdx'),
    specimenPage: () => import('@/components/ui/AppBarItem/AppBarItem.library'),
  },
  {
    slug: 'attachment-card',
    name: 'Attachment Card',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/AttachmentCard.mdx'),
    specimenPage: () =>
      import('@/components/ui/AttachmentCard/AttachmentCard.library'),
  },
  {
    slug: 'button',
    name: 'Button',
    category: 'components',
    status: 'stable',
    description:
      'Anatomy, sizes, emphasis, states, variations, and positioning for the button family.',
    guidelinePage: () => import('@/guidelines/components/Button.mdx'),
    specimenPage: () => import('@/components/ui/Button/Button.library'),
  },
  {
    slug: 'call-participant-avatar',
    name: 'Call Participant Avatar',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/CallParticipantAvatar.mdx'),
    specimenPage: () =>
      import('@/components/ui/CallParticipantAvatar/CallParticipantAvatar.library'),
  },
  {
    slug: 'channel-info-msg-header',
    name: 'Channel Info Msg Header',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/ChannelInfoMsgHeader.mdx'),
    specimenPage: () =>
      import('@/components/ui/ChannelInfoMsgHeader/ChannelInfoMsgHeader.library'),
  },
  {
    slug: 'channel-sidebar-item',
    name: 'Channel Sidebar Item',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/ChannelSidebarItem.mdx'),
    specimenPage: () =>
      import('@/components/ui/ChannelSidebarItem/ChannelSidebarItem.library'),
  },
  {
    slug: 'checkbox',
    name: 'Checkbox',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/Checkbox.mdx'),
    specimenPage: () => import('@/components/ui/Checkbox/Checkbox.library'),
  },
  {
    slug: 'chip',
    name: 'Chip',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/Chip.mdx'),
    specimenPage: () => import('@/components/ui/Chip/Chip.library'),
  },
  {
    slug: 'date-range-picker',
    name: 'Date & Range Picker',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/DateRangePicker.mdx'),
    specimenPage: () =>
      import('@/components/ui/DateRangePicker/DateRangePicker.library'),
  },
  {
    slug: 'divider',
    name: 'Divider',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/Divider.mdx'),
    specimenPage: () => import('@/components/ui/Divider/Divider.library'),
  },
  {
    slug: 'dropdown',
    name: 'Dropdown',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/Dropdown.mdx'),
    specimenPage: () => import('@/components/ui/Dropdown/Dropdown.library'),
  },
  {
    slug: 'emoji',
    name: 'Emoji',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/Emoji.mdx'),
    specimenPage: () => import('@/components/ui/Emoji/Emoji.library'),
  },
  {
    slug: 'empty-state',
    name: 'Empty State',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/EmptyState.mdx'),
    specimenPage: () => import('@/components/ui/EmptyState/EmptyState.library'),
  },
  {
    slug: 'error-message',
    name: 'Error Message',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/ErrorMessage.mdx'),
    specimenPage: () => import('@/components/ui/ErrorMessage/ErrorMessage.library'),
  },
  {
    slug: 'feature-discovery-panel',
    name: 'Feature Discovery Panel',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/FeatureDiscoveryPanel.mdx'),
    specimenPage: () =>
      import('@/components/ui/FeatureDiscoveryPanel/FeatureDiscoveryPanel.library'),
  },
  {
    slug: 'global-banner',
    name: 'Global Banner',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/GlobalBanner.mdx'),
    specimenPage: () => import('@/components/ui/GlobalBanner/GlobalBanner.library'),
  },
  {
    slug: 'icon',
    name: 'Icon',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/Icon.mdx'),
    specimenPage: () => import('@/components/ui/Icon/Icon.library'),
  },
  {
    slug: 'icon-button',
    name: 'Icon Button',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/IconButton.mdx'),
    specimenPage: () => import('@/components/ui/IconButton/IconButton.library'),
  },
  {
    slug: 'illustration',
    name: 'Illustration',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/Illustration.mdx'),
    specimenPage: () => import('@/components/ui/Illustration/Illustration.library'),
  },
  {
    slug: 'image-preview',
    name: 'Image Preview',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/ImagePreview.mdx'),
    specimenPage: () => import('@/components/ui/ImagePreview/ImagePreview.library'),
  },
  {
    slug: 'label-tag',
    name: 'Label Tag',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/LabelTag.mdx'),
    specimenPage: () => import('@/components/ui/LabelTag/LabelTag.library'),
  },
  {
    slug: 'link-preview',
    name: 'Link Preview',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/LinkPreview.mdx'),
    specimenPage: () => import('@/components/ui/LinkPreview/LinkPreview.library'),
  },
  {
    slug: 'mention-badge',
    name: 'Mention Badge',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/MentionBadge.mdx'),
    specimenPage: () => import('@/components/ui/MentionBadge/MentionBadge.library'),
  },
  {
    slug: 'menu-item',
    name: 'Menu Item',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/MenuItem.mdx'),
    specimenPage: () => import('@/components/ui/MenuItem/MenuItem.library'),
  },
  {
    slug: 'message-actions',
    name: 'Message Actions',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/MessageActions.mdx'),
    specimenPage: () =>
      import('@/components/ui/MessageActions/MessageActions.library'),
  },
  {
    slug: 'message-header',
    name: 'Message Header',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/MessageHeader.mdx'),
    specimenPage: () => import('@/components/ui/MessageHeader/MessageHeader.library'),
  },
  {
    slug: 'message-reactions',
    name: 'Message Reactions',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/MessageReactions.mdx'),
    specimenPage: () =>
      import('@/components/ui/MessageReactions/MessageReactions.library'),
  },
  {
    slug: 'message-separator',
    name: 'Message Separator',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/MessageSeparator.mdx'),
    specimenPage: () =>
      import('@/components/ui/MessageSeparator/MessageSeparator.library'),
  },
  {
    slug: 'more-unreads-banner',
    name: 'More Unreads Banner',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/MoreUnreadsBanner.mdx'),
    specimenPage: () =>
      import('@/components/ui/MoreUnreadsBanner/MoreUnreadsBanner.library'),
  },
  {
    slug: 'new-message-banner',
    name: 'New Message Banner',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/NewMessageBanner.mdx'),
    specimenPage: () =>
      import('@/components/ui/NewMessageBanner/NewMessageBanner.library'),
  },
  {
    slug: 'pagination-dots',
    name: 'Pagination Dots',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/PaginationDots.mdx'),
    specimenPage: () =>
      import('@/components/ui/PaginationDots/PaginationDots.library'),
  },
  {
    slug: 'permalink-preview',
    name: 'Permalink Preview',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/PermalinkPreview.mdx'),
    specimenPage: () =>
      import('@/components/ui/PermalinkPreview/PermalinkPreview.library'),
  },
  {
    slug: 'popover-notice',
    name: 'Popover Notice',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/PopoverNotice.mdx'),
    specimenPage: () => import('@/components/ui/PopoverNotice/PopoverNotice.library'),
  },
  {
    slug: 'progress-bar',
    name: 'Progress Bar',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/ProgressBar.mdx'),
    specimenPage: () => import('@/components/ui/ProgressBar/ProgressBar.library'),
  },
  {
    slug: 'radio',
    name: 'Radio',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/Radio.mdx'),
    specimenPage: () => import('@/components/ui/Radio/Radio.library'),
  },
  {
    slug: 'reaction-pill',
    name: 'Reaction Pill',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/ReactionPill.mdx'),
    specimenPage: () => import('@/components/ui/ReactionPill/ReactionPill.library'),
  },
  {
    slug: 'recording-pill',
    name: 'Recording Pill',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/RecordingPill.mdx'),
    specimenPage: () => import('@/components/ui/RecordingPill/RecordingPill.library'),
  },
  {
    slug: 'scrollbar',
    name: 'Scrollbar',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/Scrollbar.mdx'),
    specimenPage: () => import('@/components/ui/Scrollbar/Scrollbar.library'),
  },
  {
    slug: 'search-input',
    name: 'Search Input',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/SearchInput.mdx'),
    specimenPage: () => import('@/components/ui/SearchInput/SearchInput.library'),
  },
  {
    slug: 'search-tip-banner',
    name: 'Search Tip Banner',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/SearchTipBanner.mdx'),
    specimenPage: () =>
      import('@/components/ui/SearchTipBanner/SearchTipBanner.library'),
  },
  {
    slug: 'section-notice',
    name: 'Section Notice',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/SectionNotice.mdx'),
    specimenPage: () => import('@/components/ui/SectionNotice/SectionNotice.library'),
  },
  {
    slug: 'select',
    name: 'Select',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/Select.mdx'),
    specimenPage: () => import('@/components/ui/Select/Select.library'),
  },
  {
    slug: 'spinner',
    name: 'Spinner',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/Spinner.mdx'),
    specimenPage: () => import('@/components/ui/Spinner/Spinner.library'),
  },
  {
    slug: 'status-badge',
    name: 'Status Badge',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/StatusBadge.mdx'),
    specimenPage: () => import('@/components/ui/StatusBadge/StatusBadge.library'),
  },
  {
    slug: 'switch',
    name: 'Switch',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/Switch.mdx'),
    specimenPage: () => import('@/components/ui/Switch/Switch.library'),
  },
  {
    slug: 'tabs',
    name: 'Tabs',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/Tabs.mdx'),
    specimenPage: () => import('@/components/ui/Tabs/Tabs.library'),
  },
  {
    slug: 'tags',
    name: 'Tags',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/Tags.mdx'),
    specimenPage: () => import('@/components/ui/Tags/Tags.library'),
  },
  {
    slug: 'team-avatar',
    name: 'Team Avatar',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/TeamAvatar.mdx'),
    specimenPage: () => import('@/components/ui/TeamAvatar/TeamAvatar.library'),
  },
  {
    slug: 'text-area',
    name: 'Text Area',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/TextArea.mdx'),
    specimenPage: () => import('@/components/ui/TextArea/TextArea.library'),
  },
  {
    slug: 'text-input',
    name: 'Text Input',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/TextInput.mdx'),
    specimenPage: () => import('@/components/ui/TextInput/TextInput.library'),
  },
  {
    slug: 'thread-footer',
    name: 'Thread Footer',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/ThreadFooter.mdx'),
    specimenPage: () => import('@/components/ui/ThreadFooter/ThreadFooter.library'),
  },
  {
    slug: 'thread-list-item',
    name: 'Thread List Item',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/ThreadListItem.mdx'),
    specimenPage: () =>
      import('@/components/ui/ThreadListItem/ThreadListItem.library'),
  },
  {
    slug: 'toast-banner',
    name: 'Toast Banner',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/ToastBanner.mdx'),
    specimenPage: () => import('@/components/ui/ToastBanner/ToastBanner.library'),
  },
  {
    slug: 'tooltip',
    name: 'Tooltip',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/Tooltip.mdx'),
    specimenPage: () => import('@/components/ui/Tooltip/Tooltip.library'),
  },
  {
    slug: 'unread-badge',
    name: 'Unread Badge',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/UnreadBadge.mdx'),
    specimenPage: () => import('@/components/ui/UnreadBadge/UnreadBadge.library'),
  },
  {
    slug: 'user-avatar',
    name: 'User Avatar',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/UserAvatar.mdx'),
    specimenPage: () => import('@/components/ui/UserAvatar/UserAvatar.library'),
  },
  {
    slug: 'user-avatar-group',
    name: 'User Avatar Group',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/UserAvatarGroup.mdx'),
    specimenPage: () =>
      import('@/components/ui/UserAvatarGroup/UserAvatarGroup.library'),
  },

  // ===========================================================================
  // Patterns
  // ===========================================================================
  {
    slug: 'modal',
    name: 'Modal',
    category: 'patterns',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/patterns/Modal.mdx'),
    specimenPage: () => import('@/components/ui/Modal/Modal.library'),
  },
  {
    slug: 'global-header',
    name: 'Global Header',
    category: 'patterns',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/patterns/GlobalHeader.mdx'),
    specimenPage: () => import('@/components/ui/GlobalHeader/GlobalHeader.library'),
  },
  {
    slug: 'channel-header',
    name: 'Channel Header',
    category: 'patterns',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/patterns/ChannelHeader.mdx'),
    specimenPage: () => import('@/components/ui/ChannelHeader/ChannelHeader.library'),
  },
  {
    slug: 'post',
    name: 'Post',
    category: 'patterns',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/patterns/Post.mdx'),
    specimenPage: () => import('@/components/ui/Post/Post.library'),
  },
  {
    slug: 'team-sidebar',
    name: 'Team Sidebar',
    category: 'patterns',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/patterns/TeamSidebar.mdx'),
    specimenPage: () => import('@/components/ui/TeamSidebar/TeamSidebar.library'),
  },
  {
    slug: 'channel-sidebar',
    name: 'Channel Sidebar',
    category: 'patterns',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/patterns/ChannelSidebar.mdx'),
    specimenPage: () =>
      import('@/components/ui/ChannelsSidebar/ChannelsSidebar.library'),
  },
  {
    slug: 'message-input',
    name: 'Message Input',
    category: 'patterns',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/patterns/MessageInput.mdx'),
    specimenPage: () => import('@/components/ui/MessageInput/MessageInput.library'),
  },
  {
    slug: 'call-widget',
    name: 'Call Widget',
    category: 'patterns',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/patterns/CallWidget.mdx'),
    specimenPage: () => import('@/components/ui/CallWidget/CallWidget.library'),
  },
  {
    slug: 'profile-popover',
    name: 'Profile Popover',
    category: 'patterns',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/patterns/ProfilePopover.mdx'),
    specimenPage: () => import('@/components/ui/ProfilePopover/ProfilePopover.library'),
  },
  {
    slug: 'right-sidebar',
    name: 'Right Sidebar',
    category: 'patterns',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/patterns/RightSidebar.mdx'),
    specimenPage: () => import('@/components/ui/RightSidebar/RightSidebar.library'),
  },

  // ===========================================================================
  // Layouts
  // ===========================================================================
  {
    slug: 'messaging',
    name: 'Messaging',
    category: 'layouts',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/layouts/Messaging.mdx'),
    specimenPage: () => import('@/pages/Layouts/Layouts'),
    fullBleedSpecimen: true,
  },
];

export function findTopic(
  category: TopicCategory,
  slug: string,
): Topic | undefined {
  return TOPICS.find((t) => t.category === category && t.slug === slug);
}

export function topicsByCategory(category: TopicCategory): Topic[] {
  return TOPICS.filter((t) => t.category === category);
}
