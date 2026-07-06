import {
  accessCap,
  capabilityGrantCount,
  type AccessCapability,
  type WhoCanSet,
  type WhoSets,
} from '../AttributeManagementHub/hubData';

/** Quick relational defaults offered for a Channels binding in the demo. */
export const QUICK_DEFAULTS: WhoSets[] = [
  'Channel admin',
  'Team admin',
  'System admin',
  'Members',
];

export function emptyWhoCanSet(): WhoCanSet {
  return { relationalDefault: 'Channel admin', grants: accessCap() };
}

export interface GrantSummary {
  total: number;
  roles: number;
  users: number;
  rules: number;
}

export function summarize(grants: AccessCapability): GrantSummary {
  return {
    total: capabilityGrantCount(grants),
    roles: grants.roles.length,
    users: grants.users.length,
    rules: grants.attributeRules.length,
  };
}

/** "2 roles, 1 user" style human summary of additional grants. */
export function grantSummaryLabel(grants: AccessCapability): string {
  const s = summarize(grants);
  const parts: string[] = [];
  if (s.roles) parts.push(`${s.roles} ${s.roles === 1 ? 'role' : 'roles'}`);
  if (s.users) parts.push(`${s.users} ${s.users === 1 ? 'user' : 'users'}`);
  if (s.rules) parts.push(`${s.rules} ${s.rules === 1 ? 'rule' : 'rules'}`);
  return parts.join(', ');
}

export interface OptionMeta {
  id: 'statement' | 'quick-pick' | 'dropdown';
  n: number;
  title: string;
  blurb: string;
  optimizedFor: string;
}

export const OPTION_META: OptionMeta[] = [
  {
    id: 'statement',
    n: 1,
    title: 'Statement + Change',
    blurb:
      'Reads as a plain-language fact, not a form field. A subtle “Change” link reveals the picker; specifics stay one link deeper.',
    optimizedFor: 'The 80% who never change the default.',
  },
  {
    id: 'quick-pick',
    n: 2,
    title: 'Quick-pick + Advanced',
    blurb:
      'All quick defaults visible as one-click options. Roles, users, and rules live behind a single “Advanced” disclosure.',
    optimizedFor: 'The 10% who swap to another quick default.',
  },
  {
    id: 'dropdown',
    n: 3,
    title: 'Dropdown + Custom access',
    blurb:
      'Console-standard select for the default. “Add specific access” escalates to roles, users, and attribute rules only when needed.',
    optimizedFor: 'Consistency with the rest of the console.',
  },
];
