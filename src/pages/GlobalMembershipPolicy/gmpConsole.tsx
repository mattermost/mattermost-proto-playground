import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import FormatListBulletedIcon from '@mattermost/compass-icons/components/format-list-bulleted';
import ShieldOutlineIcon from '@mattermost/compass-icons/components/shield-outline';
import ServerVariantIcon from '@mattermost/compass-icons/components/server-variant';

import type { ConsoleSidebarCategoryData } from '@/components/ui/ConsoleSidebar/ConsoleSidebar';

export const GMP_ROUTES = {
  list: '/prototypes/global-membership-policies',
  editor: '/prototypes/global-membership-policy-long-form',
  guided: '/prototypes/global-membership-policy-guided',
  walkthrough: '/prototypes/global-membership-policy-walkthrough',
  simulate: '/prototypes/global-membership-policy-simulate',
} as const;

/** Global Attributes hub filtered to Channels — walkthrough primer. */
export const CHANNEL_ATTRIBUTES_PREVIEW =
  '/prototypes/attribute-hub-mvp?resource=Channels';

export const GMP_SIDEBAR_CATEGORIES: ConsoleSidebarCategoryData[] = [
  {
    id: 'user-management',
    label: 'User Management',
    icon: <AccountMultipleOutlineIcon />,
    items: [
      { id: 'users', label: 'Users' },
      { id: 'groups', label: 'Groups' },
      { id: 'teams', label: 'Teams' },
      { id: 'channels', label: 'Channels' },
      { id: 'permissions', label: 'Permissions' },
      { id: 'system-roles', label: 'System Roles' },
    ],
  },
  {
    id: 'attribute-management',
    label: 'Attribute Management',
    icon: <FormatListBulletedIcon />,
    items: [
      { id: 'global-attributes', label: 'Global Attributes' },
      { id: 'user-attributes', label: 'User Attributes' },
      { id: 'channel-attributes', label: 'Channel Attributes' },
      { id: 'board-attributes', label: 'Board Attributes' },
      { id: 'playbook-attributes', label: 'Playbook Attributes' },
    ],
  },
  {
    id: 'attribute-based-policies',
    label: 'Attribute-Based Policies',
    icon: <ShieldOutlineIcon />,
    items: [
      { id: 'membership-policies', label: 'Membership Policies' },
      { id: 'permission-policies', label: 'Permission Policies' },
    ],
  },
  {
    id: 'environment',
    label: 'Environment',
    icon: <ServerVariantIcon />,
    items: [
      { id: 'web-server', label: 'Web Server' },
      { id: 'database', label: 'Database' },
      { id: 'elasticsearch', label: 'Elasticsearch' },
      { id: 'file-storage', label: 'File Storage' },
    ],
  },
];

export function editorHref(policyId?: string): string {
  if (policyId == null || policyId === 'new') {
    return GMP_ROUTES.editor;
  }
  return `${GMP_ROUTES.editor}?policy=${encodeURIComponent(policyId)}`;
}
