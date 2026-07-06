import type { AdminConsoleSidebarGroupModel } from '@/components/ui/AdminConsoleSidebar/adminConsoleSidebarModel';

function withActive(
  names: string[],
  active: string,
): { name: string; active?: boolean }[] {
  return names.map((name) => (name === active ? { name, active: true } : { name }));
}

/** System Console nav matching the Global Attributes mockup. */
export function systemConsoleGroups(active: string): AdminConsoleSidebarGroupModel[] {
  return [
    {
      key: 'users',
      categoryLabel: 'User Management',
      categoryIconKey: 'users',
      stickyCategory: true,
      items: withActive(
        ['Users', 'Groups', 'Teams', 'Channels', 'Permissions', 'System Roles'],
        active,
      ),
    },
    {
      key: 'attribute-management',
      categoryLabel: 'Attribute Management',
      categoryIconKey: 'site',
      items: withActive(
        [
          'Global Attributes',
          'User Attributes',
          'Team Attributes',
          'Channel Attributes',
          'Post Attributes',
          'Board Attributes',
          'Playbook Attributes',
        ],
        active,
      ),
    },
    {
      key: 'attribute-policies',
      categoryLabel: 'Attribute-Based Policies',
      categoryIconKey: 'authentication',
      items: withActive(['Membership Policies', 'Permission Policies'], active),
    },
    {
      key: 'environment',
      categoryLabel: 'Environment',
      categoryIconKey: 'environment',
      items: withActive(['Session Attributes', 'Web Server', 'Logging'], active),
    },
  ];
}

/** Team Settings nav (team admin persona). */
export function teamSettingsGroups(active: string): AdminConsoleSidebarGroupModel[] {
  return [
    {
      key: 'team',
      categoryLabel: 'Operation Shield · Team',
      categoryIconKey: 'users',
      stickyCategory: true,
      items: withActive(['Team Details', 'Members', 'Channels', 'Groups'], active),
    },
    {
      key: 'attributes',
      categoryLabel: 'Team Attributes',
      categoryIconKey: 'site',
      items: withActive(['Team Attributes', 'Channel Attributes'], active),
    },
    {
      key: 'policies',
      categoryLabel: 'Access',
      categoryIconKey: 'authentication',
      items: withActive(['Membership Policies'], active),
    },
  ];
}

/** Channel Settings nav (channel admin persona). */
export function channelSettingsGroups(active: string): AdminConsoleSidebarGroupModel[] {
  return [
    {
      key: 'channel',
      categoryLabel: '# fires-watch · Channel',
      categoryIconKey: 'site',
      stickyCategory: true,
      items: withActive(
        ['Channel Info', 'Attributes', 'Members', 'Archive Channel'],
        active,
      ),
    },
  ];
}
