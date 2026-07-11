// ─────────────────────────────────────────────────────────────────────────────
// Channel Attributes & Smart Labeling — shared mock data model
//
// #1 CORRECTNESS REQUIREMENT (FR-27/FR-28, NFR-SEC-1/3, brief §7):
// Masking is modeled as a SERVER-PRE-FILTERED PAYLOAD PER VIEWER ROLE. The UI
// renders ONLY what is present in the payload it is handed. The `+N` overflow
// count and popover list derive ONLY from the filtered payload. There is no
// total-minus-shown arithmetic and no client-side filter anywhere in this scene.
//
// Two viewer payloads are provided for the same channel:
//   • CLEARED_VIEWER_PAYLOAD   — a viewer cleared for every attribute value.
//   • UNCLEARED_VIEWER_PAYLOAD — a viewer cleared for Classification only
//                                (Programs + the NOFORN Handling caveat are
//                                absent from the payload — no trace).
// ─────────────────────────────────────────────────────────────────────────────

// ── Classification color scheme (Astro UX DS / CAPCO, per C-1, C-2, NFR-A11Y-2)
// Text color is prescribed per level: TOP SECRET orange and TS//SCI yellow use
// BLACK text (WCAG 1.4.3); SECRET red / CONFIDENTIAL blue / UNCLASSIFIED green /
// CUI purple use WHITE text.
export type ClassificationLevel =
  | 'UNCLASSIFIED'
  | 'CUI'
  | 'CONFIDENTIAL'
  | 'SECRET'
  | 'TOP SECRET'
  | 'TS//SCI';

export interface ClassificationStyle {
  bg: string;
  fg: string;
  /** Numeric rank — used ONLY for the display-only channel-vs-global comparison (FR-25/V6). */
  rank: number;
}

export const CLASSIFICATION_STYLES: Record<ClassificationLevel, ClassificationStyle> = {
  UNCLASSIFIED: { bg: '#007a33', fg: '#ffffff', rank: 0 },
  CUI: { bg: '#502b85', fg: '#ffffff', rank: 1 },
  CONFIDENTIAL: { bg: '#0033a0', fg: '#ffffff', rank: 2 },
  SECRET: { bg: '#c8102e', fg: '#ffffff', rank: 3 },
  'TOP SECRET': { bg: '#ff8c00', fg: '#000000', rank: 4 },
  'TS//SCI': { bg: '#fce83a', fg: '#000000', rank: 5 },
};

// ── CAPCO portion-mark abbreviations (per DoDM 5200.01 Vol 2 / CAPCO Register)
// The compact abbreviated rendering used by propagation-surface pills where a
// full-word label would crowd out the channel name. Color is unchanged (still
// carried on every render — WCAG 1.4.1); only the TEXT differs. In abbreviated
// mode a native tooltip carries the full term for disambiguation.
export const CLASSIFICATION_ABBREV: Record<ClassificationLevel, string> = {
  UNCLASSIFIED: 'U',
  CUI: 'CUI',
  CONFIDENTIAL: 'C',
  SECRET: 'S',
  'TOP SECRET': 'TS',
  'TS//SCI': 'TS//SCI',
};

// ── Attribute catalog (System-Console-defined; channel admins never author it)
export type AttributeType = 'classification' | 'multi-select' | 'single-select';
export type AttributeMutability = 'editable' | 'locked'; // V3 per-attribute config
export type DisplayLocation = 'header' | 'banner' | 'sidebar';

export interface CatalogAttribute {
  id: string;
  /** System-wide display name (rename lives in System Console per V2 — not here). */
  name: string;
  type: AttributeType;
  mandatory: boolean;
  mutability: AttributeMutability;
  /** System-wide default DISPLAY IN locations. Channel admin overrides LOCATION only. */
  displayIn: DisplayLocation[];
  /** Whether the system marks this attribute mandatory-to-display (override cannot suppress). */
  displayMandatory: boolean;
  /** Full option list the attribute CAN take — for reference only; pickers use the
   *  clearance-scoped option list handed to the client, not this. */
  options?: string[];
}

