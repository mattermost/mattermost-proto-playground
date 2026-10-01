// [AI DRAFT] DM/GM Attribute-Based Action Controls — shared fixtures.
//
// One cast for every scene in both directions. Names and programs are
// invented; none collides with the Access Channel prototype's cast (Aiko Tan,
// Arjun Patel, Marco Rinaldi, Sofia Bauer, Leonard Riley, "Watch leads").
// Photos are matched to invented names; file names are the asset library's own labels.
import avatarRyan from '@/assets/avatars/Danielle Okoro.png';
import avatarDarius from '@/assets/avatars/Darius Cole.png';
import avatarDavid from '@/assets/avatars/David Liang.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarEthan from '@/assets/avatars/Ethan Brooks.png';
import avatarIsabella from '@/assets/avatars/Isabella Cruz.png';
import avatarLeila from '@/assets/avatars/Leila Haddad.png';
import avatarLukas from '@/assets/avatars/Lukas Meyer.png';

/* ------------------------------------------------------------------ */
/* Attributes                                                          */
/* ------------------------------------------------------------------ */

/** Two invented programs. Neither is a real program name. */
export const PROGRAM_A = 'Ashgrove';
export const PROGRAM_B = 'Corvane';

export type UserAttributeKey =
  'Program' | 'Employment type' | 'Position' | 'Organization';
export type SessionAttributeKey = 'Network' | 'Device';
export type AttributeKey = UserAttributeKey | SessionAttributeKey;

/** User attributes configured on this deployment (System Attributes > User Attributes). */
export const USER_ATTRIBUTES: Record<UserAttributeKey, string[]> = {
  Program: [PROGRAM_A, PROGRAM_B],
  'Employment type': ['Government civilian', 'Military', 'Contractor'],
  Position: ['Program lead', 'Engineer', 'Analyst', 'Logistics officer'],
  Organization: ['Program Office', 'Test Wing', 'Sustainment Group'],
};

/** Session attributes from Environmental Attributes. Acting user only. */
export const SESSION_ATTRIBUTES: Record<SessionAttributeKey, string[]> = {
  Network: ['Trusted', 'Public'],
  Device: ['Managed', 'Unmanaged'],
};

export function isSessionAttribute(
  key: AttributeKey,
): key is SessionAttributeKey {
  return key === 'Network' || key === 'Device';
}

export function valuesFor(key: AttributeKey): string[] {
  return isSessionAttribute(key)
    ? SESSION_ATTRIBUTES[key]
    : USER_ATTRIBUTES[key];
}

/* ------------------------------------------------------------------ */
/* Per-server attribute inventories (Direction B rule generation)      */
/* ------------------------------------------------------------------ */

export type AttributeFieldType = 'select' | 'multiselect' | 'text';

export interface InventoryAttribute {
  name: string;
  source: 'user' | 'session';
  type: AttributeFieldType;
  values: string[];
  /** Marks a user attribute that groups people (a program, an organization). */
  groupsPeople?: boolean;
}

export type InventoryId = 'full' | 'user' | 'program' | 'none';

function userAttr(
  name: UserAttributeKey,
  groupsPeople = false,
): InventoryAttribute {
  return {
    name,
    source: 'user',
    type: 'select',
    values: USER_ATTRIBUTES[name],
    groupsPeople,
  };
}

function sessionAttr(name: SessionAttributeKey): InventoryAttribute {
  return {
    name,
    source: 'session',
    type: 'select',
    values: SESSION_ATTRIBUTES[name],
  };
}

/**
 * Demo stand-ins for "this server's attributes at this moment". The reviewer
 * switches between them above the frame to see the starting rules change.
 */
export const ATTRIBUTE_INVENTORIES: Record<
  InventoryId,
  { label: string; attributes: InventoryAttribute[] }
> = {
  full: {
    label: 'Fully set up',
    attributes: [
      userAttr('Program', true),
      userAttr('Organization', true),
      userAttr('Employment type'),
      userAttr('Position'),
      sessionAttr('Network'),
      sessionAttr('Device'),
    ],
  },
  user: {
    label: 'User attributes only',
    attributes: [
      userAttr('Program', true),
      userAttr('Organization', true),
      userAttr('Employment type'),
      userAttr('Position'),
    ],
  },
  program: {
    label: 'Program only',
    attributes: [userAttr('Program', true)],
  },
  none: {
    label: 'No matching attributes',
    attributes: [
      { name: 'Building', source: 'user', type: 'text', values: [] },
    ],
  },
};

