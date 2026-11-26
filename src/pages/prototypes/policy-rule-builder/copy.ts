// [AI DRAFT] Every product string for the rule-builder prototype. Strings
// marked "shipped" come from the webapp en.json; everything else is draft copy.
// Party names come from the active vocabulary (model/vocabulary.ts), never
// from here, so the naming variant switches every derived string at once.

export const PAGE = {
  /** Shipped admin.permission_policies.edit.title */
  title: 'Attribute Based Permission Policy',
  /** Designer mock (2026-10-31): the name and a description in their own card. */
  detailsTitle: 'Policy details',
  detailsSubtitle: 'Add information about this policy that will be used to identify it',
  nameLabel: 'Policy name',
  /** Shipped admin.permission_policies.edit.policyName.placeholder */
  namePlaceholder: 'Add a unique policy name',
  descriptionLabel: 'Policy description',
  /** Asks why, not what: "What this policy does" says what, and can't go stale. */
  descriptionPlaceholder: 'Why this policy exists, for example, the requirement or ticket behind it',
  /**
   * Round 2, M1 (designer): three sections. The role says who, the rules say
   * when. Replaces the shipped "Who this policy applies to" card, which held
   * both, and "What permissions are modified".
   */
  whoTitle: 'Who this applies to',
  whoSubtitle: 'Select the role that this policy applies to',
  /** Shipped admin.permission_policies.edit.role_label */
  roleLabel: 'Select a role from the predefined list of system roles',
  expressionTitle: 'Policy expression',
  expressionSubtitle: (user: string, recipient: string) =>
    `Rules can use attributes of the ${user}, the ${recipient}, and the channel, message or file.`,
  permissionsTitle: 'Permissions',
  /** Shortened from admin.permission_policies.edit.what.subtitle so it stays one line. */
  permissionsSubtitle: 'These override the default permission scheme when the expression is true',
  /** Shipped admin.permission_policies.editor.simulate_rules */
  simulate: 'Simulate rules',
  /** Left label on the rules row. The switch on the right shows which editor is on. */
  rulesLabel: 'Attribute-based rules',
  modeSwitch: 'Editor mode',
  modeSimple: 'Simple',
  modeAdvanced: 'Advanced',
  save: 'Save',
  /** Shipped admin.permission_policies.edit.cancel */
  cancel: 'Cancel',
  back: 'Back to Permission Policies',
  /** Shipped style: a plus icon, not a typed "+ " (CON8). */
  addPermission: 'Add permission',
  noPermissions: 'Add a permission to this policy',
  /** Under the rules error no permission can be added yet (CUX3-3, QA1-15). */
  noPermissionsRulesError: 'Fix the rules first, then add a permission.',
  saved: 'Policy saved',
};

/** Plain-text rule drafting in the Policy expression section. */
export const AI = {
  title: 'Create with AI',
  hint: 'Describe the rules in plain text. You can change them or ask a question after.',
  hintAdded: 'Added to the table. You can change the rules or ask a question.',
  hintUpdated: 'Updated the table. You can change the rules or ask a question.',
  placeholder: 'For example, only people in the same Program can message each other',
  followPlaceholder: 'Change the rules, or ask a question',
  send: 'Send',
  sending: 'Sending',
  expression: 'Expression',
  created: (n: number) =>
    n === 1
      ? 'Created 1 rule. It is in the table below.'
      : `Created ${n} rules. They are in the table below.`,
  updated: (n: number) =>
    n === 1
      ? 'Updated the rules. 1 rule is in the table below.'
      : `Updated the rules. ${n} rules are in the table below.`,
  removed: (n: number) => (n === 0 ? 'Removed the rules.' : `Removed a rule. ${n} remain in the table below.`),
  unchanged: 'That rule is already in the table.',
  question: 'Here is what this policy does.',
  unmatched:
    "That doesn't match an attribute this policy can use. Try Program, Clearance, Employment type, Company, Device, or Network.",
  removeWhich: 'Say which rule to remove, for example Program.',
};

