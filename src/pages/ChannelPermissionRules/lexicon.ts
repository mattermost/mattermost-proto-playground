// The single variable under test on the "noun" axis: rule vs policy.
// Everything else (Conditions, Match mode, Permissions, the ceiling framing)
// is shared and lives as constants below — so a comparison isolates the noun.
import type { Noun } from './types';

export interface Lexicon {
  unit: string; // "rule"
  unitCap: string; // "Rule"
  unitPlural: string; // "rules"
  h1: string;
  framing: string;
  addCta: string;
  newHeader: string;
  editHeader: string;
  saveCta: string;
  nameLabel: string;
  nameHelp: string;
  empty: string;
  anyHint: string;
  permissionsHelp: string;
  deleteTitle: (name: string) => string;
  deleteBody: string;
  savedToast: (name: string) => string;
}

export const LEXICONS: Record<Noun, Lexicon> = {
  rule: {
    unit: 'rule',
    unitCap: 'Rule',
    unitPlural: 'rules',
    h1: 'Channel permission rules',
    framing:
      'Rules can only limit access in this channel, not add it. A user is allowed if they match any rule.',
    addCta: 'Add rule',
    newHeader: 'Add permission rule',
    editHeader: 'Edit permission rule',
    saveCta: 'Save rule',
    nameLabel: 'Rule name',
    nameHelp: 'Give this rule a name to identify it in the list.',
    empty:
      'No permission rules yet. Access here follows your system and team policies. Add a rule to limit access further in this channel.',
    anyHint:
      'A user is allowed if they match any rule for that action. Order doesn’t matter.',
    permissionsHelp:
      'Actions allowed when this rule matches. Only actions your system policies also allow will take effect.',
    deleteTitle: (name) => `Delete “${name}”?`,
    deleteBody:
      'Users matched only by this rule will fall back to your system and team policies.',
    savedToast: (name) => `Rule “${name}” saved.`,
  },
  policy: {
    unit: 'policy',
    unitCap: 'Policy',
    unitPlural: 'policies',
    h1: 'Channel permission policies',
    framing:
      'Channel policies can only limit access in this channel, not add it. A user is allowed if they match any policy.',
    addCta: 'Add policy',
    newHeader: 'Add permission policy',
    editHeader: 'Edit permission policy',
    saveCta: 'Save policy',
    nameLabel: 'Policy name',
    nameHelp: 'Give this policy a name to identify it in the list.',
    empty:
      'No permission policies yet. Access here follows your system and team policies. Add a policy to limit access further in this channel.',
    anyHint:
      'A user is allowed if they match any policy for that action. Order doesn’t matter.',
    permissionsHelp:
      'Actions allowed when this policy matches. Only actions your system policies also allow will take effect.',
    deleteTitle: (name) => `Delete “${name}”?`,
    deleteBody:
      'Users matched only by this policy will fall back to your system and team policies.',
    savedToast: (name) => `Policy “${name}” saved.`,
  },
};

// Shared, noun-independent copy. Reused across every combination so the
// only thing that changes between variants is the unit noun above.
export const SHARED = {
  conditionsLabel: 'Conditions',
  conditionsHelp:
    'Users with these attributes can use the permissions below in this channel.',
  matchModeLabel: 'Match mode',
  matchAll: 'All conditions must match',
  matchAny: 'Any condition can match',
  roleLabel: 'Role',
  permissionsLabel: 'Permissions',
  addCondition: 'Add condition',
  addPermission: 'Add permission',
  simulate: 'Simulate access',
  ceilingTitle: 'System and team policies still apply',
  ceilingBody:
    'These set the maximum access in this channel. Your changes can narrow them, never expand them.',
} as const;
