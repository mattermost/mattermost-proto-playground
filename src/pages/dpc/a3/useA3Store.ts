/**
 * DPC A3 — local state machine for the Curated Directory prototype.
 *
 * Models the A3-specific mechanism per §3.3 of the Phase 5 flow-review doc:
 *
 *   - A separate **Channel Directory** holds references to private channels.
 *   - Channels themselves carry no Discoverable attribute.
 *   - A channel becomes discoverable when a channel admin adds it to the
 *     directory via the channel-header `⋮` → "Add to Channel Directory"
 *     action (§3.3.4).
 *   - Atomicity-by-construction: the directory entry can only be created
 *     after the channel and its access rules already exist; there is no
 *     race window (§3.3.4 FR-3 atomicity check).
 *   - The Request lifecycle is tied to the **channel_id**, not the
 *     directory_entry_id (§3.3.3). Removing the directory entry while a
 *     request is pending fires an FR-10 analog auto-withdrawal with a
 *     dedicated DM (§3.3.9).
 *   - Three new audit event types: Directory_entry_added,
 *     Directory_entry_removed, Directory_entry_orphaned (§3.3.7).
 *   - Orphaned-entry case (V-A3-2) is demonstrated explicitly via a toggle.
 *
 * The state machine is intentionally local — A3 does not share state with
 * A1/A2/A4. Shared fixtures (personas, channels, supporting users, audit
 * builder) are imported from `@/pages/dpc/shared`.
 */
import { useCallback, useMemo, useReducer } from 'react';
import {
  CHANNELS,
  PERSONAS,
  SEED_AUDIT_EVENTS,
  makeAudit,
  type AuditEvent,
  type ChannelFixture,
  type Persona,
} from '@/pages/dpc/shared';

// ── Types ────────────────────────────────────────────────────────────────

export interface DirectoryEntry {
  /** Foreign-key reference to ChannelFixture.id — never a separate "directory id". */
  channelId: string;
  /** Username of the channel admin who added the entry. */
  addedBy: string;
  /** ISO timestamp. */
  addedAt: string;
}

export type RequestStatus = 'pending' | 'approved' | 'denied' | 'withdrawn';

export interface PendingRequest {
  /** Lifecycle is tied to the channel, not the directory entry (§3.3.3). */
  channelId: string;
  /** Requesting user username. */
  requesterUsername: string;
  /** ISO timestamp. */
  submittedAt: string;
  status: RequestStatus;
  /** Free-text rationale supplied by the requester (FR-17 plain text). */
  rationale: string;
  /** Optional denial reason supplied by the admin on Deny (FR-17). */
  denyReason?: string;
  /**
   * Reason an auto-withdrawal was fired, for the DM copy variant
   * resolution (§3.3.9):
   *   - 'directory_entry_removed' → FR-10 analog
   *   - 'channel_deleted' → FR-11
   */
  withdrawnCause?: 'directory_entry_removed' | 'channel_deleted' | 'self';
}

export interface A3State {
  /** Directory entries — references to channels (FR-3 atomicity by construction). */
  directoryEntries: DirectoryEntry[];
  /** Whether the Add-to-Directory confirm dialog is open. */
  directoryAddDialogOpen: boolean;
  /** Whether the Remove-from-Directory confirm dialog is open. */
  directoryRemoveDialogOpen: boolean;
  /** Channel id targeted by the open dialog (null when no dialog is open). */
  directoryDialogTargetChannel: string | null;
  /** Request-to-Join modal target (channel id) or null if closed. */
  requestModalTargetChannel: string | null;
  /** Step the Request-to-Join modal is on. */
  requestModalStep: 'form' | 'confirm' | 'closed';
  /** All request-lifecycle entries in the prototype's local universe. */
  pendingRequests: PendingRequest[];
  /** Channel ids the current user has an open request for. */
  myPendingRequests: string[];
  /** Channel ids the current user has joined (post-approval). */
  joinedChannels: string[];
  /**
   * Channels the current user previously left but which remain in the
   * directory — re-renders naturally inside ChannelDirectorySurface so no
   * separate L&R surface is needed (§3.3.6).
   */
  rejoinableViaDirectory: string[];
  /** FR-13 audit events emitted by this prototype, newest-first. */
  auditEvents: AuditEvent[];
  /**
   * Toggle for the V-A3-2 orphaned-entry demonstration. When true, the
   * directory list includes one entry whose underlying channel "no longer
   * exists" — exercising the read-side sanity check and the sweep-pruned
   * fallback row (§3.3.10).
   */
  orphanedEntryDemo: boolean;
  /** Last DM preview the active end-user persona received (preview state). */
  lastDm: {
    kind: 'approved' | 'denied' | 'channel_deleted' | 'directory_removed';
    channelId: string;
    actorUsername: string;
    reason?: string;
  } | null;
}

