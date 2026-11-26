// [AI DRAFT] Permission registry with party bindings (ideation 04 §1.1).
//
// Each permission declares which parties it supplies to a rule. This is the
// extension point: a future action ("mention", "add member") is one more row
// here, and a future party one more column; the editor offers the right
// parties without new UI.
//
// Labels: the v1 handoff wording (designer, 2026-10-08), the shipped file
// permissions, and one new draft row, "Upload Files to Direct and Group
// Messages" (P-3): the Files-group Upload Files also covers channels, where
// there is no recipient.
import { PICKER } from '../copy';
import { RESOURCE_KINDS, type PartyId } from './catalog';

export type PermissionId =
  | 'file_download'
  | 'file_upload'
  | 'channel_read'
  | 'channel_write'
  | 'channel_manage'
  | 'dm_create'
  | 'dm_read'
  | 'dm_write'
  | 'dm_upload';

export interface PermissionDef {
  id: PermissionId;
  group: 'files' | 'channels' | 'dms';
  label: string;
  description: string;
  /** Short verb phrase for readback sentences. */
  verb: string;
  /** Parties this action supplies to rules. User and session always exist. */
  supplies: PartyId[];
  /** Draft, not shipped: shown with a reviewer note. */
  draft?: boolean;
}

export const PERMISSIONS: PermissionDef[] = [
  {
    id: 'file_download',
    group: 'files',
    label: 'Download Files',
    description: 'Allow users to download files to their device',
    verb: 'download files',
    supplies: ['file', 'channel'],
  },
  {
    id: 'file_upload',
    group: 'files',
    label: 'Upload Files',
    description: 'Allow users to upload files while sending a message',
    verb: 'upload files',
    supplies: ['file', 'channel'],
  },
  {
    id: 'channel_read',
    group: 'channels',
    label: 'Read Channel Messages',
    description: 'Allow users to see the channel and read its messages',
    verb: 'read channel messages',
    supplies: ['channel', 'team'],
  },
  {
    id: 'channel_write',
    group: 'channels',
    label: 'Write Channel Messages',
    description:
      'Allow users to post, reply, react, and edit or delete their own messages. Requires Read Channel Messages.',
    verb: 'write channel messages',
    supplies: ['channel', 'post', 'team'],
  },
  {
    id: 'channel_manage',
    group: 'channels',
    label: 'Manage Channel',
    description:
      "Allow users to change the channel's settings, bookmarks, and members, and moderate others' messages. Requires Read Channel Messages.",
    verb: 'manage channels',
    supplies: ['channel', 'team'],
  },
  {
    id: 'dm_create',
    group: 'dms',
    label: 'Create New Direct and Group Messages',
    description:
      'Allow users to create new direct and group messages. Requires Read Direct and Group Messages.',
    verb: 'create new',
    supplies: ['recipient', 'dm'],
  },
  {
    id: 'dm_read',
    group: 'dms',
    label: 'Read Direct and Group Messages',
    description:
      'Allow users to read direct and group messages and their content',
    verb: 'read',
    supplies: ['recipient', 'dm'],
  },
  {
    id: 'dm_write',
    group: 'dms',
    label: 'Write to Direct and Group Messages',
    description:
      'Allow users to post in direct and group messages and change their content. Requires Read Direct and Group Messages.',
    verb: 'write to',
    supplies: ['recipient', 'dm', 'post'],
  },
  {
    id: 'dm_upload',
    group: 'dms',
    label: 'Upload Files to Direct and Group Messages',
    description:
      'Allow users to share files in direct and group messages. Requires Write to Direct and Group Messages.',
    verb: 'upload files to',
    supplies: ['recipient', 'dm', 'file'],
    draft: true,
  },
];

export const PERMISSION_GROUPS: { id: PermissionDef['group']; label: string }[] =
  [
    { id: 'files', label: 'Files' },
    { id: 'channels', label: 'Channels' },
    { id: 'dms', label: 'Direct and Group Messages' },
  ];

