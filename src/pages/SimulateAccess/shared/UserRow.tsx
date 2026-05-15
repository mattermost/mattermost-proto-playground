import { useRef, useState } from 'react';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import Icon from '@/components/ui/Icon/Icon';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import CloseIcon from '@mattermost/compass-icons/components/close';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import Button from '@/components/ui/Button/Button';
import VerdictPill from './VerdictPill';
import SessionRow from './SessionRow';
import CustomSessionPersistentCard from './CustomSessionPersistentCard';
import CustomSessionGhostRow from './CustomSessionGhostRow';
import WhatIfRow, { whatIfFromSession, whatIfFromDefaults } from './WhatIfRow';
import type { WhatIfInstance } from './WhatIfRow';
import SessionChip from './SessionChip';
import SessionChipDetailPopover from './SessionChipDetailPopover';
import NewCustomSessionPopover from './NewCustomSessionPopover';
import { attributesUsedByPolicy, buildCustomSession, fieldsToAttributes } from './customSession';
import type { CustomSessionFields } from './customSession';
import type {
  UserSimulationRow,
  AdminRole,
  EntryContext,
  EditorScope,
  PolicyContext,
} from './types';
import styles from './SimulateAccess.module.scss';

/**
 * Affordance for testing custom session attribute values.
 * - 'edit-values' (default): pencil icon on each session opens override popover.
 * - 'persistent-card': v1 Option C — persistent card; replaces pencil.
 * - 'inline-ghost': v1 Option B — ghost row at bottom of sessions; replaces pencil.
 * - 'custom-session': v3 final — single "Add custom session" at the bottom of the
 *    session list. Auto-clones the most recent session (or compliant defaults if
 *    none). One per user.
 * - 'custom-session-source-picker': v3 variant A — same as custom-session but the
 *    custom row carries an inline source picker so the admin can switch which
 *    real session it's seeded from.
 */
export type CustomSessionMode =
  | 'edit-values'
  | 'persistent-card'
  | 'inline-ghost'
  | 'custom-session'
  | 'custom-session-source-picker'
  | 'custom-session-chips';

/** Cap on custom session instances per user (row-based modes). */
const MAX_CUSTOM_SESSIONS_PER_USER = 1;

export interface UserRowProps {
  user: UserSimulationRow;
  role: AdminRole;
  context: EntryContext;
  scope: EditorScope;
  policy?: PolicyContext;
  /** Reserved for future row-shape variations. */
  multiAction?: boolean;
  /** When true, the per-session expand affordance is hidden. Used when the policy doesn't reference session attributes. */
  hideSessions?: boolean;
  /** Affordance used to test custom session attribute values. Default: 'edit-values'. */
  customSessionMode?: CustomSessionMode;
  /** Map of sessionId -> count of overridden attrs. */
  sessionOverrideCounts?: Record<string, number>;
  /** Currently-open edit popover session id, if any (for active button styling). */
  activeEditSessionId?: string | null;
  onRemove: (userId: string) => void;
  onPerPermissionForUser?: (rect: DOMRect) => void;
  onPerPermissionForSession?: (sessionId: string, rect: DOMRect) => void;
  onEditSession?: (sessionId: string, rect: DOMRect) => void;
}

