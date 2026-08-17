import type { TopicCategory } from './topics';

/**
 * A sidebar section: a labelled group of nav items in display order.
 * Slugs reference entries in the topics manifest.
 */
export interface SectionGroup {
  /** Section heading, shown above the items. Empty string = no heading rendered. */
  label: string;
  /** Entry slugs in display order. */
  slugs: string[];
}

/**
 * Section groupings for the topic sidebar, keyed by category. Categories
 * without an entry render as a flat list in manifest order.
 *
 * Foundations leads with an "Overview" group (Why Compass, Principles,
 * System Hierarchy) above Style and Guidelines. Components is grouped by
 * role (Actions, Forms and Input, etc.).
 */
export const topicSections: Partial<Record<TopicCategory, SectionGroup[]>> = {
  foundations: [
    {
      label: 'Overview',
      slugs: ['why-compass', 'principles', 'system-hierarchy'],
    },
    {
      label: 'Style',
      slugs: [
        'color',
        'themes',
        'typography',
        'iconography',
        'shape',
        'elevation',
        'spacing',
        'layout',
        'animation',
      ],
    },
    {
      label: 'Guidelines',
      slugs: [
        'writing-style',
        'usability-heuristics',
        'system-feedback',
        'accessibility-guidelines',
      ],
    },
  ],
  components: [
    {
      label: 'Actions',
      slugs: ['action-button', 'button', 'icon-button'],
    },
    {
      label: 'Banners',
      slugs: [
        'global-banner',
        'more-unreads-banner',
        'new-message-banner',
        'search-tip-banner',
      ],
    },
    {
      label: 'Calls',
      slugs: [
        'call-participant-avatar',
        'reaction-pill',
        'recording-pill',
      ],
    },
    {
      label: 'Admin Console',
      slugs: [
        'admin-console-header',
        'admin-panel-header',
        'admin-panel-footer',
        'feature-discovery-panel',
      ],
    },
    {
      label: 'Cards and Previews',
      slugs: [
        'attachment-card',
        'image-preview',
        'link-preview',
        'permalink-preview',
      ],
    },
    {
      label: 'Feedback and Notices',
      slugs: [
        'error-message',
        'popover-notice',
        'section-notice',
        'toast',
        'tooltip',
      ],
    },
    {
      label: 'Forms and Input',
      slugs: [
        'checkbox',
        'chip',
        'combobox',
        'date-range-picker',
        'dropdown',
        'radio',
        'search-input',
        'select',
        'switch',
        'text-area',
        'text-input',
      ],
    },
    {
      label: 'Images and Icons',
      slugs: [
        'emoji',
        'icon',
        'illustration',
        'team-avatar',
        'user-avatar',
        'user-avatar-group',
      ],
    },
    {
      label: 'Layout and Containers',
      slugs: ['divider', 'empty-state', 'scrollbar', 'tabs'],
    },
    {
      label: 'Messaging',
      slugs: [
        'channel-info-msg-header',
        'message-actions',
        'message-header',
        'message-reactions',
        'message-separator',
        'thread-footer',
        'thread-list-item',
      ],
    },
    {
      label: 'Mobile',
      slugs: [
        'mobile-channel-sidebar-item',
        'mobile-menu-item',
        'mobile-search-field',
      ],
    },
    {
      label: 'Navigation',
      slugs: ['app-bar-item', 'channel-sidebar-item', 'menu-item'],
    },
    {
      label: 'Progress Indicators',
      slugs: ['pagination-dots', 'progress-bar', 'spinner'],
    },
    {
      label: 'Status Indicators',
      slugs: ['tag', 'mention-badge', 'status-badge', 'unread-badge'],
    },
  ],
  patterns: [
    {
      label: 'Admin Console',
      slugs: ['admin-panel', 'admin-console-sidebar'],
    },
    {
      label: 'Mobile',
      slugs: [
        'mobile-navigation-bar',
        'mobile-modal-navigation-bar',
        'mobile-modal',
        'mobile-team-sidebar',
        'mobile-channel-sidebar',
        'mobile-tab-bar',
        'mobile-message',
        'mobile-message-input',
        'mobile-bottom-sheet',
      ],
    },
    {
      label: 'Onboarding',
      slugs: ['tour-point'],
    },
  ],
  layouts: [
    {
      label: 'Mobile',
      slugs: [
        'mobile-home',
        'mobile-search',
        'mobile-mentions',
        'mobile-saved',
        'mobile-profile',
        'mobile-channel',
        'mobile-modal',
      ],
    },
    {
      label: 'Webapp',
      slugs: [
        'channel',
        'channel-thread',
        'channel-info',
        'modal',
        'threads-view',
        'call-widget',
        'call-popout',
        'admin-console',
      ],
    },
  ],
};
