/**
 * Channel Settings → Permissions Policy fixtures.
 *
 * Copy is transcribed from shipped `channel_settings.permissions_policy.*` in
 * `webapp/channels/src/i18n/en.json` @ a58a4fee, with the key named beside each
 * string. Where the reference PNG disagrees with a shipped string, shipped wins
 * per the standing designer ruling.
 */

export const CHANNEL_NAME = 'Operation Aurora';

/** Left-hand nav of the Channel Settings modal — `channel_settings.tab.*`. */
export const SETTINGS_TABS = [
  { id: 'info', label: 'Info' },
  { id: 'configuration', label: 'Configuration' },
  { id: 'membership', label: 'Membership Policy' },
  { id: 'permissions', label: 'Permissions Policy' },
  { id: 'actions', label: 'Channel Actions' },
];

export const ARCHIVE_TAB = { id: 'archive', label: 'Archive Channel' };

export const CHANNEL_POLICY_COPY = {
  /** channel_settings.permissions_policy.section_title */
  sectionTitle: 'Channel permission rules',
  /** channel_settings.permissions_policy.add_rule */
  addRule: 'Add rule',
  /** channel_settings.permissions_policy.search_placeholder */
  searchPlaceholder: 'Search by name or permission',
  /** channel_settings.permissions_policy.column.name */
  columnName: 'Name',
  /** channel_settings.permissions_policy.column.permissions */
  columnPermissions: 'Permissions',
  /** channel_settings.permissions_policy.editor.edit_title */
  editTitle: 'Edit permission rule',
  /** channel_settings.permissions_policy.editor.back */
  back: 'Back to rules list',
  /** channel_settings.permissions_policy.editor.save */
  save: 'Save rule',
  /** channel_settings.permissions_policy.editor.cancel */
  cancel: 'Cancel',
  /** channel_settings.permissions_policy.field.name */
  fieldName: 'Name',
  /** channel_settings.permissions_policy.field.name_placeholder */
  namePlaceholder: 'e.g. Block external uploads',
  /** channel_settings.permissions_policy.field.role */
  fieldRole: 'Role',
  /** channel_settings.permissions_policy.field.role_hint */
  roleHint: 'Channel-scoped role this rule applies to',
  /** channel_settings.permissions_policy.field.expression */
  fieldExpression: 'User attribute conditions',
  /** channel_settings.permissions_policy.field.actions */
  fieldActions: 'Permissions',
  /** channel_settings.permissions_policy.field.actions_column */
  actionsColumn: 'Permission',
  /** channel_settings.permissions_policy.field.actions_hint */
  actionsHint: 'These permissions are governed by this rule',
  /** channel_settings.permissions_policy.field.actions_add */
  actionsAdd: 'Add permission',
  /** channel_settings.permissions_policy.or_hint */
  orHint:
    'When several rules apply to the same role and action, a user is allowed if any one of them allows them. A system-level policy may still deny the permission even when this channel policy allows it.',
  /** channel_settings.permissions_policy.system_banner */
  systemBanner:
    'System-wide permission policies may also influence access decisions for this channel.',
  /** channel_settings.permissions_policy.pagination.range — {start} - {end} of {total} */
  paginationRange: '1 - 3 of 3',
};

/** channel_settings.permissions_policy.role.* — shipped labels and descriptions. */
export const CHANNEL_ROLE_OPTIONS = [
  {
    value: 'Channel admin',
    description: 'Applies only to channel administrators',
  },
  {
    value: 'Channel member',
    description:
      'Applies to regular channel members. Channel admins fall back to this rule when no admin-specific rule exists.',
  },
  {
    value: 'Channel guest',
    description: 'Applies only to guest accounts in this channel',
  },
];

export const SELECTED_CHANNEL_ROLE = 'Channel member';

/**
 * channel_settings.permissions_policy.action.* — note these descriptions are
 * channel-scoped and differ from the System Console wording, which is a
 * separate key family. Sentence case here, Title Case there; that is shipped
 * behaviour, not an inconsistency introduced by the prototype.
 */
export const CHANNEL_ACTIONS = [
  {
    name: 'Download files',
    description: 'Allow users to download attached files from this channel',
  },
  {
    name: 'Upload files',
    description: 'Allow users to attach files to messages in this channel',
  },
  /**
   * PROPOSED — net-new for this spec, no shipped key. Phrasing follows the two
   * shipped channel-scoped descriptions above ("… this channel") rather than
   * the System Console wording.
   */
  {
    name: 'Read Channels',
    description: 'Allow users to see this channel, its name, and its messages',
  },
  {
    name: 'Write to Channels',
    description:
      'Allow users to post messages in this channel. Has no effect without Read Channels.',
  },
];

/** Rows in the rules list. `permissions` drives the pluralised count column. */
export const CHANNEL_RULES = [
  { name: 'Watchfloor viewing restriction', permissions: 1 },
  { name: 'File access policy', permissions: 2 },
  { name: 'Observer posting restriction', permissions: 1 },
];

/** Conditions on the rule being edited. */
export const RULE_CONDITIONS = [
  { attribute: 'Clearance', operator: 'is', value: 'Confidential' },
  { attribute: 'Network', operator: 'is', value: 'Trusted' },
];

/**
 * Self-inclusion check.
 *
 * PROPOSED copy, modelled on the shipped membership-policy equivalent
 * (`channel_settings.access_rules.error.self_exclusion_title` = "Cannot save
 * access rules" / `…_message` = "You cannot set this rule because it would
 * remove you from the channel…"). There is no shipped key for the permissions
 * policy because Read Channel does not exist yet.
 *
 * The permissions version has to check more than the membership one: membership
 * is evaluated per user, but Read Channel is evaluated per SESSION, so the
 * author's current session attributes are part of the test.
 */
export const SELF_EXCLUSION = {
  title: 'Cannot save permission rule',
  message:
    'You cannot set this rule because it would remove your own access to this channel. Once the channel is hidden you would not be able to reopen these settings. Update the conditions so that your attributes and your current session satisfy them.',
  /**
   * Which side of the check failed, shown so the author can act on it.
   *
   * Values must satisfy the stated operator exactly — these conditions use
   * `is`, so the passing row has to match on equality. A ranked comparison
   * (Secret satisfying a Confidential floor) would need an `at least` operator,
   * which this rule does not use.
   */
  checks: [
    {
      label: 'Clearance is Confidential',
      attribute: 'Your value: Confidential',
      pass: true,
    },
    { label: 'Network is Trusted', attribute: 'This session: Public', pass: false },
  ],
};