// ── Action shapes ────────────────────────────────────────────────────────

export type A3Action =
  | { type: 'ADD_TO_DIRECTORY'; channelId: string; adminUsername: string }
  | { type: 'REMOVE_FROM_DIRECTORY'; channelId: string; adminUsername: string }
  | { type: 'OPEN_ADD_DIALOG'; channelId: string }
  | { type: 'CLOSE_ADD_DIALOG' }
  | { type: 'OPEN_REMOVE_DIALOG'; channelId: string }
  | { type: 'CLOSE_REMOVE_DIALOG' }
  | { type: 'OPEN_REQUEST_MODAL'; channelId: string }
  | { type: 'ADVANCE_REQUEST_MODAL' }
  | { type: 'CLOSE_REQUEST_MODAL' }
  | {
      type: 'SUBMIT_REQUEST';
      channelId: string;
      requesterUsername: string;
      rationale: string;
    }
  | { type: 'WITHDRAW_REQUEST'; channelId: string; requesterUsername: string }
  | {
      type: 'APPROVE_REQUEST';
      channelId: string;
      requesterUsername: string;
      adminUsername: string;
    }
  | {
      type: 'DENY_REQUEST';
      channelId: string;
      requesterUsername: string;
      adminUsername: string;
      reason: string;
    }
  | { type: 'LEAVE_CHANNEL'; channelId: string }
  | { type: 'TOGGLE_ORPHANED_DEMO' }
  | { type: 'CLEAR_DM_PREVIEW' };

// ── Initial state ────────────────────────────────────────────────────────

const adminUsername = PERSONAS['channel-admin'].username;
const tenuredUsername = PERSONAS['end-user-tenured'].username;

const seedDirectoryEntries: DirectoryEntry[] = CHANNELS.filter(
  (c) => c.kind === 'private' && c.inDirectory,
).map((c) => ({
  channelId: c.id,
  addedBy: adminUsername,
  addedAt: '2026-05-12T13:08:42Z',
}));

const seedPendingRequests: PendingRequest[] = [
  {
    channelId: 'ch-002',
    requesterUsername: tenuredUsername,
    submittedAt: '2026-05-13T09:14:08Z',
    status: 'pending',
    rationale:
      'Rotating into Q3 planning support; need visibility on operational checkpoints.',
  },
];

const seedAuditEvents: AuditEvent[] = [
  ...SEED_AUDIT_EVENTS,
  makeAudit({
    actor: adminUsername,
    action: 'Directory_entry_added',
    resource: 'ch-002',
    ts: '2026-05-12T13:08:42Z',
    meta: { directory_entry_id: 'de-ch-002' },
  }),
  makeAudit({
    actor: adminUsername,
    action: 'Directory_entry_added',
    resource: 'ch-003',
    ts: '2026-05-12T14:02:11Z',
    meta: { directory_entry_id: 'de-ch-003' },
  }),
  makeAudit({
    actor: tenuredUsername,
    action: 'Request_submitted',
    resource: 'ch-002',
    ts: '2026-05-13T09:14:08Z',
    meta: { channel_id: 'ch-002', prior_membership: false },
  }),
];

const INITIAL_STATE: A3State = {
  directoryEntries: seedDirectoryEntries,
  directoryAddDialogOpen: false,
  directoryRemoveDialogOpen: false,
  directoryDialogTargetChannel: null,
  requestModalTargetChannel: null,
  requestModalStep: 'closed',
  pendingRequests: seedPendingRequests,
  myPendingRequests: [],
  joinedChannels: [],
  rejoinableViaDirectory: [],
  auditEvents: seedAuditEvents,
  orphanedEntryDemo: false,
  lastDm: null,
};

