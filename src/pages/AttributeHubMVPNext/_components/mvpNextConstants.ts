import {
  isPolicyLocked,
  isSourceOwned,
  type HubAttribute,
  type UserProfileDisplay,
} from '@/pages/AttributeManagementHub/hubData';

/** Users binding — who-can-set radio labels (MVP · Next). */
export const MVP_NEXT_USERS_SETTER_MEMBER_LABEL = 'Member';
export const MVP_NEXT_USERS_SETTER_SYSADMIN_LABEL = 'System Administrator';
export const MVP_NEXT_USERS_WHO_CAN_SET_HINT = `Choose ${MVP_NEXT_USERS_SETTER_MEMBER_LABEL} or ${MVP_NEXT_USERS_SETTER_SYSADMIN_LABEL}.`;

/** Catalog row — tooltip when Delete attribute is disabled. */
export function mvpDeleteBlockedTooltip(
  attribute: HubAttribute,
): string | undefined {
  const policyLocked = isPolicyLocked(attribute);
  const synced = isSourceOwned(attribute);

  if (!policyLocked && !synced) {
    return undefined;
  }

  if (policyLocked && synced) {
    return 'This attribute is managed externally and used in Access Policies. It cannot be deleted here.';
  }

  if (policyLocked) {
    if (attribute.usedByPolicies === 1) {
      return 'This attribute is used in an Access Policy and cannot be deleted.';
    }
    return `This attribute is used in ${attribute.usedByPolicies} Access Policies and cannot be deleted.`;
  }

  return 'This attribute is managed by an external source and cannot be deleted here.';
}

/** User-facing label for a who-can-set role stored in hub data. */
export function mvpSetterRoleDisplayLabel(role: string): string {
  if (role === 'System admin') {
    return MVP_NEXT_USERS_SETTER_SYSADMIN_LABEL;
  }
  return role;
}

/** Profile display options for MVP · Next (Users binding). */
export const MVP_NEXT_PROFILE_DISPLAY_OPTIONS: {
  key: UserProfileDisplay;
  label: string;
}[] = [
  { key: 'always', label: 'Always' },
  { key: 'hide-empty', label: 'When set' },
  { key: 'hidden', label: 'Hidden' },
];

export function mvpNextProfileDisplayLabel(
  mode: UserProfileDisplay | undefined,
): string {
  switch (mode) {
    case 'always':
      return 'Profile display: Always';
    case 'hidden':
      return 'Profile display: Hidden';
    case 'hide-empty':
    default:
      return 'Profile display: When set';
  }
}

/** Compact inline segment for collapsed Users resource rows. */
export function mvpNextProfileDisplayInlineSummary(
  mode: UserProfileDisplay | undefined,
): string {
  switch (mode) {
    case 'always':
      return 'Profile display: always';
    case 'hidden':
      return 'Profile display: hidden';
    case 'hide-empty':
    default:
      return 'Profile display: when set';
  }
}
