import type { ChannelRule, PermissionItem, SystemCeilingPolicy } from './types';

export const AVAILABLE_PERMISSIONS: PermissionItem[] = [
  {
    key: 'upload_file',
    label: 'Upload files',
    description: 'Allow users to upload files while sending a message',
  },
  {
    key: 'download_file',
    label: 'Download files',
    description: 'Allow users to view and download files in this channel',
  },
];

export const AVAILABLE_ATTRIBUTES = [
  'Clearance',
  'Program',
  'Department',
  'Device type',
  'Organization',
];

export const OPERATORS = ['is', 'is not', 'in', 'starts with', 'ends with'];

// Seeded so the "any of N rules" combination is visible: r1 and r2 both grant
// Download to Channel members → the effective-access summary shows them OR'd.
export const STARTER_RULES: ChannelRule[] = [
  {
    id: 'r1',
    name: 'Cleared engineers',
    role: 'channel_user',
    matchMode: 'all',
    conditions: [
      { id: 'c1', attribute: 'Clearance', operator: 'is', values: 'Secret' },
      { id: 'c2', attribute: 'Department', operator: 'is', values: 'Engineering' },
    ],
    permissions: [AVAILABLE_PERMISSIONS[0], AVAILABLE_PERMISSIONS[1]],
    status: 'active',
  },
  {
    id: 'r2',
    name: 'Program Artemis',
    role: 'channel_user',
    matchMode: 'all',
    conditions: [{ id: 'c3', attribute: 'Program', operator: 'is', values: 'Artemis' }],
    permissions: [AVAILABLE_PERMISSIONS[1]],
    status: 'active',
  },
  {
    id: 'r3',
    name: 'External liaisons',
    role: 'channel_guest',
    matchMode: 'all',
    conditions: [{ id: 'c4', attribute: 'Organization', operator: 'is', values: 'Partner-X' }],
    permissions: [AVAILABLE_PERMISSIONS[1]],
    status: 'active',
  },
];

export const SYSTEM_CEILING: SystemCeilingPolicy[] = [
  { name: 'File Downloads', role: 'Members and System Administrators', allows: ['Download files'] },
  { name: 'Baseline CUI', role: 'Guest Users', allows: ['Download files'] },
];

export const CHANNEL_NAME = 'Operation Aurora';
export const TEAM_NAME = 'DR Team';
export const CURRENT_ACCESS_SUMMARY = `everyone on ${TEAM_NAME}`;

// Which permission keys the system ceiling allows (anything not here is capped to deny).
export const CEILING_ALLOWED_KEYS = new Set<string>(['download_file']);