// ── Reducer ──────────────────────────────────────────────────────────────

function reducer(state: A3State, action: A3Action): A3State {
  switch (action.type) {
    case 'OPEN_ADD_DIALOG':
      return {
        ...state,
        directoryAddDialogOpen: true,
        directoryRemoveDialogOpen: false,
        directoryDialogTargetChannel: action.channelId,
      };

    case 'CLOSE_ADD_DIALOG':
      return {
        ...state,
        directoryAddDialogOpen: false,
        directoryDialogTargetChannel: state.directoryRemoveDialogOpen
          ? state.directoryDialogTargetChannel
          : null,
      };

    case 'OPEN_REMOVE_DIALOG':
      return {
        ...state,
        directoryRemoveDialogOpen: true,
        directoryAddDialogOpen: false,
        directoryDialogTargetChannel: action.channelId,
      };

    case 'CLOSE_REMOVE_DIALOG':
      return {
        ...state,
        directoryRemoveDialogOpen: false,
        directoryDialogTargetChannel: state.directoryAddDialogOpen
          ? state.directoryDialogTargetChannel
          : null,
      };

    case 'ADD_TO_DIRECTORY': {
      if (
        state.directoryEntries.some((e) => e.channelId === action.channelId)
      ) {
        return {
          ...state,
          directoryAddDialogOpen: false,
          directoryDialogTargetChannel: null,
        };
      }
      const entry: DirectoryEntry = {
        channelId: action.channelId,
        addedBy: action.adminUsername,
        addedAt: new Date().toISOString(),
      };
      return {
        ...state,
        directoryEntries: [...state.directoryEntries, entry],
        directoryAddDialogOpen: false,
        directoryDialogTargetChannel: null,
        auditEvents: [
          makeAudit({
            actor: action.adminUsername,
            action: 'Directory_entry_added',
            resource: action.channelId,
            meta: { directory_entry_id: `de-${action.channelId}` },
          }),
          ...state.auditEvents,
        ],
      };
    }

    case 'REMOVE_FROM_DIRECTORY': {
      // FR-10 analog: auto-withdraw any pending requests against this channel.
      const affectedPending = state.pendingRequests.filter(
        (r) => r.channelId === action.channelId && r.status === 'pending',
      );
      const nextPending = state.pendingRequests.map((r) =>
        r.channelId === action.channelId && r.status === 'pending'
          ? {
              ...r,
              status: 'withdrawn' as RequestStatus,
              withdrawnCause: 'directory_entry_removed' as const,
            }
          : r,
      );

      const auditAdditions: AuditEvent[] = [
        makeAudit({
          actor: action.adminUsername,
          action: 'Directory_entry_removed',
          resource: action.channelId,
          meta: {
            directory_entry_id: `de-${action.channelId}`,
            pending_requests_auto_withdrawn: affectedPending.length,
          },
        }),
        ...affectedPending.map((p) =>
          makeAudit({
            actor: 'system',
            action: 'Request_withdrawn',
            resource: action.channelId,
            meta: {
              requester: p.requesterUsername,
              cause: 'directory_entry_removed',
            },
          }),
        ),
      ];

      // If the active user had a pending request, surface the DM preview.
      const myWithdraw = affectedPending[0];
      const nextDm =
        myWithdraw != null
          ? {
              kind: 'directory_removed' as const,
              channelId: action.channelId,
              actorUsername: action.adminUsername,
            }
          : state.lastDm;

      return {
        ...state,
        directoryEntries: state.directoryEntries.filter(
          (e) => e.channelId !== action.channelId,
        ),
        directoryRemoveDialogOpen: false,
        directoryDialogTargetChannel: null,
        pendingRequests: nextPending,
        myPendingRequests: state.myPendingRequests.filter(
          (id) => id !== action.channelId,
        ),
        auditEvents: [...auditAdditions, ...state.auditEvents],
        lastDm: nextDm,
      };
    }

    case 'OPEN_REQUEST_MODAL':
      return {
        ...state,
        requestModalTargetChannel: action.channelId,
        requestModalStep: 'form',
      };

    case 'ADVANCE_REQUEST_MODAL':
      return {
        ...state,
        requestModalStep:
          state.requestModalStep === 'form' ? 'confirm' : state.requestModalStep,
      };

    case 'CLOSE_REQUEST_MODAL':
      return {
        ...state,
        requestModalTargetChannel: null,
        requestModalStep: 'closed',
      };

    case 'SUBMIT_REQUEST': {
      const existing = state.pendingRequests.find(
        (r) =>
          r.channelId === action.channelId &&
          r.requesterUsername === action.requesterUsername &&
          r.status === 'pending',
      );
      if (existing != null) {
        return {
          ...state,
          requestModalTargetChannel: null,
          requestModalStep: 'closed',
        };
      }
      const newReq: PendingRequest = {
        channelId: action.channelId,
        requesterUsername: action.requesterUsername,
        submittedAt: new Date().toISOString(),
        status: 'pending',
        rationale: action.rationale,
      };
      return {
        ...state,
        pendingRequests: [newReq, ...state.pendingRequests],
        myPendingRequests: state.myPendingRequests.includes(action.channelId)
          ? state.myPendingRequests
          : [...state.myPendingRequests, action.channelId],
        requestModalTargetChannel: null,
        requestModalStep: 'closed',
        auditEvents: [
          makeAudit({
            actor: action.requesterUsername,
            action: 'Request_submitted',
            resource: action.channelId,
            meta: {
              channel_id: action.channelId,
              prior_membership: state.rejoinableViaDirectory.includes(
                action.channelId,
              ),
            },
          }),
          ...state.auditEvents,
        ],
      };
    }

    case 'WITHDRAW_REQUEST': {
      return {
        ...state,
        pendingRequests: state.pendingRequests.map((r) =>
          r.channelId === action.channelId &&
          r.requesterUsername === action.requesterUsername &&
          r.status === 'pending'
            ? {
                ...r,
                status: 'withdrawn' as RequestStatus,
                withdrawnCause: 'self' as const,
              }
            : r,
        ),
        myPendingRequests: state.myPendingRequests.filter(
          (id) => id !== action.channelId,
        ),
        auditEvents: [
          makeAudit({
            actor: action.requesterUsername,
            action: 'Request_withdrawn',
            resource: action.channelId,
            meta: { cause: 'self' },
          }),
          ...state.auditEvents,
        ],
      };
    }

    case 'APPROVE_REQUEST': {
      return {
        ...state,
        pendingRequests: state.pendingRequests.map((r) =>
          r.channelId === action.channelId &&
          r.requesterUsername === action.requesterUsername &&
          r.status === 'pending'
            ? { ...r, status: 'approved' as RequestStatus }
            : r,
        ),
        myPendingRequests: state.myPendingRequests.filter(
          (id) => id !== action.channelId,
        ),
        joinedChannels: state.joinedChannels.includes(action.channelId)
          ? state.joinedChannels
          : [...state.joinedChannels, action.channelId],
        lastDm: {
          kind: 'approved',
          channelId: action.channelId,
          actorUsername: action.adminUsername,
        },
        auditEvents: [
          makeAudit({
            actor: action.adminUsername,
            action: 'Request_approved',
            resource: action.channelId,
            meta: { requester: action.requesterUsername },
          }),
          ...state.auditEvents,
        ],
      };
    }

    case 'DENY_REQUEST': {
      return {
        ...state,
        pendingRequests: state.pendingRequests.map((r) =>
          r.channelId === action.channelId &&
          r.requesterUsername === action.requesterUsername &&
          r.status === 'pending'
            ? {
                ...r,
                status: 'denied' as RequestStatus,
                denyReason: action.reason,
              }
            : r,
        ),
        myPendingRequests: state.myPendingRequests.filter(
          (id) => id !== action.channelId,
        ),
        lastDm: {
          kind: 'denied',
          channelId: action.channelId,
          actorUsername: action.adminUsername,
          reason: action.reason,
        },
        auditEvents: [
          makeAudit({
            actor: action.adminUsername,
            action: 'Request_denied',
            resource: action.channelId,
            meta: {
              requester: action.requesterUsername,
              reason: action.reason,
            },
          }),
          ...state.auditEvents,
        ],
      };
    }

    case 'LEAVE_CHANNEL': {
      return {
        ...state,
        joinedChannels: state.joinedChannels.filter(
          (id) => id !== action.channelId,
        ),
        rejoinableViaDirectory: state.rejoinableViaDirectory.includes(
          action.channelId,
        )
          ? state.rejoinableViaDirectory
          : [...state.rejoinableViaDirectory, action.channelId],
      };
    }

    case 'TOGGLE_ORPHANED_DEMO': {
      const turningOn = !state.orphanedEntryDemo;
      const next: A3State = {
        ...state,
        orphanedEntryDemo: turningOn,
      };
      if (turningOn) {
        // Demonstrate the deletion-cascade by enqueueing the prune event.
        return {
          ...next,
          auditEvents: [
            makeAudit({
              actor: 'system',
              action: 'Directory_entry_orphaned',
              resource: 'ch-orphaned-demo',
              meta: {
                directory_entry_id: 'de-ch-orphaned-demo',
                cause: 'channel_deleted',
                outcome: 'pruned',
              },
              outcome: 'success',
            }),
            ...next.auditEvents,
          ],
        };
      }
      return next;
    }

    case 'CLEAR_DM_PREVIEW':
      return { ...state, lastDm: null };

    default:
      return state;
  }
}

