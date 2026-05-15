/**
 * DPC A4 — local state machine for Knock-by-Reference.
 *
 * Reducer-style store that owns:
 *   - Per-channel Allow Knocks configuration (master + 4 sub-toggles +
 *     recommendation permission radio per §3.4.4).
 *   - References acquired by the current user (the four reference channels
 *     in §3.4.2: permalink / mention / recommendation / prior-membership).
 *   - Pending knocks the admin queue sees, with reference_source per row
 *     for §3.4.5's Reference Source column.
 *   - User's outstanding pending knocks (so reference cards switch to the
 *     subdued "Withdraw knock" state per §3.4.3 step 2 / FR-8 step 2).
 *   - Channels the user has left (drives §3.4.2 channel 4 + §3.4.6 L&R).
 *   - Audit events emitted per §3.4.7 — including reference_source,
 *     recommender_id, permalink_originator_id, V-A4-1..V-A4-5 evidence.
 *   - Knock reference log (for V-A4-1 reference fabrication detection /
 *     OQ-5.5 fabrication threshold demonstration).
 *
 * No customer names; all identities are role-derived from PERSONAS /
 * SUPPORTING_USERS in shared fixtures.
 */
import { useReducer, useCallback, useMemo } from 'react';
import {
  type AuditEvent,
  type ChannelFixture,
  CHANNELS,
  makeAudit,
  SEED_AUDIT_EVENTS,
  PERSONAS,
} from '@/pages/dpc/shared';

// ── Types ────────────────────────────────────────────────────────────────

export type ReferenceSource =
  | 'permalink'
  | 'mention'
  | 'recommendation'
  | 'prior-membership';

export type RecommendationPermission =
  | 'all-members'
  | 'channel-admins-only'
  | 'disabled';

export interface AllowKnocksConfig {
  master: boolean;
  permalinkUnfurls: boolean;
  mentionInterceptions: boolean;
  memberRecommendations: boolean;
  recommendationPermission: RecommendationPermission;
  priorMembership: boolean;
}

export interface Reference {
  id: string;
  source: ReferenceSource;
  channelId: string;
  /** Recommender or permalink originator @handle, where applicable. */
  fromUser?: string;
  /** Plain-language meta for inline rendering (e.g. permalink path). */
  note?: string;
  acquiredAt: string;
}

export interface PendingKnock {
  id: string;
  channelId: string;
  knockerId: string;
  knockerHandle: string;
  knockerDisplay: string;
  referenceSource: ReferenceSource;
  /**
   * Human-readable provenance for the "Via: …" column in §3.4.5
   * (e.g. "permalink from @colleague-2", "prior member (left 2025-11-08)").
   */
  via: string;
  message: string | null;
  submittedAt: string;
}

export interface LeftChannel {
  channelId: string;
  channelName: string;
  purpose: string;
  /** Persona that did the leaving — surface is per-user per V-A4-3. */
  ownerPersonaId: string;
  leftDate: string;
  /**
   * Drives the "Status" line in §3.4.2 channel 4:
   *  - accepts-knocks: prior-membership sub-toggle ON.
   *  - admin-disabled: master ON but prior-membership sub-toggle OFF.
   *  - channel-deleted: channel no longer exists.
   */
  status: 'accepts-knocks' | 'admin-disabled' | 'channel-deleted';
}

export interface KnockReferenceLogEntry {
  ts: string;
  channelId: string;
  knockerHandle: string;
  referenceSource: ReferenceSource;
  outcome: 'submitted' | 'fabrication-suspected' | 'rate-limited';
  note?: string;
}

export interface DmNotification {
  id: string;
  ts: string;
  kind:
    | 'knock-accepted'
    | 'knock-declined-no-reason'
    | 'knock-declined-with-reason'
    | 'knock-auto-withdrawn-knocks-disabled'
    | 'knock-auto-withdrawn-channel-deleted'
    | 'knock-auto-withdrawn-source-revoked'
    | 'recommendation-received';
  channelId: string;
  /** Admin / recommender / system actor who triggered the DM. */
  actorHandle?: string;
  reason?: string;
  source?: ReferenceSource;
  recommendationNote?: string;
}

