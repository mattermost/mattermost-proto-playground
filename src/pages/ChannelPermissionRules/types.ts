// Channel Permission Rules — Options Explorer
// Shared types for the noun × container exploration prototype.

export type Noun = 'rule' | 'policy';
export type Container = 'slide-in' | 'accordion' | 'shipped';
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

/** Read-only reference: system-scoped policies that constrain this channel (the ceiling). */
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
