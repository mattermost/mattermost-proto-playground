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
        'toast-banner',
      ],
    },
    {
      label: 'Calls',
      slugs: ['call-participant-avatar'],
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
      slugs: ['error-message', 'section-notice'],
    },
    {
      label: 'Forms and Input',
      slugs: [
        'checkbox',
        'chip',
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
      label: 'Navigation',
      slugs: ['app-bar-item', 'channel-sidebar-item', 'menu-item'],
    },
    {
      label: 'Overlays and Layering',
      slugs: ['popover-notice', 'tooltip'],
    },
    {
      label: 'Progress Indicators',
      slugs: ['pagination-dots', 'progress-bar', 'spinner'],
    },
    {
      label: 'Status Indicators',
      slugs: [
        'label-tag',
        'mention-badge',
        'reaction-pill',
        'recording-pill',
        'status-badge',
        'tags',
        'unread-badge',
      ],
    },
    {
      label: 'System Console',
      slugs: [
        'console-sidebar',
        'console-sidebar-category',
        'console-sidebar-item',
        'console-header',
        'console-search',
        'console-page-header',
        'console-panel',
        'console-panel-header',
        'console-setting',
        'console-property-table',
        'console-property-row',
        'console-footer',
      ],
    },
  ],
  patterns: [
    {
      label: 'Admin Console',
      slugs: ['admin-panel', 'admin-console-sidebar'],
    },
  ],
};
