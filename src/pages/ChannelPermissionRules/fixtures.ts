import type { ChannelRule, PermissionItem, SystemCeilingPolicy } from './types';

// The two channel-scoped permission actions in MVP (P0-4 allow-list: file ops only).
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

// The channel's own permission rules (the units being authored).
export const STARTER_RULES: ChannelRule[] = [
  {
    id: 'r1',
    name: 'Cleared engineers',
    role: 'channel_user',
    matchMode: 'all',
    conditions: [
      { id: 'c1', attribute: 'Clearance', operator: 'is', values: 'Secret' },
      {
        id: 'c2',
        attribute: 'Department',
        operator: 'is',
        values: 'Engineering',
      },
    ],
    permissions: [AVAILABLE_PERMISSIONS[0], AVAILABLE_PERMISSIONS[1]],
    status: 'active',
  },
  {
    id: 'r2',
    name: 'Program Artemis',
    role: 'channel_user',
    matchMode: 'all',
    conditions: [
      { id: 'c3', attribute: 'Program', operator: 'is', values: 'Artemis' },
    ],
    // Same role + action (download) as r1 → the two combine with OR.
    permissions: [AVAILABLE_PERMISSIONS[1]],
    status: 'active',
  },
  {
    id: 'r3',
    name: 'External liaisons',
    role: 'channel_guest',
    matchMode: 'all',
    conditions: [
      {
        id: 'c4',
        attribute: 'Organization',
        operator: 'is',
        values: 'Partner-X',
      },
    ],
    permissions: [AVAILABLE_PERMISSIONS[1]],
    status: 'active',
  },
];

// Read-only reference: system-scoped policies that constrain this channel (the ceiling).
export const SYSTEM_CEILING: SystemCeilingPolicy[] = [
  {
    name: 'File Downloads',
    role: 'Members and System Administrators',
    allows: ['Download files'],
  },
  {
    name: 'Baseline CUI',
    role: 'Guest Users',
    allows: ['Download files'],
  },
];

export const CHANNEL_NAME = 'Operation Aurora';
export const TEAM_NAME = 'DR Team';

// Used by the empty-state baseline line and the simulate stub.
export const CURRENT_ACCESS_SUMMARY = `everyone on ${TEAM_NAME}`;
