import { useEffect, useMemo, useRef, useState } from 'react';
import Modal from '@/components/ui/Modal/Modal';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/ui/Icon/Icon';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import CloseIcon from '@mattermost/compass-icons/components/close';
import CheckCircleIcon from '@mattermost/compass-icons/components/check-circle';
import CloseCircleIcon from '@mattermost/compass-icons/components/close-circle';
import AlertCircleIcon from '@mattermost/compass-icons/components/alert-circle-outline';
import PlusIcon from '@mattermost/compass-icons/components/plus';
import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import AddUsersPopover from './AddUsersPopover';
import DecisionDetailsModal from './DecisionDetailsModal';
import type { DecisionPerm } from './DecisionDetailsModal';
import { ACTION_LABELS } from '../shared/types';
import type {
  PermissionAction,
  PolicyContext,
  UserSimulationRow,
  VerdictAttribution,
} from '../shared/types';
import styles from './IbrahimVariant.module.scss';

type EvalScope = 'all-policies' | 'this-rule-only';

export interface IbrahimSimulateModalProps {
  policy?: PolicyContext;
  initialUsers?: UserSimulationRow[];
  userPool: UserSimulationRow[];
  availablePermissions?: PermissionAction[];
  onClose: () => void;
}

interface DecisionTraceFor {
  user: UserSimulationRow;
  perms: DecisionPerm[];
}

function aggregateLabel(verdict: VerdictAttribution): { tone: 'allow' | 'deny' | 'mixed'; label: string } {
  if (verdict === 'allowed') return { tone: 'allow', label: 'Allowed' };
  if (verdict === 'mixed') return { tone: 'mixed', label: 'Mixed' };
  return { tone: 'deny', label: 'Denied' };
}

/**
 * Generates per-permission decision detail for a user.
 * Per the meeting:
 *  - Attribution uses "system policy", "channel rule", "this rule" (renamed from "upper-scoped" / "sibling rule").
 *  - Trace is shown only for denials at the current rule level. Other-policy denials remain opaque.
 */
function decisionsForUser(user: UserSimulationRow, actions: PermissionAction[]): DecisionPerm[] {
  return actions.map((a) => {
    const cell = user.perActionVerdicts.find((p) => p.action === a);
    const v = cell?.verdict ?? 'denied-this-policy';
    if (v === 'allowed') {
      return { action: a, verdict: 'allowed', attribution: 'channel rule', traceAvailable: false };
    }
    if (v === 'denied-another-policy' || v === 'denied-system-policy') {
      // Upper-scope (system) policies remain opaque — no trace.
      return { action: a, verdict: 'denied', attribution: 'system policy', traceAvailable: false };
    }
    // denied-this-policy / denied-both / fallback — current rule denied; trace is available.
    return {
      action: a,
      verdict: 'denied',
      attribution: 'this rule',
      traceAvailable: true,
      trace: {
        ruleHeader: 'Rule: File permissions: Members',
        root: {
          label: 'ALL OF THE FOLLOWING MUST HOLD (AND)',
          pass: false,
          children: [
            {
              label: 'ANY OF THE FOLLOWING MAY HOLD (OR)',
              pass: false,
              children: [
                { label: '"Orion" in user.attributes.Program', pass: false, actual: '["Helios"]' },
                { label: '"Artemis" in user.attributes.Program', pass: false, actual: '["Helios"]' },
              ],
            },
            { label: 'user.attributes.Department == "Engineering"', pass: true, actual: '"Engineering"' },
          ],
        },
      },
    };
  });
}