// Full catalog — exercises every data shape (locked decision #2).
export const CATALOG: CatalogAttribute[] = [
  {
    id: 'classification',
    name: 'Classification',
    type: 'classification',
    mandatory: true,
    mutability: 'locked', // governed change + audit (FR-10/11/12)
    displayIn: ['header', 'banner', 'sidebar'],
    displayMandatory: true,
    options: ['UNCLASSIFIED', 'CUI', 'CONFIDENTIAL', 'SECRET', 'TOP SECRET', 'TS//SCI'],
  },
  {
    id: 'programs',
    name: 'Programs',
    type: 'multi-select',
    mandatory: false,
    mutability: 'editable',
    displayIn: ['header', 'sidebar'],
    displayMandatory: false,
    options: ['Orion', 'Dragon Spacecraft', 'Artemis'],
  },
  {
    id: 'handling',
    name: 'Handling',
    type: 'multi-select',
    mandatory: true,
    mutability: 'editable',
    displayIn: ['banner', 'sidebar'],
    displayMandatory: true,
    options: ['NOFORN', 'ORCON', 'PROPIN'],
  },
  {
    id: 'mission_tag',
    name: 'Mission tag',
    type: 'single-select',
    mandatory: false,
    mutability: 'editable',
    displayIn: ['sidebar'],
    displayMandatory: false,
    options: ['Active', 'Inactive', 'Planning'],
  },
  {
    id: 'department',
    name: 'Department',
    type: 'single-select',
    mandatory: false,
    mutability: 'editable',
    displayIn: ['header', 'sidebar'],
    displayMandatory: false,
    options: ['Operations', 'Intelligence', 'Logistics'],
  },
  {
    id: 'location',
    name: 'Location',
    type: 'single-select',
    mandatory: false,
    mutability: 'editable',
    displayIn: ['sidebar'],
    displayMandatory: false,
    options: ['CONUS', 'OCONUS', 'Forward'],
  },
  {
    id: 'duty_status',
    name: 'Duty status',
    type: 'single-select',
    mandatory: false,
    mutability: 'editable',
    displayIn: ['sidebar'],
    displayMandatory: false,
    options: ['On watch', 'Off watch'],
  },
];

export function catalogById(id: string): CatalogAttribute {
  const found = CATALOG.find((a) => a.id === id);
  if (!found) throw new Error(`Unknown attribute id: ${id}`);
  return found;
}

// ── The server-filtered payload the client receives ──────────────────────────
// A payload value is an attribute the viewer IS cleared for. Values the viewer is
// NOT cleared for are ABSENT — there is no `viewable:false` and no sentinel.
export interface PayloadValue {
  attributeId: string;
  /** Resolved value(s). Classification is a single level; multi/single-selects list values. */
  values: string[];
}

export interface ChannelAttributePayload {
  channelId: string;
  channelName: string;
  values: PayloadValue[];
  /**
   * B1-only, Handling-only signal computed AND authorized BY THE SERVER: true when
   * this viewer holds the classification but the server withheld a Handling caveat
   * they lack. Carries NO value and NO count (FR-30, V7-B1). Never set for Programs.
   * Absent/false in the cleared payload and in every B3 rendering.
   */
  handlingRestrictionWithheld?: boolean;
}

// Base channel identity shared across viewers.
export const CHANNEL_ID = 'operation-aurora';
export const CHANNEL_NAME = 'Operation Aurora';

// Cleared viewer: sees Classification SECRET, Programs (Orion, Dragon Spacecraft),
// Handling NOFORN, Mission tag Active, Department Intelligence.
export const CLEARED_VIEWER_PAYLOAD: ChannelAttributePayload = {
  channelId: CHANNEL_ID,
  channelName: CHANNEL_NAME,
  values: [
    { attributeId: 'classification', values: ['SECRET'] },
    { attributeId: 'programs', values: ['Orion', 'Dragon Spacecraft'] },
    { attributeId: 'handling', values: ['NOFORN'] },
    { attributeId: 'mission_tag', values: ['Active'] },
    { attributeId: 'department', values: ['Intelligence'] },
  ],
};