export function permissionDef(id: PermissionId): PermissionDef {
  const found = PERMISSIONS.find((p) => p.id === id);
  if (!found) {
    throw new Error(`Unknown permission ${id}`);
  }
  return found;
}

export function supplies(id: PermissionId, party: PartyId): boolean {
  return (
    party === 'user' ||
    party === 'session' ||
    permissionDef(id).supplies.includes(party)
  );
}

/** Where the action happens: a direct or group message, or a channel (M3). */
export function placeOf(id: PermissionId): 'dm' | 'channel' {
  return permissionDef(id).supplies.includes('dm') ? 'dm' : 'channel';
}

const GROUP_NOUN: Record<PermissionDef['group'], string> = {
  files: 'file',
  channels: 'channel',
  dms: 'direct and group message',
};

/**
 * The permissions a party's rules work with, in words (round 2, M5): whole
 * groups by name ("direct and group message permissions"), single
 * permissions by label.
 */
export function worksWith(party: PartyId): string {
  const whole: string[] = [];
  const single: string[] = [];
  for (const g of Object.keys(GROUP_NOUN) as PermissionDef['group'][]) {
    const inGroup = PERMISSIONS.filter((p) => p.group === g);
    const fits = inGroup.filter((p) => supplies(p.id, party));
    if (fits.length === inGroup.length) whole.push(GROUP_NOUN[g]);
    else single.push(...fits.map((p) => p.label));
  }
  const and = (xs: string[]) =>
    xs.length <= 2 ? xs.join(' and ') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`;
  const parts = [...(whole.length ? [`${and(whole)} permissions`] : []), ...single];
  return and(parts);
}

export type ResourceMode = 'permission' | 'per-rule';

export type PartyStatus =
  | { kind: 'available' }
  /** Grouped under "Not available" in menus, with the reason (feedback F8). */
  | { kind: 'unavailable'; reason: string };

export const ALL_PARTIES: PartyId[] = ['user', 'session', 'recipient', ...RESOURCE_KINDS];

/** Some permission can supply every one of these parties together. */
export function combinationSupported(parties: PartyId[]): boolean {
  return PERMISSIONS.some((p) => parties.every((x) => supplies(p.id, x)));
}

/** Permissions that could hold rules on all of these parties. */
export function permissionsFor(parties: PartyId[]): PermissionId[] {
  return PERMISSIONS.filter((p) => parties.every((x) => supplies(p.id, x))).map((p) => p.id);
}

/**
 * An empty policy is rules first (feedback F3): any attribute can be picked,
 * and the rules limit which permissions fit. Once permissions are chosen,
 * they narrow it too (round 2, M3): a party none of them can use is
 * unavailable. Either way the reason says what the party works with (M5).
 */
export function partyStatus(
  partiesInUse: PartyId[],
  party: PartyId,
  labelOf: (p: PartyId) => string,
  permissions: PermissionId[] = [],
): PartyStatus {
  if (party === 'user' || party === 'session') return { kind: 'available' };
  const unavailable: PartyStatus = {
    kind: 'unavailable',
    reason: PICKER.worksWith(labelOf(party), worksWith(party)),
  };
  if (permissions.length > 0 && !permissions.some((p) => supplies(p, party))) return unavailable;
  const others = partiesInUse.filter((p) => p !== party && p !== 'user' && p !== 'session');
  return combinationSupported([...others, party]) ? { kind: 'available' } : unavailable;
}

/** Parties a rule may use right now. */
export function availableParties(partiesInUse: PartyId[], permissions: PermissionId[] = []): PartyId[] {
  return ALL_PARTIES.filter(
    (p) => partyStatus(partiesInUse, p, String, permissions).kind === 'available',
  );
}

/** Parties already used by rules that `candidate` can't supply. */
export function conflictsFor(candidate: PermissionId, partiesInUse: PartyId[]): PartyId[] {
  return partiesInUse.filter((p) => !supplies(candidate, p));
}