export interface A4State {
  channelAllowKnocks: Record<string, AllowKnocksConfig>;
  references: Reference[];
  myPendingKnocks: string[]; // channelIds the active user has knocked
  pendingKnocks: PendingKnock[];
  channelsLeft: LeftChannel[];
  auditEvents: AuditEvent[];
  knockReferenceLog: KnockReferenceLogEntry[];
  dmNotifications: DmNotification[];
  /** Most-recent "what just happened" for the inline status strip. */
  flash: string | null;
}

// ── Initial fixtures ─────────────────────────────────────────────────────

const CH_MISSION = 'ch-003'; // private, discoverable, mission-coord-alpha
const CH_PLANNING = 'ch-002'; // private, discoverable, ops-planning-q3
const CH_INCIDENT = 'ch-004'; // private, non-discoverable

function defaultAllowKnocksFor(ch: ChannelFixture): AllowKnocksConfig {
  // Only A4-eligible privates default to allowKnocks ON for prototype demo.
  const master = ch.kind === 'private' && ch.allowKnocks;
  return {
    master,
    permalinkUnfurls: master,
    mentionInterceptions: master,
    memberRecommendations: master,
    // OQ-5.4 secure default: channel admins only.
    recommendationPermission: master ? 'channel-admins-only' : 'disabled',
    priorMembership: master,
  };
}

function initialAllowKnocks(): Record<string, AllowKnocksConfig> {
  const out: Record<string, AllowKnocksConfig> = {};
  for (const c of CHANNELS) {
    out[c.id] = defaultAllowKnocksFor(c);
  }
  return out;
}

// Tenured-user fixtures — populated reference surfaces for §3.4.2 channels 1–4.
const TENURED_REFERENCES: Reference[] = [
  {
    id: 'ref-perma-001',
    source: 'permalink',
    channelId: CH_MISSION,
    fromUser: '@log.lead',
    note: 'pasted in DM — pl/8x4j2q…',
    acquiredAt: '2026-05-12T14:22:00Z',
  },
  {
    id: 'ref-mention-001',
    source: 'mention',
    channelId: CH_PLANNING,
    fromUser: '@mission.plan',
    note: 'Mentioned today, 13:47',
    acquiredAt: '2026-05-13T13:47:00Z',
  },
  {
    id: 'ref-recommend-001',
    source: 'recommendation',
    channelId: CH_MISSION,
    fromUser: '@comms.spec',
    note: '"I think this would be relevant to your work on the comms sync."',
    acquiredAt: '2026-05-13T14:31:00Z',
  },
];

const TENURED_LEFT: LeftChannel[] = [
  {
    channelId: CH_PLANNING,
    channelName: 'ops-planning-q3',
    purpose: 'Quarterly operational planning working group.',
    ownerPersonaId: PERSONAS['end-user-tenured'].id,
    leftDate: '2025-11-08',
    status: 'accepts-knocks',
  },
  {
    channelId: 'ch-legacy-x',
    channelName: 'legacy-program-x',
    purpose: '(channel purpose not currently set)',
    ownerPersonaId: PERSONAS['end-user-tenured'].id,
    leftDate: '2024-06-12',
    status: 'admin-disabled',
  },
  {
    channelId: 'ch-archived-wg',
    channelName: 'archived-working-group',
    purpose: '(channel no longer exists)',
    ownerPersonaId: PERSONAS['end-user-tenured'].id,
    leftDate: '2024-03-01',
    status: 'channel-deleted',
  },
];

const ADMIN_PENDING_KNOCKS: PendingKnock[] = [
  {
    id: 'kn-001',
    channelId: CH_MISSION,
    knockerId: 'u-tenured-002',
    knockerHandle: '@field.op',
    knockerDisplay: 'Field Operator',
    referenceSource: 'permalink',
    via: 'permalink from @log.lead',
    message: null,
    submittedAt: '2026-05-13T14:23:00Z',
  },
  {
    id: 'kn-002',
    channelId: CH_MISSION,
    knockerId: 'u-sup-103',
    knockerHandle: '@cyber.analyst',
    knockerDisplay: 'Cyber Analyst',
    referenceSource: 'recommendation',
    via: 'recommendation from @comms.spec',
    message:
      'Working on the comms sync — adding bandwidth this sprint.',
    submittedAt: '2026-05-13T09:11:00Z',
  },
  {
    id: 'kn-003',
    channelId: CH_MISSION,
    knockerId: 'u-sup-107',
    knockerHandle: '@watch.off',
    knockerDisplay: 'Watch Officer',
    referenceSource: 'prior-membership',
    via: 'prior member (left 2025-11-08)',
    message: null,
    submittedAt: '2026-05-12T17:48:00Z',
  },
];

