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
};
