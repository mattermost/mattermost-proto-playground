/**
 * Program-Based Encryption (PBE) — Final Design V2 fixtures.
 * Ported from the source prototype with playground-aligned avatar paths.
 */
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarLukas from '@/assets/avatars/Lukas Meyer.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarLeila from '@/assets/avatars/Leila Haddad.png';
import avatarIsabella from '@/assets/avatars/Isabella Cruz.png';
import avatarAiko from '@/assets/avatars/Aiko Tan.png';
import avatarArjun from '@/assets/avatars/Arjun Patel.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarDarius from '@/assets/avatars/Darius Cole.png';
import avatarDavidL from '@/assets/avatars/David Liang.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarEthan from '@/assets/avatars/Ethan Brooks.png';

// ── Avatars (re-export grouped) ───────────────────────────────────────────
export const avatars = {
  jamesSmith: avatarLeonard,
  amandaChen: avatarSofia,
  robertWilliams: avatarMarco,
  sarahMitchell: avatarLeila,
  davidKim: avatarLukas,
  currentUser: avatarIsabella,
};

export const sidebarAvatars = {
  aikoTan: avatarAiko,
  arjunPatel: avatarArjun,
  danielOkoro: avatarDanielle,
  dariusCole: avatarDarius,
  davidLiang: avatarDavidL,
  emmaNovak: avatarEmma,
  ethanBrooks: avatarEthan,
};

// ── Messages ──────────────────────────────────────────────────────────────
export interface PBEMessage {
  id: string;
  avatarSrc: string;
  username: string;
  timestamp: string;
  text: string;
  isEM?: boolean;
}

export const pbeMessages: PBEMessage[] = [
  {
    id: 'msg-1',
    avatarSrc: avatars.jamesSmith,
    username: 'James Smith',
    timestamp: '09:14 AM',
    text: 'SITREP: Perimeter check complete. All sectors report nominal. Communications relay at FOB Echo is back online after the firmware update.',
    isEM: true,
  },
  {
    id: 'msg-2',
    avatarSrc: avatars.amandaChen,
    username: 'Amanda Chen',
    timestamp: '09:22 AM',
    text: 'Copy that. Logistics confirms the resupply convoy cleared checkpoint Bravo at 0845. ETA to staging area is 1400. All manifests verified against the latest requisition orders.',
  },
  {
    id: 'msg-3',
    avatarSrc: avatars.robertWilliams,
    username: 'Robert Williams',
    timestamp: '09:31 AM',
    text: '@James Smith Need authorization to proceed with Phase 2 of the network segmentation plan. Engineering has the hardware staged and ready. Waiting on your go/no-go.',
  },
  {
    id: 'msg-4',
    avatarSrc: avatars.jamesSmith,
    username: 'James Smith',
    timestamp: '09:35 AM',
    text: '@Robert Williams Approved. Proceed with Phase 2. Ensure all changes are logged in the change management tracker. I want a confirmation once the segments are live.',
    isEM: true,
  },
  {
    id: 'msg-5',
    avatarSrc: avatars.sarahMitchell,
    username: 'Sarah Mitchell',
    timestamp: '10:02 AM',
    text: 'Logistics update: supply chain routing through alternate corridor is confirmed. Manifests have been re-validated and forwarded to the staging depot. No delays expected on the current timeline.',
  },
  {
    id: 'msg-6',
    avatarSrc: avatars.davidKim,
    username: 'David Kim',
    timestamp: '10:15 AM',
    text: 'Intel brief from the 0800 cycle is ready for review. Key takeaway: pattern-of-life analysis indicates increased activity in sector 7. Recommend updating watch schedule accordingly.',
  },
];

export const systemMessage =
  'You were added to this channel by J. Smith (Encryption Manager)';

// ── Configuration / Encryption metadata ───────────────────────────────────
export const encryptionMeta = {
  status: 'Active',
  keyManager: 'PKCS#11',
  keyId: 'DEK-a3f9c7e2',
  created: '2026-01-15',
  lastRotation: '2026-04-01',
  algorithm: 'AES-256-GCM',
  nextRotation: '2026-07-01',
};

export const encryptionManager = {
  name: 'J. Smith',
  fullName: 'James Smith',
  role: 'Encryption Manager',
  avatarSrc: avatars.jamesSmith,
};

export interface ConfigurationData {
  id: string;
  name: string;
  libraryPath: string;
  slotId: string;
  tokenLabel: string;
  pin: string;
  kekLabel: string;
  leaseDuration: number;
  status: 'connected' | 'disconnected' | 'error';
  channelCount: number;
  channels: string[];
}

export const singleConfig: ConfigurationData = {
  id: 'cfg-1',
  name: 'Program Alpha',
  libraryPath: '/opt/homebrew/lib/softhsm/libsofthsm2.so',
  slotId: '1',
  tokenLabel: 'pbe-dev',
  pin: 'secretpin',
  kekLabel: 'pbe-kek-dev',
  leaseDuration: 60,
  status: 'connected',
  channelCount: 2,
  channels: ['operations-alpha', 'project-midnight'],
};

// ── Channel members ──────────────────────────────────────────────────────
export type MemberRole = 'Encryption Manager' | 'Member';

export const channelMembers: {
  name: string;
  role: MemberRole;
  avatarSrc: string;
  online: boolean;
}[] = [
  {
    name: 'James Smith',
    role: 'Encryption Manager',
    avatarSrc: avatars.jamesSmith,
    online: true,
  },
  {
    name: 'Amanda Chen',
    role: 'Member',
    avatarSrc: avatars.amandaChen,
    online: true,
  },
  {
    name: 'Robert Williams',
    role: 'Member',
    avatarSrc: avatars.robertWilliams,
    online: false,
  },
  {
    name: 'Sarah Mitchell',
    role: 'Member',
    avatarSrc: avatars.sarahMitchell,
    online: true,
  },
  {
    name: 'David Kim',
    role: 'Member',
    avatarSrc: avatars.davidKim,
    online: false,
  },
];

export const eligibleEMs = [
  { name: 'James Smith', avatarSrc: avatars.jamesSmith },
  { name: 'Amanda Chen', avatarSrc: avatars.amandaChen },
  { name: 'Robert Williams', avatarSrc: avatars.robertWilliams },
];

// ── Team sidebar teams ───────────────────────────────────────────────────
export const teams = [
  { id: 'contributors', name: 'Contributors', initials: 'Co' },
  { id: 'support', name: 'Support', initials: 'Su' },
];