/** Whole-policy drafting from the page header. One missing piece per reply. */
export const COACH = {
  title: 'Create with AI',
  close: 'Close',
  intro: 'Describe the policy. I will fill in the name, description, rules, and permissions, and ask when something is still missing.',
  fillsLabel: 'Fills in',
  fills: ['Name', 'Description', 'Rules', 'Permissions'],
  examplesLabel: 'Try an example',
  examples: [
    'Only people in the same Program can message each other',
    'People with Secret clearance on a managed device can read channels',
  ],
  placeholder: 'Describe the policy',
  followPlaceholder: 'Add the rest, or change what is there',
  send: 'Send',
  sending: 'Sending',
  building: 'Building the policy',
  buildingRead: 'Reading the prompt',
  buildingWork: (what: string) => `Writing ${what}.`,
  you: 'You',
  askRules: 'What has to be true before this applies? For example, the same Program.',
  askPermissions: 'Which permissions should this set? For example, creating direct messages.',
  askName: 'What should this policy be called?',
  askDescription: 'Why does this policy exist?',
  done: 'This policy has a name, a description, rules, and permissions. You can change any of them here.',
  nothing: 'Say who can do what, and when. For example, only people in the same Program can message each other.',
  still: 'I still need one more thing.',
  named: (name: string) => `Named it ${name}.`,
  described: 'Added a description.',
  rulesAdded: 'Added the rules.',
  rulesUpdated: 'Updated the rules.',
  rulesRemoved: 'Removed a rule.',
  directMessages: 'Added the direct message permissions.',
  channelMessages: 'Added the channel message permissions.',
  permissionsAdded: (labels: string) => `Added ${labels}.`,
  roleSet: (role: string) => `This applies to ${role}.`,
};

export const ADVANCED = {
  ariaLabel: 'Access expression',
  completionsLabel: 'Attribute suggestions',
  error: (line: number, col: number, message: string) =>
    `Line ${line}, column ${col}: ${message}`,
  complexBody: (reason: string) =>
    `It can't be shown as a table because ${reason}. It's saved exactly as written.`,
  /** Shipped admin.permission_policies.edit.complex_expression_tooltip */
  complexTooltip:
    'Complex expression detected. Simple expressions editor is not available at the moment.',
  simulateHint: 'Fix the expression to simulate it.',
  simulateComplexHint: "Simulate can't run this expression here. Simplify it to test it.",
  /** Rules first: Simulate needs an action to test (QA1-6). */
  simulateNoPermission: 'Add a permission to simulate this policy.',
  /** Permissions first: nothing to test until there's a rule (designer mock, 2026-10-31). */
  simulateNoRule: 'Add a rule to simulate this policy.',
  /** Under the rules error no permission can be added, so say what can be done (CUX2-3, QA2-5). */
  simulateRulesError: 'Fix the rules to simulate this policy.',
};

export const READBACK = {
  heading: 'What this policy does',
  show: 'Explain this policy',
  hide: 'Hide explanation',
  showDetails: 'Show details',
  readMore: 'Read more',
  showLess: 'Show less',
  /** For a barrier, say what the details hold (UX1-3, scent). */
  showBarrier: "Show when it isn't allowed",
  hideBarrier: "Hide when it isn't allowed",
  hideDetails: 'Hide details',
  /** The expression doesn't parse; the reading above is the last one that did (UX1-1). */
  stale: 'Out of date. Fix the expression to update it.',
  /** Save bar, before there's anything to explain (M7). */
  pending: 'Add a rule and a permission to see what this policy does.',
  oneWayNote: (user: string, recipient: string) =>
    `Swapping the ${user} and the ${recipient} can change the result. Check both in Simulate.`,
  noReadback: "This expression can't be summarized here. Review it carefully before saving.",
  fixFirst: 'Fix the expression to see what this policy does.',
  fixRules: 'Fix the rules to see what this policy does.',
  orphaned: (n: number) =>
    n === 1
      ? '1 rule needs a value, so it is left out.'
      : `${n} rules need a value, so they are left out.`,
  /** The barrier read the other way round (CUX1-2). */
  notAllowedLabel: 'Not allowed when',
  notAllowedAll: 'Not allowed when all of these are true',
  notAllowedAny: 'Not allowed when any of these is true',
};

/** The Sections rail beside the form (designer mock, 2026-10-31). */
export const RAIL = {
  /** Shipped admin.ldap_wizard.sections_header */
  heading: 'Sections',
  navLabel: 'Policy sections',
  /** Read after the section name, e.g. "Policy expression, has an error". */
  error: 'has an error',
  warnings: (n: number) => (n === 1 ? '1 warning' : `${n} warnings`),
};

/** M7 "Three views": one expression, three ways to read it. */
export const VIEWS = {
  simple: 'Simple',
  plain: 'Plain language',
  advanced: 'Advanced',
  readOnly: 'Read only. Switch to Simple or Advanced to edit.',
};

