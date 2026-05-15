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
 *
 * Each topic owns a folder under `src/guidelines/<category>/<slug>/` with:
 *   - `<slug>.guideline.mdx`     — prose for the Guidelines tab
 *   - `<slug>.specimen.tsx`      — live demo for the Specimen tab (optional)
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
  /** Lazy import of the .specimen.tsx live demo. Omit for prose-only topics. */
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
    guidelinePage: () => import('@/guidelines/foundations/why-compass/why-compass.guideline.mdx'),
  },
  {
    slug: 'principles',
    name: 'Design Principles',
    category: 'foundations',
    description: 'Principles that guide every design decision.',
    guidelinePage: () => import('@/guidelines/foundations/principles/principles.guideline.mdx'),
  },
  {
    slug: 'system-hierarchy',
    name: 'System Hierarchy',
    category: 'foundations',
    description: 'How foundations, components, patterns, and layouts relate.',
    guidelinePage: () => import('@/guidelines/foundations/system-hierarchy/system-hierarchy.guideline.mdx'),
  },
  {
    slug: 'writing-style',
    name: 'Writing Style',
    category: 'foundations',
    description: 'Voice, tone, and language conventions across the product.',
    guidelinePage: () => import('@/guidelines/foundations/writing-style/writing-style.guideline.mdx'),
  },
  {
    slug: 'usability-heuristics',
    name: 'Usability Heuristics',
    category: 'foundations',
    description: 'The lens we use to evaluate design quality.',
    guidelinePage: () => import('@/guidelines/foundations/usability-heuristics/usability-heuristics.guideline.mdx'),
  },
  {
    slug: 'system-feedback',
    name: 'System Feedback',
    category: 'foundations',
    description:
      'How the system communicates back to the user — confirmation, errors, progress.',
    guidelinePage: () => import('@/guidelines/foundations/system-feedback/system-feedback.guideline.mdx'),
  },
  {
    slug: 'accessibility-guidelines',
    name: 'Accessibility Guidelines',
    category: 'foundations',
    description:
      'Standards every component must meet — contrast, keyboard, assistive tech.',
    guidelinePage: () => import('@/guidelines/foundations/accessibility-guidelines/accessibility-guidelines.guideline.mdx'),
  },
  {
    slug: 'color',
    name: 'Color',
    category: 'foundations',
    status: 'stable',
    description: 'Palette intent, semantic tokens, and contrast rules.',
    visual: { kind: 'swatches' },
    guidelinePage: () => import('@/guidelines/foundations/color/color.guideline.mdx'),
    specimenPage: () => import('@/guidelines/foundations/color/color.specimen'),
  },
  {
    slug: 'themes',
    name: 'Themes',
    category: 'foundations',
    status: 'stable',
    description:
      'How themes adapt color and authoring components that work across them.',
    visual: { kind: 'theme-split' },
    guidelinePage: () => import('@/guidelines/foundations/themes/themes.guideline.mdx'),
    specimenPage: () => import('@/guidelines/foundations/themes/themes.specimen'),
  },
  {
    slug: 'typography',
    name: 'Typography',
    category: 'foundations',
    status: 'stable',
    description: 'Type families, the scale, and weight conventions.',
    visual: { kind: 'type-specimen' },
    guidelinePage: () => import('@/guidelines/foundations/typography/typography.guideline.mdx'),
    specimenPage: () => import('@/guidelines/foundations/typography/typography.specimen'),
  },
  {
    slug: 'iconography',
    name: 'Iconography',
    category: 'foundations',
    description: 'When to use icons, sizing, and pairing with labels.',
    visual: { kind: 'icon-grid' },
    guidelinePage: () => import('@/guidelines/foundations/iconography/iconography.guideline.mdx'),
  },
  {
    slug: 'shape',
    name: 'Shape',
    category: 'foundations',
    status: 'stable',
    description: 'Corner radius scale and the role of shape in hierarchy.',
    visual: { kind: 'shape-stack' },
    guidelinePage: () => import('@/guidelines/foundations/shape/shape.guideline.mdx'),
    specimenPage: () => import('@/guidelines/foundations/shape/shape.specimen'),
  },
  {
    slug: 'elevation',
    name: 'Elevation',
    category: 'foundations',
    status: 'stable',
    description: 'The relative distance between objects along the z-axis.',
    visual: { kind: 'elevation-stack' },
    guidelinePage: () => import('@/guidelines/foundations/elevation/elevation.guideline.mdx'),
    specimenPage: () => import('@/guidelines/foundations/elevation/elevation.specimen'),
  },
  {
    slug: 'spacing',
    name: 'Spacing',
    category: 'foundations',
    status: 'stable',
    description: 'The base unit, spacing scale, and how padding flows from it.',
    visual: { kind: 'spacing-stack' },
    guidelinePage: () => import('@/guidelines/foundations/spacing/spacing.guideline.mdx'),
    specimenPage: () => import('@/guidelines/foundations/spacing/spacing.specimen'),
  },
  {
    slug: 'layout',
    name: 'Layout',
    category: 'foundations',
    description: 'Grids, breakpoints, panel offsets, and interaction targets.',
    visual: { kind: 'layout-grid' },
    guidelinePage: () => import('@/guidelines/foundations/layout/layout.guideline.mdx'),
  },
  {
    slug: 'animation',
    name: 'Animation',
    category: 'foundations',
    status: 'stable',
    description: 'Duration and easing tokens, and when to animate.',
    visual: { kind: 'motion' },
    guidelinePage: () => import('@/guidelines/foundations/animation/animation.guideline.mdx'),
    specimenPage: () => import('@/guidelines/foundations/animation/animation.specimen'),
  },

  // ===========================================================================
  // Components
  // ===========================================================================
  {
    slug: 'action-button',
    name: 'Action Button',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/action-button/action-button.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/action-button/action-button.specimen'),
  },
  {
    slug: 'app-bar-item',
    name: 'App Bar Item',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/app-bar-item/app-bar-item.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/app-bar-item/app-bar-item.specimen'),
  },
  {
    slug: 'attachment-card',
    name: 'Attachment Card',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/attachment-card/attachment-card.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/attachment-card/attachment-card.specimen'),
  },
  {
    slug: 'button',
    name: 'Button',
    category: 'components',
    status: 'stable',
    description:
      'Anatomy, sizes, emphasis, states, variations, and positioning for the button family.',
    guidelinePage: () => import('@/guidelines/components/button/button.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/button/button.specimen'),
  },
  {
    slug: 'call-participant-avatar',
    name: 'Call Participant Avatar',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/call-participant-avatar/call-participant-avatar.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/call-participant-avatar/call-participant-avatar.specimen'),
  },
  {
    slug: 'channel-info-msg-header',
    name: 'Channel Info Msg Header',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/channel-info-msg-header/channel-info-msg-header.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/channel-info-msg-header/channel-info-msg-header.specimen'),
  },
  {
    slug: 'channel-sidebar-item',
    name: 'Channel Sidebar Item',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/channel-sidebar-item/channel-sidebar-item.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/channel-sidebar-item/channel-sidebar-item.specimen'),
  },
  {
    slug: 'checkbox',
    name: 'Checkbox',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/checkbox/checkbox.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/checkbox/checkbox.specimen'),
  },
  {
    slug: 'chip',
    name: 'Chip',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/chip/chip.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/chip/chip.specimen'),
  },
  {
    slug: 'console-footer',
    name: 'Console Footer',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/console-footer/console-footer.guideline.mdx'),
  },
  {
    slug: 'console-header',
    name: 'Console Header',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/console-header/console-header.guideline.mdx'),
  },
  {
    slug: 'console-page-header',
    name: 'Console Page Header',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/console-page-header/console-page-header.guideline.mdx'),
  },
  {
    slug: 'console-panel',
    name: 'Console Panel',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/console-panel/console-panel.guideline.mdx'),
  },
  {
    slug: 'console-panel-header',
    name: 'Console Panel Header',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/console-panel-header/console-panel-header.guideline.mdx'),
  },
  {
    slug: 'console-property-row',
    name: 'Console Property Row',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/console-property-row/console-property-row.guideline.mdx'),
  },
  {
    slug: 'console-property-table',
    name: 'Console Property Table',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/console-property-table/console-property-table.guideline.mdx'),
  },
  {
    slug: 'console-search',
    name: 'Console Search',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/console-search/console-search.guideline.mdx'),
  },
  {
    slug: 'console-setting',
    name: 'Console Setting',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/console-setting/console-setting.guideline.mdx'),
  },
  {
    slug: 'console-sidebar',
    name: 'Console Sidebar',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/console-sidebar/console-sidebar.guideline.mdx'),
  },
  {
    slug: 'console-sidebar-category',
    name: 'Console Sidebar Category',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/console-sidebar-category/console-sidebar-category.guideline.mdx'),
  },
  {
    slug: 'console-sidebar-item',
    name: 'Console Sidebar Item',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/console-sidebar-item/console-sidebar-item.guideline.mdx'),
  },
  {
    slug: 'date-range-picker',
    name: 'Date & Range Picker',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/date-range-picker/date-range-picker.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/date-range-picker/date-range-picker.specimen'),
  },
  {
    slug: 'divider',
    name: 'Divider',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/divider/divider.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/divider/divider.specimen'),
  },
  {
    slug: 'dropdown',
    name: 'Dropdown',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/dropdown/dropdown.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/dropdown/dropdown.specimen'),
  },
  {
    slug: 'emoji',
    name: 'Emoji',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/emoji/emoji.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/emoji/emoji.specimen'),
  },
  {
    slug: 'empty-state',
    name: 'Empty State',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/empty-state/empty-state.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/empty-state/empty-state.specimen'),
  },
  {
    slug: 'error-message',
    name: 'Error Message',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/error-message/error-message.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/error-message/error-message.specimen'),
  },
  {
    slug: 'feature-discovery-panel',
    name: 'Feature Discovery Panel',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/feature-discovery-panel/feature-discovery-panel.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/feature-discovery-panel/feature-discovery-panel.specimen'),
  },
  {
    slug: 'global-banner',
    name: 'Global Banner',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/global-banner/global-banner.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/global-banner/global-banner.specimen'),
  },
  {
    slug: 'icon',
    name: 'Icon',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/icon/icon.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/icon/icon.specimen'),
  },
  {
    slug: 'icon-button',
    name: 'Icon Button',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/icon-button/icon-button.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/icon-button/icon-button.specimen'),
  },
  {
    slug: 'illustration',
    name: 'Illustration',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/illustration/illustration.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/illustration/illustration.specimen'),
  },
  {
    slug: 'image-preview',
    name: 'Image Preview',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/image-preview/image-preview.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/image-preview/image-preview.specimen'),
  },
  {
    slug: 'label-tag',
    name: 'Label Tag',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/label-tag/label-tag.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/label-tag/label-tag.specimen'),
  },
  {
    slug: 'link-preview',
    name: 'Link Preview',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/link-preview/link-preview.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/link-preview/link-preview.specimen'),
  },
  {
    slug: 'mention-badge',
    name: 'Mention Badge',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/mention-badge/mention-badge.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/mention-badge/mention-badge.specimen'),
  },
  {
    slug: 'menu-item',
    name: 'Menu Item',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/menu-item/menu-item.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/menu-item/menu-item.specimen'),
  },
  {
    slug: 'message-actions',
    name: 'Message Actions',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/message-actions/message-actions.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/message-actions/message-actions.specimen'),
  },
  {
    slug: 'message-header',
    name: 'Message Header',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/message-header/message-header.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/message-header/message-header.specimen'),
  },
  {
    slug: 'message-reactions',
    name: 'Message Reactions',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/message-reactions/message-reactions.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/message-reactions/message-reactions.specimen'),
  },
  {
    slug: 'message-separator',
    name: 'Message Separator',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/message-separator/message-separator.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/message-separator/message-separator.specimen'),
  },
  {
    slug: 'more-unreads-banner',
    name: 'More Unreads Banner',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/more-unreads-banner/more-unreads-banner.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/more-unreads-banner/more-unreads-banner.specimen'),
  },
  {
    slug: 'new-message-banner',
    name: 'New Message Banner',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/new-message-banner/new-message-banner.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/new-message-banner/new-message-banner.specimen'),
  },
  {
    slug: 'pagination-dots',
    name: 'Pagination Dots',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/pagination-dots/pagination-dots.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/pagination-dots/pagination-dots.specimen'),
  },
  {
    slug: 'permalink-preview',
    name: 'Permalink Preview',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/permalink-preview/permalink-preview.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/permalink-preview/permalink-preview.specimen'),
  },
  {
    slug: 'popover-notice',
    name: 'Popover Notice',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/popover-notice/popover-notice.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/popover-notice/popover-notice.specimen'),
  },
  {
    slug: 'progress-bar',
    name: 'Progress Bar',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/progress-bar/progress-bar.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/progress-bar/progress-bar.specimen'),
  },
  {
    slug: 'radio',
    name: 'Radio',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/radio/radio.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/radio/radio.specimen'),
  },
  {
    slug: 'reaction-pill',
    name: 'Reaction Pill',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/reaction-pill/reaction-pill.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/reaction-pill/reaction-pill.specimen'),
  },
  {
    slug: 'recording-pill',
    name: 'Recording Pill',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/recording-pill/recording-pill.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/recording-pill/recording-pill.specimen'),
  },
  {
    slug: 'scrollbar',
    name: 'Scrollbar',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/scrollbar/scrollbar.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/scrollbar/scrollbar.specimen'),
  },
  {
    slug: 'search-input',
    name: 'Search Input',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/search-input/search-input.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/search-input/search-input.specimen'),
  },
  {
    slug: 'search-tip-banner',
    name: 'Search Tip Banner',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/search-tip-banner/search-tip-banner.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/search-tip-banner/search-tip-banner.specimen'),
  },
  {
    slug: 'section-notice',
    name: 'Section Notice',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/section-notice/section-notice.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/section-notice/section-notice.specimen'),
  },
  {
    slug: 'select',
    name: 'Select',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/select/select.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/select/select.specimen'),
  },
  {
    slug: 'spinner',
    name: 'Spinner',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/spinner/spinner.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/spinner/spinner.specimen'),
  },
  {
    slug: 'status-badge',
    name: 'Status Badge',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/status-badge/status-badge.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/status-badge/status-badge.specimen'),
  },
  {
    slug: 'switch',
    name: 'Switch',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/switch/switch.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/switch/switch.specimen'),
  },
  {
    slug: 'tabs',
    name: 'Tabs',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/tabs/tabs.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/tabs/tabs.specimen'),
  },
  {
    slug: 'tags',
    name: 'Tags',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/tags/tags.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/tags/tags.specimen'),
  },
  {
    slug: 'team-avatar',
    name: 'Team Avatar',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/team-avatar/team-avatar.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/team-avatar/team-avatar.specimen'),
  },
  {
    slug: 'text-area',
    name: 'Text Area',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/text-area/text-area.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/text-area/text-area.specimen'),
  },
  {
    slug: 'text-input',
    name: 'Text Input',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/text-input/text-input.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/text-input/text-input.specimen'),
  },
  {
    slug: 'thread-footer',
    name: 'Thread Footer',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/thread-footer/thread-footer.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/thread-footer/thread-footer.specimen'),
  },
  {
    slug: 'thread-list-item',
    name: 'Thread List Item',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/thread-list-item/thread-list-item.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/thread-list-item/thread-list-item.specimen'),
  },
  {
    slug: 'toast-banner',
    name: 'Toast Banner',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/toast-banner/toast-banner.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/toast-banner/toast-banner.specimen'),
  },
  {
    slug: 'tooltip',
    name: 'Tooltip',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/tooltip/tooltip.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/tooltip/tooltip.specimen'),
  },
  {
    slug: 'unread-badge',
    name: 'Unread Badge',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/unread-badge/unread-badge.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/unread-badge/unread-badge.specimen'),
  },
  {
    slug: 'user-avatar',
    name: 'User Avatar',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/user-avatar/user-avatar.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/user-avatar/user-avatar.specimen'),
  },
  {
    slug: 'user-avatar-group',
    name: 'User Avatar Group',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/user-avatar-group/user-avatar-group.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/user-avatar-group/user-avatar-group.specimen'),
  },

  // ===========================================================================
  // Patterns
  // ===========================================================================
  {
    slug: 'modal',
    name: 'Modal',
    category: 'patterns',
    description:
      'Displays content that requires user interaction in a layer on top of the page.',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/patterns/modal/modal.guideline.mdx'),
    specimenPage: () => import('@/guidelines/patterns/modal/modal.specimen'),
  },
  {
    slug: 'popover-menu',
    name: 'Popover Menu',
    category: 'patterns',
    description:
      'Multiple choices in an elevated overlay, opened from a trigger control.',
    status: 'stable',
    guidelinePage: () =>
      import('@/guidelines/patterns/popover-menu/popover-menu.guideline.mdx'),
    specimenPage: () =>
      import('@/guidelines/patterns/popover-menu/popover-menu.specimen'),
  },
  {
    slug: 'global-header',
    name: 'Global Header',
    category: 'patterns',
    description:
      'Full-width top bar for product switching, navigation history, search, and session controls.',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/patterns/global-header/global-header.guideline.mdx'),
    specimenPage: () => import('@/guidelines/patterns/global-header/global-header.specimen'),
  },
  {
    slug: 'channel-header',
    name: 'Channel Header',
    category: 'patterns',
    description:
      'The header above the main channel content area displaying channel identity, membership and actions',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/patterns/channel-header/channel-header.guideline.mdx'),
    specimenPage: () => import('@/guidelines/patterns/channel-header/channel-header.specimen'),
  },
  {
    slug: 'message',
    name: 'Message',
    category: 'patterns',
    description:
      'User, bot, and integration messages with formatted text, link previews, images, and file attachments.',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/patterns/message/message.guideline.mdx'),
    specimenPage: () => import('@/guidelines/patterns/message/message.specimen'),
  },
  {
    slug: 'team-sidebar',
    name: 'Team Sidebar',
    category: 'patterns',
    description:
      'Leftmost strip for switching teams when a server has more than one team.',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/patterns/team-sidebar/team-sidebar.guideline.mdx'),
    specimenPage: () => import('@/guidelines/patterns/team-sidebar/team-sidebar.specimen'),
  },
  {
    slug: 'channel-sidebar',
    name: 'Channel Sidebar',
    category: 'patterns',
    description:
      'Primary navigation for the active team: channels and direct messages grouped in categories.',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/patterns/channel-sidebar/channel-sidebar.guideline.mdx'),
    specimenPage: () => import('@/guidelines/patterns/channel-sidebar/channel-sidebar.specimen'),
  },
  {
    slug: 'message-input',
    name: 'Message Input',
    category: 'patterns',
    description:
      'Composer for drafting messages: text area, formatting bar, attachments, emoji, and send.',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/patterns/message-input/message-input.guideline.mdx'),
    specimenPage: () => import('@/guidelines/patterns/message-input/message-input.specimen'),
  },
  {
    slug: 'call-widget',
    name: 'Call Widget',
    category: 'patterns',
    description:
      'Floating active-call controls: speaker, timer, participants, mute, share, menu, and leave.',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/patterns/call-widget/call-widget.guideline.mdx'),
    specimenPage: () => import('@/guidelines/patterns/call-widget/call-widget.specimen'),
  },
  {
    slug: 'profile-popover',
    name: 'Profile Popover',
    category: 'patterns',
    status: 'stable',
    description:
      'User profile summary and quick actions when opening a profile from a username or avatar.',
    guidelinePage: () => import('@/guidelines/patterns/profile-popover/profile-popover.guideline.mdx'),
    specimenPage: () => import('@/guidelines/patterns/profile-popover/profile-popover.specimen'),
  },
  {
    slug: 'right-sidebar',
    name: 'Right Sidebar',
    category: 'patterns',
    description:
      'Secondary column for threads, channel info, search, and tools beside the center channel.',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/patterns/right-sidebar/right-sidebar.guideline.mdx'),
    specimenPage: () => import('@/guidelines/patterns/right-sidebar/right-sidebar.specimen'),
  },

  // ===========================================================================
  // Layouts
  // ===========================================================================
  {
    slug: 'messaging',
    name: 'Messaging',
    category: 'layouts',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/layouts/messaging/messaging.guideline.mdx'),
    specimenPage: () => import('@/guidelines/layouts/messaging/messaging.specimen'),
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
