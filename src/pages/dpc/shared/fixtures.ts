/**
 * Discoverable Private Channels (DPC) — shared fixtures.
 *
 * One module shared by all four approach prototypes (A1/A2/A3/A4) plus
 * the comparison index. Per Stage 1 intake Q2 = single shared module.
 *
 * Personas, channels, ABAC policies, and audit-event builders are
 * declared here. No customer names — generic role-derived identities only.
 */

import avatarAiko from '@/assets/avatars/Aiko Tan.png';
import avatarArjun from '@/assets/avatars/Arjun Patel.png';
import avatarDanielle from '@/assets/avatars/Danielle Okoro.png';
import avatarDarius from '@/assets/avatars/Darius Cole.png';
import avatarDavid from '@/assets/avatars/David Liang.png';
import avatarEmma from '@/assets/avatars/Emma Novak.png';
import avatarEthan from '@/assets/avatars/Ethan Brooks.png';
import avatarIsabella from '@/assets/avatars/Isabella Cruz.png';
import avatarLeila from '@/assets/avatars/Leila Haddad.png';
import avatarLeonard from '@/assets/avatars/Leonard Riley.png';
import avatarLukas from '@/assets/avatars/Lukas Meyer.png';
import avatarMarco from '@/assets/avatars/Marco Rinaldi.png';
import avatarSofia from '@/assets/avatars/Sofia Bauer.png';

// ── Personas ──────────────────────────────────────────────────────────────
// Five personas per intake Q4. Roles are abstract / generic — no customer
// names, no real-world identities. Tenure days drive empty-state and
// failure-mode rendering (especially A4 newer-user composite).

export type Persona =
  | 'channel-admin'
  | 'end-user-tenured'
  | 'end-user-newer'
  | 'guest'
  | 'system-admin';

export interface PersonaInfo {
  id: string;
  displayName: string;
  username: string;
  role: Persona;
  roleLabel: string;
  avatarUrl: string;
  tenureDays: number;
  attributes: Record<string, string>;
}

export const PERSONAS: Record<Persona, PersonaInfo> = {
  'channel-admin': {
    id: 'u-admin-001',
    displayName: 'Operations Coordinator',
    username: 'ops.coord',
    role: 'channel-admin',
    roleLabel: 'Channel Admin',
    avatarUrl: avatarLeonard,
    tenureDays: 420,
    attributes: {
      classification: 'CUI',
      clearance: 'SECRET',
      program: 'alpha',
      role: 'channel-admin',
    },
  },
  'end-user-tenured': {
    id: 'u-tenured-002',
    displayName: 'Field Operator',
    username: 'field.op',
    role: 'end-user-tenured',
    roleLabel: 'Tenured Member',
    avatarUrl: avatarSofia,
    tenureDays: 312,
    attributes: {
      classification: 'CUI',
      clearance: 'SECRET',
      program: 'alpha',
      role: 'member',
    },
  },
  'end-user-newer': {
    id: 'u-newer-003',
    displayName: 'New Analyst',
    username: 'new.analyst',
    role: 'end-user-newer',
    roleLabel: 'Newer Member (7 days)',
    avatarUrl: avatarIsabella,
    tenureDays: 7,
    attributes: {
      classification: 'CUI',
      clearance: 'CONFIDENTIAL',
      program: 'unassigned',
      role: 'member',
    },
  },
  guest: {
    id: 'u-guest-004',
    displayName: 'External Liaison',
    username: 'ext.liaison',
    role: 'guest',
    roleLabel: 'Guest',
    avatarUrl: avatarLukas,
    tenureDays: 45,
    attributes: {
      classification: 'UNCLASSIFIED',
      clearance: 'NONE',
      program: 'guest',
      role: 'guest',
    },
  },
  'system-admin': {
    id: 'u-sysadmin-005',
    displayName: 'Platform Steward',
    username: 'sysadmin',
    role: 'system-admin',
    roleLabel: 'System Admin',
    avatarUrl: avatarMarco,
    tenureDays: 985,
    attributes: {
      classification: 'CUI',
      clearance: 'TOP_SECRET',
      program: 'all',
      role: 'system-admin',
    },
  },
};