export const IMPACT = {
  /** Neutral: the list below says who or what (CUX4-6). */
  title: 'Some values this policy uses are missing',
  line: (count: number, noun: string, attribute: string) =>
    `${count.toLocaleString()} ${noun} have no ${attribute}`,
  body: 'A rule fails when an attribute it uses has no value. Where that rule must pass, the action is denied. This includes bots and users on connected servers.',
};

export const RULES_ERROR = {
  title: 'No permission can use all of these rules together',
  body: (parties: string, n: number) =>
    `These rules use ${parties}, and no permission has ${n === 2 ? 'both' : 'all of them'}. Remove a rule, or split them into separate policies.`,
};

/** A valid policy that no one passes, so no one gets its permissions (round 2, M4). */
export const NO_ONE = {
  title: 'No one passes these rules',
  titleSome: 'No one can use some of these permissions',
  permission: (role: string, label: string) => `No ${role} can use ${label}.`,
  value: (noun: string, attribute: string, values: string) => `No ${noun} has ${attribute} ${values}.`,
  body: 'Check the values above. You can still save if this is what you want.',
};

export const WARNINGS = {
  /** The button only counts. The warning itself is in the panel. */
  count: (n: number) => (n === 1 ? '1 warning' : `${n} warnings`),
  lessStrict: 'Less strict than the saved version',
  changed: 'Changed from the saved version',
  more: (n: number) => `${n} more`,
  /** Live-region text (QA1-5). */
  /** Live-region text: what the bar shows (QA1-5, CUX2-8). */
  announce: (label: string, suffix?: string) => (label ? `${label}${suffix ? `, ${suffix}` : ''}.` : ''),
  /** An unfinished rule, once the admin has left it. */
  unfinished: (n: number) => (n === 1 ? '1 rule still needs a value.' : `${n} rules still need a value.`),
  unfinishedBody: 'Finish it, or remove it.',
};

/** Attribute menus (round 2: M2, M6). */
export const MENU = {
  /** Recipient is the only step in this group (M2). */
  dmHeading: 'Direct and group messages',
  resourceHeading: 'Resource',
  notAvailable: 'Not available',
  searchPlaceholder: 'Search attributes',
  searchLabel: 'Search attributes',
  noMatch: (q: string) => `No attributes match "${q}"`,
};

export const PICKER = {
  /** Why an attribute is unavailable in a menu (round 2, M5). */
  worksWith: (party: string, permissions: string) => `${party} rules only work with ${permissions}.`,
  /** A permission row that can't hold the rules already written. */
  rowMissing: (parties: string) => `${parties} rules don't fit this permission.`,
  blocked: (party: string) => `Can't be added while this policy has ${party} rules.`,
  groupsBlocked: (groups: string[]) =>
    `${groups.join(' and ')} permissions not available`,
  blockedNext: (party: string) =>
    `They have no ${party}. Remove the ${party} rules first, or put these permissions in a separate policy.`,
};



export const SIMULATE = {
  /** Shipped SimulateAccessModal strings (CON2). The button stays "Simulate rules". */
  title: 'Simulate access',
  subtitle: 'Pick who acts, who they act on, and what, to see whether this policy allows it.',
  permission: 'Permission',
  user: 'User',
  recipients: (party: string) => party,
  resource: (party: string) => party,
  where: 'Where',
  allowed: 'Allowed',
  blocked: 'Denied',
  /** No verdict without someone to check (QA1-6). */
  pickRecipient: (recipient: string) => `Pick at least one ${recipient} to see a result.`,
  pass: 'Passed',
  fail: 'Failed',
  missing: 'No value',
  /** A missing value fails its rule (fail-secure); say it once (CVIS2-6, UX3-7). */
  missingFails: 'No value, so this rule fails',
  na: "Doesn't apply",
  perRecipient: (name: string) => `For ${name}`,
  close: 'Close',
  swap: (user: string, recipient: string) => `Swap ${user} and ${recipient}`,
  swapHint: (recipient: string) => `Swap works with one ${recipient}. Use Both directions for a group.`,
  /** The one recipient can't act under this policy's role, e.g. a bot on a Members policy (QA3-6). */
  swapCantAct: (name: string, user: string) => `${name} can't be the ${user} under this policy's role.`,
  applies: 'Applies',
  doesntApply: "Doesn't apply",
  summaryLabel: (recipient: string) => `Result for each ${recipient}`,
  pairsCorner: (user: string, recipient: string) => `${user} \u2192 ${recipient}`,
  traceTab: 'Rule by rule',
  pairsTab: 'Both directions',
  pairsCaption: (user: string, recipient: string) =>
    `Each row is the ${user}; each column is the ${recipient}.`,
  actual: (v?: string) => (v === undefined ? 'No value' : `Has ${v}`),
  network: 'Network',
  device: 'Device',
};