const SEED_A4_AUDIT: AuditEvent[] = [
  makeAudit({
    actor: PERSONAS['channel-admin'].username,
    action: 'Allow_knocks_enabled',
    resource: CH_MISSION,
    ts: '2026-05-11T08:42:00Z',
    meta: {
      sub_toggle_state_snapshot: {
        permalink: true,
        mention: true,
        recommendation: true,
        'prior-membership': true,
      },
    },
  }),
  makeAudit({
    actor: PERSONAS['channel-admin'].username,
    action: 'Recommendation_permission_changed',
    resource: CH_MISSION,
    ts: '2026-05-11T08:42:30Z',
    meta: { value: 'channel-admins-only' },
  }),
  makeAudit({
    actor: '@log.lead',
    action: 'Permalink_reference_invalidated',
    resource: 'ch-archived-wg',
    ts: '2026-05-12T10:15:00Z',
    outcome: 'denied',
    meta: {
      originator_id: 'u-sup-101',
      permalink_id: 'pl/archived-wg-77',
      v_vector: 'V-A4-2',
    },
  }),
];

function buildInitialState(): A4State {
  return {
    channelAllowKnocks: initialAllowKnocks(),
    references: TENURED_REFERENCES,
    myPendingKnocks: [],
    pendingKnocks: ADMIN_PENDING_KNOCKS,
    channelsLeft: TENURED_LEFT,
    auditEvents: [...SEED_AUDIT_EVENTS, ...SEED_A4_AUDIT],
    knockReferenceLog: [],
    dmNotifications: [
      {
        id: 'dm-seed-rec-1',
        ts: '2026-05-13T14:31:00Z',
        kind: 'recommendation-received',
        channelId: CH_MISSION,
        actorHandle: '@comms.spec',
        recommendationNote:
          'I think this would be relevant to your work on the comms sync.',
      },
    ],
    flash: null,
  };
}

// ── Actions ──────────────────────────────────────────────────────────────

type Action =
  | { type: 'RESET' }
  | { type: 'CLEAR_REFERENCES' }
  | { type: 'CLEAR_LEFT_CHANNELS' }
  | { type: 'ENABLE_ALLOW_KNOCKS'; channelId: string; actor: string }
  | { type: 'DISABLE_ALLOW_KNOCKS'; channelId: string; actor: string }
  | {
      type: 'SET_SUB_TOGGLE';
      channelId: string;
      source: ReferenceSource;
      value: boolean;
      actor: string;
    }
  | {
      type: 'SET_RECOMMEND_PERMISSION';
      channelId: string;
      value: RecommendationPermission;
      actor: string;
    }
  | {
      type: 'ACQUIRE_REFERENCE';
      reference: Omit<Reference, 'id' | 'acquiredAt'> & {
        acquiredAt?: string;
      };
    }
  | {
      type: 'SUBMIT_KNOCK';
      channelId: string;
      source: ReferenceSource;
      knocker: { id: string; handle: string; display: string };
      via: string;
      message: string | null;
    }
  | { type: 'WITHDRAW_KNOCK'; channelId: string; actor: string }
  | { type: 'ACCEPT_KNOCK'; knockId: string; admin: string }
  | {
      type: 'DECLINE_KNOCK';
      knockId: string;
      admin: string;
      reason: string | null;
    }
  | {
      type: 'LEAVE_CHANNEL_FOR_PRIOR_MEMBERSHIP';
      channelId: string;
      channelName: string;
      purpose: string;
      actor: string;
      personaId: string;
    }
  | {
      type: 'SEND_RECOMMENDATION';
      channelId: string;
      sender: string;
      recipientHandle: string;
      note: string;
    }
  | {
      type: 'RATE_LIMITED_RECOMMENDATION';
      channelId: string;
      sender: string;
      recipientHandle: string;
    }
  | {
      type: 'SIMULATE_FABRICATION_ATTEMPT';
      channelId: string;
      knocker: string;
    }
  | { type: 'DISMISS_MENTION'; channelId: string; actor: string }
  | { type: 'DISMISS_FLASH' };

