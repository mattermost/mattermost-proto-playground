import { createElement } from 'react';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import FormatListBulletedIcon from '@mattermost/compass-icons/components/format-list-bulleted';
import ServerVariantIcon from '@mattermost/compass-icons/components/server-variant';
import type { ConsoleSidebarCategoryData } from '@/components/ui/ConsoleSidebar/ConsoleSidebar';

/**
 * System Console sidebar IA for the Attribute Management Hub.
 * Active item: `manage-attributes`.
 */
export const HUB_SIDEBAR_CATEGORIES: ConsoleSidebarCategoryData[] = [
  {
    id: 'user-management',
    label: 'User Management',
    icon: createElement(AccountMultipleOutlineIcon),
    items: [
      { id: 'users', label: 'Users' },
      { id: 'groups', label: 'Groups' },
      { id: 'teams', label: 'Teams' },
      { id: 'channels', label: 'Channels' },
      { id: 'permissions', label: 'Permissions' },
    ],
  },
  {
    id: 'attribute-system',
    label: 'Attribute System',
    icon: createElement(FormatListBulletedIcon),
    items: [
      { id: 'manage-attributes', label: 'Manage Attributes' },
      { id: 'abac', label: 'Attribute-based access control' },
      { id: 'membership-policies', label: 'Membership Policies' },
      { id: 'permission-policies', label: 'Permission Policies' },
    ],
  },
  {
    id: 'environment',
    label: 'Environment',
    icon: createElement(ServerVariantIcon),
    items: [
      { id: 'session-attributes', label: 'Session Attributes' },
      { id: 'web-server', label: 'Web Server' },
      { id: 'logging', label: 'Logging' },
    ],
  },
];

export const HUB_ACTIVE_ITEM = 'manage-attributes';