export default function UserRow({
  user,
  role,
  context,
  scope,
  policy,
  hideSessions = false,
  customSessionMode = 'edit-values',
  sessionOverrideCounts = {},
  activeEditSessionId = null,
  onRemove,
  onPerPermissionForUser,
  onPerPermissionForSession,
  onEditSession,
}: UserRowProps) {
  const [expanded, setExpanded] = useState(false);

  // Custom session instances live at user-row level. Capped at 1 per user.
  const [whatIfs, setWhatIfs] = useState<WhatIfInstance[]>([]);

  /** Auto-seed: clone most recent real session, or compliant defaults if none. */
  function addAutoSeededCustomSession() {
    if (whatIfs.length >= MAX_CUSTOM_SESSIONS_PER_USER) return;
    const realSessions = user.sessions.filter((s) => !s.isPlaceholder);
    if (realSessions.length > 0) {
      const wi = whatIfFromSession(user, realSessions[0].sessionId);
      if (wi) setWhatIfs((prev) => [...prev, wi]);
    } else {
      setWhatIfs((prev) => [...prev, whatIfFromDefaults(user)]);
    }
  }

  /** Reseed an existing custom session from a different source — used by the picker variant. */
  function reseedCustomSession(id: string, sourceSessionId: string | null) {
    if (sourceSessionId === null) {
      setWhatIfs((prev) =>
        prev.map((w) => (w.id === id ? { ...whatIfFromDefaults(user), id } : w)),
      );
      return;
    }
    const reseeded = whatIfFromSession(user, sourceSessionId);
    if (!reseeded) return;
    setWhatIfs((prev) => prev.map((w) => (w.id === id ? { ...reseeded, id } : w)));
  }

  function updateWhatIf(next: WhatIfInstance) {
    setWhatIfs((prev) => prev.map((w) => (w.id === next.id ? next : w)));
  }
  function discardWhatIf(id: string) {
    setWhatIfs((prev) => prev.filter((w) => w.id !== id));
  }

  // Custom-session affordance: only system admins. Channel admins can't see raw
  // session attribute values per the privacy rule, so they can't construct synthetic
  // sessions either. Gating on role only — context-independent.
  const showCustomSession = role === 'system' && customSessionMode !== 'edit-values';
  const isCustomSessionMode =
    customSessionMode === 'custom-session' || customSessionMode === 'custom-session-source-picker';
  const isChipMode = customSessionMode === 'custom-session-chips';
  const showCustomSessionSection = role === 'system' && isCustomSessionMode;
  const showSourcePicker = customSessionMode === 'custom-session-source-picker';
  const atCustomSessionCap = whatIfs.length >= MAX_CUSTOM_SESSIONS_PER_USER;
  const manyAttributes = (attributesUsedByPolicy(policy) ?? []).length >= 5;

  // Chip-mode state
  const [chipDetail, setChipDetail] = useState<{
    kind: 'real' | 'custom';
    sessionId: string;
    triggerRect: DOMRect;
  } | null>(null);
  const [addPopoverRect, setAddPopoverRect] = useState<DOMRect | null>(null);
  const [addPrefill, setAddPrefill] = useState<{ sourceSessionId: string | null; fields: CustomSessionFields } | null>(null);

  /**
   * Track the source chip when admin opens the popover via "Tweak as new" so the
   * commit handler can emit the right audit event kind. Cleared on close.
   */
  const tweakOriginRef = useRef<string | null>(null);

  function commitNewChip(sourceSessionId: string | null, fields: CustomSessionFields) {
    const synthetic = buildCustomSession(fields, policy);
    const newId = 'wi-' + Math.random().toString(36).slice(2, 8);
    setWhatIfs((prev) => [
      ...prev,
      { id: newId, sourceSessionId, source: { ...fields }, current: { ...fields } },
    ]);
    // Emit the appropriate audit event based on whether this commit was a fresh add
    // or the result of a Tweak-as-new flow. Compliance lens specifically required
    // emit-on-commit (not on popover-open / intent).
    if (tweakOriginRef.current) {
      // TODO(IL5): emit audit event { kind: 'custom_session.tweak_as_new', synthetic: true, userId: user.userId, newChipId: newId, fromChipId: tweakOriginRef.current, fields, sourceSessionId, ts }
      tweakOriginRef.current = null;
    } else {
      // TODO(IL5): emit audit event { kind: 'custom_session.create', synthetic: true, userId: user.userId, chipId: newId, fields, sourceSessionId, ts }
    }
    void synthetic;
  }

  /** Tweak-as-new: open the new-custom-session popover pre-filled from an existing chip. */
  function openTweakAsNew(wi: WhatIfInstance, triggerRect: DOMRect) {
    setChipDetail(null);
    setAddPrefill({ sourceSessionId: wi.sourceSessionId, fields: { ...wi.current } });
    setAddPopoverRect(triggerRect);
    tweakOriginRef.current = wi.id;
    // No audit emit here — this is intent, not action. Audit fires on commitNewChip.
  }

  function discardWhatIfWithAudit(id: string) {
    discardWhatIf(id);
    // TODO(IL5): emit audit event { kind: 'custom_session.discard', synthetic: true, userId: user.userId, chipId: id, ts }
  }
  void fieldsToAttributes;
  const canExpand = !hideSessions && !user.isNonMember && (user.sessions.length > 0 || showCustomSession);
  const totalSessions = user.sessions.length;
  const sessionsLabel = (() => {
    if (hideSessions) return '';
    if (user.isNonMember) return '0 sessions';
    if (totalSessions === 0) return '0 sessions';
    if (totalSessions === 1) return '1 session';
    return `${totalSessions} sessions`;
  })();

  function handleRowClick() {
    if (!canExpand) return;
    setExpanded((p) => !p);
  }

  return (
    <>
      <div
        className={[
          styles['sa-row'],
          expanded && styles['sa-row--expanded'],
          !canExpand && styles['sa-row--non-clickable'],
        ].filter(Boolean).join(' ')}
        onClick={handleRowClick}
        role={canExpand ? 'button' : undefined}
        tabIndex={canExpand ? 0 : undefined}
        aria-expanded={canExpand ? expanded : undefined}
        onKeyDown={(e) => {
          if (canExpand && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleRowClick();
          }
        }}
      >
        <div className={styles['sa-row__avatar']}>
          <UserAvatar src={user.avatarSrc} alt={user.name} size="32" />
        </div>
        <div className={styles['sa-row__name']}>
          <span className={styles['sa-row__name-text']}>{user.name}</span>
          <span className={styles['sa-row__handle']}>@{user.handle}</span>
        </div>
        <div className={styles['sa-row__verdict']}>
          <VerdictPill
            verdict={user.aggregateVerdict}
            role={role}
            context={context}
            scope={scope}
            onClick={
              onPerPermissionForUser
                ? (e) => {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    onPerPermissionForUser(rect);
                  }
                : undefined
            }
          />
        </div>
        {hideSessions ? null : (
          <>
            <span className={styles['sa-row__sessions']}>{sessionsLabel}</span>
            <span className={styles['sa-row__chevron']} aria-hidden>
              {canExpand && <Icon glyph={<ChevronDownIcon />} size="16" />}
            </span>
          </>
        )}
        <button
          type="button"
          className={styles['sa-row__remove']}
          aria-label={`Remove ${user.name} from simulation`}
          title={`Remove ${user.name}`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(user.userId);
          }}
        >
          <Icon glyph={<CloseIcon />} size="16" />
        </button>
      </div>

      {user.isNonMember && (
        <div className={styles['sa-not-member-row']}>
          This user is not a member of this channel. Permission policies aren't evaluated for non-members.
        </div>
      )}

      {expanded && !user.isNonMember && isChipMode && (
        <div className={styles['sa-sessions']}>
          <div className={styles['sa-recent-sessions']}>
            <span className={styles['sa-recent-sessions__label']}>Recent Sessions</span>
            <div className={styles['sa-chip-row']}>
              {/* Real session chips, including a placeholder pseudo-chip for 0-session users */}
              {user.sessions.map((s) => (
                <SessionChip
                  key={s.sessionId}
                  kind={s.isPlaceholder ? 'placeholder' : 'real'}
                  verdict={s.verdict}
                  label={s.isPlaceholder ? 'No recent session' : s.deviceLabel}
                  active={chipDetail?.kind === 'real' && chipDetail.sessionId === s.sessionId}
                  onClick={
                    s.isPlaceholder
                      ? undefined
                      : (rect) => setChipDetail({ kind: 'real', sessionId: s.sessionId, triggerRect: rect })
                  }
                  ariaLabel={`${s.deviceLabel} — ${s.verdict}`}
                />
              ))}

              {/* Custom session chips */}
              {role === 'system' &&
                whatIfs.map((wi) => {
                  const synthetic = buildCustomSession(wi.current, policy);
                  const sourceSession = wi.sourceSessionId === null
                    ? null
                    : user.sessions.find((s) => s.sessionId === wi.sourceSessionId);
                  // Chip label: short device name when cloned from a real session;
                  // when built from compliant defaults, show no source — just "Custom session".
                  // Long source labels (e.g. "compliant defaults") fail the screenshot legibility
                  // test at 50% downscale (DoD admin validation finding).
                  const chipLabel = sourceSession ? sourceSession.deviceLabel : 'session';
                  const ariaSourceLabel = sourceSession ? sourceSession.deviceLabel : 'compliant defaults';
                  return (
                    <SessionChip
                      key={wi.id}
                      kind="custom"
                      verdict={synthetic.verdict}
                      label={chipLabel}
                      active={chipDetail?.kind === 'custom' && chipDetail.sessionId === wi.id}
                      onClick={(rect) =>
                        setChipDetail({ kind: 'custom', sessionId: wi.id, triggerRect: rect })
                      }
                      ariaLabel={`Custom session from ${ariaSourceLabel} — ${synthetic.verdict}`}
                    />
                  );
                })}

              {/* Add custom session pseudo-chip — system admin only */}
              {role === 'system' && (
                <SessionChip
                  kind="add"
                  onClick={(rect) => setAddPopoverRect(rect)}
                />
              )}
            </div>
          </div>

          {/* Detail popover for any chip click */}
          {chipDetail && (() => {
            if (chipDetail.kind === 'real') {
              const s = user.sessions.find((x) => x.sessionId === chipDetail.sessionId);
              if (!s) return null;
              return (
                <SessionChipDetailPopover
                  triggerRect={chipDetail.triggerRect}
                  title={s.deviceLabel}
                  subtitle={`Last active ${s.lastActive}`}
                  isCustom={false}
                  verdict={s.verdict}
                  cellVerdicts={s.cellVerdicts}
                  attributes={s.attributes}
                  role={role}
                  context={context}
                  scope={scope}
                  onClose={() => setChipDetail(null)}
                />
              );
            }
            // custom
            const wi = whatIfs.find((x) => x.id === chipDetail.sessionId);
            if (!wi) return null;
            const synthetic = buildCustomSession(wi.current, policy);
            const sourceLabel =
              wi.sourceSessionId === null
                ? 'compliant defaults'
                : user.sessions.find((s) => s.sessionId === wi.sourceSessionId)?.deviceLabel ?? 'a session';
            return (
              <SessionChipDetailPopover
                triggerRect={chipDetail.triggerRect}
                title="Custom session"
                subtitle={`Cloned from ${sourceLabel}`}
                isCustom={true}
                verdict={synthetic.verdict}
                cellVerdicts={synthetic.cellVerdicts}
                attributes={synthetic.attributes}
                role={role}
                context={context}
                scope={scope}
                onClose={() => setChipDetail(null)}
                onDiscard={() => discardWhatIfWithAudit(wi.id)}
                onTweak={() => openTweakAsNew(wi, chipDetail.triggerRect)}
              />
            );
          })()}

          {/* Add-new popover (also used for Tweak-as-new with prefill) */}
          {addPopoverRect && (
            <NewCustomSessionPopover
              triggerRect={addPopoverRect}
              user={user}
              policy={policy}
              role={role}
              context={context}
              scope={scope}
              prefill={addPrefill ?? undefined}
              onClose={() => {
                setAddPopoverRect(null);
                setAddPrefill(null);
              }}
              onCommit={(sourceSessionId, fields) => {
                commitNewChip(sourceSessionId, fields);
                setAddPrefill(null);
              }}
            />
          )}
        </div>
      )}

      {expanded && !user.isNonMember && !isChipMode && (
        <div className={styles['sa-sessions']}>
          {/*
            For v1 custom-session modes (persistent-card, inline-ghost) the
            fail-secure-deny placeholder is suppressed — the affordance owns the
            empty case. For v3 'custom-session(*)' modes, we keep the placeholder
            row visible (label + verdict) but drop the explanatory footer note.
          */}
          {(customSessionMode === 'persistent-card' || customSessionMode === 'inline-ghost'
            ? user.sessions.filter((s) => !s.isPlaceholder)
            : user.sessions
          ).map((session) => (
            <SessionRow
              key={session.sessionId}
              session={session}
              role={role}
              context={context}
              scope={scope}
              policy={policy}
              editActive={activeEditSessionId === session.sessionId}
              overrideCount={sessionOverrideCounts[session.sessionId] ?? 0}
              hideEdit={customSessionMode !== 'edit-values'}
              hidePlaceholderNote={isCustomSessionMode}
              onPillClick={
                onPerPermissionForSession
                  ? (rect) => onPerPermissionForSession(session.sessionId, rect)
                  : undefined
              }
              onEditClick={
                onEditSession ? (rect) => onEditSession(session.sessionId, rect) : undefined
              }
            />
          ))}

          {/* v3 custom session — single row at the bottom of the session list */}
          {showCustomSessionSection && whatIfs.map((wi) => (
            <WhatIfRow
              key={wi.id}
              user={user}
              whatIf={wi}
              role={role}
              context={context}
              scope={scope}
              policy={policy}
              manyAttributes={manyAttributes}
              showSourcePicker={showSourcePicker}
              onChange={updateWhatIf}
              onDiscard={() => discardWhatIf(wi.id)}
              onReseed={(sourceSessionId) => reseedCustomSession(wi.id, sourceSessionId)}
            />
          ))}

          {/* Add-custom-session button — single per-user, sits at the bottom of the session list */}
          {showCustomSessionSection && !atCustomSessionCap && (
            <button
              type="button"
              className={styles['sa-add-custom-session']}
              onClick={addAutoSeededCustomSession}
            >
              <Icon glyph={<PlusIcon />} size="12" />
              Add custom session
            </button>
          )}

          {showCustomSession && customSessionMode === 'persistent-card' && (
            <CustomSessionPersistentCard
              user={user}
              role={role}
              context={context}
              scope={scope}
              policy={policy}
            />
          )}

          {showCustomSession && customSessionMode === 'inline-ghost' && (
            <CustomSessionGhostRow
              user={user}
              role={role}
              context={context}
              scope={scope}
              policy={policy}
            />
          )}
        </div>
      )}
    </>
  );
}

// Suppress unused-import warning.
void Button;
