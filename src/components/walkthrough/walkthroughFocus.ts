export function readWalkthroughFocus(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return new URLSearchParams(window.location.search).get('focus');
}

export const WALKTHROUGH_FOCUS_LABELS: Record<string, string> = {
  'policy-table': 'Policy table — name and Applies to scope per row',
  'add-policy': 'Add policy opens the editor',
  'sidebar-nav': 'Membership Policies in the System Console sidebar',
  'sync-jobs': 'Membership sync jobs — evaluation history',
  'attr-table': 'Attributes that apply to Channels',
  'resource-filter': 'Resource filter — Channels selected',
  'classification-row': 'Classification — used in the hero clearance rule',
  'program-row': 'Program — used in channel-attribute scope rules',
  'editor-overview': 'Single-page editor: requirements + where it applies',
  'policy-name': 'Policy name — editable text field',
  requirements: 'Membership requirements section',
  'hero-row': 'User:Clearance is at least Channel:Classification',
  'value-picker': 'Value — a fixed Value or a type-compatible Channel attribute',
  'literal-row': 'Literal value — User:Clearance is at least Confidential',
  'test-users': 'Applies to N channels · X of Y members match requirements',
  'where-applies': 'Where this policy applies — Channels / Teams tabs',
  'scope-all': 'All channels where referenced attributes are set',
  'type-filter': 'Channel type filter — All / Public / Private',
  'scope-manual': 'Select channels manually',
  'channel-table': 'Manual channel table with Auto-add per row',
  'scope-rules': 'Channels matching attribute conditions',
  'teams-tab': 'Teams tab disabled — channel-attribute requirements need Channels scope',
  'timing-strip': 'How policies combine + when they take effect',
  'impact-gate': 'Impact gate — review before applying',
  'gate-removals': 'Private channel removals (destructive)',

  // Attribute Management (MVP/P0) walkthrough
  'catalog-search': 'Search attributes by name or type',
  'source-filter': 'Filter by source — Managed here vs. synced systems',
  'new-attribute-button': 'New attribute — starts the inline create flow',
  'row-menu-delete-blocked': 'Delete disabled — policy-bound or externally synced',
  'attr-display-name': 'Display name — what admins and users see',
  'attr-unique-name': 'Unique name — internal identifier for policies and integrations',
  'attr-type': 'Type — Select / Multiselect / Ranked / Text',
  'attr-values': 'Options — the value list this attribute offers',
  'add-resource-menu': 'Add resource — only offers resources not yet applied',
  'applies-empty': 'No resources yet — nothing to configure until one is added',
  'applies-users': 'Users card — profile display, value visibility, who can set',
  'applies-channels': 'Channels card — required, display location, who can set',
  'applies-posts': 'Posts card — required, display location, who can set',
  'users-profile-display': 'Profile display — Always / When set / Hidden',
  'users-value-visibility': 'Value visibility — show all values, or own values only',
  'users-who-can-set': 'Who can set — Member or System Administrator',
  'channels-required': 'Required — the channel cannot be saved without a value',
  'channels-default-value': 'Default value — required whenever Required is on',
  'channels-display-location':
    'Display location — Header / Sidebar (+ Banner for ranked types)',
  'channels-who-can-set': 'Who can set — Channel admin, extensible with other roles',
  'channels-remove-resource': 'Remove Channels — always confirms the impact first',
  'posts-required': 'Required — the post cannot be saved without a value',
  'posts-default-value': 'Default value — required whenever Required is on',
  'posts-display-location':
    'Display location — message input box / in-channel message view',
  'posts-who-can-set': 'Who can set — Post author, extensible with other roles',
  'posts-remove-resource': 'Remove Posts — always confirms the impact first',
  'self-edit-warning-dialog':
    'Self-edit warning — non-blocking, names the affected policies',
};

export interface WalkthroughAnnotation {
  title: string;
  points: string[];
}

/**
 * Optional anchored callout shown over the embedded prototype for a focus id.
 * Rendered next to the highlighted `[data-tour-focus]` element by
 * WalkthroughFocusProvider — used to explain a control in place, not just label it.
 */
export const WALKTHROUGH_FOCUS_ANNOTATIONS: Record<string, WalkthroughAnnotation> = {
  'value-picker': {
    title: 'How the value field is filtered',
    points: [
      'The user attribute on the left sets the type, and that decides what this field can offer.',
      'Two groups appear: Values (fixed) and Channel attributes (vary per channel).',
      'Only type-compatible options show here — never a flat list of every attribute.',
    ],
  },

  // Attribute Management (MVP/P0) walkthrough
  'users-who-can-set': {
    title: 'Why Member triggers a warning, not a block',
    points: [
      'Switching to Member only warns when the attribute is used by 1 or more access policies — an unused attribute switches instantly.',
      'This is a non-blocking warning: the admin can still confirm and proceed.',
      'Sync-owned Users bindings never show this control — they collapse to a locked "set by UAS / AD/LDAP / SAML" chip instead.',
    ],
  },
  'channels-default-value': {
    title: 'Required, Default value, and the zero-setters gap',
    points: [
      'Required + no default value already blocks Save today, with an inline error.',
      'Required + zero setters only shows a danger notice right now — it does not yet block Save. Spec intent is to close this gap and treat it the same as the missing-default case.',
      'Both checks exist for the same reason: a Required resource must always resolve to a real, assignable value.',
    ],
  },
};