// ── Reducer ──────────────────────────────────────────────────────────────

function nowIso(): string {
  return new Date().toISOString();
}

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(
    36,
  )}`;
}

function reducer(state: A4State, action: Action): A4State {
  switch (action.type) {
    case 'RESET':
      return buildInitialState();

    case 'CLEAR_REFERENCES':
      return { ...state, references: [] };

    case 'CLEAR_LEFT_CHANNELS':
      return { ...state, channelsLeft: [] };

    case 'ENABLE_ALLOW_KNOCKS': {
      const cur = state.channelAllowKnocks[action.channelId];
      if (!cur) return state;
      const next: AllowKnocksConfig = {
        ...cur,
        master: true,
        permalinkUnfurls: true,
        mentionInterceptions: true,
        memberRecommendations: true,
        recommendationPermission:
          cur.recommendationPermission === 'disabled'
            ? 'channel-admins-only'
            : cur.recommendationPermission,
        priorMembership: true,
      };
      return {
        ...state,
        channelAllowKnocks: {
          ...state.channelAllowKnocks,
          [action.channelId]: next,
        },
        auditEvents: [
          makeAudit({
            actor: action.actor,
            action: 'Allow_knocks_enabled',
            resource: action.channelId,
            meta: { sub_toggle_state_snapshot: next },
          }),
          ...state.auditEvents,
        ],
        flash: 'Allow Knocks enabled — sub-toggles set to defaults.',
      };
    }

    case 'DISABLE_ALLOW_KNOCKS': {
      const cur = state.channelAllowKnocks[action.channelId];
      if (!cur) return state;
      const next: AllowKnocksConfig = {
        ...cur,
        master: false,
        permalinkUnfurls: false,
        mentionInterceptions: false,
        memberRecommendations: false,
        priorMembership: false,
      };
      // Auto-withdraw all pending knocks for this channel per FR-10.
      const withdrawnIds = state.pendingKnocks
        .filter((k) => k.channelId === action.channelId)
        .map((k) => k.id);
      const stillPending = state.pendingKnocks.filter(
        (k) => k.channelId !== action.channelId,
      );
      // DM notifications for affected knockers + the active user if applicable.
      const dmAdds: DmNotification[] = state.pendingKnocks
        .filter((k) => k.channelId === action.channelId)
        .map((k) => ({
          id: uid('dm'),
          ts: nowIso(),
          kind: 'knock-auto-withdrawn-knocks-disabled',
          channelId: action.channelId,
          actorHandle: action.actor,
          recommendationNote: undefined,
          source: k.referenceSource,
        }));
      const myPendingNext = state.myPendingKnocks.filter(
        (id) => id !== action.channelId,
      );
      return {
        ...state,
        channelAllowKnocks: {
          ...state.channelAllowKnocks,
          [action.channelId]: next,
        },
        pendingKnocks: stillPending,
        myPendingKnocks: myPendingNext,
        dmNotifications: [...dmAdds, ...state.dmNotifications],
        auditEvents: [
          makeAudit({
            actor: action.actor,
            action: 'Allow_knocks_disabled',
            resource: action.channelId,
            meta: {
              auto_withdrew_knock_ids: withdrawnIds,
              v_vector: 'V-A4-5',
            },
          }),
          ...state.auditEvents,
        ],
        flash:
          withdrawnIds.length > 0
            ? `Allow Knocks disabled — ${withdrawnIds.length} pending knock(s) auto-withdrawn.`
            : 'Allow Knocks disabled.',
      };
    }

    case 'SET_SUB_TOGGLE': {
      const cur = state.channelAllowKnocks[action.channelId];
      if (!cur) return state;
      const key =
        action.source === 'permalink'
          ? 'permalinkUnfurls'
          : action.source === 'mention'
            ? 'mentionInterceptions'
            : action.source === 'recommendation'
              ? 'memberRecommendations'
              : 'priorMembership';
      const next: AllowKnocksConfig = { ...cur, [key]: action.value };
      // Auto-withdraw knocks for the affected source per FR-10 extension.
      const affected = state.pendingKnocks.filter(
        (k) =>
          k.channelId === action.channelId &&
          k.referenceSource === action.source &&
          action.value === false,
      );
      const affectedIds = affected.map((k) => k.id);
      const dmAdds: DmNotification[] = affected.map((k) => ({
        id: uid('dm'),
        ts: nowIso(),
        kind: 'knock-auto-withdrawn-source-revoked',
        channelId: action.channelId,
        actorHandle: action.actor,
        source: k.referenceSource,
      }));
      const stillPending = state.pendingKnocks.filter(
        (k) => !affectedIds.includes(k.id),
      );
      return {
        ...state,
        channelAllowKnocks: {
          ...state.channelAllowKnocks,
          [action.channelId]: next,
        },
        pendingKnocks: stillPending,
        dmNotifications: [...dmAdds, ...state.dmNotifications],
        auditEvents: [
          makeAudit({
            actor: action.actor,
            action: `Allow_knocks_${action.source}_${action.value ? 'enabled' : 'disabled'}`,
            resource: action.channelId,
            meta: { source: action.source, value: action.value },
          }),
          ...state.auditEvents,
        ],
        flash:
          affectedIds.length > 0
            ? `Sub-toggle "${action.source}" disabled — ${affectedIds.length} pending knock(s) auto-withdrawn.`
            : null,
      };
    }

    case 'SET_RECOMMEND_PERMISSION': {
      const cur = state.channelAllowKnocks[action.channelId];
      if (!cur) return state;
      const next: AllowKnocksConfig = {
        ...cur,
        recommendationPermission: action.value,
        memberRecommendations: action.value !== 'disabled',
      };
      return {
        ...state,
        channelAllowKnocks: {
          ...state.channelAllowKnocks,
          [action.channelId]: next,
        },
        auditEvents: [
          makeAudit({
            actor: action.actor,
            action: 'Recommendation_permission_changed',
            resource: action.channelId,
            meta: { value: action.value },
          }),
          ...state.auditEvents,
        ],
        flash: `Recommendation permission set to "${action.value}".`,
      };
    }

    case 'ACQUIRE_REFERENCE': {
      const ref: Reference = {
        ...action.reference,
        id: uid('ref'),
        acquiredAt: action.reference.acquiredAt ?? nowIso(),
      };
      return { ...state, references: [ref, ...state.references] };
    }

    case 'SUBMIT_KNOCK': {
      // Guard: do not submit if Allow Knocks is off for this channel/source.
      const cfg = state.channelAllowKnocks[action.channelId];
      const subKey =
        action.source === 'permalink'
          ? 'permalinkUnfurls'
          : action.source === 'mention'
            ? 'mentionInterceptions'
            : action.source === 'recommendation'
              ? 'memberRecommendations'
              : 'priorMembership';
      if (!cfg || !cfg.master || !cfg[subKey]) {
        return {
          ...state,
          flash:
            'Knock blocked — Allow Knocks is off (or this reference source is disabled).',
        };
      }

      const knock: PendingKnock = {
        id: uid('kn'),
        channelId: action.channelId,
        knockerId: action.knocker.id,
        knockerHandle: action.knocker.handle,
        knockerDisplay: action.knocker.display,
        referenceSource: action.source,
        via: action.via,
        message: action.message,
        submittedAt: nowIso(),
      };
      return {
        ...state,
        pendingKnocks: [knock, ...state.pendingKnocks],
        myPendingKnocks: [...state.myPendingKnocks, action.channelId],
        knockReferenceLog: [
          {
            ts: knock.submittedAt,
            channelId: action.channelId,
            knockerHandle: action.knocker.handle,
            referenceSource: action.source,
            outcome: 'submitted',
          },
          ...state.knockReferenceLog,
        ],
        auditEvents: [
          makeAudit({
            actor: action.knocker.handle,
            action: 'Knock_submitted',
            resource: action.channelId,
            meta: {
              reference_source: action.source,
              reference_metadata: { via: action.via },
              message_length: action.message?.length ?? 0,
            },
          }),
          ...state.auditEvents,
        ],
        flash: `Knock sent — pending channel-admin review.`,
      };
    }

    case 'WITHDRAW_KNOCK': {
      const targeted = state.pendingKnocks.filter(
        (k) =>
          k.channelId === action.channelId && k.knockerHandle === action.actor,
      );
      const ids = targeted.map((k) => k.id);
      return {
        ...state,
        pendingKnocks: state.pendingKnocks.filter(
          (k) => !ids.includes(k.id),
        ),
        myPendingKnocks: state.myPendingKnocks.filter(
          (id) => id !== action.channelId,
        ),
        auditEvents: [
          makeAudit({
            actor: action.actor,
            action: 'Knock_withdrawn',
            resource: action.channelId,
            meta: { withdrawal_trigger: 'user_initiated' },
          }),
          ...state.auditEvents,
        ],
        flash: 'Knock withdrawn.',
      };
    }

    case 'ACCEPT_KNOCK': {
      const knock = state.pendingKnocks.find((k) => k.id === action.knockId);
      if (!knock) return state;
      const dm: DmNotification = {
        id: uid('dm'),
        ts: nowIso(),
        kind: 'knock-accepted',
        channelId: knock.channelId,
        actorHandle: action.admin,
      };
      return {
        ...state,
        pendingKnocks: state.pendingKnocks.filter((k) => k.id !== action.knockId),
        myPendingKnocks: state.myPendingKnocks.filter(
          (id) => id !== knock.channelId,
        ),
        dmNotifications: [dm, ...state.dmNotifications],
        auditEvents: [
          makeAudit({
            actor: action.admin,
            action: 'Knock_accepted',
            resource: knock.channelId,
            meta: {
              subject_id: knock.knockerId,
              reference_source: knock.referenceSource,
            },
          }),
          ...state.auditEvents,
        ],
        flash: `Accepted knock from ${knock.knockerHandle}.`,
      };
    }

    case 'DECLINE_KNOCK': {
      const knock = state.pendingKnocks.find((k) => k.id === action.knockId);
      if (!knock) return state;
      const dm: DmNotification = {
        id: uid('dm'),
        ts: nowIso(),
        kind: action.reason
          ? 'knock-declined-with-reason'
          : 'knock-declined-no-reason',
        channelId: knock.channelId,
        actorHandle: action.admin,
        reason: action.reason ?? undefined,
      };
      return {
        ...state,
        pendingKnocks: state.pendingKnocks.filter((k) => k.id !== action.knockId),
        myPendingKnocks: state.myPendingKnocks.filter(
          (id) => id !== knock.channelId,
        ),
        dmNotifications: [dm, ...state.dmNotifications],
        auditEvents: [
          makeAudit({
            actor: action.admin,
            action: 'Knock_declined',
            resource: knock.channelId,
            meta: {
              subject_id: knock.knockerId,
              reference_source: knock.referenceSource,
              decline_reason: action.reason ?? '(none)',
            },
          }),
          ...state.auditEvents,
        ],
        flash: `Declined knock from ${knock.knockerHandle}.`,
      };
    }

    case 'LEAVE_CHANNEL_FOR_PRIOR_MEMBERSHIP': {
      const entry: LeftChannel = {
        channelId: action.channelId,
        channelName: action.channelName,
        purpose: action.purpose,
        ownerPersonaId: action.personaId,
        leftDate: nowIso().slice(0, 10),
        status: 'accepts-knocks',
      };
      return {
        ...state,
        channelsLeft: [entry, ...state.channelsLeft],
        auditEvents: [
          makeAudit({
            actor: action.actor,
            action: 'Channel_left',
            resource: action.channelId,
            meta: { triggers_prior_membership_entry: true },
          }),
          ...state.auditEvents,
        ],
        flash: `You left #${action.channelName}. It now appears in "Channels you've left".`,
      };
    }

    case 'SEND_RECOMMENDATION': {
      const dm: DmNotification = {
        id: uid('dm'),
        ts: nowIso(),
        kind: 'recommendation-received',
        channelId: action.channelId,
        actorHandle: action.sender,
        recommendationNote: action.note,
      };
      return {
        ...state,
        dmNotifications: [dm, ...state.dmNotifications],
        auditEvents: [
          makeAudit({
            actor: action.sender,
            action: 'Recommendation_sent',
            resource: action.channelId,
            meta: {
              recipient: action.recipientHandle,
              note_length: action.note.length,
            },
          }),
          ...state.auditEvents,
        ],
        flash: `Recommendation sent to ${action.recipientHandle}.`,
      };
    }

    case 'RATE_LIMITED_RECOMMENDATION': {
      return {
        ...state,
        auditEvents: [
          makeAudit({
            actor: action.sender,
            action: 'Recommendation_rate_limited',
            resource: action.channelId,
            outcome: 'denied',
            meta: {
              recipient: action.recipientHandle,
              v_vector: 'V-A4-4',
              window: '24h',
            },
          }),
          ...state.auditEvents,
        ],
        flash: `Rate-limited — already recommended to ${action.recipientHandle} in the last 24h.`,
      };
    }

    case 'SIMULATE_FABRICATION_ATTEMPT': {
      return {
        ...state,
        knockReferenceLog: [
          {
            ts: nowIso(),
            channelId: action.channelId,
            knockerHandle: action.knocker,
            referenceSource: 'permalink',
            outcome: 'fabrication-suspected',
            note: 'No verified permalink originator for this channel.',
          },
          ...state.knockReferenceLog,
        ],
        auditEvents: [
          makeAudit({
            actor: action.knocker,
            action: 'Knock_submitted',
            resource: action.channelId,
            outcome: 'denied',
            meta: {
              reference_source: 'permalink',
              v_vector: 'V-A4-1',
              response: 'normalized-access-denied',
            },
          }),
          ...state.auditEvents,
        ],
        flash:
          'Reference fabrication attempt logged — response normalized to "Access denied" (V-A4-1).',
      };
    }

    case 'DISMISS_MENTION': {
      return {
        ...state,
        references: state.references.filter(
          (r) => !(r.source === 'mention' && r.channelId === action.channelId),
        ),
        auditEvents: [
          makeAudit({
            actor: action.actor,
            action: 'Mention_dismissed',
            resource: action.channelId,
          }),
          ...state.auditEvents,
        ],
        flash: 'Mention dismissed.',
      };
    }

    case 'DISMISS_FLASH':
      return { ...state, flash: null };

    default:
      return state;
  }
}

