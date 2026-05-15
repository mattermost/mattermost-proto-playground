import { useEffect, useMemo, useRef, useState } from 'react';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import AccountOutlineIcon from '@mattermost/compass-icons/components/account-outline';
import SearchInput from './SearchInput';
import UserRow from './UserRow';
import type { CustomSessionMode } from './UserRow';
import DecisionDetailsModal from './DecisionDetailsModal';
import EditAttributesPopover from './EditAttributesPopover';
import { ACTION_LABELS } from './types';
import type {
  AdminRole,
  EditorScope,
  EntryContext,
  PermissionAction,
  PolicyContext,
  UserSimulationRow,
} from './types';
import styles from './SimulateAccess.module.scss';

export interface SimulateAccessModalProps {
  role: AdminRole;
  context: EntryContext;
  policy?: PolicyContext;
  channelName?: string;
  initialUsers?: UserSimulationRow[];
  userPool: UserSimulationRow[];
  availablePermissions?: PermissionAction[];
  /** Affordance for testing custom session attributes. Default: 'edit-values' (current pencil). */
  customSessionMode?: CustomSessionMode;
  onClose: () => void;
}

interface DecisionDetailsState {
  user: UserSimulationRow;
  /** Optional — when set, that session is visually focused in the modal. */
  focusedSessionId?: string;
}

interface EditAttrsState {
  userId: string;
  sessionId: string;
  triggerRect: DOMRect;
}

function severityRank(verdict: UserSimulationRow['aggregateVerdict']): number {
  if (verdict === 'allowed') return 9;
  if (verdict === 'mixed') return 3;
  return 1;
}

