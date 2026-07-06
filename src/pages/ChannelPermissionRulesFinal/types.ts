// Channel Permission Rules — Final direction (rule · slide-in panel).
// Self-contained so the sibling "Options Explorer" prototype is never affected.

export type Scenario = 'populated' | 'empty' | 'blocked' | 'self-lockout';
export type ChannelRole = 'channel_user' | 'channel_guest' | 'channel_admin';
export type MatchMode = 'all' | 'any';

export interface Condition {
  id: string;
  attribute: string;
  operator: string;
  values: string;
}

export interface PermissionItem {
  key: string;
  label: string;
  description: string;
}

export interface ChannelRule {
  id: string;
  name: string;
  role: ChannelRole;
  matchMode: MatchMode;
  conditions: Condition[];
  permissions: PermissionItem[];
  status: 'active' | 'disabled';
}

export interface SystemCeilingPolicy {
  name: string;
  role: string;
  allows: string[];
}

export const ROLE_LABEL: Record<ChannelRole, string> = {
  channel_user: 'Channel members',
  channel_guest: 'Channel guests',
  channel_admin: 'Channel admins',
};