// ── Public hook ──────────────────────────────────────────────────────────

export interface A4Actions {
  enableAllowKnocks(channelId: string, actor: string): void;
  disableAllowKnocks(channelId: string, actor: string): void;
  setSubToggle(
    channelId: string,
    source: ReferenceSource,
    value: boolean,
    actor: string,
  ): void;
  setRecommendPermission(
    channelId: string,
    value: RecommendationPermission,
    actor: string,
  ): void;
  acquireReference(input: Omit<Reference, 'id' | 'acquiredAt'>): void;
  submitKnock(input: {
    channelId: string;
    source: ReferenceSource;
    knocker: { id: string; handle: string; display: string };
    via: string;
    message: string | null;
  }): void;
  withdrawKnock(channelId: string, actor: string): void;
  acceptKnock(knockId: string, admin: string): void;
  declineKnock(knockId: string, admin: string, reason: string | null): void;
  leaveChannel(input: {
    channelId: string;
    channelName: string;
    purpose: string;
    actor: string;
    personaId: string;
  }): void;
  sendRecommendation(input: {
    channelId: string;
    sender: string;
    recipientHandle: string;
    note: string;
  }): void;
  rateLimitedRecommendation(input: {
    channelId: string;
    sender: string;
    recipientHandle: string;
  }): void;
  simulateFabricationAttempt(channelId: string, knocker: string): void;
  dismissMention(channelId: string, actor: string): void;
  dismissFlash(): void;
  clearReferences(): void;
  clearLeftChannels(): void;
  reset(): void;
}