/** Join labels (04 §8): "rule" is the locked noun for a clause; no boolean words. */
export const JOIN = {
  root: { all: 'All rules required', any: 'Any rule required' },
  nested: { all: 'All of these rules', any: 'Any of these rules' },
  lockedReason: 'When rules are always combined with the other rules using All.',
} as const;

export const EDITOR = {
  addAttribute: 'Add attribute',
  /** A comparison with an earlier party is written from its side (F4, CUX1-1). */
  empty: 'Select an attribute and values to create a rule',
  columns: { attribute: 'Attribute', operator: 'Operator', values: 'Values', actions: 'Actions' },
  valuesSection: 'Values',
  compareSection: 'Compare with another attribute',
  rowAria: (attribute: string, part: string, current: string) =>
    `${attribute} ${part}: ${current}`,
  removeRow: (attribute: string) => `Remove rule on ${attribute}`,
  selectRow: (n: number) => `Select rule ${n}`,
  group: 'Group',
  ungroup: 'Ungroup',
  groupHint: 'Select two or more rules to group them.',
};

export const WHEN = {
  add: '+ Add When rule',
  when: 'When',
  whenLocked: 'Every rule in When must be true for the requirement to apply.',
  then: 'Then require',
  remove: 'Remove When rule',
  emptyWhen: 'Add the condition that makes this rule apply',
  emptyAlways: 'No rules apply to everyone. The When rules below apply only when their condition is met.',
  connector:
    'Every rule above must pass. Each When rule below is checked when its condition is met, or when a condition has no value.',
  missingChecked: 'No value · requirement checked',
  /** Shipped: admin.access_control.table_editor.value.select_value (CON8). */
  placeholder: 'Select value',
  incomplete: 'Add at least one condition and one requirement.',
  addBlocked: 'Switch the rules above to All rules required to add a When rule.',
  emptyThen: 'Add what must be true when it applies',
};

export const WIDENING = {
  title: 'This change makes the policy less strict.',
  /** Direction unknown: don't over-claim (CUX2-4, QA2-4). */
  titleChanged: "This change can't be compared with the saved version. Review it before saving.",
  detail: {
    join: 'Any one rule is now enough instead of all of them.',
    removed: 'A required rule was removed.',
    ungrouped: 'A group was removed, so its rules now combine differently.',
    moved: 'A rule now applies only when its When condition is met.',
    'added-any': 'A rule was added to an Any list, so it gives another way to pass.',
    condition: 'A When condition was added, so the rule applies in fewer cases.',
    permission: 'A permission was removed, so this policy no longer controls it.',
    role: 'The policy now applies to a different role.',
    looser: 'A rule now accepts more values than before.',
    changed: "A rule changed in a way that can't be ranked stricter or looser. Review it before saving.",
    unverifiable: "This expression can't be compared with the saved version. Review the expression above before saving.",
    regrouped: 'A required rule moved into an Any list, so it is no longer required.',
  } as Record<string, string>,
  /** Party nouns follow the naming option (CON10). */
  pairs: (n: number, unit: 'pairs' | 'accounts', user: string, recipient: string) =>
    unit === 'pairs'
      ? `In a simulation of the sample accounts, ${n} ${user} and ${recipient} ${n === 1 ? 'pair that was denied is' : 'pairs that were denied are'} now allowed.`
      : `In a simulation of the sample accounts, ${n} ${n === 1 ? 'account that was denied is' : 'accounts that were denied are'} now allowed.`,
  /** One wording for the emptied policy everywhere, with the role (CON7). */
  emptied: () => 'No rules are left. Add one before saving.',
  before: 'Saved version',
  after: 'This version',
};

export const CANONICAL = {
  note: 'Rewritten in the standard format. The meaning is the same.',
};

