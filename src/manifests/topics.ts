import type { ComponentType } from 'react';

export type TopicCategory =
  | 'foundations'
  | 'components'
  | 'patterns'
  | 'layouts';

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
    status: 'stable',
    description: 'When to use icons, styles, and pairing with labels.',
    visual: { kind: 'icon-grid' },
    guidelinePage: () => import('@/guidelines/foundations/iconography/iconography.guideline.mdx'),
    specimenPage: () => import('@/guidelines/foundations/iconography/iconography.specimen'),
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
    slug: 'admin-console-header',
    name: 'Admin Console Header',
    category: 'components',
    description:
      'System Console page stripe: title, optional edition tag, optional back control.',
    status: 'stable',
    guidelinePage: () =>
      import('@/guidelines/components/admin-console-header/admin-console-header.guideline.mdx'),
    specimenPage: () =>
      import('@/guidelines/components/admin-console-header/admin-console-header.specimen'),
  },
  {
    slug: 'admin-panel-header',
    name: 'Admin Panel Header',
    category: 'components',
    description:
      'System Console section rail: title, optional tags and subtitle, optional icon, trailing controls.',
    status: 'stable',
    guidelinePage: () =>
      import('@/guidelines/components/admin-panel-header/admin-panel-header.guideline.mdx'),
    specimenPage: () =>
      import('@/guidelines/components/admin-panel-header/admin-panel-header.specimen'),
  },
  {
    slug: 'admin-panel-footer',
    name: 'Admin Panel Footer',
    category: 'components',
    description:
      'System Console content footer: Save and Cancel with optional validation summary.',
    status: 'stable',
    guidelinePage: () =>
      import('@/guidelines/components/admin-panel-footer/admin-panel-footer.guideline.mdx'),
    specimenPage: () =>
      import('@/guidelines/components/admin-panel-footer/admin-panel-footer.specimen'),
  },
  {
    slug: 'feature-discovery-panel',
    name: 'Feature Discovery Panel',
    category: 'components',
    status: 'stable',
    guidelinePage: () =>
      import('@/guidelines/components/feature-discovery-panel/feature-discovery-panel.guideline.mdx'),
    specimenPage: () =>
      import('@/guidelines/components/feature-discovery-panel/feature-discovery-panel.specimen'),
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
    slug: 'mobile-channel-sidebar-item',
    name: 'Mobile Channel Sidebar Item',
    category: 'components',
    description:
      'Touch-sized channel row for mobile sidebars — Body 200, no hover menu.',
    status: 'beta',
    guidelinePage: () =>
      import(
        '@/guidelines/components/mobile-channel-sidebar-item/mobile-channel-sidebar-item.guideline.mdx'
      ),
    specimenPage: () =>
      import(
        '@/guidelines/components/mobile-channel-sidebar-item/mobile-channel-sidebar-item.specimen'
      ),
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
    slug: 'combobox',
    name: 'Combobox',
    category: 'components',
    status: 'stable',
    guidelinePage: () =>
      import('@/guidelines/components/combobox/combobox.guideline.mdx'),
    specimenPage: () =>
      import('@/guidelines/components/combobox/combobox.specimen'),
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
    slug: 'tag',
    name: 'Tag',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/tag/tag.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/tag/tag.specimen'),
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
    slug: 'mobile-menu-item',
    name: 'Mobile Menu Item',
    category: 'components',
    description:
      'Touch-sized menu row for iOS sheets and action lists — Body 200, no hover.',
    status: 'beta',
    guidelinePage: () =>
      import('@/guidelines/components/mobile-menu-item/mobile-menu-item.guideline.mdx'),
    specimenPage: () =>
      import('@/guidelines/components/mobile-menu-item/mobile-menu-item.specimen'),
  },
  {
    slug: 'mobile-search-field',
    name: 'Mobile Search Field',
    category: 'components',
    description:
      'Sidebar-styled search control for phones — magnifier and input on translucent sidebar fill.',
    status: 'beta',
    guidelinePage: () =>
      import(
        '@/guidelines/components/mobile-search-field/mobile-search-field.guideline.mdx'
      ),
    specimenPage: () =>
      import(
        '@/guidelines/components/mobile-search-field/mobile-search-field.specimen'
      ),
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
    slug: 'toast',
    name: 'Toast',
    category: 'components',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/components/toast/toast.guideline.mdx'),
    specimenPage: () => import('@/guidelines/components/toast/toast.specimen'),
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
  // Patterns (sidebar order: alphabetical by display name)
  // ===========================================================================
  {
    slug: 'admin-panel',
    name: 'Admin Panel',
    category: 'patterns',
    description:
      'Bordered settings sheet: panel header and body for grouped System Console fields.',
    status: 'stable',
    guidelinePage: () =>
      import('@/guidelines/patterns/admin-panel/admin-panel.guideline.mdx'),
    specimenPage: () =>
      import('@/guidelines/patterns/admin-panel/admin-panel.specimen'),
  },
  {
    slug: 'admin-console-sidebar',
    name: 'Admin Console Sidebar',
    category: 'patterns',
    description:
      'System Console navigation: identity, find settings, grouped admin pages on a dark sidebar.',
    status: 'stable',
    guidelinePage: () =>
      import('@/guidelines/patterns/admin-console-sidebar/admin-console-sidebar.guideline.mdx'),
    specimenPage: () =>
      import('@/guidelines/patterns/admin-console-sidebar/admin-console-sidebar.specimen'),
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
    slug: 'mobile-navigation-bar',
    name: 'Mobile Navigation Bar',
    category: 'patterns',
    description:
      'iOS conversation top bar for Channel, DM, GM, and Bot with back, title, search, and more.',
    status: 'beta',
    guidelinePage: () =>
      import('@/guidelines/patterns/mobile-navigation-bar/mobile-navigation-bar.guideline.mdx'),
    specimenPage: () =>
      import('@/guidelines/patterns/mobile-navigation-bar/mobile-navigation-bar.specimen'),
  },
  {
    slug: 'mobile-modal-navigation-bar',
    name: 'Mobile Modal Navigation Bar',
    category: 'patterns',
    description:
      'iOS modal top bar with Parent close or Child back, title, optional subtitle, and trailing actions.',
    status: 'beta',
    guidelinePage: () =>
      import(
        '@/guidelines/patterns/mobile-modal-navigation-bar/mobile-modal-navigation-bar.guideline.mdx'
      ),
    specimenPage: () =>
      import(
        '@/guidelines/patterns/mobile-modal-navigation-bar/mobile-modal-navigation-bar.specimen'
      ),
  },
  {
    slug: 'mobile-modal',
    name: 'Mobile Modal',
    category: 'patterns',
    description:
      'Nearly full-height iOS modal sheet with Modal Top Nav Bar and a scrollable content slot.',
    status: 'beta',
    guidelinePage: () =>
      import('@/guidelines/patterns/mobile-modal/mobile-modal.guideline.mdx'),
    specimenPage: () =>
      import('@/guidelines/patterns/mobile-modal/mobile-modal.specimen'),
  },
  {
    slug: 'mobile-team-sidebar',
    name: 'Mobile Team Sidebar',
    category: 'patterns',
    description:
      '72px mobile team strip with servers control, team avatars, and Add team.',
    status: 'beta',
    guidelinePage: () =>
      import('@/guidelines/patterns/mobile-team-sidebar/mobile-team-sidebar.guideline.mdx'),
    specimenPage: () =>
      import('@/guidelines/patterns/mobile-team-sidebar/mobile-team-sidebar.specimen'),
  },
  {
    slug: 'mobile-channel-sidebar',
    name: 'Mobile Channel Sidebar',
    category: 'patterns',
    description:
      'Mobile team channel list with Find channels, categories, and touch-sized rows.',
    status: 'beta',
    guidelinePage: () =>
      import(
        '@/guidelines/patterns/mobile-channel-sidebar/mobile-channel-sidebar.guideline.mdx'
      ),
    specimenPage: () =>
      import(
        '@/guidelines/patterns/mobile-channel-sidebar/mobile-channel-sidebar.specimen'
      ),
  },
  {
    slug: 'mobile-tab-bar',
    name: 'Mobile Tab Bar',
    category: 'patterns',
    description:
      'iOS bottom tab bar for Home, Search, Mentions, Saved, and Profile.',
    status: 'beta',
    guidelinePage: () =>
      import('@/guidelines/patterns/mobile-tab-bar/mobile-tab-bar.guideline.mdx'),
    specimenPage: () =>
      import('@/guidelines/patterns/mobile-tab-bar/mobile-tab-bar.specimen'),
  },
  {
    slug: 'mobile-message-input',
    name: 'Mobile Message Input',
    category: 'patterns',
    description:
      'iOS channel and reply composer with focus, expand, send, and attachment thumbnails.',
    status: 'beta',
    guidelinePage: () =>
      import('@/guidelines/patterns/mobile-message-input/mobile-message-input.guideline.mdx'),
    specimenPage: () =>
      import('@/guidelines/patterns/mobile-message-input/mobile-message-input.specimen'),
  },
  {
    slug: 'mobile-bottom-sheet',
    name: 'Mobile Bottom Sheet',
    category: 'patterns',
    description:
      'iOS sheet shell with handle, optional header and footer, and a body slot for menu rows.',
    status: 'beta',
    guidelinePage: () =>
      import('@/guidelines/patterns/mobile-bottom-sheet/mobile-bottom-sheet.guideline.mdx'),
    specimenPage: () =>
      import('@/guidelines/patterns/mobile-bottom-sheet/mobile-bottom-sheet.specimen'),
  },
  {
    slug: 'mobile-message',
    name: 'Mobile Message',
    category: 'patterns',
    description:
      'iOS channel post with Body 200 text — no hover tint or hover message actions.',
    status: 'beta',
    guidelinePage: () =>
      import('@/guidelines/patterns/mobile-message/mobile-message.guideline.mdx'),
    specimenPage: () =>
      import('@/guidelines/patterns/mobile-message/mobile-message.specimen'),
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
    slug: 'tour-point',
    name: 'Tour Point',
    category: 'patterns',
    description:
      'Instructional callout with directional pointer, optional media, and tour navigation for guided onboarding.',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/patterns/tour-point/tour-point.guideline.mdx'),
    specimenPage: () => import('@/guidelines/patterns/tour-point/tour-point.specimen'),
  },

  // ===========================================================================
  // Layouts
  // ===========================================================================
  {
    slug: 'channel',
    name: 'Channel',
    category: 'layouts',
    status: 'stable',
    guidelinePage: () => import('@/guidelines/layouts/channel/channel.guideline.mdx'),
    specimenPage: () => import('@/guidelines/layouts/channel/channel.specimen'),
    fullBleedSpecimen: true,
  },
  {
    slug: 'channel-thread',
    name: 'Channel (thread)',
    category: 'layouts',
    status: 'stable',
    description:
      'Full channel shell with the right sidebar showing an open thread and reply composer.',
    guidelinePage: () =>
      import('@/guidelines/layouts/channel-thread/channel-thread.guideline.mdx'),
    specimenPage: () =>
      import('@/guidelines/layouts/channel-thread/channel-thread.specimen'),
    fullBleedSpecimen: true,
  },
  {
    slug: 'channel-info',
    name: 'Channel (channel info)',
    category: 'layouts',
    status: 'stable',
    description:
      'Full channel shell with the right sidebar showing open channel info.',
    guidelinePage: () =>
      import('@/guidelines/layouts/channel-info/channel-info.guideline.mdx'),
    specimenPage: () =>
      import('@/guidelines/layouts/channel-info/channel-info.specimen'),
    fullBleedSpecimen: true,
  },
  {
    slug: 'modal',
    name: 'Modal',
    category: 'layouts',
    status: 'stable',
    description:
      'Channel shell with a modal above a 50% black backdrop over the channel.',
    guidelinePage: () => import('@/guidelines/layouts/modal/modal.guideline.mdx'),
    specimenPage: () => import('@/guidelines/layouts/modal/modal.specimen'),
    fullBleedSpecimen: true,
  },
  {
    slug: 'threads-view',
    name: 'Threads View',
    category: 'layouts',
    status: 'stable',
    description:
      'Channels shell with the thread inbox, a scrollable list of threads, and the thread right sidebar open.',
    guidelinePage: () =>
      import('@/guidelines/layouts/threads-view/threads-view.guideline.mdx'),
    specimenPage: () =>
      import('@/guidelines/layouts/threads-view/threads-view.specimen'),
    fullBleedSpecimen: true,
  },
  {
    slug: 'call-widget',
    name: 'Call (widget)',
    category: 'layouts',
    status: 'stable',
    description:
      'Channel shell with an active call shown as the in-channel floating widget.',
    guidelinePage: () =>
      import('@/guidelines/layouts/call-widget/call-widget.guideline.mdx'),
    specimenPage: () =>
      import('@/guidelines/layouts/call-widget/call-widget.specimen'),
    fullBleedSpecimen: true,
  },
  {
    slug: 'call-popout',
    name: 'Call (popout)',
    category: 'layouts',
    status: 'stable',
    description:
      'Windowed call popout only; specimen wrapper has no visible frame (no channel shell).',
    guidelinePage: () =>
      import('@/guidelines/layouts/call-popout/call-popout.guideline.mdx'),
    specimenPage: () =>
      import('@/guidelines/layouts/call-popout/call-popout.specimen'),
    fullBleedSpecimen: true,
  },
  {
    slug: 'admin-console',
    name: 'Admin Console',
    category: 'layouts',
    status: 'stable',
    description:
      'System Console shell with sidebar navigation, page header, settings panels, and save footer.',
    guidelinePage: () =>
      import('@/guidelines/layouts/admin-console/admin-console.guideline.mdx'),
    specimenPage: () =>
      import('@/guidelines/layouts/admin-console/admin-console.specimen'),
    fullBleedSpecimen: true,
  },
  {
    slug: 'mobile-home',
    name: 'Mobile Home',
    category: 'layouts',
    status: 'beta',
    description:
      'iPhone home screen with team strip, channel list, and bottom tab bar.',
    guidelinePage: () =>
      import('@/guidelines/layouts/mobile-home/mobile-home.guideline.mdx'),
    specimenPage: () =>
      import('@/guidelines/layouts/mobile-home/mobile-home.specimen'),
    fullBleedSpecimen: true,
  },
  {
    slug: 'mobile-search',
    name: 'Mobile Search',
    category: 'layouts',
    status: 'beta',
    description:
      'iPhone Search tab with large title, sidebar search field, and content sheet.',
    guidelinePage: () =>
      import('@/guidelines/layouts/mobile-search/mobile-search.guideline.mdx'),
    specimenPage: () =>
      import('@/guidelines/layouts/mobile-search/mobile-search.specimen'),
    fullBleedSpecimen: true,
  },
  {
    slug: 'mobile-mentions',
    name: 'Mobile Mentions',
    category: 'layouts',
    status: 'beta',
    description:
      'iPhone Mentions tab with recent-mentions header and content sheet.',
    guidelinePage: () =>
      import(
        '@/guidelines/layouts/mobile-mentions/mobile-mentions.guideline.mdx'
      ),
    specimenPage: () =>
      import('@/guidelines/layouts/mobile-mentions/mobile-mentions.specimen'),
    fullBleedSpecimen: true,
  },
  {
    slug: 'mobile-saved',
    name: 'Mobile Saved',
    category: 'layouts',
    status: 'beta',
    description:
      'iPhone Saved tab with saved-messages header and content sheet.',
    guidelinePage: () =>
      import('@/guidelines/layouts/mobile-saved/mobile-saved.guideline.mdx'),
    specimenPage: () =>
      import('@/guidelines/layouts/mobile-saved/mobile-saved.specimen'),
    fullBleedSpecimen: true,
  },
  {
    slug: 'mobile-profile',
    name: 'Mobile Profile',
    category: 'layouts',
    status: 'beta',
    description:
      'iPhone Profile tab with avatar header and settings content sheet.',
    guidelinePage: () =>
      import('@/guidelines/layouts/mobile-profile/mobile-profile.guideline.mdx'),
    specimenPage: () =>
      import('@/guidelines/layouts/mobile-profile/mobile-profile.specimen'),
    fullBleedSpecimen: true,
  },
  {
    slug: 'mobile-channel',
    name: 'Mobile Channel',
    category: 'layouts',
    status: 'beta',
    description:
      'iPhone channel view with navigation bar, post stream, and message composer.',
    guidelinePage: () =>
      import('@/guidelines/layouts/mobile-channel/mobile-channel.guideline.mdx'),
    specimenPage: () =>
      import('@/guidelines/layouts/mobile-channel/mobile-channel.specimen'),
    fullBleedSpecimen: true,
  },
  {
    slug: 'mobile-modal',
    name: 'Mobile Modal',
    category: 'layouts',
    status: 'beta',
    description:
      'iPhone nearly full-height modal sheet over a scaled previous-view peek.',
    guidelinePage: () =>
      import('@/guidelines/layouts/mobile-modal/mobile-modal.guideline.mdx'),
    specimenPage: () =>
      import('@/guidelines/layouts/mobile-modal/mobile-modal.specimen'),
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