export default function IbrahimSimulateModal({
  policy,
  initialUsers = [],
  userPool,
  availablePermissions,
  onClose,
}: IbrahimSimulateModalProps) {
  const [scope, setScope] = useState<EvalScope>('all-policies');
  const [permFilter, setPermFilter] = useState<PermissionAction | null>(null);
  const [permDropdownOpen, setPermDropdownOpen] = useState(false);
  const permDropdownRef = useRef<HTMLDivElement | null>(null);
  const [users, setUsers] = useState<UserSimulationRow[]>(initialUsers);

  const [addOpen, setAddOpen] = useState(false);
  const [addRect, setAddRect] = useState<DOMRect | null>(null);
  const addBtnSlotRef = useRef<HTMLDivElement | null>(null);

  const [decision, setDecision] = useState<DecisionTraceFor | null>(null);

  const actions = useMemo<PermissionAction[]>(
    () => availablePermissions ?? policy?.actions ?? ['download_file_attachment'],
    [availablePermissions, policy],
  );

  function addUser(u: UserSimulationRow) {
    setUsers((prev) => (prev.some((x) => x.userId === u.userId) ? prev : [...prev, u]));
  }
  function removeUser(userId: string) {
    setUsers((prev) => prev.filter((u) => u.userId !== userId));
  }

  function openAdd() {
    const el = addBtnSlotRef.current?.querySelector('button');
    if (!el) return;
    setAddRect((el as HTMLElement).getBoundingClientRect());
    setAddOpen(true);
  }

  function openDecision(user: UserSimulationRow) {
    setDecision({ user, perms: decisionsForUser(user, actions) });
  }

  // Close perm dropdown on outside click.
  useEffect(() => {
    if (!permDropdownOpen) return;
    function handler(e: MouseEvent) {
      if (!permDropdownRef.current) return;
      if (!permDropdownRef.current.contains(e.target as Node)) setPermDropdownOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [permDropdownOpen]);

  const allowedCount = users.filter((u) => u.aggregateVerdict === 'allowed').length;
  const deniedOrMixedCount = users.length - allowedCount;

  const footer = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 12 }}>
      <span className={styles['iv-summary']}>
        {users.length === 0
          ? 'Add users above to begin'
          : `${users.length} user${users.length === 1 ? '' : 's'} · ${allowedCount} allowed · ${deniedOrMixedCount} denied`}
      </span>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button emphasis="Tertiary" size="Small" onClick={onClose}>Close</Button>
        <Button emphasis="Primary" size="Small" disabled={users.length === 0}>
          {users.length > 0 ? 'Re-run' : 'Run'}
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      size="Large"
      title="Simulate access"
      subtitle="Pick users to evaluate against the selected scope. Each row shows whether the action would be allowed for that user's most recent session."
      headerDivider={false}
      noBodyPadding
      onClose={onClose}
      footer={footer}
      headerAction={
        <div ref={addBtnSlotRef}>
          <Button
            emphasis="Primary"
            size="Small"
            leadingIcon={<Icon glyph={<PlusIcon />} size="16" />}
            onClick={openAdd}
          >
            Add users
          </Button>
        </div>
      }
    >
      <div className={styles['iv-modal-shell']}>
        <div className={styles['iv-controls']}>
          <div className={styles['iv-controls__left']}>
            <span className={styles['iv-controls__label']}>Evaluate against</span>
            <div className={styles['iv-toggle']}>
              <button
                className={[
                  styles['iv-toggle__btn'],
                  scope === 'all-policies' && styles['iv-toggle__btn--active'],
                ].filter(Boolean).join(' ')}
                onClick={() => setScope('all-policies')}
              >
                All policies
              </button>
              <button
                className={[
                  styles['iv-toggle__btn'],
                  scope === 'this-rule-only' && styles['iv-toggle__btn--active'],
                ].filter(Boolean).join(' ')}
                onClick={() => setScope('this-rule-only')}
              >
                This rule only
              </button>
            </div>
          </div>
          <div className={styles['iv-controls__right']}>
            <span className={styles['iv-controls__label']}>Check for</span>
            <div className={styles['iv-perm-dropdown']} ref={permDropdownRef}>
              <button
                type="button"
                className={styles['iv-perm-dropdown__trigger']}
                onClick={() => setPermDropdownOpen((p) => !p)}
                aria-haspopup="listbox"
                aria-expanded={permDropdownOpen}
              >
                {permFilter === null ? 'All permissions' : ACTION_LABELS[permFilter]}
                <Icon glyph={<ChevronDownIcon />} size="12" />
              </button>
              {permDropdownOpen && (
                <div className={styles['iv-perm-dropdown__menu']} role="listbox">
                  <button
                    type="button"
                    className={[
                      styles['iv-perm-dropdown__item'],
                      permFilter === null && styles['iv-perm-dropdown__item--active'],
                    ].filter(Boolean).join(' ')}
                    onClick={() => { setPermFilter(null); setPermDropdownOpen(false); }}
                  >
                    All permissions
                    {permFilter === null && <Icon glyph={<CheckCircleIcon />} size="12" />}
                  </button>
                  {actions.map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={[
                        styles['iv-perm-dropdown__item'],
                        permFilter === p && styles['iv-perm-dropdown__item--active'],
                      ].filter(Boolean).join(' ')}
                      onClick={() => { setPermFilter(p); setPermDropdownOpen(false); }}
                    >
                      {ACTION_LABELS[p]}
                      {permFilter === p && <Icon glyph={<CheckCircleIcon />} size="12" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles['iv-divider']} />

        {users.length > 0 && (
          <div className={styles['iv-table-head']}>
            <span>USER</span>
            <span>RESULT</span>
            <span />
          </div>
        )}

        {users.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'rgba(var(--center-channel-color-rgb), 0.56)', fontSize: 13 }}>
            Click <strong>+ Add users</strong> to start a simulation.
          </div>
        ) : (
          users.map((u) => {
            const agg = aggregateLabel(u.aggregateVerdict);
            const Icn =
              agg.tone === 'allow' ? CheckCircleIcon
                : agg.tone === 'mixed' ? AlertCircleIcon
                : CloseCircleIcon;
            const tone =
              agg.tone === 'allow' ? '#3db887'
                : agg.tone === 'mixed' ? '#cc8f00'
                : '#d24b4e';
            const bg =
              agg.tone === 'allow' ? 'rgba(61, 184, 135, 0.16)'
                : agg.tone === 'mixed' ? 'rgba(255, 212, 112, 0.40)'
                : 'rgba(210, 75, 78, 0.12)';
            return (
              <div key={u.userId} className={styles['iv-row']}>
                <div className={styles['iv-row__user']}>
                  <UserAvatar src={u.avatarSrc} alt={u.name} size="32" />
                  <div className={styles['iv-row__name-stack']}>
                    <span className={styles['iv-row__name']}>{u.name}</span>
                    <span className={styles['iv-row__handle']}>@{u.handle}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles['iv-row__result']}
                  onClick={() => openDecision(u)}
                  aria-label={`See decision details for ${u.name}`}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '2px 10px 2px 8px',
                      borderRadius: 999,
                      background: bg,
                      color: tone,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    <Icon glyph={<Icn />} size="12" />
                    <span>{agg.label}</span>
                  </span>
                  <span className={styles['iv-row__count']}>{u.perActionVerdicts.length}</span>
                  <span className={styles['iv-row__chev']}>
                    <Icon glyph={<ChevronRightIcon />} size="12" />
                  </span>
                </button>
                <button
                  type="button"
                  className={styles['iv-row__remove']}
                  aria-label={`Remove ${u.name}`}
                  onClick={() => removeUser(u.userId)}
                >
                  <Icon glyph={<CloseIcon />} size="16" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {addOpen && addRect && (
        <AddUsersPopover
          triggerRect={addRect}
          selected={users}
          pool={userPool}
          onAdd={addUser}
          onClose={() => setAddOpen(false)}
        />
      )}

      {decision && (
        <DecisionDetailsModal
          user={decision.user}
          perms={decision.perms}
          onClose={() => setDecision(null)}
        />
      )}
    </Modal>
  );
}
