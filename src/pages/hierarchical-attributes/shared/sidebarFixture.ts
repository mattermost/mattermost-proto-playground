import { createElement } from 'react';
import AccountMultipleOutlineIcon from '@mattermost/compass-icons/components/account-multiple-outline';
import SitemapIcon from '@mattermost/compass-icons/components/sitemap';
import ServerVariantIcon from '@mattermost/compass-icons/components/server-variant';
import type { ConsoleSidebarCategoryData } from '@/components/ui/ConsoleSidebar/ConsoleSidebar';

/**
 * System Console sidebar fixture for the Hierarchical Attributes prototype.
 *
 * Extends the SessionAttributes sidebar with a `membership-policies` item
 * under "System Attributes" so the Policy Editor page can highlight it (per
 * Figma 4208-27399). Defined once here so both the User Attributes page
 * (`/d1`) and the Membership Policy Editor page (`/d1/policy-editor`) share
 * the same sidebar shape.
 */
export const SIDEBAR_CATEGORIES: ConsoleSidebarCategoryData[] = [
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
      { id: 'system-roles', label: 'System Roles', tag: 'Beta' },
    ],
  },
  {
    id: 'system-attributes',
    label: 'System Attributes',
    icon: createElement(SitemapIcon),
    items: [
      { id: 'user-attributes', label: 'User Attributes' },
      { id: 'membership-policies', label: 'Membership Policies' },
      { id: 'abac', label: 'Attribute-based access' },
    ],
  },
  {
    id: 'environment',
    label: 'Environment',
    icon: createElement(ServerVariantIcon),
    items: [
      { id: 'web-server', label: 'Web Server' },
      { id: 'database', label: 'Database' },
      { id: 'elasticsearch', label: 'Elasticsearch' },
      { id: 'file-storage', label: 'File Storage' },
      { id: 'image-proxy', label: 'Image Proxy' },
      { id: 'smtp', label: 'SMTP' },
    ],
  },
];
