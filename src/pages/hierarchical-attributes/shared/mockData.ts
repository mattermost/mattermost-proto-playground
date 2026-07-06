import type { RankedSchema } from './types';

// Canonical DoDM 5200.01 Vol. 1 clearance schema per Phase 3 AC-1.3.
// 2026-05-22 sync lock: ranks are unique, explicit, and >= 1 — no ties.
//   Top Secret 4 · Secret 3 · Confidential 2 · Unclassified 1
// The `color` field on each value is retained for forward-compat with v1.1
// colors-revisit (RankedValueChip ignores it for v1.0).
export const CLEARANCE_SCHEMA: RankedSchema = {
  id: 'clearance-local',
  attributeName: 'Clearance',
  version: 4,
  source: 'local',
  values: [
    { id: 'ts', label: 'Top Secret', rank: 4, color: 'orange' },
    { id: 'secret', label: 'Secret', rank: 3, color: 'red' },
    { id: 'confidential', label: 'Confidential', rank: 2, color: 'blue' },
    { id: 'unclassified', label: 'Unclassified', rank: 1, color: 'green' },
  ],
};

// UAS-sourced ranked schema (read-only mirror) per Story 2 / FR-5 / FR-6.
// Unique ranks 5..1, no zero, no ties.
export const RANK_SCHEMA_UAS: RankedSchema = {
  id: 'rank-uas',
  attributeName: 'Coalition Rank',
  version: 7,
  source: 'uas',
  provenance: {
    pluginName: 'Jade UAS Connector',
    lastSyncRelative: '5m ago',
    lastSyncAbsolute: '2026-05-22 14:23:18 UTC',
    lastKnownGoodRelative: '5m ago',
    lastKnownGoodAbsolute: '2026-05-22 14:23:18 UTC',
  },
  values: [
    { id: 'general', label: 'General', rank: 5, color: 'purple' },
    { id: 'colonel', label: 'Colonel', rank: 4, color: 'purple' },
    { id: 'captain', label: 'Captain', rank: 3, color: 'blue' },
    { id: 'lieutenant', label: 'Lieutenant', rank: 2, color: 'blue' },
    { id: 'seargant', label: 'Seargant', rank: 1, color: 'neutral' },
  ],
};

// Local Ordered schema with no policy references — demonstrates the
// fully-unblocked happy path (overflow Delete enabled, per-value Remove
// enabled, inline + Add value enabled). Completes the deletion-gate matrix
// alongside Clearance (policyCount 8, blocked) and Coalition Rank
// (UAS-sourced, blocked).
export const PROJECT_TIER_SCHEMA: RankedSchema = {
  id: 'project-tier-local',
  attributeName: 'Project Tier',
  version: 1,
  source: 'local',
  values: [
    { id: 'alpha', label: 'Alpha', rank: 3 },
    { id: 'beta', label: 'Beta', rank: 2 },
    { id: 'gamma', label: 'Gamma', rank: 1 },
  ],
};

// Stale-state UAS schema (sync timestamp aged past NFR-2 budget; same data, different metadata).
// Per resolved PRD-VPM-1: NO proactive banner — admin discovers via denials, support tickets, audit log.
export const RANK_SCHEMA_UAS_STALE: RankedSchema = {
  ...RANK_SCHEMA_UAS,
  provenance: {
    ...RANK_SCHEMA_UAS.provenance!,
    lastSyncRelative: '47m ago',
    lastSyncAbsolute: '2026-05-22 13:41:18 UTC',
    lastKnownGoodRelative: '47m ago',
    lastKnownGoodAbsolute: '2026-05-22 13:41:18 UTC',
  },
};

// Attribute table rows for the System Console listing.
// Type vocabulary matches Figma frame 4259-29832: Image | Text | Email | Select | Ordered.
// "Ordered" is the Ranked type in user-facing terminology.
export type AttributeType = 'Image' | 'Text' | 'Email' | 'Select' | 'Ordered';

/**
 * Visibility setting per attribute row — matches the overflow menu's
 * "Visibility →" submenu (Figma 4215-37673).
 */
export type AttributeVisibility =
  | 'Always show'
  | 'Hide when empty'
  | 'Hide from end users';

export interface AttributeRow {
  attribute: string;
  type: AttributeType;
  /** Plain non-ranked value summary (Select shows static options here). */
  selectValues?: { id: string; label: string; color?: import('./types').ChipColor }[];
  /** Ranked schema (only set when type === 'Ordered'). */
  schema?: RankedSchema;
  /** Read-only source provenance — UAS-sourced rows can't be locally edited. */
  source: 'Local' | 'UAS';
  /**
   * Compass-fixed system field (Profile image, First name, Email, etc.).
   * Locked rows suppress the overflow menu entirely; UAS-sourced rows do NOT
   * set this flag — they render the overflow with most items disabled.
   */
  locked?: boolean;
  policyCount: number;
  /** Per-row visibility setting (admin-controlled). Default: "Hide when empty". */
  visibility?: AttributeVisibility;
  /** Whether end users can edit this attribute on their own profile. */
  editableByEndUsers?: boolean;
}