export interface UseA4StoreReturn {
  state: A4State;
  actions: A4Actions;
}

export function useA4Store(): UseA4StoreReturn {
  const [state, dispatch] = useReducer(reducer, undefined, buildInitialState);

  const actions = useMemo<A4Actions>(
    () => ({
      enableAllowKnocks: (channelId, actor) =>
        dispatch({ type: 'ENABLE_ALLOW_KNOCKS', channelId, actor }),
      disableAllowKnocks: (channelId, actor) =>
        dispatch({ type: 'DISABLE_ALLOW_KNOCKS', channelId, actor }),
      setSubToggle: (channelId, source, value, actor) =>
        dispatch({
          type: 'SET_SUB_TOGGLE',
          channelId,
          source,
          value,
          actor,
        }),
      setRecommendPermission: (channelId, value, actor) =>
        dispatch({
          type: 'SET_RECOMMEND_PERMISSION',
          channelId,
          value,
          actor,
        }),
      acquireReference: (reference) =>
        dispatch({ type: 'ACQUIRE_REFERENCE', reference }),
      submitKnock: (input) =>
        dispatch({
          type: 'SUBMIT_KNOCK',
          channelId: input.channelId,
          source: input.source,
          knocker: input.knocker,
          via: input.via,
          message: input.message,
        }),
      withdrawKnock: (channelId, actor) =>
        dispatch({ type: 'WITHDRAW_KNOCK', channelId, actor }),
      acceptKnock: (knockId, admin) =>
        dispatch({ type: 'ACCEPT_KNOCK', knockId, admin }),
      declineKnock: (knockId, admin, reason) =>
        dispatch({ type: 'DECLINE_KNOCK', knockId, admin, reason }),
      leaveChannel: (input) =>
        dispatch({
          type: 'LEAVE_CHANNEL_FOR_PRIOR_MEMBERSHIP',
          channelId: input.channelId,
          channelName: input.channelName,
          purpose: input.purpose,
          actor: input.actor,
          personaId: input.personaId,
        }),
      sendRecommendation: (input) =>
        dispatch({
          type: 'SEND_RECOMMENDATION',
          channelId: input.channelId,
          sender: input.sender,
          recipientHandle: input.recipientHandle,
          note: input.note,
        }),
      rateLimitedRecommendation: (input) =>
        dispatch({
          type: 'RATE_LIMITED_RECOMMENDATION',
          channelId: input.channelId,
          sender: input.sender,
          recipientHandle: input.recipientHandle,
        }),
      simulateFabricationAttempt: (channelId, knocker) =>
        dispatch({
          type: 'SIMULATE_FABRICATION_ATTEMPT',
          channelId,
          knocker,
        }),
      dismissMention: (channelId, actor) =>
        dispatch({ type: 'DISMISS_MENTION', channelId, actor }),
      dismissFlash: () => dispatch({ type: 'DISMISS_FLASH' }),
      clearReferences: () => dispatch({ type: 'CLEAR_REFERENCES' }),
      clearLeftChannels: () => dispatch({ type: 'CLEAR_LEFT_CHANNELS' }),
      reset: () => dispatch({ type: 'RESET' }),
    }),
    [],
  );

  return { state, actions };
}

// ── Helpers consumed by per-screen state files ──────────────────────────

export const A4_DEMO_CHANNEL_ID = CH_MISSION;
export const A4_PLANNING_CHANNEL_ID = CH_PLANNING;
export const A4_INCIDENT_CHANNEL_ID = CH_INCIDENT;

export function findChannel(channelId: string): ChannelFixture | undefined {
  return CHANNELS.find((c) => c.id === channelId);
}

export function viaLabel(ref: Reference): string {
  switch (ref.source) {
    case 'permalink':
      return ref.fromUser
        ? `permalink from ${ref.fromUser}`
        : 'permalink';
    case 'mention':
      return ref.fromUser
        ? `mentioned by ${ref.fromUser}`
        : 'mention notification';
    case 'recommendation':
      return ref.fromUser
        ? `recommendation from ${ref.fromUser}`
        : 'channel recommendation';
    case 'prior-membership':
      return 'prior member';
  }
}

export function useReferenceForChannel() {
  return useCallback(
    (refs: Reference[], channelId: string): Reference | undefined => {
      return refs.find((r) => r.channelId === channelId);
    },
    [],
  );
}
