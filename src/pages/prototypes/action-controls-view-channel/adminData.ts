import type { AdminConsoleSidebarGroupModel } from '@mattermost/compass-ui/components/admin-console-sidebar';

/* ------------------------------------------------------------------ */
/* System Console navigation                                           */
/* ------------------------------------------------------------------ */

/**
 * Transcribed from `reference/Permission Policies Ref Screens/Dropdowns open.png`.
 * Do not invent entries — a nav item that does not exist in the reference reads
 * as a product claim we have not made.
 */
const CONSOLE_NAV: AdminConsoleSidebarGroupModel[] = [
  {
    key: 'reporting',
    categoryLabel: 'Reporting',
    categoryIconKey: 'reporting',
    stickyCategory: true,
    items: [{ name: 'Team Statistics' }, { name: 'Server Logs' }],
  },
  {
    key: 'user-management',
    categoryLabel: 'User Management',
    categoryIconKey: 'users',
    items: [
      { name: 'Users' },
      { name: 'Groups' },
      { name: 'Teams' },
      { name: 'Channels' },
      { name: 'Permissions' },
      { name: 'System Roles (Beta)' },
    ],
  },
  {
    key: 'system-attributes',
    categoryLabel: 'System Attributes',
    categoryIconKey: 'compliance',
    items: [
      { name: 'User Attributes' },
      { name: 'Membership Policies' },
      { name: 'Permission Policies' },
    ],
  },
  {
    key: 'environment',
    categoryLabel: 'Environment',
    categoryIconKey: 'environment',
    items: [
      { name: 'Web Server' },
      { name: 'Database' },
      { name: 'Elasticsearch' },
      { name: 'File Storage' },
      { name: 'Image Proxy' },
      { name: 'SMTP' },
      { name: 'Push Notification Server' },
      { name: 'High Availability' },
      { name: 'Rate Limiting' },
      { name: 'Logging' },
      { name: 'Session Lengths' },
      { name: 'Performance Monitoring' },
      { name: 'Developer' },
    ],
  },
  {
    key: 'site-configuration',
    categoryLabel: 'Site Configuration',
    categoryIconKey: 'site',
    items: [
      { name: 'Customization' },
      { name: 'Localization' },
      { name: 'Users and Teams' },
      { name: 'Notifications' },
      { name: 'Announcement Banner' },
      { name: 'Emoji' },
      { name: 'Posts' },
    ],
  },
];

export function consoleNavWithActive(
  activeItemName: string,
): AdminConsoleSidebarGroupModel[] {
  return CONSOLE_NAV.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      active: item.name === activeItemName,
    })),
  }));
}

/* ------------------------------------------------------------------ */
/* Policy fixtures                                                     */
/* ------------------------------------------------------------------ */

export const POLICY_NAME = 'Untrusted network channel restriction';

/**
 * Transcribed from shipped `admin.permission_policies.role.*` in
 * `webapp/channels/src/i18n/en.json` @ a58a4fee; order follows
 * `AVAILABLE_ROLES` in `permission_policy_details.tsx`.
 */
export const ROLE_OPTIONS = [
  { value: 'Guest users', description: 'Applies only to guest users' },
  {
    value: 'Members',
    description:
      'Applies to regular members. System administrators also fall back to this rule if no admin-specific policy with the same permissions exists.',
  },
  {
    value: 'System administrators',
    description: 'Applies only to system administrators',
  },
];

export const SELECTED_ROLE = 'Members';

export const POLICY_ATTRIBUTES = [
  { attribute: 'Network', operator: 'is', value: 'Trusted' },
  { attribute: 'Device Type', operator: 'is', value: 'Managed' },
];

/**
 * Rows in "What permissions are modified".
 *
 * Labels and descriptions are transcribed from shipped
 * `admin.permission_policies.permission.*` — one label per action, Title Case,
 * identical here and in the add-permission picker. Order follows
 * `AVAILABLE_PERMISSIONS` in `permission_policy_details.tsx`.
 *
 * `description` feeds the table's Description column as well as the
 * add-permission picker. Shipped rows are label + trash only; the column is a
 * designer-chosen divergence back to the reference PNG, so an admin reading the
 * policy can see what each permission grants without opening the picker.
 */
export const POLICY_PERMISSIONS = [
  {
    name: 'Download Files',
    description: 'Allow users to download files to their device',
  },
  {
    name: 'Upload Files',
    description: 'Allow users to upload files while sending a message',
  },
  /** PROPOSED — net-new actions for this spec; no shipped i18n keys yet. */
  {
    name: 'Read Channels',
    description: 'Allow users to see a channel, its name, and its messages',
  },
  {
    name: 'Write to Channels',
    description: 'Allow users to post messages. Has no effect without Read Channels.',
  },
];

/**
 * The "+ Add permission" popover. The two file rows carry the same shipped
 * labels and descriptions as the table above — shipped code renders one
 * `AVAILABLE_PERMISSIONS` entry in both places, so they cannot diverge.
 * Read Channels and Write to Channels are the net-new actions this spec adds.
 * Nothing else belongs here — file preview is not a shipped or planned permission.
 *
 * `added` is intentionally unused: on the picker screen the policy has no
 * permissions yet, so every row renders plain. Shipped
 * `permission_policy_details.tsx` filters the menu to `availableToAdd`
 * instead of rendering an added state.
 */
export const PERMISSION_PICKER_ITEMS = [
  {
    name: 'Download Files',
    description: 'Allow users to download files to their device',
    added: true,
  },
  {
    name: 'Upload Files',
    description: 'Allow users to upload files while sending a message',
    added: true,
  },
  /** PROPOSED — net-new actions for this spec; no shipped i18n keys yet. */
  {
    name: 'Read Channels',
    description: 'Allow users to see a channel, its name, and its messages',
    added: false,
  },
  {
    name: 'Write to Channels',
    description: 'Allow users to post messages. Has no effect without Read Channels.',
    added: false,
  },
];
