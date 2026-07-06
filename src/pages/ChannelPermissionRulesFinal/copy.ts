// Locked direction: noun = "rule". The word "policy" only ever appears as a
// read-only PARENT label referring to system-scoped policies (the ceiling),
// never as the unit the channel author edits.

export const COPY = {
  h1: 'Channel permission rules',
  // Restriction-honest framing (resolves the grant-vs-restrict contradiction).
  framing:
    'Rules limit who can upload or download files here. Once an action has a rule, only people who match a rule can do it — within the limits your system and team set.',
  addCta: 'Add rule',
  newHeader: 'Add permission rule',
  editHeader: 'Edit permission rule',
  backToRules: 'Back to rules',
  saveCta: 'Save rule',
  nameLabel: 'Rule name',
  nameHelp: 'Give this rule a name to identify it in the list.',
  roleLabel: 'Role',
  empty:
    'No permission rules yet. Access here follows your system and team policies. Add a rule to limit access further in this channel.',
  conditionsLabel: 'Conditions',
  conditionsHelp: 'Users with these attributes can use the permissions below in this channel.',
  permissionsLabel: 'Permissions',
  permissionsHelp:
    'Actions this rule grants when a user matches it. Only actions your system policies also allow will take effect.',
  addCondition: 'Add condition',
  simulate: 'Simulate access',
  // Match mode (default All; "Any" lives behind Advanced)
  matchModeLabel: 'Match mode',
  matchAll: 'All conditions must match',
  matchAny: 'Any condition can match',
  matchAdvanced: 'Match options',
  matchAnyTooltip:
    'Most rules need every condition to match. Use “any” only when you intentionally want a broader match.',
} as const;

// The single canonical statement of how access is decided — identical wording
// to the System Console notice (the two-axis model lives in one place).
export const HOW_IT_WORKS = {
  collapsedLead: 'How access is decided',
  collapsedSummary:
    'Rules can only narrow what system policies allow · a user needs to match a rule for each action.',
  expand: 'Learn how',
  axes: [
    {
      n: '1',
      title: 'Rules decide; the role default is the fallback',
      body: 'When a user matches a rule, that rule decides. If no rule applies to an action, the channel’s role defaults apply.',
    },
    {
      n: '2',
      title: 'You can only narrow, never expand',
      body: 'System and team policies set the maximum access. Your channel rules tighten further — they can’t grant access the layers above you don’t allow.',
    },
  ],
  // The three levels of combination, in plain language (no AND/OR jargon).
  levels: [
    {
      title: 'Within one rule',
      body: 'All of its conditions must match (or any, if you change Match mode).',
    },
    {
      title: 'Across your rules, per action',
      body: 'A user is allowed if they match at least one rule for that action. Adding another rule widens who qualifies — it never takes access away.',
    },
    {
      title: 'Across system, team, and channel',
      body: 'Every level must allow it. If any level doesn’t grant it, access is blocked.',
    },
  ],
} as const;

export const CEILING = {
  title: 'System and team policies still apply',
  body: 'These set the maximum access in this channel. Your rules can narrow them, never expand them.',
  appliedLabel: 'Applied system policies',
} as const;