// ── Public hook ──────────────────────────────────────────────────────────

export interface UseA3StoreOptions {
  /** Persona currently driving the prototype — used by a few helper selectors. */
  persona: Persona;
}

export interface A3Store {
  state: A3State;
  dispatch: React.Dispatch<A3Action>;
  // Helpers — keep call-sites readable.
  /** True if a channel currently has a directory entry (excluding the orphaned demo). */
  isChannelInDirectory: (channelId: string) => boolean;
  /** Pending requests across the channels the current admin manages. */
  pendingForAdmin: (adminUsername: string) => PendingRequest[];
  /** Pending requests for a specific channel (latest first). */
  pendingForChannel: (channelId: string) => PendingRequest[];
  /** Channel fixture lookup helper. */
  channelById: (channelId: string) => ChannelFixture | undefined;
  /** Mocked synthetic orphaned channel fixture used only by the orphan demo. */
  orphanedChannelFixture: ChannelFixture;
}

const ORPHANED_DEMO_FIXTURE: ChannelFixture = {
  id: 'ch-orphaned-demo',
  name: 'archived-program-rho',
  displayName: 'archived-program-rho',
  purpose: 'Coordination for Program Rho — wound down 30 days ago.',
  kind: 'private',
  discoverable: true,
  inDirectory: true,
  memberCount: 0,
  policyKey: null,
  allowKnocks: false,
};

