import avatarAiko from '@/assets/avatars/Aiko Tan.png';
import avatarDavid from '@/assets/avatars/David Liang.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import { ROLES, USERS } from '@/pages/AttributeManagementHub/_components/AccessEditor/CapabilityGrants';

export interface EditorRoleOption {
  name: string;
  memberCount: number;
}

export interface EditorUserOption {
  name: string;
  handle: string;
  avatarSrc: string;
}

const ROLE_MEMBER_COUNTS: Record<string, number> = {
  'Security Administrators': 23,
  'Program Security Officers': 12,
  'Channel Admins': 45,
  'Team Admins': 18,
  Members: 892,
  'Directory Administrators': 6,
  'People Operations': 14,
  'Finance Administrators': 9,
};

const USER_AVATARS: Record<string, string> = {
  'Marisol Vance': avatarEmma,
  'Idris Fanning': avatarMarco,
  'Priya Anand': avatarAiko,
  'Leonard Riley': avatarLeonard,
  'Aiko Tan': avatarAiko,
  'Kevin Chen': avatarDavid,
  'Zackary Bauch': avatarMarco,
};

const EXTRA_USER_NAMES = ['Leonard Riley', 'Aiko Tan', 'Kevin Chen', 'Zackary Bauch'];

function nameToHandle(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '.');
}

function avatarForName(name: string): string {
  return USER_AVATARS[name] ?? avatarEmma;
}

/** Roles available in the editor picker (excludes sync-owned roles). */
export const EDITOR_ROLE_OPTIONS: EditorRoleOption[] = ROLES.filter(
  (role) => !role.includes('sync (system)'),
).map((name) => ({
  name,
  memberCount: ROLE_MEMBER_COUNTS[name] ?? 8,
}));

/** Users available in the editor picker. */
export const EDITOR_USER_OPTIONS: EditorUserOption[] = Array.from(
  new Set([...USERS, ...EXTRA_USER_NAMES]),
).map((name) => ({
  name,
  handle: nameToHandle(name),
  avatarSrc: avatarForName(name),
}));