export const ATTRIBUTE_ROWS: AttributeRow[] = [
  { attribute: 'Profile image', type: 'Image', source: 'Local', locked: true, policyCount: 0 },
  {
    attribute: 'First name',
    type: 'Text',
    source: 'Local',
    locked: true,
    policyCount: 0,
    editableByEndUsers: true,
  },
  {
    attribute: 'Last name',
    type: 'Text',
    source: 'Local',
    locked: true,
    policyCount: 0,
    editableByEndUsers: true,
  },
  {
    attribute: 'Username',
    type: 'Text',
    source: 'Local',
    locked: true,
    policyCount: 0,
    editableByEndUsers: true,
  },
  { attribute: 'Email', type: 'Email', source: 'Local', locked: true, policyCount: 12 },
  { attribute: 'Title', type: 'Text', source: 'Local', locked: true, policyCount: 0 },
  {
    attribute: 'Position',
    type: 'Text',
    source: 'Local',
    policyCount: 0,
    visibility: 'Hide when empty',
    editableByEndUsers: false,
  },
  {
    attribute: 'Rank',
    type: 'Select',
    selectValues: [
      // Select rows retain colors — the meeting decision was specifically
      // about RANKED attributes. Select chips can still be coloured.
      { id: 'seargant', label: 'Seargant', color: 'orange' },
      { id: 'lieutenant', label: 'Lieutenant', color: 'red' },
      { id: 'captain', label: 'Captain', color: 'blue' },
      { id: 'colonel', label: 'Colonel', color: 'yellow' },
      { id: 'general', label: 'General', color: 'green' },
    ],
    source: 'Local',
    policyCount: 3,
    visibility: 'Hide when empty',
    editableByEndUsers: false,
  },
  {
    attribute: 'Clearance',
    type: 'Ordered',
    schema: CLEARANCE_SCHEMA,
    source: 'Local',
    policyCount: 8,
    visibility: 'Hide when empty',
    editableByEndUsers: false,
  },
  {
    attribute: 'Coalition Rank',
    type: 'Ordered',
    schema: RANK_SCHEMA_UAS,
    source: 'UAS',
    // No `locked: true` here — UAS-sourced rows render the overflow menu with
    // most items disabled (per-item tooltips explain why) rather than hiding
    // the menu entirely. The `source: 'UAS'` field is what gates editability.
    policyCount: 3,
    visibility: 'Hide when empty',
    editableByEndUsers: false,
  },
  {
    attribute: 'Project Tier',
    type: 'Ordered',
    schema: PROJECT_TIER_SCHEMA,
    source: 'Local',
    policyCount: 0,
    visibility: 'Hide when empty',
    editableByEndUsers: false,
  },
];

// Sample policies for the policy editor extension (Stories 3, 4).
export interface SamplePolicy {
  id: string;
  name: string;
  predicate: string;
  attribute: string;
  operator: SimpleOperator;
  threshold: string;
}

export type SimpleOperator =
  | { kind: '='; label: 'is exactly' }
  | { kind: '>='; label: 'is at least' }
  | { kind: '>'; label: 'is greater than' }
  | { kind: '<='; label: 'is at most' }
  | { kind: '<'; label: 'is less than' };

export const SIMPLE_OPERATORS: SimpleOperator[] = [
  { kind: '=', label: 'is exactly' },
  { kind: '>=', label: 'is at least' },
  { kind: '>', label: 'is greater than' },
  { kind: '<=', label: 'is at most' },
  { kind: '<', label: 'is less than' },
];

export const SAMPLE_POLICIES: SamplePolicy[] = [
  {
    id: 'p1',
    name: 'Channel: Operations North — read access',
    predicate: 'user.attributes.clearance >= "Secret"',
    attribute: 'Clearance',
    operator: { kind: '>=', label: 'is at least' },
    threshold: 'Secret',
  },
  {
    id: 'p2',
    name: 'Channel: SCI Compartment — read access',
    predicate: 'user.attributes.clearance >= "Top Secret"',
    attribute: 'Clearance',
    operator: { kind: '>=', label: 'is at least' },
    threshold: 'Top Secret',
  },
  {
    id: 'p3',
    name: 'Team: Captain and above — channel creation',
    predicate: 'user.attributes.rank >= "Captain"',
    attribute: 'Rank',
    operator: { kind: '>=', label: 'is at least' },
    threshold: 'Captain',
  },
];