export default function SimulateAccessModal({
  role,
  context,
  policy,
  initialUsers = [],
  userPool,
  availablePermissions,
  customSessionMode = 'edit-values',
  onClose,
}: SimulateAccessModalProps) {
  const isEditor = context === 'system-editor' || context === 'channel-editor';

  const [scope, setScope] = useState<EditorScope>('full-graph');
  const [selectedUsers, setSelectedUsers] = useState<UserSimulationRow[]>(initialUsers);
  const [permissionFilter, setPermissionFilter] = useState<PermissionAction | null>(null);
  const [permDropdownOpen, setPermDropdownOpen] = useState(false);
  const permDropdownRef = useRef<HTMLDivElement | null>(null);

  const [sessionOverrides, setSessionOverrides] = useState<Record<string, string[]>>({});
  const [perPerm, setPerPerm] = useState<DecisionDetailsState | null>(null);
  const [editAttrs, setEditAttrs] = useState<EditAttrsState | null>(null);

  // Sort users by severity for display (denied first).
  const orderedUsers = useMemo(
    () => [...selectedUsers].sort((a, b) => severityRank(a.aggregateVerdict) - severityRank(b.aggregateVerdict)),
    [selectedUsers],
  );

  function addUser(u: UserSimulationRow) {
    setSelectedUsers((prev) => (prev.some((x) => x.userId === u.userId) ? prev : [...prev, u]));
  }

  function removeUser(userId: string) {
    setSelectedUsers((prev) => prev.filter((u) => u.userId !== userId));
  }

  function openPerPermissionForUser(user: UserSimulationRow, _rect: DOMRect) {
    setEditAttrs(null);
    setPerPerm({ user });
  }

  function openPerPermissionForSession(user: UserSimulationRow, sessionId: string, _rect: DOMRect) {
    const session = user.sessions.find((s) => s.sessionId === sessionId);
    if (!session) return;
    setEditAttrs(null);
    setPerPerm({ user, focusedSessionId: sessionId });
  }

  function openEditAttrs(userId: string, sessionId: string, rect: DOMRect) {
    setPerPerm(null);
    setEditAttrs({ userId, sessionId, triggerRect: rect });
  }

  // Close permission dropdown on outside click.
  useEffect(() => {
    if (!permDropdownOpen) return;
    function handler(e: MouseEvent) {
      if (!permDropdownRef.current) return;
      if (!permDropdownRef.current.contains(e.target as Node)) setPermDropdownOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [permDropdownOpen]);

  const filterPermissions = availablePermissions ?? policy?.actions ?? [];

  // Policies that don't reference session attributes don't need a per-session breakdown.
  const policyHasSessionAttrs = policy?.referencesSessionAttributes ?? true;
  const subtitleText = policyHasSessionAttrs
    ? 'Pick users to evaluate against all active permission policies. Run simulation to see if permissions are allowed or denied.'
    : 'Pick users to evaluate against permission policies. Run simulation to check if permissions are allowed or denied per user session.';

  const footer = (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
      <Button emphasis="Tertiary" size="Small" onClick={onClose}>Cancel</Button>
      <Button emphasis="Primary" size="Small" disabled={selectedUsers.length === 0}>
        Run simulation
      </Button>
    </div>
  );

  return (
    <Modal
      size="Large"
      title="Simulate access"
      subtitle={subtitleText}
      headerDivider={false}
      noBodyPadding
      onClose={onClose}
      footer={footer}
    >
      <div className={styles['sa-modal-shell']}>
        <div className={styles['sa-header-controls']}>
          <SearchInput
            selected={selectedUsers}
            pool={userPool}
            onAdd={addUser}
            placeholder="Search and add users"
          />
          <div className={styles['sa-header-controls__row']}>
            <div className={styles['sa-perm-dropdown']} ref={permDropdownRef}>
              <button
                type="button"
                className={styles['sa-perm-dropdown__trigger']}
                onClick={() => setPermDropdownOpen((p) => !p)}
                aria-haspopup="listbox"
                aria-expanded={permDropdownOpen}
              >
                {permissionFilter === null ? 'All permissions' : ACTION_LABELS[permissionFilter]}
                <Icon glyph={<ChevronDownIcon />} size="12" />
              </button>
              {permDropdownOpen && (
                <div className={styles['sa-perm-dropdown__menu']} role="listbox">
                  <button
                    type="button"
                    className={[
                      styles['sa-perm-dropdown__item'],
                      permissionFilter === null && styles['sa-perm-dropdown__item--active'],
                    ].filter(Boolean).join(' ')}
                    onClick={() => { setPermissionFilter(null); setPermDropdownOpen(false); }}
                  >
                    All permissions
                  </button>
                  {filterPermissions.map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={[
                        styles['sa-perm-dropdown__item'],
                        permissionFilter === p && styles['sa-perm-dropdown__item--active'],
                      ].filter(Boolean).join(' ')}
                      onClick={() => { setPermissionFilter(p); setPermDropdownOpen(false); }}
                    >
                      {ACTION_LABELS[p]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {isEditor && (
              <div className={styles['sa-header-controls__right']}>
                <span>Evaluate against</span>
                <div className={styles['sa-toggle']}>
                  <button
                    className={[
                      styles['sa-toggle__btn'],
                      scope === 'full-graph' && styles['sa-toggle__btn--active'],
                    ].filter(Boolean).join(' ')}
                    onClick={() => setScope('full-graph')}
                  >
                    All policies
                  </button>
                  <button
                    className={[
                      styles['sa-toggle__btn'],
                      scope === 'this-policy-only' && styles['sa-toggle__btn--active'],
                    ].filter(Boolean).join(' ')}
                    onClick={() => setScope('this-policy-only')}
                  >
                    This policy only
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles['sa-modal-shell__divider']} />

        <div className={styles['sa-modal-shell__table-wrap']}>
          {selectedUsers.length === 0 ? (
            <EmptyState />
          ) : (
            orderedUsers.map((u) => (
              <UserRow
                key={u.userId}
                user={u}
                role={role}
                context={context}
                scope={scope}
                policy={policy}
                multiAction
                hideSessions={!policyHasSessionAttrs}
                customSessionMode={customSessionMode}
                sessionOverrideCounts={Object.fromEntries(
                  Object.entries(sessionOverrides).map(([sid, list]) => [sid, list.length]),
                )}
                activeEditSessionId={editAttrs?.sessionId ?? null}
                onRemove={removeUser}
                onPerPermissionForUser={(rect) => openPerPermissionForUser(u, rect)}
                onPerPermissionForSession={(sessionId, rect) => openPerPermissionForSession(u, sessionId, rect)}
                onEditSession={(sessionId, rect) => openEditAttrs(u.userId, sessionId, rect)}
              />
            ))
          )}
        </div>
      </div>

      {/* Decision Details modal — fixed-position overlay above the parent modal. */}
      {perPerm && (
        <DecisionDetailsModal
          user={perPerm.user}
          focusedSessionId={perPerm.focusedSessionId}
          role={role}
          context={context}
          scope={scope}
          onClose={() => setPerPerm(null)}
        />
      )}

      {editAttrs && (() => {
        const u = orderedUsers.find((x) => x.userId === editAttrs.userId);
        const s = u?.sessions.find((x) => x.sessionId === editAttrs.sessionId);
        if (!u || !s) return null;
        return (
          <EditAttributesPopover
            session={s}
            policy={policy}
            triggerRect={editAttrs.triggerRect}
            onClose={() => setEditAttrs(null)}
            onApply={(overriddenKeys) => {
              setSessionOverrides((prev) => ({
                ...prev,
                [editAttrs.sessionId]: overriddenKeys,
              }));
              setEditAttrs(null);
            }}
          />
        );
      })()}
    </Modal>
  );
}

function EmptyState() {
  return (
    <div className={styles['sa-empty']}>
      <div className={styles['sa-empty__illustration']} aria-hidden>
        <span className={[styles['sa-empty__avatar'], styles['sa-empty__avatar--left']].join(' ')}>
          <Icon glyph={<AccountOutlineIcon />} size="20" />
        </span>
        <span className={[styles['sa-empty__avatar'], styles['sa-empty__avatar--center']].join(' ')}>
          <Icon glyph={<AccountOutlineIcon />} size="28" />
        </span>
        <span className={[styles['sa-empty__avatar'], styles['sa-empty__avatar--right']].join(' ')}>
          <Icon glyph={<AccountOutlineIcon />} size="20" />
        </span>
      </div>
      <h3 className={styles['sa-empty__title']}>Select users to check</h3>
      <p className={styles['sa-empty__body']}>
        Add up to 20 users above. The simulator checks each user's most recent session against the policy and shows
        the verdict per session.
      </p>
    </div>
  );
}