export function useA3Store(_options: UseA3StoreOptions): A3Store {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const channelById = useCallback(
    (channelId: string): ChannelFixture | undefined => {
      if (channelId === ORPHANED_DEMO_FIXTURE.id) return ORPHANED_DEMO_FIXTURE;
      return CHANNELS.find((c) => c.id === channelId);
    },
    [],
  );

  const isChannelInDirectory = useCallback(
    (channelId: string) =>
      state.directoryEntries.some((e) => e.channelId === channelId),
    [state.directoryEntries],
  );

  const pendingForChannel = useCallback(
    (channelId: string) =>
      state.pendingRequests.filter(
        (r) => r.channelId === channelId && r.status === 'pending',
      ),
    [state.pendingRequests],
  );

  const pendingForAdmin = useCallback(
    (_adminUsername: string) => {
      // In the prototype universe, the channel-admin persona owns every
      // directory entry — surface pending requests across all entries.
      return state.pendingRequests.filter(
        (r) =>
          r.status === 'pending' &&
          state.directoryEntries.some((e) => e.channelId === r.channelId),
      );
    },
    [state.pendingRequests, state.directoryEntries],
  );

  return useMemo<A3Store>(
    () => ({
      state,
      dispatch,
      isChannelInDirectory,
      pendingForAdmin,
      pendingForChannel,
      channelById,
      orphanedChannelFixture: ORPHANED_DEMO_FIXTURE,
    }),
    [
      state,
      isChannelInDirectory,
      pendingForAdmin,
      pendingForChannel,
      channelById,
    ],
  );
}