export const PERSONA_ORDER: Persona[] = [
  'channel-admin',
  'end-user-tenured',
  'end-user-newer',
  'guest',
  'system-admin',
];

// Supporting cast — appears in matched-user previews, audit logs, members
// lists. Decoupled from the five interactive personas so prototypes can
// render realistic multi-user surfaces without polluting persona switching.
export interface SupportingUser {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string;
  attributes: Record<string, string>;
}

export const SUPPORTING_USERS: SupportingUser[] = [
  {
    id: 'u-sup-101',
    displayName: 'Logistics Lead',
    username: 'log.lead',
    avatarUrl: avatarAiko,
    attributes: { program: 'alpha', clearance: 'SECRET' },
  },
  {
    id: 'u-sup-102',
    displayName: 'Mission Planner',
    username: 'mission.plan',
    avatarUrl: avatarArjun,
    attributes: { program: 'alpha', clearance: 'SECRET' },
  },
  {
    id: 'u-sup-103',
    displayName: 'Cyber Analyst',
    username: 'cyber.analyst',
    avatarUrl: avatarDanielle,
    attributes: { program: 'bravo', clearance: 'SECRET' },
  },
  {
    id: 'u-sup-104',
    displayName: 'Comms Specialist',
    username: 'comms.spec',
    avatarUrl: avatarDarius,
    attributes: { program: 'alpha', clearance: 'CONFIDENTIAL' },
  },
  {
    id: 'u-sup-105',
    displayName: 'Intel Officer',
    username: 'intel.off',
    avatarUrl: avatarDavid,
    attributes: { program: 'alpha', clearance: 'SECRET' },
  },
  {
    id: 'u-sup-106',
    displayName: 'Site Engineer',
    username: 'site.eng',
    avatarUrl: avatarEmma,
    attributes: { program: 'alpha', clearance: 'CONFIDENTIAL' },
  },
  {
    id: 'u-sup-107',
    displayName: 'Watch Officer',
    username: 'watch.off',
    avatarUrl: avatarEthan,
    attributes: { program: 'alpha', clearance: 'SECRET' },
  },
  {
    id: 'u-sup-108',
    displayName: 'Logistics Auditor',
    username: 'log.audit',
    avatarUrl: avatarLeila,
    attributes: { program: 'bravo', clearance: 'SECRET' },
  },
];

// ── Channels ─────────────────────────────────────────────────────────────
// Four channels covering: public, discoverable-private-typical-match,
// discoverable-private-no-match (pending), private-non-discoverable
// (only-by-invite). Approaches consume the same channel set.

export type ChannelKind = 'public' | 'private';

export interface ChannelFixture {
  id: string;
  name: string;
  displayName: string;
  purpose: string;
  kind: ChannelKind;
  discoverable: boolean;
  /** Has this channel been added to the A3 directory? */
  inDirectory: boolean;
  /** Member count for admin-only surfaces; not exposed to non-members. */
  memberCount: number;
  /** Which ABAC policy preset gates joining (null = no policy / all team). */
  policyKey: 'empty' | 'typical' | 'slow' | null;
  /** Whether the channel allows knocks (A4 mechanism). */
  allowKnocks: boolean;
}