export const DEFAULT_INVENTORY: InventoryId = 'full';

export function inventoryFromParam(value: string | null): InventoryId {
  return value === 'full' ||
    value === 'user' ||
    value === 'program' ||
    value === 'none'
    ? value
    : DEFAULT_INVENTORY;
}

/* ------------------------------------------------------------------ */
/* People                                                              */
/* ------------------------------------------------------------------ */

export type PersonKind = 'user' | 'bot' | 'remote';

export interface Person {
  id: string;
  name: string;
  username: string;
  avatarSrc?: string;
  kind: PersonKind;
  title: string;
  /** Local user attributes. Bots and remote users hold none. */
  attributes: Partial<Record<UserAttributeKey, string>>;
  /** Connected-server display name, for remote users. */
  remoteServer?: string;
}

export const DARIUS: Person = {
  id: 'darius',
  name: 'Darius Cole',
  username: 'darius.cole',
  avatarSrc: avatarDarius,
  kind: 'user',
  title: 'Systems engineer',
  attributes: {
    Program: PROGRAM_A,
    'Employment type': 'Contractor',
    Position: 'Engineer',
    Organization: 'Test Wing',
  },
};

export const ISABELLA: Person = {
  id: 'isabella',
  name: 'Isabella Cruz',
  username: 'isabella.cruz',
  avatarSrc: avatarIsabella,
  kind: 'user',
  title: 'Program lead, Ashgrove',
  attributes: {
    Program: PROGRAM_A,
    'Employment type': 'Government civilian',
    Position: 'Program lead',
    Organization: 'Program Office',
  },
};

export const DAVID: Person = {
  id: 'david',
  name: 'David Liang',
  username: 'david.liang',
  avatarSrc: avatarDavid,
  kind: 'user',
  title: 'Flight test analyst',
  attributes: {
    Program: PROGRAM_A,
    'Employment type': 'Military',
    Position: 'Analyst',
    Organization: 'Test Wing',
  },
};

export const EMMA: Person = {
  id: 'emma',
  name: 'Emma Novak',
  username: 'emma.novak',
  avatarSrc: avatarEmma,
  kind: 'user',
  title: 'Requirements analyst',
  attributes: {
    Program: PROGRAM_B,
    'Employment type': 'Government civilian',
    Position: 'Analyst',
    Organization: 'Program Office',
  },
};

export const RYAN: Person = {
  id: 'ryan',
  name: 'Ryan Park',
  username: 'ryan.park',
  avatarSrc: avatarRyan,
  kind: 'user',
  title: 'Program lead, Corvane',
  attributes: {
    Program: PROGRAM_B,
    'Employment type': 'Military',
    Position: 'Program lead',
    Organization: 'Program Office',
  },
};

export const ETHAN: Person = {
  id: 'ethan',
  name: 'Ethan Brooks',
  username: 'ethan.brooks',
  avatarSrc: avatarEthan,
  kind: 'user',
  title: 'Logistics officer',
  attributes: {
    Program: PROGRAM_A,
    'Employment type': 'Contractor',
    Position: 'Logistics officer',
    Organization: 'Sustainment Group',
  },
};

/** A user from a connected server. No attributes are held locally. */
export const LEILA: Person = {
  id: 'leila',
  name: 'Leila Haddad',
  username: 'leila.haddad',
  avatarSrc: avatarLeila,
  kind: 'remote',
  title: 'Depot liaison',
  attributes: {},
  remoteServer: 'Sustainment Depot',
};

/** An integration bot that posts readiness alerts. It holds no user attributes. */
export const READINESS_BOT: Person = {
  id: 'readiness-bot',
  name: 'Readiness Alerts',
  username: 'readiness-alerts',
  kind: 'bot',
  title: 'Integration bot',
  attributes: {},
};

/** System Console admin for the authoring scenes. */
export const ADMIN = {
  name: 'Lukas Meyer',
  username: 'lukas.meyer',
  avatarSrc: avatarLukas,
};

export const PEOPLE: Person[] = [
  DARIUS,
  ISABELLA,
  DAVID,
  EMMA,
  RYAN,
  ETHAN,
  LEILA,
  READINESS_BOT,
];

export function personById(id: string): Person {
  const found = PEOPLE.find((p) => p.id === id);
  if (!found) {
    throw new Error(`Unknown person: ${id}`);
  }
  return found;
}

/** The signed-in end user for every end-user scene. */
export const VIEWER = DARIUS;