// Uncleared viewer: server returned Classification only. Programs and the NOFORN
// Handling caveat are ABSENT from the payload. No count, no trace.
export const UNCLEARED_VIEWER_PAYLOAD_B1: ChannelAttributePayload = {
  channelId: CHANNEL_ID,
  channelName: CHANNEL_NAME,
  values: [{ attributeId: 'classification', values: ['SECRET'] }],
  // B1 fork: server authorizes the generic Handling indicator (no value, no count).
  handlingRestrictionWithheld: true,
};

export const UNCLEARED_VIEWER_PAYLOAD_B3: ChannelAttributePayload = {
  channelId: CHANNEL_ID,
  channelName: CHANNEL_NAME,
  values: [{ attributeId: 'classification', values: ['SECRET'] }],
  // B3 fork: full omission. No indicator whatsoever.
};

// ── Derivation helpers — all operate ONLY on the payload handed in ────────────

export function payloadValue(
  payload: ChannelAttributePayload,
  attributeId: string,
): string[] | undefined {
  return payload.values.find((v) => v.attributeId === attributeId)?.values;
}

export function classificationOf(payload: ChannelAttributePayload): ClassificationLevel | undefined {
  const v = payloadValue(payload, 'classification');
  return v?.[0] as ClassificationLevel | undefined;
}

/** Attributes flagged for a given display location AND present in this payload. */
export function payloadAttributesForLocation(
  payload: ChannelAttributePayload,
  location: DisplayLocation,
  overrides?: DisplayOverrides,
): { attr: CatalogAttribute; values: string[] }[] {
  return payload.values
    .map((pv) => ({ attr: catalogById(pv.attributeId), values: pv.values }))
    .filter(({ attr }) => resolvedDisplayIn(attr, overrides).includes(location));
}

// ── Per-channel display overrides (V2: LOCATION only, never rename) ───────────
// key = attributeId, value = the override location set for THIS channel.
export type DisplayOverrides = Record<string, DisplayLocation[]>;

export function resolvedDisplayIn(
  attr: CatalogAttribute,
  overrides?: DisplayOverrides,
): DisplayLocation[] {
  const override = overrides?.[attr.id];
  if (!override) return attr.displayIn;
  // FR-15: a mandatory-display attribute's mandatory locations cannot be suppressed.
  if (attr.displayMandatory) {
    const merged = new Set<DisplayLocation>(override);
    attr.displayIn.forEach((loc) => merged.add(loc));
    return Array.from(merged);
  }
  return override;
}

// ── CAPCO banner string composition (FR-24, C-9) ─────────────────────────────
// Composes Classification // Handling // (other banner-flagged) from the payload
// ONLY. Program is never banner-flagged, so it never appears here.
export function composeBannerString(
  payload: ChannelAttributePayload,
  overrides?: DisplayOverrides,
): string {
  const classification = classificationOf(payload);
  if (!classification) return '';
  const parts: string[] = [classification];
  const bannerAttrs = payloadAttributesForLocation(payload, 'banner', overrides).filter(
    (e) => e.attr.id !== 'classification',
  );
  bannerAttrs.forEach(({ values }) => parts.push(...values));
  return parts.join('//');
}

// ── Global classification band (existing Classification Markings feature) ─────
export interface GlobalBandState {
  active: boolean;
  level: ClassificationLevel;
}

// ── Fixture: clearance-scoped picker option lists (server-scoped, FR-5/FR-13) ─
// The admin in these scenes holds up to SECRET and holds Orion, Dragon Spacecraft
// (not Artemis). TOP SECRET / TS//SCI and Artemis are ABSENT — no hidden count.
export const ADMIN_CLASSIFICATION_OPTIONS: ClassificationLevel[] = [
  'UNCLASSIFIED',
  'CUI',
  'CONFIDENTIAL',
  'SECRET',
];
export const ADMIN_PROGRAM_OPTIONS = ['Orion', 'Dragon Spacecraft'];
export const ADMIN_HANDLING_OPTIONS = ['NOFORN', 'ORCON', 'PROPIN'];

// Realistic demo people (no "User 1" placeholders).
export const DEMO_ACTOR = {
  displayName: 'Leonard Riley',
  username: 'lriley',
};