export const CHANNELS: ChannelFixture[] = [
  {
    id: 'ch-001',
    name: 'general',
    displayName: 'general',
    purpose: 'Team-wide announcements and broad coordination.',
    kind: 'public',
    discoverable: true,
    inDirectory: false,
    memberCount: 142,
    policyKey: null,
    allowKnocks: false,
  },
  {
    id: 'ch-002',
    name: 'ops-planning-q3',
    displayName: 'ops-planning-q3',
    purpose: 'Quarterly operational planning working group.',
    kind: 'private',
    discoverable: true,
    inDirectory: true,
    memberCount: 18,
    policyKey: 'typical',
    allowKnocks: true,
  },
  {
    id: 'ch-003',
    name: 'mission-coord-alpha',
    displayName: 'mission-coord-alpha',
    purpose: 'Coordination for Mission Alpha rotation.',
    kind: 'private',
    discoverable: true,
    inDirectory: true,
    memberCount: 7,
    policyKey: 'empty',
    allowKnocks: true,
  },
  {
    id: 'ch-004',
    name: 'incident-response',
    displayName: 'incident-response',
    purpose: '24/7 IR triage and escalation.',
    kind: 'private',
    discoverable: false,
    inDirectory: false,
    memberCount: 5,
    policyKey: 'slow',
    allowKnocks: false,
  },
];

// ── ABAC Policies ────────────────────────────────────────────────────────
// Three policy presets per intake Q5: empty (0 users), typical (12 users),
// slow (2400 users — exercises slow-path UX in A1's Confirm-and-Commit).

export interface AbacRule {
  attribute: string;
  operator: 'equals' | 'in' | 'not_equals';
  value: string;
}

export interface AbacPolicy {
  key: 'empty' | 'typical' | 'slow';
  label: string;
  rules: AbacRule[];
  matchedUserIds: string[];
  matchedCount: number;
  evaluationMs: number;
}

export const ABAC_POLICIES: Record<'empty' | 'typical' | 'slow', AbacPolicy> = {
  empty: {
    key: 'empty',
    label: '0 users — no match (admin commits anyway)',
    rules: [
      { attribute: 'program', operator: 'equals', value: 'gamma' },
      { attribute: 'clearance', operator: 'equals', value: 'TOP_SECRET' },
    ],
    matchedUserIds: [],
    matchedCount: 0,
    evaluationMs: 42,
  },
  typical: {
    key: 'typical',
    label: '12 users — fast path (preview first N)',
    rules: [
      { attribute: 'program', operator: 'equals', value: 'alpha' },
      { attribute: 'clearance', operator: 'in', value: 'SECRET,TOP_SECRET' },
    ],
    matchedUserIds: SUPPORTING_USERS.slice(0, 7).map((u) => u.id).concat([
      'u-sup-201',
      'u-sup-202',
      'u-sup-203',
      'u-sup-204',
      'u-sup-205',
    ]),
    matchedCount: 12,
    evaluationMs: 178,
  },
  slow: {
    key: 'slow',
    label: '2400 users — slow path (NFR-5 boundary demo)',
    rules: [
      { attribute: 'classification', operator: 'equals', value: 'CUI' },
      { attribute: 'role', operator: 'not_equals', value: 'guest' },
    ],
    matchedUserIds: SUPPORTING_USERS.map((u) => u.id),
    matchedCount: 2400,
    evaluationMs: 4200,
  },
};

export const ABAC_POLICY_ORDER: Array<'empty' | 'typical' | 'slow'> = [
  'typical',
  'empty',
  'slow',
];

// ── Audit events ─────────────────────────────────────────────────────────
// FR-13 audit-event scaffold. Each approach extends the base set; the
// shared builder produces a normalised record.

export type AuditOutcome = 'success' | 'denied' | 'error';

export interface AuditEvent {
  ts: string;
  actor: string;
  action: string;
  resource: string;
  outcome: AuditOutcome;
  meta?: Record<string, unknown>;
}

export interface AuditEventInput {
  actor: string;
  action: string;
  resource: string;
  outcome?: AuditOutcome;
  meta?: Record<string, unknown>;
  ts?: string;
}

export function makeAudit(input: AuditEventInput): AuditEvent {
  return {
    ts: input.ts ?? new Date().toISOString(),
    actor: input.actor,
    action: input.action,
    resource: input.resource,
    outcome: input.outcome ?? 'success',
    meta: input.meta,
  };
}

