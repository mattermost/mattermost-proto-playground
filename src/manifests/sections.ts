import type { LibraryCategory } from './library';
import type { GuidelineCategory } from './guidelines';

/**
 * A sidebar section: a labelled group of nav items in display order.
 * Slugs reference entries in the library or guidelines manifest.
 */
export interface SectionGroup {
  /** Section heading, shown above the items. Empty string = no heading rendered. */
  label: string;
  /** Entry slugs in display order. */
  slugs: string[];
}

/**
 * Section groupings for the Library sidebar, keyed by category.
 * Categories without an entry render as a flat list in manifest order.
 */
export const librarySections: Partial<Record<LibraryCategory, SectionGroup[]>> = {
  components: [
    {
      label: 'Actions',
      slugs: ['action-button', 'button', 'icon-button'],
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
      label: 'Progress Indicators',
      slugs: ['pagination-dots', 'progress-bar', 'spinner'],
    },
    {
      label: 'Overlays and Layering',
      slugs: ['popover-notice', 'tooltip'],
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
      label: 'Cards and Previews',
      slugs: [
        'attachment-card',
        'feature-discovery-panel',
        'image-preview',
        'link-preview',
        'permalink-preview',
      ],
    },
    {
      label: 'Layout and Containers',
      slugs: ['divider', 'empty-state', 'scrollbar', 'tabs'],
    },
    {
      label: 'Feedback and Notices',
      slugs: ['error-message', 'section-notice'],
    },
    {
      label: 'Navigation',
      slugs: ['app-bar-item', 'menu-item'],
    },
    {
      label: 'Messaging',
      slugs: [
        'message-actions',
        'message-header',
        'message-reactions',
        'message-separator',
      ],
    },
    {
      label: 'Channel',
      slugs: ['channel-info-msg-header', 'channel-sidebar-item'],
    },
    {
      label: 'Threading',
      slugs: ['thread-footer', 'thread-list-item'],
    },
    {
      label: 'Calls',
      slugs: ['call-participant-avatar'],
    },
  ],
};

/**
 * Section groupings for the Guidelines sidebar, keyed by category.
 * Categories without an entry render as a flat list in manifest order.
 */
export const guidelineSections: Partial<Record<GuidelineCategory, SectionGroup[]>> = {
  foundations: [
    {
      label: 'Guidelines',
      slugs: [
        'writing-style',
        'usability-heuristics',
        'system-feedback',
        'accessibility-guidelines',
      ],
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
        'layout',
        'animation',
      ],
    },
  ],
};
