import type { ResourceKind } from '@/pages/AttributeManagementHub/hubData';
import {
  OTHER_SYSTEM_ROLES,
  RELATIONAL_DEFAULTS,
} from './appliesToModel';

export interface SetterRoleOption {
  name: string;
  memberCount: number;
  group: 'resource' | 'system';
}

const MEMBER_COUNTS: Record<string, number> = {
  'System admin': 4,
  'Channel admin': 45,
  'Post author': 0,
  'Team admin': 18,
  Members: 892,
  'Security Administrators': 23,
  'Program Security Officers': 12,
  'Channel Admins': 45,
  'Team Admins': 18,
  'Directory Administrators': 6,
  'People Operations': 14,
  'Finance Administrators': 9,
};

/** Roles available in the simplified who-can-set combobox for a resource. */
export function setterRoleOptions(
  resource: ResourceKind,
  membersBlocked: boolean,
): SetterRoleOption[] {
  const defaults = RELATIONAL_DEFAULTS[resource]
    .filter((role) => !(membersBlocked && role === 'Members'))
    .map((name) => ({
      name,
      memberCount: MEMBER_COUNTS[name] ?? 8,
      group: 'resource' as const,
    }));

  const system = OTHER_SYSTEM_ROLES.map((name) => ({
    name,
    memberCount: MEMBER_COUNTS[name] ?? 8,
    group: 'system' as const,
  }));

  const seen = new Set<string>();
  return [...defaults, ...system].filter((option) => {
    if (seen.has(option.name)) {
      return false;
    }
    seen.add(option.name);
    return true;
  });
}
