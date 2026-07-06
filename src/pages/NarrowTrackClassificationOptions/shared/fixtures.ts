// Shared, realistic fixtures used identically across approaches A/B/C so
// stakeholders compare like-for-like (Q5 shared fixtures). No customer names;
// no placeholder text. Uses the shared classification scale (FR-8).

import type {
  ClassificationLevel,
  DemoChannel,
  DemoUser,
  ProvenanceSource,
} from './types';

import avatarAiko from '@/assets/avatars/Aiko Tan.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarDavid from '@/assets/avatars/David Liang.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';
import avatarArjun from '@/assets/avatars/Arjun Patel.png';
import avatarDarius from '@/assets/avatars/Darius Cole.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';

// Ranked shared scale — both channel classification and user clearance draw
// from this single ordering (FR-8 shared-scale inheritance / fail-safe).
export const CLASSIFICATION_SCALE: ClassificationLevel[] = [
  { id: 'unclassified', label: 'Unclassified', rank: 0 },
  { id: 'cui', label: 'CUI', rank: 1 },
  { id: 'confidential', label: 'Confidential', rank: 2, disabledForNew: true },
  { id: 'secret', label: 'Secret', rank: 3 },
  { id: 'top-secret', label: 'Top Secret', rank: 4 },
];

export const SERVER_CEILING_ID = 'secret';
export const TEAM_CEILING_ID = 'secret';

export function levelById(id: string | null): ClassificationLevel | undefined {
  if (id == null) return undefined;
  return CLASSIFICATION_SCALE.find((l) => l.id === id);
}

// Externally-managed provenance sources. V-1 is held as co-equal dual
// provenance — no primary committed (FR-1). The "note" strings read as plausible
// product microcopy for the lock indicator, not as spec annotations.
export const PROVENANCE_SOURCES: ProvenanceSource[] = [
  {
    id: 'uas',
    label: 'UAS attribute sync',
    managedNote: 'Managed by UAS attribute sync',
  },
  {
    id: 'ldap-saml',
    label: 'LDAP / SAML',
    managedNote: 'Managed by LDAP / SAML',
  },
];

export const DEMO_ADMIN = {
  name: 'Leonard Riley',
  username: 'leonard.riley',
  avatar: avatarLeonard,
};

export const DEMO_USERS: DemoUser[] = [
  { id: 'aiko', name: 'Aiko Tan', avatar: avatarAiko, clearanceLevelId: 'secret', provenanceId: 'uas' },
  { id: 'marco', name: 'Marco Rinaldi', avatar: avatarMarco, clearanceLevelId: 'confidential', provenanceId: 'ldap-saml' },
  { id: 'emma', name: 'Emma Novak', avatar: avatarEmma, clearanceLevelId: 'cui', provenanceId: 'uas' },
  { id: 'david', name: 'David Liang', avatar: avatarDavid, clearanceLevelId: null, provenanceId: 'ldap-saml' },
  { id: 'sofia', name: 'Sofia Bauer', avatar: avatarSofia, clearanceLevelId: 'secret', provenanceId: 'uas' },
  { id: 'arjun', name: 'Arjun Patel', avatar: avatarArjun, clearanceLevelId: 'cui', provenanceId: 'ldap-saml' },
  { id: 'darius', name: 'Darius Cole', avatar: avatarDarius, clearanceLevelId: 'top-secret', provenanceId: 'uas' },
];

export const DEMO_CHANNELS: DemoChannel[] = [
  { id: 'ops-planning', name: 'Ops Planning', private: true, classificationLevelId: 'secret' },
  { id: 'intel-brief', name: 'Intel Brief', private: true, classificationLevelId: 'secret' },
  { id: 'logistics', name: 'Logistics Coordination', private: false, classificationLevelId: 'cui' },
  { id: 'mission-alpha', name: 'Mission Alpha', private: true, classificationLevelId: 'confidential' },
  { id: 'general', name: 'General', private: false, classificationLevelId: null },
  { id: 'announcements', name: 'Announcements', private: false, classificationLevelId: null },
  { id: 'watercooler', name: 'Water Cooler', private: false, classificationLevelId: null },
];

// SM-2 coverage figures derived from the fixtures (classified channels covered
// by an active policy). Used by Approach A's inline coverage readout and by the
// harness notes. Kept in one place so the number is consistent.
export const COVERAGE = {
  classifiedChannels: DEMO_CHANNELS.filter((c) => {
    const lvl = levelById(c.classificationLevelId);
    return lvl != null && lvl.rank >= 1; // CUI and above
  }).length,
  unclassifiedChannels: DEMO_CHANNELS.filter((c) => c.classificationLevelId == null).length,
};

// The single policy expression authored on Surface 2, shown verbatim in the
// builder across all approaches.
export const POLICY_EXPRESSION = 'user.clearance >= channel.classification';

// The user removed by continuous re-evaluation on Surface 5 (clearance dropped
// below the channel's classification). Shared across approaches so the removal
// notice reads identically apart from the approach's presentation.
export const REMOVAL_EVENT = {
  channel: DEMO_CHANNELS[1], // Intel Brief · Secret
  user: DEMO_USERS[3], // David Liang · lost clearance
  requiredLevelId: 'secret',
  cause: 'Your clearance was updated and no longer meets this channel’s access requirement.',
};

export const ROLE_DELEGATES = [
  { id: 'aiko', name: 'Aiko Tan', avatar: avatarAiko, role: 'Channel Attribute Manager' },
  { id: 'marco', name: 'Marco Rinaldi', avatar: avatarMarco, role: 'User Attribute Manager' },
  { id: 'sofia', name: 'Sofia Bauer', avatar: avatarSofia, role: 'Security Officer (read-only)' },
];