// Seed audit events that prototypes can show in the audit panel before
// any user interaction has occurred (i.e., what a sys-admin would see
// on landing). Approaches extend the seed via reducer dispatches.
export const SEED_AUDIT_EVENTS: AuditEvent[] = [
  makeAudit({
    actor: PERSONAS['channel-admin'].username,
    action: 'channel.created',
    resource: 'ch-002',
    ts: '2026-05-12T13:04:00Z',
  }),
  makeAudit({
    actor: PERSONAS['channel-admin'].username,
    action: 'discoverable.toggle.opened',
    resource: 'ch-002',
    ts: '2026-05-13T09:01:11Z',
    meta: { from: 'channel-settings' },
  }),
  makeAudit({
    actor: PERSONAS['channel-admin'].username,
    action: 'discoverable.set',
    resource: 'ch-002',
    ts: '2026-05-13T09:01:34Z',
    outcome: 'success',
    meta: {
      to: true,
      acknowledgment_metadata: {
        matched_user_count: 12,
        guest_filter_active: true,
        auto_add_disabled: false,
      },
    },
  }),
];

// ── Phase 4 / Phase 5 metadata used by the comparison index ────────────
// Captured here so Stage 3 can render the comparison cards from a single
// authoritative shape. Numbers traced to specs/discoverable-private-channels.

export type ApproachId = 'a1' | 'a2' | 'a3' | 'a4';

export interface ApproachSummary {
  id: ApproachId;
  shortLabel: string;
  fullLabel: string;
  mechanism: string;
  weightedScore: number;
  hardConstraintFail: string | null;
  differentiatorsPreserved: number;
  prototypeRoute: string;
}

export const APPROACH_SUMMARIES: ApproachSummary[] = [
  {
    id: 'a1',
    shortLabel: 'A1: Confirm-and-Commit',
    fullLabel: 'A1 — Baseline + Confirm-and-Commit',
    mechanism:
      'Channel Settings toggle plus a synchronous Confirm-and-Commit modal that surfaces matched-user preview, guest-filter posture, and request routing. Atomicity enforced at the user-action boundary, with a non-bypassable acknowledgment claim on the API.',
    weightedScore: 35.5,
    hardConstraintFail: null,
    differentiatorsPreserved: 6,
    prototypeRoute: '/prototypes/dpc/a1',
  },
  {
    id: 'a2',
    shortLabel: 'A2: Intent-Wizard',
    fullLabel: 'A2 — Baseline + Intent-Wizard',
    mechanism:
      'Channel Settings toggle plus a two-step wizard. Step 1 = scope choice; Step 2A = open-to-team confirmation (deliberately empty for the no-ABAC majority case); Step 2B = Access Control tab with deferred-commit banner. Structural atomicity by construction.',
    weightedScore: 30.75,
    hardConstraintFail: 'KD-5 (no-ABAC simplicity, C2 = 2/5)',
    differentiatorsPreserved: 5,
    prototypeRoute: '/prototypes/dpc/a2',
  },
  {
    id: 'a3',
    shortLabel: 'A3: Curated Directory',
    fullLabel: 'A3 — Curated Directory',
    mechanism:
      'No per-channel Discoverable toggle. Channel admins add their channel to a separate Channel Directory via the channel-header menu. Two-surface admin operation; directory entries inherit channel-admin authority.',
    weightedScore: 28.75,
    hardConstraintFail: null,
    differentiatorsPreserved: 5,
    prototypeRoute: '/prototypes/dpc/a3',
  },
  {
    id: 'a4',
    shortLabel: 'A4: Knock-by-Reference',
    fullLabel: 'A4 — Knock-by-Reference',
    mechanism:
      'No discovery surface. Four reference-acquisition channels — permalink unfurl, @mention interception, member recommendation, prior-membership lookup. Knock framing for the join request. Newer users with zero references see four empty surfaces (failure mode #1 made visible).',
    weightedScore: 33.5,
    hardConstraintFail: 'Disqualified — recreates Phase 1 failure mode #1 (hidden conversations)',
    differentiatorsPreserved: 5,
    prototypeRoute: '/prototypes/dpc/a4',
  },
];