export const SAVE_BLOCK = {
  title: 'Before you can save:',
  rulesError: 'No permission can use all of these rules together.',
  mismatched: (n: number) =>
    n === 1 ? "1 permission doesn't fit the rules." : `${n} permissions don't fit the rules.`,
  incomplete: (n: number) => (n === 1 ? '1 rule needs a value.' : `${n} rules need a value.`),
  /** A policy needs at least one rule (designer, round 1.1). */
  noRules: 'Add at least one rule.',
  orphaned: (n: number, parties: string) =>
    n === 1
      ? `1 rule uses ${parties}, which this policy's permissions don't supply.`
      : `${n} rules use ${parties}, which this policy's permissions don't supply.`,
  emptyCard: (n: number) =>
    n === 1 ? '1 When rule needs a condition and a requirement.' : `${n} When rules need a condition and a requirement.`,
  celError: 'The expression has an error.',
  noPermission: 'Add at least one permission.',
};

export const SAVE = {
  title: 'Save this policy?',
  confirm: 'Save policy',
  cancel: 'Cancel',
  /** One sentence. The page already shows the full reading and the warning. */
  noOne: 'No one passes these rules, so no one gets these permissions.',
  noOneSome: 'No one can use some of these permissions.',
  looser: 'This allows more than the saved policy.',
  uncompared: "This can't be compared with the saved policy.",
  missing: (facts: string) => `${facts}. They are denied where a rule needs that value.`,
};

/** Grouping (feedback F5): group blocks, connector words, rule sets. */
export const GROUPS = {
  where: 'Where',
  and: 'and',
  or: 'or',
  andHelp: 'Every rule must be true',
  orHelp: 'At least one rule must be true',
  connectorAria: (word: string) => `Rules joined with ${word}. Change how rules combine`,
  add: (join: 'all' | 'any') => (join === 'any' ? 'Add "any of" group' : 'Add "all of" group'),
  addInside: 'Add to group',
  /** Two lines at most: Compass caps tooltips at 200px (GVIS3-2, GUX3-5). */
  joinLocked: (groups: number) =>
    groups > 1
      ? 'Changing this would also flip the groups. Ungroup them first.'
      : 'Changing this would also flip the group. Ungroup it first.',
  joinLockedAria: 'Why this is fixed',
  groupMenu: (label: string) => `Actions for group: ${label}`,
  ungroupHelp: 'Its rules join the list above',
  removeGroup: 'Remove group',
  removeGroupHelp: 'Deletes the group and its rules',
  loosens: 'Makes the policy less strict',
  /** The Undo line, by group change (GUX2-4). */
  done: {
    ungroup: 'Ungrouped.',
    remove: 'Group removed.',
    'move-in': 'Moved into the group.',
    'move-out': 'Moved out of the group.',
  },
  doneHelp: {
    ungroup: 'Its rules now combine with the list.',
    remove: 'Its rules were deleted.',
    'move-in': '',
    'move-out': '',
  },
  lessStrict: 'This makes the policy less strict.',
  /** The widest case says what it means (GUX4-2). */
  /** No rules left: Save is blocked until one is added (designer, round 1.1). */
  emptied: () => 'No rules are left. Add one before saving.',
  emptiedMenu: () => "Leaves no rules. The policy can't be saved without one",
  moreStrict: 'This makes the policy stricter.',
  /** Changed, but in a way that can't be ranked looser or stricter (QA3-1). */
  changedUnknown: "This changes the rule in a way that can't be ranked stricter or looser.",
  undo: 'Undo',
  /** How the group joins the list, then how its rules combine (GUX1-5). */
  blockLabel: (join: 'all' | 'any', { joined, n }: { joined: boolean; n?: number }) => {
    const text = join === 'any' ? 'any of these' : 'all of these';
    const lead = joined ? `${join === 'any' ? 'And' : 'Or'}, ${text}` : text.charAt(0).toUpperCase() + text.slice(1);
    return n ? `${lead} (group ${n})` : lead;
  },
  blockHelp: (join: 'all' | 'any') =>
    join === 'any' ? 'At least one must be true' : 'Every one must be true',
  empty: (join: 'all' | 'any') =>
    join === 'any'
      ? 'Add the rules that can each satisfy this group. An empty group is left out when you save.'
      : 'Add the rules that must all be true together. An empty group is left out when you save.',
  ungroup: 'Ungroup',
  rowMenu: (attribute: string) => `More actions for ${attribute}`,
  moveInto: 'Move into group',
  moveIntoNumbered: (n: number) => `Move into group ${n}`,
  moveOut: 'Move out of group',
  setLabel: (n: number) => `Rule set ${n}`,
  setHelp: 'All rules in a set are required',
  or_divider: 'Or',
  addSet: '+ Add another rule set',
  removeSet: (n: number) => `Remove rule set ${n}`,
};
